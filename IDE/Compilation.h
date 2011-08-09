#ifndef COMPILATION_H
#define COMPILATION_H

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
//(*Headers(Compilation)
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/radiobox.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
#include <wx/gauge.h>
//*)
#include "GDL/Game.h"
#include <string>
#include <vector>
#include <wx/process.h>
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

using namespace std;

class Compilation: public wxDialog
{
	public:

		Compilation(wxWindow* parent, Game & gameToCompile_);
		virtual ~Compilation();

		//(*Declarations(Compilation)
		wxCheckBox* WinCheck;
		wxStaticBitmap* StaticBitmap2;
		wxPanel* Panel5;
		wxButton* Button4;
		wxNotebook* Notebook1;
		wxStaticText* StaticText2;
		wxPanel* Panel4;
		wxButton* FermerBt;
		wxStaticText* StaticText6;
		wxStaticBitmap* StaticBitmap1;
		wxCheckBox* MacCheck;
		wxStaticBitmap* StaticBitmap4;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxRadioBox* TypeBox;
		wxPanel* Panel3;
		wxStaticLine* StaticLine2;
		wxGauge* AvancementGauge;
		wxButton* Button5;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxButton* OuvrirBt;
		wxStaticLine* StaticLine1;
		wxPanel* Panel2;
		wxStaticText* StaticText4;
		wxCheckBox* LinuxCheck;
		wxStaticBitmap* StaticBitmap3;
		wxButton* CompilBt;
		wxButton* AideBt;
		//*)

	protected:

		//(*Identifiers(Compilation)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_STATICTEXT4;
		static const long ID_RADIOBOX1;
		static const long ID_BUTTON8;
		static const long ID_PANEL5;
		static const long ID_STATICTEXT5;
		static const long ID_STATICBITMAP1;
		static const long ID_CHECKBOX1;
		static const long ID_STATICBITMAP2;
		static const long ID_CHECKBOX2;
		static const long ID_STATICBITMAP4;
		static const long ID_CHECKBOX3;
		static const long ID_BUTTON9;
		static const long ID_PANEL2;
		static const long ID_STATICTEXT6;
		static const long ID_BUTTON1;
		static const long ID_GAUGE1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICTEXT3;
		static const long ID_PANEL3;
		static const long ID_STATICTEXT7;
		static const long ID_BUTTON3;
		static const long ID_PANEL4;
		static const long ID_NOTEBOOK1;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON4;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(Compilation)
		void OnFermerBtClick(wxCommandEvent& event);
		void OnCompilBtClick(wxCommandEvent& event);
		void OnOuvrirBtClick(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnNext1Click(wxCommandEvent& event);
		void OnNext2Click(wxCommandEvent& event);
		void OnCGShareBtClick(wxCommandEvent& event);
		void OnDistribuerBtClick(wxCommandEvent& event);
		//*)

        void ClearDirectory(std::string directory, string & report);
		Game & gameToCompile;
		wxString GetTempDir();

		wxString destinationDirectory;

		DECLARE_EVENT_TABLE()
};

#endif
