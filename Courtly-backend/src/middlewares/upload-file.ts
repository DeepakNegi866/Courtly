import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, Date.now() + "-" + sanitizedFilename);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    "image/jpeg", // .jpeg, .jpg
    "image/png", // .png
    "application/pdf", // .pdf
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx (Word)
    "application/msword", // .doc (Word)
    "application/vnd.ms-excel", // .xls (Excel)
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx (Excel)
    "application/vnd.ms-powerpoint", // .ppt (PowerPoint)
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx (PowerPoint)
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Invalid file type. Only images are allowed."), false); // Reject the file
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});
