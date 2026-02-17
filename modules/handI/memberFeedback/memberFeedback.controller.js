import MemberFeedback from "./memberFeedback.model.js";

// Create member feedback record (manager only)
async function createMemberFeedback(req, res, next) {
  try {
    const { locationId, ...data } = req.body;
    const newRecord = new MemberFeedback({
      locationId: req.user.locationId,
      ...data,
      createdBy: req.user._id,
    });
    await newRecord.save();
    return res.status(201).json({ success: true, data: newRecord });
  } catch (err) {
    next(err);
  }
}

// Get all member feedback for user's location (manager only)
async function getMemberFeedback(req, res, next) {
  try {
    const { page = 1, limit = 50, dateFrom, dateTo } = req.query;
    const p = Math.max(1, parseInt(page, 10));
    const l = Math.max(1, parseInt(limit, 10));

    const query = { locationId: req.user.locationId };
    if (dateFrom || dateTo) {
      query.dateOfCall = {};
      if (dateFrom) query.dateOfCall.$gte = new Date(dateFrom);
      if (dateTo) query.dateOfCall.$lte = new Date(dateTo);
    }

    const [total, items] = await Promise.all([
      MemberFeedback.countDocuments(query),
      MemberFeedback.find(query)
        .sort({ dateOfCall: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .populate("clinic", "tokenNo empNo employeeName")
        .populate("createdBy", "name email"),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: { total, page: p, limit: l },
    });
  } catch (err) {
    next(err);
  }
}

// Get member feedback by ID (manager only)
async function getMemberFeedbackById(req, res, next) {
  try {
    const { id } = req.params;
    const record = await MemberFeedback.findById(id)
      .populate("clinic", "tokenNo empNo employeeName")
      .populate("createdBy", "name email");

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    if (record.locationId !== req.user.locationId) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied" });
    }
    return res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

// Update member feedback (manager only)
async function updateMemberFeedback(req, res, next) {
  try {
    const { id } = req.params;
    const record = await MemberFeedback.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    if (record.locationId !== req.user.locationId) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied" });
    }

    Object.assign(record, req.body);
    await record.save();
    return res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

// Delete member feedback (manager only)
async function deleteMemberFeedback(req, res, next) {
  try {
    const { id } = req.params;
    const record = await MemberFeedback.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    if (record.locationId !== req.user.locationId) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied" });
    }

    await MemberFeedback.findByIdAndDelete(id);
    return res.json({ success: true, message: "Record deleted" });
  } catch (err) {
    next(err);
  }
}

export default {
  createMemberFeedback,
  getMemberFeedback,
  getMemberFeedbackById,
  updateMemberFeedback,
  deleteMemberFeedback,
};
