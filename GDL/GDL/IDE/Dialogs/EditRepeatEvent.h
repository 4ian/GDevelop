/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)

#ifndef EDITREPEATEVENT_H
#define EDITREPEATEVENT_H

//(*Headers(EditRepeatEvent)
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
class Game;
class Scene;
class RepeatEvent;

/**
 * Editor for Repeat events.
 */
class EditRepeatEvent: public wxDialog
{
	public:

		EditRepeatEvent(wxWindow* parent, RepeatEvent & event_, Game & game_, Scene & scene_);
		virtual ~EditRepeatEvent();

		//(*Declarations(EditRepeatEvent)
		wxBitmapButton* expressionBt;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxStaticLine* StaticLine2;
		wxStaticLine* StaticLine1;
		wxTextCtrl* expressionEdit;
		wxButton* okBt;
		wxStaticBitmap* StaticBitmap3;
		//*)

	protected:

		//(*Identifiers(EditRepeatEvent)
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

		//(*Handlers(EditRepeatEvent)
		void OnexpressionBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		//*)

		RepeatEvent & event;
		Game & game;
		Scene & scene;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
