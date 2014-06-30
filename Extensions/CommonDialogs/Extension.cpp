/**

Game Develop - Common Dialogs Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

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
        SetExtensionInformation("CommonDialogs",
                              _("Common dialogs"),
                              _("Extension allowing to display common dialogs ( Message box, open file dialog... )"),
                              "Florian Rival",
                              "zlib/libpng License (Open Source)");
        #if defined(GD_IDE_ONLY)

        AddAction("ShowMsgBox",
                       _("Show a message box"),
                       _("Display a message box with specified text, and a Ok button."),
                       _("Display message \"_PARAM1_\" with title \"_PARAM2_\""),
                       _("Interfaces"),
                       "res/actions/msgbox24.png",
                       "res/actions/msgbox.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Message"))
            .AddParameter("string", _("Title"))

            .codeExtraInformation.SetFunctionName("GDpriv::CommonDialogs::ShowMessageBox").SetIncludeFile("CommonDialogs/CommonDialogs.h");

        AddAction("ShowOpenFile",
                       _("Show a window to choose a file"),
                       _("Display a window allowing to choose a file.\nThe name and the directory of the file will be saved in the specified variable."),
                       _("Open a window so as to choose a file, and save the result in _PARAM1_"),
                       _("Interfaces"),
                       "res/actions/openfile24.png",
                       "res/actions/openfile.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("scenevar", _("Save result to scene variable"))
            .AddParameter("string", _("Title"))
            .AddParameter("string", _("Wildcard filter ( \"FileType|*.ext;*.ext2|2ndFileType|*.ext3\" ) ( Windows only ) "))

            .codeExtraInformation.SetFunctionName("GDpriv::CommonDialogs::ShowOpenFile").SetIncludeFile("CommonDialogs/CommonDialogs.h");

        AddAction("ShowTextInput",
                       _("Show a window to enter a text"),
                       _("Show a window allowing to enter a text.\nThe text will be saved in the specified scene variable."),
                       _("Open a text input dialog, and save the result in _PARAM1_"),
                       _("Interfaces"),
                       "res/actions/textenter24.png",
                       "res/actions/textenter.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("scenevar", _("Save result to scene variable"))
            .AddParameter("string", _("Message"))
            .AddParameter("string", _("Title"))

            .codeExtraInformation.SetFunctionName("GDpriv::CommonDialogs::ShowTextInput").SetIncludeFile("CommonDialogs/CommonDialogs.h");

        AddAction("ShowYesNoMsgBox",
                       _("Display a Yes/No message box"),
                       _("Open a message box allowing to choose Yes or No.\nThe answer ( \"yes\"/\"no\" ) will be saved in the specified variable."),
                       _("Open a Yes/No message box, and save the result in _PARAM1_"),
                       _("Interfaces"),
                       "res/actions/msgbox24.png",
                       "res/actions/msgbox.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("scenevar", _("Save result to scene variable"))
            .AddParameter("string", _("Message"))
            .AddParameter("string", _("Title"))

            .codeExtraInformation.SetFunctionName("GDpriv::CommonDialogs::ShowYesNoMsgBox").SetIncludeFile("CommonDialogs/CommonDialogs.h");

        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
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

