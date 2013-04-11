/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#ifndef EDITFOREACHEVENT_H
#define EDITFOREACHEVENT_H

//(*Headers(EditForEachEvent)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/bmpbuttn.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/ForEachEvent.h"
class Game;
namespace gd { class Layout; }

class EditForEachEvent: public wxDialog
{
	public:

		EditForEachEvent(wxWindow* parent, ForEachEvent & event_, Game & game_, gd::Layout & scene_);
		virtual ~EditForEachEvent();

		//(*Declarations(EditForEachEvent)
		wxStaticBitmap* StaticBitmap1;
		wxStaticText* StaticText1;
		wxButton* cancelBt;
		wxBitmapButton* objectBt;
		wxStaticLine* StaticLine1;
		wxTextCtrl* objectEdit;
		wxHyperlinkCtrl* helpBt;
		wxButton* okBt;
		//*)

		ForEachEvent & eventEdited;

	protected:

		//(*Identifiers(EditForEachEvent)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_BITMAPBUTTON1;
		static const long ID_STATICLINE1;
		static const long ID_STATICBITMAP2;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(EditForEachEvent)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnobjectBtClick(wxCommandEvent& event);
		void OnhelpBtClick(wxCommandEvent& event);
		//*)

		Game & game;
		gd::Layout & scene;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

