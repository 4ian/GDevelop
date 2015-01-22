/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "XmlFilesHelper.h"

std::map<std::string, boost::shared_ptr<XmlFile> > XmlFilesManager::openedFiles;
