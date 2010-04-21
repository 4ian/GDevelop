#ifndef CHOICEJOYAXIS_H
#define CHOICEJOYAXIS_H

//(*Headers(ChoiceJoyAxis)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/radiobox.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <string>
#include <vector>
class Game;
class Scene;

using namespace std;

class ChoiceJoyAxis: public wxDialog
{
	public:

		ChoiceJoyAxis(wxWindow* parent, string joyaxis_, Game & game_, Scene & scene_, bool canSelectedGroup, const vector < string > & mainObjectsName_);
		virtual ~ChoiceJoyAxis();

		//(*Declarations(ChoiceJoyAxis)
		wxRadioBox* axisRadio;
		wxButton* advancedBt;
		wxStaticText* StaticText1;
		wxStaticLine* StaticLine1;
		wxButton* okBt;
		wxButton* annulerBt;
		//*)

		string joyaxis;

	protected:

		//(*Identifiers(ChoiceJoyAxis)
		static const long ID_STATICTEXT1;
		static const long ID_RADIOBOX1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON3;
		static const long ID_BUTTON2;
		static const long ID_BUTTON4;
		//*)

	private:

		Game & game;
		Scene & scene;
		bool canSelectGroup;
        const vector < string > & mainObjectsName;

		//(*Handlers(ChoiceJoyAxis)
		void OnadvancedBtClick(wxCommandEvent& event);
		void OnaxisRadioSelect(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OnannulerBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
