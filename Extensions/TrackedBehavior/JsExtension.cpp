/**

GDevelop - Tracked Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"


#include <iostream>

void DeclareTrackedBehaviorExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class TrackedBehaviorJsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    TrackedBehaviorJsExtension()
    {
        SetExtensionInformation("TrackedBehavior",
                              _("Tracked Behavior"),
                              _("Behavior allowing to move objects with the mouse"),
                              "Florian Rival",
                              "Open source (MIT License)");

        DeclareTrackedBehaviorExtension(*this);

        GetBehaviorMetadata("TrackedBehavior::Tracked").SetIncludeFile("TrackedBehavior/trackedruntimebehavior.js");
        GetAllConditions()["TrackedBehavior::TrackedBehaviorAround"].SetFunctionName("gdjs.TrackedRuntimeBehavior.aroundTest").SetIncludeFile("TrackedBehavior/trackedruntimebehavior.js");
        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSTrackedBehaviorExtension() {
    return new TrackedBehaviorJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new TrackedBehaviorJsExtension;
}
#endif
#endif
