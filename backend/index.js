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
});

app.get("/api/all_employee_stats", (req, res) => {
  const stats = db
    .prepare(
      `
    SELECT
      employee_name,
      employee_id,
      level,
      occupation,

      -- min daily hours: only days where total > 0
      ROUND(MIN(
        CASE WHEN mon_st_hours + mon_ot_hours > 0 THEN mon_st_hours + mon_ot_hours ELSE 9999 END,
        CASE WHEN tue_st_hours + tue_ot_hours > 0 THEN tue_st_hours + tue_ot_hours ELSE 9999 END,
        CASE WHEN wed_st_hours + wed_ot_hours > 0 THEN wed_st_hours + wed_ot_hours ELSE 9999 END,
        CASE WHEN thu_st_hours + thu_ot_hours > 0 THEN thu_st_hours + thu_ot_hours ELSE 9999 END,
        CASE WHEN fri_st_hours + fri_ot_hours > 0 THEN fri_st_hours + fri_ot_hours ELSE 9999 END,
        CASE WHEN sat_st_hours + sat_ot_hours > 0 THEN sat_st_hours + sat_ot_hours ELSE 9999 END,
        CASE WHEN sun_st_hours + sun_ot_hours > 0 THEN sun_st_hours + sun_ot_hours ELSE 9999 END
      ), 2) AS min_daily_hours,

      -- max daily hours across all days
      ROUND(MAX(mon_st_hours + mon_ot_hours,
                tue_st_hours + tue_ot_hours,
                wed_st_hours + wed_ot_hours,
                thu_st_hours + thu_ot_hours,
                fri_st_hours + fri_ot_hours,
                sat_st_hours + sat_ot_hours,
                sun_st_hours + sun_ot_hours
      ), 2) AS max_daily_hours,

      -- avg daily hours: total hours / days actually worked
      ROUND(
        (mon_st_hours + mon_ot_hours +
         tue_st_hours + tue_ot_hours +
         wed_st_hours + wed_ot_hours +
         thu_st_hours + thu_ot_hours +
         fri_st_hours + fri_ot_hours +
         sat_st_hours + sat_ot_hours +
         sun_st_hours + sun_ot_hours) /
        NULLIF(
          (CASE WHEN mon_st_hours + mon_ot_hours > 0 THEN 1 ELSE 0 END +
           CASE WHEN tue_st_hours + tue_ot_hours > 0 THEN 1 ELSE 0 END +
           CASE WHEN wed_st_hours + wed_ot_hours > 0 THEN 1 ELSE 0 END +
           CASE WHEN thu_st_hours + thu_ot_hours > 0 THEN 1 ELSE 0 END +
           CASE WHEN fri_st_hours + fri_ot_hours > 0 THEN 1 ELSE 0 END +
           CASE WHEN sat_st_hours + sat_ot_hours > 0 THEN 1 ELSE 0 END +
           CASE WHEN sun_st_hours + sun_ot_hours > 0 THEN 1 ELSE 0 END),
        0)
      , 2) AS avg_daily_hours,

      -- rates
      MIN(standard_rate) AS min_standard_rate,
      MAX(standard_rate) AS max_standard_rate,
      ROUND(AVG(standard_rate), 2) AS avg_standard_rate,
      MIN(overtime_rate) AS min_overtime_rate,
      MAX(overtime_rate) AS max_overtime_rate,
      ROUND(AVG(overtime_rate), 2) AS avg_overtime_rate,
      MIN(benefits_rate) AS min_benefits_rate,
      MAX(benefits_rate) AS max_benefits_rate,
      ROUND(AVG(benefits_rate), 2) AS avg_benefits_rate,

      -- total pay
      ROUND(SUM(
        (mon_st_hours + tue_st_hours + wed_st_hours + thu_st_hours + fri_st_hours + sat_st_hours + sun_st_hours) * standard_rate +
        (mon_ot_hours + tue_ot_hours + wed_ot_hours + thu_ot_hours + fri_ot_hours + sat_ot_hours + sun_ot_hours) * overtime_rate +
        (mon_st_hours + tue_st_hours + wed_st_hours + thu_st_hours + fri_st_hours + sat_st_hours + sun_st_hours +
         mon_ot_hours + tue_ot_hours + wed_ot_hours + thu_ot_hours + fri_ot_hours + sat_ot_hours + sun_ot_hours) * benefits_rate
      ), 2) AS total_pay,

      -- overtime percentage
      ROUND(100.0 * SUM(
        mon_ot_hours + tue_ot_hours + wed_ot_hours + thu_ot_hours + fri_ot_hours + sat_ot_hours + sun_ot_hours
      ) / NULLIF(SUM(
        mon_st_hours + tue_st_hours + wed_st_hours + thu_st_hours + fri_st_hours + sat_st_hours + sun_st_hours +
        mon_ot_hours + tue_ot_hours + wed_ot_hours + thu_ot_hours + fri_ot_hours + sat_ot_hours + sun_ot_hours
      ), 0), 2) AS overtime_pct

    FROM employee_data
    GROUP BY employee_id, employee_name, level, occupation
    `
    )
    .all();

  res.json(
    stats.map((s) => ({
      employee_name: s.employee_name,
      employee_id: s.employee_id,
      level: s.level,
      occupation: s.occupation,
      dailyHours: {
        min: s.min_daily_hours,
        max: s.max_daily_hours,
        avg: s.avg_daily_hours,
      },
      standardRate: {
        min: s.min_standard_rate,
        max: s.max_standard_rate,
        avg: s.avg_standard_rate,
      },
      overtimeRate: {
        min: s.min_overtime_rate,
        max: s.max_overtime_rate,
        avg: s.avg_overtime_rate,
      },
      benefitsRate: {
        min: s.min_benefits_rate,
        max: s.max_benefits_rate,
        avg: s.avg_benefits_rate,
      },
      totalPay: s.total_pay,
      overtimePct: s.overtime_pct,
    }))
  );
});

