import Database from "better-sqlite3";

const db = new Database("employee_data.db");

// Create the employee_data table if it doesn't exist, add the wee_ending column to the table to store the week ending date for each record, and enable record keeping for each week ending date for each employee. This will allow us to track the hours worked and rates for each employee on a weekly basis, which is essential for accurate payroll calculations and analysis.

db.exec(`
  CREATE TABLE IF NOT EXISTS employee_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT,
    employee_name TEXT,
    level TEXT,
    occupation TEXT,
    week_ending TEXT,
    mon_st_hours REAL,
    tue_st_hours REAL,
    wed_st_hours REAL,
    thu_st_hours REAL,
    fri_st_hours REAL,
    sat_st_hours REAL,
    sun_st_hours REAL,
    mon_ot_hours REAL,
    tue_ot_hours REAL,
    wed_ot_hours REAL,
    thu_ot_hours REAL,
    fri_ot_hours REAL,
    sat_ot_hours REAL,
    sun_ot_hours REAL,
    standard_rate REAL,
    overtime_rate REAL,
    benefits_rate REAL
  )
`);

// do not seed the database if it is already seeded
export const isSeeded =
  db.prepare("SELECT COUNT(*) as count FROM employee_data").get().count > 0;

export default db;
