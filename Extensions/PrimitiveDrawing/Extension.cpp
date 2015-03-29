/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "ShapePainterObject.h"


void DeclarePrimitiveDrawingExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("PrimitiveDrawing",
                  GD_T("Primitive drawing"),
                  GD_T("Extension allowing to draw shapes and manipulate images."),
                  "Florian Rival",
                  "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject("Drawer", //"Drawer" is kept for compatibility with GD<=3.6.76
               GD_T("Shape painter"),
               GD_T("Allows to draw simple shapes on the screen"),
               "CppPlatform/Extensions/primitivedrawingicon.png",
               &CreateShapePainterObject);

    #if defined(GD_IDE_ONLY)
    ShapePainterObject::LoadEdittimeIcon();
    obj.SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

    obj.AddAction("Rectangle",
                   GD_T("Rectangle"),
                   GD_T("Draw a rectangle on screen"),
                   GD_T("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a rectangle with _PARAM0_"),
                   GD_T("Drawing"),
                   "res/actions/rectangle24.png",
                   "res/actions/rectangle.png")
        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("expression", GD_T("Top left side: X Position"))
        .AddParameter("expression", GD_T("Top left side : Y Position"))
        .AddParameter("expression", GD_T("Bottom right side : X Position"))
        .AddParameter("expression", GD_T("Bottom right side : Y Position"))
        .codeExtraInformation.SetFunctionName("DrawRectangle").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

    obj.AddAction("Circle",
                   GD_T("Circle"),
                   GD_T("Draw a circle on screen"),
                   GD_T("Draw at _PARAM1_;_PARAM2_ a circle of radius _PARAM3_ with _PARAM0_"),
                   GD_T("Drawing"),
                   "res/actions/circle24.png",
                   "res/actions/circle.png")
        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("expression", GD_T("X position of center"))
        .AddParameter("expression", GD_T("Y position of center"))
        .AddParameter("expression", GD_T("Radius ( in pixels )"))
        .codeExtraInformation.SetFunctionName("DrawCircle").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

    obj.AddAction("Line",
                   GD_T("Line"),
                   GD_T("Draw a line  on screen"),
                   GD_T("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a line (thickness  : _PARAM5_) with _PARAM0_"),
                   GD_T("Drawing"),
                   "res/actions/line24.png",
                   "res/actions/line.png")
        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("expression", GD_T("X Position of start point"))
        .AddParameter("expression", GD_T("Y Position of start point"))
        .AddParameter("expression", GD_T("X Position of end point"))
        .AddParameter("expression", GD_T("Y Position of end point"))
        .AddParameter("expression", GD_T("Thickness ( in pixels )"))
        .codeExtraInformation.SetFunctionName("DrawLine").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

    obj.AddAction("FillColor",
                   GD_T("Fill color"),
                   GD_T("Change the color of filling"),
                   GD_T("Change fill color of _PARAM0_ to _PARAM1_"),
                   GD_T("Setup"),
                   "res/actions/text24.png",
                   "res/actions/text.png")
        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("color", GD_T("Fill color"))
        .codeExtraInformation.SetFunctionName("SetFillColor").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

    obj.AddAction("OutlineColor",
                   GD_T("Outline color"),
                   GD_T("Modify the color of the outline of future drawings."),
                   GD_T("Change outline color of _PARAM0_ to _PARAM1_"),
                   GD_T("Setup"),
                   "res/actions/color24.png",
                   "res/actions/color.png")
        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("color", GD_T("Color"))
        .codeExtraInformation.SetFunctionName("SetOutlineColor").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

    obj.AddAction("OutlineSize",
                   GD_T("Outline size"),
                   GD_T("Modify the size of the outline of future drawings."),
                   GD_T("Do _PARAM1__PARAM2_ to the size of the outline of _PARAM0_"),
                   GD_T("Setup"),
                   "res/actions/outlineSize24.png",
                   "res/actions/outlineSize.png")
        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Size in pixels"))
        .codeExtraInformation.SetFunctionName("SetOutlineSize").SetManipulatedType("number").SetAssociatedGetter("GetOutlineSize").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

    obj.AddCondition("OutlineSize",
                   GD_T("Outline size"),
                   GD_T("Test the size of the outline."),
                   GD_T("The size of the outline of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Setup"),
                   "res/conditions/outlineSize24.png",
                   "res/conditions/outlineSize.png")
        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Size to test"))
        .codeExtraInformation.SetFunctionName("GetOutlineSize").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

    obj.AddAction("FillOpacity",
                   GD_T("Fill opacity"),
                   GD_T("Modify the opacity of filling of future drawings."),
                   GD_T("Do _PARAM1__PARAM2_ to the opacity of filling of _PARAM0_"),
                   GD_T("Setup"),
                   "res/actions/opacity24.png",
                   "res/actions/opacity.png")
        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .codeExtraInformation.SetFunctionName("SetFillOpacity").SetManipulatedType("number").SetAssociatedGetter("GetFillOpacity").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddCondition("FillOpacity",
                   GD_T("Fill opacity"),
                   GD_T("Test the value of the opacity of the filling."),
                   GD_T("The opacity of filling of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Setup"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")
        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .codeExtraInformation.SetFunctionName("GetFillOpacity").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

    obj.AddAction("OutlineOpacity",
                   GD_T("Outline opacity"),
                   GD_T("Modify the opacity of the outline of future drawings."),
                   GD_T("Do _PARAM1__PARAM2_ to the opacity of the outline of _PARAM0_"),
                   GD_T("Setup"),
                   "res/actions/opacity24.png",
                   "res/actions/opacity.png")
        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .codeExtraInformation.SetFunctionName("SetOutlineOpacity").SetManipulatedType("number").SetAssociatedGetter("GetOutlineOpacity").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

    obj.AddCondition("OutlineOpacity",
                   GD_T("Outline opacity"),
                   GD_T("Test the opacity of the outline."),
                   GD_T("The opacity of the outline of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Setup"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")
        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .codeExtraInformation.SetFunctionName("GetOutlineOpacity").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");
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
        DeclarePrimitiveDrawingExtension(*this);
        AddRuntimeObject(GetObjectMetadata("PrimitiveDrawing::Drawer"),
            "RuntimeShapePainterObject", CreateRuntimeShapePainterObject);

        #if defined(GD_IDE_ONLY)
        AddAction("CopyImageOnAnother",
                       GD_T("Copy an image on another"),
                       GD_T("Copy an image on another.\nNote that the source image must be preferably kept loaded in memory."),
                       GD_T("Copy the image _PARAM1_ on _PARAM0_ at _PARAM2_;_PARAM3_"),
                       GD_T("Images"),
                       "res/copy24.png",
                       "res/copyicon.png")

            .AddParameter("string", GD_T("Name of the image to modify"))
            .AddParameter("string", GD_T("Name of the source image"))
            .AddParameter("expression", GD_T("X position"))
            .AddParameter("expression", GD_T("Y position"))
            .AddParameter("yesorno", GD_T("Should the copy take in account the source transparency\?"), "",false)
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::CopyImageOnAnother").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");


        AddAction("CaptureScreen",
                       GD_T("Capture the screen"),
                       GD_T("Capture the screen and save it into the specified folder and/or\nin the specified image."),
                       GD_T("Capture the screen ( Save it in file _PARAM1_ and/or in image _PARAM2_ )"),
                       GD_T("Images"),
                       "res/imageicon24.png",
                       "res/imageicon.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", GD_T("File where save capture"), "", true).SetDefaultValue("").CantUseUtf8()
            .AddParameter("string", GD_T("Name of the image where capture must be saved"), "", true).SetDefaultValue("")

            .codeExtraInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::CaptureScreen").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

        AddAction("CreateSFMLTexture",
                       GD_T("Create an image in memory"),
                       GD_T("Create an image in memory."),
                       GD_T("Create image _PARAM1_ in memory ( Width: _PARAM2_, Height: _PARAM3_, Color: _PARAM4_ )"),
                       GD_T("Images"),
                       "res/imageicon24.png",
                       "res/imageicon.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", GD_T("Name of the image"))
            .AddParameter("expression", GD_T("Width"), "", true)
            .AddParameter("expression", GD_T("Height"), "", true)
            .AddParameter("color", GD_T("Initial color"), "", true).SetDefaultValue("0;0;0")

            .codeExtraInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::CreateSFMLTexture").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

        AddAction("OpenSFMLTextureFromFile",
                       GD_T("Open an image from a file"),
                       GD_T("Load in memory an image from a file."),
                       GD_T("Load in memory file _PARAM1_ inside image _PARAM2_"),
                       GD_T("Images"),
                       "res/imageicon24.png",
                       "res/imageicon.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("file", GD_T("File")).CantUseUtf8()
            .AddParameter("string", GD_T("Name of the image"))

            .codeExtraInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::OpenSFMLTextureFromFile").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

        AddAction("SaveSFMLTextureToFile",
                       GD_T("Save an image to a file"),
                       GD_T("Save an image to a file"),
                       GD_T("Save image _PARAM2_ to file _PARAM1_"),
                       GD_T("Images"),
                       "res/imageicon24.png",
                       "res/imageicon.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("file", GD_T("File")).CantUseUtf8()
            .AddParameter("string", GD_T("Name of the image"))

            .codeExtraInformation.SetFunctionName("GDpriv::PrimitiveDrawingTools::SaveSFMLTextureToFile").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

        #endif
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
