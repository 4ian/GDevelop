/**

GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "DestroyOutsideBehavior.h"


void DeclareDestroyOutsideBehaviorExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("DestroyOutsideBehavior",
                              _("Destroy Outside Screen Behavior"),
                              _("This Extension can be used to destroy objects when they go outside of the borders of the game's window."),
                              "Florian Rival",
                              "Open source (MIT License)");

    gd::BehaviorMetadata & aut = extension.AddBehavior("DestroyOutside",
          _("Destroy when outside of the screen"),
          _("DestroyOutside"),
          _("Automatically destroy the object when it goes outside of the screen's borders"),
          "",
          "CppPlatform/Extensions/destroyoutsideicon.png",
          "DestroyOutsideBehavior",
          std::make_shared<DestroyOutsideBehavior>(),
          std::shared_ptr<gd::BehaviorsSharedData>());

    #if defined(GD_IDE_ONLY)
    aut.SetIncludeFile("DestroyOutsideBehavior/DestroyOutsideBehavior.h");

    aut.AddCondition("ExtraBorder",
                   _("Additional border"),
                   _("Compare the additional border that the object must cross before being deleted."),
                   _("The additional border of _PARAM0_ is _PARAM2__PARAM3_"),
                   _(""),
                   "CppPlatform/Extensions/destroyoutsideicon24.png",
                   "CppPlatform/Extensions/destroyoutsideicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "DestroyOutside")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .SetFunctionName("GetExtraBorder").SetManipulatedType("number")
        .SetIncludeFile("DestroyOutsideBehavior/DestroyOutsideBehavior.h");

    aut.AddAction("ExtraBorder",
                   _("Additional border"),
                   _("Change the additional border that the object must cross before being deleted."),
                   _("Do _PARAM2__PARAM3_ to the additional border of _PARAM0_"),
                   _(""),
                   "CppPlatform/Extensions/destroyoutsideicon24.png",
                   "CppPlatform/Extensions/destroyoutsideicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "DestroyOutside")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .MarkAsAdvanced()
        .SetFunctionName("SetExtraBorder").SetManipulatedType("number")
        .SetGetter("GetExtraBorder").SetIncludeFile("DestroyOutsideBehavior/DestroyOutsideBehavior.h");
    #endif

}

/**
 * \brief This class declares information about the extension.
 */
class DestroyOutsideBehaviorCppExtension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    DestroyOutsideBehaviorCppExtension()
    {
        DeclareDestroyOutsideBehaviorExtension(*this);
        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(ANDROID)
extern "C" ExtensionBase * CreateGDCppDestroyOutsideBehaviorExtension() {
    return new DestroyOutsideBehaviorCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new DestroyOutsideBehaviorCppExtension;
}
#endif
