const express = require("express");
const router = express.Router();

router.get("/edit", (req, res) => {
    const imageUrl = req.query.image;

    if (!imageUrl) {
        return res.status(400).send("No image provided.");
    }

    res.render("edits", { imageUrl });
});

module.exports = router;
