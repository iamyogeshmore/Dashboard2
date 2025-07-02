const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8008/api";

// Helper function to get user info from localStorage
const getUserInfo = () => {
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// Helper function to determine if user is admin
const isAdmin = (userInfo) => {
  return userInfo?.LoginCode?.startsWith("ESTA");
};

// Helper function to get PatronId from user info
const getPatronId = (userInfo) => {
  return userInfo?.PatronId;
};

// Generic API call function with improved error handling
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Get plants based on user role and type
// If LoginCode starts with 'ESTA' (admin), fetch all plants
// If LoginCode starts with 'ESTU' (user), fetch plants by PatronId
export const getPlants = async (type = "all") => {
  const userInfo = getUserInfo();

  if (!userInfo) {
    throw new Error("User not authenticated");
  }

  // Validate type parameter
  const validTypes = ["Terminal", "Measurand", "all"];
  if (!validTypes.includes(type)) {
    throw new Error(
      `Invalid type parameter: ${type}. Allowed values: ${validTypes.join(
        ", "
      )}`
    );
  }

  try {
    let response;
    const typeParam = type !== "all" ? `?type=${type}` : "";

    // Admin: Fetch all plants with type filter
    if (isAdmin(userInfo)) {
      response = await apiCall(`/plants${typeParam}`);
      // User: Fetch plants by PatronId with type filter
    } else if (userInfo.LoginCode?.startsWith("ESTU")) {
      const patronId = getPatronId(userInfo);
      if (!patronId) {
        throw new Error("PatronId not found for user");
      }
      response = await apiCall(`/plants/patron/${patronId}${typeParam}`);
    } else {
      throw new Error("Invalid user role");
    }

    // Validate and map the response
    if (response.status === "success" && Array.isArray(response.data)) {
      return {
        status: "success",
        data: response.data.map((plant) => ({
          id: plant.plantid,
          name: plant.PlantName,
          type: plant.Type,
          patronId: plant.PatronId,
        })),
      };
    } else {
      throw new Error(response.message || "Invalid response format");
    }
  } catch (error) {
    console.error("Error fetching plants:", error);
    throw new Error(`Failed to fetch plants: ${error.message}`);
  }
};

// Get terminals for a specific plant with type filter
export const getTerminals = async (plantId, type = "all") => {
  if (!plantId) {
    throw new Error("Plant ID is required");
  }

  // Validate type parameter
  const validTypes = ["Terminal", "Measurand", "all"];
  if (!validTypes.includes(type)) {
    throw new Error(
      `Invalid type parameter: ${type}. Allowed values: ${validTypes.join(
        ", "
      )}`
    );
  }

  const typeParam = type !== "all" ? `?type=${type}` : "";
  return await apiCall(`/plants/${plantId}/terminals${typeParam}`);
};

// Get measurands for a specific terminal with type filter
export const getMeasurands = async (plantId, terminalId, type = "all") => {
  if (!plantId || !terminalId) {
    throw new Error("Plant ID and Terminal ID are required");
  }

  // Validate type parameter
  const validTypes = ["Terminal", "Measurand", "all"];
  if (!validTypes.includes(type)) {
    throw new Error(
      `Invalid type parameter: ${type}. Allowed values: ${validTypes.join(
        ", "
      )}`
    );
  }

  const typeParam = type !== "all" ? `?type=${type}` : "";
  return await apiCall(
    `/plants/${plantId}/terminals/${terminalId}/measurands${typeParam}`
  );
};

// Get live measurand value with improved error handling
export const getLiveMeasurandValue = async (terminalId, measurandId) => {
  if (!terminalId || !measurandId) {
    throw new Error("Terminal ID and Measurand ID are required");
  }

  try {
    const response = await apiCall(
      `/live-value/${terminalId}/measurands/${measurandId}`
    );

    // Check if the response has the expected structure
    if (response.status === "success" && response.data) {
      // Ensure we only return the required fields
      // Use nullish coalescing to handle 0 and negative values properly
      return {
        status: "success",
        data: {
          MeasurandValue: response.data.MeasurandValue ?? "N/A",
          TimeStamp: response.data.TimeStamp ?? new Date().toISOString(),
          Unit: response.data.Unit,
        },
      };
    } else {
      throw new Error(response.message || "Invalid response format");
    }
  } catch (error) {
    console.error(`Error fetching live measurand value: ${error.message}`);
    // Return a fallback response instead of throwing
    return {
      status: "success",
      data: {
        MeasurandValue: "Error",
        TimeStamp: new Date().toISOString(),
      },
    };
  }
};

// Get historical data (last 900 records)
export const getHistoricalData = async (terminalId, measurandId) => {
  if (!terminalId || !measurandId) {
    throw new Error("Terminal ID and Measurand ID are required");
  }
  return await apiCall(
    `/history/${terminalId}/measurands/${measurandId}/last-900`
  );
};

// Get historical data by date range
export const getHistoricalDataByDateRange = async (
  terminalId,
  measurandId,
  fromDate,
  toDate
) => {
  if (!terminalId || !measurandId || !fromDate || !toDate) {
    throw new Error(
      "Terminal ID, Measurand ID, from date, and to date are required"
    );
  }
  const params = new URLSearchParams({
    from: fromDate,
    to: toDate,
  });
  return await apiCall(
    `/history/${terminalId}/measurands/${measurandId}/date-range?${params}`
  );
};

// Create a new historical table config
export const createHistoricalTable = async ({
  name,
  profile,
  plantId,
  terminalId,
  measurandIds,
}) => {
  const response = await apiCall("/historical-tables", {
    method: "POST",
    body: JSON.stringify({ name, profile, plantId, terminalId, measurandIds }),
  });
  return response;
};

// Get all historical table configs
export const getHistoricalTables = async () => {
  return await apiCall("/historical-tables");
};

// Delete a historical table by id
export const deleteHistoricalTable = async (id) => {
  if (!id) throw new Error("Table id is required");
  return await apiCall(`/historical-tables/${id}`, { method: "DELETE" });
};

// Get MeasurandValue from HDNuts900 or HDNutsGraph based on profile
export const getHDNutsMeasurandValue = async ({
  terminalId,
  measurandId,
  profile,
}) => {
  if (!terminalId || !measurandId || !profile)
    throw new Error("Missing required parameters");
  return await apiCall(
    `/hdnuts/measurand-value?terminalId=${terminalId}&measurandId=${measurandId}&profile=${profile}`
  );
};

// Get a historical table by id
export const getHistoricalTableById = async (id) => {
  if (!id) throw new Error("Table id is required");
  return await apiCall(`/historical-tables/${id}`);
};

export default {
  getPlants,
  getTerminals,
  getMeasurands,
  getLiveMeasurandValue,
  getHistoricalData,
  getHistoricalDataByDateRange,
  isAdmin: () => isAdmin(getUserInfo()),
  getUserInfo,
  deleteHistoricalTable,
  getHDNutsMeasurandValue,
  getHistoricalTableById,
};
