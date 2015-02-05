/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Version.h"
#include <boost/version.hpp>
#include <iostream>

void DeclarePrimitiveDrawingExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class PrimitiveDrawingJsExtension : public gd::PlatformExtension
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    PrimitiveDrawingJsExtension()
    {
        DeclarePrimitiveDrawingExtension(*this);
        GetObjectMetadata("PrimitiveDrawing::Drawer").SetIncludeFile("PrimitiveDrawing/shapepainterruntimeobject.js");

        GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::Rectangle"].codeExtraInformation
            .SetFunctionName("drawRectangle");
        GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::Circle"].codeExtraInformation
            .SetFunctionName("drawCircle");
        GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::Line"].codeExtraInformation
            .SetFunctionName("drawLine");
        GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::FillColor"].codeExtraInformation
            .SetFunctionName("setFillColor");
        GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineColor"].codeExtraInformation
            .SetFunctionName("setOutlineColor");
        GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineSize"].codeExtraInformation
            .SetFunctionName("setOutlineSize").SetAssociatedGetter("getOutlineSize");
        GetAllConditionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineSize"].codeExtraInformation
            .SetFunctionName("getOutlineSize");
        GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::FillOpacity"].codeExtraInformation
            .SetFunctionName("setFillOpacity").SetAssociatedGetter("getFillOpacity");
        GetAllConditionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::FillOpacity"].codeExtraInformation
            .SetFunctionName("getFillOpacity");
        GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineOpacity"].codeExtraInformation
            .SetFunctionName("setOutlineOpacity").SetAssociatedGetter("getOutlineOpacity");
        GetAllConditionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineOpacity"].codeExtraInformation
            .SetFunctionName("getOutlineOpacity");

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSPrimitiveDrawingExtension() {
    return new PrimitiveDrawingJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new PrimitiveDrawingJsExtension;
}
#endif
#endif
