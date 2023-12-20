const express = require("express");
const { dbConnection } = require("../database/connection");
require("dotenv").config();

const router = express.Router();

//ruta za dobavljanje svih zakazanih termina
router.get("/", function (req, res, next) {
  dbConnection.connect();
  dbConnection.query(
    `SELECT
        fk.naziv_fakulteta,
        uc.naziv_ucionice,
        rasp.naziv_rasporeda,
        rasp.datum_pocetka_vazenja,
        zt.dan_u_sedmici,
        zt.vrijeme_pocetka_termina,
        zt.vrijeme_zavrsetka_termina,
        tp.naziv_tipa_predavanja,
        tp.redovni_tip_predavanja
    FROM zakazani_termin zt
    INNER JOIN tip_predavanja tp ON zt.id_tip_predavanja = tp.id_tip_predavanja
    INNER JOIN ucionica uc ON zt.id_fakultet = uc.id_fakultet AND zt.sifra_ucionice = uc.sifra_ucionice
    INNER JOIN fakultet fk on fk.id_fakultet = uc.id_fakultet AND zt.id_fakultet = fk.id_fakultet
    INNER JOIN raspored rasp on rasp.id_raspored = zt.id_raspored;`,
    function (error, data) {
      if (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ status: 200, data });
    }
  );
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
          res.status(400).json({
            message: "Bad request",
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
          res.status(400).json({
            message: "Bad request",
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

// Ruta za dodavanje novog zakazanog termina
router.post("/", function (req, res, next) {
  try {
    const columnsForInsertingData = [
      "id_raspored",
      "vrijeme_pocetka_termina",
      "vrijeme_zavrsetka_termina",
      "dan_u_sedmici",
      "sifra_ucionice",
      "id_predmet",
      "id_tip_predavanja",
      "id_fakultet",
    ];

    const data = columnsForInsertingData.map((field) => req.body[field]);

    console.log("req.body", data);

    dbConnection.query(
      `INSERT INTO zakazani_termin (${columnsForInsertingData.join(", ")})
         VALUES (${Array(columnsForInsertingData.length)
           .fill("?")
           .join(", ")})`,
      data,
      function (error, result) {
        if (error) {
          console.error(error);
          res.status(400).json({
            message: "Bad request",
            error: error.message,
          });
        } else {
          res.status(201).json({
            message: "Successfully added new scheduled appointment!",
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
