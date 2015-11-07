/**

GDevelop - LinkedObjects Extension
Copyright (c) 2008-2013  Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Version.h"

#include <iostream>
#include "GDCore/Tools/Localization.h"

/**
 * \brief This class declares information about the JS extension.
 */
class JsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    JsExtension()
    {
        SetExtensionInformation("LinkedObjects",
                              _("Linked objects"),
                              _("Extension allowing to virtually link two objects."),
                              "Florian Rival",
                              "Open source (MIT License)");

        CloneExtension("GDevelop C++ platform", "LinkedObjects");

        GetAllActions()["LinkedObjects::LinkObjects"].codeExtraInformation.SetIncludeFile("LinkedObjects/linkedobjects.js")
            .SetFunctionName("gdjs.evtTools.linkedObjects.linkObjects");
        GetAllActions()["LinkedObjects::RemoveLinkBetween"].codeExtraInformation.SetIncludeFile("LinkedObjects/linkedobjects.js")
            .SetFunctionName("gdjs.evtTools.linkedObjects.removeLinkBetween");
        GetAllActions()["LinkedObjects::RemoveAllLinksOf"].codeExtraInformation.SetIncludeFile("LinkedObjects/linkedobjects.js")
            .SetFunctionName("gdjs.evtTools.linkedObjects.removeAllLinksOf");
        GetAllActions()["LinkedObjects::PickObjectsLinkedTo"].codeExtraInformation.SetIncludeFile("LinkedObjects/linkedobjects.js")
            .SetFunctionName("gdjs.evtTools.linkedObjects.pickObjectsLinkedTo");
        GetAllConditions()["LinkedObjects::PickObjectsLinkedTo"].codeExtraInformation.SetIncludeFile("LinkedObjects/linkedobjects.js")
            .SetFunctionName("gdjs.evtTools.linkedObjects.pickObjectsLinkedTo");

        StripUnimplementedInstructionsAndExpressions();
    };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new JsExtension;
}
#endif
