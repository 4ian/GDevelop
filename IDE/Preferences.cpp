#include "Preferences.h"

//(*InternalHeaders(Preferences)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/propgrid/advprops.h>
#include <wx/imaglist.h>
#include <wx/fileconf.h>
#include <wx/filename.h>
#include <wx/config.h>
#include "wx/aui/aui.h"
#include <wx/filedlg.h>
#include <wx/dir.h>
#include <wx/colordlg.h>
#include <wx/help.h>
#include <wx/dirdlg.h>
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Locale/LocaleManager.h"
#include "GDCore/IDE/Events/InstructionSentenceFormatter.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "LogFileManager.h"
#include <wx/listctrl.h>
#include "GDCpp/IDE/CodeCompiler.h"

#include <string>
#include <vector>
#include <iostream>

using namespace std;
using namespace gd;

//(*IdInit(Preferences)
const long Preferences::ID_STATICBITMAP3 = wxNewId();
const long Preferences::ID_STATICTEXT7 = wxNewId();
const long Preferences::ID_PANEL5 = wxNewId();
const long Preferences::ID_STATICLINE2 = wxNewId();
const long Preferences::ID_CHECKBOX4 = wxNewId();
const long Preferences::ID_CHECKBOX10 = wxNewId();
const long Preferences::ID_CHECKBOX3 = wxNewId();
const long Preferences::ID_TEXTCTRL1 = wxNewId();
const long Preferences::ID_STATICTEXT5 = wxNewId();
const long Preferences::ID_STATICTEXT14 = wxNewId();
const long Preferences::ID_CHECKBOX8 = wxNewId();
const long Preferences::ID_CHECKBOX9 = wxNewId();
const long Preferences::ID_CHECKBOX5 = wxNewId();
const long Preferences::ID_PANEL6 = wxNewId();
const long Preferences::ID_STATICTEXT13 = wxNewId();
const long Preferences::ID_CHOICE2 = wxNewId();
const long Preferences::ID_PANEL15 = wxNewId();
const long Preferences::ID_STATICTEXT16 = wxNewId();
const long Preferences::ID_TEXTCTRL7 = wxNewId();
const long Preferences::ID_BUTTON9 = wxNewId();
const long Preferences::ID_STATICTEXT6 = wxNewId();
const long Preferences::ID_TEXTCTRL3 = wxNewId();
const long Preferences::ID_BUTTON5 = wxNewId();
const long Preferences::ID_STATICTEXT8 = wxNewId();
const long Preferences::ID_TEXTCTRL4 = wxNewId();
const long Preferences::ID_BUTTON4 = wxNewId();
const long Preferences::ID_STATICTEXT21 = wxNewId();
const long Preferences::ID_TEXTCTRL6 = wxNewId();
const long Preferences::ID_BUTTON12 = wxNewId();
const long Preferences::ID_CHECKBOX7 = wxNewId();
const long Preferences::ID_STATICTEXT24 = wxNewId();
const long Preferences::ID_TEXTCTRL8 = wxNewId();
const long Preferences::ID_BUTTON15 = wxNewId();
const long Preferences::ID_PANEL7 = wxNewId();
const long Preferences::ID_STATICTEXT15 = wxNewId();
const long Preferences::ID_CHOICE1 = wxNewId();
const long Preferences::ID_PANEL16 = wxNewId();
const long Preferences::ID_BUTTON16 = wxNewId();
const long Preferences::ID_BUTTON8 = wxNewId();
const long Preferences::ID_BUTTON6 = wxNewId();
const long Preferences::ID_BUTTON7 = wxNewId();
const long Preferences::ID_BUTTON10 = wxNewId();
const long Preferences::ID_BUTTON13 = wxNewId();
const long Preferences::ID_RADIOBOX1 = wxNewId();
const long Preferences::ID_STATICTEXT1 = wxNewId();
const long Preferences::ID_PANEL9 = wxNewId();
const long Preferences::ID_STATICTEXT2 = wxNewId();
const long Preferences::ID_PANEL10 = wxNewId();
const long Preferences::ID_CHECKBOX2 = wxNewId();
const long Preferences::ID_STATICTEXT22 = wxNewId();
const long Preferences::ID_PANEL21 = wxNewId();
const long Preferences::ID_STATICTEXT4 = wxNewId();
const long Preferences::ID_PANEL3 = wxNewId();
const long Preferences::ID_PANEL4 = wxNewId();
const long Preferences::ID_STATICTEXT3 = wxNewId();
const long Preferences::ID_PANEL1 = wxNewId();
const long Preferences::ID_PANEL2 = wxNewId();
const long Preferences::ID_STATICTEXT9 = wxNewId();
const long Preferences::ID_PANEL11 = wxNewId();
const long Preferences::ID_STATICTEXT10 = wxNewId();
const long Preferences::ID_PANEL13 = wxNewId();
const long Preferences::ID_STATICTEXT11 = wxNewId();
const long Preferences::ID_PANEL12 = wxNewId();
const long Preferences::ID_STATICTEXT12 = wxNewId();
const long Preferences::ID_PANEL14 = wxNewId();
const long Preferences::ID_STATICTEXT19 = wxNewId();
const long Preferences::ID_PANEL19 = wxNewId();
const long Preferences::ID_STATICTEXT20 = wxNewId();
const long Preferences::ID_PANEL20 = wxNewId();
const long Preferences::ID_RADIOBOX2 = wxNewId();
const long Preferences::ID_CHECKBOX1 = wxNewId();
const long Preferences::ID_PANEL22 = wxNewId();
const long Preferences::ID_RADIOBOX3 = wxNewId();
const long Preferences::ID_PANEL8 = wxNewId();
const long Preferences::ID_STATICTEXT17 = wxNewId();
const long Preferences::ID_TEXTCTRL5 = wxNewId();
const long Preferences::ID_STATICTEXT18 = wxNewId();
const long Preferences::ID_CHECKBOX6 = wxNewId();
const long Preferences::ID_CUSTOM1 = wxNewId();
const long Preferences::ID_BUTTON14 = wxNewId();
const long Preferences::ID_PANEL18 = wxNewId();
const long Preferences::ID_RADIOBUTTON2 = wxNewId();
const long Preferences::ID_RADIOBUTTON1 = wxNewId();
const long Preferences::ID_TEXTCTRL2 = wxNewId();
const long Preferences::ID_BUTTON11 = wxNewId();
const long Preferences::ID_STATICTEXT23 = wxNewId();
const long Preferences::ID_SPINCTRL1 = wxNewId();
const long Preferences::ID_PANEL17 = wxNewId();
const long Preferences::ID_LISTBOOK1 = wxNewId();
const long Preferences::ID_STATICLINE1 = wxNewId();
const long Preferences::ID_BUTTON1 = wxNewId();
const long Preferences::ID_BUTTON2 = wxNewId();
const long Preferences::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE( Preferences, wxDialog )
    //(*EventTable(Preferences)
    //*)
END_EVENT_TABLE()

