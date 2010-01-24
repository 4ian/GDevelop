#ifndef CHOIXCLAVIER_H
#define CHOIXCLAVIER_H

//(*Headers(ChoixClavier)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

#include <string>
#include <vector>

using namespace std;

class ChoixClavier: public wxDialog
{
	public:

		ChoixClavier(wxWindow* parent, string pTouche);
		virtual ~ChoixClavier();

		//(*Declarations(ChoixClavier)
		wxStaticText* StaticText2;
		wxButton* Button1;
		wxPanel* AideTxt;
		wxStaticText* StaticText1;
		wxStaticText* toucheTxt;
		//*)

		string touche;

	protected:

		//(*Identifiers(ChoixClavier)
		static const long ID_STATICTEXT3;
		static const long ID_PANEL1;
		static const long ID_STATICTEXT1;
		static const long ID_STATICTEXT2;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(ChoixClavier)
		void OnKeyDown(wxKeyEvent& event);
		void OnButton1Click(wxCommandEvent& event);
		void OnTextCtrl1Text(wxCommandEvent& event);
		void OnPanel1KeyDown(wxKeyEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
