/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "RuntimeSceneCameraTools.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeLayer.h"
#include "GDCpp/Runtime/Window/RenderingWindow.h"

float GD_API GetCameraX(RuntimeScene & scene, const gd::String & layer, std::size_t camera)
{
    if(camera >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return 0.f;

    const sf::View & view = scene.GetRuntimeLayer(layer).GetCamera(camera).GetSFMLView();
    return view.getCenter().x;
}

float GD_API GetCameraY(RuntimeScene & scene, const gd::String & layer, std::size_t camera)
{
    if(camera >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return 0.f;
    const sf::View & view = scene.GetRuntimeLayer(layer).GetCamera(camera).GetSFMLView();
    return view.getCenter().y;
}

void GD_API SetCameraX(RuntimeScene & scene, float x, const gd::String & layer, std::size_t cameraId)
{
    if(cameraId >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return;

    RuntimeCamera & camera = scene.GetRuntimeLayer(layer).GetCamera(cameraId);
    camera.SetViewCenter(sf::Vector2f(x, camera.GetViewCenter().y));
}

void GD_API SetCameraY(RuntimeScene & scene, float y, const gd::String & layer, std::size_t cameraId)
{
    if(cameraId >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return;

    RuntimeCamera & camera = scene.GetRuntimeLayer(layer).GetCamera(cameraId);
    camera.SetViewCenter(sf::Vector2f(camera.GetViewCenter().x, y));
}

double GD_API GetCameraAngle(RuntimeScene & scene, const gd::String & layer, std::size_t camera)
{
    if(camera >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return 0.f;

    return scene.GetRuntimeLayer(layer).GetCamera(camera).GetRotation();
}

void GD_API SetCameraAngle(RuntimeScene & scene, float newValue, const gd::String & layer, std::size_t camera)
{
    if(camera >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return;

    return scene.GetRuntimeLayer(layer).GetCamera(camera).SetRotation(newValue);
}

void GD_API SetCameraZoom(RuntimeScene & scene, float newZoom, const gd::String & layer, std::size_t cameraNb)
{
    if(cameraNb >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return;

    scene.GetRuntimeLayer(layer).GetCamera(cameraNb).SetZoom(newZoom);
}

double GD_API GetCameraWidth(RuntimeScene & scene, const gd::String & layer, std::size_t camera)
{
    if(camera >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return 0.f;

    return scene.GetRuntimeLayer(layer).GetCamera(camera).GetWidth();
}

double GD_API GetCameraHeight(RuntimeScene & scene, const gd::String & layer, std::size_t camera)
{
    if(camera >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return 0.f;

    return scene.GetRuntimeLayer(layer).GetCamera(camera).GetHeight();
}

double GD_API GetCameraViewportLeft(RuntimeScene & scene, const gd::String & layer, std::size_t camera)
{
    if(camera >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return 0.f;

    return scene.GetRuntimeLayer(layer).GetCamera(camera).GetSFMLView().getViewport().left;
}

double GD_API GetCameraViewportTop(RuntimeScene & scene, const gd::String & layer, std::size_t camera)
{
    if(camera >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return 0.f;

    return scene.GetRuntimeLayer(layer).GetCamera(camera).GetSFMLView().getViewport().top;
}

double GD_API GetCameraViewportRight(RuntimeScene & scene, const gd::String & layer, std::size_t camera)
{
    if(camera >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return 0.f;

    const sf::FloatRect & sfmlViewport = scene.GetRuntimeLayer(layer).GetCamera(camera).GetSFMLView().getViewport();

    return sfmlViewport.left+sfmlViewport.width;
}

double GD_API GetCameraViewportBottom(RuntimeScene & scene, const gd::String & layer, std::size_t camera)
{
    if(camera >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return 0.f;

    const sf::FloatRect & sfmlViewport = scene.GetRuntimeLayer(layer).GetCamera(camera).GetSFMLView().getViewport();

    return sfmlViewport.top+sfmlViewport.height;
}

/**
 * Change the size of a camera and reset the zoom factor.
 */
void GD_API SetCameraSize( RuntimeScene & scene, const gd::String & layer, std::size_t cameraNb, float width, float height)
{
    if(cameraNb >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return;

    scene.GetRuntimeLayer(layer).GetCamera(cameraNb).SetZoom(1);
    scene.GetRuntimeLayer(layer).GetCamera(cameraNb).SetSize(width, height);
}

void GD_API CenterCameraOnObjectWithLimits(RuntimeScene & scene, RuntimeObject * object, float left, float top, float right, float bottom, bool anticipateObjectMove, const gd::String & layer, std::size_t camera)
{
    if ( object == NULL ) return;

    if(camera >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return;

    float xOffset = 0;
    float yOffset = 0;
    double elapsedTime = static_cast<double>(object->GetElapsedTime(scene)) / 1000000.0;
    if (anticipateObjectMove)
    {
        xOffset = object->TotalForceX() * elapsedTime;
        yOffset = object->TotalForceY() * elapsedTime;
    }

    RuntimeCamera & cam = scene.GetRuntimeLayer(layer).GetCamera(camera);

    double newX = std::min(std::max(object->GetDrawableX() + object->GetCenterX() + xOffset, left+cam.GetWidth()/2), right-cam.GetWidth()/2);
    double newY = std::min(std::max(object->GetDrawableY() + object->GetCenterY() + yOffset, top+cam.GetHeight()/2), bottom-cam.GetHeight()/2);

    cam.SetViewCenter(sf::Vector2f(newX, newY));

    return;
}

void GD_API CenterCameraOnObject(RuntimeScene & scene, RuntimeObject * object,  bool anticipateObjectMove, const gd::String & layer, std::size_t camera)
{
    if ( object == NULL ) return;

    if(camera >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return;

    float xOffset = 0;
    float yOffset = 0;
    double elapsedTime = static_cast<double>(object->GetElapsedTime(scene)) / 1000000.0;
    if (anticipateObjectMove)
    {
        xOffset = object->TotalForceX() * elapsedTime;
        yOffset = object->TotalForceY() * elapsedTime;
    }

    scene.GetRuntimeLayer(layer).GetCamera(camera).SetViewCenter(sf::Vector2f(object->GetDrawableX() + object->GetCenterX() + xOffset,
                                                                              object->GetDrawableY() + object->GetCenterY() + yOffset));

    return;
}

/**
 * Delete a camera of a layer
 */
void GD_API ActDeleteCamera(RuntimeScene & scene, const gd::String & layerName, std::size_t camera)
{
    if(camera >= scene.GetRuntimeLayer(layerName).GetCameraCount())
        return;

    scene.GetRuntimeLayer(layerName).DeleteCamera(camera);
}

/**
 * Add a camera to a layer
 */
void GD_API AddCamera( RuntimeScene & scene, const gd::String & layerName, float width, float height, float viewportLeft, float viewportTop, float viewportRight, float viewportBottom )
{
    //Create the new view
    const gd::RenderingWindow * window = scene.renderWindow;
    sf::View view = window ? window->GetRenderingTarget().getDefaultView() : sf::View();

    //Setup the viewport and the view
    if ( viewportBottom != 0 && viewportLeft != 0 && viewportRight != 0 && viewportTop != 0) {
        sf::FloatRect newViewport(viewportLeft, viewportTop, viewportRight - viewportLeft, viewportBottom - viewportTop);
        view.setViewport(newViewport);
    }
    if ( width != 0 || height != 0) {
        view.setSize(sf::Vector2f(width, height));
    }

    //Add the runtime camera to the layer
    scene.GetRuntimeLayer(layerName).AddCamera(RuntimeCamera(view));
    return;
}

void GD_API SetCameraViewport( RuntimeScene & scene,  const gd::String & layer, std::size_t cameraNb, float viewportLeft, float viewportTop, float viewportRight, float viewportBottom )
{
    if(cameraNb >= scene.GetRuntimeLayer(layer).GetCameraCount())
        return;

    RuntimeCamera & camera = scene.GetRuntimeLayer(layer).GetCamera(cameraNb);
    camera.SetViewport(viewportLeft, viewportTop, viewportRight, viewportBottom);
}

double GD_API GetLayerTimeScale(RuntimeScene & scene, const gd::String & layer)
{
    return scene.GetRuntimeLayer(layer).GetTimeScale();
}

void GD_API SetLayerTimeScale(RuntimeScene & scene, const gd::String & layer, double timeScale)
{
    scene.GetRuntimeLayer(layer).SetTimeScale(timeScale);
}
