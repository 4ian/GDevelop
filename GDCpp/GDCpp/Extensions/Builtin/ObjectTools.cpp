/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ObjectTools.h"
#include <cmath>
#include <iostream>
#include "GDCpp/Runtime/Polygon2d.h"
#include "GDCpp/Runtime/PolygonCollision.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeObjectsListsTools.h"
#include "MathematicalTools.h"

using namespace std;

double GD_API PickedObjectsCount(
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists) {
  std::size_t size = 0;
  std::map<gd::String, std::vector<RuntimeObject *> *>::const_iterator it =
      objectsLists.begin();
  for (; it != objectsLists.end(); ++it) {
    if (it->second == NULL) continue;

    size += (it->second)->size();
  }

  return size;
}

bool GD_API HitBoxesCollision(
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists1,
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists2,
    bool conditionInverted,
    RuntimeScene & /*scene*/,
    bool ignoreTouchingEdges) {
  return TwoObjectListsTest(
      objectsLists1,
      objectsLists2,
      conditionInverted,
      [ignoreTouchingEdges](RuntimeObject *obj1, RuntimeObject *obj2) {
        return obj1->IsCollidingWith(obj2, ignoreTouchingEdges);
      });
}

bool GD_API ObjectsTurnedToward(
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists1,
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists2,
    float tolerance,
    bool conditionInverted) {
  return TwoObjectListsTest(
      objectsLists1,
      objectsLists2,
      conditionInverted,
      [tolerance](RuntimeObject *obj1, RuntimeObject *obj2) {
        double objAngle =
            atan2(obj2->GetDrawableY() + obj2->GetCenterY() -
                      (obj1->GetDrawableY() + obj1->GetCenterY()),
                  obj2->GetDrawableX() + obj2->GetCenterX() -
                      (obj1->GetDrawableX() + obj1->GetCenterX()));
        objAngle *= 180.0 / 3.14159;

        return abs(GDpriv::MathematicalTools::angleDifference(
                   obj1->GetAngle(), objAngle)) <= tolerance / 2;
      });
}

float GD_API DistanceBetweenObjects(
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists1,
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists2,
    float length,
    bool conditionInverted) {
  length *= length;
  return TwoObjectListsTest(
      objectsLists1,
      objectsLists2,
      conditionInverted,
      [length](RuntimeObject *obj1, RuntimeObject *obj2) {
        float X = obj1->GetDrawableX() + obj1->GetCenterX() -
                  (obj2->GetDrawableX() + obj2->GetCenterX());
        float Y = obj1->GetDrawableY() + obj1->GetCenterY() -
                  (obj2->GetDrawableY() + obj2->GetCenterY());

        return (X * X + Y * Y) <= length;
      });
}

bool GD_API
MovesToward(std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists1,
            std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists2,
            float tolerance,
            bool conditionInverted) {
  return TwoObjectListsTest(
      objectsLists1,
      objectsLists2,
      conditionInverted,
      [tolerance](RuntimeObject *obj1, RuntimeObject *obj2) {
        if (obj1->TotalForceLength() == 0) return false;

        double objAngle =
            atan2(obj2->GetDrawableY() + obj2->GetCenterY() -
                      (obj1->GetDrawableY() + obj1->GetCenterY()),
                  obj2->GetDrawableX() + obj2->GetCenterX() -
                      (obj1->GetDrawableX() + obj1->GetCenterX()));
        objAngle *= 180.0 / 3.14159;

        return abs(GDpriv::MathematicalTools::angleDifference(
                   obj1->TotalForceAngle(), objAngle)) <= tolerance / 2;
      });
}
