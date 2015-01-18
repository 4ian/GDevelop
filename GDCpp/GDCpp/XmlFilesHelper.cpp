/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "XmlFilesHelper.h"

std::map<std::string, std::shared_ptr<XmlFile> > XmlFilesManager::openedFiles;
