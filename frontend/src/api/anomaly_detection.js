// api/anomaly_detection.js
const getAnomalies = async () => {
  const response = await fetch("/api/anomalies");
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export default getAnomalies;
