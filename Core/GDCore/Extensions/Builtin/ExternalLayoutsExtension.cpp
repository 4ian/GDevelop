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
          _("External layouts hold instances placed apart from a scene, "
            "using the objects and layers of the scene they are associated "
            "with. Their instances are not created when the scene starts: "
            "the scene creates them when needed, with the action to create "
            "objects from an external layout, at their editor positions "
            "(offset by an origin), on their layer, with their size, angle, "
            "Z order, visibility and instance variables. The objects and "
            "layers used must exist in the scene creating them (any "
            "external layout of the project can be loaded, not only the "
            "ones associated with the scene). Nothing is removed first: "
            "creating the same external layout again duplicates its "
            "objects, so delete the previous instances (for example the "
            "previous level) before loading new ones. Typical uses: the "
            "levels of a game built in a single scene (one external layout "
            "per level, loaded at the beginning of the scene according to "
            "a variable), a room or an enemy wave spawned on demand. For a "
            "UI panel, a custom object is usually a better fit (it is "
            "reusable, resizable and can hold its own logic); use an "
            "external layout for a simple, one-off UI screen."),
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
                   "layout, as placed in its editor (positions offset by the "
                   "given origin). Nothing is removed first: calling the "
                   "action again creates the objects again."),
                 _("Create objects from the external layout named _PARAM1_ at position _PARAM2_;_PARAM3_;_PARAM4_"),
                 "",
                 "res/ribbon_default/externallayout32.png",
                 "res/ribbon_default/externallayout32.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("externalLayoutName", _("Name of the external layout"))
      .AddParameter("expression", _("X position of the origin"), "", true)
      .SetParameterLongDescription(
          _("Added to the X position of every created instance (0 keeps the "
            "positions of the external layout)."))
      .SetDefaultValue("0")
      .AddParameter("expression", _("Y position of the origin"), "", true)
      .SetParameterLongDescription(
          _("Added to the Y position of every created instance."))
      .SetDefaultValue("0")
      .AddParameter("expression", _("Z position of the origin"), "", true)
      .SetParameterLongDescription(
          _("Added to the Z position of every created 3D instance."))
      .SetDefaultValue("0")
      .MarkAsAdvanced();
}

}  // namespace gd
