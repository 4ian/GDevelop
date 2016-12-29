#ifndef PREFERENCES_H
#define PREFERENCES_H

//(*Headers(Preferences)
#include <wx/spinctrl.h>
#include <wx/checkbox.h>
#include <wx/dialog.h>
#include <wx/sizer.h>
#include <wx/notebook.h>
#include <wx/button.h>
#include <wx/radiobut.h>
#include <wx/panel.h>
#include <wx/listbook.h>
#include <wx/statline.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/choice.h>
#include <wx/propgrid/propgrid.h>
#include <wx/radiobox.h>
#include <wx/statbmp.h>
#include <wx/fontdlg.h>
//*)

class Preferences: public wxDialog
{
	public:

		Preferences(wxWindow* parent);
		virtual ~Preferences();

		//(*Declarations(Preferences)
		wxButton* gdStyleBt;
		wxStaticText* StaticText24;
		wxButton* newProjectFolderBrowseBt;
		wxStaticText* StaticText22;
		wxButton* AideBt;
		wxPanel* ActifColorPnl;
		wxPanel* Panel6;
		wxPanel* Panel1;
		wxButton* browseCompilationTempDir;
		wxStaticText* StaticText21;
		wxStaticText* StaticText13;
		wxStaticText* StaticText14;
		wxPanel* Panel7;
		wxRadioButton* internalCodeEditorCheck;
		wxStaticText* StaticText15;
		wxChoice* sceneEventsTabPosition;
		wxStaticLine* StaticLine2;
		wxCheckBox* hideLabelsCheck;
		wxChoice* langChoice;
		wxStaticText* StaticText17;
		wxButton* oxygenStyleBt;
		wxButton* BrowseDossierTempBt;
		wxFontDialog* eventsEditorFontDialog;
		wxPanel* ActifColor2Pnl;
		wxPanel* inactiveTextColorPnl;
		wxRadioBox* tabBox;
		wxCheckBox* autosaveActivatedCheck;
		wxButton* Button1;
		wxButton* Button2;
		wxTextCtrl* autosaveTimeEdit;
		wxPanel* activeTextColorPnl;
		wxPanel* activeTabColorPnl;
		wxPanel* Panel8;
		wxStaticText* StaticText20;
		wxStaticText* StaticText18;
		wxCheckBox* hideContextPanelsLabels;
		wxStaticText* StaticText1;
		wxStaticText* StaticText10;
		wxTextCtrl* newProjectFolderEdit;
		wxStaticText* StaticText16;
		wxPanel* ribbonColor2Pnl;
		wxPanel* Panel2;
		wxCheckBox* deleteTemporariesCheck;
		wxTextCtrl* DossierTempCompEdit;
		wxCheckBox* MAJCheck;
		wxSpinCtrl* codeCompilerThreadEdit;
		wxStaticText* StaticText3;
		wxTextCtrl* EditeurImageEdit;
		wxPanel* Panel4;
		wxStaticText* StaticText23;
		wxCheckBox* customToolbarColorCheck;
		wxStaticLine* StaticLine1;
		wxPanel* Panel5;
		wxStaticText* StaticText8;
		wxStaticText* StaticText12;
		wxButton* officeStyleBt;
		wxTextCtrl* conditionsColumnWidthEdit;
		wxButton* AnnulerBt;
		wxPanel* Panel3;
		wxStaticText* StaticText7;
		wxTextCtrl* codeEditorEdit;
		wxPanel* borderColorPnl;
		wxPanel* InactifColorPnl;
		wxRadioBox* ribbonStyleBox;
		wxTextCtrl* eventsCompilerTempDirEdit;
		wxCheckBox* logCheck;
		wxTextCtrl* javaDirEdit;
		wxStaticText* StaticText4;
		wxPanel* toolbarColorPanel;
		wxStaticText* StaticText5;
		wxButton* eventsEditorFontBt;
		wxStaticText* StaticText2;
		wxStaticBitmap* StaticBitmap3;
		wxCheckBox* avertOnSaveCheck;
		wxButton* OkBt;
		wxPanel* fileBtColorPnl;
		wxStaticText* StaticText6;
		wxPanel* backColorPnl;
		wxButton* browseJavaBt;
		wxPanel* ribbonColor1Pnl;
		wxButton* radianceStyleBt;
		wxStaticText* StaticText19;
		wxButton* BrowseEditionImage;
		wxRadioButton* externalCodeEditorCheck;
		wxPanel* tabColorPnl;
		wxStaticText* StaticText9;
		wxRadioBox* toolbarBox;
		wxPanel* InactifColor2Pnl;
		wxButton* browseCodeEditorBt;
		wxPropertyGrid* eventsEditorParametersProperties;
		wxListbook* Listbook1;
		wxStaticText* StaticText11;
		wxCheckBox* sendInfoCheck;
		//*)

