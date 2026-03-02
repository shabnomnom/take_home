const getEmployeeStats = async () => {
  try {
    console.log("Fetching employee stats from /api/all_employee_stats");
    const response = await fetch("/api/all_employee_stats");

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const stats = await response.json();
    console.log("Employee stats received:", stats?.length || 0, "records");
    return stats;
  } catch (error) {
    console.error("Error fetching employee stats:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
export default getEmployeeStats;
