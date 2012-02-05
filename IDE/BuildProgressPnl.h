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
#include <wx/gauge.h>
//*)
#include <wx/thread.h>
class Game;
class SceneCanvas;

class BuildProgressPnl: public wxPanel
{
	public:

		BuildProgressPnl(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~BuildProgressPnl();

		//(*Declarations(BuildProgressPnl)
		wxStaticText* statusTxt;
		wxGauge* progressGauge;
		//*)

    protected:

		//(*Identifiers(BuildProgressPnl)
		static const long ID_STATICTEXT1;
		static const long ID_GAUGE1;
		//*)

	private:

		//(*Handlers(BuildProgressPnl)
		//*)

		/**
		 * Called thanks to Event of type CodeCompiler::refreshEventType sent ( typically ) by CodeCompiler.
		 */
		void OnMustRefresh(wxCommandEvent&);

		DECLARE_EVENT_TABLE()
};

#endif
