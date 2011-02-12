/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */
#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#ifndef EDITDYNAMICEXTENSIONCALLEREVENT_H
#define EDITDYNAMICEXTENSIONCALLEREVENT_H

//(*Headers(EditDynamicExtensionCallerEvent)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
class DynamicExtensionCallerEvent;
class Game;

class EditDynamicExtensionCallerEvent: public wxDialog
{
	public:

		EditDynamicExtensionCallerEvent(wxWindow* parent, Game & game, DynamicExtensionCallerEvent & event_);
		virtual ~EditDynamicExtensionCallerEvent();

		DynamicExtensionCallerEvent & editedEvent;
		Game & game;

		//(*Declarations(EditDynamicExtensionCallerEvent)
		wxButton* OkBt;
		wxButton* helpBt;
		wxTextCtrl* eventName;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxStaticLine* StaticLine2;
		wxStaticText* warnTxt;
		wxStaticLine* StaticLine1;
		wxStaticBitmap* StaticBitmap3;
		//*)

	protected:

		//(*Identifiers(EditDynamicExtensionCallerEvent)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT3;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(EditDynamicExtensionCallerEvent)
		void OnOkBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnhelpBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif

#endif
#endif
