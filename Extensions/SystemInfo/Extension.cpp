/**

GDevelop - SystemInfo Extension
Copyright (c) 2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCore/Tools/Version.h"

/**
 * \brief This class declares information about the extension.
 */
class SystemInfoCppExtension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    SystemInfoCppExtension()
    {
        SetExtensionInformation("SystemInfo",
            _("System information"),
            _("Provides information about the system running the game"),
            "Florian Rival",
            "Open source (MIT License)");

        #if defined(GD_IDE_ONLY)
        AddCondition("IsMobile",
            _("Is a mobile device"),
            _("Check if the device running the game is a mobile device"),
            _("The device is a mobile device"),
            _("System information"),
            "CppPlatform/Extensions/systeminfoicon24.png",
            "CppPlatform/Extensions/systeminfoicon16.png")

            .SetFunctionName("SystemInfo::IsMobile").SetIncludeFile("SystemInfo/SystemInfoTools.h");
        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(ANDROID)
extern "C" ExtensionBase * CreateGDCppSystemInfoExtension() {
    return new SystemInfoCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new SystemInfoCppExtension;
}
#endif
