/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "RuntimeSceneCameraTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Camera.h"
#include "GDL/Object.h"

float GD_API GetCameraX(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    const sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();
    return view.getCenter().x-view.getSize().x/2;
}

float GD_API GetCameraY(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    const sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();
    return view.getCenter().y-view.getSize().y/2;
}

void GD_API SetCameraX(RuntimeScene & scene, float x, const std::string & layer, unsigned int cameraId)
{
    Camera & camera = scene.GetLayer(layer).GetCamera(cameraId);
    camera.SetViewCenter(sf::Vector2f(x+camera.GetSize().x/2, camera.GetViewCenter().y));
}

void GD_API SetCameraY(RuntimeScene & scene, float y, const std::string & layer, unsigned int cameraId)
{
    Camera & camera = scene.GetLayer(layer).GetCamera(cameraId);
    camera.SetViewCenter(sf::Vector2f(camera.GetViewCenter().x, y+camera.GetSize().y/2));
}

double GD_API GetCameraAngle(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    return scene.GetLayer(layer).GetCamera(camera).GetRotation();
}

void GD_API SetCameraAngle(RuntimeScene & scene, float newValue, const std::string & layer, unsigned int camera)
{
    return scene.GetLayer(layer).GetCamera(camera).SetRotation(newValue);
}

void GD_API SetCameraZoom(RuntimeScene & scene, float newZoom, const std::string & layer, unsigned int cameraNb)
{
    scene.GetLayer(layer).GetCamera(cameraNb).SetZoom(newZoom);
}

double GD_API GetCameraWidth(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    return scene.GetLayer(layer).GetCamera(camera).GetSize().x;
}

double GD_API GetCameraHeight(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    return scene.GetLayer(layer).GetCamera(camera).GetSize().y;
}


double GD_API GetCameraViewportLeft(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    return scene.GetLayer(layer).GetCamera(camera).GetViewport().left;
}

double GD_API GetCameraViewportTop(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    return scene.GetLayer(layer).GetCamera(camera).GetViewport().top;
}

double GD_API GetCameraViewportRight(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    const sf::FloatRect & sfmlViewport = scene.GetLayer(layer).GetCamera(camera).GetViewport();

    return sfmlViewport.left+sfmlViewport.width;
}

double GD_API GetCameraViewportBottom(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    const sf::FloatRect & sfmlViewport = scene.GetLayer(layer).GetCamera(camera).GetViewport();

    return sfmlViewport.top+sfmlViewport.height;
}

/**
 * Change the size of a camera and reset the zoom factor.
 */
void GD_API SetCameraSize( RuntimeScene & scene, const std::string & layer, unsigned int cameraNb, float width, float height)
{
    scene.GetLayer(layer).GetCamera(cameraNb).SetZoom(1);
    scene.GetLayer(layer).GetCamera(cameraNb).SetSize(sf::Vector2f(width, height));
}

void GD_API CenterCameraOnObjectWithLimits(RuntimeScene & scene, const std::string &, Object* object, float left, float top, float right, float bottom, bool anticipateObjectMove, const std::string & layer, unsigned int camera)
{
    if ( object == NULL ) return;

    float decalementX = 0;
    float decalementY = 0;

    //Prise en compte des déplacements de l'objet
    if ( anticipateObjectMove )
    {
        decalementX = ( object->TotalForceX() * static_cast<double>(scene.GetElapsedTime())/1000.0f );
        decalementY = ( object->TotalForceY() * static_cast<double>(scene.GetElapsedTime())/1000.0f );
    }

    //Si on est dans le cadre
    if ( object->GetX() > left
        && object->GetX() < right
        && object->GetY() > top
        && object->GetY() < bottom
        )
    {
        scene.GetLayer(layer).GetCamera(camera).SetViewCenter(sf::Vector2f(object->GetX() + decalementX, object->GetY() + decalementY));
    }

    //Si on n'est pas dedans.
    if ( ( object->GetX() < left
        || object->GetX() > right )
        && object->GetY() > top
        && object->GetY() < bottom )

    {
        scene.GetLayer(layer).GetCamera(camera).SetViewCenter(sf::Vector2f(scene.GetLayer(layer).GetCamera(camera).GetViewCenter().x,
                                                                           object->GetY() + decalementY));
    }
    if ( ( object->GetY() < top
        || object->GetY() > bottom )
        && object->GetX() > left
        && object->GetX() < right)
    {
        scene.GetLayer(layer).GetCamera(camera).SetViewCenter(sf::Vector2f(object->GetX() + decalementX,
                                                                           scene.GetLayer(layer).GetCamera(camera).GetViewCenter().y));
    }

    return;
}

void GD_API CenterCameraOnObject(RuntimeScene & scene, const std::string &, Object * object,  bool anticipateObjectMove, const std::string & layer, unsigned int camera)
{
    if ( object == NULL ) return;

    float decalementX = 0;
    float decalementY = 0;

    //Prise en compte des déplacements de l'objet
    if ( anticipateObjectMove )
    {
        decalementX = ( object->TotalForceX() * static_cast<double>(scene.GetElapsedTime())/1000.0f );
        decalementY = ( object->TotalForceY() * static_cast<double>(scene.GetElapsedTime())/1000.0f );
    }

    scene.GetLayer(layer).GetCamera(camera).SetViewCenter(sf::Vector2f(object->GetX() + decalementX, object->GetY() + decalementY));

    return;
}

/**
 * Delete a camera of a layer
 */
void GD_API ActDeleteCamera(RuntimeScene & scene, const std::string & layerName, unsigned int camera)
{
    scene.GetLayer(layerName).DeleteCamera(camera);
}

/**
 * Add a camera to a layer
 */
void GD_API AddCamera( RuntimeScene & scene, const std::string & layerName, float width, float height, float viewportLeft, float viewportTop, float viewportRight, float viewportBottom )
{
    Layer & layer = scene.GetLayer(layerName);
    Camera camera;

    if ( width == 0 && height == 0)
        camera.SetUseDefaultSize(true);
    else
    {
        camera.SetUseDefaultSize(false);
        camera.SetSize(sf::Vector2f(width, height));
    }

    if ( viewportBottom == 0 && viewportLeft == 0 && viewportRight == 0 && viewportTop == 0)
        camera.SetUseDefaultViewport(true);
    else
    {
        camera.SetUseDefaultViewport(false);
        sf::FloatRect newViewport(viewportLeft, viewportTop, viewportRight - camera.GetViewport().left, viewportBottom - camera.GetViewport().top);
        camera.SetViewport(newViewport);
    }

    const sf::RenderWindow * window = scene.renderWindow;
    camera.InitializeSFMLView(window ? window->getDefaultView() : sf::View() );

    //Add the runtime camera to the layer
    layer.AddCamera(camera);
    return;
}

void GD_API SetCameraViewport( RuntimeScene & scene,  const std::string & layer, unsigned int cameraNb, float viewportLeft, float viewportTop, float viewportRight, float viewportBottom )
{
    Camera & camera = scene.GetLayer(layer).GetCamera(cameraNb);

    camera.SetUseDefaultViewport(false);
    sf::FloatRect newViewport(viewportLeft, viewportTop, viewportRight - camera.GetViewport().left, viewportBottom - camera.GetViewport().top);
    camera.SetViewport(newViewport);
}

