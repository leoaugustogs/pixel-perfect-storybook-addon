function previewAnnotations(entry = []) {
  return [...entry, require.resolve("./dist/cjs/preset/preview.cjs")];
}

function managerEntries(entry = []) {
  return [...entry, require.resolve("./dist/cjs/preset/manager.cjs")];
}

module.exports = {
  managerEntries,
  previewAnnotations,
};
