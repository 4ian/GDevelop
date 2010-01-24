/**
 * Game Develop
 *    Editor
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Permet de choisir entre plusieurs "objets".
 *  Plus précisement, entre plusieurs "positions intiales".
 */

#include "MiniChoixObjet.h"

//(*InternalHeaders(MiniChoixObjet)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <sstream>
#include <string>
#include <vector>
#include <wx/log.h>
#include "GDL/Position.h"
#include "GDL/StdAlgo.h"
#include <stdexcept>

using namespace std;

//(*IdInit(MiniChoixObjet)
const long MiniChoixObjet::ID_LISTBOX1 = wxNewId();
const long MiniChoixObjet::ID_BUTTON2 = wxNewId();
const long MiniChoixObjet::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(MiniChoixObjet,wxDialog)
	//(*EventTable(MiniChoixObjet)
	//*)
END_EVENT_TABLE()

MiniChoixObjet::MiniChoixObjet(wxWindow* parent, vector < int > num, vector < InitialPosition > pPositions)
{
	//(*Initialize(MiniChoixObjet)
	wxBoxSizer* BoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Choisissez un objet à éditer"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	ListBox1 = new wxListBox(this, ID_LISTBOX1, wxDefaultPosition, wxSize(132,152), 0, 0, 0, wxDefaultValidator, _T("ID_LISTBOX1"));
	FlexGridSizer1->Add(ListBox1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	OkBt = new wxButton(this, ID_BUTTON2, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	BoxSizer1->Add(OkBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON1, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	BoxSizer1->Add(AnnulerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(BoxSizer1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_LISTBOX1,wxEVT_COMMAND_LISTBOX_SELECTED,(wxObjectEventFunction)&MiniChoixObjet::OnListBox1Select);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&MiniChoixObjet::OnOkBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&MiniChoixObjet::OnAnnulerBtClick);
	//*)



	for ( int i = 0;i < num.size();i++)
	{
	    try
	    {
            string Xstring = st(static_cast<int>(pPositions.at(num.at(i)).x));
            string Ystring = st(static_cast<int>(pPositions.at(num.at(i)).y));
            ListBox1->Append(pPositions.at(num.at(i)).objectName+ " ( X:"+ Xstring + " Y:"+ Ystring + " )");
	    }
	    catch ( const std::out_of_range & )
	    {
	        wxLogError(_("Erreur lors de l'affichage des objets à choisir.\n Ceci peut être du à un bug de Game Develop.\nMerci de vous reporter à l'aide pour savoir comment nous reporter les bugs"));
        }
	}

	Selected = -1;
}

MiniChoixObjet::~MiniChoixObjet()
{
	//(*Destroy(MiniChoixObjet)
	//*)
}


void MiniChoixObjet::OnOkBtClick(wxCommandEvent& event)
{
    if ( Selected != -1 ) { EndModal(1); }
    else { EndModal(0); }
}

void MiniChoixObjet::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void MiniChoixObjet::OnListBox1Select(wxCommandEvent& event)
{
    Selected = event.GetInt();
}

void MiniChoixObjet::OnAucunBtClick(wxCommandEvent& event)
{
    Selected = -1;
    EndModal(1);
}
