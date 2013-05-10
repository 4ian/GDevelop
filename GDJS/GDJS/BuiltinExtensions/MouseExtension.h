#ifndef MOUSEEXTENSION_H
#define MOUSEEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

/**
 * \brief Built-in extension providing functions related the mouse
 *
 * \ingroup BuiltinExtensions
 */
class MouseExtension : public gd::PlatformExtension
{
public :

    MouseExtension();
    virtual ~MouseExtension() {};
};

#endif // MOUSEEXTENSION_H
