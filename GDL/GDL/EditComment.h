#if defined(GDE)
#ifndef EDITCOMMENTAIRE_H
#define EDITCOMMENTAIRE_H

//(*Headers(EditComment)
#include <wx/sizer.h>
#include <wx/textctrl.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/CommentEvent.h"

class EditComment: public wxDialog
{
	public:

		EditComment(wxWindow* parent, CommentEvent & event_);
		virtual ~EditComment();

		//(*Declarations(EditComment)
		wxButton* OkBt;
		wxButton* ColorBt;
		wxTextCtrl* Com1Edit;
		wxTextCtrl* Com2Edit;
		wxButton* AnnulerBt;
		wxButton* txtColorBt;
		wxButton* AideBt;
		//*)

		CommentEvent & commentEvent;

	protected:

		//(*Identifiers(EditComment)
		static const long ID_BUTTON1;
		static const long ID_BUTTON5;
		static const long ID_TEXTCTRL1;
		static const long ID_TEXTCTRL2;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		static const long ID_BUTTON4;
		//*)

	private:

		//(*Handlers(EditComment)
		void OnColorBtClick(wxCommandEvent& event);
		void OnOkBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OntxtColorBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
#endif
