#if defined(GD_IDE_ONLY)

#ifndef EDITEXPRESSION_H
#define EDITEXPRESSION_H

//(*Headers(EditExpression)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/hyperlink.h>
#include <wx/bmpbuttn.h>
#include <wx/button.h>
#include <wx/dialog.h>
#include <wx/stc/stc.h>
//*)
#include <wx/imaglist.h>

#include "GDL/Game.h"
#include "GDL/Scene.h"
class ParameterInfo;

#include <string>
#include <vector>

using namespace std;

class GD_API EditExpression: public wxDialog
{
	public:

		EditExpression(wxWindow* parent, string pExpression, Game & game_, Scene & scene_, bool canSelectGroup, const vector < string > & mainObjectsName_);
		virtual ~EditExpression();

		//(*Declarations(EditExpression)
		wxButton* SinBt;
		wxButton* OkBt;
		wxButton* Button20;
		wxButton* Button4;
		wxButton* DivBt;
		wxStaticText* StaticText2;
		wxButton* AddValBt;
		wxButton* Button1;
		wxButton* ceilBt;
		wxTreeCtrl* ValList;
		wxHyperlinkCtrl* errorTxt;
		wxButton* Button14;
		wxBitmapButton* BitmapButton2;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxBitmapButton* BitmapButton1;
		wxTreeCtrl* ObjList;
		wxButton* Button2;
		wxButton* Button6;
		wxButton* CosBt;
		wxButton* POBt;
		wxButton* Button10;
		wxButton* Button11;
		wxButton* Button5;
		wxButton* Button3;
		wxButton* Button7;
		wxButton* Button19;
		wxButton* Button9;
		wxButton* AddPropBt;
		wxButton* intBt;
		wxButton* Button21;
		wxButton* PlusBt;
		wxStyledTextCtrl* ExpressionEdit;
		wxButton* Button17;
		wxButton* MinusBt;
		wxButton* MultBt;
		wxButton* Button18;
		wxButton* Button15;
		wxStaticText* StaticText4;
		wxButton* Button16;
		wxButton* PFBt;
		wxButton* Button8;
		wxButton* Button12;
		//*)

		string expression;
		void RefreshLists();

		//Item sélectionné dans la liste
		wxTreeItemId itemObj;
		wxTreeItemId itemVal;

	protected:

		//(*Identifiers(EditExpression)
		static const long ID_CUSTOM1;
		static const long ID_BUTTON1;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_STATICTEXT1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		static const long ID_BUTTON4;
		static const long ID_BUTTON5;
		static const long ID_STATICTEXT2;
		static const long ID_BUTTON6;
		static const long ID_BUTTON7;
		static const long ID_BUTTON13;
		static const long ID_BUTTON14;
		static const long ID_BITMAPBUTTON2;
		static const long ID_BITMAPBUTTON1;
		static const long ID_BUTTON15;
		static const long ID_BUTTON12;
		static const long ID_BUTTON8;
		static const long ID_BUTTON9;
		static const long ID_BUTTON16;
		static const long ID_BUTTON33;
		static const long ID_BUTTON29;
		static const long ID_BUTTON28;
		static const long ID_BUTTON27;
		static const long ID_BUTTON26;
		static const long ID_BUTTON18;
		static const long ID_BUTTON19;
		static const long ID_BUTTON20;
		static const long ID_BUTTON21;
		static const long ID_BUTTON22;
		static const long ID_BUTTON23;
		static const long ID_BUTTON24;
		static const long ID_BUTTON25;
		static const long ID_BUTTON30;
		static const long ID_BUTTON31;
		static const long ID_BUTTON32;
		static const long ID_BUTTON17;
		static const long ID_STATICTEXT3;
		static const long ID_TREECTRL1;
		static const long ID_BUTTON10;
		static const long ID_STATICTEXT4;
		static const long ID_TREECTRL2;
		static const long ID_BUTTON11;
		//*)

	private:

		//(*Handlers(EditExpression)
		void OnOkBtClick(wxCommandEvent& event);
		void OnPlusBtClick(wxCommandEvent& event);
		void OnMinusBtClick(wxCommandEvent& event);
		void OnMultBtClick(wxCommandEvent& event);
		void OnDivBtClick(wxCommandEvent& event);
		void OnPOBtClick(wxCommandEvent& event);
		void OnPFBtClick(wxCommandEvent& event);
		void OnCosBtClick(wxCommandEvent& event);
		void OnSinBtClick(wxCommandEvent& event);
		void OnAddPropBtClick(wxCommandEvent& event);
		void OnAddValBtClick(wxCommandEvent& event);
		void OnObjListItemActivated(wxTreeEvent& event);
		void OnValListItemActivated(wxTreeEvent& event);
		void OnButton2Click(wxCommandEvent& event);
		void OnButton3Click(wxCommandEvent& event);
		void OnBitmapButton2Click(wxCommandEvent& event);
		void OnBitmapButton1Click(wxCommandEvent& event);
		void OnButton4Click(wxCommandEvent& event);
		void OnButton1Click(wxCommandEvent& event);
		void OnButton5Click(wxCommandEvent& event);
		void OnButton6Click(wxCommandEvent& event);
		void OnButton7Click(wxCommandEvent& event);
		void OnButton8Click(wxCommandEvent& event);
		void OnButton9Click(wxCommandEvent& event);
		void OnintBtClick(wxCommandEvent& event);
		void OnObjListItemDoubleClicked(wxTreeEvent& event);
		void OnValListItemDoubleClicked(wxTreeEvent& event);
		void OnCustom1Paint(wxPaintEvent& event);
		void OnHyperlinkCtrl1Click(wxCommandEvent& event);
		void OnerrorTxtClick(wxCommandEvent& event);
		void OnButton21Click(wxCommandEvent& event);
		void OnButton14Click(wxCommandEvent& event);
		void OnintBtClick1(wxCommandEvent& event);
		void OnceilBtClick(wxCommandEvent& event);
		void OnButton10Click(wxCommandEvent& event);
		void OnButton11Click(wxCommandEvent& event);
		void OnButton12Click(wxCommandEvent& event);
		void OnButton18Click(wxCommandEvent& event);
		void OnButton19Click(wxCommandEvent& event);
		void OnButton20Click(wxCommandEvent& event);
		void OnButton15Click(wxCommandEvent& event);
		void OnButton16Click(wxCommandEvent& event);
		void OnButton17Click(wxCommandEvent& event);
		void OnButton21Click1(wxCommandEvent& event);
		//*)
		void TextModified(wxStyledTextEvent& event);
		void UpdateTextCtrl(wxStyledTextEvent& event);
		std::string ShowParameterDialog(const ParameterInfo & parameter);

		wxImageList * imageListObj;
		wxImageList * imageListVal;

        //Utile pour selectionner un objet
        //( quand on souhaite accéder aux propriétés d'un objet )
		Game & game;
		Scene & scene;
		bool canSelectGroup;
		const vector < string > & mainObjectsName;

		size_t lastErrorPos;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
