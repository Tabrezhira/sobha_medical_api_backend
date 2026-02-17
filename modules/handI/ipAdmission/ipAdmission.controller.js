import IpAdmission from "./ipAdmission.model.js";

// Create IP admission record (manager only)
async function createIpAdmission(req, res, next) {
  try {
    const { locationId, ...data } = req.body;
    const newRecord = new IpAdmission({
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

// Get all IP admissions for user's location (manager only)
async function getIpAdmissions(req, res, next) {
  try {
    const { page = 1, limit = 50, status, empNo, emiratesId } = req.query;
    const p = Math.max(1, parseInt(page, 10));
    const l = Math.max(1, parseInt(limit, 10));

    const query = { locationId: req.user.locationId };
    if (status) query.status = status;
    if (empNo) query.empNo = empNo;
    if (emiratesId) query.emiratesId = emiratesId;

    const [total, items] = await Promise.all([
      IpAdmission.countDocuments(query),
      IpAdmission.find(query)
        .sort({ doa: -1 })
        .skip((p - 1) * l)
        .limit(l)
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

// Get IP admission by ID (manager only)
async function getIpAdmissionById(req, res, next) {
  try {
    const { id } = req.params;
    const record = await IpAdmission.findById(id).populate(
      "createdBy",
      "name email"
    );
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

// Update IP admission (manager only)
async function updateIpAdmission(req, res, next) {
  try {
    const { id } = req.params;
    const record = await IpAdmission.findById(id);
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

// Delete IP admission (manager only)
async function deleteIpAdmission(req, res, next) {
  try {
    const { id } = req.params;
    const record = await IpAdmission.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    if (record.locationId !== req.user.locationId) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied" });
    }

    await IpAdmission.findByIdAndDelete(id);
    return res.json({ success: true, message: "Record deleted" });
  } catch (err) {
    next(err);
  }
}

export default {
  createIpAdmission,
  getIpAdmissions,
  getIpAdmissionById,
  updateIpAdmission,
  deleteIpAdmission,
};
