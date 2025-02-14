const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  filePath: String,
});

module.exports = mongoose.model("Upload", uploadSchema);
