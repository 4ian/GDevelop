#if defined(GDE)
#include "GDL/MainEditorCommand.h"
#include "GDL/needReload.h"
#include <wx/ribbon/page.h>
#include <iostream>

MainEditorCommand::MainEditorCommand(needReload & nr_, int sceneID_) :
nr(nr_),
sceneID(sceneID_),
ribbon(NULL),
ribbonSceneEditorButtonBar(NULL),
mainEditor(NULL)
{
    //ctor
}

MainEditorCommand::~MainEditorCommand()
{
    //dtor
}
#endif
