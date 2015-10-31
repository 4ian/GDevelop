#ifndef BUILTINEXTENSION_H
#define BUILTINEXTENSION_H

#include "GDCpp/Extensions/ExtensionBase.h"

/**
 * \brief Standard extension providing features for all objects
 *
 * \ingroup BuiltinExtensions
 */
class GD_API BaseObjectExtension : public ExtensionBase
{
public:
    BaseObjectExtension();
    virtual ~BaseObjectExtension() {};
};

#endif // BUILTINEXTENSION_H

