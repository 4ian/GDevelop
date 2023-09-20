/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_OBJECTFOLDEROROBJECT_H
#define GDCORE_OBJECTFOLDEROROBJECT_H
#include <memory>
#include <vector>

#include "GDCore/String.h"
namespace gd {
class Object;
class SerializerElement;
}  // namespace gd

namespace gd {

class GD_CORE_API ObjectFolderOrObject {
 public:
  ObjectFolderOrObject();
  ObjectFolderOrObject(gd::String folderName_);
  ObjectFolderOrObject(gd::Object* object_);
  virtual ~ObjectFolderOrObject();

  gd::Object& GetObject() { return *object; }

  bool IsFolder() const { return !folderName.empty(); }
  gd::String GetFolderName() const { return folderName; }
  bool HasObjectNamed(const gd::String& name);

  void InsertObject(gd::Object* insertedObject);
  ObjectFolderOrObject& InsertNewFolder(const gd::String newFolderName,
                                        std::size_t position);

  void RemoveRecursivelyObjectNamed(const gd::String& name);

 private:
  gd::Object* object;  // Vide si folderName est pas vide.

  // ou:

  gd::String folderName;  // Vide is objectName est pas vide.
  std::vector<std::unique_ptr<ObjectFolderOrObject>> children;
  gd::ObjectFolderOrObject*
      parent;  // nullptr if root folder, sinon pointeur vers le parent.
};

}  // namespace gd

#endif  // GDCORE_OBJECTFOLDEROROBJECT_H
