import './Employee.css';

const Employee = ({ employee, anomalies }) => {
  const hasAnomaly = anomalies && anomalies.length > 0;

  return (
    <div className={`employee-card ${hasAnomaly ? 'anomaly' : ''}`}>
      <div className="employee-header">
        <h3>{employee.employee_name}</h3>
        <div className="employee-details">
          <span className="employee-id">ID: {employee.employee_id}</span>
          <span className="employee-level">Level: {employee.level}</span>
          <span className="employee-occupation">{employee.occupation}</span>
          {hasAnomaly && (
            <span style={{ color: '#e53e3e', borderColor: '#e53e3e' }}>
              ⚠ {anomalies.length} issue{anomalies.length > 1 ? 's' : ''} flagged
            </span>
          )}
        </div>
      </div>
      {hasAnomaly && (
        <div style={{ marginBottom: '1rem' }}>
          {anomalies.map((a, i) => (
            <div key={i} style={{
              padding: '8px 12px',
              marginBottom: '6px',
              background: a.severity === 'HIGH' ? '#fff5f5' : '#fffbf0',
              border: `1px solid ${a.severity === 'HIGH' ? '#feb2b2' : '#fbd38d'}`,
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: a.severity === 'HIGH' ? '#c53030' : '#92400e'
            }}>
              <strong>{a.flag_type}</strong> · {a.message}
            </div>
          ))}
        </div>
      )}


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