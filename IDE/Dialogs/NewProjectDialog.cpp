/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "NewProjectDialog.h"

#include <fstream>
//(*InternalHeaders(NewProjectDialog)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/imaglist.h>
#include <wx/filename.h>
#include <wx/filedlg.h>
#include <wx/dir.h>
#include <wx/config.h>
#ifdef __WXMSW__
#include <wx/msw/uxtheme.h>
#endif
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"
#include "GDCore/CommonTools.h"
#include "../PlatformManager.h"

//(*IdInit(NewProjectDialog)
const long NewProjectDialog::ID_STATICTEXT1 = wxNewId();
const long NewProjectDialog::ID_LISTCTRL1 = wxNewId();
const long NewProjectDialog::ID_LISTCTRL2 = wxNewId();
const long NewProjectDialog::ID_STATICTEXT2 = wxNewId();
const long NewProjectDialog::ID_TEXTCTRL1 = wxNewId();
const long NewProjectDialog::ID_BUTTON3 = wxNewId();
const long NewProjectDialog::ID_STATICLINE1 = wxNewId();
const long NewProjectDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long NewProjectDialog::ID_BUTTON1 = wxNewId();
const long NewProjectDialog::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(NewProjectDialog,wxDialog)
	//(*EventTable(NewProjectDialog)
	//*)
END_EVENT_TABLE()

