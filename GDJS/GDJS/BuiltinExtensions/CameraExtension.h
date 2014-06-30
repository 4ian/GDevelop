/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef CAMERAEXTENSION_H
#define CAMERAEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing SpriteObject objects.
 *
 * \ingroup BuiltinExtensions
 */
class CameraExtension : public gd::PlatformExtension
{
public :

    CameraExtension();
    virtual ~CameraExtension() {};
};

}
#endif // CAMERAEXTENSION_H
