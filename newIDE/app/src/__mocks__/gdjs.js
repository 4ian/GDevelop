const gdjs = {
  Logger: class {
    constructor(name) {
      this.name = name;
    }
    error() {}
    warn() {}
    info() {}
  },
  evtTools: {
    common: {
      isMobile: () => false
    }
  }
};

module.exports = gdjs; 