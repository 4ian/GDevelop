/**

GDevelop - SystemInfo Extension
Copyright (c) 2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

void DeclareSystemInfoExtension(gd::PlatformExtension& extension) {
  extension.SetExtensionInformation(
      "SystemInfo",
      _("System information"),
      _("Get information about the system and device running the game."),
      "Florian Rival",
      "Open source (MIT License)");
  extension.AddInstructionOrExpressionGroupMetadata(_("System information"))
      .SetIcon("CppPlatform/Extensions/systeminfoicon.png");

#if defined(GD_IDE_ONLY)
  extension
      .AddCondition(
          "IsMobile",
          _("Is a mobile device"),
          _("Check if the device running the game is a mobile device"),
          _("The device is a mobile device"),
          _("System information"),
          "CppPlatform/Extensions/systeminfoicon.png",
          "CppPlatform/Extensions/systeminfoicon.png")

      .SetFunctionName("SystemInfo::IsMobile")
      .SetIncludeFile("SystemInfo/SystemInfoTools.h");

  extension
      .AddCondition("IsWebGLSupported",
                    _("Is WebGL supported"),
                    _("Check if GPU accelerated WebGL is supported on the "
                      "target device."),
                    _("WebGL is available"),
                    _("System information"),
                    "CppPlatform/Extensions/systeminfoicon.png",
                    "CppPlatform/Extensions/systeminfoicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .SetFunctionName("SystemInfo::IsWebGLSupported")
      .SetIncludeFile("SystemInfo/SystemInfoTools.h");

  extension
      .AddCondition(
          "IsPreview",
          _("Is the game running as a preview"),
          _("Check if the game is currently being previewed in the editor. "
            "This can be used to enable a \"Debug mode\" or do some work only "
            "in previews."),
          _("The game is being previewed in the editor"),
          _("System information"),
          "CppPlatform/Extensions/systeminfoicon.png",
          "CppPlatform/Extensions/systeminfoicon.png")

      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddCondition(
          "HasTouchScreen",
          _("Device has a touchscreen"),
          _("Check if the device running the game has a touchscreen (typically "
            "Android phones, iPhones, iPads, but also some laptops)."),
          _("The device has a touchscreen"),
          _("System information"),
          "CppPlatform/Extensions/systeminfoicon.png",
          "CppPlatform/Extensions/systeminfoicon.png")

      .AddCodeOnlyParameter("currentScene", "");
#endif
}
