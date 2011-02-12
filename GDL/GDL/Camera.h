/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CAMERA_H
#define CAMERA_H
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>

/**
 * A camera is used to change the area of a scene to be rendered.
 */
class GD_API Camera
{
    public:
        Camera();
        virtual ~Camera() {};

        bool defaultSize; ///< True if the camera use the default window size
        bool defaultViewport; ///< True if the camera use the default viewport size

        sf::FloatRect viewport; ///< Viewport, the position where the camera must be rendered in the window. Used as a factor the window size.
        sf::Vector2f size; ///< Size of the area
};

#endif // CAMERA_H
