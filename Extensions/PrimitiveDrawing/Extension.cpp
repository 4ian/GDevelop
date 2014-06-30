/**

Game Develop - Primitive Drawing Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

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
        SetExtensionInformation("PrimitiveDrawing",
                      _("Primitive drawing"),
                      _("Extension allowing to draw shapes and manipulate images."),
                      "Florian Rival",
                      "zlib/libpng License (Open Source)");

        //Declaration of all objects available
        {
            gd::ObjectMetadata & obj = AddObject("Drawer",
                       _("Drawer"),
                       _("Allows to draw simple shapes on the screen"),
                       "CppPlatform/Extensions/primitivedrawingicon.png",
                       &CreateDrawerObject,
                       &DestroyDrawerObject);

            AddRuntimeObject(obj, "RuntimeDrawerObject", CreateRuntimeDrawerObject, DestroyRuntimeDrawerObject);

            #if defined(GD_IDE_ONLY)
            DrawerObject::LoadEdittimeIcon();
            obj.SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

            obj.AddAction("Rectangle",
                           _("Rectangle"),
                           _("Draw a rectangle on screen"),
                           _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a rectangle with _PARAM0_"),
                           _("Drawing"),
                           "res/actions/rectangle24.png",
                           "res/actions/rectangle.png")
                .AddParameter("object", _("Drawer object"), "Drawer", false)
                .AddParameter("expression", _("Top left side: X Position"))
                .AddParameter("expression", _("Top left side : Y Position"))
                .AddParameter("expression", _("Bottom right side : X Position"))
                .AddParameter("expression", _("Bottom right side : Y Position"))
                .codeExtraInformation.SetFunctionName("DrawRectangle").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

            obj.AddAction("Circle",
                           _("Circle"),
                           _("Draw a circle on screen"),
                           _("Draw at _PARAM1_;_PARAM2_ a circle of radius _PARAM3_ with _PARAM0_"),
                           _("Drawing"),
                           "res/actions/circle24.png",
                           "res/actions/circle.png")
                .AddParameter("object", _("Drawer object"), "Drawer", false)
                .AddParameter("expression", _("X position of center"))
                .AddParameter("expression", _("Y position of center"))
                .AddParameter("expression", _("Radius ( in pixels )"))
                .codeExtraInformation.SetFunctionName("DrawCircle").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

            obj.AddAction("Line",
                           _("Line"),
                           _("Draw a line  on screen"),
                           _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a line ( thickness  : _PARAM5_) with _PARAM0_"),
                           _("Drawing"),
                           "res/actions/line24.png",
                           "res/actions/line.png")
                .AddParameter("object", _("Drawer object"), "Drawer", false)
                .AddParameter("expression", _("X Position of start point"))
                .AddParameter("expression", _("Y Position of start point"))
                .AddParameter("expression", _("X Position of end point"))
                .AddParameter("expression", _("Y Position of end point"))
                .AddParameter("expression", _("Thickness ( in pixels )"))
                .codeExtraInformation.SetFunctionName("DrawLine").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

            obj.AddAction("FillColor",
                           _("Fill color"),
                           _("Change the color of filling"),
                           _("Change fill color of _PARAM0_ to _PARAM1_"),
                           _("Setup"),
                           "res/actions/text24.png",
                           "res/actions/text.png")
                .AddParameter("object", _("Drawer object"), "Drawer", false)
                .AddParameter("color", _("Fill color"))
                .codeExtraInformation.SetFunctionName("SetFillColor").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

            obj.AddAction("OutlineColor",
                           _("Outline color"),
                           _("Modify the color of the outline of future drawings."),
                           _("Change outline color of _PARAM0_ to _PARAM1_"),
                           _("Setup"),
                           "res/actions/color24.png",
                           "res/actions/color.png")
                .AddParameter("object", _("Object"), "Drawer", false)
                .AddParameter("color", _("Color"))
                .codeExtraInformation.SetFunctionName("SetOutlineColor").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

            obj.AddAction("OutlineSize",
                           _("Outline size"),
                           _("Modify the size of the outline of future drawings."),
                           _("Do _PARAM1__PARAM2_ to the size of the outline of _PARAM0_"),
                           _("Setup"),
                           "res/actions/outlineSize24.png",
                           "res/actions/outlineSize.png")
                .AddParameter("object", _("Object"), "Drawer", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Size in pixels"))
                .codeExtraInformation.SetFunctionName("SetOutlineSize").SetManipulatedType("number").SetAssociatedGetter("GetOutlineSize").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

            obj.AddCondition("OutlineSize",
                           _("Outline size"),
                           _("Test the size of the outline."),
                           _("The size of the outline of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Setup"),
                           "res/conditions/outlineSize24.png",
                           "res/conditions/outlineSize.png")
                .AddParameter("object", _("Object"), "Drawer", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Size to test"))
                .codeExtraInformation.SetFunctionName("GetOutlineSize").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

            obj.AddAction("FillOpacity",
                           _("Fill opacity"),
                           _("Modify the opacity of filling of future drawings."),
                           _("Do _PARAM1__PARAM2_ to the opacity of filling of _PARAM0_"),
                           _("Setup"),
                           "res/actions/opacity24.png",
                           "res/actions/opacity.png")
                .AddParameter("object", _("Object"), "Drawer", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetFillOpacity").SetManipulatedType("number").SetAssociatedGetter("GetFillOpacity").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");


            obj.AddCondition("FillOpacity",
                           _("Fill opacity"),
                           _("Test the value of the opacity of the filling."),
                           _("The opacity of filling of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Setup"),
                           "res/conditions/opacity24.png",
                           "res/conditions/opacity.png")
                .AddParameter("object", _("Object"), "Drawer", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .codeExtraInformation.SetFunctionName("GetFillOpacity").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

            obj.AddAction("OutlineOpacity",
                           _("Outline opacity"),
                           _("Modify the opacity of the outline of future drawings."),
                           _("Do _PARAM1__PARAM2_ to the opacity of the outline of _PARAM0_"),
                           _("Setup"),
                           "res/actions/opacity24.png",
                           "res/actions/opacity.png")
                .AddParameter("object", _("Object"), "Drawer", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetOutlineOpacity").SetManipulatedType("number").SetAssociatedGetter("GetOutlineOpacity").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

            obj.AddCondition("OutlineOpacity",
                           _("Outline opacity"),
                           _("Test the opacity of the outline."),
                           _("The opacity of the outline of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Setup"),
                           "res/conditions/opacity24.png",
                           "res/conditions/opacity.png")
                .AddParameter("object", _("Object"), "Drawer", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .codeExtraInformation.SetFunctionName("GetOutlineOpacity").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/DrawerObject.h");

        #endif

        }

        #if defined(GD_IDE_ONLY)

        AddAction("CopyImageOnAnother",
                       _("Copy an image on another"),
                       _("Copy an image on another.\nNote that the source image must be preferably kept loaded in memory."),
                       _("Copy the image _PARAM1_ on _PARAM0_ at _PARAM2_;_PARAM3_"),
                       _("Images"),
                       "res/copy24.png",
                       "res/copyicon.png")

            .AddParameter("string", _("Name of the image to modify"))
            .AddParameter("string", _("Name of the source image"))
            .AddParameter("expression", _("X position"))
            .AddParameter("expression", _("Y position"))
            .AddParameter("yesorno", _("Should the copy take in account the source transparency\?"), "",false)
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::CopyImageOnAnother").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");


        AddAction("CaptureScreen",
                       _("Capture the screen"),
                       _("Capture the screen and save it into the specified folder and/or\nin the specified image."),
                       _("Capture the screen ( Save it in file _PARAM1_ and/or in image _PARAM2_ )"),
                       _("Images"),
                       "res/imageicon24.png",
                       "res/imageicon.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("File where save capture"), "", true).SetDefaultValue("")
            .AddParameter("string", _("Name of the image where capture must be saved"), "", true).SetDefaultValue("")

            .codeExtraInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::CaptureScreen").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

        AddAction("CreateSFMLTexture",
                       _("Create an image in memory"),
                       _("Create an image in memory."),
                       _("Create image _PARAM1_ in memory ( Width: _PARAM2_, Height: _PARAM3_, Color: _PARAM4_ )"),
                       _("Images"),
                       "res/imageicon24.png",
                       "res/imageicon.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Name of the image"))
            .AddParameter("expression", _("Width"), "", true)
            .AddParameter("expression", _("Height"), "", true)
            .AddParameter("color", _("Initial color"), "", true).SetDefaultValue("0;0;0")

            .codeExtraInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::CreateSFMLTexture").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

        AddAction("OpenSFMLTextureFromFile",
                       _("Open an image from a file"),
                       _("Load in memory an image from a file."),
                       _("Load in memory file _PARAM1_ inside image _PARAM2_"),
                       _("Images"),
                       "res/imageicon24.png",
                       "res/imageicon.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("file", _("File"))
            .AddParameter("string", _("Name of the image"))

            .codeExtraInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::OpenSFMLTextureFromFile").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

        AddAction("SaveSFMLTextureToFile",
                       _("Save an image to a file"),
                       _("Save an image to a file"),
                       _("Save image _PARAM2_ to file _PARAM1_"),
                       _("Images"),
                       "res/imageicon24.png",
                       "res/imageicon.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("file", _("File"))
            .AddParameter("string", _("Name of the image"))

            .codeExtraInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::SaveSFMLTextureToFile").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
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

