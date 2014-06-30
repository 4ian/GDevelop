/*

AdvancedXML
Copyright (C) 2012 Victor Levasseur

  This software is provided 'as-is', without any express or implied
  warranty.  In no event will the authors be held liable for any damages
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
  3. This notice may not be removed or altered from any source distribution.

*/
/**
 * Contributors to the extension:
 * Florian Rival ( Minor changes and adaptations )
 */

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "AdvancedXMLRefManager.h"
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
        SetExtensionInformation("AdvancedXML",
                              _("Advanced XML 1.0"),
                              _("Extension allowing to manipulate XML files."),
                              "Victor Levasseur",
                              "zlib/libpng License (Open Source)");

        #if defined(GD_IDE_ONLY)

        AddAction("NewFile",
                       _("Create an XML document"),
                       _("Create an XML document"),
                       _("Create an XML document into reference _PARAM0_"),
                       _("Advanced XML : Documents"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Reference (allow to access later to the element)"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::CreateNewDocument").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

        AddAction("LoadFile",
                       _("Load an XML file"),
                       _("Load an XML file."),
                       _("Load XML File _PARAM0_ into reference _PARAM1_"),
                       _("Advanced XML : Documents"),
                       "res/AdvancedXML/AdvancedXMLOpen.png",
                       "res/AdvancedXML/AdvancedXMLOpen16.png")

            .AddParameter("file", _("Source file"))
            .AddParameter("string", _("Reference (allow to access later to the element)"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::LoadXmlFile").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

        AddAction("SaveFile",
                       _("Save an XML file"),
                       _("Save an XML file."),
                       _("Save XML file _PARAM1_ into _PARAM0_"),
                       _("Advanced XML : Documents"),
                       "res/AdvancedXML/AdvancedXMLSave.png",
                       "res/AdvancedXML/AdvancedXMLSave16.png")

            .AddParameter("file", _("File where to save the document"))
            .AddParameter("string", _("Reference to the XML document"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::SaveXmlFile").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

        AddAction("BrowseTo",
                       _("Load an element into a reference"),
                       _("Load an element (relative to another) in a reference.\nNote: References allows to access to an element using the name of the reference pointing to it."),
                       _("Load path _PARAM2_ (relative to the element _PARAM0_) into reference _PARAM1_"),
                       _("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXMLRef.png",
                       "res/AdvancedXML/AdvancedXMLRef16.png")

            .AddParameter("string", _("Reference of an existing element ( The path of the element will be relative to this element )"))
            .AddParameter("string", _("Name of the reference to the newly created element"))
            .AddParameter("string", _("Path ( tags can be browsed by separating them using /. Use * to go to the first child element without knowing the tag name )"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::BrowseTo").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

        AddAction("NextSibling",
                       _("Go to next element"),
                       _("Create a reference on the element following the specified element.\nNote: The reference will be invalid if there is no valid element following the specified one.Conditions are available to check if an element is valid."),
                       _("Load the element called _PARAM2_ following _PARAM1_ into reference _PARAM0_"),
                       _("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXMLRef.png",
                       "res/AdvancedXML/AdvancedXMLRef16.png")

            .AddParameter("string", _("Reference to create"))
            .AddParameter("string", _("Reference to the element preceeding the element to be accessed"))
            .AddParameter("string", _("Tag name filter "), "", true)
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::NextSibling").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

        AddCondition("IsRefValid",
                       _("The reference is valid"),
                       _("Is valid only when the reference is pointing to an existing and valid element."),
                       _("_PARAM0_ exists and is valid"),
                       _("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Reference to the element to be tested"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::IsRefValid").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");



        AddCondition("GetElementType",
                       _("Element type"),
                       _("Test the type of the element.\n(0-> Tag, 1-> Text, 2-> Comment, 3-> XML Document, -1 -> Unknown )"),
                       _("Type of _PARAM0_ _PARAM1__PARAM2_"),
                       _("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Reference to the element to be tested"))
            .AddParameter("relationalOperator", _("Comparison sign"))
            .AddParameter("expression", _("Type"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::GetRefType").SetManipulatedType("number").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");



        AddExpression("GetElementType",
                       _("Element type"),
                       _("Return the type of the element.\n(0-> Tag, 1-> Text, 2-> Comment, 3-> XML Document, -1 -> Unknown )"),
                       _("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Element reference"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::GetRefType").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");



        AddAction("CreateNewElement",
                       _("Create a new element"),
                       _("Create a new element.\nNote: References allows to access to an element using the name of the reference pointing to it."),
                       _("Create a new element of type _PARAM1_ and attach to it the reference _PARAM0_"),
                       _("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXMLAdd.png",
                       "res/AdvancedXML/AdvancedXMLAdd16.png")

            .AddParameter("string", _("Reference which will be used to access to the element"))
            .AddParameter("expression", _("Tye of the element to be created\n(0-> Tag, 1-> Text, 2-> Comment )"))
            .AddParameter("string", _("Text of the element\nIf the element is a tag, it will be the tag name,if the element is a text or a comment, it will be the content."))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::CreateNewElement").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

        AddAction("DeleteAnElement",
                       _("Delete an element"),
                       _("Delete an element (The element will be removed from its parent and will be destroyed)."),
                       _("Delete element _PARAM0_"),
                       _("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXMLRemove.png",
                       "res/AdvancedXML/AdvancedXMLRemove16.png")

            .AddParameter("string", _("Reference to the element to be deleted"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::DeleteAnElement").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

        AddAction("InsertElementIntoAnother",
                       _("Add an element inside another"),
                       _("Add an element into another: The element will be a \"child\" of its \"parent\"."),
                       _("Add _PARAM0_ as a child of _PARAM1_ (before _PARAM2_)"),
                       _("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Reference to the element to be added"))
            .AddParameter("string", _("Reference to the parent element (must be a Tag element)"))
            .AddParameter("string", _("The element will be added before this element (if not defined, the element will be added at the end)"), "", true)
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::InsertElementIntoAnother").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

        AddAction("SetTagName",
                       _("Change the tag name"),
                       _("Change the tag name"),
                       _("Do _PARAM1__PARAM2_ to the name of tag _PARAM0_"),
                       _("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Reference to the Tag element"))
            .AddParameter("operator", _("Modification sign"))
            .AddParameter("string", _("Tag name"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::SetText").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h").SetAssociatedGetter("AdvancedXML::GetText").SetManipulatedType("string");

        AddStrExpression("GetTagName",
                       _("Tag name"),
                       _("Get the name of a tag"),
                       _("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Element reference"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::GetText").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");



        AddAction("SetContent",
                       _("Change the content of the element"),
                       _("Change the content (text) of the element ( For text and comments elements only )."),
                       _("Do _PARAM1__PARAM2_ to the content of _PARAM0_"),
                       _("Advanced XML : Text and comments"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Reference to the element"))
            .AddParameter("operator", _("Modification sign"))
            .AddParameter("string", _("Contents"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::SetText").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h").SetAssociatedGetter("AdvancedXML::GetText").SetManipulatedType("string");

        AddStrExpression("GetContent",
                       _("Contents"),
                       _("Get the content of a text or comment element"),
                       _("Advanced XML : Text and comments"),
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Element reference"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::GetText").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");



        AddExpression("GetAttributeNumber",
                       _("Value of an attribute of an element"),
                       _("Get the value of an attribute of an element"),
                       _("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Element reference"))
            .AddParameter("string", _("Name of the attribute"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::GetAttributeNumber").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");



        AddAction("SetAttributeNumber",
                       _("Change the value of an attribute"),
                       _("Change the value of an attribute of an element ( which must be a Tag element )."),
                       _("Do _PARAM2__PARAM3_ to the attribute _PARAM1_ of element _PARAM0_"),
                       _("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Reference to the element"))
            .AddParameter("string", _("Name of the attribute"))
            .AddParameter("operator", _("Modification sign"))
            .AddParameter("expression", _("Value"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::SetAttributeNumber").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h").SetAssociatedGetter("AdvancedXML::GetAttributeNumber").SetManipulatedType("number");

        AddStrExpression("GetAttributeString",
                       _("Text of an attribute of an element"),
                       _("Get the text of an attribute of an element"),
                       _("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Element reference"))
            .AddParameter("string", _("Name of the attribute"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::GetAttributeString").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");



        AddAction("SetAttributeString",
                       _("Change the text of an attribute"),
                       _("Change the text of an attribute of an element ( which must be a Tag element )."),
                       _("Do _PARAM2__PARAM3_ to the attribute _PARAM1_ of element _PARAM0_"),
                       _("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Reference to the element"))
            .AddParameter("string", _("Name of the attribute"))
            .AddParameter("operator", _("Modification sign"))
            .AddParameter("string", _("Value"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::SetAttributeString").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h").SetAssociatedGetter("AdvancedXML::GetAttributeString").SetManipulatedType("string");

        AddAction("RemoveAttribute",
                       _("Delete an attribute"),
                       _("Delete an attribute from an element ( which must be a Tag element)."),
                       _("Delete attribute _PARAM1_ from the element _PARAM0_"),
                       _("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", _("Reference to the element"))
            .AddParameter("string", _("Name of the attribute"))
            .AddCodeOnlyParameter("currentScene", "")

            .codeExtraInformation.SetFunctionName("AdvancedXML::RemoveAttribute").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension()
    {
        AdvancedXML::RefManager::Destroy();
    };
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

