#if defined(GD_IDE_ONLY)
#ifndef CHOIXDOSSIER_H
#define CHOIXDOSSIER_H

//(*Headers(ChoixDossier)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/menu.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/Dossier.h"

#include <string>
#include <vector>

using namespace std;

class GD_API ChoixDossier: public wxDialog
{
	public:

		ChoixDossier(wxWindow* parent, vector < Dossier > * pDossiers);
		virtual ~ChoixDossier();

		//(*Declarations(ChoixDossier)
		wxButton* ToutesImagesBt;
		wxButton* ChoisirBt;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxMenu ContextMenu;
		wxStaticLine* StaticLine2;
		wxStaticLine* StaticLine1;
		wxTreeCtrl* TreeCtrl1;
		wxStaticBitmap* StaticBitmap3;
		//*)

		vector < Dossier > * dossiers;
		string dossierNom;

	protected:

		//(*Identifiers(ChoixDossier)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_TREECTRL1;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON2;
		static const long ID_BUTTON1;
		static const long idMenuAdd;
		static const long idMenuDel;
		//*)

	private:

		//(*Handlers(ChoixDossier)
		void OnChoisirBtClick(wxCommandEvent& event);
		void OnTreeCtrl1SelectionChanged(wxTreeEvent& event);
		void OnToutesImagesBtClick(wxCommandEvent& event);
		void OnAddDossierBtClick(wxCommandEvent& event);
		void OnDelDossierSelected(wxCommandEvent& event);
		void OnTreeCtrl1ItemRightClick(wxTreeEvent& event);
		//*)

		void Refresh();
		wxTreeItemId itemSelected;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
