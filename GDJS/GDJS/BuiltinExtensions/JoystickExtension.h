/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef JOYSTICKEXTENSION_H
#define JOYSTICKEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{
/**
 * \brief Built-in extension providing functions related joysticks
 *
 * \ingroup BuiltinExtensions
 */
class JoystickExtension : public gd::PlatformExtension
{
public :

    JoystickExtension();
    virtual ~JoystickExtension() {};
};

}
#endif // JOYSTICKEXTENSION_H
