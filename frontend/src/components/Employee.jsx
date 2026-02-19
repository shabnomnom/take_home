import './Employee.css';

const Employee = ({ employee }) => {
  if (!employee) return null;

  return (
    <div className="employee-card">
      <div className="employee-header">
        <h3>{employee.employee_name}</h3>
        <div className="employee-details">
          <span className="employee-id">ID: {employee.employee_id}</span>
          <span className="employee-level">Level: {employee.level}</span>
          <span className="employee-occupation">{employee.occupation}</span>
        </div>
      </div>

      <div className="metrics-grid">
        {/* Daily Hours Stats */}
        <div className="metric-card">
          <h4>Daily Hours</h4>
          <div className="metric-stats">
            <div className="stat">
              <span className="label">Min:</span>
              <span className="value">{employee.dailyHours.min}h</span>
            </div>
            <div className="stat">
              <span className="label">Max:</span>
              <span className="value">{employee.dailyHours.max}h</span>
            </div>
            <div className="stat">
              <span className="label">Avg:</span>
              <span className="value">{employee.dailyHours.avg}h</span>
            </div>
          </div>
        </div>

        {/* Standard Rate Stats */}
        <div className="metric-card">
          <h4>Standard Rate</h4>
          <div className="metric-stats">
            <div className="stat">
              <span className="label">Min:</span>
              <span className="value">${employee.standardRate.min}</span>
            </div>
            <div className="stat">
              <span className="label">Max:</span>
              <span className="value">${employee.standardRate.max}</span>
            </div>
            <div className="stat">
              <span className="label">Avg:</span>
              <span className="value">${employee.standardRate.avg}</span>
            </div>
          </div>
        </div>

        {/* Overtime Rate Stats */}
        <div className="metric-card">
          <h4>Overtime Rate</h4>
          <div className="metric-stats">
            <div className="stat">
              <span className="label">Min:</span>
              <span className="value">${employee.overtimeRate.min}</span>
            </div>
            <div className="stat">
              <span className="label">Max:</span>
              <span className="value">${employee.overtimeRate.max}</span>
            </div>
            <div className="stat">
              <span className="label">Avg:</span>
              <span className="value">${employee.overtimeRate.avg}</span>
            </div>
          </div>
        </div>

        {/* Benefits Rate Stats */}
        <div className="metric-card">
          <h4>Benefits Rate</h4>
          <div className="metric-stats">
            <div className="stat">
              <span className="label">Min:</span>
              <span className="value">${employee.benefitsRate.min}</span>
            </div>
            <div className="stat">
              <span className="label">Max:</span>
              <span className="value">${employee.benefitsRate.max}</span>
            </div>
            <div className="stat">
              <span className="label">Avg:</span>
              <span className="value">${employee.benefitsRate.avg}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employee;