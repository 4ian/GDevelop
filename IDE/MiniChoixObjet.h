#ifndef MINICHOIXOBJET_H
#define MINICHOIXOBJET_H

//(*Headers(MiniChoixObjet)
#include <wx/sizer.h>
#include <wx/listbox.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

#include "GDL/Position.h"
#include <string>
#include <vector>

using namespace std;

class MiniChoixObjet: public wxDialog
{
	public:

		MiniChoixObjet(wxWindow* parent, vector < int > num, vector < InitialPosition > pPositions);
		virtual ~MiniChoixObjet();

		//(*Declarations(MiniChoixObjet)
		wxButton* OkBt;
		wxButton* AnnulerBt;
		wxListBox* ListBox1;
		//*)

		int Selected;

	protected:

		//(*Identifiers(MiniChoixObjet)
		static const long ID_LISTBOX1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(MiniChoixObjet)
		void OnOkBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnListBox1Select(wxCommandEvent& event);
		void OnAucunBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
