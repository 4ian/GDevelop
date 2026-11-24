const electron = require('electron');
const path = require('path');
const fs = require('fs');
const app = electron.app;

// Tracks which file identifiers are open in this process's windows, persisted to
// disk so a separate CLI process can find a live editor to route a command to.
// File identifier == local file path for now; will cover cloud project UUIDs later.
const registryFilePath = path.join(
  app.getPath('userData'),
  'open-projects.json'
);

const windowFileIdentifiers = new Map();

const normalizeFileIdentifier = fileIdentifier => {
  if (!fileIdentifier) return null;
  try {
    const resolved = path.resolve(fileIdentifier);
    return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
  } catch (e) {
    return null;
  }
};

const writeOpenProjectsRegistry = () => {
  try {
    const fileIdentifiers = Array.from(
      new Set(windowFileIdentifiers.values())
    );
    fs.writeFileSync(registryFilePath, JSON.stringify(fileIdentifiers));
  } catch (e) {}
};

const readOpenProjectFileIdentifiers = () => {
  try {
    const fileIdentifiers = JSON.parse(
      fs.readFileSync(registryFilePath, 'utf8')
    );
    return Array.isArray(fileIdentifiers) ? fileIdentifiers : [];
  } catch (e) {
    return [];
  }
};

const getWindowFileIdentifier = windowId =>
  windowFileIdentifiers.get(windowId) || null;

const setWindowFileIdentifier = (windowId, fileIdentifier) => {
  const normalized = normalizeFileIdentifier(fileIdentifier);
  if (normalized) windowFileIdentifiers.set(windowId, normalized);
  else windowFileIdentifiers.delete(windowId);
  writeOpenProjectsRegistry();
};

const clearWindowFileIdentifier = windowId => {
  if (windowFileIdentifiers.delete(windowId)) writeOpenProjectsRegistry();
};

module.exports = {
  normalizeFileIdentifier,
  readOpenProjectFileIdentifiers,
  getWindowFileIdentifier,
  setWindowFileIdentifier,
  clearWindowFileIdentifier,
};
