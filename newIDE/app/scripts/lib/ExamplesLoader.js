const fs = require('fs');

const getExampleNames = () => {
  return new Promise((resolve, reject) => {
    fs.readdir('../resources/examples', (error, exampleNames) => {
      if (error) return reject(error);

      resolve(exampleNames);
    });
  });
};

module.exports = {
  getExampleNames,
};
