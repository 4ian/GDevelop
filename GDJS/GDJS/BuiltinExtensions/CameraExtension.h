#ifndef CAMERAEXTENSION_H
#define CAMERAEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

/**
 * \brief Built-in extension providing SpriteObject objects.
 *
 * \ingroup BuiltinExtensions
 */
class CameraExtension : public gd::PlatformExtension
{
public :

    CameraExtension();
    virtual ~CameraExtension() {};
};

#endif // CAMERAEXTENSION_H
