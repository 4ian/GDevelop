#if defined(GDE)
#ifndef EDITFOREACHEVENT_H
#define EDITFOREACHEVENT_H

//(*Headers(EditForEachEvent)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/ForEachEvent.h"

class EditForEachEvent: public wxDialog
{
	public:

		EditForEachEvent(wxWindow* parent, ForEachEvent & event_);
		virtual ~EditForEachEvent();

		//(*Declarations(EditForEachEvent)
		wxStaticText* StaticText1;
		wxButton* cancelBt;
		wxStaticLine* StaticLine1;
		wxTextCtrl* objectEdit;
		wxButton* okBt;
		//*)

		ForEachEvent & eventEdited;

	protected:

		//(*Identifiers(EditForEachEvent)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(EditForEachEvent)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
#endif
