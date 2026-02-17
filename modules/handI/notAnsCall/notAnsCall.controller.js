import NotAnsCall from "./notAnsCall.model.js";

// Create not answered call record (manager only)
async function createNotAnsCall(req, res, next) {
  try {
    const newRecord = new NotAnsCall(req.body);
    await newRecord.save();
    return res.status(201).json({ success: true, data: newRecord });
  } catch (err) {
    next(err);
  }
}

// Get all not answered calls (manager only)
async function getNotAnsCalls(req, res, next) {
  try {
    const { page = 1, limit = 50, empNo, dateFrom, dateTo } = req.query;
    const p = Math.max(1, parseInt(page, 10));
    const l = Math.max(1, parseInt(limit, 10));

    const query = {};
    if (empNo) query.empNo = empNo;
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const [total, items] = await Promise.all([
      NotAnsCall.countDocuments(query),
      NotAnsCall.find(query)
        .sort({ date: -1 })
        .skip((p - 1) * l)
        .limit(l),
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

// Get not answered call by ID (manager only)
async function getNotAnsCallById(req, res, next) {
  try {
    const { id } = req.params;
    const record = await NotAnsCall.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    return res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

// Update not answered call (manager only)
async function updateNotAnsCall(req, res, next) {
  try {
    const { id } = req.params;
    const record = await NotAnsCall.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    Object.assign(record, req.body);
    await record.save();
    return res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

// Delete not answered call (manager only)
async function deleteNotAnsCall(req, res, next) {
  try {
    const { id } = req.params;
    const record = await NotAnsCall.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    await NotAnsCall.findByIdAndDelete(id);
    return res.json({ success: true, message: "Record deleted" });
  } catch (err) {
    next(err);
  }
}

export default {
  createNotAnsCall,
  getNotAnsCalls,
  getNotAnsCallById,
  updateNotAnsCall,
  deleteNotAnsCall,
};
