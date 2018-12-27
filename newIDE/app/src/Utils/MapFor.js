const mapFor = (start, end, func) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(func(i));
  }
  return result;
};

const mapReverseFor = (start, end, func) => {
  const result = [];
  for (let i = end - 1; i >= start; i--) {
    result.push(func(i));
  }
  return result;
};

const mapVector = (cppVector, func) => {
  return mapFor(0, cppVector.size(), i => func(cppVector.at(i), i));
};

module.exports = {
  mapFor,
  mapReverseFor,
  mapVector,
};
