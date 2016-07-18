/**

GDevelop - SystemInfo Extension
Copyright (c) 2016  Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Version.h"
#include "GDCore/Tools/Localization.h"

/**
 * \brief This class declares information about the JS extension.
 */
class JsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    JsExtension()
    {
        SetExtensionInformation("SystemInfo",
            _("System information"),
            _("Provides information about the system running the game"),
            "Florian Rival",
            "Open source (MIT License)");

        CloneExtension("GDevelop C++ platform", "SystemInfo");

        GetAllConditions()["SystemInfo::IsMobile"].codeExtraInformation.SetIncludeFile("SystemInfo/systeminfotools.js")
            .SetFunctionName("gdjs.evtTools.systemInfo.isMobile");

        StripUnimplementedInstructionsAndExpressions();
    };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new JsExtension;
}
#endif
