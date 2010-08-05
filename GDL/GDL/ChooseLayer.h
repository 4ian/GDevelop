#if defined(GDE)
#ifndef CHOIXLAYER_H
#define CHOIXLAYER_H

//(*Headers(ChooseLayer)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/listbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/Layer.h"
#include <string>
#include <vector>

using namespace std;

class GD_API ChooseLayer: public wxDialog
{
	public:

		ChooseLayer(wxWindow* parent, vector < Layer > & layers, bool addQuotes_ = true);
		virtual ~ChooseLayer();

		//(*Declarations(ChooseLayer)
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxButton* cancelBt;
		wxStaticLine* StaticLine2;
		wxListBox* layersList;
		wxStaticLine* StaticLine1;
		wxButton* okBt;
		wxStaticBitmap* StaticBitmap3;
		//*)

		string layerChosen;

	protected:

		//(*Identifiers(ChooseLayer)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_LISTBOX1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(ChooseLayer)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		//*)
        bool addQuotes;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
