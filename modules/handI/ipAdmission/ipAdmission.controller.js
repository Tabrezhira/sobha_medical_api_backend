import IpAdmission from "./ipAdmission.model.js";
import Hospital from "../../hospital/hospital.model.js";

const basePopulate = [
	{ path: "hospitalCase", select: "empNo employeeName hospitalName dateOfAdmission status" }
];

const exactFilters = [
	"empNo",
	"emiratesId",
	"insuranceId",
	"trLocation",
	"caseCategory",
	"caseType",
	"status",
	"admissionMode",
	"admissionType",
	"insuranceApprovalStatus",
	"hiManagers",
	"source"
];

const parseDate = (value) => {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

function buildFilters(query) {
	const filters = {};

	exactFilters.forEach((key) => {
		if (query[key]) filters[key] = query[key];
	});

	if (query.hospitalCase) filters.hospitalCase = query.hospitalCase;

	if (query.search) {
		const term = query.search.trim();
		if (term) {
			const regex = new RegExp(term, "i");
			filters.$or = [
				{ name: regex },
				{ empNo: regex },
				{ emiratesId: regex },
				{ insuranceId: regex }
			];
		}
	}

	const doaFrom = parseDate(query.doaFrom || query.startDate);
	const doaTo = parseDate(query.doaTo || query.endDate);
	if (doaFrom || doaTo) {
		filters.doa = {};
		if (doaFrom) filters.doa.$gte = doaFrom;
		if (doaTo) filters.doa.$lte = doaTo;
	}

	const dodFrom = parseDate(query.dodFrom);
	const dodTo = parseDate(query.dodTo);
	if (dodFrom || dodTo) {
		filters.dod = {};
		if (dodFrom) filters.dod.$gte = dodFrom;
		if (dodTo) filters.dod.$lte = dodTo;
	}

	return filters;
}

async function ensureHospitalExists(hospitalId) {
	const found = await Hospital.exists({ _id: hospitalId });
	return !!found;
}

async function createIpAdmission(req, res, next) {
	try {
		if (!req.user || !req.user._id) {
			return res.status(401).json({ success: false, message: "Not authenticated" });
		}

		const payload = req.body || {};

		if (payload.hospitalCase) {
			const hospitalExists = await ensureHospitalExists(payload.hospitalCase);
			if (!hospitalExists) {
				return res.status(404).json({ success: false, message: "Referenced hospitalCase not found" });
			}
		}

		const record = new IpAdmission(payload);
		const saved = await record.save();
		const populated = await saved.populate(basePopulate);
		return res.status(201).json({ success: true, data: populated });
	} catch (err) {
		next(err);
	}
}

async function getIpAdmissions(req, res, next) {
	try {
		const filters = buildFilters(req.query || {});
		const page = Math.max(1, parseInt(req.query.page || 1, 10));
		const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || 20, 10)));

		const [total, items] = await Promise.all([
			IpAdmission.countDocuments(filters),
			IpAdmission.find(filters)
				.sort({ updatedAt: -1, createdAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.populate(basePopulate)
		]);

		return res.json({ success: true, data: items, meta: { total, page, limit } });
	} catch (err) {
		next(err);
	}
}

async function getIpAdmissionById(req, res, next) {
	try {
		const { id } = req.params;
		const item = await IpAdmission.findById(id).populate(basePopulate);
		if (!item) return res.status(404).json({ success: false, message: "Not found" });
		return res.json({ success: true, data: item });
	} catch (err) {
		next(err);
	}
}

async function updateIpAdmission(req, res, next) {
	try {
		if (!req.user || !req.user._id) {
			return res.status(401).json({ success: false, message: "Not authenticated" });
		}

		const { id } = req.params;
		const payload = { ...req.body };

		if (payload.hospitalCase) {
			const hospitalExists = await ensureHospitalExists(payload.hospitalCase);
			if (!hospitalExists) {
				return res.status(404).json({ success: false, message: "Referenced hospitalCase not found" });
			}
		}

		let updated = await IpAdmission.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
		if (!updated) return res.status(404).json({ success: false, message: "Not found" });
		updated = await updated.populate(basePopulate);
		return res.json({ success: true, data: updated });
	} catch (err) {
		next(err);
	}
}

async function deleteIpAdmission(req, res, next) {
	try {
		if (!req.user || !req.user._id) {
			return res.status(401).json({ success: false, message: "Not authenticated" });
		}

		const { id } = req.params;
		const deleted = await IpAdmission.findByIdAndDelete(id).populate(basePopulate);
		if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
		return res.json({ success: true, data: deleted });
	} catch (err) {
		next(err);
	}
}

export default {
	createIpAdmission,
	getIpAdmissions,
	getIpAdmissionById,
	updateIpAdmission,
	deleteIpAdmission
};

