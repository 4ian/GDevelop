/**

GDevelop - DestroyOutside Automatism Extension
Copyright (c) 2014 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
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
                              "Open source (MIT License)");

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
                   "",
                   "CppPlatform/Extensions/destroyoutsideicon24.png",
                   "CppPlatform/Extensions/destroyoutsideicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "DestroyOutside", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .codeExtraInformation.SetFunctionName("GetExtraBorder").SetIncludeFile("DestroyOutsideAutomatism/DestroyOutsideAutomatism.h");

    aut.AddAction("ExtraBorder",
                   _("Additional border"),
                   _("Change the additional border that the object must cross before being deleted."),
                   _("Do _PARAM2__PARAM3_ to the additional border of _PARAM0_"),
                   "",
                   "CppPlatform/Extensions/destroyoutsideicon24.png",
                   "CppPlatform/Extensions/destroyoutsideicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "DestroyOutside", false)
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .MarkAsAdvanced()
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
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    Extension()
    {
        DeclareDestroyOutsideAutomatismExtension(*this);
        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
#endif
