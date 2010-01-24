#ifndef EDITDOSSIER_H
#define EDITDOSSIER_H

//(*Headers(EditDossier)
#include <wx/sizer.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/Event.h"

class EditDossier: public wxDialog
{
	public:

		EditDossier(wxWindow* parent, Event * pEvent);
		virtual ~EditDossier();

		//(*Declarations(EditDossier)
		wxButton* OkBt;
		wxButton* ColorBt;
		wxTextCtrl* Com1Edit;
		wxTextCtrl* Com2Edit;
		wxStaticLine* StaticLine1;
		wxButton* AnnulerBt;
		wxButton* AideBt;
		//*)

		Event * m_event;

	protected:

		//(*Identifiers(EditDossier)
		static const long ID_BUTTON1;
		static const long ID_TEXTCTRL2;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		static const long ID_BUTTON4;
		//*)

	private:

		//(*Handlers(EditDossier)
		void OnColorBtClick(wxCommandEvent& event);
		void OnOkBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
