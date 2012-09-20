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

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
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
            DECLARE_THE_EXTENSION("AdvancedXML",
                                  _("Advanced XML 1.0"),
                                  _("Extension allowing to manipulate XML files."),
                                  "Victor Levasseur",
                                  "zlib/libpng License (Open Source)")

            #if defined(GD_IDE_ONLY)

            DECLARE_ACTION("NewFile",
                           _("Create an XML document"),
                           _("Create an XML document"),
                           _("Create an XML document into reference _PARAM0_"),
                           _("Advanced XML : Documents"),
                           "res/AdvancedXML/AdvancedXML.png",
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Reference (allow to access later to the element)"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::CreateNewDocument").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("LoadFile",
                           _("Load an XML file"),
                           _("Load an XML file."),
                           _("Load XML File _PARAM0_ into reference _PARAM1_"),
                           _("Advanced XML : Documents"),
                           "res/AdvancedXML/AdvancedXMLOpen.png",
                           "res/AdvancedXML/AdvancedXMLOpen16.png");

                instrInfo.AddParameter("file", _("Source file"), "", false);
                instrInfo.AddParameter("string", _("Reference (allow to access later to the element)"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::LoadXmlFile").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("SaveFile",
                           _("Save an XML file"),
                           _("Save an XML file."),
                           _("Save XML file _PARAM1_ into _PARAM0_"),
                           _("Advanced XML : Documents"),
                           "res/AdvancedXML/AdvancedXMLSave.png",
                           "res/AdvancedXML/AdvancedXMLSave16.png");

                instrInfo.AddParameter("file", _("File where to save the document"), "", false);
                instrInfo.AddParameter("string", _("Reference to the XML document"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::SaveXmlFile").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("BrowseTo",
                           _("Load an element into a reference"),
                           _("Load an element (relative to another) in a reference.\nNote: References allows to access to an element using the name of the reference pointing to it."),
                           _("Load path _PARAM2_ (relative to the element _PARAM0_) into reference _PARAM1_"),
                           _("Advanced XML: General"),
                           "res/AdvancedXML/AdvancedXMLRef.png",
                           "res/AdvancedXML/AdvancedXMLRef16.png");

                instrInfo.AddParameter("string", _("Reference of an existing element ( The path of the element will be relative to this element )"), "", false);
                instrInfo.AddParameter("string", _("Name of the reference to the newly created element"), "", false);
                instrInfo.AddParameter("string", _("Path ( tags can be browsed by separating them using /. Use * to go to the first child element without knowing the tag name )"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::BrowseTo").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("NextSibling",
                           _("Go to next element"),
                           _("Create a reference on the element following the specified element.\nNote: The reference will be invalid if there is no valid element following the specified one.Conditions are available to check if an element is valid."),
                           _("Load the element called _PARAM2_ following _PARAM1_ into reference _PARAM0_"),
                           _("Advanced XML: General"),
                           "res/AdvancedXML/AdvancedXMLRef.png",
                           "res/AdvancedXML/AdvancedXMLRef16.png");

                instrInfo.AddParameter("string", _("Reference to create"), "", false);
                instrInfo.AddParameter("string", _("Reference to the element preceeding the element to be accessed"), "", false);
                instrInfo.AddParameter("string", _("Tag name filter "), "", true);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::NextSibling").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_ACTION()

            DECLARE_CONDITION("IsRefValid",
                           _("The reference is valid"),
                           _("Is valid only when the reference is pointing to an existing and valid element."),
                           _("_PARAM0_ exists and is valid"),
                           _("Advanced XML: General"),
                           "res/AdvancedXML/AdvancedXML.png",
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Reference to the element to be tested"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::IsRefValid").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_CONDITION()

            DECLARE_CONDITION("GetElementType",
                           _("Element type"),
                           _("Test the type of the element.\n(0-> Tag, 1-> Text, 2-> Comment, 3-> XML Document, -1 -> Unknown )"),
                           _("Type of _PARAM0_ _PARAM2__PARAM1_"),
                           _("Advanced XML: General"),
                           "res/AdvancedXML/AdvancedXML.png",
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Reference to the element to be tested"), "", false);
                instrInfo.AddParameter("expression", _("Type"), "", false);
                instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::GetRefType").SetManipulatedType("number").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_CONDITION()

            DECLARE_EXPRESSION("GetElementType",
                           _("Element type"),
                           _("Return the type of the element.\n(0-> Tag, 1-> Text, 2-> Comment, 3-> XML Document, -1 -> Unknown )"),
                           _("Advanced XML: General"),
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Element reference"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::GetRefType").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_EXPRESSION()

            DECLARE_ACTION("CreateNewElement",
                           _("Create a new element"),
                           _("Create a new element.\nNote: References allows to access to an element using the name of the reference pointing to it."),
                           _("Create a new element of type _PARAM1_ and attach to it the reference _PARAM0_"),
                           _("Advanced XML: General"),
                           "res/AdvancedXML/AdvancedXMLAdd.png",
                           "res/AdvancedXML/AdvancedXMLAdd16.png");

                instrInfo.AddParameter("string", _("Reference which will be used to access to the element"), "", false);
                instrInfo.AddParameter("expression", _("Tye of the element to be created\n(0-> Tag, 1-> Text, 2-> Comment )"), "", false);
                instrInfo.AddParameter("string", _("Text of the element\nIf the element is a tag, it will be the tag name,if the element is a text or a comment, it will be the content."), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::CreateNewElement").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("DeleteAnElement",
                           _("Delete an element"),
                           _("Delete an element (The element will be removed from its parent and will be destroyed)."),
                           _("Delete element _PARAM0_"),
                           _("Advanced XML: General"),
                           "res/AdvancedXML/AdvancedXMLRemove.png",
                           "res/AdvancedXML/AdvancedXMLRemove16.png");

                instrInfo.AddParameter("string", _("Reference to the element to be deleted"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::DeleteAnElement").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("InsertElementIntoAnother",
                           _("Add an element inside another"),
                           _("Add an element into another: The element will be a \"child\" of its \"parent\"."),
                           _("Add _PARAM0_ as a child of _PARAM1_ (before _PARAM2_)"),
                           _("Advanced XML: Tag"),
                           "res/AdvancedXML/AdvancedXML.png",
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Reference to the element to be added"), "", false);
                instrInfo.AddParameter("string", _("Reference to the parent element (must be a Tag element)"), "", false);
                instrInfo.AddParameter("string", _("The element will be added before this element (if not defined, the element will be added at the end)"), "", true);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::InsertElementIntoAnother").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("SetTagName",
                           _("Change the tag name"),
                           _("Change the tag name"),
                           _("Do _PARAM2__PARAM1_ to the name of tag _PARAM0_"),
                           _("Advanced XML: Tag"),
                           "res/AdvancedXML/AdvancedXML.png",
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Reference to the Tag element"), "", false);
                instrInfo.AddParameter("string", _("Tag name"), "", false);
                instrInfo.AddParameter("operator", _("Modification sign"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::SetText").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h").SetAssociatedGetter("AdvancedXML::GetText").SetManipulatedType("string");

            DECLARE_END_ACTION()

            DECLARE_STR_EXPRESSION("GetTagName",
                           _("Tag name"),
                           _("Get the name of a tag"),
                           _("Advanced XML: Tag"),
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Element reference"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::GetText").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_STR_EXPRESSION()

            DECLARE_ACTION("SetContent",
                           _("Change the content of the element"),
                           _("Change the content (text) of the element ( For text and comments elements only )."),
                           _("Do _PARAM2__PARAM1_ to the content of _PARAM0_"),
                           _("Advanced XML : Text and comments"),
                           "res/AdvancedXML/AdvancedXML.png",
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Reference to the element"), "", false);
                instrInfo.AddParameter("string", _("Contents"), "", false);
                instrInfo.AddParameter("operator", _("Modification sign"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::SetText").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h").SetAssociatedGetter("AdvancedXML::GetText").SetManipulatedType("string");

            DECLARE_END_ACTION()

            DECLARE_STR_EXPRESSION("GetContent",
                           _("Contents"),
                           _("Get the content of a text or comment element"),
                           _("Advanced XML : Text and comments"),
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Element reference"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::GetText").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_STR_EXPRESSION()

            DECLARE_EXPRESSION("GetAttributeNumber",
                           _("Value of an attribute of an element"),
                           _("Get the value of an attribute of an element"),
                           _("Advanced XML: Tag"),
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Element reference"), "", false);
                instrInfo.AddParameter("string", _("Name of the attribute"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::GetAttributeNumber").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_EXPRESSION()

            DECLARE_ACTION("SetAttributeNumber",
                           _("Change the value of an attribute"),
                           _("Change the value of an attribute of an element ( which must be a Tag element )."),
                           _("Do _PARAM3__PARAM2_ to the attribute _PARAM1_ of element _PARAM0_"),
                           _("Advanced XML: Tag"),
                           "res/AdvancedXML/AdvancedXML.png",
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Reference to the element"), "", false);
                instrInfo.AddParameter("string", _("Name of the attribute"), "", false);
                instrInfo.AddParameter("expression", _("Value"), "", false);
                instrInfo.AddParameter("operator", _("Modification sign"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::SetAttributeNumber").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h").SetAssociatedGetter("AdvancedXML::GetAttributeNumber").SetManipulatedType("number");

            DECLARE_END_ACTION()

            DECLARE_STR_EXPRESSION("GetAttributeString",
                           _("Text of an attribute of an element"),
                           _("Get the text of an attribute of an element"),
                           _("Advanced XML: Tag"),
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Element reference"), "", false);
                instrInfo.AddParameter("string", _("Name of the attribute"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::GetAttributeString").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_STR_EXPRESSION()

            DECLARE_ACTION("SetAttributeString",
                           _("Change the text of an attribute"),
                           _("Change the text of an attribute of an element ( which must be a Tag element )."),
                           _("Do _PARAM3__PARAM2_ to the attribute _PARAM1_ of element _PARAM0_"),
                           _("Advanced XML: Tag"),
                           "res/AdvancedXML/AdvancedXML.png",
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Reference to the element"), "", false);
                instrInfo.AddParameter("string", _("Name of the attribute"), "", false);
                instrInfo.AddParameter("string", _("Value"), "", false);
                instrInfo.AddParameter("operator", _("Modification sign"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::SetAttributeString").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h").SetAssociatedGetter("AdvancedXML::GetAttributeString").SetManipulatedType("string");

            DECLARE_END_ACTION()

            DECLARE_ACTION("RemoveAttribute",
                           _("Delete an attribute"),
                           _("Delete an attribute from an element ( which must be a Tag element)."),
                           _("Delete attribute _PARAM1_ from the element _PARAM0_"),
                           _("Advanced XML: Tag"),
                           "res/AdvancedXML/AdvancedXML.png",
                           "res/AdvancedXML/AdvancedXML16.png");

                instrInfo.AddParameter("string", _("Reference to the element"), "", false);
                instrInfo.AddParameter("string", _("Name of the attribute"), "", false);
                instrInfo.AddCodeOnlyParameter("currentScene", "");

                instrInfo.cppCallingInformation.SetFunctionName("AdvancedXML::RemoveAttribute").SetIncludeFile("AdvancedXML/AdvancedXMLTools.h");

            DECLARE_END_ACTION()

            #endif

            CompleteCompilationInformation();
        };
        virtual ~Extension()
        {
            AdvancedXML::RefManager::Destroy();
        };

    protected:
    private:

        /**
         * This function is called by Game Develop so
         * as to complete information about how the extension was compiled ( which libs... )
         * -- Do not need to be modified. --
         */
        void CompleteCompilationInformation()
        {
            #if defined(GD_IDE_ONLY)
            compilationInfo.runtimeOnly = false;
            #else
            compilationInfo.runtimeOnly = true;
            #endif

            #if defined(__GNUC__)
            compilationInfo.gccMajorVersion = __GNUC__;
            compilationInfo.gccMinorVersion = __GNUC_MINOR__;
            compilationInfo.gccPatchLevel = __GNUC_PATCHLEVEL__;
            #endif

            compilationInfo.boostVersion = BOOST_VERSION;

            compilationInfo.sfmlMajorVersion = 2;
            compilationInfo.sfmlMinorVersion = 0;

            #if defined(GD_IDE_ONLY)
            compilationInfo.wxWidgetsMajorVersion = wxMAJOR_VERSION;
            compilationInfo.wxWidgetsMinorVersion = wxMINOR_VERSION;
            compilationInfo.wxWidgetsReleaseNumber = wxRELEASE_NUMBER;
            compilationInfo.wxWidgetsSubReleaseNumber = wxSUBRELEASE_NUMBER;
            #endif

            compilationInfo.gdlVersion = RC_FILEVERSION_STRING;
            compilationInfo.sizeOfpInt = sizeof(int*);

            compilationInfo.informationCompleted = true;
        }
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

