/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "ShapePainterObject.h"


void DeclarePrimitiveDrawingExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("PrimitiveDrawing",
                  _("Primitive drawing"),
                  _("This Extension allows you to draw shapes and manipulate images."),
                  "Florian Rival",
                  "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject<ShapePainterObject>(
               "Drawer", //"Drawer" is kept for compatibility with GD<=3.6.76
               _("Shape painter"),
               _("Allows you to draw simple shapes on the screen"),
               "CppPlatform/Extensions/primitivedrawingicon.png");

    #if defined(GD_IDE_ONLY)
    #if !defined(GD_NO_WX_GUI)
    ShapePainterObject::LoadEdittimeIcon();
    #endif

    obj.SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

    obj.AddAction("Rectangle",
                   _("Rectangle"),
                   _("Draw a rectangle on screen"),
                   _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a rectangle with _PARAM0_"),
                   _("Drawing"),
                   "res/actions/rectangle24.png",
                   "res/actions/rectangle.png")

        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("expression", _("Top left side: X Position"))
        .AddParameter("expression", _("Top left side : Y Position"))
        .AddParameter("expression", _("Bottom right side : X Position"))
        .AddParameter("expression", _("Bottom right side : Y Position"))
        .SetFunctionName("DrawRectangle").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("Circle",
                   _("Circle"),
                   _("Draw a circle on screen"),
                   _("Draw at _PARAM1_;_PARAM2_ a circle of radius _PARAM3_ with _PARAM0_"),
                   _("Drawing"),
                   "res/actions/circle24.png",
                   "res/actions/circle.png")

        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("expression", _("X position of center"))
        .AddParameter("expression", _("Y position of center"))
        .AddParameter("expression", _("Radius ( in pixels )"))
        .SetFunctionName("DrawCircle").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("Line",
                   _("Line"),
                   _("Draw a line on screen"),
                   _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a line (thickness : _PARAM5_) with _PARAM0_"),
                   _("Drawing"),
                   "res/actions/line24.png",
                   "res/actions/line.png")

        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("expression", _("X Position of start point"))
        .AddParameter("expression", _("Y Position of start point"))
        .AddParameter("expression", _("X Position of end point"))
        .AddParameter("expression", _("Y Position of end point"))
        .AddParameter("expression", _("Thickness ( in pixels )"))
        .SetFunctionName("DrawLine").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("FillColor",
                   _("Fill color"),
                   _("Change the color used when filling"),
                   _("Change fill color of _PARAM0_ to _PARAM1_"),
                   _("Setup"),
                   "res/actions/text24.png",
                   "res/actions/text.png")

        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("color", _("Fill color"))
        .SetFunctionName("SetFillColor").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("OutlineColor",
                   _("Outline color"),
                   _("Modify the color of the outline of future drawings."),
                   _("Change outline color of _PARAM0_ to _PARAM1_"),
                   _("Setup"),
                   "res/actions/color24.png",
                   "res/actions/color.png")

        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("color", _("Color"))
        .SetFunctionName("SetOutlineColor").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("OutlineSize",
                   _("Outline size"),
                   _("Modify the size of the outline of future drawings."),
                   _("Do _PARAM1__PARAM2_ to the size of the outline of _PARAM0_"),
                   _("Setup"),
                   "res/actions/outlineSize24.png",
                   "res/actions/outlineSize.png")

        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Size in pixels"))
        .SetFunctionName("SetOutlineSize").SetManipulatedType("number").SetGetter("GetOutlineSize").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddCondition("OutlineSize",
                   _("Outline size"),
                   _("Test the size of the outline."),
                   _("The size of the outline of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Setup"),
                   "res/conditions/outlineSize24.png",
                   "res/conditions/outlineSize.png")

        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Size to test"))
        .SetFunctionName("GetOutlineSize").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("FillOpacity",
                   _("Fill opacity"),
                   _("Modify the opacity level used when filling future drawings."),
                   _("Do _PARAM1__PARAM2_ to the opacity of filling of _PARAM0_"),
                   _("Setup"),
                   "res/actions/opacity24.png",
                   "res/actions/opacity.png")

        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetFunctionName("SetFillOpacity").SetManipulatedType("number").SetGetter("GetFillOpacity").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");



    obj.AddCondition("FillOpacity",
                   _("Fill opacity"),
                   _("Test the value of the opacity level used when filling."),
                   _("The opacity level when filling of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Setup"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .SetFunctionName("GetFillOpacity").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("OutlineOpacity",
                   _("Outline opacity"),
                   _("Modify the opacity of the outline of future drawings."),
                   _("Do _PARAM1__PARAM2_ to the opacity of the outline of _PARAM0_"),
                   _("Setup"),
                   "res/actions/opacity24.png",
                   "res/actions/opacity.png")

        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetFunctionName("SetOutlineOpacity").SetManipulatedType("number").SetGetter("GetOutlineOpacity").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddCondition("OutlineOpacity",
                   _("Outline opacity"),
                   _("Test the opacity of the outline."),
                   _("The opacity of the outline of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Setup"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .SetFunctionName("GetOutlineOpacity").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

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
        AddRuntimeObject<ShapePainterObject, RuntimeShapePainterObject>(
            GetObjectMetadata("PrimitiveDrawing::Drawer"),
            "RuntimeShapePainterObject");

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
            .AddParameter("yesorno", _("Should the copy take in account the source transparency\?"))
            .AddCodeOnlyParameter("currentScene", "")

            .SetFunctionName("GDpriv::PrimitiveDrawingTools::CopyImageOnAnother").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");


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

            .SetFunctionName("GDpriv::PrimitiveDrawingTools::CaptureScreen").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

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

            .SetFunctionName("GDpriv::PrimitiveDrawingTools::CreateSFMLTexture").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

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

            .SetFunctionName("GDpriv::PrimitiveDrawingTools::OpenSFMLTextureFromFile").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

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

            .SetFunctionName("GDpriv::PrimitiveDrawingTools::SaveSFMLTextureToFile").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

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
