import express from "express";

const app = express();
const port = 3000;

// use fs to read data from payroll_data.csv to data variable
import fs from "fs";
import csv from "csv-parser";

const data = [];
fs.createReadStream("payroll_data.csv")
  .pipe(csv())
  .on("data", (row) => {
    data.push(row);
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  });

app.get("/api/data", (req, res) => {
  res.json(data);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
