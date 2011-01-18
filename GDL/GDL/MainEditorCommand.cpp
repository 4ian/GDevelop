#if defined(GD_IDE_ONLY)
#include "GDL/MainEditorCommand.h"
#include <wx/ribbon/page.h>
#include <iostream>

MainEditorCommand::MainEditorCommand() :
ribbon(NULL),
ribbonSceneEditorButtonBar(NULL),
mainEditor(NULL),
buildMessagesPnl(NULL)
{
    //ctor
}

MainEditorCommand::~MainEditorCommand()
{
    //dtor
}
#endif
