/**

GDevelop - Common Dialogs Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"



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
        SetExtensionInformation("CommonDialogs",
                              _("Common dialogs"),
                              _("This Extension can display common dialogs ( Message box, open file dialog... )"),
                              "Florian Rival",
                              "Open source (MIT License)");
        #if defined(GD_IDE_ONLY)

        AddAction("ShowMsgBox",
                       _("Show a message box"),
                       _("Display a message box with the specified text and an Ok button."),
                       _("Display message \"_PARAM1_\" with title \"_PARAM2_\""),
                       _("Interfaces"),
                       "res/actions/msgbox24.png",
                       "res/actions/msgbox.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Message"))
            .AddParameter("string", _("Title"))

            .SetFunctionName("GDpriv::CommonDialogs::ShowMessageBox").SetIncludeFile("CommonDialogs/CommonDialogs.h");

        AddAction("ShowOpenFile",
                       _("Show a window to choose a file"),
                       _("Display a window that allows a player to choose a file.\nThe name and the directory of the file will be saved in the specified variable."),
                       _("Open a window for choosing a file, and save the result in _PARAM1_"),
                       _("Interfaces"),
                       "res/actions/openfile24.png",
                       "res/actions/openfile.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("scenevar", _("Save result to scene variable"))
            .AddParameter("string", _("Title"))
            .AddParameter("string", _("Wildcard filter ( \"FileType|*.ext;*.ext2|2ndFileType|*.ext3\" ) ( Windows only ) "))

            .SetFunctionName("GDpriv::CommonDialogs::ShowOpenFile").SetIncludeFile("CommonDialogs/CommonDialogs.h");

        AddAction("ShowTextInput",
                       _("Show a window to enter a text"),
                       _("Show a window that allows a player to enter text.\nThe text will be saved in the specified scene variable."),
                       _("Open a text input dialog, and save the result in _PARAM1_"),
                       _("Interfaces"),
                       "res/actions/textenter24.png",
                       "res/actions/textenter.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("scenevar", _("Save result to scene variable"))
            .AddParameter("string", _("Message"))
            .AddParameter("string", _("Title"))

            .SetFunctionName("GDpriv::CommonDialogs::ShowTextInput").SetIncludeFile("CommonDialogs/CommonDialogs.h");

        AddAction("ShowYesNoMsgBox",
                       _("Display a Yes/No message box"),
                       _("Open a message box that allows a player to choose Yes or No.\nThe answer ( \"yes\"/\"no\" ) will be saved in the specified variable."),
                       _("Open a Yes/No message box, and save the result in _PARAM1_"),
                       _("Interfaces"),
                       "res/actions/msgbox24.png",
                       "res/actions/msgbox.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("scenevar", _("Save result to scene variable"))
            .AddParameter("string", _("Message"))
            .AddParameter("string", _("Title"))

            .SetFunctionName("GDpriv::CommonDialogs::ShowYesNoMsgBox").SetIncludeFile("CommonDialogs/CommonDialogs.h");

        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
