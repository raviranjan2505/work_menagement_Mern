import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads";

    if (req.originalUrl.includes("/create")) {
      uploadPath = path.join("uploads", "attachments");
    } else if (req.originalUrl.includes("/submit")) {
      uploadPath = path.join("uploads", "userFiles");
    }

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"), false);
};

export default multer({ storage, fileFilter });
