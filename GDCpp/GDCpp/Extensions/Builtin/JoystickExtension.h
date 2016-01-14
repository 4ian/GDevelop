/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef JOYSTICKEXTENSION_H
#define JOYSTICKEXTENSION_H

#include "GDCpp/Extensions/ExtensionBase.h"

/**
 * \brief Internal built-in extension providing joysticks features
 *
 * \ingroup BuiltinExtensions
 */
class JoystickExtension : public ExtensionBase
{
    public:
        JoystickExtension();
        virtual ~JoystickExtension() {};
    protected:
    private:
};

#endif // JOYSTICKEXTENSION_H