NewProjectDialog::NewProjectDialog(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size) :
    userWantToBrowseExamples(false)
{
	//(*Initialize(NewProjectDialog)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxBoxSizer* BoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, id, _("Create a new project"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("id"));
	SetClientSize(wxDefaultSize);
	Move(wxDefaultPosition);
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Choose a template:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer1->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	platformList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxDefaultSize, wxLC_REPORT|wxLC_NO_HEADER, wxDefaultValidator, _T("ID_LISTCTRL1"));
	platformList->Hide();
	BoxSizer1->Add(platformList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	templateList = new wxListCtrl(this, ID_LISTCTRL2, wxDefaultPosition, wxDefaultSize, wxLC_REPORT|wxLC_NO_HEADER, wxDefaultValidator, _T("ID_LISTCTRL2"));
	BoxSizer1->Add(templateList, 3, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(BoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableCol(1);
	FlexGridSizer4->AddGrowableRow(0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Choose a file for the project:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer4->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer5->AddGrowableRow(0);
	projectFileEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer5->Add(projectFileEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	browseBt = new wxButton(this, ID_BUTTON3, _("..."), wxDefaultPosition, wxSize(31,23), 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer5->Add(browseBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	examplesBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("You can also browse the examples"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	FlexGridSizer3->Add(examplesBt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	createProjectBt = new wxButton(this, ID_BUTTON1, _("Create the new project"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(createProjectBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&NewProjectDialog::OnplatformListItemSelect);
	Connect(ID_LISTCTRL2,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&NewProjectDialog::OntemplateListItemSelect);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&NewProjectDialog::OnbrowseBtClick);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&NewProjectDialog::OnexamplesBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&NewProjectDialog::OncreateProjectBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&NewProjectDialog::OncancelBtClick);
	Connect(wxEVT_SIZE,(wxObjectEventFunction)&NewProjectDialog::OnResize);
	//*)
    #if defined(__WXMSW__) //Offer nice look to lists
    {
        wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
        if(theme) theme->SetWindowTheme((HWND) platformList->GetHWND(), L"EXPLORER", NULL);
    }
    {
        wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
        if(theme) theme->SetWindowTheme((HWND) templateList->GetHWND(), L"EXPLORER", NULL);
    }
    #endif

    projectFileEdit->AutoCompleteDirectories();

    //Get the base folder for the new projects
    wxConfigBase::Get()->Read("/Dossier/NewProjectDefaultFolder", &newProjectBaseFolder);
    if ( newProjectBaseFolder.empty() ) newProjectBaseFolder = wxFileName::GetHomeDir()+wxFileName::GetPathSeparator()+
                                                               _("Game Develop projects")+wxFileName::GetPathSeparator();
    newProjectBaseFolder = wxFileName::FileName(newProjectBaseFolder).GetPath(); //Normalize.

    //Create a filename for the project
    wxString newProjectFile = newProjectBaseFolder+wxFileName::GetPathSeparator()+
                              _("My project")+wxFileName::GetPathSeparator()+
                              _("Project.gdg");
    unsigned int i = 2;
    while ( wxFileExists(newProjectFile) )
    {
        newProjectFile = newProjectBaseFolder+wxFileName::GetPathSeparator()+
                              _("My project")+" "+gd::ToString(i)+wxFileName::GetPathSeparator()+
                              _("Project.gdg");
        ++i;
    }
    projectFileEdit->SetValue(newProjectFile);

	SetSize(640,480);

    platformList->InsertColumn(0,_("Platform"), wxLIST_FORMAT_LEFT, 640);
    RefreshPlatformList();

    templateList->InsertColumn(0,_("Template"), wxLIST_FORMAT_LEFT, 640);
    templateList->InsertColumn(1,_("Description"), wxLIST_FORMAT_LEFT, 640);
    RefreshTemplateList();

    UpdateListColumnsWidth();
}

void NewProjectDialog::RefreshPlatformList()
{
    wxImageList * imageList = new wxImageList(32,32);
    imageList->Add(wxBitmap("res/icon32.png", wxBITMAP_TYPE_ANY));
    platformList->AssignImageList(imageList, wxIMAGE_LIST_SMALL);

    const std::vector< boost::shared_ptr<gd::Platform> > & platforms = PlatformManager::GetInstance()->GetAllPlatforms();
    for (unsigned int i = 0;i<platforms.size();++i)
    {
        platformList->InsertItem(0, platforms[i]->GetPlatformName(), 0);
        gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(platforms[i]->GetPlatformName());
        platformList->SetItemPtrData(0, wxPtrToUInt(associatedData));

        if (i == 0) chosenTemplatePlatform = platforms[i]->GetPlatformName();
    }
}

void NewProjectDialog::RefreshTemplateList()
{
    wxImageList * templateImageList = new wxImageList(32,32);
    templateList->AssignImageList(templateImageList, wxIMAGE_LIST_SMALL);

    wxString currentDir = wxGetCwd()+"/Templates";

    //Browse file and directories to add template files
    wxDir dir(currentDir);
    wxString filename;
    bool cont = dir.GetFirst(&filename, "", wxDIR_DEFAULT);
    while ( cont )
    {
        if ( wxDirExists(currentDir+"/"+filename) )
        {
            //Only add a template directory if there is a GDTemplate.gdg file inside it.
            if ( wxFileExists(currentDir+"/"+filename+"/GDTemplate.gdg") )
            {
                std::string platform;
                std::string name;
                std::string description;

                wxFileName descriptionFileName = wxFileName::FileName(currentDir+"/"+filename+"/GDTemplateDescription.txt");
                descriptionFileName.MakeAbsolute();
                std::ifstream descriptionFile(descriptionFileName.GetFullPath().c_str());
                if (descriptionFile.is_open())
                {
                    std::string currentLine;
                    for (unsigned int currentLineNb = 0; descriptionFile.good() ; ++currentLineNb )
                    {
                        getline (descriptionFile,currentLine);

                        if ( currentLineNb == 0 ) platform = currentLine;
                        else if ( currentLineNb == 1 ) name = currentLine;
                        else description += currentLine+"\n";
                    }
                }

                if ( platform == chosenTemplatePlatform )
                {
                    //Find the icon of the template
                    wxString iconFile = currentDir+"/"+filename+"/GDTemplateIcon.png";
                    wxBitmap icon = wxFileExists(iconFile) ? wxBitmap(iconFile, wxBITMAP_TYPE_ANY) : gd::CommonBitmapManager::GetInstance()->gdFileIcon32;
                    templateImageList->Add(icon);

                    templateList->InsertItem(0, name, templateImageList->GetImageCount()-1);
                    templateList->SetItem(0, 1, description);

                    //Set the data to be associated with the item
                    wxFileName templateFileName = wxFileName::FileName(currentDir+"/"+filename+"/GDTemplate.gdg");
                    templateFileName.MakeAbsolute();
                    gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(gd::ToString(templateFileName.GetFullPath()), platform);
                    templateList->SetItemPtrData(0, wxPtrToUInt(associatedData));

                }
            }
        }

        cont = dir.GetNext(&filename);
    }

    //Add a default empty project item
    templateList->InsertItem(0, _("Empty project"), 0);
    templateList->SetItem(0, 1, _("Create a new empty project"));
    templateList->SetItemPtrData(0, wxPtrToUInt(new gd::TreeItemStringData("", chosenTemplatePlatform)));
}

void NewProjectDialog::OnResize(wxSizeEvent& event)
{
    UpdateListColumnsWidth();
    templateList->Refresh();
    templateList->Update();
    event.Skip();
}

void NewProjectDialog::UpdateListColumnsWidth()
{
    templateList->SetColumnWidth(0, templateList->GetSize().GetWidth()*2.0/5.0-5);
    templateList->SetColumnWidth(1, templateList->GetSize().GetWidth()*3.0/5.0-5);
    platformList->SetColumnWidth(0, platformList->GetSize().GetWidth()-10);
}

NewProjectDialog::~NewProjectDialog()
{
	//(*Destroy(NewProjectDialog)
	//*)
}


void NewProjectDialog::OncreateProjectBtClick(wxCommandEvent& event)
{
    chosenFilename = gd::ToString(projectFileEdit->GetValue());
    EndModal(1);
}

void NewProjectDialog::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void NewProjectDialog::OntemplateListItemSelect(wxListEvent& event)
{
    gd::TreeItemStringData * associatedData = reinterpret_cast<gd::TreeItemStringData*>(event.GetItem().GetData());
    if ( associatedData != NULL )
    {
        chosenTemplateFile = associatedData->GetString();
        chosenTemplatePlatform = associatedData->GetSecondString();
    }
}

void NewProjectDialog::OnplatformListItemSelect(wxListEvent& event)
{
    gd::TreeItemStringData * associatedData = reinterpret_cast<gd::TreeItemStringData*>(event.GetItem().GetData());
    if ( associatedData != NULL )
    {
        chosenTemplatePlatform = associatedData->GetString();
    }
}

void NewProjectDialog::OnbrowseBtClick(wxCommandEvent& event)
{
    wxFileDialog dialog( this, _( "Choose a file for the project" ), newProjectBaseFolder, _("Project.gdg"), "\"Game Develop\" Project (*.gdg)|*.gdg", wxFD_SAVE );

    if ( dialog.ShowModal() != wxID_CANCEL )
    {
        projectFileEdit->ChangeValue(dialog.GetPath());
    }
}

void NewProjectDialog::OnexamplesBtClick(wxCommandEvent& event)
{
    EndModal(0);
    userWantToBrowseExamples = true;
}
