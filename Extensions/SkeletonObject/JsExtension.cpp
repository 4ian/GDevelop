
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"

#include "SkeletonObject.h"

#include <iostream>

void DeclareSkeletonObjectExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class SkeletonObjectJsExtension : public gd::PlatformExtension
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    SkeletonObjectJsExtension()
    {
        DeclareSkeletonObjectExtension(*this);

        GetObjectMetadata("SkeletonObject::Skeleton")
            .SetIncludeFile("Extensions/SkeletonObject/Gskeletonruntimeobject.js")
            .AddIncludeFile("Extensions/SkeletonObject/Fskanimation.js")
            .AddIncludeFile("Extensions/SkeletonObject/Eskarmature.js")
            .AddIncludeFile("Extensions/SkeletonObject/Dskslot.js")
            .AddIncludeFile("Extensions/SkeletonObject/Cskbone.js")
            .AddIncludeFile("Extensions/SkeletonObject/Bskeletonruntimeobject-pixi-renderer.js")
            .AddIncludeFile("Extensions/SkeletonObject/Ask.js");

        GetAllActionsForObject("SkeletonObject::Skeleton")["SkeletonObject::SetSlotPositionX"].SetFunctionName("setSlotX").SetGetter("getSlotX");

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSSkeletonObjectExtension() {
    return new SkeletonObjectJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new SkeletonObjectJsExtension;
}
#endif
#endif