app.get("/api/anomalies", (req, res) => {
  const anomalies = [];

  // STEP 1A — daily hours > 12
  const highHours = db
    .prepare(
      `
    SELECT
      employee_id,
      employee_name,
      level,
      occupation,
      week_ending,
      CASE
        WHEN mon_st_hours + mon_ot_hours > 12 THEN 'MON'
        WHEN tue_st_hours + tue_ot_hours > 12 THEN 'TUE'
        WHEN wed_st_hours + wed_ot_hours > 12 THEN 'WED'
        WHEN thu_st_hours + thu_ot_hours > 12 THEN 'THU'
        WHEN fri_st_hours + fri_ot_hours > 12 THEN 'FRI'
        WHEN sat_st_hours + sat_ot_hours > 12 THEN 'SAT'
        WHEN sun_st_hours + sun_ot_hours > 12 THEN 'SUN'
      END AS flagged_day,
      ROUND(MAX(
        mon_st_hours + mon_ot_hours,
        tue_st_hours + tue_ot_hours,
        wed_st_hours + wed_ot_hours,
        thu_st_hours + thu_ot_hours,
        fri_st_hours + fri_ot_hours,
        sat_st_hours + sat_ot_hours,
        sun_st_hours + sun_ot_hours
      ), 2) AS max_daily_hours
    FROM employee_data
    WHERE
      mon_st_hours + mon_ot_hours > 12 OR
      tue_st_hours + tue_ot_hours > 12 OR
      wed_st_hours + wed_ot_hours > 12 OR
      thu_st_hours + thu_ot_hours > 12 OR
      fri_st_hours + fri_ot_hours > 12 OR
      sat_st_hours + sat_ot_hours > 12 OR
      sun_st_hours + sun_ot_hours > 12
  `
    )
    .all();

  highHours.forEach((row) => {
    anomalies.push({
      employee_id: row.employee_id,
      employee_name: row.employee_name,
      level: row.level,
      occupation: row.occupation,
      week_ending: row.week_ending,
      flag_type: "HOURS_DAY_HIGH",
      severity: "HIGH",
      message: `${row.flagged_day} has ${row.max_daily_hours}h — exceeds 12 hour daily limit`,
    });
  });

  // STEP 1B — OT rate <= standard rate
  const invalidOTRate = db
    .prepare(
      `
    SELECT
      employee_id,
      employee_name,
      level,
      occupation,
      week_ending,
      standard_rate,
      overtime_rate
    FROM employee_data
    WHERE overtime_rate <= standard_rate
  `
    )
    .all();

  invalidOTRate.forEach((row) => {
    anomalies.push({
      employee_id: row.employee_id,
      employee_name: row.employee_name,
      level: row.level,
      occupation: row.occupation,
      week_ending: row.week_ending,
      flag_type: "OT_RATE_INVALID",
      severity: "HIGH",
      message: `OT rate $${row.overtime_rate} is not greater than standard rate $${row.standard_rate}`,
    });
  });

  // STEP 1C — OT hours on a day with zero ST hours
  const otWithoutST = db
    .prepare(
      `
    SELECT
      employee_id,
      employee_name,
      level,
      occupation,
      week_ending,
      CASE
        WHEN mon_ot_hours > 0 AND mon_st_hours = 0 THEN 'MON'
        WHEN tue_ot_hours > 0 AND tue_st_hours = 0 THEN 'TUE'
        WHEN wed_ot_hours > 0 AND wed_st_hours = 0 THEN 'WED'
        WHEN thu_ot_hours > 0 AND thu_st_hours = 0 THEN 'THU'
        WHEN fri_ot_hours > 0 AND fri_st_hours = 0 THEN 'FRI'
        WHEN sat_ot_hours > 0 AND sat_st_hours = 0 THEN 'SAT'
        WHEN sun_ot_hours > 0 AND sun_st_hours = 0 THEN 'SUN'
      END AS flagged_day
    FROM employee_data
    WHERE
      (mon_ot_hours > 0 AND mon_st_hours = 0) OR
      (tue_ot_hours > 0 AND tue_st_hours = 0) OR
      (wed_ot_hours > 0 AND wed_st_hours = 0) OR
      (thu_ot_hours > 0 AND thu_st_hours = 0) OR
      (fri_ot_hours > 0 AND fri_st_hours = 0) OR
      (sat_ot_hours > 0 AND sat_st_hours = 0) OR
      (sun_ot_hours > 0 AND sun_st_hours = 0)
  `
    )
    .all();

  otWithoutST.forEach((row) => {
    anomalies.push({
      employee_id: row.employee_id,
      employee_name: row.employee_name,
      level: row.level,
      occupation: row.occupation,
      week_ending: row.week_ending,
      flag_type: "OT_WITHOUT_ST",
      severity: "MEDIUM",
      message: `${row.flagged_day} has OT hours but zero standard hours`,
    });
  });

  // STEP 2 — rate anomalies against employee history + group + level violation
  const rateHistory = db
    .prepare(
      `
    WITH employee_medians AS (
      SELECT
        employee_id,
        AVG(standard_rate) AS median_rate
      FROM employee_data
      GROUP BY employee_id
    ),
    occupation_level_medians AS (
      SELECT
        occupation,
        level,
        AVG(standard_rate) AS group_median
      FROM employee_data
      GROUP BY occupation, level
    ),
    journeyworker_medians AS (
      SELECT
        occupation,
        AVG(standard_rate) AS jw_median
      FROM employee_data
      WHERE level = 'JOURNEYWORKER'
      GROUP BY occupation
    )
    SELECT
      e.employee_id,
      e.employee_name,
      e.level,
      e.occupation,
      e.week_ending,
      e.standard_rate,
      ROUND(em.median_rate, 2) AS employee_median,
      ROUND(olm.group_median, 2) AS group_median,
      ROUND(jm.jw_median, 2) AS journeyworker_median,
      ROUND(ABS(e.standard_rate - em.median_rate) / em.median_rate * 100, 2) AS history_deviation_pct,
      ROUND(ABS(e.standard_rate - olm.group_median) / olm.group_median * 100, 2) AS group_deviation_pct
    FROM employee_data e
    JOIN employee_medians em ON e.employee_id = em.employee_id
    JOIN occupation_level_medians olm ON e.occupation = olm.occupation AND e.level = olm.level
    LEFT JOIN journeyworker_medians jm ON e.occupation = jm.occupation
    WHERE
      ABS(e.standard_rate - em.median_rate) / em.median_rate > 0.15
      OR ABS(e.standard_rate - olm.group_median) / olm.group_median > 0.20
      OR (e.level = 'APPRENTICE' AND e.standard_rate >= jm.jw_median)
  `
    )
    .all();

  rateHistory.forEach((row) => {
    if (row.history_deviation_pct > 15) {
      anomalies.push({
        employee_id: row.employee_id,
        employee_name: row.employee_name,
        level: row.level,
        occupation: row.occupation,
        week_ending: row.week_ending,
        flag_type: "RATE_HISTORY_SPIKE",
        severity: row.history_deviation_pct > 40 ? "HIGH" : "MEDIUM",
        message: `Rate $${row.standard_rate} deviates ${row.history_deviation_pct}% from employee median $${row.employee_median}`,
      });
    }

    if (row.group_deviation_pct > 20) {
      anomalies.push({
        employee_id: row.employee_id,
        employee_name: row.employee_name,
        level: row.level,
        occupation: row.occupation,
        week_ending: row.week_ending,
        flag_type: "RATE_GROUP_OUTLIER",
        severity: row.group_deviation_pct > 50 ? "HIGH" : "MEDIUM",
        message: `Rate $${row.standard_rate} deviates ${row.group_deviation_pct}% from ${row.occupation} ${row.level} median $${row.group_median}`,
      });
    }

    if (
      row.level === "APPRENTICE" &&
      row.journeyworker_median &&
      row.standard_rate >= row.journeyworker_median
    ) {
      anomalies.push({
        employee_id: row.employee_id,
        employee_name: row.employee_name,
        level: row.level,
        occupation: row.occupation,
        week_ending: row.week_ending,
        flag_type: "LEVEL_RATE_VIOLATION",
        severity: "HIGH",
        message: `APPRENTICE rate $${row.standard_rate} meets or exceeds JOURNEYWORKER median $${row.journeyworker_median} for ${row.occupation} — PWA violation`,
      });
    }
  });

  // STEP 3 — name inconsistencies
  const nameInconsistencies = db
    .prepare(
      `
    SELECT
      employee_id,
      COUNT(DISTINCT employee_name) AS name_count,
      GROUP_CONCAT(DISTINCT employee_name) AS names
    FROM employee_data
    GROUP BY employee_id
    HAVING name_count > 1
  `
    )
    .all();

  nameInconsistencies.forEach((row) => {
    anomalies.push({
      employee_id: row.employee_id,
      employee_name: row.names,
      level: null,
      occupation: null,
      week_ending: null,
      flag_type: "NAME_INCONSISTENCY",
      severity: "MEDIUM",
      message: `Employee ID ${row.employee_id} has ${row.name_count} different name spellings: ${row.names}`,
    });
  });

  // STEP 4 — low weekly hours
  const lowHours = db
    .prepare(
      `
    SELECT
      employee_id,
      employee_name,
      level,
      occupation,
      week_ending,
      ROUND(
        mon_st_hours + tue_st_hours + wed_st_hours + thu_st_hours + fri_st_hours + sat_st_hours + sun_st_hours +
        mon_ot_hours + tue_ot_hours + wed_ot_hours + thu_ot_hours + fri_ot_hours + sat_ot_hours + sun_ot_hours
      , 2) AS total_hours
    FROM employee_data
    WHERE (
      mon_st_hours + tue_st_hours + wed_st_hours + thu_st_hours + fri_st_hours + sat_st_hours + sun_st_hours +
      mon_ot_hours + tue_ot_hours + wed_ot_hours + thu_ot_hours + fri_ot_hours + sat_ot_hours + sun_ot_hours
    ) > 0
    AND (
      mon_st_hours + tue_st_hours + wed_st_hours + thu_st_hours + fri_st_hours + sat_st_hours + sun_st_hours +
      mon_ot_hours + tue_ot_hours + wed_ot_hours + thu_ot_hours + fri_ot_hours + sat_ot_hours + sun_ot_hours
    ) < 15
  `
    )
    .all();

  lowHours.forEach((row) => {
    anomalies.push({
      employee_id: row.employee_id,
      employee_name: row.employee_name,
      level: row.level,
      occupation: row.occupation,
      week_ending: row.week_ending,
      flag_type: "HOURS_WEEK_LOW",
      severity: "MEDIUM",
      message: `Only ${row.total_hours}h total this week — possible incomplete submission`,
    });
  });

  res.json(anomalies);
});