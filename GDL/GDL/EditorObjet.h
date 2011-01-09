#if defined(GD_IDE_ONLY)

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
#include "GDL/RuntimeGame.h"
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
		wxMenuItem* MenuItem31;
		wxMenuItem* MenuItem8;
		wxFlexGridSizer* FlexGridSizer4;
		wxScrollBar* scrollWidth;
		wxMenu maskContextMenu;
		wxCheckBox* NormalCheck;
		wxPanel* toolbarPanel;
		wxMenuItem* MenuItem26;
		wxMenuItem* MenuItem7;
		wxMenuItem* MenuItem25;
		wxScrollBar* thumbsScroll;
		wxCheckBox* RotationCheck;
		wxMenuItem* posEverywhereMenuItem;
		wxMenu pointsContextMenu;
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
		wxMenuItem* MenuItem1;
		wxMenuItem* MenuItem4;
		wxMenuItem* MenuItem14;
		wxButton* DelAnimBt;
		wxMenuItem* MenuItem11;
		wxMenuItem* MenuItem15;
		wxMenu* MenuItem6;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxMenuItem* MenuItem32;
		wxStaticText* StaticText3;
		wxMenuItem* MenuItem13;
		wxMenuItem* MenuItem10;
		wxScrollBar* scrollHeight;
		wxStaticLine* StaticLine2;
		wxMenuItem* MenuItem12;
		wxMenuItem* MenuItem24;
		wxMenuItem* MenuItem27;
		wxMenuItem* MenuItem3;
		wxMenuItem* MenuItem20;
		wxPanel* imagePanel;
		wxButton* AddAnimBt;
		wxMenuItem* MenuItem28;
		wxMenu* MenuItem22;
		wxGridSizer* GridSizer3;
		wxMenu imageContextMenu;
		wxMenu contextMenu;
		wxToggleButton* Bt2;
		wxStaticLine* StaticLine3;
		wxStaticBoxSizer* directionSizer;
		wxStaticLine* StaticLine1;
		wxMenuItem* MenuItem23;
		wxFlexGridSizer* animAndDirecSizer;
		wxToggleButton* Bt1;
		wxTextCtrl* TempsEdit;
		wxToggleButton* Bt3;
		wxMenuItem* applyMaskToAllDirectionSprites;
		wxToggleButton* Bt7;
		wxMenu* MenuItem29;
		wxPanel* Panel2;
		wxMenu* MenuItem5;
		wxMenuItem* MenuItem9;
		wxChoice* AnimationsBox;
		wxStaticText* StaticText4;
		wxStaticBitmap* CheckTempsEntreImg;
		wxRadioButton* BoucleOuiCheck;
		wxStaticText* NomObjetTxt;
		wxRadioButton* BoucleNonCheck;
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
		static const long idMenuAddFromEnd;
		static const long idMenuAddFromAfter;
		static const long idMenuAddFromBefore;
		static const long ID_MENUITEM1;
		static const long idMenuAddMoreEnd;
		static const long idMenuAddMoreAfter;
		static const long idMenuAddMoreBefore;
		static const long idMenuAddMulti;
		static const long idMenuDel;
		static const long idMenuDelAll;
		static const long idMenuCopyFrom;
		static const long idPosPoint;
		static const long ID_MENUITEM3;
		static const long ID_MENUITEM5;
		static const long ID_MENUITEM8;
		static const long ID_MENUITEM9;
		static const long ID_MENUITEM6;
		static const long idMenuPosEverywhere2;
		static const long ID_MENUITEM4;
		static const long ID_MENUITEM13;
		static const long ID_MENUITEM12;
		static const long ID_MENUITEM10;
		static const long ID_MENUITEM11;
		static const long ID_MENUITEM2;
		static const long ID_MENUITEM7;
		static const long idMenuPosEverywhere;
		static const long ID_MENUITEM14;
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
		void OnshowMaskSelected(wxCommandEvent& event);
		void OnshowMaskSelected1(wxCommandEvent& event);
		void OnautomaticMaskSelected(wxCommandEvent& event);
		void OnimagePanelLeftDown(wxMouseEvent& event);
		void OnimagePanelMouseMove(wxMouseEvent& event);
		void OnDelMaskRectangleSelected(wxCommandEvent& event);
		void OnMenuItem4Selected(wxCommandEvent& event);
		void OnAddMaskRectangleSelected(wxCommandEvent& event);
		void OnEditMaskSelected(wxCommandEvent& event);
		void OnModifyMaskRectangleSelected(wxCommandEvent& event);
		void OnEnterMaskRectanglePositionSelected(wxCommandEvent& event);
		void OnEditPointsSelected(wxCommandEvent& event);
		//*)
		void OnPointSelected(wxMenuEvent& event);
		void MovePoint(Sprite & sprite, string pointName, int X, int Y);

		DECLARE_EVENT_TABLE()

		bool AnimationAndDirectionValid();
		Animation & GetEditedAnimation();
		Direction & GetEditedDirection();
		bool SpriteValid();
		Sprite & GetEditedSprite();

		Game & game;
		MainEditorCommand & mainEditorCommand;
		SpriteObject & object;

		int selectedImage;
		bool placingPoint;
		string selectedPoint;

        float spritePosX;
        float spritePosY;

        bool editingMask;
		bool movingBox;
		unsigned int selectedBox;
		float xSelectionOffset;
		float ySelectionOffset;

		wxAuiManager m_mgr;
};

#endif
#endif
