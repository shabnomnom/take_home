// Identify and surface rows that look like potential data entry errors, such as:

// • Suspiciously high or low wages for a given employee compared to their
// typical rate
// • Suspiciously high or low hours in a week or on a single day
// • Any other patterns that suggest something is off

// get the mettrics from employee_stats and identify the outliers using IQR method for each metric and return the list of outliers

import getEmployeeStats from "./employee_stats";

export const getAnomalyDetection = async () => {
  // Get employee metrics from the existing employee_stats function
  const data = await getEmployeeStats();

  // Calculate IQR for each metric and identify outliers
  const metrics = [
    "standardRate",
    "overtimeRate",
    "benefitsRate",
    "dailyHours",
  ];
  const outliers = {};

  metrics.forEach((metric) => {
    const values = data.map((employee) => employee[metric].avg);
    values.sort((a, b) => a - b);

    const q1 = values[Math.floor(values.length / 4)];
    const q3 = values[Math.floor((values.length * 3) / 4)];
    const iqr = q3 - q1;
    
    console.log(`${metric} - Q1: ${q1}, Q3: ${q3}, IQR: ${iqr}`);
    console.log(`${metric} values:`, values);

    // Try a more sensitive threshold (1.0 instead of 1.5)
    const lowerBound = q1 - 1.0 * iqr;
    const upperBound = q3 + 1.0 * iqr;
    
    console.log(`${metric} bounds: ${lowerBound} to ${upperBound}`);

    outliers[metric] = data.filter(
      (employee) =>
        employee[metric].avg < lowerBound ||
        employee[metric].avg > upperBound
    );
    
    console.log(`${metric} outliers found:`, outliers[metric].length);
  });

  // Alternative detection: Look for unusual patterns
  const alternativeOutliers = {
    unusuallyHighRates: data.filter(emp => 
      emp.standardRate.avg > 150 || // $150+ per hour
      emp.overtimeRate.avg > 200 || // $200+ overtime
      emp.benefitsRate.avg > 100    // $100+ benefits
    ),
    unusuallyLowRates: data.filter(emp => 
      emp.standardRate.avg < 10 ||  // Less than $10/hour
      emp.overtimeRate.avg < 10 ||
      emp.benefitsRate.avg < 5
    ),
    extremeHours: data.filter(emp => 
      emp.dailyHours.max > 16 ||    // More than 16 hours/day
      emp.dailyHours.min < 0        // Negative hours
    ),
    inconsistentRates: data.filter(emp => {
      const standardDiff = emp.standardRate.max - emp.standardRate.min;
      const overtimeDiff = emp.overtimeRate.max - emp.overtimeRate.min;
      return standardDiff > 50 || overtimeDiff > 75; // Large rate variations
    })
  };

  console.log("Alternative outliers:", alternativeOutliers);

  // Combine IQR outliers with alternative detection
  const combinedOutliers = {
    ...outliers,
    alternativeDetection: alternativeOutliers
  };

  console.log("Anomaly Detection Outliers: ", combinedOutliers);
  return combinedOutliers;
};

export default getAnomalyDetection;
