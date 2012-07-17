/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)

#ifndef EDITTEXTE_H
#define EDITTEXTE_H

//(*Headers(EditTextDialog)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/aui/aui.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/button.h>
#include <wx/dialog.h>
#include <wx/stc/stc.h>
//*)
#include <string>
#include <vector>
class Game;
class Scene;
namespace gd { class ParameterMetadata; }

using namespace std;

class GD_API EditTextDialog: public wxDialog
{
	public:

		EditTextDialog(wxWindow* parent, string texte, Game & game_, Scene & scene_);
		virtual ~EditTextDialog();

		//(*Declarations(EditTextDialog)
		wxPanel* objectsFunctionsPanel;
		wxButton* OkBt;
		wxButton* helpBt;
		wxAuiManager* mgr;
		wxButton* AddFunctionBt;
		wxPanel* centerPanel;
		wxTreeCtrl* ValList;
		wxHyperlinkCtrl* errorTxt;
		wxStyledTextCtrl* TexteEdit;
		wxPanel* freeFunctionsPanel;
		wxTreeCtrl* ObjList;
		wxButton* AddPropBt;
		//*)
		string returnedText;

	protected:

		//(*Identifiers(EditTextDialog)
		static const long ID_CUSTOM1;
		static const long ID_BUTTON2;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_BUTTON4;
		static const long ID_PANEL1;
		static const long ID_TREECTRL1;
		static const long ID_BUTTON10;
		static const long ID_PANEL2;
		static const long ID_TREECTRL2;
		static const long ID_BUTTON7;
		static const long ID_PANEL3;
		//*)

	private:

		//(*Handlers(EditTextDialog)
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnOkBtClick(wxCommandEvent& event);
		void OnInsertBtClick(wxCommandEvent& event);
		void OnExpressionTxtEditClick(wxCommandEvent& event);
		void OnVarGlobalTxtEditClick(wxCommandEvent& event);
		void OnVarSceneTxtEditClick(wxCommandEvent& event);
		void OnTexteEditText(wxCommandEvent& event);
		void OnAddPropBtClick(wxCommandEvent& event);
		void OnAddFunctionBtClick(wxCommandEvent& event);
		void OnTreeCtrl1ItemActivated(wxTreeEvent& event);
		void OnObjListItemActivated(wxTreeEvent& event);
		void OnObjListSelectionChanged(wxTreeEvent& event);
		void OnTreeCtrl1SelectionChanged(wxTreeEvent& event);
		void OnerrorTxtClick(wxCommandEvent& event);
		void OnhelpBtClick(wxCommandEvent& event);
		//*)
		void TextModified(wxStyledTextEvent& event);
		void UpdateTextCtrl(wxStyledTextEvent& event);

		string ShowParameterDialog(const gd::ParameterMetadata & ParameterMetadata, bool & userCancelled, std::string object = "");

		//Items selected
		wxTreeItemId itemObj;
		wxTreeItemId itemVal;

		wxImageList * imageListObj;
		wxImageList * imageListVal;

        //Utile pour selectionner un objet
        //( quand on souhaite accéder aux propriétés d'un objet )
		Game & game;
		Scene & scene;

		size_t lastErrorPos;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
