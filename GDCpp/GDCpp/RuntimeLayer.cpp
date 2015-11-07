/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "RuntimeLayer.h"
#include "GDCpp/Project/Layer.h"
#include <SFML/Graphics.hpp>

RuntimeLayer::RuntimeLayer(gd::Layer & layer, const sf::View & defaultView) :
    name(layer.GetName()),
    isVisible(layer.GetVisibility())
{
    for (std::size_t i = 0;i<layer.GetCameraCount();++i)
        cameras.push_back(RuntimeCamera(layer.GetCamera(i), defaultView));
}

RuntimeCamera::RuntimeCamera(sf::View & view) :
    originalWidth(view.getSize().x),
    originalHeight(view.getSize().y),
    angle(0),
    zoomFactor(1)
{
    sfmlView = view;
}

RuntimeCamera::RuntimeCamera(gd::Camera & camera, const sf::View & defaultView) :
    originalWidth(defaultView.getSize().x),
    originalHeight(defaultView.getSize().y),
    angle(0),
    zoomFactor(1)
{
    sfmlView = defaultView;
    if ( !camera.UseDefaultViewport() ) {
        sfmlView.setViewport(sf::FloatRect(camera.GetViewportX1(),
                                           camera.GetViewportY1(),
                                           camera.GetViewportX2()-camera.GetViewportX1(),
                                           camera.GetViewportY2()-camera.GetViewportY1()));
    }


    if ( !camera.UseDefaultSize() ) {
        originalWidth = camera.GetWidth();
        originalHeight = camera.GetHeight();
        sfmlView.setSize(sf::Vector2f(originalWidth, originalHeight));
    }
}

void RuntimeCamera::SetZoom(float newZoom)
{
    if (newZoom == 0) return;

    zoomFactor = newZoom;
    sfmlView.setSize(sf::Vector2f(originalWidth/zoomFactor, originalHeight/zoomFactor));
}

void RuntimeCamera::SetRotation(float newAngle)
{
    angle = newAngle;
    sfmlView.setRotation(angle);
}

void RuntimeCamera::SetViewCenter(const sf::Vector2f & newCenter)
{
    sfmlView.setCenter(newCenter);
}

void RuntimeCamera::SetSize(float width_, float height_)
{
    originalWidth = width_;
    originalHeight = height_;
    sfmlView.setSize(originalWidth, originalHeight);
    zoomFactor = 1;
}

void RuntimeCamera::SetViewport(float x1, float y1, float x2, float y2)
{
    sfmlView.setViewport(sf::FloatRect(x1, y1, x2-x1,y2-y1));
}
