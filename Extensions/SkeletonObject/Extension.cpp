
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include "SkeletonObject.h"

void DeclareSkeletonObjectExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("SkeletonObject",
                          _("Skeleton"),
                          _("Enables the use of animated skeleton objects.\nCurrently supported formats:\n    *DragonBones"),
                          "Franco Maciel",
                          "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject<SkeletonObject>(
               "Skeleton",
               _("Skeleton"),
               _("Object animated through bones"),
               "JsPlatform/Extensions/admobicon.png");

    #if !defined(GD_NO_WX_GUI)
    SkeletonObject::LoadEdittimeIcon();
    #endif

    obj.AddAction("SayHello",
        _("Say hello"),
        _("Displays a welcome message"),
        _("Say hello from _PARAM0_"),
        _(""),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");
}
