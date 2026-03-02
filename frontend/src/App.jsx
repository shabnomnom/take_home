import './App.css'
import { useQuery} from '@tanstack/react-query'
import getSummeryStats from './api/summary_stats'
import getEmployeeStats from './api/employee_stats'
import Employee from './components/Employee'
import outlierDetection from './api/anomaly_detection'



function App() {  

  // query for employees data
  const { isPending, data, error } = useQuery({
    queryKey: ['data'],
    queryFn: getSummeryStats,
  })

  // query for employee stats data
  const { data: employeeStats, isLoading: employeeStatsLoading } = useQuery({
    queryKey: ['employeeStats'],
    queryFn: getEmployeeStats,
  })

  // query for outlier detection data
  const { data: outliers, } = useQuery({
    queryKey: ['outliers'],
    queryFn: outlierDetection,
  })  

  console.log('outliers:', outliers);
  // console.log('employeeStats:', employeeStats);
  // console.log('employeeStatsLoading:', employeeStatsLoading);
  
  if (isPending) {
    return (
      <h1>Loading ...</h1>
    )
    
  }
  if (error) {
    return (
      <h1>{ error.message}</h1>
    )
    
  }
  


  // make a table to display the data coming from ./api/data :
    // uniqueEmployees,
    // averageWageRate,
    // averageOvertimeRate,
    // averageBenefitsRate,
    // cumulativePayrollSpend,
    // percentageApprenticeHours,
  return (
    <div className="App">
      <h1>Summery Statistics</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Unique Employees</th>
            <th>Average Wage Rate</th>
            <th>Average Overtime Rate</th>
            <th>Average Benefits Rate</th>
            <th>Cumulative Payroll Spend</th>
            <th>Percentage of Total Hours Attributable to Apprentices</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data.unique_employees}</td>
            <td>{data.avg_standard_rate}</td>
            <td>{data.avg_overtime_rate}</td>
            <td>{data.avg_benefits_rate}</td>
            <td>{data.cumulative_payroll_spend}$</td>
            <td>{data.apprentice_hours_percentage}%</td>
          </tr>
        </tbody>
      </table>
      <h1>Employee Statistics</h1>
      {employeeStatsLoading && <p>Loading employee stats...</p>}
      {employeeStats && employeeStats.length > 0 ? (
        <div>
          <h2>Employee Overview ({employeeStats.length} employees)</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>ID</th>
                <th>Level</th>
                <th>Occupation</th>
                <th>Daily Hours (Min/Max/Avg)</th>
                <th>Standard Rate (Min/Max/Avg)</th>
                <th>Overtime Rate (Min/Max/Avg)</th>
                <th>Benefits Rate (Min/Max/Avg)</th>
              </tr>
            </thead>
            <tbody>
              {employeeStats.map(employee => (
                <tr key={employee.employee_id}>
                  <td>{employee.employee_name}</td>
                  <td>{employee.employee_id}</td>
                  <td>{employee.level}</td>
                  <td>{employee.occupation}</td>
                  <td>
                    {employee.dailyHours.min}h / {employee.dailyHours.max}h / {employee.dailyHours.avg}h
                  </td>
                  <td>
                    ${employee.standardRate.min} / ${employee.standardRate.max} / ${employee.standardRate.avg}
                  </td>
                  <td>
                    ${employee.overtimeRate.min} / ${employee.overtimeRate.max} / ${employee.overtimeRate.avg}
                  </td>
                  <td>
                    ${employee.benefitsRate.min} / ${employee.benefitsRate.max} / ${employee.benefitsRate.avg}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* <Employee employee={employeeStats[0]} />   */}

         
        </div>
      ) : (
        !employeeStatsLoading && <p>No employee stats available</p>
      )}


    
    </div>

  )
}

export default App
