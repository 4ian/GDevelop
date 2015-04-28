/*

GDevelop - AdvancedXML Extension
Copyright (c) 2012-2015 Victor Levasseur
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Florian Rival (Minor changes and adaptations)
 */

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "GDCore/Tools/Localization.h"
#include "AdvancedXMLRefManager.h"


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
        SetExtensionInformation("AdvancedXML",
                              GD_T("Advanced XML 1.0"),
                              GD_T("Extension allowing to manipulate XML files."),
                              "Victor Levasseur",
                              "Open source (MIT License)");

        #if defined(GD_IDE_ONLY)

        AddAction("NewFile",
                       GD_T("Create an XML document"),
                       GD_T("Create an XML document"),
                       GD_T("Create an XML document into reference _PARAM0_"),
                       GD_T("Advanced XML : Documents"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Reference (allow to access later to the element)"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::CreateNewDocument").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");

        AddAction("LoadFile",
                       GD_T("Load an XML file"),
                       GD_T("Load an XML file."),
                       GD_T("Load XML File _PARAM0_ into reference _PARAM1_"),
                       GD_T("Advanced XML : Documents"),
                       "res/AdvancedXML/AdvancedXMLOpen.png",
                       "res/AdvancedXML/AdvancedXMLOpen16.png")

            .AddParameter("file", GD_T("Source file"))
            .AddParameter("string", GD_T("Reference (allow to access later to the element)"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::LoadXmlFile").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");

        AddAction("SaveFile",
                       GD_T("Save an XML file"),
                       GD_T("Save an XML file."),
                       GD_T("Save XML file _PARAM1_ into _PARAM0_"),
                       GD_T("Advanced XML : Documents"),
                       "res/AdvancedXML/AdvancedXMLSave.png",
                       "res/AdvancedXML/AdvancedXMLSave16.png")

            .AddParameter("file", GD_T("File where to save the document"))
            .AddParameter("string", GD_T("Reference to the XML document"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::SaveXmlFile").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");

        AddAction("BrowseTo",
                       GD_T("Load an element into a reference"),
                       GD_T("Load an element (relative to another) in a reference.\nNote: References allows to access to an element using the name of the reference pointing to it."),
                       GD_T("Load path _PARAM2_ (relative to the element _PARAM0_) into reference _PARAM1_"),
                       GD_T("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXMLRef.png",
                       "res/AdvancedXML/AdvancedXMLRef16.png")

            .AddParameter("string", GD_T("Reference of an existing element ( The path of the element will be relative to this element )"))
            .AddParameter("string", GD_T("Name of the reference to the newly created element"))
            .AddParameter("string", GD_T("Path ( tags can be browsed by separating them using /. Use * to go to the first child element without knowing the tag name )"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::BrowseTo").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");

        AddAction("NextSibling",
                       GD_T("Go to next element"),
                       GD_T("Create a reference on the element following the specified element.\nNote: The reference will be invalid if there is no valid element following the specified one.Conditions are available to check if an element is valid."),
                       GD_T("Load the element called _PARAM2_ following _PARAM1_ into reference _PARAM0_"),
                       GD_T("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXMLRef.png",
                       "res/AdvancedXML/AdvancedXMLRef16.png")

            .AddParameter("string", GD_T("Reference to create"))
            .AddParameter("string", GD_T("Reference to the element preceeding the element to be accessed"))
            .AddParameter("string", GD_T("Tag name filter "), "", true)
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::NextSibling").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");

        AddCondition("IsRefValid",
                       GD_T("The reference is valid"),
                       GD_T("Is valid only when the reference is pointing to an existing and valid element."),
                       GD_T("_PARAM0_ exists and is valid"),
                       GD_T("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Reference to the element to be tested"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::IsRefValid").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");



        AddCondition("GetElementType",
                       GD_T("Element type"),
                       GD_T("Test the type of the element.\n(0-> Tag, 1-> Text, 2-> Comment, 3-> XML Document, -1 -> Unknown )"),
                       GD_T("Type of _PARAM0_ _PARAM1__PARAM2_"),
                       GD_T("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Reference to the element to be tested"))
            .AddParameter("relationalOperator", GD_T("Comparison sign"))
            .AddParameter("expression", GD_T("Type"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::GetRefType").SetManipulatedType("number").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");



        AddExpression("GetElementType",
                       GD_T("Element type"),
                       GD_T("Return the type of the element.\n(0-> Tag, 1-> Text, 2-> Comment, 3-> XML Document, -1 -> Unknown )"),
                       GD_T("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Element reference"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::GetRefType").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");



        AddAction("CreateNewElement",
                       GD_T("Create a new element"),
                       GD_T("Create a new element.\nNote: References allows to access to an element using the name of the reference pointing to it."),
                       GD_T("Create a new element of type _PARAM1_ and attach to it the reference _PARAM0_"),
                       GD_T("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXMLAdd.png",
                       "res/AdvancedXML/AdvancedXMLAdd16.png")

            .AddParameter("string", GD_T("Reference which will be used to access to the element"))
            .AddParameter("expression", GD_T("Tye of the element to be created\n(0-> Tag, 1-> Text, 2-> Comment )"))
            .AddParameter("string", GD_T("Text of the element\nIf the element is a tag, it will be the tag name,if the element is a text or a comment, it will be the content."))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::CreateNewElement").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");

        AddAction("DeleteAnElement",
                       GD_T("Delete an element"),
                       GD_T("Delete an element (The element will be removed from its parent and will be destroyed)."),
                       GD_T("Delete element _PARAM0_"),
                       GD_T("Advanced XML: General"),
                       "res/AdvancedXML/AdvancedXMLRemove.png",
                       "res/AdvancedXML/AdvancedXMLRemove16.png")

            .AddParameter("string", GD_T("Reference to the element to be deleted"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::DeleteAnElement").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");

        AddAction("InsertElementIntoAnother",
                       GD_T("Add an element inside another"),
                       GD_T("Add an element into another: The element will be a \"child\" of its \"parent\"."),
                       GD_T("Add _PARAM0_ as a child of _PARAM1_ (before _PARAM2_)"),
                       GD_T("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Reference to the element to be added"))
            .AddParameter("string", GD_T("Reference to the parent element (must be a Tag element)"))
            .AddParameter("string", GD_T("The element will be added before this element (if not defined, the element will be added at the end)"), "", true)
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::InsertElementIntoAnother").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");

        AddAction("SetTagName",
                       GD_T("Change the tag name"),
                       GD_T("Change the tag name"),
                       GD_T("Do _PARAM1__PARAM2_ to the name of tag _PARAM0_"),
                       GD_T("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Reference to the Tag element"))
            .AddParameter("operator", GD_T("Modification sign"))
            .AddParameter("string", GD_T("Tag name"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::SetText").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h").SetGetter("AdvancedXML::GetText").SetManipulatedType("string");

        AddStrExpression("GetTagName",
                       GD_T("Tag name"),
                       GD_T("Get the name of a tag"),
                       GD_T("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Element reference"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::GetText").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");



        AddAction("SetContent",
                       GD_T("Change the content of the element"),
                       GD_T("Change the content (text) of the element ( For text and comments elements only )."),
                       GD_T("Do _PARAM1__PARAM2_ to the content of _PARAM0_"),
                       GD_T("Advanced XML : Text and comments"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Reference to the element"))
            .AddParameter("operator", GD_T("Modification sign"))
            .AddParameter("string", GD_T("Contents"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::SetText").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h").SetGetter("AdvancedXML::GetText").SetManipulatedType("string");

        AddStrExpression("GetContent",
                       GD_T("Contents"),
                       GD_T("Get the content of a text or comment element"),
                       GD_T("Advanced XML : Text and comments"),
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Element reference"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::GetText").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");



        AddExpression("GetAttributeNumber",
                       GD_T("Value of an attribute of an element"),
                       GD_T("Get the value of an attribute of an element"),
                       GD_T("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Element reference"))
            .AddParameter("string", GD_T("Name of the attribute"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::GetAttributeNumber").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");



        AddAction("SetAttributeNumber",
                       GD_T("Change the value of an attribute"),
                       GD_T("Change the value of an attribute of an element ( which must be a Tag element )."),
                       GD_T("Do _PARAM2__PARAM3_ to the attribute _PARAM1_ of element _PARAM0_"),
                       GD_T("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Reference to the element"))
            .AddParameter("string", GD_T("Name of the attribute"))
            .AddParameter("operator", GD_T("Modification sign"))
            .AddParameter("expression", GD_T("Value"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::SetAttributeNumber").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h").SetGetter("AdvancedXML::GetAttributeNumber").SetManipulatedType("number");

        AddStrExpression("GetAttributeString",
                       GD_T("Text of an attribute of an element"),
                       GD_T("Get the text of an attribute of an element"),
                       GD_T("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Element reference"))
            .AddParameter("string", GD_T("Name of the attribute"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::GetAttributeString").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");



        AddAction("SetAttributeString",
                       GD_T("Change the text of an attribute"),
                       GD_T("Change the text of an attribute of an element ( which must be a Tag element )."),
                       GD_T("Do _PARAM2__PARAM3_ to the attribute _PARAM1_ of element _PARAM0_"),
                       GD_T("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Reference to the element"))
            .AddParameter("string", GD_T("Name of the attribute"))
            .AddParameter("operator", GD_T("Modification sign"))
            .AddParameter("string", GD_T("Value"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::SetAttributeString").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h").SetGetter("AdvancedXML::GetAttributeString").SetManipulatedType("string");

        AddAction("RemoveAttribute",
                       GD_T("Delete an attribute"),
                       GD_T("Delete an attribute from an element ( which must be a Tag element)."),
                       GD_T("Delete attribute _PARAM1_ from the element _PARAM0_"),
                       GD_T("Advanced XML: Tag"),
                       "res/AdvancedXML/AdvancedXML.png",
                       "res/AdvancedXML/AdvancedXML16.png")

            .AddParameter("string", GD_T("Reference to the element"))
            .AddParameter("string", GD_T("Name of the attribute"))
            .AddCodeOnlyParameter("currentScene", "")
            .SetFunctionName("AdvancedXML::RemoveAttribute").SetIncludeFile("AdvancedXML/src/AdvancedXMLTools.h");

        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension()
    {
        AdvancedXML::RefManager::Destroy();
    };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
