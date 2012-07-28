/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CAMERA_H
#define CAMERA_H
#include <SFML/Graphics.hpp>

/**
 * \brief A camera is used to render a specific area of a scene.
 *
 * \ingroup GameEngine
 */
class GD_API Camera
{
public:
    Camera();
    virtual ~Camera() {};

    /**
     * Initialize the sfmlView members using the others members and the default view provided
     *
     * Called by RuntimeScene at loading.
     */
    void InitializeSFMLView(const sf::View & defaultView);

    void SetViewport(sf::FloatRect newViewport);
    const sf::FloatRect & GetViewport() const { return viewport; };

    void SetSize(sf::Vector2f newSize);
    const sf::Vector2f & GetSize() const { return size; };

    void SetUseDefaultSize(bool useDefaultSize = true);
    bool UseDefaultSize() const {return defaultSize;}

    void SetUseDefaultViewport(bool useDefaultViewport = true);
    bool UseDefaultViewport() const {return defaultViewport;}

    void SetZoom(float newZoom);
    float GetZoom() const { return zoomFactor; };

    void SetRotation(float newAngle);
    float GetRotation() const { return angle; };

    void SetViewCenter(const sf::Vector2f & newCenter);
    const sf::Vector2f & GetViewCenter() const {return sfmlView.GetCenter(); };

    /**
     * Provide a read only access to the sf::View associated with the camera.
     * The sf::View is valid only if InitializeSFMLView has been called.
     */
    const sf::View & GetSFMLView() const { return sfmlView; };

private:

    bool defaultSize; ///< True if the camera use the default window size
    bool defaultViewport; ///< True if the camera use the default viewport size

    sf::FloatRect viewport; ///< Viewport, the position where the camera must be rendered in the window. Used as a factor the window size.
    sf::Vector2f size; ///< Size of the area

    float angle; ///< Angle of the camera
    float zoomFactor; ///< Zoom factor of the camera

    sf::View sfmlView; ///< On runtime, a camera is associated with a sf::View. The caller is responsible for updating the other members if changes are made to the sfmlView ( and vice-versa )
    bool sfmlViewInitialized; ///< False when the object is constructed, true as soon as InitializeSFMLView is called. If true, it means that method like SetSize will also update the sfmlView.
};

#endif // CAMERA_H
