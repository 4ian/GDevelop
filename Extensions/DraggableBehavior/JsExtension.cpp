/**

GDevelop - Draggable Behavior Extension
Copyright (c) 2014-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Version.h"

#include <iostream>

void DeclareDraggableBehaviorExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class DraggableBehaviorJsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    DraggableBehaviorJsExtension()
    {
        SetExtensionInformation("DraggableBehavior",
                              _("Draggable Behavior"),
                              _("Behavior allowing to move objects with the mouse"),
                              "Florian Rival",
                              "Open source (MIT License)");

        DeclareDraggableBehaviorExtension(*this);

        GetBehaviorMetadata("DraggableBehavior::Draggable").SetIncludeFile("DraggableBehavior/draggableruntimebehavior.js");
        GetAllConditionsForBehavior("DraggableBehavior::Draggable")["DraggableBehavior::Dragged"].SetFunctionName("isDragged").SetIncludeFile("DraggableBehavior/draggableruntimebehavior.js");
        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSDraggableBehaviorExtension() {
    return new DraggableBehaviorJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new DraggableBehaviorJsExtension;
}
#endif
#endif
