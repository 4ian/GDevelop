/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "BuildProgressPnl.h"

//(*InternalHeaders(BuildProgressPnl)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/process.h>
#include <wx/txtstrm.h>
#include "GDL/Game.h"
#include "SceneCanvas.h"
#include "GDL/IDE/CodeCompiler.h"

//(*IdInit(BuildProgressPnl)
const long BuildProgressPnl::ID_STATICTEXT1 = wxNewId();
const long BuildProgressPnl::ID_GAUGE1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(BuildProgressPnl,wxPanel)
	//(*EventTable(BuildProgressPnl)
	//*)
	EVT_COMMAND(wxID_ANY, CodeCompiler::refreshEventType, BuildProgressPnl::OnMustRefresh)
END_EVENT_TABLE()

BuildProgressPnl::BuildProgressPnl(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(BuildProgressPnl)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, id, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("id"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	statusTxt = new wxStaticText(this, ID_STATICTEXT1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer1->Add(statusTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	progressGauge = new wxGauge(this, ID_GAUGE1, 100, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_GAUGE1"));
	FlexGridSizer1->Add(progressGauge, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	//*)
}

BuildProgressPnl::~BuildProgressPnl()
{
	//(*Destroy(BuildProgressPnl)
	//*)
}

void BuildProgressPnl::OnMustRefresh(wxCommandEvent&)
{
    std::vector < CodeCompilerTask > currentTasks = CodeCompiler::GetInstance()->GetCurrentTasks();

    if (CodeCompiler::GetInstance()->CompilationInProcess())
    {
        if (!currentTasks.empty())
        {
            statusTxt->SetLabel(_("Tâche en progression : ")+currentTasks[0].userFriendlyName);
        }
    }
    else
    {
        if (!currentTasks.empty())
            statusTxt->SetLabel(_("Compilation terminée, mais ")+ToString(currentTasks.size())+_(" tâche(s) sont encore en attente de pouvoir être lancées."));
        else
            statusTxt->SetLabel(_("Compilation terminée."));
    }
}
