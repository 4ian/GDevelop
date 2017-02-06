export default (start, end, func) => {
  const result = [];
  for(let i = start; i < end; i++) {
    result.push(func(i));
  }
  return result;
}
