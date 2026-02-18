import "../../../config/env.js";
import HappinessSurvey from "./happinessSurvey.model.js";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.Cloud_name,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.API_key,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.API_secret,
});

// Helper function to upload to cloudinary
const uploadToCloudinary = (fileBuffer, fileName, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || 'happiness-survey',
        resource_type: 'auto',
        public_id: fileName,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    Readable.from(fileBuffer).pipe(stream);
  });
};

const extractBufferFromBase64 = (value) => {
  if (!value) return null;
  const base64Payload = value.includes(",") ? value.split(",").pop() : value;
  try {
    return Buffer.from(base64Payload, "base64");
  } catch (err) {
    return null;
  }
};

const pickFile = (files, key) => {
  if (!files || !files[key] || !Array.isArray(files[key])) return null;
  return files[key][0] || null;
};

const buildPublicId = (prefix) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e4)}`;

// Create happiness survey record (manager only)
async function createHappinessSurvey(req, res, next) {
  try {
    const { photoBase64, signatureBase64, ...data } = req.body;
    const newRecord = new HappinessSurvey(data);
    const files = req.files || {};
    const photoFile = pickFile(files, "photo");
    const signatureFile = pickFile(files, "signature");

    // Upload photo if provided
    const photoBuffer = photoFile?.buffer || extractBufferFromBase64(photoBase64);
    if (photoBuffer) {
      const photoUrl = await uploadToCloudinary(photoBuffer, buildPublicId("photo"), "happiness-survey/photos");
      newRecord.photoUrl = photoUrl;
    }

    // Upload signature if provided
    const signatureBuffer = signatureFile?.buffer || extractBufferFromBase64(signatureBase64);
    if (signatureBuffer) {
      const signatureUrl = await uploadToCloudinary(signatureBuffer, buildPublicId("signature"), "happiness-survey/signatures");
      newRecord.signatureUrl = signatureUrl;
    }

    await newRecord.save();
    return res.status(201).json({ success: true, data: newRecord });
  } catch (err) {
    next(err);
  }
}

// Get all happiness surveys (manager only)
async function getHappinessSurveys(req, res, next) {
  try {
    const { page = 1, limit = 50, empNo, dateFrom, dateTo, happinessScoreMin } = req.query;
    const p = Math.max(1, parseInt(page, 10));
    const l = Math.max(1, parseInt(limit, 10));

    const query = {};
    if (empNo) query.empNo = empNo;
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    if (happinessScoreMin) query.happinessScore = { $gte: parseInt(happinessScoreMin) };

    const [total, items] = await Promise.all([
      HappinessSurvey.countDocuments(query),
      HappinessSurvey.find(query)
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

// Get happiness survey by ID (manager only)
async function getHappinessSurveyById(req, res, next) {
  try {
    const { id } = req.params;
    const record = await HappinessSurvey.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    return res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

// Update happiness survey (manager only)
async function updateHappinessSurvey(req, res, next) {
  try {
    const { id } = req.params;
    const { photoBase64, signatureBase64, ...data } = req.body;
    const record = await HappinessSurvey.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const files = req.files || {};
    const photoFile = pickFile(files, "photo");
    const signatureFile = pickFile(files, "signature");

    // Upload new photo if provided
    const photoBuffer = photoFile?.buffer || extractBufferFromBase64(photoBase64);
    if (photoBuffer) {
      const photoUrl = await uploadToCloudinary(photoBuffer, buildPublicId("photo"), 'happiness-survey/photos');
      data.photoUrl = photoUrl;
    }

    // Upload new signature if provided
    const signatureBuffer = signatureFile?.buffer || extractBufferFromBase64(signatureBase64);
    if (signatureBuffer) {
      const signatureUrl = await uploadToCloudinary(signatureBuffer, buildPublicId("signature"), 'happiness-survey/signatures');
      data.signatureUrl = signatureUrl;
    }

    Object.assign(record, data);
    await record.save();
    return res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

// Delete happiness survey (manager only)
async function deleteHappinessSurvey(req, res, next) {
  try {
    const { id } = req.params;
    const record = await HappinessSurvey.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Delete from Cloudinary if URLs exist
    if (record.photoUrl) {
      const photoPublicId = record.photoUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`happiness-survey/photos/${photoPublicId}`);
    }

    if (record.signatureUrl) {
      const signaturePublicId = record.signatureUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`happiness-survey/signatures/${signaturePublicId}`);
    }

    await HappinessSurvey.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    next(err);
  }
}

export default {
  createHappinessSurvey,
  getHappinessSurveys,
  getHappinessSurveyById,
  updateHappinessSurvey,
  deleteHappinessSurvey,
};
