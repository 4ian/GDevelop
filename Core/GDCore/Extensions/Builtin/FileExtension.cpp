/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsFileExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinFile",
          _("Storage"),
          "Actions and conditions to store data (like the player progress or "
          "anything else to be persisted across game sessions). Data are "
          "stored on the device and erased when the game is uninstalled.",
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/storage")
      .SetCategory("Advanced");
  extension.AddInstructionOrExpressionGroupMetadata(_("Storage"))
      .SetIcon("res/conditions/fichier24.png");

  extension
      .AddCondition(
          "GroupExists",
          _("Existence of a group"),
          _("Check if an element (example : PlayerState/CurrentLevel) exists "
            "in the stored data.\nSpaces are forbidden in element names."),
          _("_PARAM1_ exists in storage _PARAM0_"),
          "",
          "res/conditions/fichier24.png",
          "res/conditions/fichier.png")
      .AddParameter("string", _("Storage name"))
      .AddParameter("string", _("Group"))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "LoadFile",
          _("Load a storage in memory"),
          _("This action loads the specified storage in memory, so you can "
            "write and read it.\nYou can open and write without using this "
            "action, but it will be slower.\nIf you use this action, do not "
            "forget to unload the storage from memory."),
          _("Load storage _PARAM0_ in memory"),
          "",
          "res/actions/fichier24.png",
          "res/actions/fichier.png")
      .AddParameter("string", _("Storage name"))
      .MarkAsAdvanced();

  extension
      .AddAction("UnloadFile",
                 _("Close a storage"),
                 _("This action closes the structured data previously loaded "
                   "in memory, saving all changes made."),
                 _("Close structured data _PARAM0_"),
                 "",
                 "res/actions/fichier24.png",
                 "res/actions/fichier.png")
      .AddParameter("string", _("Storage name"))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "EcrireFichierExp",
          _("Save a value"),
          _("Save the result of the expression in the stored data, in the "
            "specified element.\nSpecify the structure leading to the "
            "element using / (example : Root/Level/Current)\nSpaces are "
            "forbidden in element names."),
          _("Save _PARAM2_ in _PARAM1_ of storage _PARAM0_"),
          "",
          "res/actions/fichier24.png",
          "res/actions/fichier.png")
      .AddParameter("string", _("Storage name"))
      .AddParameter("string", _("Group"))
      .AddParameter("expression", _("Expression"));

  extension
      .AddAction(
          "EcrireFichierTxt",
          _("Save a text"),
          _("Save the text in the specified storage, in the specified "
            "element.\nSpecify "
            "the structure leading to the element using / (example : "
            "Root/Level/Current)\nSpaces are forbidden in element names."),
          _("Save _PARAM2_ in _PARAM1_ of storage _PARAM0_"),
          "",
          "res/actions/fichier24.png",
          "res/actions/fichier.png")
      .AddParameter("string", _("Storage name"))
      .AddParameter("string", _("Group"))
      .AddParameter("string", _("Text"));

  extension
      .AddAction(
          "LireFichierExp",
          _("Load a value"),
          _("Load the value saved in the specified element and store it in a "
            "scene "
            "variable.\nSpecify the structure leading to the element using / "
            "(example : Root/Level/Current)\nSpaces are forbidden in element "
            "names."),
          _("Load _PARAM1_ from storage _PARAM0_ and store value in _PARAM3_"),
          "",
          "res/actions/fichier24.png",
          "res/actions/fichier.png")
      .AddParameter("string", _("Storage name"))
      .AddParameter("string", _("Group"))
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("scenevar", _("Scene variables"));

  extension
      .AddAction(
          "LireFichierTxt",
          _("Load a text"),
          _("Load the text saved in the specified element and store it in a "
            "scene "
            "variable.\nSpecify the structure leading to the element using / "
            "(example : Root/Level/Current)\nSpaces are forbidden in element "
            "names."),
          _("Load _PARAM1_ from storage _PARAM0_ and store as text in "
            "_PARAM3_"),
          "",
          "res/actions/fichier24.png",
          "res/actions/fichier.png")
      .AddParameter("string", _("Storage name"))
      .AddParameter("string", _("Group"))
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("scenevar", _("Scene variables"));

  extension
      .AddAction("DeleteGroupFichier",
                 _("Delete an element"),
                 _("This action deletes the specified element from the "
                   "specified storage.\nSpecify the structure leading to the "
                   "element using / (example : Root/Level/Current)\nSpaces are "
                   "forbidden in element names."),
                 _("Delete _PARAM1_ from storage _PARAM0_"),
                 "",
                 "res/actions/delete24.png",
                 "res/actions/delete.png")
      .AddParameter("string", _("Storage name"))
      .AddParameter("string", _("Group"))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "DeleteFichier",
          _("Clear a storage"),
          _("Clear the specified storage, removing all data saved in it."),
          _("Delete storage _PARAM0_"),
          "",
          "res/actions/delete24.png",
          "res/actions/delete.png")
      .AddParameter("string", _("Storage name"));

  extension
      .AddCondition("FileExists",
                    _("A storage exists"),
                    _("Test if the specified storage exists."),
                    _("Storage _PARAM0_ exists"),
                    "",
                    "res/conditions/fichier24.png",
                    "res/conditions/fichier.png")
      .AddParameter("string", _("Storage name"))
      .MarkAsAdvanced();

  extension
      .AddAction("ExecuteCmd",
                 _("Execute a command"),
                 _("This action executes the specified command."),
                 _("Execute _PARAM0_"),
                 _("Network"),
                 "res/actions/launchFile24.png",
                 "res/actions/launchFile.png")
      .AddParameter("string", _("Command"))
      .MarkAsAdvanced();
}

}  // namespace gd
