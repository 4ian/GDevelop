/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/utils.h>
#include <wx/process.h>
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/Dialogs/ExternalEditor/ExternalEditorBridge.h"
#include "GDCore/IDE/Dialogs/ExternalEditor/ExternalEditor.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"

namespace gd {

gd::String GetExternalGDevelopIDEExecutable()
{
	#if defined(WINDOWS)
	return "\"./newIDE/GDevelop IDE.exe\" .";
	#elif defined(MACOS)
	return "\"./newIDE/GDevelop IDE.app/Contents/MacOS/GDevelop IDE\" .";
	#elif defined(LINUX)
	return "\"./newIDE/GDevelop IDE\" .";
	#endif

	return "";
}

bool ExternalEditor::Launch(const gd::String & editorName, const gd::String editedElementName)
{
	unsigned int port = editorBridge.Start();
	if (port == 0)
	{
        LogError(_("Unable to launch the external events editor (unable to start the internal server)."));
        return false;
	}

    String cmd = GetExternalGDevelopIDEExecutable();
	// Uncomment and adapt to launch a local development version of the GDevelop IDE:
	cmd = "/Users/florian/Projects/F/GD/newIDE/electron-app/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron /Users/florian/Projects/F/GD/newIDE/electron-app/app";

	cmd += " --mode=integrated";
	if (editorName != "") cmd += " --editor " + editorName;
	if (editedElementName != "") cmd += " --edited-element-name \"" + editedElementName + "\"";
	if (launchWidth != 0 && launchHeight != 0)
	{
		cmd += " --x " + String::From(launchX) + " --y " + String::From(launchY)
			+ " --width " + String::From(launchWidth) + " --height " + String::From(launchHeight);
	}

	std::cout << cmd << std::endl;
	externalEditorPid = wxExecute(cmd + " --server-port " + String::From(port), wxEXEC_ASYNC);
    if (externalEditorPid == 0 || externalEditorPid == -1)
    {
        LogError(_("Unable to launch the external editor."));
        return false;
    }

	// The external editor is launched and can now connect to this editor using the given port
    std::cout << "External editor launched with PID: " << externalEditorPid << std::endl;
    return true;
}

}
#endif
