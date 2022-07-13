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
      "Open source (MIT License)")
      .SetCategory("Device");
  extension.AddInstructionOrExpressionGroupMetadata(_("System information"))
      .SetIcon("CppPlatform/Extensions/systeminfoicon.png");

  extension
      .AddCondition(
          "IsMobile",
          _("Is a mobile device"),
          _("Check if the device running the game is a mobile device"),
          _("The device is a mobile device"),
          "",
          "CppPlatform/Extensions/systeminfoicon.png",
          "CppPlatform/Extensions/systeminfoicon.png")

      .SetFunctionName("SystemInfo::IsMobile");

  extension
      .AddCondition("IsWebGLSupported",
                    _("Is WebGL supported"),
                    _("Check if GPU accelerated WebGL is supported on the "
                      "target device."),
                    _("WebGL is available"),
                    "",
                    "CppPlatform/Extensions/systeminfoicon.png",
                    "CppPlatform/Extensions/systeminfoicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .SetFunctionName("SystemInfo::IsWebGLSupported");

  extension
      .AddCondition(
          "IsPreview",
          _("Is the game running as a preview"),
          _("Check if the game is currently being previewed in the editor. "
            "This can be used to enable a \"Debug mode\" or do some work only "
            "in previews."),
          _("The game is being previewed in the editor"),
          "",
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
          "",
          "CppPlatform/Extensions/systeminfoicon.png",
          "CppPlatform/Extensions/systeminfoicon.png")

      .AddCodeOnlyParameter("currentScene", "");
}
