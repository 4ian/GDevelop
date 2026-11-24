/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <memory>
#include <vector>

#include "GDCore/Project/ProjectItemFolderOrItem.h"
#include "GDCore/Project/Test.h"
#include "GDCore/String.h"
#include "GDCore/Tools/MakeUnique.h"
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
  TestsContainer()
      : rootFolder(gd::make_unique<gd::TestFolderOrTest>("__ROOT")) {}

  TestsContainer(const TestsContainer& other)
      : rootFolder(gd::make_unique<gd::TestFolderOrTest>("__ROOT")) {
    Init(other);
  }

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
    gd::Test& newTest = InsertNew(name, position);
    rootFolder->InsertItem(&newTest);
    return newTest;
  }
  gd::Test& InsertTest(const gd::Test& test, std::size_t position) {
    gd::Test& newTest = Insert(test, position);
    rootFolder->InsertItem(&newTest);
    return newTest;
  }
  void RemoveTest(const gd::String& name) {
    rootFolder->RemoveRecursivelyItemNamed(name);
    return Remove(name);
  }
  void ClearTests() {
    rootFolder->Clear();
    return Clear();
  }
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
    rootFolder->Clear();
    UnserializeElementsFrom("test", element);
    rootFolder->AddMissingItems(elements);
  };

  /**
   * \brief Return the root folder used to organize the tests in folders.
   */
  gd::TestFolderOrTest& GetRootFolder() { return *rootFolder; }

  void SerializeFolderStructureTo(SerializerElement& element) const {
    rootFolder->SerializeTo(element);
  };

  /**
   * \brief Unserialize the folder structure saved in the child `childName` of
   * `parentElement` (if any), once the tests are unserialized.
   */
  void UnserializeFolderStructureFromChildOf(
      const SerializerElement& parentElement, const gd::String& childName) {
    rootFolder->UnserializeFromChildOf(
        parentElement,
        childName,
        [this](const gd::String& name) {
          return HasTestNamed(name) ? &GetTest(name) : nullptr;
        },
        elements);
  };
  ///@}

 protected:
  /**
   * Initialize object using another object. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   */
  void Init(const gd::TestsContainer& other) {
    // The folder structure is not copied (it points to the tests of the other
    // container): rebuild a flat structure so that every test stays reachable.
    rootFolder->Clear();
    SerializableWithNameList<gd::Test>::Init(other);
    rootFolder->AddMissingItems(elements);
  };

 private:
  std::unique_ptr<gd::TestFolderOrTest>
      rootFolder;  ///< Folder structure used to organize the tests.
};

}  // namespace gd
