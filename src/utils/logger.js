const logInfo = (message, data = null) => {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logError = (message, error = null) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  if (error) {
    console.error(error);
  }
};

const logWarning = (message, data = null) => {
  console.warn(`[WARNING] ${new Date().toISOString()} - ${message}`);
  if (data) {
    console.warn(JSON.stringify(data, null, 2));
  }
};

module.exports = {
  logInfo,
  logError,
  logWarning
};
