function previewAnnotations(entry = []) {
  return [...entry, require.resolve("./dist/esm/preset/preview.js")];
}

function managerEntries(entry = []) {
  return [...entry, require.resolve("./dist/esm/preset/manager.js")];
}

module.exports = {
  managerEntries,
  previewAnnotations,
};
