/**

Game Develop - Physic Automatism Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

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

#include "PhysicsAutomatism.h"
#include "Box2D/Box2D.h"
#include "PhysicsAutomatismEditor.h"
#include "GDL/Scene.h"
#include "GDL/tinyxml.h"
#include "GDL/XmlMacros.h"

PhysicsAutomatism::PhysicsAutomatism(std::string automatismTypeName) :
Automatism(automatismTypeName),
shapeType(Box),
dynamic(true),
fixedRotation(false),
isBullet(false),
massDensity(1),
averageFriction(0.8),
averageRestitution(0),
linearDamping(0.1),
angularDamping(0.1),
body(NULL)
{
}

PhysicsAutomatism::~PhysicsAutomatism()
{
    if ( runtimeScenesPhysicsDatas != boost::shared_ptr<RuntimeScenePhysicsDatas>() && body)
        runtimeScenesPhysicsDatas->world->DestroyBody(body);
}

#if defined(GD_IDE_ONLY)
void PhysicsAutomatism::EditAutomatism( wxWindow* parent, Game & game_, Scene * scene, MainEditorCommand & mainEditorCommand_ )
{
    PhysicsAutomatismEditor editor(parent, game_, scene, *this, mainEditorCommand_);
    editor.ShowModal();
}
#endif

/**
 * Called at each frame before events :
 * Simulate the world if necessary and update body positions.
 */
void PhysicsAutomatism::DoStepPreEvents(RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);

    if ( !runtimeScenesPhysicsDatas->stepped ) //Simulate the world, once at each frame
    {
        runtimeScenesPhysicsDatas->world->Step(scene.GetElapsedTime(), 6, 10);
        runtimeScenesPhysicsDatas->world->ClearForces();

        runtimeScenesPhysicsDatas->stepped = true;
    }

    //Update object position according to Box2D body
    b2Vec2 position = body->GetPosition();
    object->SetX(position.x*runtimeScenesPhysicsDatas->GetScaleX()-object->GetWidth()/2+object->GetX()-object->GetDrawableX());
    object->SetY(-position.y*runtimeScenesPhysicsDatas->GetScaleY()-object->GetHeight()/2+object->GetY()-object->GetDrawableY()); //Y axis is inverted
    object->SetAngle(-body->GetAngle()*180.0f/b2_pi); //Angles are inverted

    objectOldX = object->GetX();
    objectOldY = object->GetY();
    objectOldAngle = object->GetAngle();
};

/**
 * Called at each frame after events :
 * Update Box2D body if necessary
 */
void PhysicsAutomatism::DoStepPostEvents(RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);
    if ( objectOldWidth != object->GetWidth() || objectOldHeight != object->GetHeight() )
    {
        runtimeScenesPhysicsDatas->world->DestroyBody(body);
        CreateBody(scene);
    }

    runtimeScenesPhysicsDatas->stepped = false; //Prepare for a new simulation

    if ( objectOldX == object->GetX() && objectOldY == object->GetY() && objectOldAngle == object->GetAngle())
        return;

    b2Vec2 oldPos;
    oldPos.x = (object->GetDrawableX()+object->GetWidth()/2)*runtimeScenesPhysicsDatas->GetInvScaleX();
    oldPos.y = -(object->GetDrawableY()+object->GetHeight()/2)*runtimeScenesPhysicsDatas->GetInvScaleY(); //Y axis is inverted
    body->SetTransform(oldPos, -object->GetAngle()*b2_pi/180.0f); //Angles are inverted
    body->SetAwake(true);
}

/**
 * Prepare Box2D body, and set up also runtimeScenePhysicsDatasPtr.
 */
void PhysicsAutomatism::CreateBody(const RuntimeScene & scene)
{
    if ( runtimeScenesPhysicsDatas == boost::shared_ptr<RuntimeScenePhysicsDatas>() )
        runtimeScenesPhysicsDatas = boost::static_pointer_cast<RuntimeScenePhysicsDatas>(scene.automatismsSharedDatas.find(automatismId)->second);

    //Create body from object
    b2BodyDef bodyDef;
    bodyDef.type = dynamic ? b2_dynamicBody : b2_staticBody;
    bodyDef.position.Set((object->GetDrawableX()+object->GetWidth()/2)*runtimeScenesPhysicsDatas->GetInvScaleX(), -(object->GetDrawableY()+object->GetHeight()/2)*runtimeScenesPhysicsDatas->GetInvScaleY());
    bodyDef.angle = -object->GetAngle()*b2_pi/180.0f; //Angles are inverted
    bodyDef.angularDamping = angularDamping > 0.0f ? angularDamping : 0.0f;
    bodyDef.linearDamping = linearDamping > 0.0f ? linearDamping : 0.0f;
    bodyDef.bullet = isBullet;
    bodyDef.fixedRotation = fixedRotation;
    body = runtimeScenesPhysicsDatas->world->CreateBody(&bodyDef);
    body->SetUserData(this);

    //Setup body
    if ( shapeType == Circle)
    {
        b2FixtureDef fixtureDef;

        b2CircleShape circle;
        circle.m_radius = (object->GetWidth()*runtimeScenesPhysicsDatas->GetInvScaleX()+
                           object->GetHeight()*runtimeScenesPhysicsDatas->GetInvScaleY())/4; //Radius is based on the average of height and width
        if ( circle.m_radius <= 0 ) circle.m_radius = 1;
        fixtureDef.shape = &circle;
        fixtureDef.density = massDensity;
        fixtureDef.friction = averageFriction;
        fixtureDef.restitution = averageRestitution;

        body->CreateFixture(&fixtureDef);
    }
    else
    {
        b2FixtureDef fixtureDef;

        b2PolygonShape dynamicBox;
        dynamicBox.SetAsBox((object->GetWidth() > 0 ? object->GetWidth() : 1.0f)*runtimeScenesPhysicsDatas->GetInvScaleX()/2, (object->GetHeight() > 0 ? object->GetHeight() : 1.0f)*runtimeScenesPhysicsDatas->GetInvScaleY()/2);
        fixtureDef.shape = &dynamicBox;
        fixtureDef.density = massDensity;
        fixtureDef.friction = averageFriction;
        fixtureDef.restitution = averageRestitution;

        body->CreateFixture(&fixtureDef);
    }

    objectOldWidth = object->GetWidth();
    objectOldHeight = object->GetHeight();
}
#if defined(GD_IDE_ONLY)
void PhysicsAutomatism::SaveToXml(TiXmlElement * elem) const
{
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("dynamic", dynamic);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("fixedRotation", fixedRotation);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("isBullet", isBullet);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("massDensity", massDensity);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("averageFriction", averageFriction);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("linearDamping", linearDamping);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("angularDamping", angularDamping);
    if ( shapeType == Circle)
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("shapeType", "Circle")
    else
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("shapeType", "Box")
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("averageRestitution", averageRestitution);
}
#endif

void PhysicsAutomatism::LoadFromXml(const TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("dynamic", dynamic);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("fixedRotation", fixedRotation);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("isBullet", isBullet);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("massDensity", massDensity);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("averageFriction", averageFriction);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("linearDamping", linearDamping);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("angularDamping", angularDamping);
    std::string shape;
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("shapeType", shape);
    if ( shape == "Circle" )
        shapeType = Circle;
    else
        shapeType = Box;
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("averageRestitution", averageRestitution);
}
