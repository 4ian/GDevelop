/**

Game Develop - Top-down movement Automatism Extension
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

#include <boost/shared_ptr.hpp>
#include <iostream>
#include <set>
#include "TopDownMovementAutomatism.h"
#include "GDCpp/BuiltinExtensions/MathematicalTools.h"
#include "GDCpp/Scene.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/XmlMacros.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/XmlMacros.h"
#include <SFML/Window.hpp>
#include "GDCore/CommonTools.h"
#include <iostream>
#include <cmath>
#include <algorithm>
#if defined(GD_IDE_ONLY)
#include <map>
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#endif

TopDownMovementAutomatism::TopDownMovementAutomatism() :
    allowDiagonals(true),
    acceleration(400),
    deceleration(800),
    maxSpeed(200),
    angularMaxSpeed(180),
    rotateObject(true),
    angleOffset(0),
    xVelocity(0),
    yVelocity(0),
    angularSpeed(0),
    ignoreDefaultControls(false),
    leftKey(false),
    rightKey(false),
    upKey(false),
    downKey(false)
{
}

float TopDownMovementAutomatism::GetSpeed()
{
    return sqrt(xVelocity*xVelocity+yVelocity*yVelocity);
}

void TopDownMovementAutomatism::DoStepPreEvents(RuntimeScene & scene)
{
    //Get the player input:
    leftKey |= !ignoreDefaultControls && sf::Keyboard::isKeyPressed( sf::Keyboard::Left );
    rightKey |= !ignoreDefaultControls && sf::Keyboard::isKeyPressed( sf::Keyboard::Right );
    downKey |= !ignoreDefaultControls && sf::Keyboard::isKeyPressed( sf::Keyboard::Down );
    upKey |= !ignoreDefaultControls && sf::Keyboard::isKeyPressed( sf::Keyboard::Up );

    int direction = -1;
    float directionInRad = 0;
    float directionInDeg = 0;
    if (!allowDiagonals)
    {
        if (upKey && !downKey) direction = 6;
        else if (!upKey && downKey) direction = 2;

        if (!upKey && !downKey)
        {
            if (leftKey && !rightKey) direction = 4;
            else if (!leftKey && rightKey) direction = 0;
        }
    }
    else
    {
        if (upKey && !downKey)
        {
            if (leftKey && !rightKey) direction = 5;
            else if (!leftKey && rightKey) direction = 7;
            else direction = 6;
        }
        else if (!upKey && downKey)
        {
            if (leftKey && !rightKey) direction = 3;
            else if (!leftKey && rightKey) direction = 1;
            else direction = 2;
        }
        else
        {
            if (leftKey && !rightKey) direction = 4;
            else if (!leftKey && rightKey) direction = 0;
        }
    }

    //Update the speed of the object
    float timeDelta = static_cast<double>(scene.GetElapsedTime())/1000000.0;
    if (direction != -1)
    {
        directionInRad = static_cast<float>(direction)*gd::Pi()/4.0;
        directionInDeg = static_cast<float>(direction)*45;

        xVelocity += acceleration*timeDelta*cos(directionInRad);
        yVelocity += acceleration*timeDelta*sin(directionInRad);
    }
    else
    {
        directionInRad = atan2(yVelocity, xVelocity);
        directionInDeg = atan2(yVelocity, xVelocity)*180.0/gd::Pi();

        bool xVelocityWasPositive = xVelocity >= 0;
        bool yVelocityWasPositive = yVelocity >= 0;
        xVelocity -= deceleration*timeDelta*cos(directionInRad);
        yVelocity -= deceleration*timeDelta*sin(directionInRad);
        if ( xVelocity > 0 ^ xVelocityWasPositive ) xVelocity = 0;
        if ( yVelocity > 0 ^ yVelocityWasPositive ) yVelocity = 0;
    }

    float speed = sqrt(xVelocity*xVelocity+yVelocity*yVelocity);
    if ( speed > maxSpeed )
    {
        xVelocity = maxSpeed*cos(directionInRad);
        yVelocity = maxSpeed*sin(directionInRad);
    }
    angularSpeed = angularMaxSpeed; //No acceleration for angular speed for now

    //Position object
    object->SetX(object->GetX()+xVelocity*timeDelta);
    object->SetY(object->GetY()+yVelocity*timeDelta);

    //Also update angle if needed
    if ( (xVelocity != 0 || yVelocity != 0) && rotateObject ) {
        float angularDiff = GDpriv::MathematicalTools::angleDifference(object->GetAngle(), directionInDeg+angleOffset);
        bool diffWasPositive = angularDiff >= 0;

        float newAngle = object->GetAngle()+(diffWasPositive ? -1.0 : 1.0)*angularSpeed*timeDelta;
        if( GDpriv::MathematicalTools::angleDifference(newAngle, directionInDeg+angleOffset) > 0 ^ diffWasPositive)
            newAngle = directionInDeg+angleOffset;
        object->SetAngle(newAngle);

        if ( object->GetAngle() != newAngle ) //Objects like sprite in 8 directions does not handle small increments...
            object->SetAngle(directionInDeg+angleOffset); //...so force them to be in the path angle anyway.
    }

    leftKey = false;
    rightKey = false;
    upKey = false;
    downKey = false;
}

void TopDownMovementAutomatism::SimulateControl(const std::string & input)
{
    if ( input == "Left" ) leftKey = true;
    else if ( input == "Right" ) rightKey = true;
    else if ( input == "Up" ) upKey = true;
    else if ( input == "Down" ) downKey = true;
}

void TopDownMovementAutomatism::UnserializeFrom(const gd::SerializerElement & element)
{
    allowDiagonals = element.GetBoolAttribute("allowDiagonals");
    acceleration = element.GetDoubleAttribute("acceleration");
    deceleration = element.GetDoubleAttribute("deceleration");
    maxSpeed = element.GetDoubleAttribute("maxSpeed");
    angularMaxSpeed = element.GetDoubleAttribute("angularMaxSpeed");
    rotateObject = element.GetBoolAttribute("rotateObject");
    angleOffset = element.GetDoubleAttribute("angleOffset");
    ignoreDefaultControls = element.GetBoolAttribute("ignoreDefaultControls");
}

#if defined(GD_IDE_ONLY)
void TopDownMovementAutomatism::SerializeTo(gd::SerializerElement & element) const
{
    element.SetAttribute("allowDiagonals", allowDiagonals);
    element.SetAttribute("acceleration", acceleration);
    element.SetAttribute("deceleration", deceleration);
    element.SetAttribute("maxSpeed", maxSpeed);
    element.SetAttribute("angularMaxSpeed", angularMaxSpeed);
    element.SetAttribute("rotateObject", rotateObject);
    element.SetAttribute("angleOffset", angleOffset);
    element.SetAttribute("ignoreDefaultControls", ignoreDefaultControls);
}

std::map<std::string, gd::PropertyDescriptor> TopDownMovementAutomatism::GetProperties(gd::Project & project) const
{
    std::map<std::string, gd::PropertyDescriptor> properties;

    properties[ToString(_("Allows diagonals"))].SetValue(allowDiagonals ? "true" : "false").SetType("Boolean");
    properties[ToString(_("Acceleration"))].SetValue(ToString(acceleration));
    properties[ToString(_("Deceleration"))].SetValue(ToString(deceleration));
    properties[ToString(_("Max. speed"))].SetValue(ToString(maxSpeed));
    properties[ToString(_("Rotate speed"))].SetValue(ToString(angularMaxSpeed));
    properties[ToString(_("Rotate object"))].SetValue(rotateObject ? "true" : "false").SetType("Boolean");
    properties[ToString(_("Angle offset"))].SetValue(ToString(angleOffset));
    properties[ToString(_("Default controls"))].SetValue(ignoreDefaultControls ? "false" : "true").SetType("Boolean");

    return properties;
}

bool TopDownMovementAutomatism::UpdateProperty(const std::string & name, const std::string & value, gd::Project & project)
{
    if ( name == ToString(_("Default controls")) ) {
        ignoreDefaultControls = (value == "0");
        return true;
    }
    if ( name == ToString(_("Allows diagonals")) ) {
        allowDiagonals = (value != "0");
        return true;
    }
    if ( name == ToString(_("Rotate object")) ) {
        rotateObject = (value != "0");
        return true;
    }

    if ( ToDouble(value) < 0 ) return false;

    if ( name == ToString(_("Acceleration")) )
        acceleration = ToDouble(value);
    else if ( name == ToString(_("Deceleration")) )
        deceleration = ToDouble(value);
    else if ( name == ToString(_("Max. speed")) )
        maxSpeed = ToDouble(value);
    else if ( name == ToString(_("Rotate speed")) )
        angularMaxSpeed = ToDouble(value);
    else if ( name == ToString(_("Angle offset")) )
        angleOffset = ToDouble(value);
    else
        return false;

    return true;
}

#endif