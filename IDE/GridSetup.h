#ifndef GRIDSETUP_H
#define GRIDSETUP_H

//(*Headers(GridSetup)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class GridSetup: public wxDialog
{
	public:

		GridSetup(wxWindow* parent, int & width, int & height, bool & snap_, int & r_, int & g_, int & b_);
		virtual ~GridSetup();

		//(*Declarations(GridSetup)
		wxTextCtrl* widthEdit;
		wxStaticText* StaticText6;
		wxTextCtrl* heightEdit;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxPanel* colorPanel;
		wxStaticText* StaticText5;
		wxStaticLine* StaticLine1;
		wxStaticText* StaticText4;
		wxButton* okBt;
		wxCheckBox* snapCheck;
		//*)
		int & gridWidth;
		int & gridHeight;
		bool & snap;
		int & r;
		int & g;
		int & b;

	protected:

		//(*Identifiers(GridSetup)
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT4;
		static const long ID_STATICTEXT5;
		static const long ID_TEXTCTRL3;
		static const long ID_STATICTEXT6;
		static const long ID_CHECKBOX1;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(GridSetup)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OncolorPanelLeftUp(wxMouseEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
