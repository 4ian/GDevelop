#if defined(GDE)
#include "GDL/MainEditorCommand.h"
#include <wx/ribbon/page.h>
#include <iostream>

MainEditorCommand::MainEditorCommand() :
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
