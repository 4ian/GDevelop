#include "BuildToolsPnl.h"

//(*InternalHeaders(BuildToolsPnl)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "ProjectManager.h"
#include "BuildProgressPnl.h"
#include "BuildMessagesPnl.h"
#include "GDL/IDE/CodeCompiler.h"

//(*IdInit(BuildToolsPnl)
const long BuildToolsPnl::ID_NOTEBOOK1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(BuildToolsPnl,wxPanel)
	//(*EventTable(BuildToolsPnl)
	//*)
END_EVENT_TABLE()

BuildToolsPnl::BuildToolsPnl(wxWindow* parent, ProjectManager * projectManager)
{
	//(*Initialize(BuildToolsPnl)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	notebook = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
	FlexGridSizer1->Add(notebook, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	//*)

    buildProgressPnl = new BuildProgressPnl(notebook);
    buildMessagesPnl = new BuildMessagesPnl(notebook, projectManager);

    notebook->AddPage(buildProgressPnl, _("Compilation"));
    notebook->AddPage(buildMessagesPnl, _("Compilation messages"));

    CodeCompiler::GetInstance()->AddNotifiedControl(buildProgressPnl);
    CodeCompiler::GetInstance()->AddNotifiedControl(buildMessagesPnl);
}

BuildToolsPnl::~BuildToolsPnl()
{
	//(*Destroy(BuildToolsPnl)
	//*)
}

