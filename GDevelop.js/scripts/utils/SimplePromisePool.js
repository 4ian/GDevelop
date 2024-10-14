const makeSimplePromisePool = async function (functions, n) {
  return new Promise((resolve) => {
    let inProgress = 0,
      index = 0;
    function helper() {
      // base case
      if (index >= functions.length) {
        if (inProgress === 0) resolve();
        return;
      }

      while (inProgress < n && index < functions.length) {
        inProgress++;
        functions[index++]().then(() => {
          inProgress--;
          helper();
        });
      }
    }
    helper();
  });
};

module.exports = { makeSimplePromisePool };
