// coll :
// employee_name,
//   employee_id,
//   level,
//   occupation,
//   week_ending,
//   mon_st_hours,
//   tue_st_hours,
//   wed_st_hours,
//   thu_st_hours,
//   fri_st_hours,
//   sat_st_hours,
//   sun_st_hours,
//   mon_ot_hours,
//   tue_ot_hours,
//   wed_ot_hours,
//   thu_ot_hours,
//   fri_ot_hours,
//   sat_ot_hours,
//   sun_ot_hours,
//   standard_rate,
//   overtime_rate,
//   benefits_rate;

const getData = async () => {
  const response = await fetch("/api/data");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();

  // total number of unique employees using employee_id
  const uniqueEmployees = new Set(data.map((row) => row.employee_id)).size;
  console.log("Total number of unique employees: ", uniqueEmployees);

  // average wage rates and benefits rates
  const averageWageRate =
    data.reduce((acc, row) => acc + parseFloat(row.standard_rate), 0) /
    data.length;
  const averageOvertimeRate =
    data.reduce((acc, row) => acc + parseFloat(row.overtime_rate), 0) /
    data.length;

  const averageBenefitsRate =
    data.reduce((acc, row) => acc + parseFloat(row.benefits_rate), 0) /
    data.length;
  console.log("Average wage rate: ", averageWageRate);
  console.log("Average benefits rate: ", averageBenefitsRate);

  // cumulative payroll spend
  const cumulativePayrollSpend = data.reduce((acc, row) => {
    const standardHours =
      parseFloat(row.mon_st_hours) +
      parseFloat(row.tue_st_hours) +
      parseFloat(row.wed_st_hours) +
      parseFloat(row.thu_st_hours) +
      parseFloat(row.fri_st_hours) +
      parseFloat(row.sat_st_hours) +
      parseFloat(row.sun_st_hours);
    const overtimeHours =
      parseFloat(row.mon_ot_hours) +
      parseFloat(row.tue_ot_hours) +
      parseFloat(row.wed_ot_hours) +
      parseFloat(row.thu_ot_hours) +
      parseFloat(row.fri_ot_hours) +
      parseFloat(row.sat_ot_hours) +
      parseFloat(row.sun_ot_hours);
    const standardPay = standardHours * parseFloat(row.standard_rate);
    const overtimePay = overtimeHours * parseFloat(row.overtime_rate);
    const benefitsPay =
      (standardPay + overtimePay) * (parseFloat(row.benefits_rate) / 100);
    return acc + standardPay + overtimePay + benefitsPay;
  }, 0);
  console.log("Cumulative payroll spend: ", cumulativePayrollSpend);

  // percentage of total hours attributable to apprentices
  const totalHours = data.reduce((acc, row) => {
    const standardHours =
      parseFloat(row.mon_st_hours) +
      parseFloat(row.tue_st_hours) +
      parseFloat(row.wed_st_hours) +
      parseFloat(row.thu_st_hours) +
      parseFloat(row.fri_st_hours) +
      parseFloat(row.sat_st_hours) +
      parseFloat(row.sun_st_hours);
    const overtimeHours =
      parseFloat(row.mon_ot_hours) +
      parseFloat(row.tue_ot_hours) +
      parseFloat(row.wed_ot_hours) +
      parseFloat(row.thu_ot_hours) +
      parseFloat(row.fri_ot_hours) +
      parseFloat(row.sat_ot_hours) +
      parseFloat(row.sun_ot_hours);
    return acc + standardHours + overtimeHours;
  }, 0);
  // filter total hours from based on level  = APPRENTICE and calculate percentage of total hours attributable to apprentices
  const apprenticeHours = data.reduce((acc, row) => {
    if (row.level === "APPRENTICE") {
      const standardHours =
        parseFloat(row.mon_st_hours) +
        parseFloat(row.tue_st_hours) +
        parseFloat(row.wed_st_hours) +
        parseFloat(row.thu_st_hours) +
        parseFloat(row.fri_st_hours) +
        parseFloat(row.sat_st_hours) +
        parseFloat(row.sun_st_hours);
      const overtimeHours =
        parseFloat(row.mon_ot_hours) +
        parseFloat(row.tue_ot_hours) +
        parseFloat(row.wed_ot_hours) +
        parseFloat(row.thu_ot_hours) +
        parseFloat(row.fri_ot_hours) +
        parseFloat(row.sat_ot_hours) +
        parseFloat(row.sun_ot_hours);
      return acc + standardHours + overtimeHours;
    }
    return acc;
  }, 0);
  const percentageApprenticeHours = (apprenticeHours / totalHours) * 100;
  console.log(
    "Percentage of total hours attributable to apprentices: ",
    percentageApprenticeHours
  );

  return {
    uniqueEmployees,
    averageWageRate: Number(averageWageRate.toFixed(2)),
    averageOvertimeRate: Number(averageOvertimeRate.toFixed(2)),
    averageBenefitsRate: Number(averageBenefitsRate.toFixed(2)),
    cumulativePayrollSpend: Number(cumulativePayrollSpend.toFixed(2)),
    percentageApprenticeHours: Number(percentageApprenticeHours.toFixed(2)),
  };
};

//1. Summary Statistics
// Create a basic dashboard showing overview statistics of the dataset. Choose
// whatever summary stats you think would be interesting. Some ideas:
// • Total number of unique employees
// • Average wage rates and benefits rates
// • Cumulative payroll spend
// • Percentage of total hours attributable to apprentices

export default getData;
