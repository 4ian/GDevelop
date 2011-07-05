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

void GD_API CenterCameraOnObjectWithLimits(RuntimeScene & scene, const std::string &, std::vector<Object*> & objects, float left, float top, float right, float bottom, bool anticipateObjectMove, const std::string & layer, unsigned int camera)
{
    if ( objects.empty() ) return;

    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();

    float decalementX = 0;
    float decalementY = 0;

    //Prise en compte des déplacements de l'objet
    if ( anticipateObjectMove )
    {
        decalementX = ( objects[0]->TotalForceX() * scene.GetElapsedTime() );
        decalementY = ( objects[0]->TotalForceY() * scene.GetElapsedTime() );
    }

    //Si on est dans le cadre
    if ( objects[0]->GetX() > left
        && objects[0]->GetX() < right
        && objects[0]->GetY() > top
        && objects[0]->GetY() < bottom
        )
    {
        view.SetCenter(objects[0]->GetX() + decalementX, objects[0]->GetY() + decalementY);
    }

    //Si on n'est pas dedans.
    if ( ( objects[0]->GetX() < left
        || objects[0]->GetX() > right )
        && objects[0]->GetY() > top
        && objects[0]->GetY() < bottom )

    {
        view.SetCenter(view.GetCenter().x, objects[0]->GetY() + decalementY);
    }
    if ( ( objects[0]->GetY() < top
        || objects[0]->GetY() > bottom )
        && objects[0]->GetX() > left
        && objects[0]->GetX() < right)
    {
        view.SetCenter(objects[0]->GetX() + decalementX, view.GetCenter().y);
    }

    return;
}

void GD_API CenterCameraOnObject(RuntimeScene & scene, const std::string &, std::vector<Object*> & objects,  bool anticipateObjectMove, const std::string & layer, unsigned int camera)
{
    if ( objects.empty() ) return;

    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();

    float decalementX = 0;
    float decalementY = 0;

    //Prise en compte des déplacements de l'objet
    if ( anticipateObjectMove )
    {
        decalementX = ( objects[0]->TotalForceX() * scene.GetElapsedTime() );
        decalementY = ( objects[0]->TotalForceY() * scene.GetElapsedTime() );
    }

    view.SetCenter(objects[0]->GetX() + decalementX, objects[0]->GetY() + decalementY);

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

    //Set the size of the camera //TODO : Optional parameters ?..
    //if ( !action.GetParameter(1).GetPlainString().empty() || !action.GetParameter(2).GetPlainString().empty() )
        cameraInfo.defaultSize = false;

    cameraInfo.size.x = width;
    cameraInfo.size.y = height;

    //Set the viewport
    /*if ( !action.GetParameter(3).GetPlainString().empty() || !action.GetParameter(4).GetPlainString().empty() ||
         !action.GetParameter(5).GetPlainString().empty() || !action.GetParameter(6).GetPlainString().empty())*/
        cameraInfo.defaultViewport = false;

    cameraInfo.viewport.Left = viewportLeft;
    cameraInfo.viewport.Top = viewportTop;
    cameraInfo.viewport.Width = viewportRight - cameraInfo.viewport.Left;
    cameraInfo.viewport.Height = viewportBottom - cameraInfo.viewport.Top;

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
