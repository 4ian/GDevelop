/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "BuildProgressPnl.h"

//(*InternalHeaders(BuildProgressPnl)
#include <wx/font.h>
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
const long BuildProgressPnl::ID_TEXTCTRL1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(BuildProgressPnl,wxPanel)
	//(*EventTable(BuildProgressPnl)
	//*)
	EVT_COMMAND(wxID_ANY, CodeCompiler::refreshEventType, BuildProgressPnl::OnMustRefresh)
END_EVENT_TABLE()

BuildProgressPnl::BuildProgressPnl(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size) :
clearOnNextTextAdding(false)
{
	//(*Initialize(BuildProgressPnl)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, id, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("id"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(2);
	statusTxt = new wxStaticText(this, ID_STATICTEXT1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	wxFont statusTxtFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	statusTxt->SetFont(statusTxtFont);
	FlexGridSizer1->Add(statusTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	progressGauge = new wxGauge(this, ID_GAUGE1, 100, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_GAUGE1"));
	FlexGridSizer1->Add(progressGauge, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	tasksLogEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(229,40), wxTE_MULTILINE|wxTE_READONLY, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer1->Add(tasksLogEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&BuildProgressPnl::OntasksLogEditText);
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
            if (!CodeCompiler::GetInstance()->LastTaskFailed())
            {
                statusTxt->SetLabel(_("Tâche en progression : ")+currentTasks[0].userFriendlyName);
                AppendText(_("Tâche en progression : ")+currentTasks[0].userFriendlyName+("...")+"\n");
            }
            else
            {
                statusTxt->SetLabel(_("La tâche ")+currentTasks[0].userFriendlyName+_("a échouée."));
                AppendText(_("La tâche ")+currentTasks[0].userFriendlyName+_("a échouée.")+"\n");
            }
        }
    }
    else
    {
        if (CodeCompiler::GetInstance()->LastTaskFailed())
        {
            statusTxt->SetLabel(_("Compilation terminée, mais une ou plusieurs tâches ont échouées."));
            AppendText(_("Compilation terminée, mais une ou plusieurs tâches ont échouées.")+"\n\n");
        }
        else
        {
            if (!currentTasks.empty())
            {
                statusTxt->SetLabel(_("Compilation terminée, mais ")+ToString(currentTasks.size())+_(" tâche(s) sont encore en attente de pouvoir être lancées."));
                AppendText(_("Les tâches ont été accomplies, mais ")+ToString(currentTasks.size())+_(" tâche(s) sont encore en attente de pouvoir être lancées.")+"\n");

            }
            else
            {
                statusTxt->SetLabel(_("Compilation terminée."));
                AppendText(_("Toutes les tâches ont été accomplies.")+"\n\n");
            }
        }
        clearOnNextTextAdding = true;
    }

    if (!currentTasks.empty())
        progressGauge->SetValue(100.f/static_cast<float>(currentTasks.size()));
}

void BuildProgressPnl::AppendText(wxString text)
{
    if (text != lastTextAdded)
    {
        if (clearOnNextTextAdding)
        {
            tasksLogEdit->Clear();
            clearOnNextTextAdding = false;
        }

        tasksLogEdit->AppendText(text);
        lastTextAdded = text;
    }
}

void BuildProgressPnl::OntasksLogEditText(wxCommandEvent& event)
{
}
