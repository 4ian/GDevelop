#ifndef EDITCOMMENTAIRE_H
#define EDITCOMMENTAIRE_H

//(*Headers(EditCommentaire)
#include <wx/sizer.h>
#include <wx/textctrl.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/CommentEvent.h"

class EditCommentaire: public wxDialog
{
	public:

		EditCommentaire(wxWindow* parent, CommentEvent & event_);
		virtual ~EditCommentaire();

		//(*Declarations(EditCommentaire)
		wxButton* OkBt;
		wxButton* ColorBt;
		wxTextCtrl* Com1Edit;
		wxTextCtrl* Com2Edit;
		wxButton* AnnulerBt;
		wxButton* AideBt;
		//*)

		CommentEvent & commentEvent;

	protected:

		//(*Identifiers(EditCommentaire)
		static const long ID_BUTTON1;
		static const long ID_TEXTCTRL1;
		static const long ID_TEXTCTRL2;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		static const long ID_BUTTON4;
		//*)

	private:

		//(*Handlers(EditCommentaire)
		void OnColorBtClick(wxCommandEvent& event);
		void OnOkBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
