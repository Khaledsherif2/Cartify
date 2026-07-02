exports.filterObj = (obj, ...allowedFields) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => allowedFields.includes(key)),
  );
