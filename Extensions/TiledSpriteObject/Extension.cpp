/**

Game Develop - Tiled Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)

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
 * Florian Rival ( Minor changes, added offsets )
 */

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "TiledSpriteObject.h"
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
            DECLARE_THE_EXTENSION("TiledSpriteObject",
                                  _("Tiled Sprite Object"),
                                  _("Extension allowing to use tiled sprite objects."),
                                  "Victor Levasseur",
                                  "zlib/libpng License ( Open Source )")

            DECLARE_OBJECT("TiledSprite",
                           _("Tiled Sprite"),
                           _("Object displaying a tiled sprite."),
                           "CppPlatform/Extensions/TiledSpriteIcon.png",
                           &CreateTiledSpriteObject,
                           &DestroyTiledSpriteObject,
                           "TiledSpriteObject");
                #if defined(GD_IDE_ONLY)

                objInfos.SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

                DECLARE_OBJECT_ACTION("Width",
                               _("Width"),
                               _("Modify the width of a Tiled Sprite."),
                               _("Do _PARAM2__PARAM1_ to the width of _PARAM0_"),
                               _("Size and angle"),
                               "res/actions/scaleWidth24.png",
                               "res/actions/scaleWidth.png");

                    instrInfo.AddParameter("object", _("Object"), "TiledSprite", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetWidth").SetManipulatedType("number").SetAssociatedGetter("GetWidth").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Width",
                               _("Width"),
                               _("Test the width of a Tiled Sprite."),
                               _("The width of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Size and angle"),
                               "res/conditions/scaleWidth24.png",
                               "res/conditions/scaleWidth.png");

                    instrInfo.AddParameter("object", _("Object"), "TiledSprite", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetWidth").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Height",
                               _("Height"),
                               _("Modify the height of a Tiled Sprite."),
                               _("Do _PARAM2__PARAM1_ to the height of _PARAM0_"),
                               _("Size and angle"),
                               "res/actions/scaleHeight24.png",
                               "res/actions/scaleHeight.png");

                    instrInfo.AddParameter("object", _("Object"), "TiledSprite", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetHeight").SetManipulatedType("number").SetAssociatedGetter("GetHeight").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Height",
                               _("Height"),
                               _("Test the height of a Tiled Sprite."),
                               _("The height of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Size and angle"),
                               "res/conditions/scaleHeight24.png",
                               "res/conditions/scaleHeight.png");

                    instrInfo.AddParameter("object", _("Object"), "TiledSprite", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetHeight").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Angle",
                               _("Angle"),
                               _("Modify the angle of a Tiled Sprite."),
                               _("Do _PARAM2__PARAM1_ to the angle of _PARAM0_"),
                               _("Size and angle"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "TiledSprite", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Angle",
                               _("Angle"),
                               _("Test the angle of a Tiled Sprite."),
                               _("The angle of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Size and angle"),
                               "res/conditions/rotate24.png",
                               "res/conditions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "TiledSprite", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("XOffset",
                               _("Image X Offset"),
                               _("Modify the offset used on the X axis when displaying the image."),
                               _("Do _PARAM2__PARAM1_ to the X offset of _PARAM0_"),
                               _("Image offset"),
                               "res/conditions/scaleWidth24.png",
                               "res/conditions/scaleWidth.png");

                    instrInfo.AddParameter("object", _("Object"), "TiledSprite", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetXOffset").SetManipulatedType("number").SetAssociatedGetter("GetXOffset").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("XOffset",
                               _("Image X Offset"),
                               _("Test the offset used on the X axis when displaying the image."),
                               _("The X offset of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Image offset"),
                               "res/conditions/scaleWidth24.png",
                               "res/conditions/scaleWidth.png");

                    instrInfo.AddParameter("object", _("Object"), "TiledSprite", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetXOffset").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("YOffset",
                               _("Image Y Offset"),
                               _("Modify the offset used on the Y axis when displaying the image."),
                               _("Do _PARAM2__PARAM1_ to the Y offset of _PARAM0_"),
                               _("Image offset"),
                               "res/conditions/scaleWidth24.png",
                               "res/conditions/scaleWidth.png");

                    instrInfo.AddParameter("object", _("Object"), "TiledSprite", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetYOffset").SetManipulatedType("number").SetAssociatedGetter("GetYOffset").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("YOffset",
                               _("Image Y Offset"),
                               _("Test the offset used on the Y axis when displaying the image."),
                               _("The Y offset of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Image offset"),
                               "res/conditions/scaleWidth24.png",
                               "res/conditions/scaleWidth.png");

                    instrInfo.AddParameter("object", _("Object"), "TiledSprite", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetYOffset").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

                DECLARE_END_OBJECT_CONDITION()
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

