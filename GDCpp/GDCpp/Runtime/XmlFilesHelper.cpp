/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "XmlFilesHelper.h"

std::map<gd::String, std::shared_ptr<XmlFile> > XmlFilesManager::openedFiles;
