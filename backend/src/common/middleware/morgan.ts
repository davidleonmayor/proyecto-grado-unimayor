import morgan, { StreamOptions } from "morgan";
import { envs, logger } from "../../config";

// Stream to redirect Morgan logs to Winston
const stream: StreamOptions = {
  write: (message) => logger.http(message.trim()),
};

// Function to skip logs in testing environment
const skip = () => {
  const env = envs.NODE_ENV || "development";
  return env === "test";
};

// Morgan middleware configuration
const morganMiddleware = morgan(
  // Custom log format
  ":method :url :status :res[content-length] - :response-time ms",
  {
    stream,
    skip,
  }
);

export default morganMiddleware;
