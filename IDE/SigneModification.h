/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#ifndef SIGNEMODIFICATION_H
#define SIGNEMODIFICATION_H

//(*Headers(SigneModification)
#include <wx/sizer.h>
#include <wx/radiobox.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class SigneModification: public wxDialog
{
	public:

		SigneModification(wxWindow* parent);
		virtual ~SigneModification();

		//(*Declarations(SigneModification)
		wxButton* OkBt;
		wxStaticBitmap* StaticBitmap1;
		wxRadioBox* SigneRadio;
		wxHyperlinkCtrl* helpBt;
		//*)

	protected:

		//(*Identifiers(SigneModification)
		static const long ID_RADIOBOX1;
		static const long ID_STATICBITMAP2;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(SigneModification)
		void OnOkBtClick(wxCommandEvent& event);
		void OnhelpBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif

