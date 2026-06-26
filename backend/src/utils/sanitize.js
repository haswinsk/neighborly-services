export const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  const { password, _id, __v, ...rest } = user;
  return rest;
};

export const sanitizeDoc = (doc) => {
  const value = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = value;
  return rest;
};
