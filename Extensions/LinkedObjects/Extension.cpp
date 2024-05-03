/**

GDevelop - LinkedObjects Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <iostream>

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

void DeclareLinkedObjectsExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "LinkedObjects",
          _("Linked objects"),
          "These actions and conditions allow to virtually link two objects. "
          "It's then useful in the events to quickly retrieve one or more "
          "objects attached to another. For example, this can be used to link "
          "some equipment objects with the character holding them. More "
          "generally, this can be used to store and retrieve objects in a way "
          "that is more efficient than using variables.",
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/linked-objects")
      .SetCategory("Advanced");
  extension.AddInstructionOrExpressionGroupMetadata(_("Linked objects"))
      .SetIcon("CppPlatform/Extensions/LinkedObjectsicon24.png");

  extension
      .AddAction("LinkObjects",
                 _("Link two objects"),
                 _("Link two objects together, so as to be able to get one "
                   "from the other."),
                 _("Link _PARAM1_ and _PARAM2_"),
                 _("Objects"),
                 "CppPlatform/Extensions/LinkedObjectsicon24.png",
                 "CppPlatform/Extensions/LinkedObjectsicon24.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("objectPtr", _("Object 1"))
      .AddParameter("objectPtr", _("Object 2"))

      .SetFunctionName("GDpriv::LinkedObjects::LinkObjects");

  extension
      .AddAction("RemoveLinkBetween",
                 _("Unlink two objects"),
                 _("Unlink two objects."),
                 _("Unlink _PARAM1_ and _PARAM2_"),
                 _("Objects"),
                 "CppPlatform/Extensions/LinkedObjectsicon24.png",
                 "CppPlatform/Extensions/LinkedObjectsicon24.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("objectPtr", _("Object 1"))
      .AddParameter("objectPtr", _("Object 2"))

      .SetFunctionName("GDpriv::LinkedObjects::RemoveLinkBetween");

  extension
      .AddAction("RemoveAllLinksOf",
                 _("Unlink all objects from an object"),
                 _("Unlink all objects from an object."),
                 _("Unlink all objects from _PARAM1_"),
                 _("Objects"),
                 "CppPlatform/Extensions/LinkedObjectsicon24.png",
                 "CppPlatform/Extensions/LinkedObjectsicon24.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("objectPtr", _("Object"))

      .SetFunctionName("GDpriv::LinkedObjects::RemoveAllLinksOf");

  extension
      .AddCondition("PickObjectsLinkedTo",
                    _("Take into account linked objects"),
                    _("Take some objects linked to the object into account for "
                      "next conditions and actions.\nThe condition will return "
                      "false if no object was taken into account."),
                    _("Take into account all \"_PARAM1_\" linked to _PARAM2_"),
                    _("Objects"),
                    "CppPlatform/Extensions/LinkedObjectsicon24.png",
                    "CppPlatform/Extensions/LinkedObjectsicon24.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("objectList", _("Pick these objects..."))
      .AddParameter("objectPtr", _("...if they are linked to this object"))
      .AddCodeOnlyParameter("eventsFunctionContext", "")

      .SetFunctionName("GDpriv::LinkedObjects::PickObjectsLinkedTo");

  extension
      .AddAction(
          "PickObjectsLinkedTo",
          _("Take into account linked objects"),
          _("Take objects linked to the object into account for next actions."),
          _("Take into account all \"_PARAM1_\" linked to _PARAM2_"),
          _("Objects"),
          "CppPlatform/Extensions/LinkedObjectsicon24.png",
          "CppPlatform/Extensions/LinkedObjectsicon24.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("objectList", _("Pick these objects..."))
      .AddParameter("objectPtr", _("...if they are linked to this object"))
      .AddCodeOnlyParameter("eventsFunctionContext", "")

      .SetFunctionName("GDpriv::LinkedObjects::PickObjectsLinkedTo");
}
