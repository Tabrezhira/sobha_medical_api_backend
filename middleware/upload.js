import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf"
]);

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.size) return cb(null, true);
  if (allowedMimeTypes.has(file.mimetype)) return cb(null, true);
  cb(new Error("Unsupported file type"));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

export const happinessSurveyUpload = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "signature", maxCount: 1 }
]);

export default upload;
