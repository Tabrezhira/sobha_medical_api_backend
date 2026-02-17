import Grievance from "./grievance.model.js";

// Create grievance record (manager only)
async function createGrievance(req, res, next) {
  try {
    const newRecord = new Grievance(req.body);
    await newRecord.save();
    return res.status(201).json({ success: true, data: newRecord });
  } catch (err) {
    next(err);
  }
}

// Get all grievances (manager only)
async function getGrievances(req, res, next) {
  try {
    const { page = 1, limit = 50, status, employeeId, dateFrom, dateTo } = req.query;
    const p = Math.max(1, parseInt(page, 10));
    const l = Math.max(1, parseInt(limit, 10));

    const query = {};
    if (status) query.status = status;
    if (employeeId) query.employeeId = employeeId;
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const [total, items] = await Promise.all([
      Grievance.countDocuments(query),
      Grievance.find(query)
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

// Get grievance by ID (manager only)
async function getGrievanceById(req, res, next) {
  try {
    const { id } = req.params;
    const record = await Grievance.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    return res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

// Update grievance (manager only)
async function updateGrievance(req, res, next) {
  try {
    const { id } = req.params;
    const record = await Grievance.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    Object.assign(record, req.body);
    await record.save();
    return res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

// Delete grievance (manager only)
async function deleteGrievance(req, res, next) {
  try {
    const { id } = req.params;
    const record = await Grievance.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await Grievance.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    next(err);
  }
}

export default {
  createGrievance,
  getGrievances,
  getGrievanceById,
  updateGrievance,
  deleteGrievance,
};
