/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCORE_EXTNERALEDITOR_H
#define GDCORE_EXTNERALEDITOR_H
#include <wx/utils.h>
#include <wx/process.h>
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/Dialogs/ExternalEditor/ExternalEditorBridge.h"

namespace gd {

class GD_CORE_API ExternalEditor {
public:
	ExternalEditor() :
		externalEditorPid(0)
	{
		editorBridge.OnReceive([this](gd::String cmd, gd::SerializerElement object) {
			if (cmd == "update")
			{
				if (onUpdateReceivedCb) onUpdateReceivedCb(object);
			}
			else if (cmd == "requestUpdate")
				SendUpdate();
			else
				std::cout << "Received message with unknown command: \"" << cmd << "\"" << std::endl;
		});
	}

	~ExternalEditor()
	{
		if (externalEditorPid != 0)
			wxProcess::Kill(externalEditorPid);
	}

	void OnUpdateReceived(std::function<void(SerializerElement object)> cb)
	{
		onUpdateReceivedCb = cb;
	}

	void OnSendUpdate(std::function<SerializerElement()> cb)
	{
		onSendUpdate = cb;
	}

	bool Launch(const gd::String & editorName, const gd::String editedElementName);

	void Hide()
	{
		gd::SerializerElement emptyPayload;
		editorBridge.Send("hide", emptyPayload);
	}

	void Show()
	{
		gd::SerializerElement emptyPayload;
		editorBridge.Send("show", emptyPayload);
	}

	void SetBounds(int x, int y, int width, int height)
	{
		gd::SerializerElement bounds;
		bounds.SetAttribute("x", x);
		bounds.SetAttribute("y", y);
		bounds.SetAttribute("width", width);
		bounds.SetAttribute("height", height);
		editorBridge.Send("setBounds", bounds);
	}

private:

	bool SendUpdate()
	{
		if (!onSendUpdate) return false;

		return editorBridge.Send("update", onSendUpdate());
	}

	ExternalEditorBridge editorBridge;
	int externalEditorPid;
	std::function<void(SerializerElement object)> onUpdateReceivedCb;
	std::function<SerializerElement()> onSendUpdate;
};

}
#endif
#endif
