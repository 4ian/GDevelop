#ifndef FUSION_H
#define FUSION_H

//(*Headers(Fusion)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/Game.h"
#include "GDL/OpenSaveGame.h"
#include <string>
#include <vector>

using namespace std;

class Fusion: public wxDialog
{
	public:

		Fusion(wxWindow* parent, Game & game_);
		virtual ~Fusion();

		//(*Declarations(Fusion)
		wxStaticText* StaticText2;
		wxButton* FermerBt;
		wxCheckBox* ScenesCheck;
		wxStaticBitmap* StaticBitmap1;
		wxButton* FusionBt;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticLine* StaticLine2;
		wxStaticLine* StaticLine1;
		wxCheckBox* ImageCheck;
		//*)

	protected:

		//(*Identifiers(Fusion)
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_CHECKBOX1;
		static const long ID_CHECKBOX2;
		static const long ID_STATICLINE2;
		static const long ID_STATICTEXT2;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(Fusion)
		void OnFermerBtClick(wxCommandEvent& event);
		void OnFusionBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()

		Game & game;
};

#endif
