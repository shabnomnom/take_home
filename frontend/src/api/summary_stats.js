const getData = async () => {
  const response = await fetch("/api/summary_stats");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  console.log("Summary Stats Data: ", data);
  return data;
};
export default getData;
