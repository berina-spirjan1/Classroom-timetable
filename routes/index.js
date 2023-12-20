const express = require("express");
require("dotenv").config();

const router = express.Router();

router.get("/", function (req, res, next) {
  res.render("index", { title: "Classroom timetable project" });
});

module.exports = router;
