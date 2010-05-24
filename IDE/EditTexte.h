#ifndef EDITTEXTE_H
#define EDITTEXTE_H

//(*Headers(EditTexte)
#include <wx/treectrl.h>
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
		wxButton* Button1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxTreeCtrl* ObjList;
		wxTextCtrl* TexteEdit;
		wxStaticLine* StaticLine2;
		wxStaticLine* StaticLine1;
		wxTreeCtrl* TreeCtrl1;
		wxButton* AddPropBt;
		wxButton* InsertBt;
		wxButton* AnnulerBt;
		wxStaticText* StaticText4;
		//*)
		string texteFinal;

	protected:

		//(*Identifiers(EditTexte)
		static const long ID_TEXTCTRL1;
		static const long ID_STATICLINE1;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT2;
		static const long ID_BUTTON3;
		static const long ID_STATICTEXT1;
		static const long ID_TREECTRL1;
		static const long ID_BUTTON10;
		static const long ID_STATICTEXT4;
		static const long ID_TREECTRL2;
		static const long ID_BUTTON7;
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
