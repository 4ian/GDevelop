/**

Game Develop - DestroyOutside Automatism Extension
Copyright (c) 2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "DestroyOutsideAutomatism.h"
#include <boost/version.hpp>

void DeclareDestroyOutsideAutomatismExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("DestroyOutsideAutomatism",
                              _("Destroy Outside Screen Automatism"),
                              _("Automatism destroying object when they go outside the screen"),
                              "Florian Rival",
                              "zlib/libpng License (Open Source)");

    gd::AutomatismMetadata & aut = extension.AddAutomatism("DestroyOutside",
          _("Destroy when outside the screen"),
          _("DestroyOutside"),
          _("Automatically destroy the object when it goes outside the screen"),
          "",
          "CppPlatform/Extensions/destroyoutsideicon.png",
          "DestroyOutsideAutomatism",
          boost::shared_ptr<gd::Automatism>(new DestroyOutsideAutomatism),
          boost::shared_ptr<gd::AutomatismsSharedData>());

    #if defined(GD_IDE_ONLY)
    aut.SetIncludeFile("DestroyOutsideAutomatism/DestroyOutsideAutomatism.h");

    aut.AddCondition("ExtraBorder",
                   _("Additional border"),
                   _("Compare the additional border that the object must cross before being deleted."),
                   _("The additional border of _PARAM0_ is _PARAM2__PARAM3_"),
                   _(""),
                   "CppPlatform/Extensions/destroyoutsideicon24.png",
                   "CppPlatform/Extensions/destroyoutsideicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "DestroyOutside", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .codeExtraInformation.SetFunctionName("GetExtraBorder").SetIncludeFile("DestroyOutsideAutomatism/DestroyOutsideAutomatism.h");

    aut.AddAction("ExtraBorder",
                   _("Additional border"),
                   _("Change the additional border that the object must cross before being deleted."),
                   _("Do _PARAM2__PARAM3_ to the additional border of _PARAM0_"),
                   _(""),
                   "CppPlatform/Extensions/destroyoutsideicon24.png",
                   "CppPlatform/Extensions/destroyoutsideicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "DestroyOutside", false)
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("SetExtraBorder").SetManipulatedType("number")
        .SetAssociatedGetter("GetExtraBorder").SetIncludeFile("DestroyOutsideAutomatism/DestroyOutsideAutomatism.h");
    #endif

}

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    Extension()
    {
        DeclareDestroyOutsideAutomatismExtension(*this);
        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
};

#if !defined(EMSCRIPTEN)
/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}
#endif