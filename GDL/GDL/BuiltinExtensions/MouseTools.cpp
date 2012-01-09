#include "GDL/BuiltinExtensions/MouseTools.h"
#include "GDL/RuntimeScene.h"

void GD_API CenterCursor( RuntimeScene & scene )
{
    sf::Mouse::SetPosition(sf::Vector2i(scene.renderWindow->GetWidth()/2, scene.renderWindow->GetHeight()/2), *scene.renderWindow );
}

void GD_API CenterCursorHorizontally( RuntimeScene & scene )
{
    sf::Mouse::SetPosition(sf::Vector2i(scene.renderWindow->GetWidth()/2, sf::Mouse::GetPosition(*scene.renderWindow).y ), *scene.renderWindow );
}

void GD_API CenterCursorVertically( RuntimeScene & scene )
{
    sf::Mouse::SetPosition(sf::Vector2i(sf::Mouse::GetPosition(*scene.renderWindow).x, scene.renderWindow->GetHeight()/2), *scene.renderWindow );
}

void GD_API SetCursorPosition( RuntimeScene & scene, float newX, float newY )
{
    sf::Mouse::SetPosition(sf::Vector2i(newX, newY), *scene.renderWindow );
}

void GD_API HideCursor( RuntimeScene & scene )
{
    scene.renderWindow->ShowMouseCursor(false);
}

void GD_API ShowCursor( RuntimeScene & scene )
{
    scene.renderWindow->ShowMouseCursor(true);
}

double GD_API GetCursorXPosition( RuntimeScene & scene, const std::string & layer, unsigned int camera )
{
    //Get view, and compute mouse position
    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();
    return scene.renderWindow->ConvertCoords(sf::Mouse::GetPosition(*scene.renderWindow).x, sf::Mouse::GetPosition(*scene.renderWindow).y, view).x;
}

double GD_API GetCursorYPosition( RuntimeScene & scene, const std::string & layer, unsigned int camera )
{
    //Get view, and compute mouse position
    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();
    return scene.renderWindow->ConvertCoords(sf::Mouse::GetPosition(*scene.renderWindow).x, sf::Mouse::GetPosition(*scene.renderWindow).y, view).y;
}

bool GD_API MouseButtonPressed( RuntimeScene & scene, const std::string & key )
{
    if ( key == "Left" ) { return sf::Mouse::IsButtonPressed( sf::Mouse::Left ); }
    if ( key == "Right" ) { return sf::Mouse::IsButtonPressed( sf::Mouse::Right ); }
    if ( key == "Middle" ) { return sf::Mouse::IsButtonPressed( sf::Mouse::Middle ); }
    if ( key == "XButton1" ) { return sf::Mouse::IsButtonPressed( sf::Mouse::XButton1 ); }
    if ( key == "XButton2" ) { return sf::Mouse::IsButtonPressed( sf::Mouse::XButton2 ); }

    return false;
}

int GD_API GetMouseWheelDelta( RuntimeScene & scene )
{
    const std::vector<sf::Event> & events = scene.GetRenderTargetEvents();
    for (unsigned int i = 0;i<events.size();++i)
    {
        if (events[i].Type == sf::Event::MouseWheelMoved )
            return events[i].MouseWheel.Delta;
    }

    return 0;
}
