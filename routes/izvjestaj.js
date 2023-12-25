const express = require("express");
const { dbConnection } = require("../database/connection");
require("dotenv").config();

const router = express.Router();

router.get("/profesori", function (req, res, next) {
  dbConnection.connect();
  dbConnection.query(
    `SELECT prof.ime_profesora,prof.prezime_profesora,zv.naziv_zvanja_profesora
       FROM profesor prof
       INNER JOIN zvanje_profesora zv
       ON prof.id_zvanje_profesora=zv.id_zvanje_profesora;`,
    function (error, data) {
      if (error) {
        console.error("Greska pri izvrsavanju upita:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.render("izvjestaj", { data });
    }
  );
});

router.get("/ucionice", function (req, res, next) {
  dbConnection.connect();
  dbConnection.query(
    `SELECT fkt.naziv_fakulteta, uc.sifra_ucionice, uc.naziv_ucionice, uc.broj_mjesta_ucionice, uc.renoviranje, uc.raspoloziva_za_vannastavna_predavanja
       FROM ucionica uc
       INNER JOIN fakultet fkt
       ON uc.id_fakultet = fkt.id_fakultet;`,
    function (error, data) {
      if (error) {
        console.error("Greska pri izvrsavanju upita:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.render("ucionice", { data });
    }
  );
});

router.get("/neispravno-evidentirano-vrijeme", function (req, res, next) {
  dbConnection.connect();
  dbConnection.query(
    `CALL proc_neispravno_evidentirano_vrijeme;`,
    function (error, data) {
      if (error) {
        console.error("Greska pri izvrsavanju upita:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.render("evidencija", { data: data[0] ?? [] });
    }
  );
});

module.exports = router;
