/**

GDevelop - DestroyOutside Extension
Copyright (c) 2014 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Version.h"
#include <boost/version.hpp>
#include <iostream>

void DeclareDestroyOutsideAutomatismExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class DestroyOutsideAutomatismJsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    DestroyOutsideAutomatismJsExtension()
    {
        SetExtensionInformation("DestroyOutsideAutomatism",
                              _("Destroy Outside Screen Automatism"),
                              _("Automatism destroying object when they go outside the screen"),
                              "Florian Rival",
                              "Open source (MIT License)");
        DeclareDestroyOutsideAutomatismExtension(*this);

        GetAutomatismMetadata("DestroyOutsideAutomatism::DestroyOutside").SetIncludeFile("DestroyOutsideAutomatism/destroyoutsideruntimeautomatism.js");

        GetAllConditionsForAutomatism("DestroyOutsideAutomatism::DestroyOutside")["DestroyOutsideAutomatism::ExtraBorder"].codeExtraInformation
            .SetFunctionName("getExtraBorder").SetIncludeFile("DestroyOutsideAutomatism/destroyoutsideruntimeautomatism.js");
        GetAllActionsForAutomatism("DestroyOutsideAutomatism::DestroyOutside")["DestroyOutsideAutomatism::ExtraBorder"].codeExtraInformation
            .SetFunctionName("setExtraBorder").SetAssociatedGetter("getExtraBorder").SetIncludeFile("DestroyOutsideAutomatism/destroyoutsideruntimeautomatism.js");

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~DestroyOutsideAutomatismJsExtension() {};
};

//We need a specific function to create the extension with emscripten.
#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSDestroyOutsideAutomatismExtension() {
    return new DestroyOutsideAutomatismJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new DestroyOutsideAutomatismJsExtension;
}

/**
 * Used by GDevelop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDJSExtension(gd::PlatformExtension * p) {
    delete p;
}
#endif
#endif
