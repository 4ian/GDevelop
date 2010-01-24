#if defined(GDE)

#ifndef EDITOROBJET_H
#define EDITOROBJET_H

//(*Headers(EditorObjet)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/menu.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/tglbtn.h>
#include <wx/statline.h>
#include <wx/radiobut.h>
#include <wx/panel.h>
#include <wx/choice.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/scrolbar.h>
#include <wx/dialog.h>
//*)
#include <wx/toolbar.h>
#include <wx/statbmp.h>
#include <wx/aui/aui.h>
#include "GDL/Game.h"
#include "GDL/SpriteObject.h"
#include "GDL/MainEditorCommand.h"
#include "GDL/EditorImages.h"

#include <string>
#include <vector>

using namespace std;

class EditorObjet: public wxDialog
{
	public:

		EditorObjet( wxWindow* parent, Game & game_, SpriteObject & object_, MainEditorCommand & mainEditorCommand_ );
		virtual ~EditorObjet();
		void RefreshFromObjet();
        void RefreshImages();

		unsigned int animation;
		unsigned int direction;

		//Scrollbar
		int position;

		//(*Declarations(EditorObjet)
		wxPanel* Core;
		wxButton* OkBt;
		wxMenuItem* MenuItem8;
		wxFlexGridSizer* FlexGridSizer4;
		wxScrollBar* scrollWidth;
		wxCheckBox* NormalCheck;
		wxPanel* toolbarPanel;
		wxMenuItem* MenuItem7;
		wxScrollBar* thumbsScroll;
		wxCheckBox* RotationCheck;
		wxMenuItem* posEverywhereMenuItem;
		wxStaticText* StaticText2;
		wxToggleButton* Bt4;
		wxToggleButton* Bt6;
		wxPanel* thumbsPanel;
		wxMenuItem* MenuItem2;
		wxToggleButton* Bt0;
		wxFlexGridSizer* FlexGridSizer10;
		wxButton* ListImageBt;
		wxStaticBoxSizer* imagesSizer;
		wxToggleButton* Bt5;
		wxStaticBitmap* StaticBitmap1;
		wxMenuItem* MenuItem4;
		wxMenuItem* MenuItem14;
		wxButton* DelAnimBt;
		wxMenuItem* MenuItem11;
		wxMenuItem* MenuItem15;
		wxMenu* MenuItem6;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxMenuItem* MenuItem13;
		wxMenuItem* MenuItem10;
		wxScrollBar* scrollHeight;
		wxStaticLine* StaticLine2;
		wxMenuItem* MenuItem12;
		wxMenuItem* MenuItem3;
		wxPanel* imagePanel;
		wxButton* AddAnimBt;
		wxGridSizer* GridSizer3;
		wxMenu imageContextMenu;
		wxMenu contextMenu;
		wxToggleButton* Bt2;
		wxStaticLine* StaticLine3;
		wxStaticBoxSizer* directionSizer;
		wxStaticLine* StaticLine1;
		wxFlexGridSizer* animAndDirecSizer;
		wxToggleButton* Bt1;
		wxTextCtrl* TempsEdit;
		wxToggleButton* Bt3;
		wxToggleButton* Bt7;
		wxPanel* Panel2;
		wxMenu* MenuItem5;
		wxMenuItem* MenuItem16;
		wxMenuItem* MenuItem9;
		wxChoice* AnimationsBox;
		wxStaticText* StaticText4;
		wxMenu* MenuItem1;
		wxStaticBitmap* CheckTempsEntreImg;
		wxMenuItem* MenuItem18;
		wxRadioButton* BoucleOuiCheck;
		wxStaticText* NomObjetTxt;
		wxRadioButton* BoucleNonCheck;
		wxMenuItem* MenuItem19;
		wxButton* AideBt;
		//*)
		EditorImages * editorImagesPnl;
		wxToolBar * toolbar;

	protected:

