#ifndef EDITORJEU_H
#define EDITORJEU_H

//(*Headers(EditorJeu)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/button.h>
//*)

class EditorJeu: public wxPanel
{
	public:

		EditorJeu(wxWindow* parent);
		virtual ~EditorJeu();

		//(*Declarations(EditorJeu)
		wxStaticText* StaticText9;
		wxStaticText* TailleJeuTxt;
		wxStaticText* StaticText2;
		wxStaticText* AuteurTxt;
		wxStaticText* NomJeuTxt;
		wxButton* ModParaBt;
		wxStaticText* StaticText1;
		wxStaticLine* StaticLine1;
		wxTreeCtrl* SceneTree;
		wxButton* EditPropSceneBt;
		wxButton* EditSceneBt;
		wxStaticText* StaticText;
		//*)

	protected:

		//(*Identifiers(EditorJeu)
		static const long ID_STATICTEXT1;
		static const long ID_STATICTEXT16;
		static const long ID_STATICTEXT2;
		static const long ID_STATICTEXT17;
		static const long ID_STATICTEXT6;
		static const long ID_BUTTON1;
		static const long ID_TREECTRL1;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT4;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON10;
		//*)

	private:

		//(*Handlers(EditorJeu)
		void OnModParaBtClick(wxCommandEvent& event);
		void OnSceneTreeBeginLabelEdit(wxTreeEvent& event);
		void OnSceneTreeEndLabelEdit(wxTreeEvent& event);
		void OnSceneTreeItemActivated(wxTreeEvent& event);
		void OnSelectedItemChanged(wxTreeEvent& event);
		void OnEditSceneBtClick(wxCommandEvent& event);
		void OnEditPropSceneBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif

