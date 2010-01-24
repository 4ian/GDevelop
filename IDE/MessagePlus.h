#ifndef MESSAGEPLUS_H
#define MESSAGEPLUS_H

//(*Headers(MessagePlus)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <string>
#include <vector>

using namespace std;

class MessagePlus: public wxDialog
{
	public:

		MessagePlus(wxWindow* parent, wxString message, int type = 0, string pcheminOption = "");
		virtual ~MessagePlus();
		int Check();

		//(*Declarations(MessagePlus)
		wxButton* Button1;
		wxStaticBitmap* StaticBitmap1;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxButton* Button2;
		wxCheckBox* CheckBox1;
		wxStaticLine* StaticLine1;
		//*)

		string cheminOptions;

	protected:

		//(*Identifiers(MessagePlus)
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_CHECKBOX1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(MessagePlus)
		void OnButton1Click(wxCommandEvent& event);
		void OnButton2Click(wxCommandEvent& event);
		//*)


		DECLARE_EVENT_TABLE()
};

#endif
