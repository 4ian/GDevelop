/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "RuntimeScenePhysicsDatas.h"
#include "ScenePhysicsDatas.h"
#include "ContactListener.h"
#include "Box2D/Box2D.h"
#include <iostream>

RuntimeScenePhysicsDatas::RuntimeScenePhysicsDatas(const ScenePhysicsDatas & behaviorSharedDatas) :
world(new b2World(b2Vec2(behaviorSharedDatas.gravityX, -behaviorSharedDatas.gravityY), true)),
contactListener(new ContactListener),
staticBody(NULL),
stepped(false),
scaleX(behaviorSharedDatas.scaleX),
scaleY(behaviorSharedDatas.scaleY),
invScaleX(1/scaleX),
invScaleY(1/scaleY),
fixedTimeStep(1.f / 60.f),
maxSteps(5),
totalTime (0)
{
    world->SetContactListener(contactListener);
    world->SetAutoClearForces(false);

    b2BodyDef bodyWithoutFixture;
    staticBody = world->CreateBody(&bodyWithoutFixture);
}

void RuntimeScenePhysicsDatas::StepWorld(float dt, int v, int p)
{
	totalTime += dt;

	if(totalTime > fixedTimeStep)
	{
	    unsigned int numberOfSteps(std::floor(totalTime / fixedTimeStep));
	    totalTime -= numberOfSteps * fixedTimeStep;

	    unsigned int numberOfStepToProcess = std::min(numberOfSteps, maxSteps);

	    for(unsigned int a = 0; a < numberOfStepToProcess; a++)
	    {
            world->Step(fixedTimeStep, v, p);
            world->ClearForces();
	    }
	}

	 //Old method
	/*world->Step(dt, v, p);
	world->ClearForces();*/
}

RuntimeScenePhysicsDatas::~RuntimeScenePhysicsDatas()
{
    delete world;
    delete contactListener;
}

