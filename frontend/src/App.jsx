import './App.css'
import { useQuery} from '@tanstack/react-query'
import getData from './api/summery_stats'



function App() {  

  // query for employees data
  const { isPending, data, error } = useQuery({
    queryKey: ['data'],
    queryFn: getData,
  })

  
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
            <td>{data.uniqueEmployees}</td>
            <td>{data.averageWageRate}</td>
            <td>{data.averageOvertimeRate}</td>
            <td>{data.averageBenefitsRate}</td>
            <td>${data.cumulativePayrollSpend}</td>
            <td>%{data.percentageApprenticeHours}</td>
          </tr>
        </tbody>
      </table>

    </div>
  )
}
   
  

export default App
