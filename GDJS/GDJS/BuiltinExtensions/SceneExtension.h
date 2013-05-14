#ifndef SCENEEXTENSION_H
#define SCENEEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

/**
 * \brief Built-in extension providing common functions.
 *
 * \ingroup BuiltinExtensions
 */
class SceneExtension : public gd::PlatformExtension
{
    public :

    SceneExtension();
    virtual ~SceneExtension() {};
};

#endif // SCENEEXTENSION_H
