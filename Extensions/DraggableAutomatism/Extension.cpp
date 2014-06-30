/**

Game Develop - Draggable Automatism Extension
Copyright (c) 2014 Florian Rival (Florian.Rival@gmail.com)

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
#include "DraggableAutomatism.h"
#include <boost/version.hpp>

void DeclareDraggableAutomatismExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("DraggableAutomatism",
                              _("Draggable Automatism"),
                              _("Automatism allowing to move objects with the mouse"),
                              "Florian Rival",
                              "zlib/libpng License (Open Source)");

    gd::AutomatismMetadata & aut = extension.AddAutomatism("Draggable",
          _("Draggable object"),
          _("Draggable"),
          _("Allows objects to be moved using the mouse."),
          "",
          "CppPlatform/Extensions/draggableicon.png",
          "DraggableAutomatism",
          boost::shared_ptr<gd::Automatism>(new DraggableAutomatism),
          boost::shared_ptr<gd::AutomatismsSharedData>());

    #if defined(GD_IDE_ONLY)
    aut.SetIncludeFile("DraggableAutomatism/DraggableAutomatism.h");

    aut.AddCondition("Dragged",
                   _("Being dragged"),
                   _("Return true if the object is being dragged"),
                   _("_PARAM0_ is being dragged"),
                   "",
                   "CppPlatform/Extensions/draggableicon24.png",
                   "CppPlatform/Extensions/draggableicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "Draggable", false)
        .codeExtraInformation.SetFunctionName("IsDragged").SetIncludeFile("DraggableAutomatism/DraggableAutomatism.h");
    #endif

}

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
        DeclareDraggableAutomatismExtension(*this);
        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
};

#if !defined(EMSCRIPTEN)
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
#endif