
#ifdef DEBUG
#include "nommgr.h"
#endif

//(*InternalHeaders(Compilation)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/textctrl.h>
#include <wx/icon.h>
#include <wx/image.h>
#include <wx/bitmap.h>
#include <wx/filefn.h>
#include <wx/log.h>
#include <wx/msgdlg.h>
#include <wx/dir.h>
#include <wx/help.h>
#include <wx/config.h>
#include <wx/dirdlg.h>
#include <wx/filedlg.h>
#include <wx/msgdlg.h>
#include <wx/filename.h>
#include <string>
#include <vector>
#include <iostream>
#include <fstream>

#include "GDL/AES.h"
#include "GDL/Game.h"
#include "GDL/DatFile.h"
#include "GDL/OpenSaveLoadingScreen.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/ResourcesMergingHelper.h"
#include "GDL/ExtensionsManager.h"
#include "Compilation.h"
#include "ErrorCompilation.h"
#include "GDL/HelpFileAccess.h"

#ifdef ___WXMSW___
#include <wx/msw/winundef.h>
#endif



using namespace std;

//(*IdInit(Compilation)
const long Compilation::ID_STATICBITMAP3 = wxNewId();
const long Compilation::ID_STATICTEXT1 = wxNewId();
const long Compilation::ID_PANEL1 = wxNewId();
const long Compilation::ID_STATICLINE1 = wxNewId();
const long Compilation::ID_STATICTEXT4 = wxNewId();
const long Compilation::ID_RADIOBOX1 = wxNewId();
const long Compilation::ID_BUTTON8 = wxNewId();
const long Compilation::ID_PANEL5 = wxNewId();
const long Compilation::ID_STATICTEXT5 = wxNewId();
const long Compilation::ID_STATICBITMAP1 = wxNewId();
const long Compilation::ID_CHECKBOX1 = wxNewId();
const long Compilation::ID_STATICBITMAP2 = wxNewId();
const long Compilation::ID_CHECKBOX2 = wxNewId();
const long Compilation::ID_BUTTON9 = wxNewId();
const long Compilation::ID_PANEL2 = wxNewId();
const long Compilation::ID_STATICTEXT6 = wxNewId();
const long Compilation::ID_BUTTON1 = wxNewId();
const long Compilation::ID_GAUGE1 = wxNewId();
const long Compilation::ID_STATICTEXT2 = wxNewId();
const long Compilation::ID_STATICTEXT3 = wxNewId();
const long Compilation::ID_PANEL3 = wxNewId();
const long Compilation::ID_STATICTEXT7 = wxNewId();
const long Compilation::ID_BUTTON3 = wxNewId();
const long Compilation::ID_BUTTON7 = wxNewId();
const long Compilation::ID_BUTTON5 = wxNewId();
const long Compilation::ID_PANEL4 = wxNewId();
const long Compilation::ID_NOTEBOOK1 = wxNewId();
const long Compilation::ID_STATICLINE2 = wxNewId();
const long Compilation::ID_BUTTON4 = wxNewId();
const long Compilation::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE( Compilation, wxDialog )
    //(*EventTable(Compilation)
    //*)
END_EVENT_TABLE()

