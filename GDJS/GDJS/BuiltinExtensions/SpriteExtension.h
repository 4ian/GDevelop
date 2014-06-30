/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef SPRITEEXTENSION_H
#define SPRITEEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing SpriteObject objects.
 *
 * \ingroup BuiltinExtensions
 */
class SpriteExtension : public gd::PlatformExtension
{
    public :

    SpriteExtension();
    virtual ~SpriteExtension() {};
};

}
#endif // SPRITEEXTENSION_H
