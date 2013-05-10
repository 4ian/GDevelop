#ifndef KEYBOARDEXTENSION_H
#define KEYBOARDEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

/**
 * \brief Built-in extension providing functions related the keyboard
 *
 * \ingroup BuiltinExtensions
 */
class KeyboardExtension : public gd::PlatformExtension
{
public :

    KeyboardExtension();
    virtual ~KeyboardExtension() {};
};

#endif // KEYBOARDEXTENSION_H
