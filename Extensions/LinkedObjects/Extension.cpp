/**

GDevelop - LinkedObjects Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"
#include "ObjectsLinksManager.h"

#include <iostream>

void DeclareLinkedObjectsExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "LinkedObjects",
          _("Linked objects"),
          _("This Extension can virtually link two objects."),
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/linked-objects");

#if defined(GD_IDE_ONLY)

  extension
      .AddAction("LinkObjects",
                 _("Link two objects"),
                 _("Link two objects together, so as to be able to get one "
                   "from the other."),
                 _("Link _PARAM1_ and _PARAM2_"),
                 _("Linked objects"),
                 "CppPlatform/Extensions/LinkedObjectsicon24.png",
                 "CppPlatform/Extensions/LinkedObjectsicon16.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("objectPtr", _("Object 1"))
      .AddParameter("objectPtr", _("Object 2"))

      .SetFunctionName("GDpriv::LinkedObjects::LinkObjects")
      .SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");

  extension
      .AddAction("RemoveLinkBetween",
                 _("Unlink two objects"),
                 _("Unlink two objects."),
                 _("Unlink _PARAM1_ and _PARAM2_"),
                 _("Linked objects"),
                 "CppPlatform/Extensions/LinkedObjectsicon24.png",
                 "CppPlatform/Extensions/LinkedObjectsicon16.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("objectPtr", _("Object 1"))
      .AddParameter("objectPtr", _("Object 2"))

      .SetFunctionName("GDpriv::LinkedObjects::RemoveLinkBetween")
      .SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");

  extension
      .AddAction("RemoveAllLinksOf",
                 _("Unlink all objects from an object"),
                 _("Unlink all objects from an object."),
                 _("Unlink all objects from _PARAM1_"),
                 _("Linked objects"),
                 "CppPlatform/Extensions/LinkedObjectsicon24.png",
                 "CppPlatform/Extensions/LinkedObjectsicon16.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("objectPtr", _("Object"))

      .SetFunctionName("GDpriv::LinkedObjects::RemoveAllLinksOf")
      .SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");

  extension
      .AddCondition("PickObjectsLinkedTo",
                    _("Take into account linked objects"),
                    _("Take some objects linked to the object into account for "
                      "next conditions and actions.\nThe condition will return "
                      "false if no object was taken into account."),
                    _("Take into account all \"_PARAM1_\" linked to _PARAM2_"),
                    _("Linked objects"),
                    "CppPlatform/Extensions/LinkedObjectsicon24.png",
                    "CppPlatform/Extensions/LinkedObjectsicon16.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("objectList", _("Pick these objects..."))
      .AddParameter("objectPtr", _("...if they are linked to this object"))

      .SetFunctionName("GDpriv::LinkedObjects::PickObjectsLinkedTo")
      .SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");

  extension
      .AddAction(
          "PickObjectsLinkedTo",
          _("Take into account linked objects"),
          _("Take objects linked to the object into account for next actions."),
          _("Take into account all \"_PARAM1_\" linked to _PARAM2_"),
          _("Linked objects"),
          "CppPlatform/Extensions/LinkedObjectsicon24.png",
          "CppPlatform/Extensions/LinkedObjectsicon16.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("objectList", _("Pick these objects..."))
      .AddParameter("objectPtr", _("...if they are linked to this object"))

      .SetFunctionName("GDpriv::LinkedObjects::PickObjectsLinkedTo")
      .SetIncludeFile("LinkedObjects/LinkedObjectsTools.h");

#endif
}

/**
 * \brief This class declares information about the extension.
 */
class LinkedObjectsCppExtension : public ExtensionBase {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  LinkedObjectsCppExtension() {
    DeclareLinkedObjectsExtension(*this);
    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };

  /**
   * The extension must be aware of objects deletion
   */
  virtual bool ToBeNotifiedOnObjectDeletion() { return true; }

  /**
   * Be sure to remove all links when an object is deleted
   */
  virtual void ObjectDeletedFromScene(RuntimeScene& scene,
                                      RuntimeObject* object) {
    GDpriv::LinkedObjects::ObjectsLinksManager::managers[&scene]
        .RemoveAllLinksOf(object);
  }

  /**
   * Initialize manager of linked objects of scene
   */
  virtual void SceneLoaded(RuntimeScene& scene) {
    GDpriv::LinkedObjects::ObjectsLinksManager::managers[&scene].ClearAll();
  }

  /**
   * Destroy manager of linked objects of scene
   */
  virtual void SceneUnloaded(RuntimeScene& scene) {
    GDpriv::LinkedObjects::ObjectsLinksManager::managers.erase(&scene);
  }
};

#if defined(ANDROID)
extern "C" ExtensionBase* CreateGDCppLinkedObjectsExtension() {
  return new LinkedObjectsCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase* GD_EXTENSION_API CreateGDExtension() {
  return new LinkedObjectsCppExtension;
}
#endif
