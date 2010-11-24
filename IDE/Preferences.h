#ifndef PREFERENCES_H
#define PREFERENCES_H

//(*Headers(Preferences)
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/radiobox.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/choice.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
#include <wx/listbook.h>
//*)

class Preferences: public wxDialog
{
	public:

		Preferences(wxWindow* parent);
		virtual ~Preferences();

		//(*Declarations(Preferences)
		wxStaticText* StaticText10;
		wxPanel* InactifColorPnl;
		wxButton* OkBt;
		wxStaticText* StaticText9;
		wxPanel* backColorPnl;
		wxPanel* Panel5;
		wxCheckBox* hideLabelsCheck;
		wxButton* auiStyleBt;
		wxCheckBox* MAJCheck;
		wxRadioBox* ribbonStyleBox;
		wxButton* gdStyleBt;
		wxButton* BrowseDossierTempBt;
		wxStaticText* StaticText13;
		wxPanel* ActifColor2Pnl;
		wxStaticText* StaticText2;
		wxPanel* Panel4;
		wxChoice* sceneEventsTabPosition;
		wxStaticText* StaticText14;
		wxStaticText* StaticText6;
		wxPanel* borderColorPnl;
		wxStaticText* StaticText8;
		wxStaticText* StaticText11;
		wxTextCtrl* autosaveTimeEdit;
		wxPanel* Panel1;
		wxPanel* activeTextColorPnl;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxTextCtrl* EditeurImageEdit;
		wxPanel* inactiveTextColorPnl;
		wxPanel* InactifColor2Pnl;
		wxCheckBox* hidePageTabsCheck;
		wxPanel* Panel6;
		wxPanel* Panel3;
		wxStaticLine* StaticLine2;
		wxPanel* ActifColorPnl;
		wxCheckBox* GuideCheck;
		wxListbook* Listbook1;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxCheckBox* autosaveActivatedCheck;
		wxStaticLine* StaticLine1;
		wxButton* BrowseEditionImage;
		wxStaticText* StaticText15;
		wxStaticText* StaticText12;
		wxButton* AnnulerBt;
		wxPanel* Panel2;
		wxChoice* langChoice;
		wxTextCtrl* DossierTempCompEdit;
		wxPanel* ribbonColor1Pnl;
		wxPanel* ribbonColor2Pnl;
		wxStaticText* StaticText4;
		wxButton* officeStyleBt;
		wxStaticBitmap* StaticBitmap3;
		wxButton* AideBt;
		//*)

	protected:

		//(*Identifiers(Preferences)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT7;
		static const long ID_PANEL5;
		static const long ID_STATICLINE2;
		static const long ID_CHECKBOX1;
		static const long ID_CHECKBOX4;
		static const long ID_CHECKBOX3;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT14;
		static const long ID_PANEL6;
		static const long ID_STATICTEXT13;
		static const long ID_CHOICE2;
		static const long ID_PANEL15;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL3;
		static const long ID_BUTTON5;
		static const long ID_STATICTEXT8;
		static const long ID_TEXTCTRL4;
		static const long ID_BUTTON4;
		static const long ID_PANEL7;
		static const long ID_STATICTEXT15;
		static const long ID_CHOICE1;
		static const long ID_PANEL16;
		static const long ID_BUTTON6;
		static const long ID_BUTTON7;
		static const long ID_BUTTON8;
		static const long ID_RADIOBOX1;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL9;
		static const long ID_STATICTEXT2;
		static const long ID_PANEL10;
		static const long ID_CHECKBOX2;
		static const long ID_CHECKBOX5;
		static const long ID_STATICTEXT4;
		static const long ID_PANEL3;
		static const long ID_PANEL4;
		static const long ID_STATICTEXT3;
		static const long ID_PANEL1;
		static const long ID_PANEL2;
		static const long ID_STATICTEXT9;
		static const long ID_PANEL11;
		static const long ID_STATICTEXT10;
		static const long ID_PANEL13;
		static const long ID_STATICTEXT11;
		static const long ID_PANEL12;
		static const long ID_STATICTEXT12;
		static const long ID_PANEL14;
		static const long ID_PANEL8;
		static const long ID_LISTBOOK1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(Preferences)
		void OnOkBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnActifColorPnlRightUp(wxMouseEvent& event);
		void OnActifColor2PnlRightUp(wxMouseEvent& event);
		void OnInactifColorPnlRightUp(wxMouseEvent& event);
		void OnInactifColor2PnlRightUp(wxMouseEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnBrowseDossierTempBtClick(wxCommandEvent& event);
		void OnBrowseEditionImageClick(wxCommandEvent& event);
		void OnribbonColor1PnlLeftUp(wxMouseEvent& event);
		void OnribbonColor2PnlLeftUp(wxMouseEvent& event);
		void OnbackColorPnlLeftUp(wxMouseEvent& event);
		void OnborderColorPnlLeftUp(wxMouseEvent& event);
		void OngdStyleBtClick(wxCommandEvent& event);
		void OnofficeStyleBtClick(wxCommandEvent& event);
		void OnauiStyleBtClick(wxCommandEvent& event);
		void OnhideLabelsCheckClick(wxCommandEvent& event);
		void OnlangChoiceSelect(wxCommandEvent& event);
		//*)
		void SetSkinDefault();
		void SetSkinOffice();
		void SetSkinAUI();

		bool changesNeedRestart;

		DECLARE_EVENT_TABLE()
};

#endif
