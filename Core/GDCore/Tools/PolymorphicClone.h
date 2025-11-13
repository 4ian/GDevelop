#pragma once

#include <memory>
#include <vector>
#include <map>

namespace gd {

template <class T>
std::unique_ptr<T> Clone(const std::unique_ptr<T>& object) {
  return std::unique_ptr<T>(object->Clone());
}

template <class T>
std::vector<std::unique_ptr<T>> Clone(
    const std::vector<std::unique_ptr<T>>& vector) {
  std::vector<std::unique_ptr<T>> copy;
  for (const auto& element : vector) copy.push_back(gd::Clone(element));

  return copy;
}

template <class K, class T>
std::map<K, std::unique_ptr<T>>
Clone(const std::map<K, std::unique_ptr<T>> &map) {
  std::map<K, std::unique_ptr<T>> copy;

  for (const auto &it : map) {
    copy[it.first] = gd::Clone(it.second);
  }
  return copy;
}

}  // namespace gd
