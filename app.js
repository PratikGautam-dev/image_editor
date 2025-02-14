const express = require("express");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", require("./routes/upload"));
app.use("/edits", require("./routes/edits"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});

module.exports = app;