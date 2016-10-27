/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * Copyright 2016 Victor Levasseur (victorlevasseur52@gmail.com)
 * This project is released under the MIT License.
 */
#ifndef EXTENSIONBASE_INL
#define EXTENSIONBASE_INL

#include "GDCore/Tools/MakeUnique.h"

template<class T, class U>
void ExtensionBase::AddRuntimeObject(gd::ObjectMetadata & object, gd::String className)
{
#if defined(GD_IDE_ONLY)
    object.className = className;
#endif
    runtimeObjectCreationFunctionTable[object.GetName()] =
        [](RuntimeScene & scene, const gd::Object & object) -> std::unique_ptr<RuntimeObject> {
            try
            {
                const T& derivedObject = dynamic_cast<const T&>(object);
                return gd::make_unique<U>(scene, derivedObject);
            }
            catch(const std::bad_cast &e)
            {
                std::cout << "Tried to create a RuntimeObject from an invalid gd::Object: " << std::endl;
                std::cout << e.what() << std::endl;
            }

            return std::unique_ptr<U>();
        };
}

#endif
