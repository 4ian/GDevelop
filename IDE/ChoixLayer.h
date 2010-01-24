#ifndef CHOIXLAYER_H
#define CHOIXLAYER_H

//(*Headers(ChoixLayer)
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

class ChoixLayer: public wxDialog
{
	public:

		ChoixLayer(wxWindow* parent, vector < Layer > & layers);
		virtual ~ChoixLayer();

		//(*Declarations(ChoixLayer)
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

		//(*Identifiers(ChoixLayer)
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

		//(*Handlers(ChoixLayer)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
