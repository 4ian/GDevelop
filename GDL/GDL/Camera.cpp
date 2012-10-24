/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Camera.h"

Camera::Camera() :
defaultSize(true),
defaultViewport(true),
viewport(0,0,1,1),
size(0,0),
angle(0),
zoomFactor(1)
{
}

void Camera::InitializeSFMLView(const sf::View & defaultView)
{
    sfmlView = defaultView;
    if ( defaultViewport ) viewport = sf::FloatRect(0,0,1,1); //Default viewport : Make sure viewport datas are correct
    sfmlView.setViewport(viewport);

    if ( defaultSize ) size = defaultView.getSize();
    sfmlView.setSize(sf::Vector2f(size.x/zoomFactor, size.y/zoomFactor));

    sfmlViewInitialized = true;
}

void Camera::SetViewport(sf::FloatRect newViewport)
{
    viewport = newViewport;
    if ( sfmlViewInitialized ) sfmlView.setViewport(viewport);
}

void Camera::SetSize(sf::Vector2f newSize)
{
    size = newSize;
    if ( sfmlViewInitialized ) sfmlView.setSize(sf::Vector2f(size.x/zoomFactor, size.y/zoomFactor));
}

void Camera::SetZoom(float newZoom)
{
    if (newZoom == 0) return;

    zoomFactor = newZoom;
    if ( sfmlViewInitialized ) sfmlView.setSize(sf::Vector2f(size.x/zoomFactor, size.y/zoomFactor));
}

void Camera::SetRotation(float newAngle)
{
    angle = newAngle;
    if ( sfmlViewInitialized ) sfmlView.setRotation(angle);
}

void Camera::SetViewCenter(const sf::Vector2f & newCenter)
{
    if ( sfmlViewInitialized ) sfmlView.setCenter(newCenter);
}

void Camera::SetUseDefaultViewport(bool useDefaultViewport)
{
    defaultViewport = useDefaultViewport;
}

void Camera::SetUseDefaultSize(bool useDefaultSize)
{
    defaultSize = useDefaultSize;
}

