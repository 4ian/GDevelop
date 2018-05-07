namespace gd {

template <typename T>
T& HexToRgb(int hexValue, T& output) {
  output["r"] = ((hexValue >> 16) & 0xFF);
  output["g"] = ((hexValue >> 8) & 0xFF);
  output["b"] = ((hexValue)&0xFF);

  return output;
}

}  // namespace gd