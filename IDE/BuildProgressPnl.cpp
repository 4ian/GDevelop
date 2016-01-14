/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#include "BuildProgressPnl.h"

//(*InternalHeaders(BuildProgressPnl)
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/process.h>
#include <wx/txtstrm.h>
#include "GDCore/CommonTools.h"
#include "GDCpp/IDE/CodeCompiler.h"

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
clearOnNextTextAdding(true)
{
	//(*Initialize(BuildProgressPnl)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, id, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("id"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(2);
	statusTxt = new wxStaticText(this, ID_STATICTEXT1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	wxFont statusTxtFont(wxDEFAULT,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_BOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
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
    std::vector < CodeCompilerTask > currentTasks = CodeCompiler::Get()->GetCurrentTasks();

    if (CodeCompiler::Get()->CompilationInProcess())
    {
        if (!currentTasks.empty())
        {
            if (!CodeCompiler::Get()->LastTaskFailed())
            {
                statusTxt->SetLabel(_("Task in progress:")+currentTasks[0].userFriendlyName);
                AppendText(_("Task in progress:")+currentTasks[0].userFriendlyName+("...")+"\n");
            }
            else
            {
                statusTxt->SetLabel(_("The task ")+currentTasks[0].userFriendlyName+_("failed."));
                AppendText(_("The task ")+currentTasks[0].userFriendlyName+_("failed.")+"\n");
            }
        }
    }
    else
    {
        if (CodeCompiler::Get()->LastTaskFailed())
        {
            statusTxt->SetLabel(_("Some tasks failed."));
            AppendText(_("Some tasks failed.")+"\n");
        }
        else
        {
            wxString timeStr = wxString::Format(_("( %ld seconds )"), compilationTimer.Time()/1000);
            if (!currentTasks.empty())
            {
                statusTxt->SetLabel(_("Compilation finished")+timeStr+_(", but ")+gd::String::From(currentTasks.size())+_(" task(s) are waiting."));
                AppendText(_("Tasks finished ")+timeStr+_(", but ")+gd::String::From(currentTasks.size())+_(" task(s) are waiting.")+"\n");

            }
            else
            {
                statusTxt->SetLabel(_("Compilation finished."));
                AppendText(_("All tasks have been completed.")+" "+timeStr+"\n");
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
            compilationTimer.Start();
            clearOnNextTextAdding = false;
        }

        tasksLogEdit->AppendText(text);
        lastTextAdded = text;
    }
}

void BuildProgressPnl::OntasksLogEditText(wxCommandEvent& event)
{
}
