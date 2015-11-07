/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef JOYSTICKEXTENSION_H
#define JOYSTICKEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

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
