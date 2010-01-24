#ifndef CONVERTJRC_H
#define CONVERTJRC_H

//(*Headers(ConvertJRC)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/button.h>
#include <wx/dialog.h>
#include <wx/gauge.h>
//*)
#include "GDL/Game.h"

class ConvertJRC: public wxDialog
{
	public:

		ConvertJRC(wxWindow* parent, Game * pJeu);
		virtual ~ConvertJRC();

		//(*Declarations(ConvertJRC)
		wxStaticText* StaticText2;
		wxButton* FermerBt;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxGauge* AvancementGauge;
		wxButton* ConvertirBt;
		wxButton* ChoisirJeuBt;
		wxButton* AideBt;
		//*)

		Game * jeu;
		string file;

	protected:

		//(*Identifiers(ConvertJRC)
		static const long ID_STATICTEXT1;
		static const long ID_STATICTEXT2;
		static const long ID_BUTTON1;
		static const long ID_GAUGE1;
		static const long ID_STATICTEXT3;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		static const long ID_BUTTON4;
		//*)

	private:

		//(*Handlers(ConvertJRC)
		void OnFermerBtClick(wxCommandEvent& event);
		void OnChoisirJeuBtClick(wxCommandEvent& event);
		void OnConvertirBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
