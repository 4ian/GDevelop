#ifndef SPRITEEXTENSION_H
#define SPRITEEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

/**
 * \brief Built-in extension providing SpriteObject objects.
 *
 * \ingroup BuiltinExtensions
 */
class SpriteExtension : public gd::PlatformExtension
{
    public :

    SpriteExtension();
    virtual ~SpriteExtension() {};
};

#endif // SPRITEEXTENSION_H
