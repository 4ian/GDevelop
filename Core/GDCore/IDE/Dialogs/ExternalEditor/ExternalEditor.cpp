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

bool ExternalEditor::Launch(const gd::String & editorName)
{
	unsigned int port = editorBridge.Start();
	if (port == 0)
	{
        LogError(_("Unable to launch the external events editor (unable to start the internal server)."));
        return false;
	}

	// String cmd = "/Users/florian/Projects/F/gdwebapp/deployment/electron-app/node_modules/electron-prebuilt/dist/Electron.app/Contents/MacOS/Electron /Users/florian/Projects/F/gdwebapp/deployment/electron-app/app";
    String cmd = "/Users/florian/Projects/F/GD/newIDE/electron-app/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron /Users/florian/Projects/F/GD/newIDE/electron-app/app";
    //cmd += " --hide-icon";
	if (editorName != "") cmd += " --editor " + editorName;
	externalEditorPid = wxExecute(cmd + " --server-port " + String::From(port), wxEXEC_ASYNC);
    if (externalEditorPid == 0)
    {
        LogError(_("Unable to launch the external events editor."));
        return false;
    }

    SendUpdate();
    return true;
}

}
#endif
