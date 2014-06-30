/**

Game Develop - LinkedObjects Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDCpp/ExtensionBase.h"
#include "ObjectsLinksManager.h"
#include "GDCore/Tools/Version.h"
#include <boost/version.hpp>
#include <iostream>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("LinkedObjects",
                              _("Linked objects"),
                              _("Extension allowing to virtually link two objects."),
                              "Florian Rival",
                              "zlib/libpng License (Open Source)");

        #if defined(GD_IDE_ONLY)

        AddAction("LinkObjects",
                       _("Link two objects"),
                       _("Link two objects together, so as to be able to get one from the other."),
                       _("Link _PARAM1_ and _PARAM2_"),
                       _("Linked objects"),
                       "CppPlatform/Extensions/LinkedObjectsicon24.png",
                       "CppPlatform/Extensions/LinkedObjectsicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("objectPtr", _("Object 1"))
            .AddParameter("objectPtr", _("Object 2"))

            .codeExtraInformation.SetFunctionName("GDpriv::LinkedObjects::LinkObjects").SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");

        AddAction("RemoveLinkBetween",
                       _("Unlink two objects"),
                       _("Unlink two objects."),
                       _("Unlink _PARAM1_ and _PARAM2_"),
                       _("Linked objects"),
                       "CppPlatform/Extensions/LinkedObjectsicon24.png",
                       "CppPlatform/Extensions/LinkedObjectsicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("objectPtr", _("Object 1"))
            .AddParameter("objectPtr", _("Object 2"))

            .codeExtraInformation.SetFunctionName("GDpriv::LinkedObjects::RemoveLinkBetween").SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");

        AddAction("RemoveAllLinksOf",
                       _("Unlink all objects from an object"),
                       _("Unlink all objects from an object."),
                       _("Unlink all objects from _PARAM1_"),
                       _("Linked objects"),
                       "CppPlatform/Extensions/LinkedObjectsicon24.png",
                       "CppPlatform/Extensions/LinkedObjectsicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("objectPtr", _("Object"))

            .codeExtraInformation.SetFunctionName("GDpriv::LinkedObjects::RemoveAllLinksOf").SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");

        AddCondition("PickObjectsLinkedTo",
                       _("Take into account linked objects"),
                       _("Take some objects linked to the object into account for next conditions and actions.\nThe condition will return false if no object was taken into account."),
                       _("Take into account all \"_PARAM1_\" linked to _PARAM2_"),
                       _("Linked objects"),
                       "CppPlatform/Extensions/LinkedObjectsicon24.png",
                       "CppPlatform/Extensions/LinkedObjectsicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("objectList", "Pick these objects...")
            .AddParameter("objectPtr", _("...if they are linked to this object"))

            .codeExtraInformation.SetFunctionName("GDpriv::LinkedObjects::PickObjectsLinkedTo").SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");


        AddAction("PickObjectsLinkedTo",
                       _("Take into account linked objects"),
                       _("Take objects linked to the object into account for next actions."),
                       _("Take into account all \"_PARAM1_\" linked to _PARAM2_"),
                       _("Linked objects"),
                       "CppPlatform/Extensions/LinkedObjectsicon24.png",
                       "CppPlatform/Extensions/LinkedObjectsicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("objectList", "Pick these objects...")
            .AddParameter("objectPtr", _("...if they are linked to this object"))

            .codeExtraInformation.SetFunctionName("GDpriv::LinkedObjects::PickObjectsLinkedTo").SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");

        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};

    /**
     * The extension must be aware of objects deletion
     */
    virtual bool ToBeNotifiedOnObjectDeletion() { return true; }

    /**
     * Be sure to remove all links when an object is deleted
     */
    virtual void ObjectDeletedFromScene(RuntimeScene & scene, RuntimeObject * object)
    {
        GDpriv::LinkedObjects::ObjectsLinksManager::managers[&scene].RemoveAllLinksOf(object);
    }

    /**
     * Initialize manager of linked objects of scene
     */
    virtual void SceneLoaded(RuntimeScene & scene)
    {
        GDpriv::LinkedObjects::ObjectsLinksManager::managers[&scene].ClearAll();
    }

    /**
     * Destroy manager of linked objects of scene
     */
    virtual void SceneUnloaded(RuntimeScene & scene)
    {
        GDpriv::LinkedObjects::ObjectsLinksManager::managers.erase(&scene);
    }
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}

