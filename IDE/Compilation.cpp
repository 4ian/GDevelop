/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

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
#include "GDL/HelpFileAccess.h"
#include "GDL/ExternalEvents.h"
#include "Compilation.h"
#include "ErrorCompilation.h"
#include "GDL/FullProjectCompiler.h"

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
const long Compilation::ID_STATICBITMAP4 = wxNewId();
const long Compilation::ID_CHECKBOX3 = wxNewId();
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

Compilation::Compilation( wxWindow* parent, Game & gameToCompile_ ) :
    gameToCompile(gameToCompile_)
{
    //(*Initialize(Compilation)
    wxStaticBoxSizer* StaticBoxSizer2;
    wxFlexGridSizer* FlexGridSizer4;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer9;
    wxFlexGridSizer* FlexGridSizer2;
    wxFlexGridSizer* FlexGridSizer7;
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
    StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/compilation.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
    FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("La compilation permet de rassembler \ntous les éléments de votre jeu de façon \nà pouvoir le distribuer.\nLes futurs joueurs n\'auront pas besoin \nde posséder Game Develop."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
    FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    Panel1->SetSizer(FlexGridSizer6);
    FlexGridSizer6->SetSizeHints(Panel1);
    FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
    Panel5 = new wxPanel(Notebook1, ID_PANEL5, wxPoint(6,4), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL5"));
    FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer7->AddGrowableCol(0);
    FlexGridSizer7->AddGrowableRow(2);
    StaticText4 = new wxStaticText(Panel5, ID_STATICTEXT4, _("Game Develop vous propose deux types de compilation :\n\n-La compilation simple créé un dossier rassemblant les ressources \n( images, sons... ) du jeu et l\'executable.\n\n-La compilation en un fichier unique rassemble votre jeu en un fichier\nunique, qui contient l\'ensemble du jeu."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
    FlexGridSizer7->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    wxString __wxRadioBoxChoices_1[2] =
    {
    	_("Simple ( dossier contenant jeu et ressources )"),
    	_("Fichier exécutable unique ( compressé )")
    };
    TypeBox = new wxRadioBox(Panel5, ID_RADIOBOX1, _("Choisissez le type de compilation :"), wxPoint(16,32), wxDefaultSize, 2, __wxRadioBoxChoices_1, 1, 0, wxDefaultValidator, _T("ID_RADIOBOX1"));
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
    StaticBitmap1 = new wxStaticBitmap(Panel2, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/win-logo.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
    FlexGridSizer8->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    WinCheck = new wxCheckBox(Panel2, ID_CHECKBOX1, _("Microsoft Windows"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
    WinCheck->SetValue(true);
    FlexGridSizer8->Add(WinCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBitmap2 = new wxStaticBitmap(Panel2, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/linux-logo.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
    FlexGridSizer8->Add(StaticBitmap2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    LinuxCheck = new wxCheckBox(Panel2, ID_CHECKBOX2, _("GNU/Linux"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
    LinuxCheck->SetValue(true);
    FlexGridSizer8->Add(LinuxCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBitmap4 = new wxStaticBitmap(Panel2, ID_STATICBITMAP4, wxBitmap(wxImage(_T("res/mac-logo.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP4"));
    FlexGridSizer8->Add(StaticBitmap4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    MacCheck = new wxCheckBox(Panel2, ID_CHECKBOX3, _("Mac OS X ( Expérimental )"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
    MacCheck->SetValue(false);
    FlexGridSizer8->Add(MacCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
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
    StaticText6 = new wxStaticText(Panel3, ID_STATICTEXT6, _("Game Develop est prêt à générer votre jeu !\nCliquez sur \"Lancer la compilation\", choisissez le répertoire ou le fichier\noù enregistrer votre jeu, et patientez jusqu\'à la fin du processus."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
    FlexGridSizer2->Add(StaticText6, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
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

    Connect(ID_BUTTON8,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnNext1Click);
    Connect(ID_BUTTON9,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnNext2Click);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnCompilBtClick);
    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnOuvrirBtClick);
    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnAideBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnFermerBtClick);
    //*)

    Panel4->Enable(false);

    if ( gameToCompile.useExternalSourceFiles )
    {
        #if defined(WINDOWS)
            LinuxCheck->SetValue(false);LinuxCheck->Enable(false);
            MacCheck->SetValue(false);MacCheck->Enable(false);
        #elif defined(LINUX)
            WinCheck->SetValue(false);WinCheck->Enable(false);
            MacCheck->SetValue(false);MacCheck->Enable(false);
        #elif defined(MAC)
            LinuxCheck->SetValue(false);LinuxCheck->Enable(false);
            WinCheck->SetValue(false);WinCheck->Enable(false);
        #else
            #warning Unknown OS
        #endif
    }
    if ( !wxDirExists("MacRuntime") )
    {
        MacCheck->Enable(false);
        MacCheck->SetValue(false);
    }
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

/**
 * Display messages of FullProjectCompiler in compilation dialog
 */
class FullProjectCompilerDialogDiagnosticManager : public GDpriv::FullProjectCompilerDiagnosticManager
{
public:
    FullProjectCompilerDialogDiagnosticManager(wxStaticText * staticText1_, wxStaticText * staticText2_,wxGauge * gauge_, wxPanel * endPanel_, wxNotebook * notebook_) : staticText1(staticText1_), staticText2(staticText2_), gauge(gauge_), endPanel(endPanel_), notebook(notebook_) {}

    virtual void OnCompilationFailed()
    {
        ErrorCompilation dialog( NULL, GetErrors() );
        dialog.ShowModal();
    }

    virtual void OnCompilationSuccessed()
    {
        //Go to last page
        if ( endPanel != NULL ) endPanel->Enable(true);
        if ( notebook != NULL ) notebook->SetSelection(notebook->GetPageCount()-1);
    }
    virtual void OnMessage(std::string message, std::string message2) { staticText1->SetLabel(message); staticText2->SetLabel(message2); };
    virtual void OnPercentUpdate(float percents) { gauge->SetValue(percents); };

    wxStaticText * staticText1;
    wxStaticText * staticText2;
    wxGauge * gauge;
    wxPanel * endPanel;
    wxNotebook * notebook;
};


void Compilation::OnCompilBtClick( wxCommandEvent& event )
{
    wxDirDialog dialog(this, _("Choisissez un dossier, vierge de préférence, où créer le jeu."));
    dialog.ShowModal();
    if ( dialog.GetPath().empty() )
    {
        wxMessageBox(_("Vous devez choisir un répertoire où créer le jeu."), _("Compilation annulée"));
        return;
    }

    wxConfigBase *pConfig = wxConfigBase::Get();
    wxString tempDir;
    pConfig->Read( _T( "/Dossier/Compilation" ), &tempDir );

    FullProjectCompilerDialogDiagnosticManager diagnosticManager(StaticText3, StaticText2, AvancementGauge, Panel4, Notebook1);
    GDpriv::FullProjectCompiler compilationManager(gameToCompile, diagnosticManager, ToString(dialog.GetPath()));
    compilationManager.SetForcedTempDir(ToString(tempDir));
    compilationManager.TargetWindows(WinCheck->GetValue());
    compilationManager.TargetLinux(LinuxCheck->GetValue());
    compilationManager.TargetMac(MacCheck->GetValue());
    compilationManager.CompressIfPossible(TypeBox->GetSelection() == 1);

    compilationManager.LaunchProjectCompilation();

    return;
}

void Compilation::OnOuvrirBtClick( wxCommandEvent& event )
{
    wxExecute("explorer.exe \""+string(destinationDirectory.mb_str())+"\"");
}

void Compilation::OnAideBtClick( wxCommandEvent& event )
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::GetInstance();
    helpFileAccess->DisplaySection(125);
}

void Compilation::OnCGShareBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::GetInstance();
    helpFileAccess->DisplaySection(192);
}

void Compilation::OnDistribuerBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::GetInstance();
    helpFileAccess->DisplaySection(158);
}

void Compilation::OnNext1Click(wxCommandEvent& event)
{
    Notebook1->SetSelection(1);
}

void Compilation::OnNext2Click(wxCommandEvent& event)
{
    Notebook1->SetSelection(2);
}
