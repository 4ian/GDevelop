/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com)
                                   and Victor Levasseur
 (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

namespace gd {

template <typename T>
SPtrList<T>::SPtrList() {}

template <typename T>
void SPtrList<T>::Insert(const SPtrList<T>& otherElements,
                         size_t begin,
                         size_t end,
                         size_t position) {
  if (begin >= otherElements.size()) return;
  if (end < begin) return;
  if (end >= otherElements.size()) end = otherElements.size() - 1;

  for (std::size_t insertPos = 0; insertPos <= (end - begin); insertPos++) {
    if (position != (size_t)-1 && position + insertPos < elements.size())
      elements.insert(elements.begin() + position + insertPos,
                      CloneRememberingOriginalElement(
                          otherElements.elements[begin + insertPos]));
    else
      elements.push_back(CloneRememberingOriginalElement(
          otherElements.elements[begin + insertPos]));
  }
}

template <typename T>
T& SPtrList<T>::Insert(const T& evt, size_t position) {
  std::shared_ptr<T> element = std::make_shared<T>(evt);
  if (position < elements.size())
    elements.insert(elements.begin() + position, element);
  else
    elements.push_back(element);

  return *element;
}

template <typename T>
void SPtrList<T>::Insert(std::shared_ptr<T> element, size_t position) {
  if (position < elements.size())
    elements.insert(elements.begin() + position, element);
  else
    elements.push_back(element);
}

template <typename T>
void SPtrList<T>::Remove(size_t index) {
  elements.erase(elements.begin() + index);
}

template <typename T>
void SPtrList<T>::Remove(const T& element) {
  for (size_t i = 0; i < elements.size(); ++i) {
    if (elements[i].get() == &element) {
      elements.erase(elements.begin() + i);
      return;
    }
  }
}

template <typename T>
bool SPtrList<T>::Contains(const T& elementToSearch) const {
  for (std::size_t i = 0; i < GetCount(); ++i) {
    if (&Get(i) == &elementToSearch) return true;
  }

  return false;
}

template <typename T>
SPtrList<T>::SPtrList(const SPtrList<T>& other) {
  Init(other);
}

template <typename T>
SPtrList<T>& SPtrList<T>::operator=(const SPtrList<T>& other) {
  if (this != &other) Init(other);

  return *this;
}

template <typename T>
void SPtrList<T>::Init(const gd::SPtrList<T>& other) {
  elements.clear();
  for (size_t i = 0; i < other.elements.size(); ++i)
    elements.push_back(CloneRememberingOriginalElement(other.elements[i]));
}

}  // namespace gd
