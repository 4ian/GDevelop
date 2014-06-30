/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef COMMONINSTRUCTIONSEXTENSION_H
#define COMMONINSTRUCTIONSEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing SpriteObject objects.
 *
 * \ingroup BuiltinExtensions
 */
class CommonInstructionsExtension : public gd::PlatformExtension
{
    public :

    CommonInstructionsExtension();
    virtual ~CommonInstructionsExtension() {};
};

}
#endif // COMMONINSTRUCTIONSEXTENSION_H
