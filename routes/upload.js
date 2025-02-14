const express = require("express");
const ImageKit = require("imagekit");
const multer = require("multer");
const Upload = require("../models/upload");

const router = express.Router();

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.publicKey,
    privateKey: process.env.privateKey,
    urlEndpoint: process.env.urlEndpoint
});

// Multer memory storage for temporary file handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", (req, res) => {
    res.render("homepage");
});

router.post("/upload", upload.single("profileImage"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        // Upload to ImageKit
        const response = await imagekit.upload({
            file: req.file.buffer.toString('base64'),
            fileName: `${Date.now()}-${req.file.originalname}`,
        });

        // Save the ImageKit URL to database
        await Upload.create({ 
            filePath: response.url,
            fileId: response.fileId
        });

        res.redirect(`/edits/${response.fileId}`);
    } catch (error) {
        console.error("Upload failed:", error);
        res.status(500).send("Error uploading image");
    }
});

module.exports = router;
