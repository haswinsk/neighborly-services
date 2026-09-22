export const sanitizeUser = (userDoc) => {
  // Prisma returns plain objects, not Mongoose documents
  const user = userDoc;
  const { password, _id, __v, ...rest } = user;
  return rest;
};

export const sanitizeDoc = (doc) => {
  // Prisma returns plain objects, not Mongoose documents
  const value = doc;
  const { _id, __v, ...rest } = value;
  return rest;
};
