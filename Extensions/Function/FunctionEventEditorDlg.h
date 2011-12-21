#if defined(GD_IDE_ONLY)

#ifndef FUNCTIONEVENTEDITORDLG_H
#define FUNCTIONEVENTEDITORDLG_H

//(*Headers(FunctionEventEditorDlg)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/radiobox.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "FunctionEvent.h"

class FunctionEventEditorDlg: public wxDialog
{
	public:

		FunctionEventEditorDlg(wxWindow* parent, FunctionEvent & event_, Game & game_, Scene & scene_);
		virtual ~FunctionEventEditorDlg();

		//(*Declarations(FunctionEventEditorDlg)
		wxStaticText* StaticText2;
		wxRadioBox* callerContextChoice;
		wxPanel* Panel1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxStaticLine* StaticLine2;
		wxTextCtrl* nameEdit;
		wxStaticLine* StaticLine1;
		wxButton* okBt;
		wxStaticBitmap* StaticBitmap3;
		//*)

		FunctionEvent & eventEdited;

	protected:

		//(*Identifiers(FunctionEventEditorDlg)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT3;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL2;
		static const long ID_RADIOBOX1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(FunctionEventEditorDlg)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		//*)

		Game & game;
		Scene & scene;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
