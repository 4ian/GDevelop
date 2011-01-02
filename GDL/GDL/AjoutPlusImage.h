/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GDE)
#ifndef AJOUTPLUSIMAGE_H
#define AJOUTPLUSIMAGE_H

//(*Headers(AjoutPlusImage)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <string>
#include <vector>

using namespace std;

class AjoutPlusImage: public wxDialog
{
	public:

		AjoutPlusImage(wxWindow* parent);
		virtual ~AjoutPlusImage();

		//(*Declarations(AjoutPlusImage)
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticLine* StaticLine1;
		wxButton* AnnulerBt;
		wxButton* AddImageBt;
		wxStaticBitmap* StaticBitmap3;
		wxTextCtrl* ImagesEdit;
		//*)

		vector < string>  ImagesToAdd;

	protected:

		//(*Identifiers(AjoutPlusImage)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_TEXTCTRL1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(AjoutPlusImage)
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnButton1Click(wxCommandEvent& event);
		void OnAddImageBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
#endif
