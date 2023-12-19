const express = require("express");
const axios = require("axios");
const mysql = require("mysql2");
require("dotenv").config();

const router = express.Router();

const dbConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

router.get("/", function (req, res, next) {
  res.render("index", { title: "Classroom timetable project" });
});

router.get("/zakazani-termin", function (req, res, next) {
  dbConnection.connect();
  dbConnection.query("SELECT * FROM zakazani_termin", function (error, data) {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json({ status: 200, data });
  });
});

module.exports = router;
