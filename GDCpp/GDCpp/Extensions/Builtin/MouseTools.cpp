#include "GDCpp/Extensions/Builtin/MouseTools.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/RuntimeLayer.h"
#include "GDCpp/Runtime/RuntimeObjectsListsTools.h"
#include "GDCpp/Runtime/Window/RenderingWindow.h"
#include <SFML/Graphics.hpp>

void GD_API CenterCursor( RuntimeScene & scene )
{
    gd::RenderingWindow::SetMousePosition(sf::Vector2i(scene.renderWindow->GetSize().x/2, scene.renderWindow->GetSize().y/2), *scene.renderWindow );
}

void GD_API CenterCursorHorizontally( RuntimeScene & scene )
{
    gd::RenderingWindow::SetMousePosition(sf::Vector2i(scene.renderWindow->GetSize().x/2, scene.GetInputManager().GetMousePosition().y ), *scene.renderWindow );
}

void GD_API CenterCursorVertically( RuntimeScene & scene )
{
    gd::RenderingWindow::SetMousePosition(sf::Vector2i(scene.GetInputManager().GetMousePosition().x, scene.renderWindow->GetSize().y/2), *scene.renderWindow );
}

void GD_API SetCursorPosition( RuntimeScene & scene, float newX, float newY )
{
    gd::RenderingWindow::SetMousePosition(sf::Vector2i(newX, newY), *scene.renderWindow );
}

void GD_API HideCursor( RuntimeScene & scene )
{
    scene.renderWindow->SetMouseCursorVisible(false);
}

void GD_API ShowCursor( RuntimeScene & scene )
{
    scene.renderWindow->SetMouseCursorVisible(true);
}

double GD_API GetCursorXPosition( RuntimeScene & scene, const gd::String & layer, std::size_t camera )
{
    if (scene.GetRuntimeLayer(layer).GetCameraCount() == 0) return 0;
    if (camera >= scene.GetRuntimeLayer(layer).GetCameraCount()) camera = 0;

    //Get view, and compute mouse position
    const sf::View & view = scene.GetRuntimeLayer(layer).GetCamera(camera).GetSFMLView();
    return scene.renderWindow->GetRenderingTarget().mapPixelToCoords(scene.GetInputManager().GetMousePosition(), view).x;
}

double GD_API GetCursorYPosition( RuntimeScene & scene, const gd::String & layer, std::size_t camera )
{
    if (scene.GetRuntimeLayer(layer).GetCameraCount() == 0) return 0;
    if (camera >= scene.GetRuntimeLayer(layer).GetCameraCount()) camera = 0;

    //Get view, and compute mouse position
    const sf::View & view = scene.GetRuntimeLayer(layer).GetCamera(camera).GetSFMLView();
    return scene.renderWindow->GetRenderingTarget().mapPixelToCoords(scene.GetInputManager().GetMousePosition(), view).y;
}

bool GD_API MouseButtonPressed(RuntimeScene & scene, const gd::String & button)
{
    return scene.GetInputManager().IsMouseButtonPressed(button);
}

bool GD_API MouseButtonReleased(RuntimeScene & scene, const gd::String & button)
{
    return scene.GetInputManager().IsMouseButtonReleased(button);
}

int GD_API GetMouseWheelDelta(RuntimeScene & scene)
{
    return scene.GetInputManager().GetMouseWheelDelta();
}

bool GD_API CursorOnObject(std::map <gd::String, std::vector<RuntimeObject*> *> objectsLists, RuntimeScene & scene, bool precise, bool conditionInverted)
{
    return PickObjectsIf(objectsLists, conditionInverted, [&scene, precise](RuntimeObject * obj) {
        return obj->CursorOnObject(scene, precise);
    });
}
