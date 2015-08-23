/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#ifndef GENERATEPASSWORD_H
#define GENERATEPASSWORD_H

//(*Headers(GeneratePassword)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <string>

using namespace std;

class GeneratePassword: public wxDialog
{
	public:

		GeneratePassword(wxWindow* parent);
		virtual ~GeneratePassword();
		string mdp; //Le mot de passe final

		//(*Declarations(GeneratePassword)
		wxButton* CreerBt;
		wxButton* OkBt;
		wxStaticText* StaticText2;
		wxStaticBitmap* StaticBitmap1;
		wxStaticText* StaticText1;
		wxTextCtrl* longEdit;
		wxTextCtrl* mdpEdit;
		wxStaticLine* StaticLine1;
		wxButton* AnnulerBt;
		wxHyperlinkCtrl* helpBt;
		//*)

	protected:

		//(*Identifiers(GeneratePassword)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT2;
		static const long ID_BUTTON1;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICLINE1;
		static const long ID_STATICBITMAP2;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(GeneratePassword)
		void OnCreerBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnOkBtClick(wxCommandEvent& event);
		void OnhelpBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif

