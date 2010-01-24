#ifndef CHOICEFILE_H
#define CHOICEFILE_H

//(*Headers(ChoiceFile)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include <string>
#include <vector>

using namespace std;

class ChoiceFile: public wxDialog
{
	public:

		ChoiceFile(wxWindow* parent, string file_, Game & game_, Scene & scene_, bool canSelectGroup_, const vector < string > & mainObjectsName_);
		virtual ~ChoiceFile();

		//(*Declarations(ChoiceFile)
		wxStaticText* StaticText2;
		wxButton* advancedBt;
		wxStaticText* StaticText1;
		wxButton* cancelBt;
		wxTextCtrl* fileEdit;
		wxStaticLine* StaticLine1;
		wxButton* okBt;
		//*)

		string file;

	protected:

		//(*Identifiers(ChoiceFile)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON4;
		static const long ID_BUTTON3;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(ChoiceFile)
		void OnadvancedBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnfileEditText(wxCommandEvent& event);
		//*)

        //Données pour éditer une expression textuelle
		Game & game;
		Scene & scene;
		bool canSelectGroup;
		const vector < string > & mainObjectsName;

		DECLARE_EVENT_TABLE()
};

#endif
