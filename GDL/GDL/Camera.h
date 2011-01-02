/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CAMERA_H
#define CAMERA_H
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>

/**
 * A camera is used to render the scene.
 */
class GD_API Camera
{
    public:
        Camera();
        virtual ~Camera() {};

        bool defaultSize;
        bool defaultViewport;

        sf::FloatRect viewport;
        sf::Vector2f size;

    protected:
    private:
};

#endif // CAMERA_H
