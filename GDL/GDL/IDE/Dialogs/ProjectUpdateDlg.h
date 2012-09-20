#if defined(GD_IDE_ONLY)

#ifndef PROJECTUPDATEDLG_H
#define PROJECTUPDATEDLG_H

//(*Headers(ProjectUpdateDlg)
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

class ProjectUpdateDlg: public wxDialog
{
	public:

		ProjectUpdateDlg(wxWindow* parent, std::string update);
		virtual ~ProjectUpdateDlg();

		//(*Declarations(ProjectUpdateDlg)
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxStaticLine* StaticLine2;
		wxStaticLine* StaticLine1;
		wxTextCtrl* updateTextEdit;
		wxButton* okBt;
		wxStaticBitmap* StaticBitmap3;
		//*)

	protected:

		//(*Identifiers(ProjectUpdateDlg)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT3;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(ProjectUpdateDlg)
		void OnokBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
#endif

