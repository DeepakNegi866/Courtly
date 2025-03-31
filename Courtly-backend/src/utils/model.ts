export const methodExist = (model: any, methodName: string) => {
  if (typeof model[methodName] === "function") {
    return true;
  } else {
    return false;
  }
};

export const getAllFields = (model: any) => {
  let modelData = { ...model._doc };
  return modelData;
};

export const getPublicFields = (model: any) => {
  let allFields = getAllFields(model);
  let hiddenFields = [];
  if (methodExist(model, "hiddenFields")) {
    hiddenFields = model.hiddenFields();
  }
  for (let hiddenField of hiddenFields) {
    delete allFields[hiddenField];
  }
  return allFields;
};
