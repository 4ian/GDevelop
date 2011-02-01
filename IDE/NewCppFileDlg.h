#ifndef NEWCPPFILEDLG_H
#define NEWCPPFILEDLG_H

//(*Headers(NewCppFileDlg)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <string>
#include <vector>
class Game;



class NewCppFileDlg: public wxDialog
{
	public:

		NewCppFileDlg(wxWindow* parent, Game & game_);
		virtual ~NewCppFileDlg();

		std::vector<std::string> createdFiles;

		static bool CreateExtensionMainFile(std::string filename);
		static bool CreateEventHeaderFile(std::string filename);
		static bool CreateEventImplementationFile(std::string filename);

		//(*Declarations(NewCppFileDlg)
		wxStaticBitmap* StaticBitmap2;
		wxStaticText* StaticText2;
		wxButton* Button1;
		wxStaticText* StaticText6;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxButton* extensionMainFileBt;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxStaticLine* StaticLine2;
		wxButton* eventFileBt;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxStaticLine* StaticLine1;
		wxStaticText* StaticText4;
		wxTextCtrl* filenameEdit;
		wxTextCtrl* dirEdit;
		//*)

	protected:

		//(*Identifiers(NewCppFileDlg)
		static const long ID_STATICBITMAP2;
		static const long ID_STATICTEXT3;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL2;
		static const long ID_BUTTON5;
		static const long ID_STATICTEXT4;
		static const long ID_STATICTEXT1;
		static const long ID_BUTTON1;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT6;
		static const long ID_BUTTON3;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(NewCppFileDlg)
		void OncancelBtClick(wxCommandEvent& event);
		void OnextensionMainFileBtClick(wxCommandEvent& event);
		void OneventFileBtClick(wxCommandEvent& event);
		void OnbrowseBtClick(wxCommandEvent& event);
		//*)

		Game & game;

		DECLARE_EVENT_TABLE()
};

#endif
