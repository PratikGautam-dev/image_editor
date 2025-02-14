const express = require("express");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
const port = 8000;

connectDB();

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", require("./routes/upload"));
app.use("/edits", require("./routes/edits"));

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
