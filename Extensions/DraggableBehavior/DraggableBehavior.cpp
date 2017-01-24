/**

GDevelop - Draggable Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <memory>
#include <iostream>
#include <SFML/Graphics.hpp>
#include "DraggableBehavior.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/RuntimeLayer.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/CommonTools.h"

bool DraggableBehavior::somethingDragged = false;
bool DraggableBehavior::leftPressedLastFrame = false;

DraggableBehavior::DraggableBehavior() :
    dragged(false)
{
}

void DraggableBehavior::DoStepPreEvents(RuntimeScene & scene)
{
    //Begin drag ?
    if ( !dragged && scene.GetInputManager().IsMouseButtonPressed("Left") &&
        !leftPressedLastFrame && !somethingDragged )
    {
        RuntimeLayer & theLayer = scene.GetRuntimeLayer(object->GetLayer());
        for (std::size_t cameraIndex = 0;cameraIndex < theLayer.GetCameraCount();++cameraIndex)
        {
            sf::Vector2f mousePos = scene.renderWindow->GetRenderingTarget().mapPixelToCoords(
                scene.GetInputManager().GetMousePosition(), theLayer.GetCamera(cameraIndex).GetSFMLView());

            if ( object->GetDrawableX() <= mousePos.x
                && object->GetDrawableX() + object->GetWidth() >= mousePos.x
                && object->GetDrawableY() <= mousePos.y
                && object->GetDrawableY() + object->GetHeight() >= mousePos.y )
            {
                dragged = true;
                somethingDragged = true;
                xOffset = mousePos.x - object->GetX();
                yOffset = mousePos.y - object->GetY();
                dragCameraIndex = cameraIndex;
                break;
            }
        }
    }
    //End dragging ?
    else if ( !scene.GetInputManager().IsMouseButtonPressed("Left") ) {
        dragged = false;
        somethingDragged = false;
    }

    //Being dragging ?
    if ( dragged ) {
        RuntimeLayer & theLayer = scene.GetRuntimeLayer(object->GetLayer());
        sf::Vector2f mousePos = scene.renderWindow->GetRenderingTarget().mapPixelToCoords(
            scene.GetInputManager().GetMousePosition(), theLayer.GetCamera(dragCameraIndex).GetSFMLView());

        object->SetX(mousePos.x-xOffset);
        object->SetY(mousePos.y-yOffset);
    }

}

void DraggableBehavior::DoStepPostEvents(RuntimeScene & scene)
{
    leftPressedLastFrame = scene.GetInputManager().IsMouseButtonPressed("Left");
}

void DraggableBehavior::OnDeActivate()
{
    if (dragged) somethingDragged = false;
    dragged = false;
}
