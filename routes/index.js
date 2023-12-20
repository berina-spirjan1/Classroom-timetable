const express = require("express");
const { dbConnection } = require("../database/connection");
require("dotenv").config();

const router = express.Router();

router.get("/", function (req, res, next) {
  res.render("index", { title: "Classroom timetable project" });
});

//ruta za dobavljanje svih profesora sa titulama
router.get("/profesori", function (req, res, next) {
  dbConnection.connect();
  dbConnection.query(
    `SELECT prof.ime_profesora,prof.prezime_profesora,zv.naziv_zvanja_profesora
     FROM profesor prof
     INNER JOIN zvanje_profesora zv
     ON prof.id_zvanje_profesora=zv.id_zvanje_profesora;`,
    function (error, data) {
      if (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ status: 200, data });
    }
  );
});

//ruta za dobavljanje svih ucionica
router.get("/ucionice", function (req, res, next) {
  dbConnection.connect();
  dbConnection.query(
    `SELECT fkt.naziv_fakulteta, uc.sifra_ucionice, uc.naziv_ucionice, uc.broj_mjesta_ucionice, uc.renoviranje, uc.raspoloziva_za_vannastavna_predavanja
     FROM ucionica uc
     INNER JOIN fakultet fkt
     ON uc.id_fakultet = fkt.id_fakultet;`,
    function (error, data) {
      if (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ status: 200, data });
    }
  );
});

//ruta za dobavljanje ucionica koje su trenutno dostupne za koristenje tj. ne renoviraju se
router.get("/dostupne-ucionice", function (req, res, next) {
  dbConnection.connect();
  dbConnection.query(
    `SELECT fkt.naziv_fakulteta, uc.sifra_ucionice, uc.naziv_ucionice, uc.broj_mjesta_ucionice, uc.raspoloziva_za_vannastavna_predavanja
     FROM ucionica uc
     INNER JOIN fakultet fkt
     ON uc.id_fakultet = fkt.id_fakultet
     WHERE uc.renoviranje!=1;`,
    function (error, data) {
      if (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ status: 200, data });
    }
  );
});

//ruta za provjeru dostupnosti odredjene ucionice
router.post("/provjeri-zauzetost-ucionice", (req, res) => {
  dbConnection.connect();
  const { sifra_ucionice, datum, vrijeme_od, vrijeme_do } = req.body;

  dbConnection.query(
    `CALL procedure_dostupnost_ucionice(?,?,?,?,@dostupna)`,
    [sifra_ucionice, datum, vrijeme_od, vrijeme_do],
    (error, results) => {
      if (error) {
        console.error(error);
        res
          .status(500)
          .json({ error: "Greška prilikom izvršavanja procedure." });
        return;
      }

      dbConnection.query(`SELECT @dostupna AS dostupna;`, function (err, data) {
        if (err) {
          console.error(error);
          res
            .status(500)
            .json({ error: "Greška prilikom izvršavanja procedure." });
          return;
        }
        res.status(200).json({
          dostupna: data?.dostupna
            ? "Ucionica je dostupna za koristenje u navedenom terminu!"
            : "Ucionica je zauzeta u navedenom terminu!",
        });
      });
    }
  );
});

module.exports = router;
