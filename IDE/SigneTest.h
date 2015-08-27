/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#ifndef SIGNETEST_H
#define SIGNETEST_H

//(*Headers(SigneTest)
#include <wx/sizer.h>
#include <wx/radiobox.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class SigneTest: public wxDialog
{
	public:

		SigneTest(wxWindow* parent);
		virtual ~SigneTest();

		//(*Declarations(SigneTest)
		wxButton* OkBt;
		wxStaticBitmap* StaticBitmap1;
		wxRadioBox* SigneRadio;
		wxHyperlinkCtrl* helpBt;
		//*)

	protected:

		//(*Identifiers(SigneTest)
		static const long ID_RADIOBOX1;
		static const long ID_STATICBITMAP2;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(SigneTest)
		void OnOkBtClick(wxCommandEvent& event);
		void OnhelpBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif

