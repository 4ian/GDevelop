#ifndef BUGREPORT_H
#define BUGREPORT_H

//(*Headers(BugReport)
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class BugReport: public wxDialog
{
	public:

		BugReport(wxWindow* parent);
		virtual ~BugReport();

		//(*Declarations(BugReport)
		wxStaticBitmap* StaticBitmap2;
		wxNotebook* Notebook1;
		wxStaticText* StaticText2;
		wxPanel* Panel4;
		wxButton* CloseNoOpenBt;
		wxButton* Button1;
		wxStaticText* StaticText6;
		wxStaticBitmap* StaticBitmap1;
		wxTextCtrl* UserReportEdit;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxButton* CreateRapportBt;
		wxStaticText* StaticText3;
		wxButton* Button2;
		wxPanel* Panel3;
		wxStaticText* StaticText5;
		wxStaticLine* StaticLine1;
		wxPanel* Panel2;
		wxStaticText* StaticText4;
		wxStaticBitmap* StaticBitmap3;
		wxButton* CloseBt;
		//*)

	protected:

		//(*Identifiers(BugReport)
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT2;
		static const long ID_BUTTON4;
		static const long ID_PANEL2;
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT6;
		static const long ID_BUTTON1;
		static const long ID_BUTTON5;
		static const long ID_PANEL3;
		static const long ID_STATICTEXT4;
		static const long ID_STATICBITMAP2;
		static const long ID_STATICTEXT5;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		static const long ID_PANEL4;
		static const long ID_NOTEBOOK1;
		//*)

	private:

		//(*Handlers(BugReport)
		void OnCreateRapportBtClick(wxCommandEvent& event);
		void OnCloseNoOpenBtClick(wxCommandEvent& event);
		void OnCloseBtClick(wxCommandEvent& event);
		void OnButton1Click(wxCommandEvent& event);
		void OnButton2Click(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
