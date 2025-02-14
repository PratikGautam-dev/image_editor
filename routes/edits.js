const express = require("express");
const ImageKit = require("imagekit");
const Upload = require("../models/upload");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();
const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.publicKey,
    privateKey: process.env.privateKey,
    urlEndpoint: process.env.urlEndpoint
});

// Main edit page route
router.get("/:fileId", async (req, res) => {
    try {
        const upload = await Upload.findOne({ fileId: req.params.fileId });
        if (!upload) {
            return res.status(404).send("Image not found");
        }
        res.render("edits", { 
            imageUrl: upload.filePath, 
            fileId: upload.fileId 
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error retrieving image");
    }
});

// Background Removal
router.get("/remove-bg/:fileId", async (req, res) => {
    try {
        const upload = await Upload.findOne({ fileId: req.params.fileId });
        if (!upload) {
            return res.status(404).send("Image not found");
        }

        // Download image from ImageKit
        const imageResponse = await axios.get(upload.filePath, { responseType: 'arraybuffer' });
        
        // Prepare for remove.bg
        const formData = new FormData();
        formData.append('image_file', Buffer.from(imageResponse.data), 'image.png');

        // Remove background
        const removeBgResponse = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
            headers: {
                "X-Api-Key": REMOVE_BG_API_KEY,
                ...formData.getHeaders(),
            },
            responseType: "arraybuffer",
        });

        // Upload back to ImageKit
        const response = await imagekit.upload({
            file: Buffer.from(removeBgResponse.data).toString('base64'),
            fileName: `no-bg-${Date.now()}.png`,
        });

        res.json({ transformedUrl: response.url });
    } catch (error) {
        console.error("Background removal failed:", error);
        res.status(500).send("Error removing background");
    }
});

// Transform route (includes resize, rotate, format conversion, quality)
router.get("/transform/:fileId", async (req, res) => {
    try {
        const { width, height, rotation, format, quality, filter } = req.query;
        const upload = await Upload.findOne({ fileId: req.params.fileId });
        
        if (!upload) {
            return res.status(404).send("Image not found");
        }

        // Start with the base URL
        let transformedUrl = upload.filePath;

        // Add transformations as URL parameters
        const params = new URLSearchParams();

        if (width || height) {
            params.append('tr', `w-${width || ''},h-${height || ''}`);
        }

        if (rotation) {
            params.append('tr', `rt-${rotation}`);
        }

        if (quality) {
            params.append('tr', `q-${quality}`);
        }

        if (format) {
            params.append('tr', `f-${format}`);
        }

        if (filter) {
            switch (filter) {
                case 'grayscale':
                    params.append('tr', 'e-grayscale');
                    break;
                case 'sepia':
                    params.append('tr', 'e-sepia');
                    break;
                case 'blur':
                    params.append('tr', 'bl-5');
                    break;
                case 'sharpen':
                    params.append('tr', 'e-sharpen');
                    break;
            }
        }

        // Add timestamp to prevent caching
        params.append('v', Date.now());

        // Append parameters to URL
        if (params.toString()) {
            transformedUrl += '?' + params.toString();
        }

        res.json({ transformedUrl });
    } catch (error) {
        console.error("Transformation failed:", error);
        res.status(500).send("Error transforming image");
    }
});

module.exports = router;
