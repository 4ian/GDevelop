/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API
BuiltinExtensionsImplementer::ImplementsExternalLayoutsExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinExternalLayouts",
          _("External layouts"),
          _("An external layout holds instances placed apart from a scene, "
            "using the objects and layers of the scene it is associated "
            "with. Its instances are not created when the scene starts: the "
            "scene creates them when needed, with the action to create "
            "objects from an external layout. Use external layouts to build "
            "the levels of a game in a single scene (one external layout per "
            "level, the level to load chosen by a variable), to reuse a set "
            "of instances in one or several scenes (a UI panel, a room, an "
            "enemy wave) or to spawn a prepared group of objects at a given "
            "position."),
          "Florian Rival",
          "Open source (MIT License)")
      .SetShortDescription("Create objects from an external layout to reuse level sections or UI templates.")
      .SetExtensionHelpPath("/interface/scene-editor/external-layouts")
      .SetCategory("Advanced");
  extension.AddInstructionOrExpressionGroupMetadata(_("External layouts"))
      .SetIcon("res/ribbon_default/externallayout32.png");

  extension
      .AddAction("CreateObjectsFromExternalLayout",
                 _("Create objects from an external layout"),
                 _("Create in the scene all the instances of an external "
                   "layout, as placed in its editor: each object is created "
                   "at its position (offset by the given origin), on its "
                   "layer, with its size, angle, Z order, visibility and "
                   "instance variables. The objects and layers used by the "
                   "external layout must exist in the current scene (any "
                   "external layout of the project can be loaded, not only "
                   "the ones associated with this scene). Nothing is removed "
                   "first: calling the action again creates the objects "
                   "again, so delete the previous instances (for example the "
                   "previous level) before loading new ones. Typical uses: "
                   "load the level chosen by a variable at the beginning of "
                   "the scene, show a UI panel or spawn an enemy wave on "
                   "demand."),
                 _("Create objects from the external layout named _PARAM1_ at position _PARAM2_;_PARAM3_;_PARAM4_"),
                 "",
                 "res/ribbon_default/externallayout32.png",
                 "res/ribbon_default/externallayout32.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("externalLayoutName", _("Name of the external layout"))
      .AddParameter("expression",
                    _("X position of the origin (added to the X position of "
                      "every created instance, 0 to keep the positions of "
                      "the external layout)"),
                    "",
                    true)
      .SetDefaultValue("0")
      .AddParameter("expression",
                    _("Y position of the origin (added to the Y position of "
                      "every created instance)"),
                    "",
                    true)
      .SetDefaultValue("0")
      .AddParameter("expression",
                    _("Z position of the origin (added to the Z position of "
                      "every created 3D instance)"),
                    "",
                    true)
      .SetDefaultValue("0")
      .MarkAsAdvanced();
}

}  // namespace gd
