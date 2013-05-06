#ifndef BASEOBJECTEXTENSION_H
#define BASEOBJECTEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

/**
 * \brief Built-in extension providing functions for all objects
 *
 * \ingroup BuiltinExtensions
 */
class BaseObjectExtension : public gd::PlatformExtension
{
    public :

    BaseObjectExtension();
    virtual ~BaseObjectExtension() {};
};

#endif // BASEOBJECTEXTENSION_H
