#ifndef ADVANCEDPASTEDLG_H
#define ADVANCEDPASTEDLG_H

//(*Headers(AdvancedPasteDlg)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/spinctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class AdvancedPasteDlg: public wxDialog
{
	public:

		AdvancedPasteDlg(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~AdvancedPasteDlg();

        void SetStartX(float xStart);
        void SetStartY(float xStart);
        void SetXGap(float xStart);
        void SetYGap(float xStart);

		float GetStartX() const;
		float GetStartY() const;
		unsigned int GetXCount() const;
		unsigned int GetYCount() const;
		float GetXGap() const;
		float GetYGap() const;
		float GetRotationIncrementation() const;

		//(*Declarations(AdvancedPasteDlg)
		wxTextCtrl* yGapEdit;
		wxStaticText* StaticText9;
		wxSpinCtrl* xCountEdit;
		wxStaticText* StaticText2;
		wxTextCtrl* xStartEdit;
		wxStaticText* StaticText6;
		wxStaticText* StaticText8;
		wxStaticText* StaticText11;
		wxTextCtrl* rotationEdit;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxTextCtrl* yStartEdit;
		wxStaticLine* StaticLine1;
		wxSpinCtrl* yCountEdit;
		wxTextCtrl* xGapEdit;
		wxStaticText* StaticText4;
		wxButton* okBt;
		//*)

	protected:

		//(*Identifiers(AdvancedPasteDlg)
		static const long ID_STATICTEXT9;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT11;
		static const long ID_TEXTCTRL3;
		static const long ID_STATICTEXT1;
		static const long ID_SPINCTRL1;
		static const long ID_STATICTEXT2;
		static const long ID_SPINCTRL2;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL4;
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL5;
		static const long ID_STATICTEXT8;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT5;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(AdvancedPasteDlg)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif

