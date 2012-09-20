/**

Game Develop - Text Object Extension
Copyright (c) 2008-2012 Florian Rival (Florian.Rival@gmail.com)

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
/**
 * Contributors to the extension:
 * Victor Levasseur ( Bold/Italic/Underlined styles )
 */

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "TextObject.h"
#include <boost/version.hpp>

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
            DECLARE_THE_EXTENSION("TextObject",
                                  _("Text object"),
                                  _("Extension allowing to use an object displaying a text."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")


            //Declaration of all objects available
            DECLARE_OBJECT("Text",
                           _("Text"),
                           _("Object displaying a text"),
                           "Extensions/texticon.png",
                           &CreateTextObject,
                           &DestroyTextObject,
                           "TextObject");

                #if defined(GD_IDE_ONLY)

                objInfos.SetIncludeFile("TextObject/TextObject.h");

                DECLARE_OBJECT_ACTION("String",
                               _("Modify the text"),
                               _("Modify the text of a Text object."),
                               _("Do _PARAM2__PARAM1_ to the text of _PARAM0_"),
                               _("Text"),
                               "res/actions/text24.png",
                               "res/actions/text.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("string", _("Text"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetString").SetManipulatedType("string").SetAssociatedGetter("GetString").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("String",
                               _("Test the text"),
                               _("Test the text of a Text object."),
                               _("The text of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Text"),
                               "res/conditions/text24.png",
                               "res/conditions/text.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("string", _("Text to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetString").SetManipulatedType("string").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Font",
                               _("Font"),
                               _("Modify the font of the text."),
                               _("Change font of _PARAM0_ to _PARAM1_"),
                               _("Font"),
                               "res/actions/font24.png",
                               "res/actions/font.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("police", _("Font"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("ChangeFont").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Size",
                               _("Size"),
                               _("Modify the size of the text."),
                               _("Do _PARAM2__PARAM1_ to the size of the text of _PARAM0_"),
                               _("Size"),
                               "res/actions/characterSize24.png",
                               "res/actions/characterSize.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetCharacterSize").SetManipulatedType("number").SetAssociatedGetter("GetCharacterSize").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Size",
                               _("Size"),
                               _("Test the size of the text"),
                               _("The size of the text of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Size"),
                               "res/conditions/characterSize24.png",
                               "res/conditions/characterSize.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("expression", _("Size to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetCharacterSize").SetManipulatedType("number").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("ChangeColor",
                               _("Color"),
                               _("Change the color of the text. The color is white by default."),
                               _("Change color of _PARAM0_ to _PARAM1_"),
                               _("Effects"),
                               "res/actions/color24.png",
                               "res/actions/color.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("color", _("Color"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetColor").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Opacity",
                               _("Opacity"),
                               _("Modify the opacity of a Text object."),
                               _("Do _PARAM2__PARAM1_ to the opacity of _PARAM0_"),
                               _("Visibility"),
                               "res/actions/opacity24.png",
                               "res/actions/opacity.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetOpacity").SetManipulatedType("number").SetAssociatedGetter("GetOpacity").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Opacity",
                               _("Opacity"),
                               _("Test the value of the opacity of a text object."),
                               _("The opacity of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Visibility"),
                               "res/conditions/opacity24.png",
                               "res/conditions/opacity.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetOpacity").SetManipulatedType("number").SetIncludeFile("TextObject/TextObject.h");


                DECLARE_END_OBJECT_CONDITION()


                DECLARE_OBJECT_ACTION("SetSmooth",
                               _("Smoothing"),
                               _("Activate or desactivate text smoothing."),
                               _("Smooth _PARAM0_: _PARAM1_"),
                               _("Visibility"),
                               "res/actions/opacity24.png",
                               "res/actions/opacity.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("yesorno", _("Smooth the text"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetSmooth").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Smoothed",
                               _("Smoothing"),
                               _("Test if an object is smoothed"),
                               _("_PARAM0_ is smoothed"),
                               _("Visibility"),
                               "res/conditions/opacity24.png",
                               "res/conditions/opacity.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("IsSmoothed").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("SetBold",
                               _("Bold"),
                               _("De/activate bold"),
                               _("Set bold style of _PARAM0_ : _PARAM1_"),
                               _("Style"),
                               "res/actions/bold.png",
                               "res/actions/bold16.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("yesorno", _("Set bold style"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetBold").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("IsBold",
                               _("Bold"),
                               _("Test if bold style is activated"),
                               _("_PARAM0_ bold style is set"),
                               _("Style"),
                               "res/conditions/bold.png",
                               "res/conditions/bold16.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("IsBold").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("SetItalic",
                               _("Italic"),
                               _("De/activate italic."),
                               _("Set italic style for _PARAM0_ : _PARAM1_"),
                               _("Style"),
                               "res/actions/italic.png",
                               "res/actions/italic16.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("yesorno", _("Set italic"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetItalic").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("IsItalic",
                               _("Italic"),
                               _("Test if the italic style is activated"),
                               _("_PARAM0_ italic style is set"),
                               _("Style"),
                               "res/conditions/italic.png",
                               "res/conditions/italic16.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("IsItalic").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("SetUnderlined",
                               _("Underlined"),
                               _("De/activate underlined style."),
                               _("Set underlined style of _PARAM0_: _PARAM1_"),
                               _("Style"),
                               "res/actions/underline.png",
                               "res/actions/underline16.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("yesorno", _("Underline"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetUnderlined").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("IsUnderlined",
                               _("Underlined"),
                               _("Test if the underlined style of an object is set."),
                               _("_PARAM0_ underlined style is activated"),
                               _("Style"),
                               "res/conditions/underline.png",
                               "res/conditions/underline16.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("IsUnderlined").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Angle",
                               _("Angle"),
                               _("Modify the angle of a Text object."),
                               _("Do _PARAM2__PARAM1_ to the angle of _PARAM0_"),
                               _("Rotation"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Angle",
                               _("Angle"),
                               _("Test the value of the angle of a text object."),
                               _("The angle of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Rotation"),
                               "res/conditions/rotate24.png",
                               "res/conditions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "Text", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_EXPRESSION("Opacity", _("Opacity"), _("Opacity"), _("Opacity"), "res/actions/opacity.png")
                    instrInfo.AddParameter("object", _("Object"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetOpacity").SetIncludeFile("TextObject/TextObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("Angle", _("Angle"), _("Angle"), _("Rotation"), "res/actions/rotate.png")
                    instrInfo.AddParameter("object", _("Object"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetAngle").SetIncludeFile("TextObject/TextObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_STR_EXPRESSION("String", _("Text"), _("Text"), _("Text"), "res/texteicon.png")
                    instrInfo.AddParameter("object", _("Object"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetString").SetIncludeFile("TextObject/TextObject.h");
                DECLARE_END_OBJECT_STR_EXPRESSION()

            #endif
            DECLARE_END_OBJECT()


            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

    protected:
    private:

        /**
         * This function is called by Game Develop so
         * as to complete information about how the extension was compiled ( which libs... )
         * -- Do not need to be modified. --
         */
        void CompleteCompilationInformation()
        {
            #if defined(GD_IDE_ONLY)
            compilationInfo.runtimeOnly = false;
            #else
            compilationInfo.runtimeOnly = true;
            #endif

            #if defined(__GNUC__)
            compilationInfo.gccMajorVersion = __GNUC__;
            compilationInfo.gccMinorVersion = __GNUC_MINOR__;
            compilationInfo.gccPatchLevel = __GNUC_PATCHLEVEL__;
            #endif

            compilationInfo.boostVersion = BOOST_VERSION;

            compilationInfo.sfmlMajorVersion = 2;
            compilationInfo.sfmlMinorVersion = 0;

            #if defined(GD_IDE_ONLY)
            compilationInfo.wxWidgetsMajorVersion = wxMAJOR_VERSION;
            compilationInfo.wxWidgetsMinorVersion = wxMINOR_VERSION;
            compilationInfo.wxWidgetsReleaseNumber = wxRELEASE_NUMBER;
            compilationInfo.wxWidgetsSubReleaseNumber = wxSUBRELEASE_NUMBER;
            #endif

            compilationInfo.gdlVersion = RC_FILEVERSION_STRING;
            compilationInfo.sizeOfpInt = sizeof(int*);

            compilationInfo.informationCompleted = true;
        }
};

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

