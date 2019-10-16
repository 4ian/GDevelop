/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_SerializableWithNameList
#define GDCORE_SerializableWithNameList
#include <memory>
#include <vector>
#include "GDCore/String.h"
namespace gd {
class Project;
class SerializerElement;
}  // namespace gd

namespace gd {

/**
 * \brief A class template that store a list of elements that can be accessed by
 * their names and serialized.
 *
 * The type T is supposed to have a method `GetName`, returning the `gd::String`
 * representing the name of the object, and SerializeTo/UnserializeFrom.
 *
 * \note *Invariant*: each element in the list has a unique name.
 *
 * \note *Invalidation*: Elements can be re-ordered without invalidating them.
 * Insertion/removal does not invalidate other elements. Remove/Clear delete
 * elements from memory.
 */
template <typename T>
class SerializableWithNameList {
 public:
  SerializableWithNameList();
  SerializableWithNameList(const SerializableWithNameList<T>&);
  virtual ~SerializableWithNameList(){};
  SerializableWithNameList<T>& operator=(
      const SerializableWithNameList<T>& rhs);

  /**
   * \brief Insert the specified element to the list
   * \note The element passed by parameter is copied.
   * \param element The element that must be copied and inserted into the list
   * \param position Insertion position. If the position is invalid, the object
   * is inserted at the end of the objects list.
   *
   * \return A reference to the element in the list
   */
  T& Insert(const T& element, size_t position = (size_t)-1);

  /**
   * \brief Copy elements from another list.
   */
  void Insert(const SerializableWithNameList<T>& otherEvents,
              size_t begin,
              size_t end,
              size_t position = (size_t)-1);

  /**
   * \brief Insert a new element (constructed from its default constructor) with
   * the given name.
   *
   * \param name The name of the new element
   * \param position Insertion position. If the position is invalid, the object
   * is inserted at the end of the objects list.
   *
   * \return A reference to the element in the list
   */
  T& InsertNew(const gd::String& name, size_t position = (size_t)-1);

  /**
   * \brief Return the number of elements.
   */
  size_t GetCount() const { return elements.size(); };

  /**
   * \brief Return a reference to the element with the specified name.
   */
  T& Get(const gd::String& name);

  /**
   * \brief Return a reference to the element with the specified name.
   */
  const T& Get(const gd::String& name) const;

  /**
   * \brief Return a reference to the element at position \a index in the
   * elements list.
   */
  T& Get(size_t index) { return *elements[index]; };

  /**
   * \brief Return a reference to the element at position \a index in the
   * elements list.
   */
  const T& Get(size_t index) const { return *elements[index]; };

  /**
   * \brief Remove the element with the specified name, destroying it.
   */
  void Remove(const gd::String& name);

  /**
   * \brief Remove the element at the specified index in the list, destroying
   * it.
   */
  void Remove(size_t index);

  /**
   * \brief Return true if there isn't any element in the list.
   */
  bool IsEmpty() const { return elements.empty(); };

  /**
   * \brief Clear the list of elements, destroying all of them.
   */
  void Clear() { return elements.clear(); };

  /**
   * \brief Move element at position `oldIndex` to position `newIndex`.
   *
   * Elements pointers/references won't be invalidated.
   */
  void Move(std::size_t oldIndex, std::size_t newIndex);

  /**
   * \brief Return true if an element with the specified name exists.
   */
  bool Has(const gd::String& name) const;

  /**
   * \brief Get the position of an element in the list
   */
  std::size_t GetPosition(const T& element) const;

  /** \name std::vector-like API
   * These functions ensure that the class can be used just like a std::vector
   * for iterations.
   */
  ///@{
  /**
   * \brief Alias for GetCount()
   * \see SerializableWithNameList::GetCount.
   */
  size_t size() const { return GetCount(); }

  /**
   * \brief Alias for IsEmpty()
   * \see SerializableWithNameList::IsEmpty.
   */
  bool empty() const { return IsEmpty(); }

  /**
   * \brief Alias for Get()
   * \see SerializableWithNameList::Get.
   */
  T& operator[](size_t index) { return Get(index); };

  /**
   * \brief Alias for Get()
   * \see SerializableWithNameList::Get.
   */
  const T& operator[](size_t index) const { return Get(index); };

  /**
   * \brief Alias for Get()
   * \see SerializableWithNameList::Get.
   */
  T& at(size_t index) { return Get(index); };

  /**
   * \brief Alias for Get()
   * \see SerializableWithNameList::Get.
   */
  const T& at(size_t index) const { return Get(index); };
  ///@}

  /** \name Internal std::vector raw access
   */
  ///@{
  /**
   * \brief Provide a raw access to the vector containing the elements.
   */
  const std::vector<std::unique_ptr<T>>& GetInternalVector() const {
    return elements;
  };

  /**
   * \brief Provide a raw access to the vector containing the elements.
   */
  std::vector<std::unique_ptr<T>>& GetInternalVector() { return elements; };
  ///@}

  /** \name Serialization
   */
  ///@{
  void SerializeElementsTo(const gd::String& elementName,
                           SerializerElement& element) const;

  void UnserializeElementsFrom(const gd::String& elementName,
                               gd::Project& project,
                               const SerializerElement& element);

  void UnserializeElementsFrom(const gd::String& elementName,
                               const SerializerElement& element);
  ///@}

 protected:
  std::vector<std::unique_ptr<T>> elements;

  /**
   * Initialize from another list of elements, copying elements. Used by
   * copy-ctor and assign-op. Don't forget to update me if members were changed!
   */
  void Init(const SerializableWithNameList<T>& other);
};

}  // namespace gd

#include "SerializableWithNameList.inl"

#endif
