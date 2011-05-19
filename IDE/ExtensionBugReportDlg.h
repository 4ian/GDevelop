#ifndef EXTENSIONBUGREPORTDLG_H
#define EXTENSIONBUGREPORTDLG_H

//(*Headers(ExtensionBugReportDlg)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class ExtensionBugReportDlg: public wxDialog
{
	public:

		ExtensionBugReportDlg(wxWindow* parent, wxString extensionFile);
		virtual ~ExtensionBugReportDlg();

		//(*Declarations(ExtensionBugReportDlg)
		wxStaticBitmap* StaticBitmap1;
		wxButton* closeGDBt;
		wxButton* loadWithoutExtensionsBt;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* loadGDBt;
		wxStaticLine* StaticLine2;
		wxButton* moreBt;
		wxStaticLine* StaticLine1;
		wxStaticText* fileTxt;
		wxStaticText* StaticText4;
		wxStaticText* errorTxt;
		//*)

	protected:

		//(*Identifiers(ExtensionBugReportDlg)
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT2;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT4;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON1;
		static const long ID_BUTTON4;
		static const long ID_BUTTON3;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(ExtensionBugReportDlg)
		void OncloseGDBtClick(wxCommandEvent& event);
		void OnmoreBtClick(wxCommandEvent& event);
		void OnloadGDBtClick(wxCommandEvent& event);
		void OnloadWithoutExtensionsBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
