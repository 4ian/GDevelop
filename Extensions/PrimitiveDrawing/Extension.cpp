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
                   _("Rectangle"),
                   _("Draw a rectangle on screen"),
                   GD_T("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a rectangle with _PARAM0_"),
                   _("Drawing"),
                   "res/actions/rectangle24.png",
                   "res/actions/rectangle.png")

        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("expression", GD_T("Top left side: X Position"))
        .AddParameter("expression", GD_T("Top left side : Y Position"))
        .AddParameter("expression", GD_T("Bottom right side : X Position"))
        .AddParameter("expression", GD_T("Bottom right side : Y Position"))
        .SetFunctionName("DrawRectangle").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("Circle",
                   _("Circle"),
                   _("Draw a circle on screen"),
                   GD_T("Draw at _PARAM1_;_PARAM2_ a circle of radius _PARAM3_ with _PARAM0_"),
                   _("Drawing"),
                   "res/actions/circle24.png",
                   "res/actions/circle.png")

        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("expression", GD_T("X position of center"))
        .AddParameter("expression", GD_T("Y position of center"))
        .AddParameter("expression", GD_T("Radius ( in pixels )"))
        .SetFunctionName("DrawCircle").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("Line",
                   _("Line"),
                   _("Draw a line  on screen"),
                   GD_T("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a line (thickness  : _PARAM5_) with _PARAM0_"),
                   _("Drawing"),
                   "res/actions/line24.png",
                   "res/actions/line.png")

        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("expression", GD_T("X Position of start point"))
        .AddParameter("expression", GD_T("Y Position of start point"))
        .AddParameter("expression", GD_T("X Position of end point"))
        .AddParameter("expression", GD_T("Y Position of end point"))
        .AddParameter("expression", GD_T("Thickness ( in pixels )"))
        .SetFunctionName("DrawLine").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("FillColor",
                   _("Fill color"),
                   _("Change the color of filling"),
                   GD_T("Change fill color of _PARAM0_ to _PARAM1_"),
                   _("Setup"),
                   "res/actions/text24.png",
                   "res/actions/text.png")

        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("color", GD_T("Fill color"))
        .SetFunctionName("SetFillColor").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("OutlineColor",
                   _("Outline color"),
                   _("Modify the color of the outline of future drawings."),
                   GD_T("Change outline color of _PARAM0_ to _PARAM1_"),
                   _("Setup"),
                   "res/actions/color24.png",
                   "res/actions/color.png")

        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("color", GD_T("Color"))
        .SetFunctionName("SetOutlineColor").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("OutlineSize",
                   _("Outline size"),
                   _("Modify the size of the outline of future drawings."),
                   GD_T("Do _PARAM1__PARAM2_ to the size of the outline of _PARAM0_"),
                   _("Setup"),
                   "res/actions/outlineSize24.png",
                   "res/actions/outlineSize.png")

        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Size in pixels"))
        .SetFunctionName("SetOutlineSize").SetManipulatedType("number").SetGetter("GetOutlineSize").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddCondition("OutlineSize",
                   _("Outline size"),
                   _("Test the size of the outline."),
                   GD_T("The size of the outline of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Setup"),
                   "res/conditions/outlineSize24.png",
                   "res/conditions/outlineSize.png")

        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Size to test"))
        .SetFunctionName("GetOutlineSize").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("FillOpacity",
                   _("Fill opacity"),
                   _("Modify the opacity of filling of future drawings."),
                   GD_T("Do _PARAM1__PARAM2_ to the opacity of filling of _PARAM0_"),
                   _("Setup"),
                   "res/actions/opacity24.png",
                   "res/actions/opacity.png")

        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .SetFunctionName("SetFillOpacity").SetManipulatedType("number").SetGetter("GetFillOpacity").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");



    obj.AddCondition("FillOpacity",
                   _("Fill opacity"),
                   _("Test the value of the opacity of the filling."),
                   GD_T("The opacity of filling of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Setup"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .SetFunctionName("GetFillOpacity").SetManipulatedType("number").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddAction("OutlineOpacity",
                   _("Outline opacity"),
                   _("Modify the opacity of the outline of future drawings."),
                   GD_T("Do _PARAM1__PARAM2_ to the opacity of the outline of _PARAM0_"),
                   _("Setup"),
                   "res/actions/opacity24.png",
                   "res/actions/opacity.png")

        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .SetFunctionName("SetOutlineOpacity").SetManipulatedType("number").SetGetter("GetOutlineOpacity").SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


    obj.AddCondition("OutlineOpacity",
                   _("Outline opacity"),
                   _("Test the opacity of the outline."),
                   GD_T("The opacity of the outline of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Setup"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

        .AddParameter("object", GD_T("Shape Painter object"), "Drawer", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
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
        AddRuntimeObject(GetObjectMetadata("PrimitiveDrawing::Drawer"),
            "RuntimeShapePainterObject", CreateRuntimeShapePainterObject);

        #if defined(GD_IDE_ONLY)
        AddAction("CopyImageOnAnother",
                       _("Copy an image on another"),
                       _("Copy an image on another.\nNote that the source image must be preferably kept loaded in memory."),
                       GD_T("Copy the image _PARAM1_ on _PARAM0_ at _PARAM2_;_PARAM3_"),
                       _("Images"),
                       "res/copy24.png",
                       "res/copyicon.png")

            .AddParameter("string", GD_T("Name of the image to modify"))
            .AddParameter("string", GD_T("Name of the source image"))
            .AddParameter("expression", GD_T("X position"))
            .AddParameter("expression", GD_T("Y position"))
            .AddParameter("yesorno", GD_T("Should the copy take in account the source transparency\?"), "",false)
            .AddCodeOnlyParameter("currentScene", "")

            .SetFunctionName("GDpriv::PrimitiveDrawingTools::CopyImageOnAnother").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");


        AddAction("CaptureScreen",
                       _("Capture the screen"),
                       _("Capture the screen and save it into the specified folder and/or\nin the specified image."),
                       GD_T("Capture the screen ( Save it in file _PARAM1_ and/or in image _PARAM2_ )"),
                       _("Images"),
                       "res/imageicon24.png",
                       "res/imageicon.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", GD_T("File where save capture"), "", true).SetDefaultValue("").CantUseUtf8()
            .AddParameter("string", GD_T("Name of the image where capture must be saved"), "", true).SetDefaultValue("")

            .SetFunctionName("GDpriv::PrimitiveDrawingTools::CaptureScreen").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

        AddAction("CreateSFMLTexture",
                       _("Create an image in memory"),
                       _("Create an image in memory."),
                       GD_T("Create image _PARAM1_ in memory ( Width: _PARAM2_, Height: _PARAM3_, Color: _PARAM4_ )"),
                       _("Images"),
                       "res/imageicon24.png",
                       "res/imageicon.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", GD_T("Name of the image"))
            .AddParameter("expression", GD_T("Width"), "", true)
            .AddParameter("expression", GD_T("Height"), "", true)
            .AddParameter("color", GD_T("Initial color"), "", true).SetDefaultValue("0;0;0")

            .SetFunctionName("GDpriv::PrimitiveDrawingTools::CreateSFMLTexture").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

        AddAction("OpenSFMLTextureFromFile",
                       _("Open an image from a file"),
                       _("Load in memory an image from a file."),
                       GD_T("Load in memory file _PARAM1_ inside image _PARAM2_"),
                       _("Images"),
                       "res/imageicon24.png",
                       "res/imageicon.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("file", GD_T("File")).CantUseUtf8()
            .AddParameter("string", GD_T("Name of the image"))

            .SetFunctionName("GDpriv::PrimitiveDrawingTools::OpenSFMLTextureFromFile").SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

        AddAction("SaveSFMLTextureToFile",
                       _("Save an image to a file"),
                       _("Save an image to a file"),
                       GD_T("Save image _PARAM2_ to file _PARAM1_"),
                       _("Images"),
                       "res/imageicon24.png",
                       "res/imageicon.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("file", GD_T("File")).CantUseUtf8()
            .AddParameter("string", GD_T("Name of the image"))

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
