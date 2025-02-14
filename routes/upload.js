const express = require("express");
const multer = require("multer");
const path = require("path");
const Upload = require("../models/upload");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get("/", (req, res) => {
  res.render("homepage");
});

router.post("/upload", upload.single("profileImage"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");
  
  const filePath = req.file.filename; // Store only filename instead of full path
  await Upload.create({ filePath });

  res.redirect(`/edits/${filePath}`); // Redirect to edit page
});

module.exports = router;