Compilation::Compilation( wxWindow* parent, Game * jeu )
{
    //(*Initialize(Compilation)
    wxStaticBoxSizer* StaticBoxSizer2;
    wxFlexGridSizer* FlexGridSizer4;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer9;
    wxFlexGridSizer* FlexGridSizer2;
    wxFlexGridSizer* FlexGridSizer7;
    wxStaticBoxSizer* StaticBoxSizer3;
    wxFlexGridSizer* FlexGridSizer8;
    wxFlexGridSizer* FlexGridSizer6;
    wxStaticBoxSizer* StaticBoxSizer1;
    wxFlexGridSizer* FlexGridSizer1;
    wxFlexGridSizer* FlexGridSizer17;

    Create(parent, wxID_ANY, _("Compilation du jeu"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
    wxIcon FrameIcon;
    FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/compil.png"))));
    SetIcon(FrameIcon);
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(1);
    FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer17->AddGrowableCol(0);
    Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
    FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/compilation.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP3"));
    FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("La compilation permet de rassembler \ntous les éléments de votre jeu de façon \nà pouvoir le distribuer.\nLes futurs joueurs n\'auront pas besoin \nde posséder Game Develop."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
    FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    Panel1->SetSizer(FlexGridSizer6);
    FlexGridSizer6->SetSizeHints(Panel1);
    FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxSize(353,244), 0, _T("ID_NOTEBOOK1"));
    Panel5 = new wxPanel(Notebook1, ID_PANEL5, wxPoint(6,4), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL5"));
    FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer7->AddGrowableCol(0);
    FlexGridSizer7->AddGrowableRow(2);
    StaticText4 = new wxStaticText(Panel5, ID_STATICTEXT4, _("Game Develop vous propose deux types de compilation :\n\n-La compilation simple créé un dossier rassemblant les ressources \n( images, sons... ) du jeu et l\'executable.\n\n-La compilation en un fichier unique rassemble votre jeu en un fichier\nunique, qui contient l\'ensemble du jeu."), wxDefaultPosition, wxSize(344,104), 0, _T("ID_STATICTEXT4"));
    FlexGridSizer7->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    wxString __wxRadioBoxChoices_1[2] =
    {
    	_("Simple ( dossier contenant jeu et ressources )"),
    	_("Fichier exécutable unique ( compressé )")
    };
    TypeBox = new wxRadioBox(Panel5, ID_RADIOBOX1, _("Choisissez le type de compilation :"), wxPoint(16,32), wxSize(340,64), 2, __wxRadioBoxChoices_1, 1, 0, wxDefaultValidator, _T("ID_RADIOBOX1"));
    FlexGridSizer7->Add(TypeBox, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Button4 = new wxButton(Panel5, ID_BUTTON8, _("Suivant"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON8"));
    FlexGridSizer7->Add(Button4, 1, wxALL|wxALIGN_RIGHT|wxALIGN_BOTTOM, 5);
    Panel5->SetSizer(FlexGridSizer7);
    FlexGridSizer7->Fit(Panel5);
    FlexGridSizer7->SetSizeHints(Panel5);
    Panel2 = new wxPanel(Notebook1, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer5->AddGrowableCol(0);
    FlexGridSizer5->AddGrowableRow(2);
    StaticText5 = new wxStaticText(Panel2, ID_STATICTEXT5, _("Game Develop permet de générer votre jeu pour Microsoft Windows\net pour GNU/Linux. Notez cependant que la compilation en mode\n\"Fichier executable unique\" n\'est pas disponible pour GNU/Linux."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
    FlexGridSizer5->Add(StaticText5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Choisissez le(s) système(s) cible(s)"));
    FlexGridSizer8 = new wxFlexGridSizer(0, 2, 0, 0);
    StaticBitmap1 = new wxStaticBitmap(Panel2, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/win-logo.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP1"));
    FlexGridSizer8->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    WinCheck = new wxCheckBox(Panel2, ID_CHECKBOX1, _("Microsoft Windows"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
    WinCheck->SetValue(true);
    FlexGridSizer8->Add(WinCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBitmap2 = new wxStaticBitmap(Panel2, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/linux-logo.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP2"));
    FlexGridSizer8->Add(StaticBitmap2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    LinuxCheck = new wxCheckBox(Panel2, ID_CHECKBOX2, _("GNU/Linux"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
    LinuxCheck->SetValue(true);
    FlexGridSizer8->Add(LinuxCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer1->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer5->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Button5 = new wxButton(Panel2, ID_BUTTON9, _("Suivant"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON9"));
    FlexGridSizer5->Add(Button5, 1, wxALL|wxALIGN_RIGHT|wxALIGN_BOTTOM, 5);
    Panel2->SetSizer(FlexGridSizer5);
    FlexGridSizer5->Fit(Panel2);
    FlexGridSizer5->SetSizeHints(Panel2);
    Panel3 = new wxPanel(Notebook1, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
    FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    StaticText6 = new wxStaticText(Panel3, ID_STATICTEXT6, _("Game Develop est prêt à générer votre jeu !\nCliquez sur \"Lancer la compilation\", choisissez le répertoire ou le fichier\noù enregistrer votre jeu, et patientez jusqu\'à la fin du processus."), wxDefaultPosition, wxSize(344,39), 0, _T("ID_STATICTEXT6"));
    FlexGridSizer2->Add(StaticText6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    CompilBt = new wxButton(Panel3, ID_BUTTON1, _("Lancer la compilation"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer2->Add(CompilBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer2 = new wxStaticBoxSizer(wxVERTICAL, Panel3, _("Avancement"));
    FlexGridSizer9 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer9->AddGrowableCol(0);
    FlexGridSizer9->AddGrowableRow(0);
    AvancementGauge = new wxGauge(Panel3, ID_GAUGE1, 100, wxDefaultPosition, wxSize(238,28), 0, wxDefaultValidator, _T("ID_GAUGE1"));
    FlexGridSizer9->Add(AvancementGauge, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText2 = new wxStaticText(Panel3, ID_STATICTEXT2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer9->Add(StaticText2, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
    StaticText3 = new wxStaticText(Panel3, ID_STATICTEXT3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
    FlexGridSizer9->Add(StaticText3, 1, wxTOP|wxLEFT|wxRIGHT|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
    StaticBoxSizer2->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer2->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel3->SetSizer(FlexGridSizer2);
    FlexGridSizer2->Fit(Panel3);
    FlexGridSizer2->SetSizeHints(Panel3);
    Panel4 = new wxPanel(Notebook1, ID_PANEL4, wxPoint(205,2), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL4"));
    FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer4->AddGrowableCol(0);
    StaticText7 = new wxStaticText(Panel4, ID_STATICTEXT7, _("La compilation est terminée. \nSi Game Develop ne vous a rapporté  aucune erreur,  vous pouvez \nretrouver votre jeu dans le dossier suivant :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
    FlexGridSizer4->Add(StaticText7, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    OuvrirBt = new wxButton(Panel4, ID_BUTTON3, _("Ouvrir le dossier contenant le jeu"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
    FlexGridSizer4->Add(OuvrirBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer3 = new wxStaticBoxSizer(wxVERTICAL, Panel4, _("Découvrez maintenant comment..."));
    DistribuerBt = new wxButton(Panel4, ID_BUTTON7, _("Distribuer votre jeu"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON7"));
    StaticBoxSizer3->Add(DistribuerBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    CGShareBt = new wxButton(Panel4, ID_BUTTON5, _("L\'inscrire sur Compil Games Share"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON5"));
    StaticBoxSizer3->Add(CGShareBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer4->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel4->SetSizer(FlexGridSizer4);
    FlexGridSizer4->Fit(Panel4);
    FlexGridSizer4->SetSizeHints(Panel4);
    Notebook1->AddPage(Panel5, _("Type de compilation"), false);
    Notebook1->AddPage(Panel2, _("Système cible"), false);
    Notebook1->AddPage(Panel3, _("Lancement"), false);
    Notebook1->AddPage(Panel4, _("Finalisation"), false);
    FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    AideBt = new wxButton(this, ID_BUTTON4, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
    FlexGridSizer3->Add(AideBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    FermerBt = new wxButton(this, ID_BUTTON2, _("Fermer"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    FlexGridSizer3->Add(FermerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    FlexGridSizer1->Fit(this);
    FlexGridSizer1->SetSizeHints(this);
    Center();

    Connect(ID_RADIOBOX1,wxEVT_COMMAND_RADIOBOX_SELECTED,(wxObjectEventFunction)&Compilation::OnTypeBoxSelect);
    Connect(ID_BUTTON8,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnNext1Click);
    Connect(ID_BUTTON9,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnNext2Click);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnCompilBtClick);
    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnOuvrirBtClick);
    Connect(ID_BUTTON7,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnDistribuerBtClick);
    Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnCGShareBtClick);
    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnAideBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnFermerBtClick);
    //*)

    m_jeu = jeu;

    Panel4->Enable(false);
}

Compilation::~Compilation()
{
    //(*Destroy(Compilation)
    //*)
}


void Compilation::OnFermerBtClick( wxCommandEvent& event )
{
    EndModal( 0 );
}

void Compilation::OnCompilBtClick( wxCommandEvent& event )
{
    wxLogNull PasDeLog; //On s'occupe nous même de la gestion des erreurs de copie
    wxString repTemp = GetTempDir();
    string report;

    if ( TypeBox->GetSelection() == 0 )
    {
        wxDirDialog dialog(this, _("Choisissez un dossier, vierge de préférence, où créer votre jeu."));
        dialog.ShowModal();
        if ( dialog.GetPath() == "" )
        {
            wxMessageBox(_("Vous devez choisir un répertoire où créer votre jeu."), _("Compilation annulée"));
            return;
        }
        dirFinal = dialog.GetPath();
    }
    else
    {
        wxFileDialog dialog(this, _("Enregistrer le jeu final sous..."), "", _("MonJeu.exe"), "*.exe", wxFD_SAVE);
        dialog.ShowModal();
        if ( dialog.GetPath() == "" )
        {
            wxMessageBox(_("Vous devez choisir un fichier où créer votre jeu."), _("Compilation annulée"));
            return;
        }
        fileFinal = dialog.GetPath();
        dirFinal = dialog.GetDirectory();
    }

    PrepareTempDir(report); //Préparation du répertoire

    //Copie du jeu
    Game game = *m_jeu;

    StaticText3->SetLabel( "Copie des images..." );
    //Image du chargement
    if ( game.loadingScreen.imageFichier != "" )
    {
        StaticText2->SetLabel( Jeu.loadingScreen.imageFichier );
        game.loadingScreen.imageFichier = CopyAndReduceFileName( game.loadingScreen.imageFichier, report ); //Pour chaque image
    }

    //Prepare resources to copy
    ResourcesMergingHelper resourcesMergingHelper;
    resourcesMergingHelper.GetNewFilename("vide.png");

    StaticText3->SetLabel( "Préparation des ressources..." );
    for ( unsigned int i = 0;i < game.images.size() ;i++ ) //Add images
    {
        StaticText2->SetLabel( game.images[i].nom );
        game.images[i].fichier = resourcesMergingHelper.GetNewFilename(game.images[i].fichier);
    }

    for ( unsigned int i = 0;i < game.scenes.size();i++ )
    {
        for (unsigned int j = 0;j<game.scenes[i].initialObjects.size();++j)
        	game.scenes[i].initialObjects[j]->PrepareResourcesForMerging(resourcesMergingHelper);
    }
    for (unsigned int j = 0;j<game.globalObjects.size();++j)
        game.globalObjects[j]->PrepareResourcesForMerging(resourcesMergingHelper);

    //Copy ressources
    StaticText3->SetLabel( "Copie des ressources..." );
    map<string, string> & resourcesNewFilename = resourcesMergingHelper.GetAllResourcesNewFilename();
    for(map<string, string>::const_iterator it = resourcesNewFilename.begin(), unsigned int i = 0; it != resourcesNewFilename.end(); ++it, ++i)
    {
        wxCopyFile( resourcesNewFilename->first, repTemp + "/" + resourcesNewFilename->second, true ) == false )
            report += _( "Impossible de copier \""+resourcesNewFilename->first+"\" dans le répertoire de compilation.\n" );

        AvancementGauge->SetValue( i / static_cast<float>(resourcesNewFilename.size())*100.f / 3.f );
        wxSafeYield();
    }

    //Copy of sound and music of events
    StaticText3->SetLabel( "Copie des sons/musiques..." );
    for ( unsigned int i = 0;i < game.scenes.size();i++ )
    {
        CopyEventsRes(game, game.scenes[i]->events, report);
        AvancementGauge->SetValue( i / static_cast<float>(game.scenes.size())*100.f / 3.f + 33 );
    }

    wxSafeYield();
    StaticText3->SetLabel( "Compilation du jeu..." );
    StaticText2->SetLabel( "Etape 1 sur 3" );
    OpenSaveGame saveGame( game );
    saveGame.SaveToFile(static_cast<string>( repTemp + "/compil.gdg" ));
    AvancementGauge->SetValue(70);

    wxSafeYield();
    StaticText2->SetLabel( "Etape 2 sur 3" );

    //Création du fichier source
    {
        ifstream ifile(repTemp+"/compil.gdg",ios_base::binary);
        ofstream ofile(repTemp+"/src",ios_base::binary);

        // get file size
        ifile.seekg(0,ios_base::end);
        int size,fsize = ifile.tellg();
        ifile.seekg(0,ios_base::beg);

        // round up (ignore pad for here)
        size = (fsize+15)&(~15);

        char * ibuffer = new char[size];
        char * obuffer = new char[size];
        ifile.read(ibuffer,fsize);

        AES crypt;
        crypt.SetParameters(192);

        unsigned char key[] = "-P:j$4t&OHIUVM/Z+u4DeDP.";

        crypt.StartEncryption(key);
        crypt.Encrypt(reinterpret_cast<const unsigned char*>(ibuffer),reinterpret_cast<unsigned char*>(obuffer),size/16);

        ofile.write(obuffer,size);

        delete [] ibuffer;
        delete [] obuffer;

        ofile.close();
        ifile.close();
	}
    wxRemoveFile( repTemp + "/compil.gdg" );
    AvancementGauge->SetValue(80);

    OpenSaveLoadingScreen saveLS(game.loadingScreen);
    saveLS.SaveToFile(string(repTemp + "/loadingscreen"));

    //Création du fichier gam.egd
    StaticText2->SetLabel( "Etape 3 sur 3" );
    wxSafeYield();


    //On créé une liste avec tous les fichiers
    vector < string > files;
    {
        wxString file = wxFindFirstFile( repTemp + "/*" );
        while ( !file.empty() )
        {
            wxFileName filename(file);

            files.push_back( static_cast<string>(filename.GetFullName()) );
            file = wxFindNextFile();
        }
    }

    //On créé le fichier à partir des fichiers
    DatFile gameDatFile;
    gameDatFile.Create(files, static_cast<string>(repTemp), static_cast<string>(repTemp + "/gam.egd"));

    //On supprime maintenant tout le superflu
    {
        wxString file = wxFindFirstFile( repTemp + "/*" );
        while ( !file.empty() )
        {
            wxFileName filename(file);
            if ( filename.GetFullName() != "gam.egd" ) //On supprime tout sauf gam.egd
            {
                if ( !wxRemoveFile( file ) )
                    report += _( "Impossible de supprimer le fichier " + file + " situé dans le répertoire de compilation.\n" );
            }

            file = wxFindNextFile();
        }
    }

    AvancementGauge->SetValue(90);
    StaticText3->SetLabel( "Exportation du jeu..." );
    StaticText2->SetLabel( "" );
    wxSafeYield();

    //Copy extensions
    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
    for (unsigned int i = 0;i<game.extensionsUsed.size();++i)
    {
        //Builtin extensions does not have a namespace.
        boost::shared_ptr<ExtensionBase> extension = extensionsManager->GetExtension(game.extensionsUsed[i]);

        if ( extension != boost::shared_ptr<ExtensionBase>() &&
            ( extension->GetNameSpace() != "" || extension->GetName() == "CommonDialogs" )
            && extension->GetName() != "BuiltinCommonInstructions" ) //Extension with a namespace but builtin
        {
            if ( WinCheck->GetValue() &&
                wxCopyFile( "Extensions/"+game.extensionsUsed[i]+".xgdw", repTemp + "/" + game.extensionsUsed[i]+".xgdw", true ) == false )
                report += _( "Impossible de copier l'extension \""+game.extensionsUsed[i]+"\" pour Windows dans le répertoire de compilation.\n" );

            if ( LinuxCheck->GetValue() &&
                wxCopyFile( "Extensions/"+game.extensionsUsed[i]+".xgdl", repTemp + "/"+game.extensionsUsed[i]+".xgdl", true ) == false )
                report += _( "Impossible de copier l'extension \""+game.extensionsUsed[i]+"\" pour Linux dans le répertoire de compilation.\n" );
        }
    }

    //Copie des derniers fichiers
    if ( TypeBox->GetSelection() == 0 )
    {
        //Fichier pour windows
        if ( WinCheck->GetValue() )
        {
            if ( wxCopyFile( "Runtime/PlayWin.exe", repTemp + "/PlayWin.exe", true ) == false )
                report += _( "Impossible de créer l'executable Windows dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/gdl.dll", repTemp + "/gdl.dll", true ) == false )
                report += _( "Impossible de créer l'executable gdl.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "sfml-audio.dll", repTemp + "/sfml-audio.dll", true ) == false )
                report += _( "Impossible de créer l'executable sfml-audio.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "sfml-graphics.dll", repTemp + "/sfml-graphics.dll", true ) == false )
                report += _( "Impossible de créer l'executable sfml-graphics.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "sfml-network.dll", repTemp + "/sfml-network.dll", true ) == false )
                report += _( "Impossible de créer l'executable sfml-network.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "sfml-system.dll", repTemp + "/sfml-system.dll", true ) == false )
                report += _( "Impossible de créer l'executable sfml-system.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "sfml-window.dll", repTemp + "/sfml-window.dll", true ) == false )
                report += _( "Impossible de créer l'executable sfml-window.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "libsndfile-1.dll", repTemp + "/libsndfile-1.dll", true ) == false )
                report += _( "Impossible de copier libsndfile-1.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "openal32.dll", repTemp + "/openal32.dll", true ) == false )
                report += _( "Impossible de copier openal32.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "mingwm10.dll", repTemp + "/mingwm10.dll", true ) == false )
                report += _( "Impossible de copier mingwm10.dll dans le répertoire de compilation.\n" );

        }
        //Fichiers pour linux
        if ( LinuxCheck->GetValue() )
        {
            if ( wxCopyFile( "Runtime/ExeLinux", repTemp + "/ExeLinux", true ) == false )
                report += _( "Impossible de créer l'executable Linux dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/PlayLinux", repTemp + "/PlayLinux", true ) == false )
                report += _( "Impossible de créer le script executable Linux dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/libFLAC.so.7", repTemp + "/libFLAC.so.7", true ) == false )
                report += _( "Impossible de créer libFLAC.so.7 dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/libfreetype.so.6", repTemp + "/libfreetype.so.6", true ) == false )
                report += _( "Impossible de créer libfreetype.so.6 dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/libgdl.so", repTemp + "/libgdl.so", true ) == false )
                report += _( "Impossible de créer libgdl.so dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/libopenal.so.0", repTemp + "/libopenal.so.0", true ) == false )
                report += _( "Impossible de créer libopenal.so.0 dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/libsfml-audio.so.2.0", repTemp + "/libsfml-audio.so.2.0", true ) == false )
                report += _( "Impossible de créer libsfml-audio.so.2.0 dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/libsfml-graphics.so.2.0", repTemp + "/libsfml-graphics.so.2.0", true ) == false )
                report += _( "Impossible de créer libsfml-graphics.so.2.0 dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/libsfml-network.so.2.0", repTemp + "/libsfml-network.so.2.0", true ) == false )
                report += _( "Impossible de créer libsfml-network.so.2.0 dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/libsfml-system.so.2.0", repTemp + "/libsfml-system.so.2.0", true ) == false )
                report += _( "Impossible de créer libsfml-system.so.2.0 dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/libsfml-system.so.2.0", repTemp + "/libsfml-system.so.2.0", true ) == false )
                report += _( "Impossible de créer libsfml-system.so.2.0 dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/libsfml-window.so.2.0", repTemp + "/libsfml-window.so.2.0", true ) == false )
                report += _( "Impossible de créer libsfml-window.so.2.0 dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/libsndfile.so.1", repTemp + "/libsndfile.so.1", true ) == false )
                report += _( "Impossible de créer libsndfile.so.1 dans le répertoire de compilation.\n" );
        }

        //Copie du tout dans le répertoire final
        wxString file = wxFindFirstFile( repTemp + "/*" );
        while ( !file.empty() )
        {
            wxFileName fileName(file);
            if ( !wxCopyFile( file, dirFinal + "/" + fileName.GetFullName(), true ) )
                report += _( "Impossible de copier le fichier " + file + " depuis le répertoire de compilation vers le répertoire final.\n" );

            file = wxFindNextFile();
        }
    }
    else
    {
        if ( WinCheck->GetValue() )
        {
            if ( wxCopyFile( "Runtime/PlayWin.exe", repTemp + "/setup.exe", true ) == false )
                report += _( "Impossible de créer l'executable Windows dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "Runtime/gdl.dll", repTemp + "/gdl.dll", true ) == false )
                report += _( "Impossible de créer l'executable gdl.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "sfml-audio.dll", repTemp + "/sfml-audio.dll", true ) == false )
                report += _( "Impossible de créer l'executable sfml-audio.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "sfml-graphics.dll", repTemp + "/sfml-graphics.dll", true ) == false )
                report += _( "Impossible de créer l'executable sfml-graphics.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "sfml-network.dll", repTemp + "/sfml-network.dll", true ) == false )
                report += _( "Impossible de créer l'executable sfml-network.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "sfml-system.dll", repTemp + "/sfml-system.dll", true ) == false )
                report += _( "Impossible de créer l'executable sfml-system.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "sfml-window.dll", repTemp + "/sfml-window.dll", true ) == false )
                report += _( "Impossible de créer l'executable sfml-window.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "libsndfile-1.dll", repTemp + "/libsndfile-1.dll", true ) == false )
                report += _( "Impossible de copier libsndfile-1.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "openal32.dll", repTemp + "/openal32.dll", true ) == false )
                report += _( "Impossible de copier openal32.dll dans le répertoire de compilation.\n" );

            if ( wxCopyFile( "mingwm10.dll", repTemp + "/mingwm10.dll", true ) == false )
                report += _( "Impossible de copier mingwm10.dll dans le répertoire de compilation.\n" );


            //Compression en un seul fichier
            StaticText3->SetLabel( "Exportation du jeu... ( Compression )" );
            wxRemoveFile( "Mongame.exe" );
            wxArrayString arrStdOut, arrStdErr;
            wxExecute( _T( "7za.exe a -sfx7zS.sfx \""+ repTemp +"/Mongame.exe\" \"" + repTemp + "/*\"" ), arrStdOut, arrStdErr, wxEXEC_SYNC | wxEXEC_NOHIDE );

            for ( unsigned int i = 0;i < arrStdOut.GetCount() ;i++ )
            {
                wxString result = arrStdOut.Item( i );

                //Si la chaine n'est pas vide, et que ce n'est pas l'intro de 7zip
                if ( result != "" && result.Find( "7-zip" ) == wxNOT_FOUND )
                {
                    if ( result.Find( "WARNING" ) != wxNOT_FOUND )
                    {
                        report += _( "Un fichier n'a pas été trouvé lors de la compilation :\n" + result );
                    }
                }
            }

            //Copie du fichier
            if ( !wxCopyFile(repTemp + "/Mongame.exe", fileFinal) )
                report += _( "Impossible de copier le fichier Mongame.exe depuis le répertoire de compilation vers le répertoire final.\n" );

        }
        if ( LinuxCheck->GetValue() )
        {
            wxMessageBox( _( "La création d'un executable seul n'est pas disponible pour GNU/linux." ), _( "Non disponible" ), wxOK );
        }
    }

    StaticText3->SetLabel( "Compilation terminée" );
    StaticText2->SetLabel( "" );
    AvancementGauge->SetValue( 100 );

    if ( report != "" )
    {
        ErrorCompilation dialog( this, report );
        dialog.ShowModal();
    }
    Panel4->Enable(true);
    Notebook1->SetSelection(3);
}

string Compilation::CopyAndReduceFileName( string file, string & report )
{
    wxLogNull PasDeLog; //On s'occupe nous même de la gestion des erreurs de copie
    wxString repTemp = GetTempDir();

    string Complet = file;
    string FileName = static_cast<string>( wxFileNameFromPath( Complet ) );

    if ( wxCopyFile( Complet, repTemp + "/" + FileName, true ) == false ) //Copie
    {
        string error = ( string )_( "Erreur lors de la copie de" ) + Complet + "\n";

        report += error.c_str();
    }

    return FileName; //Changement du nom
}

void Compilation::OnOuvrirBtClick( wxCommandEvent& event )
{
    wxExecute("explorer.exe \""+dirFinal+"\"");
}

void Compilation::OnAideBtClick( wxCommandEvent& event )
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(125);
}

void Compilation::OnTypeBoxSelect( wxCommandEvent& event )
{
}


wxString Compilation::GetTempDir()
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    wxString * result = new wxString();

    pConfig->Read( _T( "/Dossier/Compilation" ), result );

    wxString repTemp = *result;
    if ( repTemp == "" ) //If the user has not forced a directory
    {
        repTemp = wxGetCwd();
        if ( !wxFileName::IsDirWritable(repTemp) )
            repTemp = wxFileName::GetHomeDir()+"/.Game Develop/";

        if ( !wxFileName::IsDirWritable(repTemp) )
            repTemp = wxFileName::GetHomeDir();

        if ( !wxFileName::IsDirWritable(repTemp) )
            wxMessageBox(_("Game Develop n'a pas réussi à trouver un répertoire temporaire pour la compilation.\nSi la compilation échoue, allez dans les préférences et choisissez un répertoire temporaire où vous avez les droits d'écriture."), _("La compilation risque d'échouer."), wxICON_EXCLAMATION);
    }

    return repTemp + "\\Compil";
}

void Compilation::OnNext1Click(wxCommandEvent& event)
{
    Notebook1->SetSelection(1);
}

void Compilation::OnNext2Click(wxCommandEvent& event)
{
    Notebook1->SetSelection(2);
}

void Compilation::CopyEventsRes(const Game & game, vector < BaseEventSPtr > & events, string & report)
{
    for ( unsigned int j = 0;j < events.size() ;j++ )
    {
        vector < vector<Instruction>* > allActionsVectors = events[j]->GetAllActionsVectors();
        for (unsigned int i = 0;i<allActionsVectors.size();++i)
        {
            for ( unsigned int k = 0;k < allActionsVectors[i]->size() ;k++ )
            {
                if ( allActionsVectors[i]->at( k ).GetType() == "PlaySound" || allActionsVectors[i]->at( k ).GetType() == "PlaySoundCanal" )
                {
                    StaticText2->SetLabel( allActionsVectors[i]->at( k ).GetParameter( 0 ).GetPlainString() );
                    //Copie et réduction du nom des sons
                    allActionsVectors[i]->at( k ).SetParameter( 0, CopyAndReduceFileName( allActionsVectors[i]->at( k ).GetParameter( 0 ).GetPlainString(), report ));
                }
                if ( allActionsVectors[i]->at( k ).GetType() == "PlayMusic" || allActionsVectors[i]->at( k ).GetType() == "PlayMusicCanal" )
                {
                    StaticText2->SetLabel( allActionsVectors[i]->at( k ).GetParameter( 0 ).GetPlainString() );
                    //Copie et réduction du nom des musiques
                    allActionsVectors[i]->at( k ).SetParameter( 0 , CopyAndReduceFileName( allActionsVectors[i]->at( k ).GetParameter( 0 ).GetPlainString(), report ));
                }
                if ( allActionsVectors[i]->at( k ).GetType() == "EcrireTexte" )
                {
                    if ( allActionsVectors[i]->at( k ).GetParameter( 5 ).GetPlainString() != "" )
                    {

                        StaticText2->SetLabel( allActionsVectors[i]->at( k ).GetParameter( 5 ).GetPlainString() );
                        //Copie et réduction du nom des musiques
                        allActionsVectors[i]->at( k ).SetParameter( 5, CopyAndReduceFileName( allActionsVectors[i]->at( k ).GetParameter( 5 ).GetPlainString(), report ));
                    }
                }
            }
        }

        if ( events.at(j)->CanHaveSubEvents() )
            CopyEventsRes(game, events.at(j)->GetSubEvents(), report);
    }
    wxSafeYield();

    return;
}

void Compilation::OnCGShareBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(192);
}

void Compilation::OnDistribuerBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(158);
}


////////////////////////////////////////////////////////////
/// Préparation du répertoire
///
/// Création et vidage du répertoire de compilation
////////////////////////////////////////////////////////////
void Compilation::PrepareTempDir(string & report)
{
    wxString repTemp = GetTempDir();

    if ( !wxDirExists( repTemp ) )
    {
        if ( !wxMkdir( repTemp ) )
            report += _( "Impossible de créer le répertoire de compilation : " + repTemp + "\n" );
    }

    {
        wxString file = wxFindFirstFile( repTemp + "/*" );
        while ( !file.empty() )
        {
            if ( !wxRemoveFile( file ) )
                report += _( "Impossible de supprimer le fichier " + file + " situé dans le répertoire de compilation.\n" );

            file = wxFindNextFile();
        }
    }
}
