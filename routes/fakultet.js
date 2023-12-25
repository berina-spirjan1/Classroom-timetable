const express = require("express");
const { dbConnection } = require("../database/connection");

require("dotenv").config();

const router = express.Router();

const generateDummyData = (count = 100) => {
  const dummyData = [];
  for (let i = 1; i <= count; i++) {
    dummyData.push({
      naziv_fakulteta: `Fakultet ${i}`,
      telefon_fakulteta: `123-456-${i}`,
      email_fakulteta: `fakultet${i}@example.com`,
      korisnicko_ime: `user${i}`,
      hesirana_sifra: `hash${i}`,
      adresa_fakulteta: `Adresa ${i}`,
    });
  }
  return dummyData;
};

router.post("/sporo", (req, res) => {
  dbConnection.connect();
  const data = generateDummyData();

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).send("Bad Request: Nevalidan format podataka");
  }

  const query =
    "INSERT INTO fakultet (naziv_fakulteta, telefon_fakulteta, email_fakulteta, korisnicko_ime, hesirana_sifra, adresa_fakulteta) VALUES ?";

  const values = data.map((item) => [
    item.naziv_fakulteta,
    item.telefon_fakulteta,
    item.email_fakulteta,
    item.korisnicko_ime,
    item.hesirana_sifra,
    item.adresa_fakulteta,
  ]);
  const start = Date.now();
  dbConnection.query(query, [values], (error, results) => {
    if (error) {
      console.error("Greška prilikom višestrukog unosa:", error);
      res.status(500).send("Internal Server Error");
    } else {
      res.status(200).send("Multiple inserts successful");
    }
  });
  const end = Date.now();
  console.log(`Vrijeme izvršavanja fakulteti-sporo: ${end - start} ms`);
});

router.post("/srednje", (req, res) => {
  dbConnection.connect();
  const data = generateDummyData();

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).send("Bad Request: Invalid data format");
  }

  const query =
    "INSERT INTO fakultet (naziv_fakulteta, telefon_fakulteta, email_fakulteta, korisnicko_ime, hesirana_sifra, adresa_fakulteta) VALUES ?";

  const values = data.map((item) => [
    item.naziv_fakulteta,
    item.telefon_fakulteta,
    item.email_fakulteta,
    item.korisnicko_ime,
    item.hesirana_sifra,
    item.adresa_fakulteta,
  ]);

  const start = Date.now();
  dbConnection.query(query, [values], (error, results) => {
    if (error) {
      console.error("Greška prilikom višestrukog unosa:", error);
      res.status(500).send("Internal Server Error");
    } else {
      res.status(200).send("Uspjesno izvrseno umetanje u tabelu fakultet!");
    }
  });
  const end = Date.now();
  console.log(`Vrijeme izvršavanja fakulteti-srednje: ${end - start} ms`);
});

router.post("/brzo", async (req, res) => {
  const jsonData = generateDummyData();

  const stmt =
    "INSERT INTO fakultet (naziv_fakulteta, telefon_fakulteta, email_fakulteta, korisnicko_ime, hesirana_sifra, adresa_fakulteta) VALUES (?, ?, ?, ?, ?, ?)";
  const preparedStmt = await dbConnection.promise().prepare(stmt);

  const start = Date.now();
  try {
    for (const item of jsonData) {
      await preparedStmt.execute([
        item.naziv_fakulteta,
        item.telefon_fakulteta,
        item.email_fakulteta,
        item.korisnicko_ime,
        item.hesirana_sifra,
        item.adresa_fakulteta,
      ]);
    }

    await preparedStmt.close();

    const end = Date.now();
    console.log(`Vrijeme izvršavanja fakulteti-brzo: ${end - start} ms`);
    res.json({ success: true });
  } catch (err) {
    console.error("Greska pri izvrsavanju prepared statement:", err);

    await preparedStmt.close().catch((closeErr) => {
      console.error("Error closing prepared statement:", closeErr);
    });

    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
