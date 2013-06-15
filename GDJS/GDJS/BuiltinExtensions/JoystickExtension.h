#ifndef JOYSTICKEXTENSION_H
#define JOYSTICKEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

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

#endif // JOYSTICKEXTENSION_H
