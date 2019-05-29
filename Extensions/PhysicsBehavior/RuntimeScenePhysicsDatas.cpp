/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "RuntimeScenePhysicsDatas.h"
#include <iostream>
#include "Box2D/Box2D.h"
#include "ContactListener.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "ScenePhysicsDatas.h"

RuntimeScenePhysicsDatas::RuntimeScenePhysicsDatas(
    const gd::SerializerElement& behaviorSharedDataContent)
    : BehaviorsRuntimeSharedData(behaviorSharedDataContent),
      world(new b2World(
          b2Vec2(behaviorSharedDataContent.GetDoubleAttribute("gravityX"),
                 -behaviorSharedDataContent.GetDoubleAttribute("gravityY")),
          true)),
      contactListener(new ContactListener),
      staticBody(NULL),
      stepped(false),
      scaleX(behaviorSharedDataContent.GetDoubleAttribute("scaleX")),
      scaleY(behaviorSharedDataContent.GetDoubleAttribute("scaleY")),
      invScaleX(1 / scaleX),
      invScaleY(1 / scaleY),
      fixedTimeStep(1.f / 60.f),
      maxSteps(5),
      totalTime(0) {
  world->SetContactListener(contactListener);
  world->SetAutoClearForces(false);

  b2BodyDef bodyWithoutFixture;
  staticBody = world->CreateBody(&bodyWithoutFixture);
}

void RuntimeScenePhysicsDatas::StepWorld(float dt, int v, int p) {
  totalTime += dt;

  if (totalTime > fixedTimeStep) {
    std::size_t numberOfSteps(std::floor(totalTime / fixedTimeStep));
    totalTime -= numberOfSteps * fixedTimeStep;

    std::size_t numberOfStepToProcess = std::min(numberOfSteps, maxSteps);

    for (std::size_t a = 0; a < numberOfStepToProcess; a++) {
      world->Step(fixedTimeStep, v, p);
      world->ClearForces();
    }
  }
}

RuntimeScenePhysicsDatas::~RuntimeScenePhysicsDatas() {
  delete world;
  delete contactListener;
}
