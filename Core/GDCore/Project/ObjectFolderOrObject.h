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

class GD_CORE_API ObjectFolderOrObject {
 public:
  ObjectFolderOrObject();
  ObjectFolderOrObject(gd::String folderName_,
                       ObjectFolderOrObject* parent_ = nullptr);
  ObjectFolderOrObject(gd::Object* object_,
                       ObjectFolderOrObject* parent_ = nullptr);
  virtual ~ObjectFolderOrObject();

  gd::Object& GetObject() const { return *object; }

  bool IsFolder() const { return !folderName.empty(); }
  gd::String GetFolderName() const { return folderName; }
  bool HasObjectNamed(const gd::String& name);
  std::size_t GetChildrenCount() const {
    if (IsFolder()) return children.size();
    return 0;
  }
  ObjectFolderOrObject& GetChildAt(std::size_t index);
  ObjectFolderOrObject& GetObjectChild(const gd::String& name);

  ObjectFolderOrObject& GetParent() {
    if (parent == nullptr) {
      return badObjectFolderOrObject;
    }
    return *parent;
  };

  void MoveChild(std::size_t oldIndex, std::size_t newIndex);
  void RemoveFolderChild(gd::ObjectFolderOrObject& childToRemove);

  void InsertObject(gd::Object* insertedObject);
  void InsertObject(gd::Object* insertedObject, std::size_t position);
  ObjectFolderOrObject& InsertNewFolder(const gd::String newFolderName,
                                        std::size_t position);

  std::size_t GetChildPosition(ObjectFolderOrObject& child) const;

  void RemoveRecursivelyObjectNamed(const gd::String& name);

  void MoveObjectFolderOrObjectToAnotherFolder(
      gd::ObjectFolderOrObject& objectFolderOrObject,
      gd::ObjectFolderOrObject& newParentFolder,
      std::size_t newPosition);

  void RenameFolder(const gd::String& name) { folderName = name; }

  /** \name Saving and loading
   * Members functions related to saving and loading the objects of the class.
   */
  ///@{
  /**
   * \brief Serialize the object folder or object.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the object folder or object.
   */
  void UnserializeFrom(gd::Project& project,
                       const SerializerElement& element,
                       ObjectsContainer& objectsContainer);
  ///@}

 private:
  gd::Object* object;  // Vide si folderName est pas vide.

  // ou:

  gd::String folderName;  // Vide is objectName est pas vide.
  std::vector<std::unique_ptr<ObjectFolderOrObject>> children;
  gd::ObjectFolderOrObject*
      parent;  // nullptr if root folder, sinon pointeur vers le parent.

  static gd::ObjectFolderOrObject badObjectFolderOrObject;
};

}  // namespace gd

#endif  // GDCORE_OBJECTFOLDEROROBJECT_H
