/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <memory>
#include <vector>

#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include "GDCore/Project/QuickCustomization.h"

namespace gd {
class Project;
class EventsFunction;
class SerializerElement;
class EventsFunctionsContainer;
}  // namespace gd

namespace gd {

/**
 * \brief Class representing a folder structure in order to organize functions
 * in folders (to be used with a EventsFunctionsContainer.)
 *
 * \see gd::EventsFunctionsContainer
 */
class GD_CORE_API FunctionFolderOrFunction {
 public:
  /**
   * \brief Default constructor creating an empty instance. Useful for the null
   * function pattern.
   */
  FunctionFolderOrFunction();

  virtual ~FunctionFolderOrFunction();

  /**
   * \brief Constructor for creating an instance representing a folder.
   */
  FunctionFolderOrFunction(gd::String folderName_,
                       FunctionFolderOrFunction* parent_ = nullptr);

  /**
   * \brief Constructor for creating an instance representing a function.
   */
  FunctionFolderOrFunction(gd::EventsFunction* function_,
                       FunctionFolderOrFunction* parent_ = nullptr);

  /**
   * \brief Returns the function behind the instance.
   */
  gd::EventsFunction& GetFunction() const { return *function; }

  /**
   * \brief Returns true if the instance represents a folder.
   */
  bool IsFolder() const { return !folderName.empty(); }

  /**
   * \brief Returns the name of the folder.
   */
  const gd::String& GetFolderName() const { return folderName; }

  /**
   * \brief Set the folder name. Does nothing if called on an instance not
   * representing a folder.
   */
  void SetFolderName(const gd::String& name);

  /**
   * \brief Returns true if the instance represents the function with the given
   * name or if any of the children does (recursive search).
   */
  bool HasFunctionNamed(const gd::String& name);

  /**
   * \brief Returns the child instance holding the function with the given name
   * (recursive search).
   */
  FunctionFolderOrFunction& GetFunctionNamed(const gd::String& name);

  /**
   * \brief Returns the number of children. Returns 0 if the instance represents
   * a function.
   */
  std::size_t GetChildrenCount() const {
    if (IsFolder()) return children.size();
    return 0;
  }

  /**
   * \brief Returns the child FunctionFolderOrFunction at the given index.
   */
  FunctionFolderOrFunction& GetChildAt(std::size_t index);

  /**
   * \brief Returns the child FunctionFolderOrFunction at the given index.
   */
  const FunctionFolderOrFunction& GetChildAt(std::size_t index) const;

  /**
   * \brief Returns the child FunctionFolderOrFunction that represents the function
   * with the given name. To use only if sure that the instance holds the function
   * in its direct children (no recursive search).
   */
  FunctionFolderOrFunction& GetFunctionChild(const gd::String& name);

  /**
   * \brief Returns the first direct child that represents a folder
   * with the given name or create one.
   */
  FunctionFolderOrFunction& GetOrCreateChildFolder(const gd::String& name);

  /**
   * \brief Returns the parent of the instance. If the instance has no parent
   * (root folder), the null function is returned.
   */
  FunctionFolderOrFunction& GetParent() {
    if (parent == nullptr) {
      return badFunctionFolderOrFunction;
    }
    return *parent;
  };

  /**
   * \brief Returns true if the instance is a root folder (that's to say it
   * has no parent).
   */
  bool IsRootFolder() { return !function && !parent; }

  /**
   * \brief Moves a child from a position to a new one.
   */
  void MoveChild(std::size_t oldIndex, std::size_t newIndex);

  /**
   * \brief Removes the given child from the instance's children. If the given
   * child contains children of its own, does nothing.
   */
  void RemoveFolderChild(const FunctionFolderOrFunction& childToRemove);

  /**
   * \brief Removes the child representing the function with the given name from
   * the instance children and recursively does it for every folder children.
   */
  void RemoveRecursivelyFunctionNamed(const gd::String& name);

  /**
   * \brief Clears all children
   */
  void Clear();

  /**
   * \brief Inserts an instance representing the given function at the given
   * position.
   */
  void InsertFunction(gd::EventsFunction* insertedFunction,
                    std::size_t position = (size_t)-1);

  /**
   * \brief Inserts an instance representing a folder with the given name at the
   * given position.
   */
  FunctionFolderOrFunction& InsertNewFolder(const gd::String& newFolderName,
                                        std::size_t position);

  /**
   * \brief Returns true if the instance is a descendant of the given instance
   * of FunctionFolderOrFunction.
   */
  bool IsADescendantOf(const FunctionFolderOrFunction& otherFunctionFolderOrFunction);

  /**
   * \brief Returns the position of the given instance of FunctionFolderOrFunction
   * in the instance's children.
   */
  std::size_t GetChildPosition(const FunctionFolderOrFunction& child) const;

  /**
   * \brief Moves the given child FunctionFolderOrFunction to the given folder at
   * the given position.
   */
  void MoveFunctionFolderOrFunctionToAnotherFolder(
      gd::FunctionFolderOrFunction& functionFolderOrFunction,
      gd::FunctionFolderOrFunction& newParentFolder,
      std::size_t newPosition);

  /** \name Saving and loading
   * Members functions related to saving and loading the functions of the class.
   */
  ///@{
  /**
   * \brief Serialize the FunctionFolderOrFunction instance.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the FunctionFolderOrFunction instance.
   */
  void UnserializeFrom(const SerializerElement& element,
                       EventsFunctionsContainer& functionsContainer);
  ///@}

  void UpdateGroupNameOfAllFunctions();

 private:
  void DoUpdateGroupNameOfAllFunctions(const gd::String& groupPath);
  const gd::String GetGroupPath();

  static gd::FunctionFolderOrFunction badFunctionFolderOrFunction;
  static gd::String emptyGroupName;

  gd::FunctionFolderOrFunction*
      parent = nullptr;  // nullptr if root folder, points to the parent folder otherwise.

  // Representing a function:
  gd::EventsFunction* function;  // nullptr if folderName is set.

  // or representing a folder:
  gd::String folderName;  // Empty if function is set.

  std::vector<std::unique_ptr<FunctionFolderOrFunction>>
      children;  // Folder children.
};

}  // namespace gd
