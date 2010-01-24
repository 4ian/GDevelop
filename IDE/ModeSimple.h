#ifndef MODESIMPLE_H
#define MODESIMPLE_H

//(*Headers(ModeSimple)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class ModeSimple: public wxDialog
{
	public:

		ModeSimple(wxWindow* parent);
		virtual ~ModeSimple();

		//(*Declarations(ModeSimple)
		wxButton* OkBt;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxStaticLine* StaticLine2;
		wxStaticLine* StaticLine1;
		wxCheckBox* ModeSimpleCheck;
		wxButton* AnnulerBt;
		wxStaticBitmap* StaticBitmap3;
		//*)

	protected:

		//(*Identifiers(ModeSimple)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT3;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_CHECKBOX1;
		static const long ID_STATICTEXT1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(ModeSimple)
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnOkBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
