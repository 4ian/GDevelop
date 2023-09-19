/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/ObjectFolderOrObject.h"

#include <memory>

#include "GDCore/Project/Object.h"
using namespace std;

namespace gd {

ObjectFolderOrObject::ObjectFolderOrObject() {}
ObjectFolderOrObject::ObjectFolderOrObject(gd::String folderName_)
    : folderName(folderName_) {}
ObjectFolderOrObject::~ObjectFolderOrObject() {}

}  // namespace gd