/*
 * Game Develop JS Platform
 * Copyright 2008-2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef FILEEXTENSION_H
#define FILEEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

/**
 * \brief Built-in extension providing features related to external layouts.
 *
 * \ingroup BuiltinExtensions
 */
class FileExtension : public gd::PlatformExtension
{
public :

    FileExtension();
    virtual ~FileExtension() {};
};

#endif // FILEEXTENSION_H
