/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com)
                                   and Victor Levasseur
 (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

#ifndef GDCORE_SPTRLIST
#define GDCORE_SPTRLIST

#include <memory>
#include <vector>

namespace gd {

template <typename T>
class SPtrList {
 public:
  SPtrList();
  SPtrList(const SPtrList<T>&);
  virtual ~SPtrList(){};
  SPtrList<T>& operator=(const SPtrList<T>& rhs);

  /**
   * \brief Insert the specified element to the list
   * \note The element passed by parameter is copied.
   * \param element The element that must be copied and inserted into the list
   * \param position Insertion position. If the position is invalid, the object
   * is inserted at the end of the objects list. \return A reference to the
   * element in the list
   */
  T& Insert(const T& element, size_t position = (size_t)-1);

  /**
   * \brief Insert the specified element to the list.
   * \note The element passed by parameter is not copied.
   * \param element The smart pointer to the element that must be inserted into
   * the list \param position Insertion position. If the position is invalid,
   * the object is inserted at the end of the objects list.
   */
  void Insert(std::shared_ptr<T> element, size_t position = (size_t)-1);

  /**
   * \brief Copy elements from another list
   */
  void Insert(const SPtrList<T>& otherEvents,
              size_t begin,
              size_t end,
              size_t position = (size_t)-1);

  /**
   * \brief Return the number of elements.
   */
  size_t GetCount() const { return elements.size(); };

  /**
   * \brief Return the smart pointer to the element at position \a index in the
   * elements list.
   */
  std::shared_ptr<T> GetSmartPtr(size_t index) { return elements[index]; };

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
   * \brief Remove the specified element.
   */
  void Remove(const T& element);

  /**
   * \brief Remove the element at the specified index in the list.
   */
  void Remove(size_t index);

  /**
   * \brief Return true if there isn't any element in the list
   */
  bool IsEmpty() const { return elements.empty(); };

  /**
   * \brief Clear the list of elements.
   */
  void Clear() { return elements.clear(); };

  /** \name Utilities
   * Utility methods
   */
  ///@{
  /**
   * Return true if the specified element exists in the list.
   * \param element The element to searched for
   */
  bool Contains(const T& elementToSearch) const;
  ///@}

  /** \name std::vector-like API
   * These functions ensure that the class can be used just like a std::vector
   * for iterations.
   */
  ///@{

  /**
   * \brief Alias for GetCount()
   * \see SPtrList::GetCount.
   */
  size_t size() const { return GetCount(); }

  /**
   * \brief Alias for IsEmpty()
   * \see SPtrList::IsEmpty.
   */
  bool empty() const { return IsEmpty(); }

  /**
   * \brief Alias for Get()
   * \see SPtrList::Get.
   */
  T& operator[](size_t index) { return Get(index); };

  /**
   * \brief Alias for Get()
   * \see SPtrList::Get.
   */
  const T& operator[](size_t index) const { return Get(index); };

  /**
   * \brief Alias for Get()
   * \see SPtrList::Get.
   */
  T& at(size_t index) { return Get(index); };

  /**
   * \brief Alias for Get()
   * \see SPtrList::Get.
   */
  const T& at(size_t index) const { return Get(index); };
  ///@}

 protected:
  std::vector<std::shared_ptr<T> > elements;

  /**
   * Initialize from another list of elements, copying elements. Used by
   * copy-ctor and assign-op. Don't forget to update me if members were changed!
   */
  void Init(const SPtrList<T>& other);
};

}  // namespace gd

#include "SPtrList.inl"

#endif
