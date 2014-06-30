/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef STRINGINSTRUCTIONSEXTENSION_H
#define STRINGINSTRUCTIONSEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing common functions for strings.
 *
 * \ingroup BuiltinExtensions
 */
class StringInstructionsExtension : public gd::PlatformExtension
{
public :

    StringInstructionsExtension();
    virtual ~StringInstructionsExtension() {};
};

}
#endif // STRINGINSTRUCTIONSEXTENSION_H
