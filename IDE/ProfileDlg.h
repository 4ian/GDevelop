/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef PROFILEDLG_H
#define PROFILEDLG_H

//(*Headers(ProfileDlg)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/menu.h>
#include <wx/checkbox.h>
#include <wx/panel.h>
//*)
#include <vector>
#include <deque>
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
		wxStaticText* scaleMidTxt;
		wxStaticText* scaleMaxTxt;
		wxMenuItem* MenuItem2;
		wxStaticText* eventsTimeTxt;
		wxMenuItem* objectsCountCheck;
		wxMenu* MenuItem3;
		wxMenuItem* MenuItem1;
		wxCheckBox* activateCheck;
		wxMenuItem* eventsTimeCheck;
		wxPanel* Panel1;
		wxPanel* ratioGraphics;
		wxMenuItem* totalTimeCheck;
		wxPanel* Panel3;
		wxStaticText* objectsCountTxt;
		wxMenu contextMenu;
		wxStaticText* totalTimeTxt;
		wxMenuItem* infiniteDataCheck;
		wxPanel* Panel2;
		//*)
	protected:

		//(*Identifiers(ProfileDlg)
		static const long ID_CHECKBOX1;
		static const long ID_STATICTEXT8;
		static const long ID_STATICTEXT9;
		static const long ID_PANEL1;
		static const long ID_PANEL2;
		static const long ID_STATICTEXT2;
		static const long ID_PANEL3;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL4;
		static const long ID_STATICTEXT3;
		static const long ID_MENUITEM1;
		static const long ID_MENUITEM3;
		static const long ID_MENUITEM2;
		//*)

	private:

		//(*Handlers(ProfileDlg)
		void OnratioGraphicsPaint(wxPaintEvent& event);
		void OnapplyBtClick(wxCommandEvent& event);
		void OnratioGraphicsResize(wxSizeEvent& event);
		void OnratioGraphicsRightUp(wxMouseEvent& event);
		void OnChangeDurationSelected(wxCommandEvent& event);
		void OnStepTimeSelected(wxCommandEvent& event);
		void OnactivateCheckClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()

		void ParseProfileEvents(const std::vector < BaseEventSPtr > & events);
		void UpdateGUI();

        unsigned int maxData;
		std::deque <unsigned long int> eventsData;
		std::deque <unsigned long int> totalTimeData;
		std::deque <unsigned int> objectsCountData;

		SceneCanvas * sceneCanvas;
};

#endif
