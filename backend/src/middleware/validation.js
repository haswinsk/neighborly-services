import { ApiError } from "../utils/apiError.js";

export const assertRequiredString = (value, fieldName) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, `${fieldName} is required`);
  }
  return value.trim();
};

export const assertEmail = (value) => {
  const email = assertRequiredString(value, "Email").toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email address");
  }
  return email;
};

export const assertEnum = (value, allowedValues, fieldName) => {
  if (!allowedValues.includes(value)) {
    throw new ApiError(400, `${fieldName} must be one of: ${allowedValues.join(", ")}`);
  }
  return value;
};

export const assertNumber = (value, fieldName, { min } = {}) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ApiError(400, `${fieldName} must be a number`);
  }

  if (typeof min === "number" && value < min) {
    throw new ApiError(400, `${fieldName} must be greater than or equal to ${min}`);
  }

  return value;
};
