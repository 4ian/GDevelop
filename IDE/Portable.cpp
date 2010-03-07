#ifdef DEBUG
#include "nommgr.h"
#endif

//(*InternalHeaders(Portable)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <string>
#include <vector>
#include <wx/dirdlg.h>
#include <wx/log.h>

#include "Portable.h"
#include "GDL/Game.h"
#include "GDL/OpenSaveGame.h"

#ifdef DEBUG

#endif

using namespace std;

//(*IdInit(Portable)
const long Portable::ID_STATICBITMAP1 = wxNewId();
const long Portable::ID_STATICTEXT1 = wxNewId();
const long Portable::ID_PANEL1 = wxNewId();
const long Portable::ID_STATICLINE1 = wxNewId();
const long Portable::ID_GAUGE1 = wxNewId();
const long Portable::ID_STATICLINE2 = wxNewId();
const long Portable::ID_STATICTEXT2 = wxNewId();
const long Portable::ID_BUTTON1 = wxNewId();
const long Portable::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(Portable,wxDialog)
	//(*EventTable(Portable)
	//*)
END_EVENT_TABLE()

Portable::Portable(wxWindow* parent, Game * pJeu) :
jeu(pJeu)
{
	//(*Initialize(Portable)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Enregistrer le jeu en version portable"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	wxIcon FrameIcon;
	FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/portableicon.png"))));
	SetIcon(FrameIcon);
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap1 = new wxStaticBitmap(Panel1, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/portable.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP1"));
	FlexGridSizer6->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Enregistrer le jeu en version portable permet de\nrassembler toutes les ressources du jeu dans un dossier\net d\'ouvrir ce jeu depuis un autre ordinateur."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Avancement"));
	AvancementGauge = new wxGauge(this, ID_GAUGE1, 100, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_GAUGE1"));
	StaticBoxSizer1->Add(AvancementGauge, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Il est préférable d\'utiliser un dossier vierge."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FusionBt = new wxButton(this, ID_BUTTON1, _("Choisir un dossier et enregistrer"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(FusionBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FermerBt = new wxButton(this, ID_BUTTON2, _("Fermer"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(FermerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Portable::OnButton1Click);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Portable::OnButton2Click);
	//*)
}

Portable::~Portable()
{
	//(*Destroy(Portable)
	//*)
}


void Portable::OnButton2Click(wxCommandEvent& event)
{
    EndModal(0);
}

void Portable::OnButton1Click(wxCommandEvent& event)
{

    wxDirDialog dialog(this, _("Choisissez le répertoire où sera rassemblé le jeu"));
    dialog.ShowModal();

    string rep = static_cast<string> ( dialog.GetPath() );
    if ( rep == "" ) return;

    //Copie du jeu
    Game Jeu = *jeu;

    //Image du chargement
    if ( Jeu.loadingScreen.imageFichier != "" )
        Jeu.loadingScreen.imageFichier = CopyAndReduceFileName(Jeu.loadingScreen.imageFichier, rep);

    //Images : copie et enlève le répertoire des chemins
    for ( unsigned int i = 0;i < Jeu.images.size() ;i++ )
    {
        Jeu.images.at( i ).fichier = CopyAndReduceFileName(Jeu.images.at( i ).fichier, rep); //Pour chaque image
        AvancementGauge->SetValue(i/Jeu.images.size()*100/3);
        wxSafeYield();
    }

    for ( unsigned int i = 0;i < Jeu.scenes.size();i++ )
    {
        for ( unsigned int j = 0;j < Jeu.scenes[i]->events.size() ;j++ )
        {
            for ( unsigned int k = 0;k < Jeu.scenes[i]->events.at( j ).actions.size() ;k++ )
            {
                if ( Jeu.scenes[i]->events.at( j ).actions.at( k ).GetType() == "PlaySound" || Jeu.scenes[i]->events.at( j ).actions.at( k ).GetType() == "PlaySoundCanal" )
                {
                    StaticText2->SetLabel( Jeu.scenes[i]->events.at( j ).actions.at( k ).GetParameter( 0 ).GetPlainString() );
                    //Copie et réduction du nom des sons
                    Jeu.scenes[i]->events.at( j ).actions.at( k ).SetParameter( 0, CopyAndReduceFileName( Jeu.scenes[i]->events.at( j ).actions.at( k ).GetParameter( 0 ).GetPlainString(), rep ));
                }
                if ( Jeu.scenes[i]->events.at( j ).actions.at( k ).GetType() == "PlayMusic" || Jeu.scenes[i]->events.at( j ).actions.at( k ).GetType() == "PlayMusicCanal" )
                {
                    StaticText2->SetLabel( Jeu.scenes[i]->events.at( j ).actions.at( k ).GetParameter( 0 ).GetPlainString() );
                    //Copie et réduction du nom des musiques
                    Jeu.scenes[i]->events.at( j ).actions.at( k ).SetParameter( 0, CopyAndReduceFileName( Jeu.scenes[i]->events.at( j ).actions.at( k ).GetParameter( 0 ).GetPlainString(), rep ));
                }
                if ( Jeu.scenes[i]->events.at( j ).actions.at( k ).GetType() == "EcrireTexte" )
                {
                    if ( Jeu.scenes[i]->events.at( j ).actions.at( k ).GetParameter( 5 ).GetPlainString() != "" )
                    {

                        StaticText2->SetLabel( Jeu.scenes[i]->events.at( j ).actions.at( k ).GetParameter( 5 ).GetPlainString() );
                        //Copie et réduction du nom des musiques
                        Jeu.scenes[i]->events.at( j ).actions.at( k ).SetParameter( 5, CopyAndReduceFileName( Jeu.scenes[i]->events.at( j ).actions.at( k ).GetParameter( 5 ).GetPlainString(), rep ));
                    }
                }
            }
        }
        wxSafeYield();
        AvancementGauge->SetValue(i/Jeu.scenes.size()*100/3+33);
    }

    wxSafeYield();
    Jeu.portable = true;
    OpenSaveGame saveGame(Jeu);
    saveGame.SaveToFile(rep+"/Game.gdg");

    Jeu.portable = false;

    AvancementGauge->SetValue(100);
    wxLogMessage(_("Le jeu est disponible dans le répertoire choisi sous le nom de Game.gdg ."));
}

string Portable::CopyAndReduceFileName( string file, string rep )
{
    string Complet = file;
    string FileName = static_cast<string>( wxFileNameFromPath( Complet ) );

    if ( wxCopyFile( Complet, rep+"/" + FileName, true ) == false ) //Copie
    {
        string error = ( string )_( "Erreur lors de la copie de" ) + Complet + ( string )_( "\n. Des fichiers risquent de manquer." );

        wxLogError( error.c_str() );
    }

    return FileName; //Changement du nom
}
