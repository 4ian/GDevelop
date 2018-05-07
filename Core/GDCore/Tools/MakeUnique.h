/*
 * GDevelop Core
 * This project is released under the MIT License.
 *
 * This file is from https://isocpp.org/files/papers/N3656.txt
 */
#ifndef GDCORE_MAKEUNIQUE_H
#define GDCORE_MAKEUNIQUE_H

#include <memory>

/**
 * Temporary implementation of make_unique as it's not available in C++11.
 */
namespace gd {

template <class T>
struct _Unique_if {
  typedef std::unique_ptr<T> _Single_object;
};

template <class T>
struct _Unique_if<T[]> {
  typedef std::unique_ptr<T[]> _Unknown_bound;
};

template <class T, size_t N>
struct _Unique_if<T[N]> {
  typedef void _Known_bound;
};

template <class T, class... Args>
typename _Unique_if<T>::_Single_object make_unique(Args&&... args) {
  return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}

template <class T>
typename _Unique_if<T>::_Unknown_bound make_unique(size_t n) {
  typedef typename std::remove_extent<T>::type U;
  return std::unique_ptr<T>(new U[n]());
}

template <class T, class... Args>
typename _Unique_if<T>::_Known_bound make_unique(Args&&...) = delete;

}  // namespace gd

#endif
