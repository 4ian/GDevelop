/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ArbitraryObjectsWorker.h"

#include <iostream>
#include <map>
#include <memory>
#include <vector>

#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/String.h"

using namespace std;

namespace gd {

ArbitraryObjectsWorker::~ArbitraryObjectsWorker() {}

void ArbitraryObjectsWorker::VisitObjectContainer(
    gd::ObjectsContainer& objects) {
  DoVisitObjectContainer(objects);

  for (size_t i = 0; i < objects.GetObjectsCount(); i++)
    VisitObject(objects.GetObject(i));
}

void ArbitraryObjectsWorker::VisitObject(gd::Object& object) {
  DoVisitObject(object);

  for (auto behaviorName : object.GetAllBehaviorNames())
    VisitBehavior(object.GetBehavior(behaviorName));
}

void ArbitraryObjectsWorker::VisitBehavior(gd::Behavior& behavior) {
  DoVisitBehavior(behavior);
}

}  // namespace gd
