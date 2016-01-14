/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
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
#include "GDCore/IDE/wxTools/CommonBitmapProvider.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"
#include "GDCore/IDE/Analytics/AnalyticsSender.h"
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/PlatformManager.h"

//(*IdInit(NewProjectDialog)
const long NewProjectDialog::ID_STATICTEXT1 = wxNewId();
const long NewProjectDialog::ID_LISTCTRL1 = wxNewId();
const long NewProjectDialog::ID_LISTCTRL2 = wxNewId();
const long NewProjectDialog::ID_STATICTEXT3 = wxNewId();
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
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Choose a platform and a template:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer1->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	platformList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxDefaultSize, wxLC_REPORT|wxLC_NO_HEADER, wxDefaultValidator, _T("ID_LISTCTRL1"));
	BoxSizer1->Add(platformList, 2, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	templateList = new wxListCtrl(this, ID_LISTCTRL2, wxDefaultPosition, wxDefaultSize, wxLC_REPORT|wxLC_NO_HEADER, wxDefaultValidator, _T("ID_LISTCTRL2"));
	BoxSizer1->Add(templateList, 5, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(BoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	descTxt = new wxStaticText(this, ID_STATICTEXT3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer1->Add(descTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
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
	Connect(ID_LISTCTRL2,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&NewProjectDialog::OntemplateListItemActivated);
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
    templateList->SetMinSize(wxSize(150, -1));

    projectFileEdit->AutoCompleteDirectories();

    //Get the base folder for the new projects
    wxConfigBase::Get()->Read("/Dossier/NewProjectDefaultFolder", &newProjectBaseFolder);
    if ( newProjectBaseFolder.empty() ) newProjectBaseFolder = wxFileName::GetHomeDir()+wxFileName::GetPathSeparator()+
                                                               _("GDevelop projects")+wxFileName::GetPathSeparator();
    newProjectBaseFolder = wxFileName::FileName(newProjectBaseFolder).GetPath(); //Normalize.

    //Create a filename for the project
    wxString newProjectFile = newProjectBaseFolder+wxFileName::GetPathSeparator()+
                              _("My project")+wxFileName::GetPathSeparator()+
                              _("Project.gdg");
    std::size_t i = 2;
    while ( wxFileExists(newProjectFile) )
    {
        newProjectFile = newProjectBaseFolder+wxFileName::GetPathSeparator()+
                              _("My project")+" "+gd::String::From(i)+wxString(wxFileName::GetPathSeparator())+
                              _("Project.gdg");
        ++i;
    }
    projectFileEdit->SetValue(newProjectFile);

    #if !defined(MACOS)
    SetSize(640, 480);
    #else
	SetSize(-1, 480);
    #endif

    platformList->InsertColumn(0,_("Platform"), wxLIST_FORMAT_LEFT, 640);
    templateList->InsertColumn(0,_("Template"), wxLIST_FORMAT_LEFT, 640);
    templateList->InsertColumn(1,_("Description"), wxLIST_FORMAT_LEFT, 640);
    RefreshPlatformList();
    RefreshTemplateList();

    UpdateListColumnsWidth();

}

void NewProjectDialog::RefreshPlatformList()
{
    wxImageList * imageList = new wxImageList(32,32);
    imageList->Add(wxBitmap("res/icon32.png", wxBITMAP_TYPE_ANY));
    platformList->AssignImageList(imageList, wxIMAGE_LIST_SMALL);

    const std::vector< std::shared_ptr<gd::Platform> > & platforms = gd::PlatformManager::Get()->GetAllPlatforms();
    for (std::size_t i = 0;i<platforms.size();++i)
    {
        #if defined(MACOS)
        if (platforms[i]->GetName() == "GDevelop C++ platform") continue;
        #endif

        platformList->InsertItem(0, platforms[i]->GetFullName(), 0);
        gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(platforms[i]->GetName());
        platformList->SetItemPtrData(0, wxPtrToUInt(associatedData));

        if ( wxFileExists(platforms[i]->GetIcon()))
        {
            wxBitmap icon = wxBitmap(platforms[i]->GetIcon(), wxBITMAP_TYPE_ANY);
            if ( icon.IsOk() && icon.GetWidth() == 32 && icon.GetHeight() == 32)
            {
                imageList->Add(icon);
                platformList->SetItemImage(0, imageList->GetImageCount()-1);
            }
        }

        if (i == platforms.size()-1)
        {
            chosenTemplatePlatform = platforms[i]->GetName();
            platformList->SetItemState(0, wxLIST_STATE_SELECTED, wxLIST_STATE_SELECTED);
        }
    }
}

void NewProjectDialog::RefreshTemplateList()
{
    templateList->DeleteAllItems();

    wxImageList * templateImageList = new wxImageList(32,32);
    templateImageList->Add(wxBitmap("res/gdFile32.png", wxBITMAP_TYPE_ANY));
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
                gd::String platform;
                gd::String name;
                gd::String description;

                wxFileName descriptionFileName = wxFileName::FileName(currentDir+"/"+filename+"/GDTemplateDescription.txt");
                descriptionFileName.MakeAbsolute();
                std::ifstream descriptionFile(descriptionFileName.GetFullPath().c_str());
                if (descriptionFile.is_open())
                {
                    std::string currentLine;
                    for (std::size_t currentLineNb = 0; descriptionFile.good() ; ++currentLineNb )
                    {
                        getline (descriptionFile,currentLine);
                        if(!currentLine.empty() && *currentLine.rbegin() == '\r')
                            currentLine.erase( currentLine.length()-1, 1);


                        if ( currentLineNb == 0 ) platform = gd::String::FromUTF8(currentLine);
                        else if ( currentLineNb == 1 ) name = gd::String::FromUTF8(currentLine);
                        else description += gd::String::FromUTF8(currentLine)+"\n";
                    }
                }

                if ( platform == chosenTemplatePlatform )
                {
                    //Find the icon of the template
                    wxString iconFile = currentDir+"/"+filename+"/GDTemplateIcon.png";
                    wxBitmap icon = wxFileExists(iconFile) ? wxBitmap(iconFile, wxBITMAP_TYPE_ANY) : gd::CommonBitmapProvider::Get()->gdFileIcon32;
                    templateImageList->Add(icon);

                    templateList->InsertItem(0, name, templateImageList->GetImageCount()-1);
                    templateList->SetItem(0, 1, description);

                    //Set the data to be associated with the item
                    wxFileName templateFileName = wxFileName::FileName(currentDir+"/"+filename+"/GDTemplate.gdg");
                    templateFileName.MakeAbsolute();
                    gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(templateFileName.GetFullPath(), platform);
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
    if ( templateList->GetColumnCount() <= 1 ) return; //The dialog is not ready ( Can sometimes happens on Linux ).

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
    chosenFilename = projectFileEdit->GetValue();
    SendAnalyticsData();
    EndModal(1);
}
void NewProjectDialog::OntemplateListItemActivated(wxListEvent& event)
{
    chosenFilename = projectFileEdit->GetValue();
    SendAnalyticsData();
    EndModal(1);
}

void NewProjectDialog::SendAnalyticsData()
{
    gd::AnalyticsSender::Get()->SendNewGameCreated(chosenTemplatePlatform, chosenTemplateFile);
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
    gd::Platform * platform = gd::PlatformManager::Get()->GetPlatform(chosenTemplatePlatform);
    if ( platform ) descTxt->SetLabel(platform->GetDescription());
    RefreshTemplateList();
}

void NewProjectDialog::OnbrowseBtClick(wxCommandEvent& event)
{
    wxFileDialog dialog( this, _("Choose a file for the project"), newProjectBaseFolder, _("Project.gdg"), "GDevelop Project (*.gdg, *.json)|*.gdg;*.json", wxFD_SAVE );

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
