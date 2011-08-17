/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "RuntimeSceneCameraTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/RuntimeCamera.h"

float GD_API GetCameraX(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    const sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();
    return view.GetCenter().x-view.GetSize().x/2;
}

float GD_API GetCameraY(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    const sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();
    return view.GetCenter().y-view.GetSize().y/2;
}

void GD_API SetCameraX(RuntimeScene & scene, float x, const std::string & layer, unsigned int camera)
{
    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();
    return view.SetCenter(x+view.GetSize().x/2, view.GetCenter().y);
}

void GD_API SetCameraY(RuntimeScene & scene, float y, const std::string & layer, unsigned int camera)
{
    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();
    return view.SetCenter(view.GetCenter().x, y+view.GetSize().y/2);
}

double GD_API GetCameraAngle(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    return scene.GetLayer(layer).GetCamera(camera).GetSFMLView().GetRotation();
}

void GD_API SetCameraAngle(RuntimeScene & scene, float newValue, const std::string & layer, unsigned int camera)
{
    return scene.GetLayer(layer).GetCamera(camera).GetSFMLView().SetRotation(newValue);
}

void GD_API SetCameraZoom(RuntimeScene & scene, float newZoom, const std::string & layer, unsigned int cameraNb)
{
    RuntimeCamera & camera = scene.GetLayer(layer).GetCamera(cameraNb);

    if ( newZoom == 0 ) return;

    camera.GetSFMLView().SetSize(camera.GetCameraInfo().size.x/newZoom, camera.GetCameraInfo().size.y/newZoom);
}

double GD_API GetCameraWidth(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    return scene.GetLayer(layer).GetCamera(camera).GetCameraInfo().size.x;
}

double GD_API GetCameraHeight(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    return scene.GetLayer(layer).GetCamera(camera).GetCameraInfo().size.y;
}


double GD_API GetCameraViewportLeft(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    return scene.GetLayer(layer).GetCamera(camera).GetCameraInfo().viewport.Left;
}

double GD_API GetCameraViewportTop(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    return scene.GetLayer(layer).GetCamera(camera).GetCameraInfo().viewport.Top;
}

double GD_API GetCameraViewportRight(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    const sf::FloatRect & sfmlViewport = scene.GetLayer(layer).GetCamera(camera).GetCameraInfo().viewport;

    return sfmlViewport.Left+sfmlViewport.Width;
}

double GD_API GetCameraViewportBottom(RuntimeScene & scene, const std::string & layer, unsigned int camera)
{
    const sf::FloatRect & sfmlViewport = scene.GetLayer(layer).GetCamera(camera).GetCameraInfo().viewport;

    return sfmlViewport.Top+sfmlViewport.Height;
}

/**
 * Change the size of a camera ( reset zoom )
 */
void GD_API SetCameraSize( RuntimeScene & scene, const std::string & layer, unsigned int cameraNb, float width, float height)
{
    RuntimeCamera & camera = scene.GetLayer(layer).GetCamera(cameraNb);

    camera.GetCameraInfo().defaultSize = false;
    camera.GetCameraInfo().size.x = width;
    camera.GetCameraInfo().size.y = height;
    camera.GetSFMLView().SetSize(camera.GetCameraInfo().size);
}

void GD_API CenterCameraOnObjectWithLimits(RuntimeScene & scene, const std::string &, Object* object, float left, float top, float right, float bottom, bool anticipateObjectMove, const std::string & layer, unsigned int camera)
{
    if ( object == NULL ) return;

    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();

    float decalementX = 0;
    float decalementY = 0;

    //Prise en compte des déplacements de l'objet
    if ( anticipateObjectMove )
    {
        decalementX = ( object->TotalForceX() * scene.GetElapsedTime() );
        decalementY = ( object->TotalForceY() * scene.GetElapsedTime() );
    }

    //Si on est dans le cadre
    if ( object->GetX() > left
        && object->GetX() < right
        && object->GetY() > top
        && object->GetY() < bottom
        )
    {
        view.SetCenter(object->GetX() + decalementX, object->GetY() + decalementY);
    }

    //Si on n'est pas dedans.
    if ( ( object->GetX() < left
        || object->GetX() > right )
        && object->GetY() > top
        && object->GetY() < bottom )

    {
        view.SetCenter(view.GetCenter().x, object->GetY() + decalementY);
    }
    if ( ( object->GetY() < top
        || object->GetY() > bottom )
        && object->GetX() > left
        && object->GetX() < right)
    {
        view.SetCenter(object->GetX() + decalementX, view.GetCenter().y);
    }

    return;
}

void GD_API CenterCameraOnObject(RuntimeScene & scene, const std::string &, Object * object,  bool anticipateObjectMove, const std::string & layer, unsigned int camera)
{
    if ( object == NULL ) return;

    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();

    float decalementX = 0;
    float decalementY = 0;

    //Prise en compte des déplacements de l'objet
    if ( anticipateObjectMove )
    {
        decalementX = ( object->TotalForceX() * scene.GetElapsedTime() );
        decalementY = ( object->TotalForceY() * scene.GetElapsedTime() );
    }

    view.SetCenter(object->GetX() + decalementX, object->GetY() + decalementY);

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
    RuntimeLayer & layer = scene.GetLayer(layerName);

    Camera cameraInfo;

    if ( width == 0 && height == 0)
        cameraInfo.defaultSize = true;
    else
    {
        cameraInfo.defaultSize = false;
        cameraInfo.size.x = width;
        cameraInfo.size.y = height;
    }

    if ( viewportBottom == 0 && viewportLeft == 0 && viewportRight == 0 && viewportTop == 0)
        cameraInfo.defaultViewport = true;
    else
    {
        cameraInfo.defaultViewport = false;
        cameraInfo.viewport.Left = viewportLeft;
        cameraInfo.viewport.Top = viewportTop;
        cameraInfo.viewport.Width = viewportRight - cameraInfo.viewport.Left;
        cameraInfo.viewport.Height = viewportBottom - cameraInfo.viewport.Top;
    }

    //Create a runtime camera from the camera
    const sf::RenderWindow * window = scene.renderWindow;
    RuntimeCamera camera(cameraInfo, window ? window->GetDefaultView() : sf::View() );

    //Add the runtime camera to the layer
    layer.AddCamera(camera);
    return;
}

void GD_API SetCameraViewport( RuntimeScene & scene,  const std::string & layer, unsigned int cameraNb, float viewportLeft, float viewportTop, float viewportRight, float viewportBottom )
{
    RuntimeCamera & camera = scene.GetLayer(layer).GetCamera(cameraNb);

    camera.GetCameraInfo().defaultViewport = false;
    camera.GetCameraInfo().viewport.Left = viewportLeft;
    camera.GetCameraInfo().viewport.Top = viewportTop;
    camera.GetCameraInfo().viewport.Width = viewportRight - camera.GetCameraInfo().viewport.Left;
    camera.GetCameraInfo().viewport.Height = viewportBottom - camera.GetCameraInfo().viewport.Top;
    camera.GetSFMLView().SetViewport(camera.GetCameraInfo().viewport);
}
