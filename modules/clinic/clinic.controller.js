import ClinicVisit from './clinic.model.js';

// Create a new clinic visit
async function createVisit(req, res, next) {
	try {
		if (!req.user || !req.user._id) return res.status(401).json({ success: false, message: 'Not authenticated' });

		const payload = req.body || {};
		// ignore any client-supplied createdBy
		if (payload.createdBy) delete payload.createdBy;
		payload.createdBy = req.user._id;
		// always take locationId from authenticated user to prevent spoofing
		if (req.user.locationId) payload.locationId = req.user.locationId;

		// Auto-generate tokenNo if not provided: <LOC4><DDMM><4-digit-seq>
		if (!payload.tokenNo) {
			// map of location display names -> short codes (use normalized keys)
			const locationCodeMap = {
				"AL QOUZ": "QOZ",
				"DIC 2": "DIC2",
				"DIC 3": "DIC3",
				"DIC 5": "DIC5",
				"DIP 1": "DIP1",
				"DIP 2": "DIP2",
				"JEBAL ALI 1": "JAB1",
				"JEBAL ALI 2": "JAB2",
				"JEBAL ALI 3": "JAB3",
				"JEBAL ALI 4": "JAB4",
				"KHAWANEEJ": "KWJ",
				"RUWAYYAH": "RUW",
				"SAJJA": "SAJJ",
				"SAIF": "SAIF",
				"SONAPUR 1": "SONA1",
				"SONAPUR 2": "SONA2",
				"SONAPUR 3": "SONA3",
				"SONAPUR 4": "SONA4",
				"SONAPUR 5": "SONA5",
				"RAHABA": "RAH",
				"SONAPUR 6": "SONA6",
			};

			const rawLoc = String(payload.locationId || req.user.locationId || "").trim();
			const locKey = rawLoc.toUpperCase().replace(/\s+/g, " ");
			let loc = locationCodeMap[locKey];
			if (!loc) {
				// fallback: take first 4 non-space characters
				loc = rawLoc.replace(/\s+/g, "").substring(0, 4).toUpperCase() || "UNKN";
			}
			const now = new Date();
			const dd = String(now.getDate()).padStart(2, "0");
			const mm = String(now.getMonth() + 1).padStart(2, "0");
			const dateKeyStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const dateKeyEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

			// Count existing visits for this location for today to derive sequence
			const todayCount = await ClinicVisit.countDocuments({
				locationId: payload.locationId,
				date: { $gte: dateKeyStart, $lt: dateKeyEnd },
			});
			const seq = todayCount + 1;
			let seqStr = String(seq).padStart(4, "0");
			if (seq > 9999) {
				// overflow: use last 4 digits and warn
				console.warn(`token sequence overflow for location ${rawLoc} on ${dd}${mm}: seq=${seq}`);
				seqStr = seqStr.slice(-4);
			}
			// if the visit is sent to an external provider, append 'XT' to the location code
			const sendToValue = String(payload.sendTo || payload.sentTo || "").toUpperCase().trim();
			let locPrefix = loc;
			if (sendToValue === 'EXTERNAL PROVIDER') {
				locPrefix = `${loc}XT`;
			}
			// format with hyphens: <LOC or LOCXT>-<DDMM>-<4-digit-seq>
			payload.tokenNo = `${locPrefix}-${dd}${mm}-${seqStr}`;
		}

		// Auto-generate referralCode if referredToHospital is provided
		if (payload.referrals && Array.isArray(payload.referrals)) {
			payload.referrals = payload.referrals.map(referral => {
				if (referral.referredToHospital && !referral.referralCode) {
					referral.referralCode = `${payload.tokenNo}-REF`;
				}
				return referral;
			});
		}

		const visit = new ClinicVisit(payload);
		const saved = await visit.save();
		const populated = await saved.populate('createdBy', 'name');
		return res.status(201).json({ success: true, data: populated });
	} catch (err) {
		next(err);
	}
}

// Get list of visits with optional filters and pagination
async function getVisits(req, res, next) {
	try {
		const {
			page = 1,
			limit = 20,
			emiratesId,
			empNo,
			visitStatus,
			locationId,
			startDate,
			endDate,
			tokenNo,
		} = req.query;

		const q = {};
		if (emiratesId) q.emiratesId = emiratesId;
		if (empNo) q.empNo = empNo;
		if (visitStatus) q.visitStatus = visitStatus;
		if (locationId) q.locationId = locationId;
		if (tokenNo) q.tokenNo = tokenNo;

		if (startDate || endDate) {
			q.date = {};
			if (startDate) q.date.$gte = new Date(startDate);
			if (endDate) q.date.$lte = new Date(endDate);
		}

		const p = Math.max(1, parseInt(page, 10));
		const l = Math.max(1, parseInt(limit, 10));

		const [total, items] = await Promise.all([
			ClinicVisit.countDocuments(q),
			ClinicVisit.find(q)
				.sort({ date: -1, slNo: 1 })
				.skip((p - 1) * l)
				.limit(l)
				.populate('createdBy', 'name'),
		]);

		return res.json({ success: true, data: items, meta: { total, page: p, limit: l } });
	} catch (err) {
		next(err);
	}
}

// Get a single visit by id
async function getVisitById(req, res, next) {
	try {
		const { id } = req.params;
		const visit = await ClinicVisit.findById(id).populate('createdBy', 'name');
		if (!visit) return res.status(404).json({ success: false, message: 'Not found' });
		return res.json({ success: true, data: visit });
	} catch (err) {
		next(err);
	}
}

// Update a visit
async function updateVisit(req, res, next) {
	try {
		const { id } = req.params;
		const payload = req.body || {};
		
		// Auto-generate referralCode if referredToHospital is provided in referrals
		if (payload.referrals && Array.isArray(payload.referrals)) {
			const visit = await ClinicVisit.findById(id);
			if (visit) {
				payload.referrals = payload.referrals.map(referral => {
					if (referral.referredToHospital && !referral.referralCode) {
						referral.referralCode = `${visit.tokenNo}-REF`;
					}
					return referral;
				});
			}
		}
		
		let updated = await ClinicVisit.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
		if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
		updated = await updated.populate('createdBy', 'name');
		return res.json({ success: true, data: updated });
	} catch (err) {
		next(err);
	}
}

// Delete a visit
async function deleteVisit(req, res, next) {
	try {
		const { id } = req.params;
		let deleted = await ClinicVisit.findByIdAndDelete(id);
		if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
		deleted = await deleted.populate('createdBy', 'name');
		return res.json({ success: true, data: deleted });
	} catch (err) {
		next(err);
	}
}

// Get visits for the authenticated user's location
async function getVisitsByUserLocation(req, res, next) {
	try {
		if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
		const locationId = req.user.locationId;
		if (!locationId) return res.status(400).json({ success: false, message: 'User has no locationId' });

		const { page = 1, limit = 50 } = req.query;
		const p = Math.max(1, parseInt(page, 10));
		const l = Math.max(1, parseInt(limit, 10));

		const [total, items] = await Promise.all([
			ClinicVisit.countDocuments({ locationId }),
			ClinicVisit.find({ locationId }).sort({ date: -1, slNo: 1 }).skip((p - 1) * l).limit(l).populate('createdBy', 'name'),
		]);

		return res.json({ success: true, data: items, meta: { total, page: p, limit: l } });
	} catch (err) {
		next(err);
	}
}
export default { createVisit, getVisits, getVisitById, updateVisit, deleteVisit, getVisitsByUserLocation };

