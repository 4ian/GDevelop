/**

GDevelop - Text Object Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Victor Levasseur ( Bold/Italic/Underlined styles )
 */

#include "GDCpp/ExtensionBase.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Version.h"
#include "TextObject.h"


void DeclareTextObjectExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("TextObject",
                          GD_T("Text object"),
                          GD_T("Extension allowing to use an object displaying a text."),
                          "Florian Rival",
                          "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject("Text",
               GD_T("Text"),
               GD_T("Displays a text"),
               "CppPlatform/Extensions/texticon.png",
               &CreateTextObject);

    #if defined(GD_IDE_ONLY)
    obj.SetIncludeFile("TextObject/TextObject.h");

    obj.AddAction("String",
                   GD_T("Modify the text"),
                   GD_T("Modify the text of a Text object."),
                   GD_T("Do _PARAM1__PARAM2_ to the text of _PARAM0_"),
                   "",
                   "res/actions/text24.png",
                   "res/actions/text.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("string", GD_T("Text"))
        .codeExtraInformation.SetFunctionName("SetString").SetManipulatedType("string").SetAssociatedGetter("GetString").SetIncludeFile("TextObject/TextObject.h");

    obj.AddCondition("String",
                   GD_T("Compare the text"),
                   GD_T("Compare the text of a Text object."),
                   GD_T("Text of _PARAM0_ is _PARAM1__PARAM2_"),
                   "",
                   "res/conditions/text24.png",
                   "res/conditions/text.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("string", GD_T("Text to test"))
        .codeExtraInformation.SetFunctionName("GetString").SetManipulatedType("string").SetIncludeFile("TextObject/TextObject.h");

    obj.AddAction("Font",
                   GD_T("Font"),
                   GD_T("Modify the font of the text."),
                   GD_T("Change font of _PARAM0_ to _PARAM1_"),
                   GD_T("Font"),
                   "res/actions/font24.png",
                   "res/actions/font.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("police", GD_T("Font")).CantUseUtf8()
        .codeExtraInformation.SetFunctionName("ChangeFont").SetIncludeFile("TextObject/TextObject.h");

    obj.AddAction("Size",
                   GD_T("Size"),
                   GD_T("Modify the size of the text."),
                   GD_T("Do _PARAM1__PARAM2_ to the size of the text of _PARAM0_"),
                   "",
                   "res/actions/characterSize24.png",
                   "res/actions/characterSize.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .codeExtraInformation.SetFunctionName("SetCharacterSize").SetManipulatedType("number").SetAssociatedGetter("GetCharacterSize").SetIncludeFile("TextObject/TextObject.h");

    obj.AddCondition("Size",
                   GD_T("Size"),
                   GD_T("Test the size of the text"),
                   GD_T("The size of the text of _PARAM0_ is _PARAM1__PARAM2_"),
                   "",
                   "res/conditions/characterSize24.png",
                   "res/conditions/characterSize.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Size to test"))
        .codeExtraInformation.SetFunctionName("GetCharacterSize").SetManipulatedType("number").SetIncludeFile("TextObject/TextObject.h");

    obj.AddAction("ChangeColor",
                   GD_T("Color"),
                   GD_T("Change the color of the text. The color is white by default."),
                   GD_T("Change color of _PARAM0_ to _PARAM1_"),
                   GD_T("Effects"),
                   "res/actions/color24.png",
                   "res/actions/color.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("color", GD_T("Color"))
        .codeExtraInformation.SetFunctionName("SetColor").SetIncludeFile("TextObject/TextObject.h");

    obj.AddAction("Opacity",
                   GD_T("Opacity"),
                   GD_T("Modify the opacity of a Text object."),
                   GD_T("Do _PARAM1__PARAM2_ to the opacity of _PARAM0_"),
                   "",
                   "res/actions/opacity24.png",
                   "res/actions/opacity.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .codeExtraInformation.SetFunctionName("SetOpacity").SetManipulatedType("number").SetAssociatedGetter("GetOpacity").SetIncludeFile("TextObject/TextObject.h");

    obj.AddCondition("Opacity",
                   GD_T("Opacity"),
                   GD_T("Test the value of the opacity of a text object."),
                   GD_T("The opacity of _PARAM0_ is _PARAM1__PARAM2_"),
                   "",
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .codeExtraInformation.SetFunctionName("GetOpacity").SetManipulatedType("number").SetIncludeFile("TextObject/TextObject.h");



    obj.AddAction("SetSmooth",
                   GD_T("Smoothing"),
                   GD_T("Activate or desactivate text smoothing."),
                   GD_T("Smooth _PARAM0_: _PARAM1_"),
                   GD_T("Style"),
                   "res/actions/opacity24.png",
                   "res/actions/opacity.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("yesorno", GD_T("Smooth the text"))
        .codeExtraInformation.SetFunctionName("SetSmooth").SetIncludeFile("TextObject/TextObject.h");

    obj.AddCondition("Smoothed",
                   GD_T("Smoothing"),
                   GD_T("Test if an object is smoothed"),
                   GD_T("_PARAM0_ is smoothed"),
                   GD_T("Style"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .codeExtraInformation.SetFunctionName("IsSmoothed").SetIncludeFile("TextObject/TextObject.h");

    obj.AddAction("SetBold",
                   GD_T("Bold"),
                   GD_T("De/activate bold"),
                   GD_T("Set bold style of _PARAM0_ : _PARAM1_"),
                   GD_T("Style"),
                   "res/actions/bold.png",
                   "res/actions/bold16.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("yesorno", GD_T("Set bold style"))
        .codeExtraInformation.SetFunctionName("SetBold").SetIncludeFile("TextObject/TextObject.h");

    obj.AddCondition("IsBold",
                   GD_T("Bold"),
                   GD_T("Test if bold style is activated"),
                   GD_T("_PARAM0_ bold style is set"),
                   GD_T("Style"),
                   "res/conditions/bold.png",
                   "res/conditions/bold16.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .codeExtraInformation.SetFunctionName("IsBold").SetIncludeFile("TextObject/TextObject.h");

    obj.AddAction("SetItalic",
                   GD_T("Italic"),
                   GD_T("De/activate italic."),
                   GD_T("Set italic style for _PARAM0_ : _PARAM1_"),
                   GD_T("Style"),
                   "res/actions/italic.png",
                   "res/actions/italic16.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("yesorno", GD_T("Set italic"))
        .codeExtraInformation.SetFunctionName("SetItalic").SetIncludeFile("TextObject/TextObject.h");

    obj.AddCondition("IsItalic",
                   GD_T("Italic"),
                   GD_T("Test if the italic style is activated"),
                   GD_T("_PARAM0_ italic style is set"),
                   GD_T("Style"),
                   "res/conditions/italic.png",
                   "res/conditions/italic16.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .codeExtraInformation.SetFunctionName("IsItalic").SetIncludeFile("TextObject/TextObject.h");

    obj.AddAction("SetUnderlined",
                   GD_T("Underlined"),
                   GD_T("De/activate underlined style."),
                   GD_T("Set underlined style of _PARAM0_: _PARAM1_"),
                   GD_T("Style"),
                   "res/actions/underline.png",
                   "res/actions/underline16.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("yesorno", GD_T("Underline"))
        .codeExtraInformation.SetFunctionName("SetUnderlined").SetIncludeFile("TextObject/TextObject.h");

    obj.AddCondition("IsUnderlined",
                   GD_T("Underlined"),
                   GD_T("Test if the underlined style of an object is set."),
                   GD_T("_PARAM0_ underlined style is activated"),
                   GD_T("Style"),
                   "res/conditions/underline.png",
                   "res/conditions/underline16.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .codeExtraInformation.SetFunctionName("IsUnderlined").SetIncludeFile("TextObject/TextObject.h");

    obj.AddAction("Angle",
                   GD_T("Angle"),
                   GD_T("Modify the angle of a Text object."),
                   GD_T("Do _PARAM1__PARAM2_ to the angle of _PARAM0_"),
                   GD_T("Rotation"),
                   "res/actions/rotate24.png",
                   "res/actions/rotate.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .codeExtraInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle").SetIncludeFile("TextObject/TextObject.h");

    obj.AddCondition("Angle",
                   GD_T("Angle"),
                   GD_T("Test the value of the angle of a text object."),
                   GD_T("The angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Rotation"),
                   "res/conditions/rotate24.png",
                   "res/conditions/rotate.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .codeExtraInformation.SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("TextObject/TextObject.h");

    obj.AddExpression("Opacity", GD_T("Opacity"), GD_T("Opacity"), GD_T("Opacity"), "res/actions/opacity.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .codeExtraInformation.SetFunctionName("GetOpacity").SetIncludeFile("TextObject/TextObject.h");

    obj.AddExpression("Angle", GD_T("Angle"), GD_T("Angle"), GD_T("Rotation"), "res/actions/rotate.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .codeExtraInformation.SetFunctionName("GetAngle").SetIncludeFile("TextObject/TextObject.h");

    obj.AddStrExpression("String", GD_T("Text"), GD_T("Text"), GD_T("Text"), "res/texteicon.png")
        .AddParameter("object", GD_T("Object"), "Text", false)
        .codeExtraInformation.SetFunctionName("GetString").SetIncludeFile("TextObject/TextObject.h");
    #endif
}

/**
 * \brief This class declares information about the C++ extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    Extension()
    {
        DeclareTextObjectExtension(*this);
        AddRuntimeObject(GetObjectMetadata("TextObject::Text"),
            "RuntimeTextObject", CreateRuntimeTextObject);

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
