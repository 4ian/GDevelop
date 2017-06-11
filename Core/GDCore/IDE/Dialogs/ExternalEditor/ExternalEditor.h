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

/**
 * \brief Allow to launch an external editor (another program)
 * that communicates with the IDE.
 *
 * Once the external editor is launched, it can send and receive commands
 * (see Hide, Show...) and ask for/send an update of the project.
 *
 * \see gd::ExternalEditorBridge
 */
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

	/**
	 * \brief Set the function called when an update is received from the external editor.
	 *
	 * The function is given the serialized update and the scope of the changes (usually, an empty scope means the whole project).
	 */
	void OnUpdateReceived(std::function<void(SerializerElement object, gd::String scope)> cb)
	{
		onUpdateReceivedCb = cb;
	}

	/**
	 * \brief Set the function called when an update should be sent to the editor.
	 *
	 * The function is given the scope of the changes (usually, an empty scope means the whole project).
	 * It should return a SerializerElement which represents the updated object.
	 *
	 * \param cb The function that should return the SerializerElement to send
	 */
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

	/**
	 * Launch the external editor with the given editorName and editedElementName arguments.
	 */
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

	/**
	 * Send an update with the specified scope.
	 * \param scope The scope of the changes to send. Usually, an empty string means the whole project.
	 * \param forcedUpdate If set to true, the update will be sent even if the editor is not marked as dirty.
	 */
	bool SendUpdate(gd::String scope = "", bool forcedUpdate = false)
	{
		if (!onSendUpdateCb) return false;
		if (!dirty && !forcedUpdate) return true;
		dirty = false;

		return editorBridge.Send("update", onSendUpdateCb(scope), scope);
	}

private:

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
