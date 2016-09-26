/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * \file File containing tools to manipulate objects easier.
 */

#ifndef OBJECTHELPERS_H
#define OBJECTHELPERS_H
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include <memory>
#include <vector>

/**
 * An object list is a vector containing (smart) pointers to objects.
 */
using RuntimeObjList = std::vector<std::unique_ptr<RuntimeObject>>;

/**
 * Objects are usually managed thanks to (smart) pointers.
 */
using RuntimeObjSPtr = std::unique_ptr<RuntimeObject>;

/**
 * \brief Functor testing object name
 *
 * \see Object
 */
struct ObjectHasName : public std::binary_function<std::unique_ptr<gd::Object>, gd::String, bool> {
    bool operator()(const std::unique_ptr<gd::Object> & object, const gd::String & name) const { return object->GetName() == name; }
};

#endif // OBJECTHELPERS_H
