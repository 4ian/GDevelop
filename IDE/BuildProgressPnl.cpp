/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
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
#include "GDL/SourceFileBuilder.h"

//(*IdInit(BuildProgressPnl)
const long BuildProgressPnl::ID_BUTTON1 = wxNewId();
const long BuildProgressPnl::ID_STATICTEXT1 = wxNewId();
const long BuildProgressPnl::ID_GAUGE1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(BuildProgressPnl,wxPanel)
	//(*EventTable(BuildProgressPnl)
	//*)
END_EVENT_TABLE()

BuildProgressPnl::BuildProgressPnl(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(BuildProgressPnl)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, id, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("id"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	FlexGridSizer2->AddGrowableRow(0);
	stopCompilerBt = new wxButton(this, ID_BUTTON1, _("Arrêter la compilation des sources"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(stopCompilerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	statusTxt = new wxStaticText(this, ID_STATICTEXT1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer1->Add(statusTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	progressGauge = new wxGauge(this, ID_GAUGE1, 100, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_GAUGE1"));
	FlexGridSizer1->Add(progressGauge, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&BuildProgressPnl::OnstopCompilerBtClick);
	//*)

	sourceFileBuilder.SetProgressControls(progressGauge, statusTxt);
}

BuildProgressPnl::~BuildProgressPnl()
{
	//(*Destroy(BuildProgressPnl)
	//*)
}

bool BuildProgressPnl::LaunchGameSourceFilesBuild(Game & game)
{
    if ( !ChangeGameWithoutBuilding(game) ) return false;

    return sourceFileBuilder.LaunchSourceFilesBuild();
}

bool BuildProgressPnl::ChangeGameWithoutBuilding(Game & game)
{
    if ( sourceFileBuilder.IsBuilding() ) return false;
    sourceFileBuilder.SetFiles(game.externalSourceFiles);
    sourceFileBuilder.SetExtensionsUsed(game.extensionsUsed);

    return true;
}

bool BuildProgressPnl::BuildNeeded()
{
    return sourceFileBuilder.BuildNeeded();
}

bool BuildProgressPnl::IsBuilding()
{
    return sourceFileBuilder.IsBuilding();
}

bool BuildProgressPnl::LastBuildSuccessed()
{
    return sourceFileBuilder.LastBuildSuccessed();
}

bool BuildProgressPnl::AbortBuild()
{
    sourceFileBuilder.AbordBuild();
    return true;
}

void BuildProgressPnl::OnstopCompilerBtClick(wxCommandEvent& event)
{
    AbortBuild();
}
