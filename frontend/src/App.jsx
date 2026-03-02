import './App.css'
import { useQuery} from '@tanstack/react-query'
import getSummeryStats from './api/summary_stats'
import getEmployeeStats from './api/employee_stats'
import Employee from './components/Employee'
import outlierDetection from './api/anomaly_detection'
import { useState } from 'react' 




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

  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // query for outlier detection data
  const { data: outliers } = useQuery({
    queryKey: ['outliers'],
    queryFn: outlierDetection,
  })
  console.log("Outliers data: ", outliers)
  
  if (isPending) {
    return (
      <h1>Loading ...</h1>
    )
    
  }
  if (error) {
    return (
      <h1>{error.message}</h1>
    )
    
  }
  
  
  // make a table to display the data coming from ./api/data :
  // uniqueEmployees,
  // averageWageRate,
  // averageOvertimeRate,
  // averageBenefitsRate,
  // cumulativePayrollSpend,
  // percentageApprenticeHours,
  {
    employeeStats.map(employee => {
      const hasAnomaly = outliers?.some(o => String(o.employee_id) === String(employee.employee_id));
      const hasHighSeverity = outliers?.some(o => String(o.employee_id) === String(employee.employee_id) && o.severity === 'HIGH');
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
                <td>${data.cumulative_payroll_spend}</td>
                <td>{data.apprentice_hours_percentage}%</td>
              </tr>
            </tbody>
          </table>
          {employeeStatsLoading && <p>Loading employee stats...</p>}
          {employeeStats && employeeStats.length > 0 ? (
            <div>
              <h2>Employee Overview ({employeeStats.length} employees)</h2>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee Name</th>
                        <th>ID</th>
                        <th>Level</th>
                        <th>Occupation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeStats.map(employee => (
                        <tr key={employee.employee_id}
                          onClick={() => setSelectedEmployee(employee)}
                          className={
                            selectedEmployee?.employee_id === employee.employee_id
                              ? 'row-selected'
                              : hasHighSeverity
                                ? 'row-high'
                                : hasAnomaly
                                  ? 'row-medium'
                                  : ''
                          }
                          style={{ cursor: 'pointer', backgroundColor: selectedEmployee && selectedEmployee.employee_id === employee.employee_id ? '#f0f8ff' : 'transparent' }}
                        >
                          <td>{employee.employee_name}</td>
                          <td>{employee.employee_id}</td>
                          <td>{employee.level}</td>
                          <td>{employee.occupation}</td>
                          <td>
                            {hasHighSeverity && <span className="flag-high">⚠</span>}
                            {!hasHighSeverity && hasAnomaly && <span className="flag-medium">⚠</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* RIGHT — card */}
                <div style={{ flex: 1, position: 'sticky', top: '24px' }}>
                  {selectedEmployee ? (
                    <div>
                      <button onClick={() => setSelectedEmployee(null)}>Close</button>
                      <Employee employee={selectedEmployee}
                        anomalies={outliers?.filter(o => String(o.employee_id) === String(selectedEmployee.employee_id)) || []} />
                    </div>
                  ) : (
                    <p style={{ color: '#aaa' }}>Select an employee to view details</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            !employeeStatsLoading && <p>No employee stats available</p>
          )}
   
          <h1>Anomaly Detection</h1>
          {outliers && outliers.length > 0 ? (
            <div>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                {outliers.filter(o => o.severity === 'HIGH').length} high severity ·{' '}
                {outliers.filter(o => o.severity === 'MEDIUM').length} medium severity
              </p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Week</th>
                    <th>Flag</th>
                    <th>Severity</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {outliers
                    .sort((a, b) => a.severity === 'HIGH' ? -1 : 1)
                    .map((anomaly, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: anomaly.severity === 'HIGH' ? '#fff5f5' : '#fffbf0'
                        }}
                      >
                        <td>{anomaly.employee_name}</td>
                        <td>{anomaly.week_ending ?? '—'}</td>
                        <td><code>{anomaly.flag_type}</code></td>
                        <td style={{ color: anomaly.severity === 'HIGH' ? '#e53e3e' : '#d97706', fontWeight: 600 }}>
                          {anomaly.severity}
                        </td>
                        <td>{anomaly.message}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#aaa' }}>No anomalies detected</p>
          )}
        </div>
      )
    }
    )
  }
  
} 


export default App
