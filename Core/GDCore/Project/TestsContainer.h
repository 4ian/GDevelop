/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <vector>

#include "GDCore/Project/Test.h"
#include "GDCore/String.h"
#include "GDCore/Tools/SerializableWithNameList.h"

namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief A container of tests (gd::Test), used by gd::Project and
 * gd::EventsFunctionsExtension.
 *
 * \see gd::Test
 * \ingroup PlatformDefinition
 */
class GD_CORE_API TestsContainer : private SerializableWithNameList<gd::Test> {
 public:
  TestsContainer() {}

  TestsContainer(const TestsContainer& other) { Init(other); }

  TestsContainer& operator=(const TestsContainer& other) {
    if (this != &other) {
      Init(other);
    }
    return *this;
  }

  /** \name Tests management
   */
  ///@{
  /**
   * \brief Check if a test with the specified name exists.
   */
  bool HasTestNamed(const gd::String& name) const { return Has(name); }

  /**
   * \brief Get the test with the specified name.
   *
   * \warning Trying to access a not existing test will result in
   * undefined behavior.
   */
  gd::Test& GetTest(const gd::String& name) { return Get(name); }

  /**
   * \brief Get the test with the specified name.
   *
   * \warning Trying to access a not existing test will result in
   * undefined behavior.
   */
  const gd::Test& GetTest(const gd::String& name) const { return Get(name); }

  /**
   * \brief Get the test at the specified index in the list.
   *
   * \warning Trying to access a not existing test will result in
   * undefined behavior.
   */
  gd::Test& GetTest(std::size_t index) { return Get(index); }

  /**
   * \brief Get the test at the specified index in the list.
   *
   * \warning Trying to access a not existing test will result in
   * undefined behavior.
   */
  const gd::Test& GetTest(std::size_t index) const { return Get(index); }

  /**
   * \brief Return the number of tests.
   */
  std::size_t GetTestsCount() const { return GetCount(); }

  gd::Test& InsertNewTest(const gd::String& name, std::size_t position) {
    return InsertNew(name, position);
  }
  gd::Test& InsertTest(const gd::Test& test, std::size_t position) {
    return Insert(test, position);
  }
  void RemoveTest(const gd::String& name) { return Remove(name); }
  void ClearTests() { return Clear(); }
  void MoveTest(std::size_t oldIndex, std::size_t newIndex) {
    return Move(oldIndex, newIndex);
  };
  std::size_t GetTestPosition(const gd::Test& test) {
    return GetPosition(test);
  };

  /**
   * \brief Provide a raw access to the vector containing the tests.
   */
  const std::vector<std::unique_ptr<gd::Test>>& GetInternalVector() const {
    return elements;
  };

  /**
   * \brief Provide a raw access to the vector containing the tests.
   */
  std::vector<std::unique_ptr<gd::Test>>& GetInternalVector() {
    return elements;
  };
  ///@}

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the tests.
   */
  void SerializeTestsTo(SerializerElement& element) const {
    return SerializeElementsTo("test", element);
  };

  /**
   * \brief Unserialize the tests.
   */
  void UnserializeTestsFrom(const SerializerElement& element) {
    return UnserializeElementsFrom("test", element);
  };
  ///@}

 protected:
  /**
   * Initialize object using another object. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   */
  void Init(const gd::TestsContainer& other) {
    return SerializableWithNameList<gd::Test>::Init(other);
  };
};

}  // namespace gd
