#ifndef COMPILATION_H
#define COMPILATION_H

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
//(*Headers(Compilation)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
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
		wxStaticText* statusTxt;
		wxButton* FermerBt;
		wxCheckBox* optimizationCheck;
		wxCheckBox* compressCheck;
		wxStaticText* status2Txt;
		wxStaticLine* StaticLine2;
		wxGauge* AvancementGauge;
		wxButton* browseBt;
		wxStaticText* StaticText4;
		wxTextCtrl* dirEdit;
		wxButton* CompilBt;
		wxButton* AideBt;
		//*)

	protected:

		//(*Identifiers(Compilation)
		static const long ID_GAUGE1;
		static const long ID_BUTTON1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICTEXT1;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL1;
		static const long ID_BUTTON5;
		static const long ID_CHECKBOX1;
		static const long ID_CHECKBOX4;
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
		void OnbrowseBtClick(wxCommandEvent& event);
		//*)
		wxString DeleteInvalidCharacters(const wxString & directoryName) const;

		Game & gameToCompile;

		DECLARE_EVENT_TABLE()
};

#endif
