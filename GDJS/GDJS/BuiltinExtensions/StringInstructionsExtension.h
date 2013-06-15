#ifndef STRINGINSTRUCTIONSEXTENSION_H
#define STRINGINSTRUCTIONSEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"


/**
 * \brief Built-in extension providing common functions for strings.
 *
 * \ingroup BuiltinExtensions
 */
class StringInstructionsExtension : public gd::PlatformExtension
{
public :

    StringInstructionsExtension();
    virtual ~StringInstructionsExtension() {};
};

#endif // STRINGINSTRUCTIONSEXTENSION_H
