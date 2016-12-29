/**

GDevelop - Tracked Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "TrackedBehavior.h"


void DeclareTrackedBehaviorExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("TrackedBehavior",
                              _("Tracked Behavior"),
                              _("TODO"),
                              "Florian Rival",
                              "Open source (MIT License)");

    gd::BehaviorMetadata & aut = extension.AddBehavior("Tracked",
          _("Tracked object"),
          _("Tracked"),
          _("TODO"),
          "",
          "CppPlatform/Extensions/draggableicon.png", //TODO
          "TrackedBehavior",
          std::make_shared<TrackedBehavior>(),
          std::shared_ptr<gd::BehaviorsSharedData>());

    #if defined(GD_IDE_ONLY)
    aut.SetIncludeFile("TrackedBehavior/TrackedBehavior.h");

    extension.AddCondition("TrackedBehaviorAround",
                   _("Get objects around a position"),
                   _("Get the objects that are around the specified position"),
                   _("Consider all _PARAM1_ around _PARAM2_;_PARAM3_, with maximum distance: _PARAM4_ pixels"),
                   _(""),
                   "CppPlatform/Extensions/draggableicon24.png",
                   "CppPlatform/Extensions/draggableicon16.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectListWithoutPicking", _("Objects to find"))
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .AddParameter("expression", _("Maximum distance (in pixels)"))

        .SetFunctionName("TODO").SetIncludeFile("TrackedBehavior/TrackedBehavior.h");
    #endif

}

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
        DeclareTrackedBehaviorExtension(*this);
        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
#endif
