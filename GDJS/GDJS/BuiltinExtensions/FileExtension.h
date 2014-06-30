/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef FILEEXTENSION_H
#define FILEEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing functions for storing data.
 *
 * \ingroup BuiltinExtensions
 */
class FileExtension : public gd::PlatformExtension
{
public :

    FileExtension();
    virtual ~FileExtension() {};
};

}
#endif // FILEEXTENSION_H
