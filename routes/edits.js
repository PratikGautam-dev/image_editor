const express = require("express");
const path = require("path");
const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const sharp = require("sharp");

const router = express.Router();
const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;

// 🟢 Edit Page Route
router.get("/:filename", (req, res) => {
  res.render("edits", { filename: req.params.filename });
});

// 🟢 Background Removal
router.get("/remove-bg/:filename", async (req, res) => {
  const filename = req.params.filename;
  const inputPath = path.join(__dirname, "../uploads", filename);
  const outputPath = path.join(__dirname, "../uploads", `no-bg-${filename}`);

  try {
    if (!fs.existsSync(inputPath)) {
      return res.status(400).send("File not found.");
    }

    const formData = new FormData();
    formData.append("image_file", fs.createReadStream(inputPath));

    const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
      headers: {
        "X-Api-Key": REMOVE_BG_API_KEY,
        ...formData.getHeaders(),
      },
      responseType: "arraybuffer",
    });

    await fs.writeFile(outputPath, response.data);
    res.download(outputPath);
  } catch (error) {
    console.error("Background removal failed:", error.response ? error.response.data : error.message);
    res.status(500).send("Error removing background.");
  }
});

// 🟢 Cropping
router.get("/crop/:filename", async (req, res) => {
  const { width, height } = req.query;
  const filename = req.params.filename;
  const inputPath = path.join(__dirname, "../uploads", filename);
  const outputPath = path.join(__dirname, "../uploads", `cropped-${filename}`);

  try {
    if (!fs.existsSync(inputPath)) {
      return res.status(400).send("File not found.");
    }

    const cropWidth = parseInt(width, 10);
    const cropHeight = parseInt(height, 10);

    if (isNaN(cropWidth) || isNaN(cropHeight) || cropWidth <= 0 || cropHeight <= 0) {
      return res.status(400).send("Invalid crop dimensions.");
    }

    await sharp(inputPath)
      .resize({ width: cropWidth, height: cropHeight, fit: "cover" })
      .toFile(outputPath);

    res.download(outputPath);
  } catch (error) {
    console.error("Cropping failed:", error);
    res.status(500).send("Error cropping image.");
  }
});

// 🟢 Image Resizing
router.get("/resize/:filename", async (req, res) => {
  const { width, height } = req.query;
  const filename = req.params.filename;
  const inputPath = path.join(__dirname, "../uploads", filename);
  const outputPath = path.join(__dirname, "../uploads", `resized-${filename}`);

  try {
    if (!fs.existsSync(inputPath)) {
      return res.status(400).send("File not found.");
    }

    await sharp(inputPath)
      .resize({
        width: parseInt(width),
        height: parseInt(height),
        fit: "cover",
      })
      .toFile(outputPath);

    res.download(outputPath);
  } catch (error) {
    console.error("Resizing failed:", error);
    res.status(500).send("Error resizing image.");
  }
});

// 🟢 1️⃣ Image Rotation
router.get("/rotate/:filename", async (req, res) => {
  const { angle } = req.query;
  const filename = req.params.filename;
  const inputPath = path.join(__dirname, "../uploads", filename);
  const outputPath = path.join(__dirname, "../uploads", `rotated-${filename}`);

  try {
    if (!fs.existsSync(inputPath)) {
      return res.status(400).send("File not found.");
    }

    const rotationAngle = parseInt(angle, 10) || 90; // Default 90 degrees

    await sharp(inputPath).rotate(rotationAngle).toFile(outputPath);

    res.download(outputPath);
  } catch (error) {
    console.error("Rotation failed:", error);
    res.status(500).send("Error rotating image.");
  }
});

// 🟢 2️⃣ Image Conversion (JPG, PNG, WEBP)
router.get("/convert/:filename", async (req, res) => {
  const { format } = req.query;
  const filename = req.params.filename;
  const inputPath = path.join(__dirname, "../uploads", filename);
  const outputPath = path.join(__dirname, "../uploads", `converted-${filename}.${format}`);

  try {
    if (!fs.existsSync(inputPath)) {
      return res.status(400).send("File not found.");
    }

    await sharp(inputPath).toFormat(format).toFile(outputPath);
    res.download(outputPath);
  } catch (error) {
    console.error("Format conversion failed:", error);
    res.status(500).send("Error converting format.");
  }
});

// 🟢 3️⃣ Image Compression (Reduce File Size)
router.get("/compress/:filename", async (req, res) => {
  const { quality } = req.query;
  const filename = req.params.filename;
  const inputPath = path.join(__dirname, "../uploads", filename);
  const outputPath = path.join(__dirname, "../uploads", `compressed-${filename}`);

  try {
    if (!fs.existsSync(inputPath)) {
      return res.status(400).send("File not found.");
    }

    const compressionQuality = parseInt(quality, 10) || 80; // Default 80%

    await sharp(inputPath)
      .jpeg({ quality: compressionQuality })
      .toFile(outputPath);

    res.download(outputPath);
  } catch (error) {
    console.error("Compression failed:", error);
    res.status(500).send("Error compressing image.");
  }
});

// 🟢 4️⃣ Image Filters (Grayscale, Sepia, Blur, etc.)
router.get("/filter/:filename", async (req, res) => {
  const { filter } = req.query;
  const filename = req.params.filename;
  const inputPath = path.join(__dirname, "../uploads", filename);
  const outputPath = path.join(__dirname, "../uploads", `filtered-${filename}`);

  try {
    if (!fs.existsSync(inputPath)) {
      return res.status(400).send("File not found.");
    }

    let image = sharp(inputPath);

    switch (filter) {
      case "grayscale":
        image = image.grayscale();
        break;
      case "sepia":
        image = image.tint({ r: 112, g: 66, b: 20 });
        break;
      case "blur":
        image = image.blur(5);
        break;
      case "sharpen":
        image = image.sharpen();
        break;
      default:
        return res.status(400).send("Invalid filter type.");
    }

    await image.toFile(outputPath);
    res.download(outputPath);
  } catch (error) {
    console.error("Filtering failed:", error);
    res.status(500).send("Error applying filter.");
  }
});

module.exports = router;
