/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_OBJECTFOLDEROROBJECT_H
#define GDCORE_OBJECTFOLDEROROBJECT_H
#include <memory>
#include <vector>

#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"

namespace gd {
class Project;
class Object;
class SerializerElement;
class ObjectsContainer;
}  // namespace gd

namespace gd {

/**
 * \brief Class representing a folder structure in order to organize objects
 * in folders (to be used with an ObjectsContainer.)
 *
 * \see gd::ObjectsContainer
 */
class GD_CORE_API ObjectFolderOrObject {
 public:
  /**
   * \brief Default constructor creating an empty instance. Useful for the null
   * object pattern.
   */
  ObjectFolderOrObject();
  virtual ~ObjectFolderOrObject();
  /**
   * \brief Constructor for creating an instance representing a folder.
   */
  ObjectFolderOrObject(gd::String folderName_,
                       ObjectFolderOrObject* parent_ = nullptr);
  /**
   * \brief Constructor for creating an instance representing an object.
   */
  ObjectFolderOrObject(gd::Object* object_,
                       ObjectFolderOrObject* parent_ = nullptr);

  /**
   * \brief Returns the object behind the instance.
   */
  gd::Object& GetObject() const { return *object; }

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
   * \brief Returns true if the instance represents the object with the given
   * name or if any of the children does (recursive search).
   */
  bool HasObjectNamed(const gd::String& name);
  /**
   * \brief Returns the child instance holding the object with the given name
   * (recursive search).
   */
  ObjectFolderOrObject& GetObjectNamed(const gd::String& name);

  /**
   * \brief Returns the number of children. Returns 0 if the instance represents
   * an object.
   */
  std::size_t GetChildrenCount() const {
    if (IsFolder()) return children.size();
    return 0;
  }
  /**
   * \brief Returns the child ObjectFolderOrObject at the given index.
   */
  ObjectFolderOrObject& GetChildAt(std::size_t index);
  /**
   * \brief Returns the child ObjectFolderOrObject at the given index.
   */
  const ObjectFolderOrObject& GetChildAt(std::size_t index) const;
  /**
   * \brief Returns the child ObjectFolderOrObject that represents the object
   * with the given name. To use only if sure that the instance holds the object
   * in its direct children (no recursive search).
   *
   * \note The equivalent method to get a folder by its name cannot be
   * implemented because there is no unicity enforced on the folder name.
   */
  ObjectFolderOrObject& GetObjectChild(const gd::String& name);

  /**
   * \brief Returns the parent of the instance. If the instance has no parent
   * (root folder), the null object is returned.
   */
  ObjectFolderOrObject& GetParent() {
    if (parent == nullptr) {
      return badObjectFolderOrObject;
    }
    return *parent;
  };

  /**
   * \brief Returns true if the instance is a root folder (that's to say it
   * has no parent).
   */
  bool IsRootFolder() { return !object && !parent; }

  /**
   * \brief Moves a child from a position to a new one.
   */
  void MoveChild(std::size_t oldIndex, std::size_t newIndex);
  /**
   * \brief Removes the given child from the instance's children. If the given
   * child contains children of its own, does nothing.
   */
  void RemoveFolderChild(const ObjectFolderOrObject& childToRemove);
  /**
   * \brief Removes the child representing the object with the given name from
   * the instance children and recursively does it for every folder children.
   */
  void RemoveRecursivelyObjectNamed(const gd::String& name);

  /**
   * \brief Inserts an instance representing the given object at the given
   * position.
   */
  void InsertObject(gd::Object* insertedObject,
                    std::size_t position = (size_t)-1);
  /**
   * \brief Inserts an instance representing a folder with the given name at the
   * given position.
   */
  ObjectFolderOrObject& InsertNewFolder(const gd::String& newFolderName,
                                        std::size_t position);
  /**
   * \brief Returns true if the instance is a descendant of the given instance
   * of ObjectFolderOrObject.
   */
  bool IsADescendantOf(const ObjectFolderOrObject& otherObjectFolderOrObject);

  /**
   * \brief Returns the position of the given instance of ObjectFolderOrObject
   * in the instance's children.
   */
  std::size_t GetChildPosition(const ObjectFolderOrObject& child) const;
  /**
   * \brief Moves the given child ObjectFolderOrObject to the given folder at
   * the given position.
   */
  void MoveObjectFolderOrObjectToAnotherFolder(
      gd::ObjectFolderOrObject& objectFolderOrObject,
      gd::ObjectFolderOrObject& newParentFolder,
      std::size_t newPosition);

  /** \name Saving and loading
   * Members functions related to saving and loading the objects of the class.
   */
  ///@{
  /**
   * \brief Serialize the ObjectFolderOrObject instance.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the ObjectFolderOrObject instance.
   */
  void UnserializeFrom(gd::Project& project,
                       const SerializerElement& element,
                       ObjectsContainer& objectsContainer);
  ///@}

 private:
  static gd::ObjectFolderOrObject badObjectFolderOrObject;

  gd::ObjectFolderOrObject*
      parent;  // nullptr if root folder, points to the parent folder otherwise.

  // Representing an object:
  gd::Object* object;  // nullptr if folderName is set.

  // or representing a folder:
  gd::String folderName;  // Empty if object is set.
  std::vector<std::unique_ptr<ObjectFolderOrObject>>
      children;  // Folder children.
};

}  // namespace gd

#endif  // GDCORE_OBJECTFOLDEROROBJECT_H
