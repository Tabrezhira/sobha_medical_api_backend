import User from '../auth/user.model.js';
import ClinicVisit from '../clinic/clinic.model.js';
import Hospital from '../hospital/hospital.model.js';
import Isolation from '../isolation/isolation.model.js';

// Basic system info
async function getSystemInfo(req, res) {
  return res.json({ success: true, data: { uptime: process.uptime(), env: process.env.NODE_ENV || 'development', pid: process.pid } });
}

// Counts across key collections
async function getStats(req, res, next) {
  try {
    const [users, clinics, hospitals, isolations] = await Promise.all([
      User.countDocuments(),
      ClinicVisit.countDocuments(),
      Hospital.countDocuments(),
      Isolation.countDocuments(),
    ]);
    return res.json({ success: true, data: { users, clinics, hospitals, isolations } });
  } catch (err) { next(err); }
}

// List users (no password)
async function getUsers(req, res, next) {
  try {
    const users = await User.find().select('-password');
    return res.json({ success: true, data: users });
  } catch (err) { next(err); }
}

export default { getSystemInfo, getStats, getUsers };
