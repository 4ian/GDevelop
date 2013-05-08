#ifndef VARIABLESEXTENSION_H
#define VARIABLESEXTENSION_H

#include "GDCore/PlatformDefinition/PlatformExtension.h"

/**
 * \brief Built-in extension providing actions/conditions and expressions for scene variables.
 *
 * \ingroup BuiltinExtensions
 */
class VariablesExtension : public gd::PlatformExtension
{
    public :

    VariablesExtension();
    virtual ~VariablesExtension() {};
};

#endif // VARIABLESEXTENSION_H
