import express from "express";
import fs from "fs";
import csv from "csv-parser";
import db, { isSeeded } from "./init_db.js";

const app = express();
const port = 3000;

// app.use for creating post request and parsing the body of the request
app.use(express.json());

const insert = db.prepare(`
  INSERT INTO employee_data (
    employee_id,
    employee_name,
    level,
    occupation,
    mon_st_hours,
    tue_st_hours,
    wed_st_hours,               
    thu_st_hours,
    fri_st_hours,
    sat_st_hours,
    sun_st_hours,
    mon_ot_hours,
    tue_ot_hours,
    wed_ot_hours,
    thu_ot_hours,
    fri_ot_hours,
    sat_ot_hours,
    sun_ot_hours,
    standard_rate,
    overtime_rate,
    benefits_rate
  ) VALUES (
    @employee_id,
    @employee_name,
    @level,
    @occupation,
    @mon_st_hours,
    @tue_st_hours,
    @wed_st_hours,               
    @thu_st_hours,
    @fri_st_hours,
    @sat_st_hours,
    @sun_st_hours,
    @mon_ot_hours,
    @tue_ot_hours,
    @wed_ot_hours,
    @thu_ot_hours,
    @fri_ot_hours,
    @sat_ot_hours,
    @sun_ot_hours,
    @standard_rate,
    @overtime_rate,
    @benefits_rate
  )
`);

const startServer = () => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

if (isSeeded) {
  console.log("DB already populated, skipping ingest");
  startServer();
} else {
  fs.createReadStream("payroll_data.csv")
    .pipe(csv())
    .on("data", (row) => {
      insert.run({
        employee_name: row.employee_name,
        employee_id: row.employee_id,
        level: row.level,
        occupation: row.occupation,
        week_ending: row.week_ending,
        mon_st_hours: parseFloat(row.mon_st_hours) || 0,
        tue_st_hours: parseFloat(row.tue_st_hours) || 0,
        wed_st_hours: parseFloat(row.wed_st_hours) || 0,
        thu_st_hours: parseFloat(row.thu_st_hours) || 0,
        fri_st_hours: parseFloat(row.fri_st_hours) || 0,
        sat_st_hours: parseFloat(row.sat_st_hours) || 0,
        sun_st_hours: parseFloat(row.sun_st_hours) || 0,
        mon_ot_hours: parseFloat(row.mon_ot_hours) || 0,
        tue_ot_hours: parseFloat(row.tue_ot_hours) || 0,
        wed_ot_hours: parseFloat(row.wed_ot_hours) || 0,
        thu_ot_hours: parseFloat(row.thu_ot_hours) || 0,
        fri_ot_hours: parseFloat(row.fri_ot_hours) || 0,
        sat_ot_hours: parseFloat(row.sat_ot_hours) || 0,
        sun_ot_hours: parseFloat(row.sun_ot_hours) || 0,
        standard_rate: parseFloat(row.standard_rate) || 0,
        overtime_rate: parseFloat(row.overtime_rate) || 0,
        benefits_rate: parseFloat(row.benefits_rate) || 0,
      });
    })
    .on("end", () => {
      console.log("CSV ingested into DB");
      startServer();
    })
    .on("error", (err) => {
      console.error("Failed to ingest CSV:", err.message);
      process.exit(1);
    });
}

// Define API endpoint to get all employee data
app.get("/api/data", (req, res) => {
  const data = db.prepare("SELECT * FROM employee_data").all();
  res.json(data);
});

// get endpoint for the summery stats
app.get("/api/summary_stats", (req, res) => {
  const summary = db
    .prepare(
      `
      SELECT
      COUNT(DISTINCT employee_id) AS unique_employees,
      ROUND(AVG(standard_rate), 2) AS avg_standard_rate,
      ROUND(AVG(overtime_rate), 2) AS avg_overtime_rate,
      ROUND(AVG(benefits_rate), 2) AS avg_benefits_rate,
      ROUND(SUM(
        (mon_st_hours + tue_st_hours + wed_st_hours + thu_st_hours + fri_st_hours + sat_st_hours + sun_st_hours) * standard_rate +
        (mon_ot_hours + tue_ot_hours + wed_ot_hours + thu_ot_hours + fri_ot_hours + sat_ot_hours + sun_ot_hours) * overtime_rate +
        (mon_st_hours + tue_st_hours + wed_st_hours + thu_st_hours + fri_st_hours + sat_st_hours + sun_st_hours +
         mon_ot_hours + tue_ot_hours + wed_ot_hours + thu_ot_hours + fri_ot_hours + sat_ot_hours + sun_ot_hours) * benefits_rate
      ), 2) AS cumulative_payroll_spend,
      ROUND(
        100.0 * SUM(CASE WHEN level = 'APPRENTICE' THEN
          mon_st_hours + tue_st_hours + wed_st_hours + thu_st_hours + fri_st_hours + sat_st_hours + sun_st_hours +
          mon_ot_hours + tue_ot_hours + wed_ot_hours + thu_ot_hours + fri_ot_hours + sat_ot_hours + sun_ot_hours
        ELSE 0 END) /
        SUM(
          mon_st_hours + tue_st_hours + wed_st_hours + thu_st_hours + fri_st_hours + sat_st_hours + sun_st_hours +
          mon_ot_hours + tue_ot_hours + wed_ot_hours + thu_ot_hours + fri_ot_hours + sat_ot_hours + sun_ot_hours
        ), 2
      ) AS apprentice_hours_pct
    FROM employee_data
  `
    )
    .get();

  res.json({
    unique_employees: summary.unique_employees,
    avg_standard_rate: summary.avg_standard_rate,
    avg_overtime_rate: summary.avg_overtime_rate,
    avg_benefits_rate: summary.avg_benefits_rate,
    cumulative_payroll_spend: summary.cumulative_payroll_spend,
    apprentice_hours_percentage: summary.apprentice_hours_pct,
  });

  // TODO:create a new endpoint for employee stats and return the min, max and average of standard_rate, overtime_rate and benefits_rate for each employee for ALL Employee for dashboard usecase.

  // TODO: Add an endpoint to get employee stats per employee, including min, max, and average of standard_rate, overtime_rate, and benefits_rate. This will be used for more drill-down analysis on the dashboard.
});
