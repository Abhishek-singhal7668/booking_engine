const safeJsonParse = (value, defaultValue) => {
    try {
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      console.error("Error parsing JSON", e);
      return defaultValue;
    }
  };
  