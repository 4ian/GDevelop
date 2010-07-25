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
#include "PhysicsAutomatismEditor.h"
#include "GDL/Scene.h"

std::map < const RuntimeScene* , ScenePhysicsDatas  > PhysicsAutomatism::runtimeScenesPhysicsDatas;
std::map < const Scene* , ScenePhysicsDatas > PhysicsAutomatism::scenesPhysicsDatas;

PhysicsAutomatism::PhysicsAutomatism(std::string automatismTypeName) :
Automatism(automatismTypeName),
shapeType(Box),
dynamic(true),
fixedRotation(false),
isBullet(false),
massDensity(1),
averageFriction(0.8),
body(NULL),
iteratorRuntimeScenesPhysicsDatasValid(false)
{
}

PhysicsAutomatism::~PhysicsAutomatism()
{
    if ( iteratorRuntimeScenesPhysicsDatasValid && body)
        runtimeScenePhysicsDatasPtr->second.world->DestroyBody(body);
}

void PhysicsAutomatism::EditAutomatism( wxWindow* parent, Game & game_, Scene * scene, MainEditorCommand & mainEditorCommand_ )
{
    PhysicsAutomatismEditor editor(parent, game_, scene, *this, mainEditorCommand_);
    editor.ShowModal();
}

void PhysicsAutomatism::InitializeSharedDatas(RuntimeScene & scene, const Scene & loadedScene)
{
    runtimeScenesPhysicsDatas[&scene] = scenesPhysicsDatas[&loadedScene];

    //Initialization of runtime datas
    runtimeScenesPhysicsDatas[&scene].world = new b2World(b2Vec2( runtimeScenesPhysicsDatas[&scene].gravityX,
                                                                 -runtimeScenesPhysicsDatas[&scene].gravityY), false); //Y axis is inverted
}

void PhysicsAutomatism::UnInitializeSharedDatas(RuntimeScene & scene)
{
    //UnInitialization of runtime datas
    delete runtimeScenesPhysicsDatas[&scene].world;
}

/**
 * Called at each frame before events :
 * Simulate the world if necessary and update body positions.
 */
void PhysicsAutomatism::DoStepPreEvents(RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);

    if ( !runtimeScenePhysicsDatasPtr->second.stepped ) //Simulate the world, once at each frame
    {
        runtimeScenePhysicsDatasPtr->second.world->Step(scene.GetElapsedTime(), 6, 10);
        runtimeScenePhysicsDatasPtr->second.world->ClearForces();

        runtimeScenePhysicsDatasPtr->second.stepped = true;
    }

    //Update object position according to Box2D body
    b2Vec2 position = body->GetPosition();
    object->SetX(position.x*runtimeScenePhysicsDatasPtr->second.scaleX);
    object->SetY(-position.y*runtimeScenePhysicsDatasPtr->second.scaleY); //Y axis is inverted
    object->SetAngle(-body->GetAngle()*360.0f/b2_pi); //Angles are inverted
};

/**
 * Called at each frame after events :
 * Update Box2D body if necessary
 */
void PhysicsAutomatism::DoStepPostEvents(RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);

    runtimeScenePhysicsDatasPtr->second.stepped = false; //Prepare for a new simulation

    //Update Box2D position to object
    b2Vec2 oldPos;
    oldPos.x = object->GetX()/runtimeScenePhysicsDatasPtr->second.scaleX;
    oldPos.y = -object->GetY()/runtimeScenePhysicsDatasPtr->second.scaleY; //Y axis is inverted
    body->SetTransform(oldPos, -object->GetAngle()*b2_pi/360.0f); //Angles are inverted
};

/**
 * Prepare Box2D body, and set up also runtimeScenePhysicsDatasPtr.
 */
void PhysicsAutomatism::CreateBody(RuntimeScene & scene)
{
    cout << "CreateBody";
    if ( !iteratorRuntimeScenesPhysicsDatasValid )
    {
        cout << "GetIterator";
        runtimeScenePhysicsDatasPtr = runtimeScenesPhysicsDatas.find(&scene);
        if (runtimeScenePhysicsDatasPtr == runtimeScenesPhysicsDatas.end() ) cout << "Invalid";
        iteratorRuntimeScenesPhysicsDatasValid = true;
    }
    cout << "Next";

    //Create body from object
    b2BodyDef bodyDef;
    bodyDef.type = b2_dynamicBody;
    bodyDef.position.Set(object->GetX()/runtimeScenePhysicsDatasPtr->second.scaleX, -object->GetY()/runtimeScenePhysicsDatasPtr->second.scaleY);
    body = runtimeScenePhysicsDatasPtr->second.world->CreateBody(&bodyDef);

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
        dynamicBox.SetAsBox(object->GetWidth()/(runtimeScenePhysicsDatasPtr->second.scaleX*2), object->GetHeight()/(runtimeScenePhysicsDatasPtr->second.scaleY*2));
        fixtureDef.shape = &dynamicBox;
        fixtureDef.density = massDensity;
        fixtureDef.friction = averageFriction;

        body->CreateFixture(&fixtureDef);
    }

    body->SetFixedRotation(fixedRotation);
    body->SetBullet(isBullet);
}
