/**

GDevelop - LinkedObjects Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "ObjectsLinksManager.h"
#include "GDCore/Tools/Version.h"

#include <iostream>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("LinkedObjects",
                              GD_T("Linked objects"),
                              GD_T("Extension allowing to virtually link two objects."),
                              "Florian Rival",
                              "Open source (MIT License)");

        #if defined(GD_IDE_ONLY)

        AddAction("LinkObjects",
                       GD_T("Link two objects"),
                       GD_T("Link two objects together, so as to be able to get one from the other."),
                       GD_T("Link _PARAM1_ and _PARAM2_"),
                       GD_T("Linked objects"),
                       "CppPlatform/Extensions/LinkedObjectsicon24.png",
                       "CppPlatform/Extensions/LinkedObjectsicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("objectPtr", GD_T("Object 1"))
            .AddParameter("objectPtr", GD_T("Object 2"))

            .codeExtraInformation.SetFunctionName("GDpriv::LinkedObjects::LinkObjects").SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");

        AddAction("RemoveLinkBetween",
                       GD_T("Unlink two objects"),
                       GD_T("Unlink two objects."),
                       GD_T("Unlink _PARAM1_ and _PARAM2_"),
                       GD_T("Linked objects"),
                       "CppPlatform/Extensions/LinkedObjectsicon24.png",
                       "CppPlatform/Extensions/LinkedObjectsicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("objectPtr", GD_T("Object 1"))
            .AddParameter("objectPtr", GD_T("Object 2"))

            .codeExtraInformation.SetFunctionName("GDpriv::LinkedObjects::RemoveLinkBetween").SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");

        AddAction("RemoveAllLinksOf",
                       GD_T("Unlink all objects from an object"),
                       GD_T("Unlink all objects from an object."),
                       GD_T("Unlink all objects from _PARAM1_"),
                       GD_T("Linked objects"),
                       "CppPlatform/Extensions/LinkedObjectsicon24.png",
                       "CppPlatform/Extensions/LinkedObjectsicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("objectPtr", GD_T("Object"))

            .codeExtraInformation.SetFunctionName("GDpriv::LinkedObjects::RemoveAllLinksOf").SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");

        AddCondition("PickObjectsLinkedTo",
                       GD_T("Take into account linked objects"),
                       GD_T("Take some objects linked to the object into account for next conditions and actions.\nThe condition will return false if no object was taken into account."),
                       GD_T("Take into account all \"_PARAM1_\" linked to _PARAM2_"),
                       GD_T("Linked objects"),
                       "CppPlatform/Extensions/LinkedObjectsicon24.png",
                       "CppPlatform/Extensions/LinkedObjectsicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("objectList", GD_T("Pick these objects..."))
            .AddParameter("objectPtr", GD_T("...if they are linked to this object"))

            .codeExtraInformation.SetFunctionName("GDpriv::LinkedObjects::PickObjectsLinkedTo").SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");


        AddAction("PickObjectsLinkedTo",
                       GD_T("Take into account linked objects"),
                       GD_T("Take objects linked to the object into account for next actions."),
                       GD_T("Take into account all \"_PARAM1_\" linked to _PARAM2_"),
                       GD_T("Linked objects"),
                       "CppPlatform/Extensions/LinkedObjectsicon24.png",
                       "CppPlatform/Extensions/LinkedObjectsicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("objectList", GD_T("Pick these objects..."))
            .AddParameter("objectPtr", GD_T("...if they are linked to this object"))

            .codeExtraInformation.SetFunctionName("GDpriv::LinkedObjects::PickObjectsLinkedTo").SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");

        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };

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
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
