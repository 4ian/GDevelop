/**

Game Develop - Common Dialogs Extension
Copyright (c) 2008-2013 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
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
            DECLARE_THE_EXTENSION("CommonDialogs",
                                  _("Common dialogs"),
                                  _("Extension allowing to display common dialogs ( Message box, open file dialog... )"),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")
            #if defined(GD_IDE_ONLY)

            DECLARE_ACTION("ShowMsgBox",
                           _("Show a message box"),
                           _("Display a message box with specified text, and a Ok button."),
                           _("Display message \"_PARAM1_\" with title \"_PARAM2_\""),
                           _("Interfaces"),
                           "res/actions/msgbox24.png",
                           "res/actions/msgbox.png");

                instrInfo.AddCodeOnlyParameter("currentScene", "");
                instrInfo.AddParameter("string", _("Message"), "", false);
                instrInfo.AddParameter("string", _("Title"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::CommonDialogs::ShowMessageBox").SetIncludeFile("Common Dialogs/CommonDialogs.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("ShowOpenFile",
                           _("Show a window to choose a file"),
                           _("Display a window allowing to choose a file.\nThe name and the directory of the file will be saved in the specified variable."),
                           _("Open a window so as to choose a file, and save the result in _PARAM1_"),
                           _("Interfaces"),
                           "res/actions/openfile24.png",
                           "res/actions/openfile.png");

                instrInfo.AddCodeOnlyParameter("currentScene", "");
                instrInfo.AddParameter("scenevar", _("Save result to scene variable"), "", false);
                instrInfo.AddParameter("string", _("Title"), "", false);
                instrInfo.AddParameter("string", _("Wildcard filter ( \"FileType|*.ext;*.ext2|2ndFileType|*.ext3\" ) ( Windows only ) "), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::CommonDialogs::ShowOpenFile").SetIncludeFile("Common Dialogs/CommonDialogs.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("ShowTextInput",
                           _("Show a window to enter a text"),
                           _("Show a window allowing to enter a text.\nThe text will be saved in the specified scene variable."),
                           _("Open a text input dialog, and save the result in _PARAM1_"),
                           _("Interfaces"),
                           "res/actions/textenter24.png",
                           "res/actions/textenter.png");

                instrInfo.AddCodeOnlyParameter("currentScene", "");
                instrInfo.AddParameter("scenevar", _("Save result to scene variable"), "", false);
                instrInfo.AddParameter("string", _("Message"), "", false);
                instrInfo.AddParameter("string", _("Title"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::CommonDialogs::ShowTextInput").SetIncludeFile("Common Dialogs/CommonDialogs.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("ShowYesNoMsgBox",
                           _("Display a Yes/No message box"),
                           _("Open a message box allowing to choose Yes or No.\nThe answer ( \"yes\"/\"no\" ) will be saved in the specified variable."),
                           _("Open a Yes/No message box, and save the result in _PARAM1_"),
                           _("Interfaces"),
                           "res/actions/msgbox24.png",
                           "res/actions/msgbox.png");

                instrInfo.AddCodeOnlyParameter("currentScene", "");
                instrInfo.AddParameter("scenevar", _("Save result to scene variable"), "", false);
                instrInfo.AddParameter("string", _("Message"), "", false);
                instrInfo.AddParameter("string", _("Title"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::CommonDialogs::ShowYesNoMsgBox").SetIncludeFile("Common Dialogs/CommonDialogs.h");

            DECLARE_END_ACTION()

            #endif

            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

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

