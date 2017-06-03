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
		externalEditorPid(0),
		launchX(0),
		launchY(0),
		launchWidth(0),
		launchHeight(0),
		dirty(true),
		hasReceivedFirstMessage(false)
	{
		editorBridge.OnReceive([this](gd::String cmd, gd::SerializerElement object, gd::String scope) {
			if (!hasReceivedFirstMessage)
			{
				hasReceivedFirstMessage = true;
				if (onLaunchedCb) onLaunchedCb();
			}

			if (cmd == "update")
			{
				if (onUpdateReceivedCb) onUpdateReceivedCb(object, scope);
			}
			else if (cmd == "requestUpdate")
				SendUpdate(scope);
			else if (cmd == "requestForcedUpdate")
				SendUpdate(scope, true);
			else if (cmd == "requestPreview") {
				if (onLaunchPreviewCb) onLaunchPreviewCb();
			} else if (cmd == "editObject") {
				if (onEditObjectCb) onEditObjectCb(object.GetValue().GetString());
			} else
				std::cout << "Received message with unknown command: \"" << cmd << "\"" << std::endl;
		});
	}

	~ExternalEditor()
	{
		if (externalEditorPid != 0 && externalEditorPid != 1) {
			wxProcess::Kill(externalEditorPid);
		}
	}

	void OnUpdateReceived(std::function<void(SerializerElement object, gd::String scope)> cb)
	{
		onUpdateReceivedCb = cb;
	}

	void OnSendUpdate(std::function<SerializerElement(gd::String scope)> cb)
	{
		onSendUpdateCb = cb;
	}

	void OnLaunchPreview(std::function<void()> cb)
	{
		onLaunchPreviewCb = cb;
	}

	void OnEditObject(std::function<void(const gd::String & objectName)> cb)
	{
		onEditObjectCb = cb;
	}

	void OnLaunched(std::function<void()> cb)
	{
		onLaunchedCb = cb;
	}

	bool Launch(const gd::String & editorName, const gd::String editedElementName);

	void Hide(bool forceHide = false)
	{
		gd::SerializerElement payload;
		payload.AddChild("forceHide").SetValue(forceHide);
		editorBridge.Send("hide", payload);
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

	void SetLaunchBounds(int x, int y, int width, int height)
	{
		launchX = x;
		launchY = y;
		launchWidth = width;
		launchHeight = height;
	}

    bool IsLaunchedAndConnected() {
        return editorBridge.IsConnected();
    }

	void SetDirty() { dirty = true; }

private:

	bool SendUpdate(gd::String scope = "", bool forcedUpdate = false)
	{
		if (!onSendUpdateCb) return false;
		if (!dirty && !forcedUpdate) return true;
		dirty = false;

		return editorBridge.Send("update", onSendUpdateCb(scope), scope);
	}

	ExternalEditorBridge editorBridge;
	int externalEditorPid;
	std::function<void(SerializerElement object, gd::String scope)> onUpdateReceivedCb;
	std::function<SerializerElement(gd::String scope)> onSendUpdateCb;
	std::function<void()> onLaunchPreviewCb;
	std::function<void(const gd::String & objectName)> onEditObjectCb;
	std::function<void()> onLaunchedCb;


	int launchX;
	int launchY;
	int launchWidth;
	int launchHeight;
	bool dirty;
	bool hasReceivedFirstMessage;
};

}
#endif
#endif
