/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef OBJECTTOOLS_H
#define OBJECTTOOLS_H

#include <map>
#include <string>
#include <vector>
#include "GDCpp/Runtime/String.h"

class RuntimeScene;
class RuntimeObject;

/**
 * Only used internally by GD events generated code.
 */
bool GD_API ObjectsTurnedToward(
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists1,
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists2,
    float tolerance,
    bool conditionInverted);

/**
 * Only used internally by GD events generated code.
 *
 * Complexity is O(n*m) and could be improved by using a spatial data structure
 * to store object positions (see GDJS).
 */
bool GD_API HitBoxesCollision(
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists1,
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists2,
    bool conditionInverted,
    RuntimeScene &scene,
    bool ignoreTouchingEdges = false);

/**
 * Only used internally by GD events generated code.
 *
 * Complexity is O(n*m) and could be improved by using a spatial data structure
 * to store object positions (see GDJS).
 */
void GD_API SeparateObjects(
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists1,
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists2,
    bool ignoreTouchingEdges,
    RuntimeScene &scene);

/**
 * Only used internally by GD events generated code.
 *
 * Complexity could be improved by using a spatial data structure
 * to store object positions (see GDJS).
 */
bool GD_API IsCollidingWithPoint(
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists,
    double x,
    double y,
    bool conditionInverted,
    RuntimeScene &scene);

/**
 * Only used internally by GD events generated code.
 */
double GD_API PickedObjectsCount(
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists);

/**
 * Only used internally by GD events generated code.
 *
 * Complexity is O(n*m) and could be improved by using a spatial data structure
 * to store object positions (see GDJS).
 */
float GD_API DistanceBetweenObjects(
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists1,
    std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists2,
    float length,
    bool conditionInverted,
    RuntimeScene &scene);

/**
 * Only used internally by GD events generated code.
 */
bool GD_API
MovesToward(std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists1,
            std::map<gd::String, std::vector<RuntimeObject *> *> objectsLists2,
            float tolerance,
            bool conditionInverted);

#endif  // OBJECTTOOLS_H
