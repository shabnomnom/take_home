const getEmployeeStats = async () => {
  try {
    console.log("Fetching employee stats from /api/data...");
    const response = await fetch("/api/data");

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw data received:", data?.length || 0, "records");

    // Calculate per-employee metrics
    const employeeStats = data.reduce((acc, row) => {
      const employeeId = row.employee_id;

      if (!acc[employeeId]) {
        acc[employeeId] = {
          employee_name: row.employee_name,
          employee_id: employeeId,
          level: row.level,
          occupation: row.occupation,
          totalStandardHours: 0,
          totalOvertimeHours: 0,
          standardRates: [],
          overtimeRates: [],
          benefitsRates: [],
          dailyHours: [],
        };
      }

      // Calculate daily hours
      const dailyStandardHours = [
        parseFloat(row.mon_st_hours),
        parseFloat(row.tue_st_hours),
        parseFloat(row.wed_st_hours),
        parseFloat(row.thu_st_hours),
        parseFloat(row.fri_st_hours),
        parseFloat(row.sat_st_hours),
        parseFloat(row.sun_st_hours),
      ];

      const dailyOvertimeHours = [
        parseFloat(row.mon_ot_hours),
        parseFloat(row.tue_ot_hours),
        parseFloat(row.wed_ot_hours),
        parseFloat(row.thu_ot_hours),
        parseFloat(row.fri_ot_hours),
        parseFloat(row.sat_ot_hours),
        parseFloat(row.sun_ot_hours),
      ];

      // Add to employee's daily hours
      for (let i = 0; i < 7; i++) {
        acc[employeeId].dailyHours.push(
          dailyStandardHours[i] + dailyOvertimeHours[i]
        );
      }

      // Collect rates
      acc[employeeId].standardRates.push(parseFloat(row.standard_rate));
      acc[employeeId].overtimeRates.push(parseFloat(row.overtime_rate));
      acc[employeeId].benefitsRates.push(parseFloat(row.benefits_rate));

      return acc;
    }, {});

    // Calculate min/max/avg for each employee
    const employeeMetrics = Object.values(employeeStats).map((emp) => {
      const avgDailyHours =
        emp.dailyHours.reduce((sum, h) => sum + h, 0) / emp.dailyHours.length;

      return {
        employee_name: emp.employee_name,
        employee_id: emp.employee_id,
        level: emp.level,
        occupation: emp.occupation,
        dailyHours: {
          min: Number(Math.min(...emp.dailyHours).toFixed(2)),
          max: Number(Math.max(...emp.dailyHours).toFixed(2)),
          avg: Number(avgDailyHours.toFixed(2)),
        },
        standardRate: {
          min: Number(Math.min(...emp.standardRates).toFixed(2)),
          max: Number(Math.max(...emp.standardRates).toFixed(2)),
          avg: Number(
            (
              emp.standardRates.reduce((sum, r) => sum + r, 0) /
              emp.standardRates.length
            ).toFixed(2)
          ),
        },
        overtimeRate: {
          min: Number(Math.min(...emp.overtimeRates).toFixed(2)),
          max: Number(Math.max(...emp.overtimeRates).toFixed(2)),
          avg: Number(
            (
              emp.overtimeRates.reduce((sum, r) => sum + r, 0) /
              emp.overtimeRates.length
            ).toFixed(2)
          ),
        },
        benefitsRate: {
          min: Number(Math.min(...emp.benefitsRates).toFixed(2)),
          max: Number(Math.max(...emp.benefitsRates).toFixed(2)),
          avg: Number(
            (
              emp.benefitsRates.reduce((sum, r) => sum + r, 0) /
              emp.benefitsRates.length
            ).toFixed(2)
          ),
        },
      };
    });
    console.log("Employee Metrics: ", employeeMetrics);
    return employeeMetrics;
  } catch (error) {
    console.error("Error fetching employee stats:", error);
    throw error;
  }
};

export default getEmployeeStats;
