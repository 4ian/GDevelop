#ifndef PORTABLE_H
#define PORTABLE_H

//(*Headers(Portable)
#include <wx/sizer.h>
#include <wx/stattext.h>
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

class Portable: public wxDialog
{
	public:

		Portable(wxWindow* parent, Game * pJeu);
		virtual ~Portable();

		//(*Declarations(Portable)
		wxStaticText* StaticText2;
		wxButton* FermerBt;
		wxStaticBitmap* StaticBitmap1;
		wxButton* FusionBt;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticLine* StaticLine2;
		wxGauge* AvancementGauge;
		wxStaticLine* StaticLine1;
		//*)

		Game * jeu;

	protected:

		//(*Identifiers(Portable)
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_GAUGE1;
		static const long ID_STATICLINE2;
		static const long ID_STATICTEXT2;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(Portable)
		void OnButton2Click(wxCommandEvent& event);
		void OnButton1Click(wxCommandEvent& event);
		//*)

        string CopyAndReduceFileName( string file, string rep );

		DECLARE_EVENT_TABLE()
};

#endif

