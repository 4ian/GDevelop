/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#ifndef EDITFOREACHEVENT_H
#define EDITFOREACHEVENT_H

//(*Headers(EditForEachEvent)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/bmpbuttn.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/ForEachEvent.h"
class Game;
class Scene;

class EditForEachEvent: public wxDialog
{
	public:

		EditForEachEvent(wxWindow* parent, ForEachEvent & event_, Game & game_, Scene & scene_);
		virtual ~EditForEachEvent();

		//(*Declarations(EditForEachEvent)
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxStaticLine* StaticLine2;
		wxBitmapButton* objectBt;
		wxStaticLine* StaticLine1;
		wxTextCtrl* objectEdit;
		wxButton* okBt;
		wxStaticBitmap* StaticBitmap3;
		//*)

		ForEachEvent & eventEdited;

	protected:

		//(*Identifiers(EditForEachEvent)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT3;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_BITMAPBUTTON1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(EditForEachEvent)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnobjectBtClick(wxCommandEvent& event);
		//*)

		Game & game;
		Scene & scene;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