		//(*Identifiers(EditorObjet)
		static const long ID_STATICTEXT6;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL2;
		static const long ID_STATICLINE1;
		static const long ID_CHOICE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_CHECKBOX1;
		static const long ID_TOGGLEBUTTON8;
		static const long ID_TOGGLEBUTTON7;
		static const long ID_TOGGLEBUTTON6;
		static const long ID_TOGGLEBUTTON5;
		static const long ID_STATICBITMAP2;
		static const long ID_TOGGLEBUTTON1;
		static const long ID_TOGGLEBUTTON2;
		static const long ID_TOGGLEBUTTON3;
		static const long ID_TOGGLEBUTTON4;
		static const long ID_CHECKBOX2;
		static const long ID_PANEL6;
		static const long ID_STATICLINE3;
		static const long ID_PANEL3;
		static const long ID_SCROLLBAR1;
		static const long ID_SCROLLBAR3;
		static const long ID_PANEL4;
		static const long ID_SCROLLBAR2;
		static const long ID_PANEL5;
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT4;
		static const long ID_RADIOBUTTON3;
		static const long ID_RADIOBUTTON4;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON3;
		static const long ID_BUTTON5;
		static const long ID_BUTTON4;
		static const long ID_PANEL1;
		static const long idMenuAddEnd;
		static const long idMenuAddAfter;
		static const long idMenuAddBefore;
		static const long idMenuAdd;
		static const long idMenuAddMoreEnd;
		static const long idMenuAddMoreAfter;
		static const long idMenuAddMoreBefore;
		static const long idMenuAddMulti;
		static const long idMenuAddFromEnd;
		static const long idMenuAddFromAfter;
		static const long idMenuAddFromBefore;
		static const long ID_MENUITEM1;
		static const long idMenuDel;
		static const long idMenuDelAll;
		static const long idMenuCopyFrom;
		static const long idPosPoint;
		static const long idPosPrecis;
		static const long idMenuPosEverywhere;
		static const long idMenuOptions;
		static const long idAddPoint;
		static const long idDelPoint;
		//*)
		static const long ID_BITMAPARRAY;
		static const long ID_BUTTONARRAY;
		static const long ID_EDITARRAY;


	private:

		//(*Handlers(EditorObjet)
		void OnScrollBar1Scroll(wxScrollEvent& event);
		void OnBt0Toggle(wxCommandEvent& event);
		void OnBt1Toggle(wxCommandEvent& event);
		void OnBt2Toggle(wxCommandEvent& event);
		void OnBt3Toggle(wxCommandEvent& event);
		void OnBt4Toggle(wxCommandEvent& event);
		void OnBt5Toggle(wxCommandEvent& event);
		void OnBt6Toggle(wxCommandEvent& event);
		void OnBt7Toggle(wxCommandEvent& event);
		void OnAddAnimBtClick(wxCommandEvent& event);
		void OnDelAnimBtClick(wxCommandEvent& event);
		void OnAnimationsBoxSelect(wxCommandEvent& event);
		void OnTempsEditText(wxCommandEvent& event);
		void OnBoucleOuiCheckSelect(wxCommandEvent& event);
		void OnBoucleNonCheckSelect(wxCommandEvent& event);
		void OnRightUp(wxMouseEvent& event);
		void OnButton1Click(wxCommandEvent& event);
		void OnRotationCheckSelect(wxCommandEvent& event);
		void OnNormalCheckSelect(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnOkBtClick(wxCommandEvent& event);
		void OnDeleteAllBtClick(wxCommandEvent& event);
		void OnAjoutPlusBtClick(wxCommandEvent& event);
		void OnCopyBtClick(wxCommandEvent& event);
		void OnthumbsPanelResize(wxSizeEvent& event);
		void OnthumbsPanelPaint(wxPaintEvent& event);
		void OnthumbsScrollScroll(wxScrollEvent& event);
		void OnthumbsPanelLeftUp(wxMouseEvent& event);
		void OnthumbsPanelEraseBackground(wxEraseEvent& event);
		void OnimagePanelPaint(wxPaintEvent& event);
		void OnimagePanelEraseBackground(wxEraseEvent& event);
		void OnthumbsPanelRightUp(wxMouseEvent& event);
		void OnAddImageEndSelected(wxCommandEvent& event);
		void OnAddImageAfterSelected(wxCommandEvent& event);
		void OnAddImageBeforeSelected(wxCommandEvent& event);
		void OnAddMoreEndSelected(wxCommandEvent& event);
		void OnAddMoreAfterSelected(wxCommandEvent& event);
		void OnAddMoreBeforeSelected(wxCommandEvent& event);
		void OnAddFromEndSelected(wxCommandEvent& event);
		void OnAddFromAfterSelected(wxCommandEvent& event);
		void OnAddFromBeforeSelected(wxCommandEvent& event);
		void OnDeleteSelected(wxCommandEvent& event);
		void OntoolbarPanelResize(wxSizeEvent& event);
		void OnscrollHeightScroll(wxScrollEvent& event);
		void OnscrollWidthScroll(wxScrollEvent& event);
		void OnimagePanelRightUp(wxMouseEvent& event);
		void OnimagePanelLeftUp(wxMouseEvent& event);
		void OnModPointSelected(wxCommandEvent& event);
		void OnAddPointSelected(wxCommandEvent& event);
		void OnDelPointSelected(wxCommandEvent& event);
		void OnModPointPrecisSelected(wxCommandEvent& event);
		//*)
		void OnPointSelected(wxMenuEvent& event);
		void MovePoint(Sprite & sprite, string pointName, int X, int Y);

		DECLARE_EVENT_TABLE()

		Game & game;
		MainEditorCommand & mainEditorCommand;
		SpriteObject & object;

		int selectedImage;
		bool placingPoint;
		string selectedPoint;


		wxAuiManager m_mgr;
};

#endif
#endif
