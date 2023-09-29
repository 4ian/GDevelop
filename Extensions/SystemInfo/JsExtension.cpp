/**

GDevelop - SystemInfo Extension
Copyright (c) 2016  Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include "GDCore/Tools/Localization.h"

void DeclareSystemInfoExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class SystemInfoJsExtension : public gd::PlatformExtension {
 public:
  /**
   * \brief Constructor of an extension declares everything the extension
   * contains: objects, actions, conditions and expressions.
   */
  SystemInfoJsExtension() {
    DeclareSystemInfoExtension(*this);

    GetAllConditions()["SystemInfo::IsMobile"]
        .SetIncludeFile("Extensions/SystemInfo/systeminfotools.js")
        .SetFunctionName("gdjs.evtTools.systemInfo.isMobile");
    GetAllConditions()["SystemInfo::IsNativeMobileApp"]
        .SetIncludeFile("Extensions/SystemInfo/systeminfotools.js")
        .SetFunctionName("gdjs.evtTools.systemInfo.isNativeMobileApp");
    GetAllConditions()["SystemInfo::IsNativeDesktopApp"]
        .SetIncludeFile("Extensions/SystemInfo/systeminfotools.js")
        .SetFunctionName("gdjs.evtTools.systemInfo.isNativeDesktopApp");
    GetAllConditions()["SystemInfo::IsWebGLSupported"]
        .SetIncludeFile("Extensions/SystemInfo/systeminfotools.js")
        .SetFunctionName("gdjs.evtTools.systemInfo.isWebGLSupported");
    GetAllConditions()["SystemInfo::IsPreview"]
        .SetIncludeFile("Extensions/SystemInfo/systeminfotools.js")
        .SetFunctionName("gdjs.evtTools.systemInfo.isPreview");
    GetAllConditions()["SystemInfo::HasTouchScreen"]
        .SetIncludeFile("Extensions/SystemInfo/systeminfotools.js")
        .SetFunctionName("gdjs.evtTools.systemInfo.hasTouchScreen");

    StripUnimplementedInstructionsAndExpressions();
    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSSystemInfoExtension() {
  return new SystemInfoJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new SystemInfoJsExtension;
}
#endif
#endif
