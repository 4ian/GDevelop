/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef PROFILEDLG_H
#define PROFILEDLG_H

//(*Headers(ProfileDlg)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/panel.h>
//*)
#include <vector>
#include "GDL/Event.h"
#include "GDL/BaseProfiler.h"
class SceneCanvas;

class ProfileDlg: public wxPanel, public BaseProfiler
{
	public:

		ProfileDlg(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~ProfileDlg();

		void ParseProfileEvents();
		void SetAssociatedSceneCanvas(SceneCanvas * sceneCanvas_) { sceneCanvas = sceneCanvas_; Refresh(); };
		SceneCanvas * GetAssociatedSceneCanvas() { return sceneCanvas; };


		//(*Declarations(ProfileDlg)
		wxStaticText* eventsTimeTxt;
		wxStaticText* ratioTxt;
		wxStaticText* renderingTimeTxt;
		//*)
	protected:

		//(*Identifiers(ProfileDlg)
		static const long ID_STATICTEXT1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICTEXT3;
		//*)

	private:

		//(*Handlers(ProfileDlg)
		//*)

		DECLARE_EVENT_TABLE()

		void ParseProfileEvents(const std::vector < BaseEventSPtr > & events);
		void UpdateGUI();

		SceneCanvas * sceneCanvas;
};

#endif
