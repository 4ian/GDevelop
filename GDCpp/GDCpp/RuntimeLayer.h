/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef RUNTIMELAYER_H
#define RUNTIMELAYER_H
#include <SFML/Graphics.hpp>
#include "GDCpp/String.h"
namespace gd { class Camera; }
namespace gd { class Layer; }

/**
 * \brief A camera which is displayed on a part of a window ( see Viewport related methods )
 * rendering an area of the scene.
 *
 * \ingroup GameEngine
 */
class GD_API RuntimeCamera
{
public:
    /**
     * Construct a runtime camera from a nothing.
     *
     * \warning This constructor should not be used: See the two other alternatives.
     */
    RuntimeCamera() : originalWidth(0), originalHeight(0),angle(0), zoomFactor(1) {};

    /**
     * Construct a runtime camera from a sf::View ( The SFML equivalent of a camera ).
     */
    RuntimeCamera(sf::View & view);

    /**
     * Construct a runtime camera from a Camera and a default view.
     */
    RuntimeCamera(gd::Camera & camera, const sf::View & defaultView);

    /**
     * Provide a read only access to the sf::View associated with the camera.
     */
    const sf::View & GetSFMLView() const { return sfmlView; };

    /**
     * Change the zoom of the camera.
     */
    void SetZoom(float newZoom);

    /**
     * Get the zoom of the camera
     */
    float GetZoom() const { return zoomFactor; };

    /**
     * Set the rotation of the camera.
     * \param newAngle the new angle of the camera, in radians.
     */
    void SetRotation(float newAngle);

    /**
     * Get the rotation of the camera
     */
    float GetRotation() const { return angle; };

    /**
     * Change the position of the view on the scene.
     */
    void SetViewCenter(const sf::Vector2f & newCenter);

    /**
     * Get the position of the view on the scene.
     */
    const sf::Vector2f & GetViewCenter() const {return sfmlView.getCenter(); };

    /**
     * Change the size of the rendered area of the scene.
     * Zoom is reset to 1.
     */
    void SetSize(float width, float height);

    /**
     * Get the width of the rendered area
     */
    float GetWidth() const { return zoomFactor != 0 ? originalWidth*1.0/zoomFactor : 0; };

    /**
     * Get the height of the rendered area
     */
    float GetHeight() const { return zoomFactor != 0 ? originalHeight*1.0/zoomFactor : 0; };

    /**
     * Change the position of the view on the scene.
     */
    void SetViewport(float x1, float y1, float x2, float y2);

private:

    float originalWidth;
    float originalHeight;
    float angle; ///< Angle of the camera
    float zoomFactor; ///< Zoom factor of the camera

    sf::View sfmlView; ///< The sf::View which is the SFML equivalent of a camera.
};

/**
 * \brief A layer of a layout, used to display objects using RuntimeCamera.
 *
 * \ingroup GameEngine
 */
class GD_API RuntimeLayer
{
public:
    RuntimeLayer() : isVisible(true) {};
    RuntimeLayer(gd::Layer & layer, const sf::View & defaultView);
    virtual ~RuntimeLayer() {};

    /**
     * Change layer name
     */
    virtual void SetName(const gd::String & name_) { name = name_; }

    /**
     * Get layer name
     */
    virtual const gd::String & GetName() const { return name; }

    /**
     * Change if layer is displayed or not
     */
    virtual void SetVisibility(bool isVisible_) { isVisible = isVisible_; }

    /**
     * True if layer will be displayed.
     */
    virtual bool GetVisibility() const { return isVisible; }

    /**
     * Get cameras count.
     */
    inline std::size_t GetCameraCount() const { return cameras.size(); };

    /**
     * Return a reference to a camera
     */
    inline const RuntimeCamera & GetCamera(std::size_t n) const { return cameras[n]; }

    /**
     * Return a reference to a camera
     */
    inline RuntimeCamera & GetCamera(std::size_t n) { return cameras[n]; }

    /**
     * Delete a specific camera.
     */
    inline void DeleteCamera(std::size_t n) { if ( n < cameras.size() ) cameras.erase(cameras.begin()+n); }

    /**
     * Add an already existing camera.
     */
    inline void AddCamera(const RuntimeCamera & camera) { cameras.push_back(camera); };

private:

    gd::String name; ///< The name of the layer
    bool isVisible; ///< True if the layer is visible
    std::vector < RuntimeCamera > cameras; ///< The camera displayed by the layer
};

#endif // RUNTIMELAYER_H
