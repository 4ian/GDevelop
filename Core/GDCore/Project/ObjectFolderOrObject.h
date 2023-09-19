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
  virtual ~ObjectFolderOrObject();

  bool IsObjectExpired() { return object.expired(); }
  gd::Object& GetObject() { return *object.lock(); }

  // Si je suis un dossier:
  bool IsFolder() { return !folderName.empty(); }
  gd::String GetFolderName() { return folderName; }

 private:
  std::weak_ptr<gd::Object> object;  // Vide si folderName est pas vide.

  // ou:

  gd::String folderName;  // Vide is objectName est pas vide.
  std::vector<std::unique_ptr<ObjectFolderOrObject>> children;
  gd::ObjectFolderOrObject*
      parent;  // nullptr if root folder, sinon pointeur vers le parent.
};
}  // namespace gd

#endif  // GDCORE_OBJECTFOLDEROROBJECT_H
