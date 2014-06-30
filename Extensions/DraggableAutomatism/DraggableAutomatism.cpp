/**

Game Develop - Draggable Automatism Extension
Copyright (c) 2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include <boost/shared_ptr.hpp>
#include <iostream>
#include <SFML/Graphics.hpp>
#include "DraggableAutomatism.h"
#include "GDCpp/Scene.h"
#include "GDCpp/RuntimeLayer.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/XmlMacros.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/CommonTools.h"

bool DraggableAutomatism::somethingDragged = false;

DraggableAutomatism::DraggableAutomatism() :
    dragged(false)
{
}

void DraggableAutomatism::DoStepPreEvents(RuntimeScene & scene)
{
    //Begin drag ?
    if ( !dragged && sf::Mouse::isButtonPressed(sf::Mouse::Left) && !somethingDragged )
    {
        RuntimeLayer & theLayer = scene.GetRuntimeLayer(object->GetLayer());
        for (unsigned int cameraIndex = 0;cameraIndex < theLayer.GetCameraCount();++cameraIndex)
        {
            sf::Vector2f mousePos = scene.renderWindow->mapPixelToCoords(sf::Mouse::getPosition(*scene.renderWindow),
                                                         theLayer.GetCamera(cameraIndex).GetSFMLView());

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
    else if ( !sf::Mouse::isButtonPressed(sf::Mouse::Left) ) {
        dragged = false;
        somethingDragged = false;
    }

    //Being dragging ?
    if ( dragged ) {
        RuntimeLayer & theLayer = scene.GetRuntimeLayer(object->GetLayer());
        sf::Vector2f mousePos = scene.renderWindow->mapPixelToCoords(sf::Mouse::getPosition(*scene.renderWindow),
                                                     theLayer.GetCamera(dragCameraIndex).GetSFMLView());

        object->SetX(mousePos.x-xOffset);
        object->SetY(mousePos.y-yOffset);
    }
}

void DraggableAutomatism::OnDeActivate()
{
    if (dragged) somethingDragged = false;
    dragged = false;
}