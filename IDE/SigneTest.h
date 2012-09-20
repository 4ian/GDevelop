#ifndef SIGNETEST_H
#define SIGNETEST_H

//(*Headers(SigneTest)
#include <wx/sizer.h>
#include <wx/radiobox.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class SigneTest: public wxDialog
{
	public:

		SigneTest(wxWindow* parent);
		virtual ~SigneTest();

		//(*Declarations(SigneTest)
		wxButton* OkBt;
		wxRadioBox* SigneRadio;
		//*)

	protected:

		//(*Identifiers(SigneTest)
		static const long ID_RADIOBOX1;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(SigneTest)
		void OnOkBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif

