#ifndef RUNTIMECAMERA_H
#define RUNTIMECAMERA_H

#include "GDL/Camera.h"

/**
 * Camera used during runtime.
 */
class GD_API RuntimeCamera
{
    public:
        RuntimeCamera() {};
        RuntimeCamera(const Camera & camera, const sf::View & defaultView);
        virtual ~RuntimeCamera();

        inline const sf::View & GetSFMLView() const { return sfmlView; };
        inline sf::View & GetSFMLView() { return sfmlView; };
    protected:
    private:

        Camera associatedCamera;
        sf::View sfmlView; ///< A RuntimeCamera is associated with a sf::View.
};

#endif // RUNTIMECAMERA_H
