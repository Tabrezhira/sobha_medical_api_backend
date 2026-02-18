import IpAdmission from "./ipAdmission.model.js";

function isSuperAdmin(user) {
  return user?.role === "superadmin";
}

function canAccessRecord(record, user) {
  if (isSuperAdmin(user)) return true;
  return String(record?.hiManager) === String(user?.name);
}

// Create IP admission record (manager only)
async function createIpAdmission(req, res, next) {
  try {
    const { hiManager, ...data } = req.body;
    const newRecord = new IpAdmission({
      hiManager: req.user.name,
      ...data,
    });
    await newRecord.save();
    return res.status(201).json({ success: true, data: newRecord });
  } catch (err) {
    next(err);
  }
}

// Get all IP admissions for user (manager only)
async function getIpAdmissions(req, res, next) {
  try {
    const { page = 1, limit = 50, insuranceApprovalStatus, caseType } = req.query;
    const p = Math.max(1, parseInt(page, 10));
    const l = Math.max(1, parseInt(limit, 10));

    const query = isSuperAdmin(req.user) ? {} : { hiManager: req.user.name };
    if (insuranceApprovalStatus) query.insuranceApprovalStatus = insuranceApprovalStatus;
    if (caseType) query.caseType = caseType;

    const [total, items] = await Promise.all([
      IpAdmission.countDocuments(query),
      IpAdmission.find(query)
        .sort({ updatedAt: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .populate("hospitalCase", "name code"),
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
      "hospitalCase",
      "name code"
    );
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    if (!canAccessRecord(record, req.user)) {
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
    if (!canAccessRecord(record, req.user)) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied" });
    }

    const { hiManager, ...rest } = req.body || {};
    Object.assign(record, rest);
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
    if (!canAccessRecord(record, req.user)) {
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
