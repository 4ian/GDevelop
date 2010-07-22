/**

Game Develop - Physic Automatism Extension
Copyright (c) 2008-2010 Florian Rival (Florian.Rival@gmail.com)

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

std::map < const RuntimeScene* , ScenePhysicsDatas*  > PhysicsAutomatism::scenesPhysicsDatas;

PhysicsAutomatism::PhysicsAutomatism(std::string automatismTypeName) :
Automatism(automatismTypeName),
shapeType(Box),
dynamic(true),
fixedRotation(false),
isBullet(false),
massDensity(1),
averageFriction(0.8),
body(NULL),
scenePhysicsDatasPtr(NULL)
{
}

PhysicsAutomatism::~PhysicsAutomatism()
{
    if ( scenePhysicsDatasPtr && body)
        scenePhysicsDatasPtr->world->DestroyBody(body);
}

void PhysicsAutomatism::InitializeSharedDatas(RuntimeScene & scene)
{
    scenesPhysicsDatas[&scene] = new ScenePhysicsDatas;
}

void PhysicsAutomatism::UnInitializeSharedDatas(RuntimeScene & scene)
{
    delete scenesPhysicsDatas[&scene];
    scenesPhysicsDatas[&scene] = NULL;
}

/**
 * Called at each frame before events :
 * Simulate the world if necessary and update body positions.
 */
void PhysicsAutomatism::DoStepPreEvents(RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);

    if ( !scenePhysicsDatasPtr->stepped ) //Simulate the world, once at each frame
    {
        scenePhysicsDatasPtr->world->Step(scene.GetElapsedTime(), 6, 10);
        scenePhysicsDatasPtr->world->ClearForces();

        scenePhysicsDatasPtr->stepped = true;
    }

    //Update object position according to Box2D body
    b2Vec2 position = body->GetPosition();
    object->SetX(position.x*scenePhysicsDatasPtr->scaleX);
    object->SetY(-position.y*scenePhysicsDatasPtr->scaleY); //Y axis is inverted
    object->SetAngle(-body->GetAngle()*360.0f/b2_pi); //Angles are inverted
};

/**
 * Called at each frame after events :
 * Update Box2D body if necessary
 */
void PhysicsAutomatism::DoStepPostEvents(RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);

    scenePhysicsDatasPtr->stepped = false; //Prepare for a new simulation

    //Update Box2D position to object
    b2Vec2 oldPos;
    oldPos.x = object->GetX()/scenePhysicsDatasPtr->scaleX;
    oldPos.y = -object->GetY()/scenePhysicsDatasPtr->scaleY; //Y axis is inverted
    body->SetTransform(oldPos, -object->GetAngle()*b2_pi/360.0f); //Angles are inverted
};

/**
 * Prepare Box2D body, and set up also scenePhysicsDatasPtr.
 */
void PhysicsAutomatism::CreateBody(RuntimeScene & scene)
{
    if ( !scenePhysicsDatasPtr )
    {
        if ( !scenesPhysicsDatas[&scene] ) scenesPhysicsDatas[&scene] = new ScenePhysicsDatas;
        scenePhysicsDatasPtr = scenesPhysicsDatas[&scene];
    }

    //Create body from object
    b2BodyDef bodyDef;
    bodyDef.type = b2_dynamicBody;
    bodyDef.position.Set(object->GetX()/scenePhysicsDatasPtr->scaleX, -object->GetY()/scenePhysicsDatasPtr->scaleY);
    body = scenePhysicsDatasPtr->world->CreateBody(&bodyDef);

    //Setup body

    if ( shapeType == Circle)
    {
        b2FixtureDef fixtureDef;

        b2CircleShape circle;
        circle.m_radius = (object->GetWidth()+object->GetHeight())/4; //Radius is based on the average of height and width
        fixtureDef.shape = &circle;
        fixtureDef.density = massDensity;
        fixtureDef.friction = averageFriction;

        body->CreateFixture(&fixtureDef);
    }
    else
    {
        b2FixtureDef fixtureDef;

        b2PolygonShape dynamicBox;
        dynamicBox.SetAsBox(object->GetWidth()/(scenePhysicsDatasPtr->scaleX*2), object->GetHeight()/(scenePhysicsDatasPtr->scaleY*2));
        fixtureDef.shape = &dynamicBox;
        fixtureDef.density = massDensity;
        fixtureDef.friction = averageFriction;

        body->CreateFixture(&fixtureDef);
    }

    body->SetFixedRotation(fixedRotation);
    body->SetBullet(isBullet);
}
