/**

GDevelop - LinkedObjects Extension
Copyright (c) 2008-2013  Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include <iostream>
#include "GDCore/Tools/Localization.h"

void DeclareLinkedObjectsExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class LinkedObjectsJsExtension : public gd::PlatformExtension {
 public:
  /**
   * \brief Constructor of an extension declares everything the extension
   * contains: objects, actions, conditions and expressions.
   */
  LinkedObjectsJsExtension() {
    DeclareLinkedObjectsExtension(*this);

    GetAllActions()["LinkedObjects::LinkObjects"]
        .SetIncludeFile("Extensions/LinkedObjects/linkedobjects.js")
        .SetFunctionName("gdjs.evtTools.linkedObjects.linkObjects");
    GetAllActions()["LinkedObjects::RemoveLinkBetween"]
        .SetIncludeFile("Extensions/LinkedObjects/linkedobjects.js")
        .SetFunctionName("gdjs.evtTools.linkedObjects.removeLinkBetween");
    GetAllActions()["LinkedObjects::RemoveAllLinksOf"]
        .SetIncludeFile("Extensions/LinkedObjects/linkedobjects.js")
        .SetFunctionName("gdjs.evtTools.linkedObjects.removeAllLinksOf");
    GetAllActions()["LinkedObjects::PickObjectsLinkedTo"]
        .SetIncludeFile("Extensions/LinkedObjects/linkedobjects.js")
        .SetFunctionName("gdjs.evtTools.linkedObjects.pickObjectsLinkedTo");
    GetAllConditions()["LinkedObjects::PickObjectsLinkedTo"]
        .SetIncludeFile("Extensions/LinkedObjects/linkedobjects.js")
        .SetFunctionName("gdjs.evtTools.linkedObjects.pickObjectsLinkedTo");

    StripUnimplementedInstructionsAndExpressions();
    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSLinkedObjectsExtension() {
  return new LinkedObjectsJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new LinkedObjectsJsExtension;
}
#endif
#endif
