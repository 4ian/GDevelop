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
	}

	~ExternalEditor()
	{
		if (externalEditorPid != 0)
			wxProcess::Kill(externalEditorPid);
	}

	bool Launch();

	bool Send(const SerializerElement & object)
	{
		return editorBridge.Send(object);
	}

	void OnReceive(std::function<void(SerializerElement object)> cb)
	{
		editorBridge.OnReceive(cb);
	}

private:
	ExternalEditorBridge editorBridge;
	int externalEditorPid;
};

}
#endif
#endif