Preferences::Preferences( wxWindow* parent ) :
changesNeedRestart(false)
{
    //(*Initialize(Preferences)
    wxStaticBoxSizer* StaticBoxSizer2;
    wxFlexGridSizer* FlexGridSizer4;
    wxFlexGridSizer* FlexGridSizer16;
    wxFlexGridSizer* FlexGridSizer24;
    wxFlexGridSizer* FlexGridSizer19;
    wxStaticBoxSizer* StaticBoxSizer12;
    wxStaticBoxSizer* StaticBoxSizer21;
    wxFlexGridSizer* FlexGridSizer23;
    wxFlexGridSizer* FlexGridSizer38;
    wxStaticBoxSizer* StaticBoxSizer15;
    wxStaticBoxSizer* StaticBoxSizer14;
    wxStaticBoxSizer* StaticBoxSizer4;
    wxFlexGridSizer* FlexGridSizer10;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer27;
    wxStaticBoxSizer* StaticBoxSizer16;
    wxFlexGridSizer* FlexGridSizer37;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer25;
    wxFlexGridSizer* FlexGridSizer22;
    wxFlexGridSizer* FlexGridSizer9;
    wxFlexGridSizer* FlexGridSizer2;
    wxStaticBoxSizer* StaticBoxSizer9;
    wxFlexGridSizer* FlexGridSizer7;
    wxStaticBoxSizer* StaticBoxSizer7;
    wxStaticBoxSizer* StaticBoxSizer17;
    wxStaticBoxSizer* StaticBoxSizer13;
    wxStaticBoxSizer* StaticBoxSizer10;
    wxStaticBoxSizer* StaticBoxSizer19;
    wxFlexGridSizer* FlexGridSizer29;
    wxFlexGridSizer* FlexGridSizer34;
    wxStaticBoxSizer* StaticBoxSizer8;
    wxStaticBoxSizer* StaticBoxSizer3;
    wxStaticBoxSizer* StaticBoxSizer6;
    wxFlexGridSizer* FlexGridSizer15;
    wxFlexGridSizer* FlexGridSizer18;
    wxFlexGridSizer* FlexGridSizer8;
    wxStaticBoxSizer* StaticBoxSizer20;
    wxFlexGridSizer* FlexGridSizer21;
    wxFlexGridSizer* FlexGridSizer14;
    wxStaticBoxSizer* StaticBoxSizer11;
    wxFlexGridSizer* FlexGridSizer20;
    wxFlexGridSizer* FlexGridSizer13;
    wxFlexGridSizer* FlexGridSizer35;
    wxFlexGridSizer* FlexGridSizer12;
    wxFlexGridSizer* FlexGridSizer36;
    wxFlexGridSizer* FlexGridSizer6;
    wxStaticBoxSizer* StaticBoxSizer1;
    wxFlexGridSizer* FlexGridSizer1;
    wxFlexGridSizer* FlexGridSizer33;
    wxFlexGridSizer* FlexGridSizer11;
    wxFlexGridSizer* FlexGridSizer17;
    wxStaticBoxSizer* StaticBoxSizer5;
    wxFlexGridSizer* FlexGridSizer32;
    wxFlexGridSizer* FlexGridSizer31;
    wxFlexGridSizer* FlexGridSizer39;
    wxStaticBoxSizer* StaticBoxSizer18;
    wxFlexGridSizer* FlexGridSizer28;
    wxFlexGridSizer* FlexGridSizer26;
    wxFlexGridSizer* FlexGridSizer30;

    Create(parent, wxID_ANY, _("GDevelop settings"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxMINIMIZE_BOX, _T("wxID_ANY"));
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(0);
    FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer17->AddGrowableCol(0);
    Panel1 = new wxPanel(this, ID_PANEL5, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL5"));
    Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
    FlexGridSizer12 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/preferencelogo.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
    FlexGridSizer12->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    StaticText7 = new wxStaticText(Panel1, ID_STATICTEXT7, _("This window allows you to customize GDevelop. \nEach user of the computer has his own options."), wxDefaultPosition, wxDefaultSize, wxALIGN_LEFT, _T("ID_STATICTEXT7"));
    FlexGridSizer12->Add(StaticText7, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    Panel1->SetSizer(FlexGridSizer12);
    FlexGridSizer12->Fit(Panel1);
    FlexGridSizer12->SetSizeHints(Panel1);
    FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    Listbook1 = new wxListbook(this, ID_LISTBOOK1, wxDefaultPosition, wxDefaultSize, wxLB_DEFAULT, _T("ID_LISTBOOK1"));
    Panel2 = new wxPanel(Listbook1, ID_PANEL6, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL6"));
    FlexGridSizer14 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer14->AddGrowableCol(0);
    StaticBoxSizer1 = new wxStaticBoxSizer(wxVERTICAL, Panel2, _("Startup"));
    FlexGridSizer39 = new wxFlexGridSizer(0, 1, 0, 0);
    MAJCheck = new wxCheckBox(Panel2, ID_CHECKBOX4, _("Check for updates"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX4"));
    MAJCheck->SetValue(false);
    FlexGridSizer39->Add(MAJCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    sendInfoCheck = new wxCheckBox(Panel2, ID_CHECKBOX10, _("Send anonymous statistics about GDevelop ( version, language used )"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX10"));
    sendInfoCheck->SetValue(false);
    sendInfoCheck->SetToolTip(_("When checked, GDevelop will send some anonymous information to our server so as to get some statistics about the software"));
    FlexGridSizer39->Add(sendInfoCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer1->Add(FlexGridSizer39, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer14->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Autosave"));
    FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer19 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer19->AddGrowableCol(1);
    autosaveActivatedCheck = new wxCheckBox(Panel2, ID_CHECKBOX3, _("Make a backup of opened projects every"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
    autosaveActivatedCheck->SetValue(false);
    FlexGridSizer19->Add(autosaveActivatedCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    autosaveTimeEdit = new wxTextCtrl(Panel2, ID_TEXTCTRL1, _("3"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    FlexGridSizer19->Add(autosaveTimeEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText5 = new wxStaticText(Panel2, ID_STATICTEXT5, _("minutes"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
    FlexGridSizer19->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer10->Add(FlexGridSizer19, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticText14 = new wxStaticText(Panel2, ID_STATICTEXT14, _("Files will be saved with .gdg.autosave at the end of their name"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT14"));
    FlexGridSizer10->Add(StaticText14, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer4->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer14->Add(StaticBoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer12 = new wxStaticBoxSizer(wxVERTICAL, Panel2, _("Miscellaneous"));
    logCheck = new wxCheckBox(Panel2, ID_CHECKBOX8, _("Activate a log file"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX8"));
    logCheck->SetValue(false);
    StaticBoxSizer12->Add(logCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_TOP, 5);
    avertOnSaveCheck = new wxCheckBox(Panel2, ID_CHECKBOX9, _("Warn when saving a project in a new directory"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX9"));
    avertOnSaveCheck->SetValue(false);
    avertOnSaveCheck->SetToolTip(_("Warn, when the project is saved in a new folder, that project resources should also be copied to the folder."));
    StaticBoxSizer12->Add(avertOnSaveCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_TOP, 5);
    FlexGridSizer14->Add(StaticBoxSizer12, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer21 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("External scene editor"));
    externalSceneEditorCheck = new wxCheckBox(Panel2, ID_CHECKBOX5, _("Use the experimental, new scene editor"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX5"));
    externalSceneEditorCheck->SetValue(false);
    StaticBoxSizer21->Add(externalSceneEditorCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer14->Add(StaticBoxSizer21, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel2->SetSizer(FlexGridSizer14);
    FlexGridSizer14->Fit(Panel2);
    FlexGridSizer14->SetSizeHints(Panel2);
    Panel5 = new wxPanel(Listbook1, ID_PANEL15, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL15"));
    FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticText13 = new wxStaticText(Panel5, ID_STATICTEXT13, _("Language:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT13"));
    FlexGridSizer9->Add(StaticText13, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    langChoice = new wxChoice(Panel5, ID_CHOICE2, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE2"));
    langChoice->SetSelection( langChoice->Append(_("English")) );
    FlexGridSizer9->Add(langChoice, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel5->SetSizer(FlexGridSizer9);
    FlexGridSizer9->Fit(Panel5);
    FlexGridSizer9->SetSizeHints(Panel5);
    Panel3 = new wxPanel(Listbook1, ID_PANEL7, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL7"));
    FlexGridSizer15 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer15->AddGrowableCol(0);
    StaticBoxSizer17 = new wxStaticBoxSizer(wxHORIZONTAL, Panel3, _("New projects"));
    FlexGridSizer24 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer24->AddGrowableCol(1);
    StaticText16 = new wxStaticText(Panel3, ID_STATICTEXT16, _("New projects default folder:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT16"));
    FlexGridSizer24->Add(StaticText16, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    newProjectFolderEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL7, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
    newProjectFolderEdit->SetToolTip(_("Path to the image editing program."));
    FlexGridSizer24->Add(newProjectFolderEdit, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    newProjectFolderBrowseBt = new wxButton(Panel3, ID_BUTTON9, _("Browse"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON9"));
    FlexGridSizer24->Add(newProjectFolderBrowseBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer17->Add(FlexGridSizer24, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer15->Add(StaticBoxSizer17, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer5 = new wxStaticBoxSizer(wxHORIZONTAL, Panel3, _("External programs"));
    FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer11->AddGrowableCol(1);
    StaticText6 = new wxStaticText(Panel3, ID_STATICTEXT6, _("Image Editor:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
    FlexGridSizer11->Add(StaticText6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    EditeurImageEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
    EditeurImageEdit->SetToolTip(_("Path to the image editing program."));
    FlexGridSizer11->Add(EditeurImageEdit, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    BrowseEditionImage = new wxButton(Panel3, ID_BUTTON5, _("Browse"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON5"));
    FlexGridSizer11->Add(BrowseEditionImage, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer5->Add(FlexGridSizer11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer15->Add(StaticBoxSizer5, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer6 = new wxStaticBoxSizer(wxVERTICAL, Panel3, _("Compilation"));
    FlexGridSizer13 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer13->AddGrowableCol(1);
    StaticText8 = new wxStaticText(Panel3, ID_STATICTEXT8, _("Temporary deployment directory:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
    FlexGridSizer13->Add(StaticText8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    DossierTempCompEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL4, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
    DossierTempCompEdit->SetToolTip(_("Folder used to store temporary files when compiling a game.\nYou must have write permissions for this folder.\nIf empty, the default temporary folder of the system is used."));
    FlexGridSizer13->Add(DossierTempCompEdit, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    BrowseDossierTempBt = new wxButton(Panel3, ID_BUTTON4, _("Browse"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
    FlexGridSizer13->Add(BrowseDossierTempBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer6->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer31 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer31->AddGrowableCol(1);
    StaticText21 = new wxStaticText(Panel3, ID_STATICTEXT21, _("Temporary folder for compilation:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT21"));
    FlexGridSizer31->Add(StaticText21, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    eventsCompilerTempDirEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL6, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL6"));
    eventsCompilerTempDirEdit->SetToolTip(_("Folder used to store temporary files when compiling a game.\nYou must have write permissions for this folder.\nIf empty, the default temporary folder of the system is used."));
    FlexGridSizer31->Add(eventsCompilerTempDirEdit, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    browseCompilationTempDir = new wxButton(Panel3, ID_BUTTON12, _("Browse"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON12"));
    FlexGridSizer31->Add(browseCompilationTempDir, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer6->Add(FlexGridSizer31, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    deleteTemporariesCheck = new wxCheckBox(Panel3, ID_CHECKBOX7, _("Delete temporary files as soon as possible"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX7"));
    deleteTemporariesCheck->SetValue(true);
    StaticBoxSizer6->Add(deleteTemporariesCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_TOP, 5);
    FlexGridSizer15->Add(StaticBoxSizer6, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer19 = new wxStaticBoxSizer(wxHORIZONTAL, Panel3, _("Java"));
    FlexGridSizer34 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer34->AddGrowableCol(1);
    StaticText24 = new wxStaticText(Panel3, ID_STATICTEXT24, _("Directory containing the Java executable:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT24"));
    FlexGridSizer34->Add(StaticText24, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    javaDirEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL8, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL8"));
    javaDirEdit->SetToolTip(_("Folder used to store temporary files when compiling a game.\nYou must have write permissions for this folder.\nIf empty, the default temporary folder of the system is used."));
    FlexGridSizer34->Add(javaDirEdit, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    browseJavaBt = new wxButton(Panel3, ID_BUTTON15, _("Browse"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON15"));
    FlexGridSizer34->Add(browseJavaBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer19->Add(FlexGridSizer34, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer15->Add(StaticBoxSizer19, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    Panel3->SetSizer(FlexGridSizer15);
    FlexGridSizer15->Fit(Panel3);
    FlexGridSizer15->SetSizeHints(Panel3);
    Panel6 = new wxPanel(Listbook1, ID_PANEL16, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL16"));
    FlexGridSizer20 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer20->AddGrowableCol(0);
    StaticBoxSizer11 = new wxStaticBoxSizer(wxHORIZONTAL, Panel6, _("Scene editor"));
    FlexGridSizer21 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticText15 = new wxStaticText(Panel6, ID_STATICTEXT15, _("Scene/Events tab:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT15"));
    FlexGridSizer21->Add(StaticText15, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    sceneEventsTabPosition = new wxChoice(Panel6, ID_CHOICE1, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE1"));
    sceneEventsTabPosition->Append(_("Top"));
    sceneEventsTabPosition->SetSelection( sceneEventsTabPosition->Append(_("Bottom")) );
    FlexGridSizer21->Add(sceneEventsTabPosition, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer11->Add(FlexGridSizer21, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer20->Add(StaticBoxSizer11, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    Panel6->SetSizer(FlexGridSizer20);
    FlexGridSizer20->Fit(Panel6);
    FlexGridSizer20->SetSizeHints(Panel6);
    Panel4 = new wxPanel(Listbook1, ID_PANEL8, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL8"));
    FlexGridSizer16 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer16->AddGrowableCol(0);
    StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, Panel4, _("Predefined appearance "));
    FlexGridSizer2 = new wxFlexGridSizer(0, 6, 0, 0);
    Button2 = new wxButton(Panel4, ID_BUTTON16, _("GDevelop Metro"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON16"));
    FlexGridSizer2->Add(Button2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Button1 = new wxButton(Panel4, ID_BUTTON8, _("Metro White"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON8"));
    FlexGridSizer2->Add(Button1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    gdStyleBt = new wxButton(Panel4, ID_BUTTON6, _("GDevelop Office"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON6"));
    FlexGridSizer2->Add(gdStyleBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    officeStyleBt = new wxButton(Panel4, ID_BUTTON7, _("Office Blue"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON7"));
    FlexGridSizer2->Add(officeStyleBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    radianceStyleBt = new wxButton(Panel4, ID_BUTTON10, _("Radiance"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON10"));
    FlexGridSizer2->Add(radianceStyleBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    oxygenStyleBt = new wxButton(Panel4, ID_BUTTON13, _("Oxygen"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON13"));
    FlexGridSizer2->Add(oxygenStyleBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer2->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer16->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    FlexGridSizer3 = new wxFlexGridSizer(0, 4, 0, 0);
    wxString __wxRadioBoxChoices_1[3] =
    {
    	_("Microsoft Office"),
    	_("wxAUI"),
    	_("Metro")
    };
    ribbonStyleBox = new wxRadioBox(Panel4, ID_RADIOBOX1, _("Ribbon\'s style"), wxDefaultPosition, wxDefaultSize, 3, __wxRadioBoxChoices_1, 1, wxRA_HORIZONTAL, wxDefaultValidator, _T("ID_RADIOBOX1"));
    FlexGridSizer3->Add(ribbonStyleBox, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer7 = new wxStaticBoxSizer(wxHORIZONTAL, Panel4, _("Ribbon\'s colors"));
    FlexGridSizer4 = new wxFlexGridSizer(0, 2, 0, 0);
    StaticText1 = new wxStaticText(Panel4, ID_STATICTEXT1, _("Primary :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    FlexGridSizer4->Add(StaticText1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    ribbonColor1Pnl = new wxPanel(Panel4, ID_PANEL9, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL9"));
    FlexGridSizer4->Add(ribbonColor1Pnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText2 = new wxStaticText(Panel4, ID_STATICTEXT2, _("Secondary :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer4->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    ribbonColor2Pnl = new wxPanel(Panel4, ID_PANEL10, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL10"));
    FlexGridSizer4->Add(ribbonColor2Pnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer7->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer3->Add(StaticBoxSizer7, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer10 = new wxStaticBoxSizer(wxHORIZONTAL, Panel4, _("Ribbon labels"));
    FlexGridSizer22 = new wxFlexGridSizer(2, 1, 0, 0);
    FlexGridSizer22->AddGrowableCol(0);
    hideLabelsCheck = new wxCheckBox(Panel4, ID_CHECKBOX2, _("Hide the button\'s labels"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
    hideLabelsCheck->SetValue(false);
    FlexGridSizer22->Add(hideLabelsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer10->Add(FlexGridSizer22, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer3->Add(StaticBoxSizer10, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer16 = new wxStaticBoxSizer(wxHORIZONTAL, Panel4, _("File button"));
    FlexGridSizer32 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticText22 = new wxStaticText(Panel4, ID_STATICTEXT22, _("Color"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT22"));
    FlexGridSizer32->Add(StaticText22, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    fileBtColorPnl = new wxPanel(Panel4, ID_PANEL21, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL21"));
    FlexGridSizer32->Add(fileBtColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer16->Add(FlexGridSizer32, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer3->Add(StaticBoxSizer16, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    FlexGridSizer16->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer18 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBoxSizer3 = new wxStaticBoxSizer(wxVERTICAL, Panel4, _("Panes\' color"));
    FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticText4 = new wxStaticText(Panel4, ID_STATICTEXT4, _("Active editor :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
    FlexGridSizer7->Add(StaticText4, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    ActifColorPnl = new wxPanel(Panel4, ID_PANEL3, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL3"));
    FlexGridSizer7->Add(ActifColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    ActifColor2Pnl = new wxPanel(Panel4, ID_PANEL4, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL4"));
    FlexGridSizer7->Add(ActifColor2Pnl, 0, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText3 = new wxStaticText(Panel4, ID_STATICTEXT3, _("Inactive editor :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
    FlexGridSizer7->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    InactifColorPnl = new wxPanel(Panel4, ID_PANEL1, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    FlexGridSizer7->Add(InactifColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    InactifColor2Pnl = new wxPanel(Panel4, ID_PANEL2, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    FlexGridSizer7->Add(InactifColor2Pnl, 0, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer3->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer18->Add(StaticBoxSizer3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer8 = new wxStaticBoxSizer(wxVERTICAL, Panel4, _("Sash\'s color"));
    FlexGridSizer8 = new wxFlexGridSizer(0, 2, 0, 0);
    StaticText9 = new wxStaticText(Panel4, ID_STATICTEXT9, _("Background :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
    FlexGridSizer8->Add(StaticText9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    backColorPnl = new wxPanel(Panel4, ID_PANEL11, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL11"));
    FlexGridSizer8->Add(backColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText10 = new wxStaticText(Panel4, ID_STATICTEXT10, _("Borders :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT10"));
    FlexGridSizer8->Add(StaticText10, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    borderColorPnl = new wxPanel(Panel4, ID_PANEL13, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL13"));
    FlexGridSizer8->Add(borderColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer8->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer18->Add(StaticBoxSizer8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer9 = new wxStaticBoxSizer(wxVERTICAL, Panel4, _("Text\'s color"));
    FlexGridSizer6 = new wxFlexGridSizer(0, 2, 0, 0);
    StaticText11 = new wxStaticText(Panel4, ID_STATICTEXT11, _("Active :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
    FlexGridSizer6->Add(StaticText11, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    activeTextColorPnl = new wxPanel(Panel4, ID_PANEL12, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL12"));
    FlexGridSizer6->Add(activeTextColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText12 = new wxStaticText(Panel4, ID_STATICTEXT12, _("Inactive :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT12"));
    FlexGridSizer6->Add(StaticText12, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    inactiveTextColorPnl = new wxPanel(Panel4, ID_PANEL14, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL14"));
    FlexGridSizer6->Add(inactiveTextColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer9->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer18->Add(StaticBoxSizer9, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    FlexGridSizer16->Add(FlexGridSizer18, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer38 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBoxSizer14 = new wxStaticBoxSizer(wxVERTICAL, Panel4, _("Tabs"));
    FlexGridSizer30 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer37 = new wxFlexGridSizer(0, 2, 0, 0);
    StaticText19 = new wxStaticText(Panel4, ID_STATICTEXT19, _("Active :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT19"));
    FlexGridSizer37->Add(StaticText19, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    activeTabColorPnl = new wxPanel(Panel4, ID_PANEL19, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL19"));
    FlexGridSizer37->Add(activeTabColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText20 = new wxStaticText(Panel4, ID_STATICTEXT20, _("Inactive :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT20"));
    FlexGridSizer37->Add(StaticText20, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    tabColorPnl = new wxPanel(Panel4, ID_PANEL20, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL20"));
    FlexGridSizer37->Add(tabColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer30->Add(FlexGridSizer37, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    wxString __wxRadioBoxChoices_2[2] =
    {
    	_("Normal"),
    	_("Flat")
    };
    tabBox = new wxRadioBox(Panel4, ID_RADIOBOX2, _("Style"), wxDefaultPosition, wxDefaultSize, 2, __wxRadioBoxChoices_2, 1, 0, wxDefaultValidator, _T("ID_RADIOBOX2"));
    FlexGridSizer30->Add(tabBox, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer14->Add(FlexGridSizer30, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer38->Add(StaticBoxSizer14, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer20 = new wxStaticBoxSizer(wxHORIZONTAL, Panel4, _("Toolbars"));
    FlexGridSizer35 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer36 = new wxFlexGridSizer(0, 3, 0, 0);
    customToolbarColorCheck = new wxCheckBox(Panel4, ID_CHECKBOX1, _("Custom color:"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
    customToolbarColorCheck->SetValue(false);
    FlexGridSizer36->Add(customToolbarColorCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    toolbarColorPanel = new wxPanel(Panel4, ID_PANEL22, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL22"));
    FlexGridSizer36->Add(toolbarColorPanel, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer35->Add(FlexGridSizer36, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    wxString __wxRadioBoxChoices_3[2] =
    {
    	_("Normal"),
    	_("Flat")
    };
    toolbarBox = new wxRadioBox(Panel4, ID_RADIOBOX3, _("Style"), wxDefaultPosition, wxDefaultSize, 2, __wxRadioBoxChoices_3, 1, 0, wxDefaultValidator, _T("ID_RADIOBOX3"));
    FlexGridSizer35->Add(toolbarBox, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer20->Add(FlexGridSizer35, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer38->Add(StaticBoxSizer20, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer16->Add(FlexGridSizer38, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    Panel4->SetSizer(FlexGridSizer16);
    FlexGridSizer16->Fit(Panel4);
    FlexGridSizer16->SetSizeHints(Panel4);
    Panel8 = new wxPanel(Listbook1, ID_PANEL18, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL18"));
    FlexGridSizer27 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer27->AddGrowableCol(0);
    FlexGridSizer28 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticText17 = new wxStaticText(Panel8, ID_STATICTEXT17, _("Default width of the condition column:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT17"));
    FlexGridSizer28->Add(StaticText17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    conditionsColumnWidthEdit = new wxTextCtrl(Panel8, ID_TEXTCTRL5, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
    FlexGridSizer28->Add(conditionsColumnWidthEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText18 = new wxStaticText(Panel8, ID_STATICTEXT18, _("pixels"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT18"));
    FlexGridSizer28->Add(StaticText18, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer27->Add(FlexGridSizer28, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    hideContextPanelsLabels = new wxCheckBox(Panel8, ID_CHECKBOX6, _("Hide the button\'s labels in context panels"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX6"));
    hideContextPanelsLabels->SetValue(false);
    FlexGridSizer27->Add(hideContextPanelsLabels, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer15 = new wxStaticBoxSizer(wxHORIZONTAL, Panel8, _("Parameters colors"));
    FlexGridSizer29 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer29->AddGrowableCol(0);
    eventsEditorParametersProperties = new wxPropertyGrid(Panel8,ID_CUSTOM1,wxDefaultPosition,wxSize(532,211),0,_T("ID_CUSTOM1"));
    FlexGridSizer29->Add(eventsEditorParametersProperties, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer15->Add(FlexGridSizer29, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer27->Add(StaticBoxSizer15, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    eventsEditorFontBt = new wxButton(Panel8, ID_BUTTON14, _("Choose the font used by events editors"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON14"));
    FlexGridSizer27->Add(eventsEditorFontBt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    Panel8->SetSizer(FlexGridSizer27);
    FlexGridSizer27->Fit(Panel8);
    FlexGridSizer27->SetSizeHints(Panel8);
    Panel7 = new wxPanel(Listbook1, ID_PANEL17, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL17"));
    FlexGridSizer23 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer23->AddGrowableCol(0);
    StaticBoxSizer13 = new wxStaticBoxSizer(wxHORIZONTAL, Panel7, _("Edit sources"));
    FlexGridSizer25 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer25->AddGrowableCol(0);
    internalCodeEditorCheck = new wxRadioButton(Panel7, ID_RADIOBUTTON2, _("Edit sources using internal GDevelop code editor"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
    internalCodeEditorCheck->SetValue(true);
    FlexGridSizer25->Add(internalCodeEditorCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer26 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer26->AddGrowableCol(1);
    externalCodeEditorCheck = new wxRadioButton(Panel7, ID_RADIOBUTTON1, _("Use an external program :"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
    FlexGridSizer26->Add(externalCodeEditorCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    codeEditorEdit = new wxTextCtrl(Panel7, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
    FlexGridSizer26->Add(codeEditorEdit, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    browseCodeEditorBt = new wxButton(Panel7, ID_BUTTON11, _("Browse"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON11"));
    FlexGridSizer26->Add(browseCodeEditorBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer25->Add(FlexGridSizer26, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    StaticBoxSizer13->Add(FlexGridSizer25, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer23->Add(StaticBoxSizer13, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticBoxSizer18 = new wxStaticBoxSizer(wxHORIZONTAL, Panel7, _("Internal code compiler"));
    FlexGridSizer33 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticText23 = new wxStaticText(Panel7, ID_STATICTEXT23, _("Maximum thread number for code compiler :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT23"));
    FlexGridSizer33->Add(StaticText23, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    codeCompilerThreadEdit = new wxSpinCtrl(Panel7, ID_SPINCTRL1, _T("1"), wxDefaultPosition, wxDefaultSize, 0, 1, 100, 1, _T("ID_SPINCTRL1"));
    codeCompilerThreadEdit->SetValue(_T("1"));
    FlexGridSizer33->Add(codeCompilerThreadEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer18->Add(FlexGridSizer33, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer23->Add(StaticBoxSizer18, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    Panel7->SetSizer(FlexGridSizer23);
    FlexGridSizer23->Fit(Panel7);
    FlexGridSizer23->SetSizeHints(Panel7);
    Listbook1->AddPage(Panel2, _("General"), false);
    Listbook1->AddPage(Panel5, _("Language"), false);
    Listbook1->AddPage(Panel3, _("Folders"), false);
    Listbook1->AddPage(Panel6, _("Default position"), false);
    Listbook1->AddPage(Panel4, _("Appearance"), false);
    Listbook1->AddPage(Panel8, _("Events editor"), false);
    Listbook1->AddPage(Panel7, _("C++ Compilation"), false);
    FlexGridSizer1->Add(Listbook1, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 5);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer5->AddGrowableCol(0);
    OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer5->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AnnulerBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    FlexGridSizer5->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AideBt = new wxButton(this, ID_BUTTON3, _("Help"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
    FlexGridSizer5->Add(AideBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
    SetSizer(FlexGridSizer1);
    	wxFontData fontData_1;
    	fontData_1.EnableEffects(false);
    	fontData_1.SetInitialFont(*wxNORMAL_FONT);
    eventsEditorFontDialog = new wxFontDialog(this, fontData_1);
    FlexGridSizer1->Fit(this);
    FlexGridSizer1->SetSizeHints(this);
    Center();

    Connect(ID_CHECKBOX4,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&Preferences::OnMAJCheckClick);
    Connect(ID_CHECKBOX8,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&Preferences::OnlogCheckClick);
    Connect(ID_CHECKBOX5,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&Preferences::OnexternalSceneEditorCheckClick);
    Connect(ID_CHOICE2,wxEVT_COMMAND_CHOICE_SELECTED,(wxObjectEventFunction)&Preferences::OnlangChoiceSelect);
    Connect(ID_BUTTON9,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnnewProjectFolderBrowseBtClick);
    Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnBrowseEditionImageClick);
    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnBrowseDossierTempBtClick);
    Connect(ID_TEXTCTRL6,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&Preferences::OneventsCompilerTempDirEditText);
    Connect(ID_BUTTON12,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnbrowseCompilationTempDirClick);
    Connect(ID_BUTTON15,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnbrowseJavaBtClick);
    Connect(ID_BUTTON16,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnGDMetroStyleClick);
    Connect(ID_BUTTON8,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnMetroWhiteStyleClick);
    Connect(ID_BUTTON6,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnOfficeGDStyleBtClick);
    Connect(ID_BUTTON7,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnofficeStyleBtClick);
    Connect(ID_BUTTON10,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnradianceStyleBtClick);
    Connect(ID_BUTTON13,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnoxygenStyleBtClick);
    ribbonColor1Pnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnribbonColor1PnlLeftUp,0,this);
    ribbonColor2Pnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnribbonColor2PnlLeftUp,0,this);
    Connect(ID_CHECKBOX2,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&Preferences::OnhideLabelsCheckClick);
    fileBtColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnfileBtColorPnlLeftUp,0,this);
    ActifColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnActifColorPnlRightUp,0,this);
    ActifColor2Pnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnActifColor2PnlRightUp,0,this);
    InactifColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnInactifColorPnlRightUp,0,this);
    InactifColor2Pnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnInactifColor2PnlRightUp,0,this);
    backColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnbackColorPnlLeftUp,0,this);
    borderColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnborderColorPnlLeftUp,0,this);
    activeTextColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnactiveTextColorPnlLeftUp,0,this);
    inactiveTextColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OninactiveTextColorPnlLeftUp,0,this);
    activeTabColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnactiveTabColorPnlLeftUp,0,this);
    tabColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OntabColorPnlLeftUp,0,this);
    Connect(ID_CHECKBOX1,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&Preferences::OncustomToolbarColorCheckClick);
    toolbarColorPanel->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OntoolbarColorPanelLeftUp,0,this);
    Connect(ID_BUTTON14,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OneventsEditorFontBtClick);
    Connect(ID_BUTTON11,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnbrowseCodeEditorBtClick);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnOkBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnAnnulerBtClick);
    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnAideBtClick);
    //*)

    #ifdef GD_NO_UPDATE_CHECKER //If the update dialog is disabled, rename the checkbox to "Check for news"
    MAJCheck->SetLabel(_("Check for the news"));
    #endif

    //Create the image list
    wxImageList * imageList = new wxImageList( 24, 24 );
    imageList->Add(( wxBitmap( "res/pref24.png", wxBITMAP_TYPE_ANY ) ) );
    imageList->Add(( wxBitmap( "res/locale.png", wxBITMAP_TYPE_ANY ) ) );
    imageList->Add(( wxBitmap( "res/folder.png", wxBITMAP_TYPE_ANY ) ) );
    imageList->Add(( wxBitmap( "res/layout.png", wxBITMAP_TYPE_ANY ) ) );
    imageList->Add(( wxBitmap( "res/looknfeel.png", wxBITMAP_TYPE_ANY ) ) );
    imageList->Add(( wxBitmap( "res/source_cpp24.png", wxBITMAP_TYPE_ANY ) ) );
    imageList->Add(( wxBitmap( "res/events24.png", wxBITMAP_TYPE_ANY ) ) );
    Listbook1->AssignImageList(imageList);

    //Adding manually pages so as to specify image number
    while (Listbook1->GetPageCount() > 0)
        Listbook1->RemovePage(0);

    Listbook1->AddPage(Panel2, _("General"), false, 0);
    Listbook1->AddPage(Panel5, _("Language"), false, 1);
    Listbook1->AddPage(Panel3, _("Folders"), false, 2);
    Listbook1->AddPage(Panel6, _("Default position"), false, 3);
    Listbook1->AddPage(Panel4, _("Appearance"), false, 4);
    Listbook1->AddPage(Panel8, _("Events editors"), false, 6);
    Listbook1->AddPage(Panel7, _("C++ Compilation"), false, 5);

    //Events editor parameters property grid
    gd::InstructionSentenceFormatter * eventsEditorConfig = gd::InstructionSentenceFormatter::Get();
    for (std::map<gd::String, gd::TextFormatting>::iterator it = eventsEditorConfig->typesFormatting.begin();it!=eventsEditorConfig->typesFormatting.end();++it)
    {
        eventsEditorParametersProperties->Append( new wxColourProperty(it->first, wxPG_LABEL, eventsEditorConfig->typesFormatting[it->first].GetWxColor()) );
        eventsEditorParametersProperties->Append( new wxBoolProperty(it->first+_(": Bold"), wxPG_LABEL, eventsEditorConfig->typesFormatting[it->first].bold) );
        eventsEditorParametersProperties->Append( new wxBoolProperty(it->first+_(": Italic"), wxPG_LABEL, eventsEditorConfig->typesFormatting[it->first].italic) );
    }

    wxConfigBase *pConfig = wxConfigBase::Get();
    {
        wxString result;

        pConfig->Read( _T( "/Startup/CheckUpdate" ), &result );
        if ( result == "false" )
        {
            MAJCheck->SetValue( false );
        }
        else { MAJCheck->SetValue( true ); }
    }

    {
        wxString result;
        wxColour couleur;
        int r, v, b;
        pConfig->Read( _T( "/Skin/RDefined" ), &result );

        if ( result == "true" )
        {
            pConfig->Read( _T( "/Skin/RibbonStyle" ), &result );

            if ( result == "Office" )
                ribbonStyleBox->SetSelection(0);
            else if ( result == "AUI" )
                ribbonStyleBox->SetSelection(1);
            else if ( result == "Metro" )
                ribbonStyleBox->SetSelection(2);
            else
                ribbonStyleBox->SetSelection(0);

            pConfig->Read( _T( "/Skin/Ribbon1R" ), &r );
            pConfig->Read( _T( "/Skin/Ribbon1G" ), &v );
            pConfig->Read( _T( "/Skin/Ribbon1B" ), &b );
            ribbonColor1Pnl->SetBackgroundColour( wxColour( r, v, b ) );
            ribbonColor1Pnl->Refresh();

            pConfig->Read( _T( "/Skin/Ribbon2R" ), &r );
            pConfig->Read( _T( "/Skin/Ribbon2G" ), &v );
            pConfig->Read( _T( "/Skin/Ribbon2B" ), &b );
            ribbonColor2Pnl->SetBackgroundColour( wxColour( r, v, b ) );
            ribbonColor2Pnl->Refresh();

            bool hideLabels = false;
            pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );
            if ( hideLabels )
                hideLabelsCheck->SetValue(true);
        }
        else
        {
            wxCommandEvent useless;
            OnGDMetroStyleClick(useless);
        }

        pConfig->Read( _T( "/Skin/Defined" ), &result );

        if ( result == "true" )
        {
            pConfig->Read( _T( "/Skin/PaneA1R" ), &r );
            pConfig->Read( _T( "/Skin/PaneA1G" ), &v );
            pConfig->Read( _T( "/Skin/PaneA1B" ), &b );
            ActifColorPnl->SetBackgroundColour( wxColour( r, v, b ) );
            ActifColorPnl->Refresh();

            pConfig->Read( _T( "/Skin/PaneA2R" ), &r );
            pConfig->Read( _T( "/Skin/PaneA2G" ), &v );
            pConfig->Read( _T( "/Skin/PaneA2B" ), &b );
            ActifColor2Pnl->SetBackgroundColour( wxColour( r, v, b ) );
            ActifColor2Pnl->Refresh();

            pConfig->Read( _T( "/Skin/PaneI1R" ), &r );
            pConfig->Read( _T( "/Skin/PaneI1G" ), &v );
            pConfig->Read( _T( "/Skin/PaneI1B" ), &b );
            InactifColorPnl->SetBackgroundColour( wxColour( r, v, b ) );
            InactifColorPnl->Refresh();

            pConfig->Read( _T( "/Skin/PaneI2R" ), &r );
            pConfig->Read( _T( "/Skin/PaneI2G" ), &v );
            pConfig->Read( _T( "/Skin/PaneI2B" ), &b );
            InactifColor2Pnl->SetBackgroundColour( wxColour( r, v, b ) );
            InactifColor2Pnl->Refresh();

            pConfig->Read( _T( "/Skin/BorderR" ), &r );
            pConfig->Read( _T( "/Skin/BorderG" ), &v );
            pConfig->Read( _T( "/Skin/BorderB" ), &b );
            borderColorPnl->SetBackgroundColour( wxColour( r, v, b ) );
            borderColorPnl->Refresh();

            pConfig->Read( _T( "/Skin/BackR" ), &r );
            pConfig->Read( _T( "/Skin/BackG" ), &v );
            pConfig->Read( _T( "/Skin/BackB" ), &b );
            backColorPnl->SetBackgroundColour( wxColour( r, v, b ) );
            backColorPnl->Refresh();

            pConfig->Read( _T( "/Skin/ATextR" ), &r );
            pConfig->Read( _T( "/Skin/ATextG" ), &v );
            pConfig->Read( _T( "/Skin/ATextB" ), &b );
            activeTextColorPnl->SetBackgroundColour( wxColour( r, v, b ) );
            activeTextColorPnl->Refresh();

            pConfig->Read( _T( "/Skin/ATextR" ), &r );
            pConfig->Read( _T( "/Skin/ATextG" ), &v );
            pConfig->Read( _T( "/Skin/ATextB" ), &b );
            inactiveTextColorPnl->SetBackgroundColour( wxColour( r, v, b ) );
            inactiveTextColorPnl->Refresh();

            wxColor tabColor;
            pConfig->Read( _T( "/Skin/TabColor" ), &tabColor );
            tabColorPnl->SetBackgroundColour( tabColor );
            tabColorPnl->Refresh();

            wxColor activeTabColor;
            pConfig->Read( _T( "/Skin/ActiveTabColor" ), &activeTabColor );
            activeTabColorPnl->SetBackgroundColour( activeTabColor );
            activeTabColorPnl->Refresh();

            wxColor fileBtColor;
            pConfig->Read( _T( "/Skin/FileButtonColor" ), &fileBtColor );
            fileBtColorPnl->SetBackgroundColour( fileBtColor );
            fileBtColorPnl->Refresh();

            wxString tabStyle;
            pConfig->Read( _T( "/Skin/TabStyle" ), &tabStyle );
            tabBox->SetSelection(tabStyle == "Flat" ? 1 : 0);

            wxString toolbarStyle;
            pConfig->Read( _T( "/Skin/ToolbarStyle" ), &toolbarStyle );
            toolbarBox->SetSelection(toolbarStyle == "Flat" ? 1 : 0);

            bool toolbarHasCustomColor;
            pConfig->Read( _T( "/Skin/ToolbarHasCustomColor" ), &toolbarHasCustomColor );
            customToolbarColorCheck->SetValue(toolbarHasCustomColor);

            wxColor toolbarCustomColor;
            pConfig->Read( _T( "/Skin/ToolbarCustomColor" ), &toolbarCustomColor );
            toolbarColorPanel->SetBackgroundColour( toolbarCustomColor );
            toolbarColorPanel->Refresh();
        }
        else
        {
            wxCommandEvent useless;
            OnGDMetroStyleClick(useless);
        }

    }

    {
        wxString result;

        if ( pConfig->Read( _T( "/EditeursExternes/Image" ), &result ) )
            EditeurImageEdit->ChangeValue( result );
        if ( pConfig->Read( _T( "/Dossier/Compilation" ), &result ) )
            DossierTempCompEdit->ChangeValue( result );
        if ( pConfig->Read( _T( "/Dossier/EventsCompilerTempDir" ), &result ) )
            eventsCompilerTempDirEdit->ChangeValue( result );
        if ( pConfig->Read( _T( "/Dossier/NewProjectDefaultFolder" ), &result ) )
            newProjectFolderEdit->ChangeValue( result );

        bool deleteTemporaries;
        if ( pConfig->Read( _T( "/Dossier/EventsCompilerDeleteTemp" ), &deleteTemporaries, true) )
            deleteTemporariesCheck->SetValue( deleteTemporaries );

    }

    {
        //Retrieve available languages files
        std::vector <gd::String> languagesAvailables;
        wxDir dir(wxGetCwd()+"/locale/");
        wxString filename;

        bool cont = dir.GetFirst(&filename, "", wxDIR_DIRS);
        while ( cont )
        {
            languagesAvailables.push_back(filename);
            cont = dir.GetNext(&filename);
        }

        langChoice->Clear();

        //Add languages to list and retrieve selected language
        for (std::size_t i = 0;i<languagesAvailables.size();++i)
        {
            const wxLanguageInfo * language = wxLocale::FindLanguageInfo(languagesAvailables[i]);
            langChoice->Append(language->Description);

            if (gd::LocaleManager::Get()->locale->GetLanguage() == language->Language)
                langChoice->SetSelection(i);
        }
    }

    {
        int time = 180000;
        bool activated = true;

        pConfig->Read( _T( "/Autosave/Time" ), &time );
        pConfig->Read( _T( "/Autosave/Activated" ), &activated );

        autosaveTimeEdit->ChangeValue( gd::String::From(static_cast<float>(time)/60.0f/1000.0f) );
        autosaveActivatedCheck->SetValue(activated);
    }

    {
        int position = 1;
        pConfig->Read( _T( "/SceneEditor/SceneEventsTab" ), &position );

        sceneEventsTabPosition->SetSelection(position);
    }
    {
        wxString result;
        pConfig->Read("/Code/ExternalEditor", &result);
        codeEditorEdit->SetValue(result);
        bool useExternalEditor;
        pConfig->Read("/Code/UseExternalEditor", &useExternalEditor, false);
        if ( useExternalEditor ) externalCodeEditorCheck->SetValue(true);
    }
    {
        bool useLogFile;
        pConfig->Read("/Log/Activated", &useLogFile, false);
        if ( useLogFile ) logCheck->SetValue(true);

        pConfig->Read("/Log/File", &logFile);
    }
    {
        bool sendInfo;
        pConfig->Read("/Startup/SendInfo", &sendInfo, true);
        if ( sendInfo ) sendInfoCheck->SetValue(true);
    }
    {
        bool avertOnSave;
        pConfig->Read("/Save/AvertOnSaveAs", &avertOnSave, true);
        if ( avertOnSave ) avertOnSaveCheck->SetValue(true);
    }
    {
        bool useExternalEditor;
        pConfig->Read("/SceneEditor/ExternalSceneEditor", &useExternalEditor, false);
        if ( useExternalEditor ) externalSceneEditorCheck->SetValue(true);
    }

	conditionsColumnWidthEdit->SetValue(gd::String::From(static_cast<int>(pConfig->ReadDouble("EventsEditor/ConditionColumnWidth", 350))));
	hideContextPanelsLabels->SetValue(pConfig->ReadBool("EventsEditor/HideContextPanelsLabels", false));

	wxFont eventsEditorFont;
	if ( pConfig->Read("EventsEditor/Font", &eventsEditorFont) )
    {
        eventsEditorFontDialog->GetFontData().SetInitialFont(eventsEditorFont);
        eventsEditorFontDialog->GetFontData().SetChosenFont(eventsEditorFont);
    }
    else
    {
        eventsEditorFontDialog->GetFontData().SetInitialFont(gd::EventsRenderingHelper::Get()->GetFont());
        eventsEditorFontDialog->GetFontData().SetChosenFont(gd::EventsRenderingHelper::Get()->GetFont());
    }

    int eventsCompilerMaxThread = 0;
    if ( pConfig->Read("/CodeCompiler/MaxThread", &eventsCompilerMaxThread, 1) )
    {
        codeCompilerThreadEdit->SetValue(eventsCompilerMaxThread);
    }

    wxString javaDir;
    if ( pConfig->Read("/Paths/Java", &javaDir) )
    {
        javaDirEdit->SetValue(javaDir);
    }
}

Preferences::~Preferences()
{
    //(*Destroy(Preferences)
    //*)
}

void Preferences::OnOkBtClick( wxCommandEvent& event )
{
    wxConfigBase * pConfig = wxConfigBase::Get();

    //Startup options
    if ( MAJCheck->GetValue() )
    {
        pConfig->Write( _T( "/Startup/CheckUpdate" ), "true" );
    }
    else { pConfig->Write( _T( "/Startup/CheckUpdate" ), "false" ); }


    //Skin options
    wxColourData cData;

    if ( ribbonStyleBox->GetSelection() == 0)
        pConfig->Write( _T( "/Skin/RibbonStyle" ), "Office" );
    else if ( ribbonStyleBox->GetSelection() == 1 )
        pConfig->Write( _T( "/Skin/RibbonStyle" ), "AUI" );
    else if ( ribbonStyleBox->GetSelection() == 2 )
        pConfig->Write( _T( "/Skin/RibbonStyle" ), "Metro" );
    else
        pConfig->Write( _T( "/Skin/RibbonStyle" ), "Office" );

    pConfig->Write( _T( "/Skin/RDefined" ), "true" );
    pConfig->Write( _T( "/Skin/Defined" ), "true" );

    //Ribbon Primary Color
    cData.SetColour( ribbonColor1Pnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/Ribbon1R" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/Ribbon1G" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/Ribbon1B" ), cData.GetColour().Blue() );

    //Ribbon Secondary Color
    cData.SetColour( ribbonColor2Pnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/Ribbon2R" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/Ribbon2G" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/Ribbon2B" ), cData.GetColour().Blue() );

    //Panes caption colors
    cData.SetColour( ActifColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/PaneA1R" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/PaneA1G" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/PaneA1B" ), cData.GetColour().Blue() );

    cData.SetColour( ActifColor2Pnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/PaneA2R" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/PaneA2G" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/PaneA2B" ), cData.GetColour().Blue() );

    cData.SetColour( InactifColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/PaneI1R" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/PaneI1G" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/PaneI1B" ), cData.GetColour().Blue() );

    cData.SetColour( InactifColor2Pnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/PaneI2R" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/PaneI2G" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/PaneI2B" ), cData.GetColour().Blue() );

    //Panes' borders color
    cData.SetColour( borderColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/BorderR" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/BorderG" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/BorderB" ), cData.GetColour().Blue() );

    //Background color
    cData.SetColour( backColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/BackR" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/BackG" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/BackB" ), cData.GetColour().Blue() );

    //Active texte color
    cData.SetColour( activeTextColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/ATextR" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/ATextG" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/ATextB" ), cData.GetColour().Blue() );

    //Inactive texte color
    cData.SetColour( inactiveTextColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/ITextR" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/ITextG" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/ITextB" ), cData.GetColour().Blue() );

    pConfig->Write( _T( "/Skin/TabColor"), tabColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/ActiveTabColor"), activeTabColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/FileButtonColor"), fileBtColorPnl->GetBackgroundColour() );

    pConfig->Write( _T( "/Skin/HideLabels"), hideLabelsCheck->GetValue() );

    pConfig->Write( _T( "/Skin/TabStyle" ), tabBox->GetSelection() == 1 ? "Flat" : "Normal" );
    pConfig->Write( _T( "/Skin/ToolbarStyle" ), toolbarBox->GetSelection() == 1 ? "Flat" : "Normal" );
    pConfig->Write( _T( "/Skin/ToolbarHasCustomColor" ), customToolbarColorCheck->GetValue() );
    pConfig->Write( _T( "/Skin/ToolbarCustomColor" ), toolbarColorPanel->GetBackgroundColour() );

    pConfig->Write( _T( "/EditeursExternes/Image" ), EditeurImageEdit->GetValue() );
    pConfig->Write( _T( "/Dossier/Compilation" ), DossierTempCompEdit->GetValue() );
    pConfig->Write( _T( "/Dossier/EventsCompilerTempDir" ), eventsCompilerTempDirEdit->GetValue() );
    pConfig->Write( _T( "/Dossier/EventsCompilerDeleteTemp" ), deleteTemporariesCheck->GetValue());
    pConfig->Write( _T( "/Dossier/NewProjectDefaultFolder" ), newProjectFolderEdit->GetValue());
    CodeCompiler::Get()->SetMustDeleteTemporaries(deleteTemporariesCheck->GetValue());

    const wxLanguageInfo * language = wxLocale::FindLanguageInfo(langChoice->GetString(langChoice->GetSelection()));
    pConfig->Write( _T( "/Lang" ), language->CanonicalName );
    gd::LocaleManager::Get()->SetLanguage(language->Language);

    if ( changesNeedRestart )
    {
        gd::LogMessage(_("GDevelop must be relaunched to apply changes."));
    }

    pConfig->Write( "/Autosave/Activated", autosaveActivatedCheck->GetValue());
    pConfig->Write( "/Autosave/Time", gd::String(autosaveTimeEdit->GetValue()).To<int>()*60*1000);

    pConfig->Write( "/SceneEditor/SceneEventsTab", sceneEventsTabPosition->GetSelection());

    pConfig->Write("/Code/ExternalEditor", codeEditorEdit->GetValue());
    pConfig->Write("/Code/UseExternalEditor", externalCodeEditorCheck->GetValue());

    pConfig->Write("/Log/Activated", logCheck->GetValue());
    pConfig->Write("/Log/File", logFile);
    LogFileManager::Get()->InitalizeFromConfig();

    pConfig->Write("/Startup/SendInfo", sendInfoCheck->GetValue());

    pConfig->Write("/Save/AvertOnSaveAs", avertOnSaveCheck->GetValue());

    pConfig->Write("/SceneEditor/ExternalSceneEditor", externalSceneEditorCheck->GetValue());

    gd::InstructionSentenceFormatter * eventsEditorConfig = gd::InstructionSentenceFormatter::Get();
    for (std::map<gd::String, gd::TextFormatting>::iterator it = eventsEditorConfig->typesFormatting.begin();it!=eventsEditorConfig->typesFormatting.end();++it)
    {
        if ( eventsEditorParametersProperties->GetProperty(it->first) != NULL)
        {
            wxColor color;
            wxFromString("rgb"+eventsEditorParametersProperties->GetProperty(it->first)->GetValueAsString(), &color);
            eventsEditorConfig->typesFormatting[it->first].SetColor(color);
        }

        if ( eventsEditorParametersProperties->GetProperty(it->first+_(": Bold")) != NULL)
        {
            wxAny bold = eventsEditorParametersProperties->GetProperty(it->first+_(": Bold"))->GetValue();
            eventsEditorConfig->typesFormatting[it->first].bold = wxANY_AS(bold, bool);
        }

        if ( eventsEditorParametersProperties->GetProperty(it->first+_(": Italic")) != NULL)
        {
            wxAny italic = eventsEditorParametersProperties->GetProperty(it->first+_(": Italic"))->GetValue();
            eventsEditorConfig->typesFormatting[it->first].italic = wxANY_AS(italic, bool);
        }
    }

    gd::InstructionSentenceFormatter::Get()->SaveTypesFormattingToConfig();
	pConfig->Write("EventsEditor/ConditionColumnWidth", gd::String(conditionsColumnWidthEdit->GetValue()).To<int>());
	pConfig->Write("EventsEditor/HideContextPanelsLabels", hideContextPanelsLabels->GetValue());
	pConfig->Write("EventsEditor/Font", eventsEditorFontDialog->GetFontData().GetChosenFont());

    pConfig->Write("/CodeCompiler/MaxThread", codeCompilerThreadEdit->GetValue() );
    CodeCompiler::Get()->AllowMultithread(codeCompilerThreadEdit->GetValue() > 1, codeCompilerThreadEdit->GetValue());

    pConfig->Write("/Paths/Java", javaDirEdit->GetValue() );

    pConfig->Flush(); //Write changes to disk, in case of an application crash.
    EndModal( 1 );
}

void Preferences::OnAnnulerBtClick( wxCommandEvent& event )
{
    EndModal( 0 );
}


void Preferences::OnOfficeGDStyleBtClick(wxCommandEvent& event)
{
    ribbonStyleBox->SetSelection(0);

    ribbonColor1Pnl->SetBackgroundColour( wxColour(244, 245, 247) );
    ribbonColor1Pnl->Refresh();

    ribbonColor2Pnl->SetBackgroundColour( wxColour(231, 241, 254) );
    ribbonColor2Pnl->Refresh();

    ActifColorPnl->SetBackgroundColour( wxColour(221,229,246) );
    ActifColorPnl->Refresh();

    ActifColor2Pnl->SetBackgroundColour( wxColour(221,229,246) );
    ActifColor2Pnl->Refresh();

    InactifColorPnl->SetBackgroundColour( wxColour(214,221,233) );
    InactifColorPnl->Refresh();

    InactifColor2Pnl->SetBackgroundColour( wxColour(214,221,233) );
    InactifColor2Pnl->Refresh();

    borderColorPnl->SetBackgroundColour( wxColour(172,183,208) );
    borderColorPnl->Refresh();

    backColorPnl->SetBackgroundColour( wxColour(211,222,246) );
    backColorPnl->Refresh();

    activeTextColorPnl->SetBackgroundColour( wxColour(104,114,138) );
    activeTextColorPnl->Refresh();

    inactiveTextColorPnl->SetBackgroundColour( wxColour(104,114,138) );
    inactiveTextColorPnl->Refresh();

    tabColorPnl->SetBackgroundColour( wxColour(220, 225, 232) );
    tabColorPnl->Refresh();

    activeTabColorPnl->SetBackgroundColour( wxColour(220, 225, 232) );
    activeTabColorPnl->Refresh();

    fileBtColorPnl->SetBackgroundColour( wxColour(200, 200, 255) );
    fileBtColorPnl->Refresh();

    customToolbarColorCheck->SetValue(false);
    toolbarBox->SetSelection(0);
    tabBox->SetSelection(0);
}

/**
 * Set Office-like skin
 */
void Preferences::OnofficeStyleBtClick(wxCommandEvent& event)
{
    ribbonStyleBox->SetSelection(0);

    ribbonColor1Pnl->SetBackgroundColour( wxColour(194, 216, 241) );
    ribbonColor1Pnl->Refresh();

    ribbonColor2Pnl->SetBackgroundColour( wxColour(255, 223, 114) );
    ribbonColor2Pnl->Refresh();

    ActifColorPnl->SetBackgroundColour( wxColour(201,224,252) );
    ActifColorPnl->Refresh();

    ActifColor2Pnl->SetBackgroundColour( wxColour(201,224,252) );
    ActifColor2Pnl->Refresh();

    InactifColorPnl->SetBackgroundColour( wxColour(192,216,240) );
    InactifColorPnl->Refresh();

    InactifColor2Pnl->SetBackgroundColour( wxColour(192,216,240) );
    InactifColor2Pnl->Refresh();

    borderColorPnl->SetBackgroundColour( wxColour(140,178,226) );
    borderColorPnl->Refresh();

    backColorPnl->SetBackgroundColour( wxColour(188,218,254) );
    backColorPnl->Refresh();

    activeTextColorPnl->SetBackgroundColour( wxColour(62,106,166) );
    activeTextColorPnl->Refresh();

    inactiveTextColorPnl->SetBackgroundColour( wxColour(62,106,166) );
    inactiveTextColorPnl->Refresh();

    tabColorPnl->SetBackgroundColour( wxColour(220, 225, 232) );
    tabColorPnl->Refresh();

    activeTabColorPnl->SetBackgroundColour( wxColour(220, 225, 232) );
    activeTabColorPnl->Refresh();

    fileBtColorPnl->SetBackgroundColour( wxColour(200, 200, 255) );
    fileBtColorPnl->Refresh();

    customToolbarColorCheck->SetValue(false);
    toolbarBox->SetSelection(0);
    tabBox->SetSelection(0);
}

/**
 * Set AUI style skin
 */
void Preferences::OnauiStyleBtClick(wxCommandEvent& event)
{
    ribbonStyleBox->SetSelection(1);

    ribbonColor1Pnl->SetBackgroundColour( wxColour(240, 240, 240) );
    ribbonColor1Pnl->Refresh();

    ribbonColor2Pnl->SetBackgroundColour( wxColour(51, 153, 255) );
    ribbonColor2Pnl->Refresh();

    ActifColorPnl->SetBackgroundColour( wxColour(151,203,255) );
    ActifColorPnl->Refresh();

    ActifColor2Pnl->SetBackgroundColour( wxColour(66,160,255) );
    ActifColor2Pnl->Refresh();

    InactifColorPnl->SetBackgroundColour( wxColour(183,183,183) );
    InactifColorPnl->Refresh();

    InactifColor2Pnl->SetBackgroundColour( wxColour(206,206,206) );
    InactifColor2Pnl->Refresh();

    borderColorPnl->SetBackgroundColour( wxColour(161,161,161) );
    borderColorPnl->Refresh();

    backColorPnl->SetBackgroundColour( wxColour(240,240,240) );
    backColorPnl->Refresh();

    activeTextColorPnl->SetBackgroundColour( wxColour(0,0,0) );
    activeTextColorPnl->Refresh();

    inactiveTextColorPnl->SetBackgroundColour( wxColour(0,0,0) );
    inactiveTextColorPnl->Refresh();

    tabColorPnl->SetBackgroundColour( wxColour(220, 220, 220) );
    tabColorPnl->Refresh();

    activeTabColorPnl->SetBackgroundColour( wxColour(220, 220, 220) );
    activeTabColorPnl->Refresh();

    fileBtColorPnl->SetBackgroundColour( wxColour(220, 220, 255) );
    fileBtColorPnl->Refresh();

    customToolbarColorCheck->SetValue(false);
    toolbarBox->SetSelection(0);
    tabBox->SetSelection(0);
}

void Preferences::OnradianceStyleBtClick(wxCommandEvent& event)
{
    ribbonStyleBox->SetSelection(0);

    ribbonColor1Pnl->SetBackgroundColour( wxColour(242, 242, 242) );
    ribbonColor1Pnl->Refresh();

    ribbonColor2Pnl->SetBackgroundColour( wxColour(235, 112, 61) );
    ribbonColor2Pnl->Refresh();

    ActifColorPnl->SetBackgroundColour( wxColour(235,112,61) );
    ActifColorPnl->Refresh();

    ActifColor2Pnl->SetBackgroundColour( wxColour(249,134,88) );
    ActifColor2Pnl->Refresh();

    InactifColorPnl->SetBackgroundColour( wxColour(247,246,246) );
    InactifColorPnl->Refresh();

    InactifColor2Pnl->SetBackgroundColour( wxColour(252,252,251) );
    InactifColor2Pnl->Refresh();

    borderColorPnl->SetBackgroundColour( wxColour(247,246,246) );
    borderColorPnl->Refresh();

    backColorPnl->SetBackgroundColour( wxColour(240,240,240) );
    backColorPnl->Refresh();

    activeTextColorPnl->SetBackgroundColour( wxColour(255,255,255) );
    activeTextColorPnl->Refresh();

    inactiveTextColorPnl->SetBackgroundColour( wxColour(76,76,76) );
    inactiveTextColorPnl->Refresh();

    tabColorPnl->SetBackgroundColour( wxColour(240, 240, 236) );
    tabColorPnl->Refresh();

    activeTabColorPnl->SetBackgroundColour( wxColour(255, 138, 102) );
    activeTabColorPnl->Refresh();

    fileBtColorPnl->SetBackgroundColour( wxColour(255, 103, 89) );
    fileBtColorPnl->Refresh();

    customToolbarColorCheck->SetValue(false);
    toolbarBox->SetSelection(0);
    tabBox->SetSelection(0);
}

void Preferences::OnoxygenStyleBtClick(wxCommandEvent& event)
{
    ribbonStyleBox->SetSelection(0);

    ribbonColor1Pnl->SetBackgroundColour( wxColour(218, 218, 218) );
    ribbonColor1Pnl->Refresh();

    ribbonColor2Pnl->SetBackgroundColour( wxColour(117, 204, 255) );
    ribbonColor2Pnl->Refresh();

    ActifColorPnl->SetBackgroundColour( wxColour(117,204,255) );
    ActifColorPnl->Refresh();

    ActifColor2Pnl->SetBackgroundColour( wxColour(172,225,255) );
    ActifColor2Pnl->Refresh();

    InactifColorPnl->SetBackgroundColour( wxColour(247,246,246) );
    InactifColorPnl->Refresh();

    InactifColor2Pnl->SetBackgroundColour( wxColour(252,252,251) );
    InactifColor2Pnl->Refresh();

    borderColorPnl->SetBackgroundColour( wxColour(247,246,246) );
    borderColorPnl->Refresh();

    backColorPnl->SetBackgroundColour( wxColour(240,240,240) );
    backColorPnl->Refresh();

    activeTextColorPnl->SetBackgroundColour( wxColour(0,0,0) );
    activeTextColorPnl->Refresh();

    inactiveTextColorPnl->SetBackgroundColour( wxColour(120,120,120) );
    inactiveTextColorPnl->Refresh();

    tabColorPnl->SetBackgroundColour( wxColour(240, 240, 236) );
    tabColorPnl->Refresh();

    activeTabColorPnl->SetBackgroundColour( wxColour(172, 225, 255) );
    activeTabColorPnl->Refresh();

    fileBtColorPnl->SetBackgroundColour( wxColour(168, 247, 255) );
    fileBtColorPnl->Refresh();

    customToolbarColorCheck->SetValue(false);
    toolbarBox->SetSelection(0);
    tabBox->SetSelection(0);
}

void Preferences::OnGDMetroStyleClick(wxCommandEvent& event)
{
    ribbonStyleBox->SetSelection(2);

    ribbonColor1Pnl->SetBackgroundColour( wxColour(245, 245, 245) );
    ribbonColor1Pnl->Refresh();

    ribbonColor2Pnl->SetBackgroundColour( wxColour(196, 203, 255) );
    ribbonColor2Pnl->Refresh();

    ActifColorPnl->SetBackgroundColour( wxColour(145,0,206) );
    ActifColorPnl->Refresh();

    ActifColor2Pnl->SetBackgroundColour( wxColour(145,0,206) );
    ActifColor2Pnl->Refresh();

    InactifColorPnl->SetBackgroundColour( wxColour(145,0,206) );
    InactifColorPnl->Refresh();

    InactifColor2Pnl->SetBackgroundColour( wxColour(145,0,206) );
    InactifColor2Pnl->Refresh();

    borderColorPnl->SetBackgroundColour( wxColour(236,236,236) );
    borderColorPnl->Refresh();

    backColorPnl->SetBackgroundColour( wxColour(236,236,236) );
    backColorPnl->Refresh();

    activeTextColorPnl->SetBackgroundColour( wxColour(255,255,255) );
    activeTextColorPnl->Refresh();

    inactiveTextColorPnl->SetBackgroundColour( wxColour(255,255,255) );
    inactiveTextColorPnl->Refresh();

    tabColorPnl->SetBackgroundColour( wxColour(239,239,239) );
    tabColorPnl->Refresh();

    activeTabColorPnl->SetBackgroundColour( wxColour(255, 255, 255) );
    activeTabColorPnl->Refresh();

    fileBtColorPnl->SetBackgroundColour( wxColour(145, 0, 206) );
    fileBtColorPnl->Refresh();

    customToolbarColorCheck->SetValue(false);
    toolbarBox->SetSelection(1);
    tabBox->SetSelection(1);
}

void Preferences::OnMetroWhiteStyleClick(wxCommandEvent& event)
{
    ribbonStyleBox->SetSelection(2);

    ribbonColor1Pnl->SetBackgroundColour( wxColour(255, 255, 255) );
    ribbonColor1Pnl->Refresh();

    ribbonColor2Pnl->SetBackgroundColour( wxColour(196, 203, 255) );
    ribbonColor2Pnl->Refresh();

    ActifColorPnl->SetBackgroundColour( wxColour(235,235,235) );
    ActifColorPnl->Refresh();

    ActifColor2Pnl->SetBackgroundColour( wxColour(235,235,235) );
    ActifColor2Pnl->Refresh();

    InactifColorPnl->SetBackgroundColour( wxColour(235,235,235) );
    InactifColorPnl->Refresh();

    InactifColor2Pnl->SetBackgroundColour( wxColour(235,235,235) );
    InactifColor2Pnl->Refresh();

    borderColorPnl->SetBackgroundColour( wxColour(236,236,236) );
    borderColorPnl->Refresh();

    backColorPnl->SetBackgroundColour( wxColour(236,236,236) );
    backColorPnl->Refresh();

    activeTextColorPnl->SetBackgroundColour( wxColour(0,0,0) );
    activeTextColorPnl->Refresh();

    inactiveTextColorPnl->SetBackgroundColour( wxColour(0,0,0) );
    inactiveTextColorPnl->Refresh();

    tabColorPnl->SetBackgroundColour( wxColour(233,233,233) );
    tabColorPnl->Refresh();

    activeTabColorPnl->SetBackgroundColour( wxColour(255, 255, 255) );
    activeTabColorPnl->Refresh();

    fileBtColorPnl->SetBackgroundColour( wxColour(25, 47, 138) );
    fileBtColorPnl->Refresh();

    customToolbarColorCheck->SetValue(false);
    toolbarBox->SetSelection(1);
    tabBox->SetSelection(1);
}


void Preferences::OnActifColorPnlRightUp( wxMouseEvent& event )
{
    wxColourData cData;
    cData.SetColour( ActifColorPnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        ActifColorPnl->SetBackgroundColour( cData.GetColour() );
        ActifColorPnl->Refresh();
    }
}

void Preferences::OnActifColor2PnlRightUp( wxMouseEvent& event )
{
    wxColourData cData;
    cData.SetColour( ActifColor2Pnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        ActifColor2Pnl->SetBackgroundColour( cData.GetColour() );
        ActifColor2Pnl->Refresh();
    }
}

void Preferences::OnInactifColorPnlRightUp( wxMouseEvent& event )
{
    wxColourData cData;
    cData.SetColour( InactifColorPnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        InactifColorPnl->SetBackgroundColour( cData.GetColour() );
        InactifColorPnl->Refresh();
    }
}

void Preferences::OnInactifColor2PnlRightUp( wxMouseEvent& event )
{
    wxColourData cData;
    cData.SetColour( InactifColor2Pnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        InactifColor2Pnl->SetBackgroundColour( cData.GetColour() );
        InactifColor2Pnl->Refresh();
    }
}

void Preferences::OnAideBtClick( wxCommandEvent& event )
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation"); //TODO
}

void Preferences::OnBrowseDossierTempBtClick( wxCommandEvent& event )
{
    wxDirDialog dialog( this, _( "Choose a temporary folder for deployment" ), "");

    if ( dialog.ShowModal() != wxID_CANCEL )
    {
        DossierTempCompEdit->ChangeValue(dialog.GetPath());
    }
}

void Preferences::OnnewProjectFolderBrowseBtClick(wxCommandEvent& event)
{
    wxDirDialog dialog( this, _( "Choose the default folder for new projects" ), "");

    if ( dialog.ShowModal() != wxID_CANCEL )
        newProjectFolderEdit->ChangeValue(dialog.GetPath());
}

void Preferences::OnbrowseCompilationTempDirClick(wxCommandEvent& event)
{
    wxDirDialog dialog( this, _( "Choose a temporary folder for compilation" ), "");
    dialog.ShowModal();

    if ( dialog.GetPath() != "" )
    {
        eventsCompilerTempDirEdit->ChangeValue(dialog.GetPath());
    }
}


void Preferences::OnbrowseJavaBtClick(wxCommandEvent& event)
{
    wxDirDialog dialog( this, _( "Choose the directory containing the java executable" ), "");

    if ( dialog.ShowModal() != wxID_CANCEL )
        javaDirEdit->ChangeValue(dialog.GetPath());
}

void Preferences::OnBrowseEditionImageClick(wxCommandEvent& event)
{
    wxFileDialog dialog( this, _( "Choose a image editing software" ), "", "", "Programme (*.exe)|*.exe|All Files (*.*)|*.*" );
    dialog.ShowModal();

    if ( !dialog.GetPath().empty() )
        EditeurImageEdit->ChangeValue(dialog.GetPath());
}

void Preferences::OnribbonColor1PnlLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( ribbonColor1Pnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        ribbonColor1Pnl->SetBackgroundColour( cData.GetColour() );
        ribbonColor1Pnl->Refresh();
    }
}

void Preferences::OnribbonColor2PnlLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( ribbonColor2Pnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        ribbonColor2Pnl->SetBackgroundColour( cData.GetColour() );
        ribbonColor2Pnl->Refresh();
    }
}

void Preferences::OnbackColorPnlLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( backColorPnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        backColorPnl->SetBackgroundColour( cData.GetColour() );
        backColorPnl->Refresh();
    }
}

void Preferences::OnborderColorPnlLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( borderColorPnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        borderColorPnl->SetBackgroundColour( cData.GetColour() );
        borderColorPnl->Refresh();
    }
}

void Preferences::OnhideLabelsCheckClick(wxCommandEvent& event)
{
    changesNeedRestart = true;
}

void Preferences::OnlangChoiceSelect(wxCommandEvent& event)
{
    changesNeedRestart = true;
}

void Preferences::OnbrowseCodeEditorBtClick(wxCommandEvent& event)
{
    wxFileDialog dialog( this, _( "Choose an external code editor" ), "", "", _("Program (*.exe)|*.exe") );
    dialog.ShowModal();

    if ( !dialog.GetPath().empty() )
        codeEditorEdit->ChangeValue(dialog.GetPath());
}

void Preferences::OnactiveTabColorPnlLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( activeTabColorPnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        activeTabColorPnl->SetBackgroundColour( cData.GetColour() );
        activeTabColorPnl->Refresh();
    }
}

void Preferences::OntabColorPnlLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( tabColorPnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        tabColorPnl->SetBackgroundColour( cData.GetColour() );
        tabColorPnl->Refresh();
    }
}

void Preferences::OneventsCompilerTempDirEditText(wxCommandEvent& event)
{
    changesNeedRestart = true;
}


void Preferences::OnactiveTextColorPnlLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( activeTextColorPnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        activeTextColorPnl->SetBackgroundColour( cData.GetColour() );
        activeTextColorPnl->Refresh();
    }
}

void Preferences::OninactiveTextColorPnlLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( inactiveTextColorPnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        inactiveTextColorPnl->SetBackgroundColour( cData.GetColour() );
        inactiveTextColorPnl->Refresh();
    }
}

void Preferences::OnfileBtColorPnlLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( fileBtColorPnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        fileBtColorPnl->SetBackgroundColour( cData.GetColour() );
        fileBtColorPnl->Refresh();
    }
}

void Preferences::OnlogCheckClick(wxCommandEvent& event)
{
    if ( logCheck->GetValue() )
    {
        wxFileDialog dialog( this, _( "Choose where the log file must be saved" ), "", "", _("Log file (*.txt)|*.txt"), wxFD_SAVE );
        if ( dialog.ShowModal() == wxCANCEL) return;

        logFile = dialog.GetPath();
    }
}

void Preferences::OneventsEditorFontBtClick(wxCommandEvent& event)
{
    wxFont oldFont = eventsEditorFontDialog->GetFontData().GetChosenFont();
    eventsEditorFontDialog->ShowModal();

    //Ensure we can use this font with the events editor.
    if (eventsEditorFontDialog->GetFontData().GetChosenFont().GetFamily() != wxFONTFAMILY_TELETYPE &&
        eventsEditorFontDialog->GetFontData().GetChosenFont().GetFamily() != wxFONTFAMILY_MODERN )
    {
        eventsEditorFontDialog->GetFontData().GetChosenFont() = oldFont;
        gd::LogWarning(_("The font you have chosen is not a fixed-width font. It cannot be used by the events editor.\n"));
    }
}

void Preferences::OncustomToolbarColorCheckClick(wxCommandEvent& event)
{
    toolbarColorPanel->Enable(customToolbarColorCheck->GetValue());
}

void Preferences::OnMAJCheckClick(wxCommandEvent& event)
{
}

void Preferences::OntoolbarColorPanelLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( toolbarColorPanel->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        toolbarColorPanel->SetBackgroundColour( cData.GetColour() );
        toolbarColorPanel->Refresh();
    }
}

void Preferences::OnexternalSceneEditorCheckClick(wxCommandEvent& event)
{
}
