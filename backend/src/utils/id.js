export const createPublicId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
