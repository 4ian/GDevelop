/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#ifndef MAJ_H
#define MAJ_H

#ifndef GD_NO_UPDATE_CHECKER

//(*Headers(MAJ)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

/**
 * \brief Dialog displaying information about the latest version available.
 *
 * \see UpdateChecker
 */
class MAJ: public wxDialog
{
	public:

		MAJ(wxWindow* parent, bool wasAutomaticallyOpened = false);
		virtual ~MAJ();

		//(*Declarations(MAJ)
		wxButton* downloadAndInstallBt;
		wxStaticText* versionMAJTxt;
		wxStaticText* StaticText2;
		wxButton* FermerBt;
		wxStaticBitmap* StaticBitmap1;
		wxTextCtrl* infoEdit;
		wxButton* VerifMAJBt;
		wxHyperlinkCtrl* linkCtrl;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxHyperlinkCtrl* HyperlinkCtrl1;
		wxStaticLine* StaticLine2;
		wxStaticText* StaticText5;
		wxStaticText* StaticText4;
		wxStaticText* versionTxt;
		//*)

	protected:

		//(*Identifiers(MAJ)
		static const long ID_STATICTEXT2;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT4;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT7;
		static const long ID_BUTTON4;
		static const long ID_STATICTEXT6;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_STATICLINE2;
		static const long ID_STATICBITMAP2;
		static const long ID_HYPERLINKCTRL2;
		static const long ID_BUTTON2;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(MAJ)
		void OnVerifMAJBtClick(wxCommandEvent& event);
		void OnLienBtClick(wxCommandEvent& event);
		void OnFermerBtClick(wxCommandEvent& event);
		void OndownloadAndInstallBtClick(wxCommandEvent& event);
		void OnHelpBtClick(wxCommandEvent& event);
		//*)
		void CheckForUpdate();

		wxWindow * parent;

		DECLARE_EVENT_TABLE()
};

#endif

#endif
