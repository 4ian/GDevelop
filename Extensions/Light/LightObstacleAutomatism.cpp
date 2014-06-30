/**

Game Develop - Light Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

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

#include "LightObstacleAutomatism.h"
#include "LightObstacleAutomatismEditor.h"
#include "LightObject.h"
#include "GDCpp/Scene.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/XmlMacros.h"
#include <SFML/Graphics.hpp>
#include <iostream>
#include <cmath>

LightObstacleAutomatism::LightObstacleAutomatism() :
    Automatism(),
    disabled(false)
{
}
LightObstacleAutomatism::~LightObstacleAutomatism()
{
    if ( manager )
    {
        for (unsigned int i = 0;i<wallsOfObject.size();++i)
        {
            manager->walls.erase(std::remove(manager->walls.begin(), manager->walls.end(), (wallsOfObject[i])), manager->walls.end());
            delete wallsOfObject[i];
        }
        wallsOfObject.clear();
    }
}

#if defined(GD_IDE_ONLY)
void LightObstacleAutomatism::EditAutomatism( wxWindow* parent, gd::Project & game_, gd::Layout * scene, gd::MainFrameWrapper & mainFrameWrapper_ )
{
    /*LightObstacleAutomatismEditor editor(parent, game_, scene, *this, gd::MainFrameWrapper_);
    editor.ShowModal();*/
}
#endif

sf::Vector2f LightObstacleAutomatism::RotatePoint( const sf::Vector2f& Point, float Angle )
{
    Angle = Angle * 3.14159265358979323846f/180.0f;
    sf::Vector2f RotatedPoint;
    RotatedPoint.x = Point.x * cos( Angle ) + Point.y * sin( Angle );
    RotatedPoint.y = -Point.x * sin( Angle ) + Point.y * cos( Angle );
    return RotatedPoint;
}

/**
 * Called at each frame before events :
 * Position the object on the path
 */
void LightObstacleAutomatism::DoStepPostEvents(RuntimeScene & scene)
{
    //Get a manager for the scene
    if ( RuntimeLightObject::lightManagersList[&scene].expired() )
    {
        manager = boost::shared_ptr<Light_Manager>(new Light_Manager);
        RuntimeLightObject::lightManagersList[&scene] = manager;
    }
    else
        manager = RuntimeLightObject::lightManagersList[&scene].lock();

    if ( disabled || (objectOldX == object->GetX() && objectOldY == object->GetY() && objectOldAngle == object->GetAngle() &&
         objectOldHeight == object->GetHeight() && objectOldWidth == object->GetWidth()) )
        return;

    if ( wallsOfObject.empty() )
    {
        Wall * wall1 = new Wall(sf::Vector2f(0,0), sf::Vector2f(0,0));
        Wall * wall2 = new Wall(sf::Vector2f(0,0), sf::Vector2f(0,0));
        Wall * wall3 = new Wall(sf::Vector2f(0,0), sf::Vector2f(0,0));
        Wall * wall4 = new Wall(sf::Vector2f(0,0), sf::Vector2f(0,0));
        manager->walls.push_back(wall1);
        manager->walls.push_back(wall2);
        manager->walls.push_back(wall3);
        manager->walls.push_back(wall4);
        wallsOfObject.push_back(wall1);
        wallsOfObject.push_back(wall2);
        wallsOfObject.push_back(wall3);
        wallsOfObject.push_back(wall4);
    }

    sf::Vector2f A = RotatePoint( sf::Vector2f( -object->GetWidth()/2.0f, -object->GetHeight()/2.0f ), -object->GetAngle() );
    sf::Vector2f B = RotatePoint( sf::Vector2f(  object->GetWidth()/2.0f, -object->GetHeight()/2.0f ), -object->GetAngle() );
    sf::Vector2f C = RotatePoint( sf::Vector2f(  object->GetWidth()/2.0f,  object->GetHeight()/2.0f ), -object->GetAngle() );
    sf::Vector2f D = RotatePoint( sf::Vector2f( -object->GetWidth()/2.0f,  object->GetHeight()/2.0f ), -object->GetAngle() );

    A += sf::Vector2f(object->GetDrawableX()+object->GetCenterX(), object->GetDrawableY()+object->GetCenterY());
    B += sf::Vector2f(object->GetDrawableX()+object->GetCenterX(), object->GetDrawableY()+object->GetCenterY());
    C += sf::Vector2f(object->GetDrawableX()+object->GetCenterX(), object->GetDrawableY()+object->GetCenterY());
    D += sf::Vector2f(object->GetDrawableX()+object->GetCenterX(), object->GetDrawableY()+object->GetCenterY());

    wallsOfObject[0]->pt1 = sf::Vector2f(A.x-1,A.y); wallsOfObject[0]->pt2 = sf::Vector2f(B.x,B.y);
    wallsOfObject[1]->pt1 = sf::Vector2f(B.x,B.y-1); wallsOfObject[1]->pt2 = sf::Vector2f(C.x,C.y);
    wallsOfObject[2]->pt1 = sf::Vector2f(C.x+1,C.y); wallsOfObject[2]->pt2 = sf::Vector2f(D.x,D.y);
    wallsOfObject[3]->pt1 = sf::Vector2f(D.x,D.y+1); wallsOfObject[3]->pt2 = sf::Vector2f(A.x,A.y);

    objectOldX = object->GetX();
    objectOldY = object->GetY();
    objectOldAngle = object->GetAngle();
    objectOldWidth = object->GetWidth();
    objectOldHeight = object->GetHeight();
}

void LightObstacleAutomatism::OnDeActivate()
{
    if ( manager )
    {
        for (unsigned int i = 0;i<wallsOfObject.size();++i)
        {
            manager->walls.erase(std::remove(manager->walls.begin(), manager->walls.end(), (wallsOfObject[i])), manager->walls.end());
            delete wallsOfObject[i];
        }
        wallsOfObject.clear();
    }
}

void LightObstacleAutomatism::OnActivate()
{
    if ( object )
        objectOldX = object->GetX()-42; //Force refreshing walls.
}
