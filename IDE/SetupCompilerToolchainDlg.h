#ifndef SETUPCOMPILERTOOLCHAINDLG_H
#define SETUPCOMPILERTOOLCHAINDLG_H

//(*Headers(SetupCompilerToolchainDlg)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class SetupCompilerToolchainDlg: public wxDialog
{
	public:

		SetupCompilerToolchainDlg(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~SetupCompilerToolchainDlg();

		//(*Declarations(SetupCompilerToolchainDlg)
		wxStaticText* StaticText10;
		wxButton* browseWxBt;
		wxStaticText* StaticText9;
		wxHyperlinkCtrl* HyperlinkCtrl2;
		wxStaticBitmap* StaticBitmap2;
		wxButton* browseSFMLBt;
		wxButton* browseBoostBt;
		wxHyperlinkCtrl* HyperlinkCtrl3;
		wxHyperlinkCtrl* HyperlinkCtrl6;
		wxStaticText* StaticText13;
		wxStaticText* StaticText2;
		wxStaticText* StaticText14;
		wxStaticText* StaticText6;
		wxStaticBitmap* StaticBitmap1;
		wxHyperlinkCtrl* HyperlinkCtrl5;
		wxStaticText* StaticText8;
		wxStaticText* StaticText11;
		wxTextCtrl* gdlDirEdit;
		wxStaticBitmap* StaticBitmap4;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxHyperlinkCtrl* HyperlinkCtrl1;
		wxButton* cancelBt;
		wxStaticLine* StaticLine2;
		wxHyperlinkCtrl* HyperlinkCtrl4;
		wxTextCtrl* wxDirEdit;
		wxTextCtrl* gccDirEdit;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxStaticLine* StaticLine3;
		wxStaticLine* StaticLine1;
		wxStaticText* StaticText12;
		wxButton* browseGCC;
		wxButton* browseGDLBt;
		wxPanel* Panel2;
		wxTextCtrl* boostDirEdit;
		wxStaticText* StaticText4;
		wxTextCtrl* sfmlDirEdit;
		wxButton* okBt;
		wxStaticBitmap* StaticBitmap3;
		//*)

	protected:

		//(*Identifiers(SetupCompilerToolchainDlg)
		static const long ID_STATICBITMAP2;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT5;
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT6;
		static const long ID_HYPERLINKCTRL2;
		static const long ID_STATICBITMAP4;
		static const long ID_STATICTEXT7;
		static const long ID_PANEL2;
		static const long ID_STATICLINE3;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL1;
		static const long ID_BUTTON3;
		static const long ID_STATICTEXT3;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL2;
		static const long ID_BUTTON4;
		static const long ID_STATICTEXT8;
		static const long ID_HYPERLINKCTRL3;
		static const long ID_STATICTEXT9;
		static const long ID_TEXTCTRL3;
		static const long ID_BUTTON5;
		static const long ID_STATICTEXT10;
		static const long ID_HYPERLINKCTRL4;
		static const long ID_STATICTEXT11;
		static const long ID_TEXTCTRL4;
		static const long ID_BUTTON6;
		static const long ID_STATICTEXT12;
		static const long ID_HYPERLINKCTRL5;
		static const long ID_STATICTEXT13;
		static const long ID_TEXTCTRL5;
		static const long ID_BUTTON7;
		static const long ID_STATICTEXT14;
		static const long ID_HYPERLINKCTRL6;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(SetupCompilerToolchainDlg)
		void OnbrowseGCCClick(wxCommandEvent& event);
		void OnbrowseSFMLBtClick(wxCommandEvent& event);
		void OnbrowseWxBtClick(wxCommandEvent& event);
		void OnbrowseBoostBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OnbrowseGDLBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
