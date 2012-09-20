#ifndef SIGNEMODIFICATION_H
#define SIGNEMODIFICATION_H

//(*Headers(SigneModification)
#include <wx/sizer.h>
#include <wx/radiobox.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class SigneModification: public wxDialog
{
	public:

		SigneModification(wxWindow* parent);
		virtual ~SigneModification();

		//(*Declarations(SigneModification)
		wxButton* OkBt;
		wxRadioBox* SigneRadio;
		//*)

	protected:

		//(*Identifiers(SigneModification)
		static const long ID_RADIOBOX1;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(SigneModification)
		void OnOkBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif

