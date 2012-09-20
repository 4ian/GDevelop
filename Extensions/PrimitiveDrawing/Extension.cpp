/**

Game Develop - Primitive Drawing Extension
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

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "DrawerObject.h"
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
            DECLARE_THE_EXTENSION("PrimitiveDrawing",
                          _("Primitive drawing"),
                          _("Extension allowing to draw shapes and manipulate images."),
                          "Compil Games",
                          "zlib/libpng License ( Open Source )")

            //Declaration of all objects available
            DECLARE_OBJECT("Drawer",
                           _("Drawer"),
                           _("Object allowing to draw on screen"),
                           "Extensions/primitivedrawingicon.png",
                           &CreateDrawerObject,
                           &DestroyDrawerObject,
                           "DrawerObject");

                #if defined(GD_IDE_ONLY)
                DrawerObject::LoadEdittimeIcon();
                objInfos.SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_OBJECT_ACTION("Rectangle",
                               _("Rectangle"),
                               _("Draw a rectangle on screen"),
                               _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a rectangle with _PARAM0_"),
                               _("Drawing"),
                               "res/actions/rectangle24.png",
                               "res/actions/rectangle.png");

                    instrInfo.AddParameter("object", _("Drawer object"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Top left side: X Position"), "", false);
                    instrInfo.AddParameter("expression", _("Top left side : Y Position"), "", false);
                    instrInfo.AddParameter("expression", _("Bottom right side : X Position"), "", false);
                    instrInfo.AddParameter("expression", _("Bottom right side : Y Position"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("DrawRectangle").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Circle",
                               _("Circle"),
                               _("Draw a circle on screen"),
                               _("Draw at _PARAM1_;_PARAM2_ a circle of radius _PARAM3_ with _PARAM0_"),
                               _("Drawing"),
                               "res/actions/circle24.png",
                               "res/actions/circle.png");

                    instrInfo.AddParameter("object", _("Drawer object"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("X position of center"), "", false);
                    instrInfo.AddParameter("expression", _("Y position of center"), "", false);
                    instrInfo.AddParameter("expression", _("Radius ( in pixels )"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("DrawCircle").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Line",
                               _("Line"),
                               _("Draw a line  on screen"),
                               _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a line ( thickness  : _PARAM5_) with _PARAM0_"),
                               _("Drawing"),
                               "res/actions/line24.png",
                               "res/actions/line.png");

                    instrInfo.AddParameter("object", _("Drawer object"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("X Position of start point"), "", false);
                    instrInfo.AddParameter("expression", _("Y Position of start point"), "", false);
                    instrInfo.AddParameter("expression", _("X Position of end point"), "", false);
                    instrInfo.AddParameter("expression", _("Y Position of end point"), "", false);
                    instrInfo.AddParameter("expression", _("Thickness ( in pixels )"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("DrawLine").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("FillColor",
                               _("Fill color"),
                               _("Change the color of filling"),
                               _("Change fill color of _PARAM0_ to _PARAM1_"),
                               _("Setup"),
                               "res/actions/text24.png",
                               "res/actions/text.png");

                    instrInfo.AddParameter("object", _("Drawer object"), "Drawer", false);
                    instrInfo.AddParameter("color", _("Fill color"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetFillColor").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("OutlineColor",
                               _("Outline color"),
                               _("Modify the color of the outline of future drawings."),
                               _("Change outline color of _PARAM0_ to _PARAM1_"),
                               _("Setup"),
                               "res/actions/color24.png",
                               "res/actions/color.png");

                    instrInfo.AddParameter("object", _("Object"), "Drawer", false);
                    instrInfo.AddParameter("color", _("Color"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetOutlineColor").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("OutlineSize",
                               _("Outline size"),
                               _("Modify the size of the outline of future drawings."),
                               _("Do _PARAM2__PARAM1_ to the size of the outline of _PARAM0_"),
                               _("Setup"),
                               "res/actions/outlineSize24.png",
                               "res/actions/outlineSize.png");

                    instrInfo.AddParameter("object", _("Object"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Size in pixels"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetOutlineSize").SetManipulatedType("number").SetAssociatedGetter("GetOutlineSize").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("OutlineSize",
                               _("Outline size"),
                               _("Test the size of the outline."),
                               _("The size of the outline of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Setup"),
                               "res/conditions/outlineSize24.png",
                               "res/conditions/outlineSize.png");

                    instrInfo.AddParameter("object", _("Object"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Size to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetOutlineSize").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("FillOpacity",
                               _("Fill opacity"),
                               _("Modify the opacity of filling of future drawings."),
                               _("Do _PARAM2__PARAM1_ to the opacity of filling of _PARAM0_"),
                               _("Setup"),
                               "res/actions/opacity24.png",
                               "res/actions/opacity.png");

                    instrInfo.AddParameter("object", _("Object"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetFillOpacity").SetManipulatedType("number").SetAssociatedGetter("GetFillOpacity").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("FillOpacity",
                               _("Fill opacity"),
                               _("Test the value of the opacity of the filling."),
                               _("The opacity of filling of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Setup"),
                               "res/conditions/opacity24.png",
                               "res/conditions/opacity.png");

                    instrInfo.AddParameter("object", _("Object"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetFillOpacity").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("OutlineOpacity",
                               _("Outline opacity"),
                               _("Modify the opacity of the outline of future drawings."),
                               _("Do _PARAM2__PARAM1_ to the opacity of the outline of _PARAM0_"),
                               _("Setup"),
                               "res/actions/opacity24.png",
                               "res/actions/opacity.png");

                    instrInfo.AddParameter("object", _("Object"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetOutlineOpacity").SetManipulatedType("number").SetAssociatedGetter("GetOutlineOpacity").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("OutlineOpacity",
                               _("Outline opacity"),
                               _("Test the opacity of the outline."),
                               _("The opacity of the outline of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Setup"),
                               "res/conditions/opacity24.png",
                               "res/conditions/opacity.png");

                    instrInfo.AddParameter("object", _("Object"), "Drawer", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetOutlineOpacity").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

                DECLARE_END_OBJECT_CONDITION()

            #endif

            DECLARE_END_OBJECT()

            #if defined(GD_IDE_ONLY)

            DECLARE_ACTION("CopyImageOnAnother",
                           _("Copy an image on another"),
                           _("Copy an image on another.\nNote that the source image must be preferably kept loaded in memory."),
                           _("Copy the image _PARAM1_ on _PARAM0_ at _PARAM2_;_PARAM3_"),
                           _("Images"),
                           "res/copy24.png",
                           "res/copyicon.png");

                instrInfo.AddParameter("string", _("Name of the image to modify"), "", false);
                instrInfo.AddParameter("string", _("Name of the source image"), "", false);
                instrInfo.AddParameter("expression", _("X position"), "", false);
                instrInfo.AddParameter("expression", _("Y position"), "", false);
                instrInfo.AddParameter("yesorno", _("Should the copy take in account the source transparency\?"), "",false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::CopyImageOnAnother").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");


            DECLARE_END_ACTION()

            DECLARE_ACTION("CaptureScreen",
                           _("Capture the screen"),
                           _("Capture the screen and save it into the specified folder and/or\nin the specified image."),
                           _("Capture the screen ( Save it in file _PARAM1_ and/or in image _PARAM2_ )"),
                           _("Images"),
                           "res/imageicon24.png",
                           "res/imageicon.png");

                instrInfo.AddCodeOnlyParameter("currentScene", "");
                instrInfo.AddParameter("string", _("File where save capture"), "", true).SetDefaultValue("");
                instrInfo.AddParameter("string", _("Name of the image where capture must be saved"), "", true).SetDefaultValue("");

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::CaptureScreen").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("CreateSFMLTexture",
                           _("Create an image in memory"),
                           _("Create an image in memory."),
                           _("Create image _PARAM1_ in memory ( Width: _PARAM2_, Height: _PARAM3_, Color: _PARAM4_ )"),
                           _("Images"),
                           "res/imageicon24.png",
                           "res/imageicon.png");

                instrInfo.AddCodeOnlyParameter("currentScene", "");
                instrInfo.AddParameter("string", _("Name of the image"), "", false);
                instrInfo.AddParameter("expression", _("Width"), "", true);
                instrInfo.AddParameter("expression", _("Height"), "", true);
                instrInfo.AddParameter("color", _("Initial color"), "", true).SetDefaultValue("0;0;0");

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::CreateSFMLTexture").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("OpenSFMLTextureFromFile",
                           _("Open an image from a file"),
                           _("Load in memory an image from a file."),
                           _("Load in memory file _PARAM1_ inside image _PARAM2_"),
                           _("Images"),
                           "res/imageicon24.png",
                           "res/imageicon.png");

                instrInfo.AddCodeOnlyParameter("currentScene", "");
                instrInfo.AddParameter("file", _("File"), "", false);
                instrInfo.AddParameter("string", _("Name of the image"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::OpenSFMLTextureFromFile").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("SaveSFMLTextureToFile",
                           _("Save an image to a file"),
                           _("Save an image to a file"),
                           _("Save image _PARAM2_ to file _PARAM1_"),
                           _("Images"),
                           "res/imageicon24.png",
                           "res/imageicon.png");

                instrInfo.AddCodeOnlyParameter("currentScene", "");
                instrInfo.AddParameter("file", _("File"), "", false);
                instrInfo.AddParameter("string", _("Name of the image"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::SaveSFMLTextureToFile").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

            DECLARE_END_ACTION()

            #endif


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

