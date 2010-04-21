#ifndef EDITTEXTE_H
#define EDITTEXTE_H

//(*Headers(EditTexte)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <string>
#include <vector>
class Game;
class Scene;

using namespace std;

class EditTexte: public wxDialog
{
	public:

		EditTexte(wxWindow* parent, string texte, Game & game_, Scene & scene_, bool canSelectGroup, const vector < string > & mainObjectsName_);
		virtual ~EditTexte();

		//(*Declarations(EditTexte)
		wxButton* OkBt;
		wxStaticText* StaticText2;
		wxButton* VarGlobalTxtEdit;
		wxStaticText* StaticText1;
		wxTextCtrl* TexteEdit;
		wxStaticLine* StaticLine2;
		wxButton* VarSceneTxtEdit;
		wxStaticLine* StaticLine1;
		wxButton* InsertBt;
		wxButton* AnnulerBt;
		wxButton* VarObjTxtEdit;
		//*)
		string texteFinal;

	protected:

		//(*Identifiers(EditTexte)
		static const long ID_TEXTCTRL1;
		static const long ID_STATICLINE1;
		static const long ID_STATICTEXT2;
		static const long ID_BUTTON3;
		static const long ID_STATICTEXT1;
		static const long ID_BUTTON4;
		static const long ID_BUTTON5;
		static const long ID_BUTTON6;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON2;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(EditTexte)
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnOkBtClick(wxCommandEvent& event);
		void OnInsertBtClick(wxCommandEvent& event);
		void OnExpressionTxtEditClick(wxCommandEvent& event);
		void OnVarGlobalTxtEditClick(wxCommandEvent& event);
		void OnVarSceneTxtEditClick(wxCommandEvent& event);
		//*)

        //Utile pour selectionner un objet
        //( quand on souhaite accéder aux propriétés d'un objet )
		Game & game;
		Scene & scene;
		bool canSelectGroup;
		const vector < string > & mainObjectsName;

		DECLARE_EVENT_TABLE()
};

#endif
