#ifndef RUNTIMECAMERA_H
#define RUNTIMECAMERA_H

#include "GDL/Camera.h"

/**
 * \brief Class representing a camera used during runtime.
 *
 * \ingroup GameEngine
 */
class GD_API RuntimeCamera
{
    public:
        RuntimeCamera() {};

        /**
         * Create a runtime camera from a camera, and a defaultView which can
         * be provided by a SFML window, used for default size.
         */
        RuntimeCamera(const Camera & camera, const sf::View & defaultView);
        virtual ~RuntimeCamera();

        inline const sf::View & GetSFMLView() const { return sfmlView; };
        inline sf::View & GetSFMLView() { return sfmlView; };

        inline const Camera & GetCameraInfo() const { return associatedCamera; };
        inline Camera & GetCameraInfo() { return associatedCamera; };

    protected:
    private:

        Camera associatedCamera;
        sf::View sfmlView; ///< A RuntimeCamera is associated with a sf::View.
};

#endif // RUNTIMECAMERA_H
