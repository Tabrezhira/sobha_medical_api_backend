import NotAnsCall from "./notAnsCall.model.js";

function isSuperAdmin(user) {
  return user?.role === "superadmin";
}

function canAccessRecord(record, user) {
  if (isSuperAdmin(user)) return true;
  return String(record?.manager) === String(user?._id);
}

// Create not answered call record (manager only)
async function createNotAnsCall(req, res, next) {
  try {
    const payload = { ...req.body, manager: req.user._id };
    const newRecord = new NotAnsCall(payload);
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

    const query = isSuperAdmin(req.user) ? {} : { manager: req.user._id };
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
    if (!canAccessRecord(record, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
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
    if (!canAccessRecord(record, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { manager, ...rest } = req.body || {};
    Object.assign(record, rest);
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
    if (!canAccessRecord(record, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await NotAnsCall.findByIdAndDelete(id);
    return res.json({ success: true, message: "Record deleted" });
  } catch (err) {
    next(err);
  }
}

// Get list of empNo by date (ddmmyy format)
async function getEmpNosByDate(req, res, next) {
  try {
    const { date } = req.params;
    
    // Parse ddmmyy format
    if (!date || date.length !== 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid date format. Use ddmmyy (e.g., 170226)" 
      });
    }
    
    const day = parseInt(date.substring(0, 2), 10);
    const month = parseInt(date.substring(2, 4), 10) - 1; // JS months are 0-indexed
    const year = 2000 + parseInt(date.substring(4, 6), 10);
    
    const startDate = new Date(year, month, day, 0, 0, 0);
    const endDate = new Date(year, month, day, 23, 59, 59);
    
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid date values" 
      });
    }
    
    const query = {
      manager: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    };
    
    const records = await NotAnsCall.find(query).select('empNo -_id').lean();
    const empNos = [...new Set(records.map(r => r.empNo))];
    
    return res.json({ success: true, data: empNos });
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
  getEmpNosByDate,
};
