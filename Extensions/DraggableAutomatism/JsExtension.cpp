/**

GDevelop - Draggable Automatism Extension
Copyright (c) 2014 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Version.h"
#include <boost/version.hpp>
#include <iostream>

void DeclareDraggableAutomatismExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class DraggableAutomatismJsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    DraggableAutomatismJsExtension()
    {
        SetExtensionInformation("DraggableAutomatism",
                              _("Draggable Automatism"),
                              _("Automatism allowing to move objects with the mouse"),
                              "Florian Rival",
                              "Open source (MIT License)");

        DeclareDraggableAutomatismExtension(*this);

        GetAutomatismMetadata("DraggableAutomatism::Draggable").SetIncludeFile("DraggableAutomatism/draggableruntimeautomatism.js");
        GetAllConditionsForAutomatism("DraggableAutomatism::Draggable")["DraggableAutomatism::Dragged"].codeExtraInformation
            .SetFunctionName("isDragged").SetIncludeFile("DraggableAutomatism/draggableruntimeautomatism.js");
        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~DraggableAutomatismJsExtension() {};
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSDraggableAutomatismExtension() {
    return new DraggableAutomatismJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new DraggableAutomatismJsExtension;
}
#endif
#endif
