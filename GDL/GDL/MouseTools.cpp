#include "GDL/MouseTools.h"
#include "GDL/RuntimeScene.h"

void GD_API CenterCursor( RuntimeScene & scene )
{
    scene.renderWindow->SetCursorPosition(scene.renderWindow->GetWidth()/2, scene.renderWindow->GetHeight()/2 );
}

void GD_API CenterCursorHorizontally( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    scene.renderWindow->SetCursorPosition(scene.renderWindow->GetWidth()/2, scene.input->GetMouseY() );
}

void GD_API CenterCursorVertically( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    scene.renderWindow->SetCursorPosition(scene.input->GetMouseX(), scene.renderWindow->GetHeight()/2 );
}

void GD_API SetCursorPosition( RuntimeScene & scene, float newX, float newY )
{
    scene.renderWindow->SetCursorPosition( newX, newY );
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
    return scene.renderWindow->ConvertCoords(scene.input->GetMouseX(), scene.input->GetMouseY(), view).x;
}

double GD_API GetCursorYPosition( RuntimeScene & scene, const std::string & layer, unsigned int camera )
{
    //Get view, and compute mouse position
    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();
    return scene.renderWindow->ConvertCoords(scene.input->GetMouseX(), scene.input->GetMouseY(), view).y;
}

bool GD_API MouseButtonPressed( RuntimeScene & scene, const std::string & key )
{
    if ( key == "Left" ) { return scene.input->IsMouseButtonDown( sf::Mouse::Left ); }
    if ( key == "Right" ) { return scene.input->IsMouseButtonDown( sf::Mouse::Right ); }
    if ( key == "Middle" ) { return scene.input->IsMouseButtonDown( sf::Mouse::Middle ); }
    if ( key == "XButton1" ) { return scene.input->IsMouseButtonDown( sf::Mouse::XButton1 ); }
    if ( key == "XButton2" ) { return scene.input->IsMouseButtonDown( sf::Mouse::XButton2 ); }

    return false;
}

int GD_API GetMouseWheelDelta( RuntimeScene & scene )
{
    return scene.inputWheelDelta;
}
