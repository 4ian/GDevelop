/**

Game Develop - Physics Automatism Extension
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

#include "RuntimeScenePhysicsDatas.h"
#include "ScenePhysicsDatas.h"
#include "ContactListener.h"
#include "Box2D/Box2D.h"
#include <iostream>

RuntimeScenePhysicsDatas::RuntimeScenePhysicsDatas(const ScenePhysicsDatas & automatismSharedDatas) :
world(new b2World(b2Vec2(automatismSharedDatas.gravityX, -automatismSharedDatas.gravityY), true)),
contactListener(new ContactListener),
staticBody(NULL),
stepped(false),
scaleX(automatismSharedDatas.scaleX),
scaleY(automatismSharedDatas.scaleY),
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

