const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
    filePath: String,
    fileId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Upload", uploadSchema);
