/*
 * Game Develop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#include "XmlFilesHelper.h"

std::map<std::string, boost::shared_ptr<XmlFile> > XmlFilesManager::openedFiles;