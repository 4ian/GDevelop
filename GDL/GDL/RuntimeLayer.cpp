#include "RuntimeLayer.h"
#include "GDL/Layer.h"
#include <SFML/Graphics.hpp>

RuntimeCamera RuntimeLayer::badCamera;

RuntimeLayer::RuntimeLayer(gd::Layer & layer, const sf::View & defaultView) :
    name(layer.GetName()),
    isVisible(layer.GetVisibility())
{
    for (unsigned int i = 0;i<layer.GetCameraCount();++i)
        cameras.push_back(RuntimeCamera(layer.GetCamera(i), defaultView));
}

RuntimeCamera::RuntimeCamera(sf::View & view) :
    width(view.getSize().x),
    height(view.getSize().y),
    angle(0),
    zoomFactor(1)
{
    sfmlView = view;
}

RuntimeCamera::RuntimeCamera(gd::Camera & camera, const sf::View & defaultView) :
    width(defaultView.getSize().x),
    height(defaultView.getSize().y),
    angle(0),
    zoomFactor(1)
{
    sfmlView = defaultView;
    if ( !camera.UseDefaultViewport() ) {
        sfmlView.setViewport(sf::FloatRect(camera.GetViewportX1(),
                                           camera.GetViewportY1(),
                                           camera.GetViewportX2()-camera.GetViewportX1(),
                                           camera.GetViewportY2()-camera.GetViewportY2()));
    }


    if ( !camera.UseDefaultSize() ) {
        width = camera.GetWidth();
        height = camera.GetHeight();
        sfmlView.setSize(sf::Vector2f(width, height));
    }
}

void RuntimeCamera::SetZoom(float newZoom)
{
    if (newZoom == 0) return;

    zoomFactor = newZoom;
    sfmlView.setSize(sf::Vector2f(width/zoomFactor, height/zoomFactor));
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
    width = width_;
    height = height_;
    sfmlView.setSize(width, height);
}

void RuntimeCamera::SetViewport(float x1, float y1, float x2, float y2)
{
    sfmlView.setViewport(sf::FloatRect(x1, y1, x2-x1,y2-y1));
}