	protected:

		//(*Identifiers(Preferences)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT7;
		static const long ID_PANEL5;
		static const long ID_STATICLINE2;
		static const long ID_CHECKBOX4;
		static const long ID_CHECKBOX10;
		static const long ID_CHECKBOX3;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT14;
		static const long ID_CHECKBOX8;
		static const long ID_CHECKBOX9;
		static const long ID_PANEL6;
		static const long ID_STATICTEXT13;
		static const long ID_CHOICE2;
		static const long ID_PANEL15;
		static const long ID_STATICTEXT16;
		static const long ID_TEXTCTRL7;
		static const long ID_BUTTON9;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL3;
		static const long ID_BUTTON5;
		static const long ID_STATICTEXT8;
		static const long ID_TEXTCTRL4;
		static const long ID_BUTTON4;
		static const long ID_STATICTEXT21;
		static const long ID_TEXTCTRL6;
		static const long ID_BUTTON12;
		static const long ID_CHECKBOX7;
		static const long ID_STATICTEXT24;
		static const long ID_TEXTCTRL8;
		static const long ID_BUTTON15;
		static const long ID_PANEL7;
		static const long ID_STATICTEXT15;
		static const long ID_CHOICE1;
		static const long ID_PANEL16;
		static const long ID_BUTTON16;
		static const long ID_BUTTON8;
		static const long ID_BUTTON6;
		static const long ID_BUTTON7;
		static const long ID_BUTTON10;
		static const long ID_BUTTON13;
		static const long ID_RADIOBOX1;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL9;
		static const long ID_STATICTEXT2;
		static const long ID_PANEL10;
		static const long ID_CHECKBOX2;
		static const long ID_STATICTEXT22;
		static const long ID_PANEL21;
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
		static const long ID_STATICTEXT19;
		static const long ID_PANEL19;
		static const long ID_STATICTEXT20;
		static const long ID_PANEL20;
		static const long ID_RADIOBOX2;
		static const long ID_CHECKBOX1;
		static const long ID_PANEL22;
		static const long ID_RADIOBOX3;
		static const long ID_PANEL8;
		static const long ID_STATICTEXT17;
		static const long ID_TEXTCTRL5;
		static const long ID_STATICTEXT18;
		static const long ID_CHECKBOX6;
		static const long ID_CUSTOM1;
		static const long ID_BUTTON14;
		static const long ID_PANEL18;
		static const long ID_RADIOBUTTON2;
		static const long ID_RADIOBUTTON1;
		static const long ID_TEXTCTRL2;
		static const long ID_BUTTON11;
		static const long ID_STATICTEXT23;
		static const long ID_SPINCTRL1;
		static const long ID_PANEL17;
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
		void OncompilerToolchainBtClick(wxCommandEvent& event);
		void OnbrowseCodeEditorBtClick(wxCommandEvent& event);
		void OnobjectParamColorLeftUp(wxMouseEvent& event);
		void OnautoParamColorLeftUp(wxMouseEvent& event);
		void OnexpressionParamColorLeftUp(wxMouseEvent& event);
		void OnradianceStyleBtClick(wxCommandEvent& event);
		void OnactiveTabColorPnlLeftUp(wxMouseEvent& event);
		void OntabColorPnlLeftUp(wxMouseEvent& event);
		void OneventsCompilerTempDirEditText(wxCommandEvent& event);
		void OnbrowseCompilationTempDirClick(wxCommandEvent& event);
		void OnactiveTextColorPnlLeftUp(wxMouseEvent& event);
		void OninactiveTextColorPnlLeftUp(wxMouseEvent& event);
		void OnoxygenStyleBtClick(wxCommandEvent& event);
		void OnfileBtColorPnlLeftUp(wxMouseEvent& event);
		void OnlogCheckClick(wxCommandEvent& event);
		void OnnewProjectFolderBrowseBtClick(wxCommandEvent& event);
		void OneventsEditorFontBtClick(wxCommandEvent& event);
		void OnbrowseJavaBtClick(wxCommandEvent& event);
		void OncustomToolbarColorCheckClick(wxCommandEvent& event);
		void OntoolbarColorPanelLeftUp(wxMouseEvent& event);
		void OnGDMetroStyleClick(wxCommandEvent& event);
		void OnMetroWhiteStyleClick(wxCommandEvent& event);
		void OnMAJCheckClick(wxCommandEvent& event);
		void OnOfficeGDStyleBtClick(wxCommandEvent& event);
		//*)
		void SetSkinOfficeGD();
		void SetSkinOffice();
		void SetSkinAUI();
		void SetSkinRadiance();
		void SetSkinOxygen();

		wxString logFile;

		bool changesNeedRestart;

		DECLARE_EVENT_TABLE()
};

#endif

