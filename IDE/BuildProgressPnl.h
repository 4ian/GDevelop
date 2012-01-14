/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef BUILDPROGRESSPNL_H
#define BUILDPROGRESSPNL_H

//(*Headers(BuildProgressPnl)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/gauge.h>
//*)
#include <wx/thread.h>
#include "GDL/IDE/SourceFileBuilder.h"
class Game;
class SceneCanvas;

class BuildProgressPnl: public wxPanel
{
	public:

		BuildProgressPnl(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~BuildProgressPnl();

		bool LaunchGameSourceFilesBuild(Game & game);
		bool ChangeGameWithoutBuilding(Game & game);
		bool IsBuilding();
		bool BuildNeeded();
		bool AbortBuild();
		bool LastBuildSuccessed();

		GDpriv::SourceFileBuilder sourceFileBuilder;

		//(*Declarations(BuildProgressPnl)
		wxButton* stopCompilerBt;
		wxStaticText* statusTxt;
		wxGauge* progressGauge;
		//*)

    protected:

		//(*Identifiers(BuildProgressPnl)
		static const long ID_BUTTON1;
		static const long ID_STATICTEXT1;
		static const long ID_GAUGE1;
		//*)

	private:

		//(*Handlers(BuildProgressPnl)
		void OnstopCompilerBtClick(wxCommandEvent& event);
		//*)

		void BuildSourceFiles();

		DECLARE_EVENT_TABLE()
};

#endif
