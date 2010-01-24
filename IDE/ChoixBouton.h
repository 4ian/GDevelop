#ifndef CHOIXBOUTON_H
#define CHOIXBOUTON_H

//(*Headers(ChoixBouton)
#include <wx/sizer.h>
#include <wx/radiobox.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

#include <string>
#include <vector>

using namespace std;

class ChoixBouton: public wxDialog
{
	public:

		ChoixBouton(wxWindow* parent, string pBouton);
		virtual ~ChoixBouton();

		//(*Declarations(ChoixBouton)
		wxButton* OkBt;
		wxButton* CancelBt;
		wxRadioBox* RadioBox1;
		wxPanel* TestPanel;
		//*)

		string bouton;

	protected:

		//(*Identifiers(ChoixBouton)
		static const long ID_RADIOBOX1;
		static const long ID_PANEL1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(ChoixBouton)
		void OnRadioBox1Select(wxCommandEvent& event);
		void OnOkBtClick(wxCommandEvent& event);
		void OnCancelBtClick(wxCommandEvent& event);
		void OnTestPanelLeftUp(wxMouseEvent& event);
		void OnTestPanelMiddleUp(wxMouseEvent& event);
		void OnTestPanelRightDown(wxMouseEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
