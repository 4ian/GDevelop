#ifndef GD_CORE_POLYMORPHICCLONE_H
#define GD_CORE_POLYMORPHICCLONE_H

#include <memory>

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

}  // namespace gd

#endif
