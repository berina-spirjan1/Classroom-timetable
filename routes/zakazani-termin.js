const express = require("express");
const { dbConnection } = require("../database/connection");
require("dotenv").config();

const router = express.Router();

//ruta za dobavljanje svih zakazanih termina
router.get("/", function (req, res, next) {
  dbConnection.connect();
  dbConnection.query("SELECT * FROM zakazani_termin", function (error, data) {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json({ status: 200, data });
  });
});

//ruta za azuriranje odredjenog zakazanog termina
router.put("/:id", function (req, res, next) {
  console.log("req.params.id", req.params.id);

  try {
    const updatedData = Object.keys(req.body)
      .filter((key) => key !== "id_zakazani_termin_u_rasporedu")
      .map((key) => `${key} = ?`);

    const queryParams = [...Object.values(req.body), req.params.id];

    dbConnection.query(
      `UPDATE zakazani_termin
       SET ${updatedData.join(", ")}
       WHERE id_zakazani_termin_u_rasporedu = ?`,
      queryParams,
      function (error, result) {
        if (error) {
          console.error(error);
          res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
          });
        } else {
          res.status(200).json({
            message: "Successfully updated scheduled appointment!",
            data: result,
          });
        }
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//ruta za brisanje nekog zakazanog termina na osnovu id-ija
router.delete("/:id", function (req, res, next) {
  try {
    dbConnection.query(
      `DELETE FROM zakazani_termin
       WHERE id_zakazani_termin_u_rasporedu = ?`,
      [req.params.id],
      function (error, result) {
        if (error) {
          console.error(error);
          res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
          });
        } else {
          res.status(200).json({
            message: "Successfully deleted scheduled appointment!",
            data: result,
          });
        }
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
