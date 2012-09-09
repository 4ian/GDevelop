/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

//(*InternalHeaders(Compilation)
#include <wx/intl.h>
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

#include "GDL/Game.h"
#include "GDL/DatFile.h"
#include "GDL/OpenSaveLoadingScreen.h"
#include "GDL/OpenSaveGame.h"
#include "GDCore/IDE/ResourcesMergingHelper.h"
#include "GDL/ExtensionsManager.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDL/ExternalEvents.h"
#include "Compilation.h"
#include "ErrorCompilation.h"
#include "GDL/IDE/FullProjectCompiler.h"

using namespace std;

//(*IdInit(Compilation)
const long Compilation::ID_GAUGE1 = wxNewId();
const long Compilation::ID_BUTTON1 = wxNewId();
const long Compilation::ID_STATICTEXT2 = wxNewId();
const long Compilation::ID_STATICTEXT1 = wxNewId();
const long Compilation::ID_STATICTEXT4 = wxNewId();
const long Compilation::ID_TEXTCTRL1 = wxNewId();
const long Compilation::ID_BUTTON5 = wxNewId();
const long Compilation::ID_CHECKBOX1 = wxNewId();
const long Compilation::ID_CHECKBOX4 = wxNewId();
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
    wxFlexGridSizer* FlexGridSizer10;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer7;
    wxFlexGridSizer* FlexGridSizer8;
    wxStaticBoxSizer* StaticBoxSizer1;
    wxFlexGridSizer* FlexGridSizer1;

    Create(parent, wxID_ANY, _("Compilation du jeu"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
    wxIcon FrameIcon;
    FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/compilationicon.png"))));
    SetIcon(FrameIcon);
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(1);
    FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer7->AddGrowableCol(0);
    FlexGridSizer10 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer10->AddGrowableCol(0);
    FlexGridSizer10->AddGrowableRow(0);
    AvancementGauge = new wxGauge(this, ID_GAUGE1, 100, wxDefaultPosition, wxSize(238,16), 0, wxDefaultValidator, _T("ID_GAUGE1"));
    FlexGridSizer10->Add(AvancementGauge, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    CompilBt = new wxButton(this, ID_BUTTON1, _("Lancer la compilation"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer10->Add(CompilBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer7->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    statusTxt = new wxStaticText(this, ID_STATICTEXT2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer7->Add(statusTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    status2Txt = new wxStaticText(this, ID_STATICTEXT1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    FlexGridSizer7->Add(status2Txt, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Options"));
    FlexGridSizer5 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer5->AddGrowableCol(1);
    StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Dossier d\'export :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
    FlexGridSizer5->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer8->AddGrowableCol(0);
    FlexGridSizer8->AddGrowableRow(0);
    dirEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    FlexGridSizer8->Add(dirEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    browseBt = new wxButton(this, ID_BUTTON5, _("..."), wxDefaultPosition, wxSize(30,23), 0, wxDefaultValidator, _T("ID_BUTTON5"));
    FlexGridSizer8->Add(browseBt, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer5->Add(20,7,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    compressCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Compresser en un fichier unique"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
    compressCheck->SetValue(false);
    FlexGridSizer5->Add(compressCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(20,10,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    optimizationCheck = new wxCheckBox(this, ID_CHECKBOX4, _("Activer les optimisations ( ralentit la compilation )"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX4"));
    optimizationCheck->SetValue(false);
    FlexGridSizer5->Add(optimizationCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer1->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer7->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
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

    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnCompilBtClick);
    Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnbrowseBtClick);
    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnAideBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Compilation::OnFermerBtClick);
    //*)

    #if defined(LINUX) || defined(MAC)
    compressCheck->Disable();
    #endif

    if ( wxDirExists(gameToCompile.GetLastCompilationDirectory()) )
        dirEdit->SetValue(gameToCompile.GetLastCompilationDirectory());
    else
    {
        dirEdit->SetValue(wxFileName::GetHomeDir()+wxFileName::GetPathSeparator()+DeleteInvalidCharacters(gameToCompile.GetName()));
    }
}

wxString Compilation::DeleteInvalidCharacters(const wxString & directoryName) const
{
    wxString result = directoryName;
    for (unsigned int i =0;i<result.size();)
    {
        wxChar character = result[i];
        if ( character == '/' || character == '\\' || character == '"' || character == '*' || character == ':' || character == '|' || character == '<' || character == '>' || character == '?' )
            result.erase(result.begin()+i);
        else
            ++i;
    }

    return result;
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
    FullProjectCompilerDialogDiagnosticManager(wxStaticText * staticText1_, wxStaticText * staticText2_,wxGauge * gauge_, wxString destinationDirectory_) : staticText1(staticText1_), staticText2(staticText2_), gauge(gauge_), destinationDirectory(destinationDirectory_) {}

    virtual void OnCompilationFailed()
    {
        ErrorCompilation dialog( NULL, GetErrors() );
        dialog.ShowModal();
    }

    virtual void OnCompilationSuccessed()
    {
        staticText1->SetLabel(_("Compilation terminée")); staticText2->SetLabel(_("Le projet compilé est disponible dans le dossier d'export."));
        if ( wxMessageBox(_("Compilation achevée avec succès. Voulez vous ouvrir le dossier où le projet a été compilé ?"), _("Compilation terminée"), wxYES_NO) == wxYES )
        {
            #if defined(WINDOWS)
            wxExecute("explorer.exe \""+string(destinationDirectory.mb_str())+"\"");
            #elif defined(LINUX)
            system(string("xdg-open \""+string(destinationDirectory.mb_str())+"\"").c_str());
            #elif defined(MAC)
            system(string("open \""+string(destinationDirectory.mb_str())+"\"").c_str());
            #endif
        }
    }
    virtual void OnMessage(std::string message, std::string message2) { staticText1->SetLabel(message); staticText2->SetLabel(message2); };
    virtual void OnPercentUpdate(float percents) { gauge->SetValue(percents); };

    wxStaticText * staticText1;
    wxStaticText * staticText2;
    wxGauge * gauge;
    wxString destinationDirectory;
};


void Compilation::OnCompilBtClick( wxCommandEvent& event )
{
    if ( dirEdit->GetValue().empty() )
    {
        wxMessageBox(_("Vous devez choisir un répertoire valide où créer le jeu."), _("Compilation annulée"));
        return;
    }
    if ( !wxDirExists( dirEdit->GetValue() ) && !wxMkdir( dirEdit->GetValue() ) )
    {
        wxMessageBox(_("Impossible de créer le répertoire où le jeu doit être compilé.\nVérifiez que vous possédez les droits d'écritures dans cet espace."), _("Compilation annulée"), wxICON_ERROR);
        return;
    }

    wxString tempDir;
    wxConfigBase::Get()->Read( _T( "/Dossier/Compilation" ), &tempDir );

    FullProjectCompilerDialogDiagnosticManager diagnosticManager(statusTxt, status2Txt, AvancementGauge, dirEdit->GetValue());
    GDpriv::FullProjectCompiler compilationManager(gameToCompile, diagnosticManager, ToString(dirEdit->GetValue()));

    compilationManager.SetForcedTempDir(ToString(tempDir));
    compilationManager.CompressIfPossible(compressCheck->GetValue());
    compilationManager.Optimize(optimizationCheck->GetValue());

    compilationManager.LaunchProjectCompilation();

    return;
}

void Compilation::OnAideBtClick( wxCommandEvent& event )
{
    if ( GDpriv::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
        gd::HelpFileAccess::GetInstance()->DisplaySection(125);
    else
        gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/distribution/compilation"));
}

void Compilation::OnbrowseBtClick(wxCommandEvent& event)
{
    wxDirDialog dialog(this, _("Choisissez un dossier, vierge de préférence, où créer le jeu."));
    if ( dialog.ShowModal() == wxID_OK )
        dirEdit->SetValue(dialog.GetPath());
}
