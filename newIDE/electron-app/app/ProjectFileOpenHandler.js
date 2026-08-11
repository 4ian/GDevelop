const createProjectFileWindowArgs = (baseArgs, filePath) => {
  const windowArgs = {
    ...(baseArgs || {}),
    _: [filePath],
  };
  delete windowArgs['run-command'];
  delete windowArgs['cmd-args'];
  return windowArgs;
};

const createProjectFileOpenHandler = ({ openProjectFile }) => {
  let isReady = false;
  const queuedFilePaths = [];

  const handleOpenFile = (event, filePath) => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    if (!filePath) return;

    if (!isReady) {
      queuedFilePaths.push(filePath);
      return;
    }

    openProjectFile(filePath);
  };

  const markReady = () => {
    isReady = true;
    const filePaths = queuedFilePaths.splice(0);
    filePaths.forEach(filePath => openProjectFile(filePath));
    return filePaths.length;
  };

  return {
    handleOpenFile,
    markReady,
  };
};

module.exports = {
  createProjectFileOpenHandler,
  createProjectFileWindowArgs,
};
