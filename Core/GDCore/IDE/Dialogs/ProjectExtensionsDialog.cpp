/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "ProjectExtensionsDialog.h"

//(*InternalHeaders(ProjectExtensionsDialog)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <stdio.h>
#include <algorithm>
#include <fstream>
#include <sys/types.h>
#include <dirent.h>
#include <vector>
#include <memory>
#ifdef __WXMSW__
#include <wx/msw/uxtheme.h>
#endif
#include <wx/clntdata.h>
#include <wx/imaglist.h>
#include "GDCore/Tools/Log.h"

#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Project.h"
#include "GDCore/IDE/PlatformManager.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/CommonTools.h"

using namespace std;

namespace gd
{

//(*IdInit(ProjectExtensionsDialog)
const long ProjectExtensionsDialog::ID_LISTCTRL1 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT1 = wxNewId();
const long ProjectExtensionsDialog::ID_CHECKLISTBOX1 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT9 = wxNewId();
const long ProjectExtensionsDialog::ID_TEXTCTRL2 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT5 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT3 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT6 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT4 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT7 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICBITMAP2 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICBITMAP4 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICBITMAP1 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT8 = wxNewId();
const long ProjectExtensionsDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICLINE1 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICBITMAP5 = wxNewId();
const long ProjectExtensionsDialog::ID_HYPERLINKCTRL2 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT2 = wxNewId();
const long ProjectExtensionsDialog::ID_BUTTON3 = wxNewId();
const long ProjectExtensionsDialog::ID_MENUITEM1 = wxNewId();
const long ProjectExtensionsDialog::ID_MENUITEM2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ProjectExtensionsDialog,wxDialog)
	//(*EventTable(ProjectExtensionsDialog)
	//*)
END_EVENT_TABLE()

ProjectExtensionsDialog::ProjectExtensionsDialog(wxWindow* parent, gd::Project & project_) :
    project(project_),
    currentPlatform(&project.GetCurrentPlatform())
{
	//(*Initialize(ProjectExtensionsDialog)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxStaticBoxSizer* StaticBoxSizer3;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Use extension modules for GDevelop"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	platformList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxSize(713,106), wxLC_REPORT|wxLC_NO_HEADER, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer6->Add(platformList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Right-click to add or remove a platform.\nPlatforms that are not used by the project are grayed."), wxDefaultPosition, wxDefaultSize, wxALIGN_RIGHT, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer12->AddGrowableCol(0);
	FlexGridSizer12->AddGrowableRow(0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Extensions available :"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	ExtensionsList = new wxCheckListBox(this, ID_CHECKLISTBOX1, wxDefaultPosition, wxSize(294,281), 0, 0, 0, wxDefaultValidator, _T("ID_CHECKLISTBOX1"));
	FlexGridSizer2->Add(ExtensionsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText7 = new wxStaticText(this, ID_STATICTEXT9, _("Built-in extensions are automatically used by the project\nand are not shown here."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer2->Add(StaticText7, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(1);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Information about the extension"));
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer7 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer7->AddGrowableRow(0);
	infoEdit = new wxTextCtrl(this, ID_TEXTCTRL2, _("No information about the extension."), wxDefaultPosition, wxSize(331,43), wxTE_MULTILINE|wxTE_READONLY, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer7->Add(infoEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer8->AddGrowableCol(1);
	FlexGridSizer8->AddGrowableRow(0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT5, _("Author :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer8->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	authorTxt = new wxStaticText(this, ID_STATICTEXT3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	wxFont authorTxtFont = wxSystemSettings::GetFont(wxSYS_DEFAULT_GUI_FONT);
	if ( !authorTxtFont.Ok() ) authorTxtFont = wxSystemSettings::GetFont(wxSYS_DEFAULT_GUI_FONT);
	authorTxtFont.SetWeight(wxFONTWEIGHT_BOLD);
	authorTxt->SetFont(authorTxtFont);
	FlexGridSizer8->Add(authorTxt, 1, wxTOP|wxLEFT|wxRIGHT|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer9->AddGrowableCol(1);
	FlexGridSizer9->AddGrowableRow(0);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT6, _("License :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer9->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	licenseTxt = new wxStaticText(this, ID_STATICTEXT4, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	wxFont licenseTxtFont = wxSystemSettings::GetFont(wxSYS_DEFAULT_GUI_FONT);
	if ( !licenseTxtFont.Ok() ) licenseTxtFont = wxSystemSettings::GetFont(wxSYS_DEFAULT_GUI_FONT);
	licenseTxtFont.SetWeight(wxFONTWEIGHT_BOLD);
	licenseTxt->SetFont(licenseTxtFont);
	FlexGridSizer9->Add(licenseTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10 = new wxFlexGridSizer(0, 4, 0, 0);
	FlexGridSizer10->AddGrowableRow(0);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT7, _("Compatibility :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer10->Add(StaticText5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	wincompatibleBmp = new wxStaticBitmap(this, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/win-compatible.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer10->Add(wincompatibleBmp, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	linuxcompatibleBmp = new wxStaticBitmap(this, ID_STATICBITMAP4, wxBitmap(wxImage(_T("res/linux-compatible.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP4"));
	FlexGridSizer10->Add(linuxcompatibleBmp, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	maccompatibleBmp = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/mac-compatible.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer10->Add(maccompatibleBmp, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(-1,-1,1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("More extensions"));
	FlexGridSizer11 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT8, _("If you create new extensions for GDevelop, please share them here :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer11->Add(StaticText6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Go to the Wiki page for unofficial extensions"), _("http://wiki.compilgames.net/doku.php/gdevelop/extensions"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	FlexGridSizer11->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer3->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP5, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP5"));
	FlexGridSizer17->Add(StaticBitmap2, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL2, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer17, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("You must close and reopen scene editors for newly-added extensions to become active."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	wxFont StaticText2Font = wxSystemSettings::GetFont(wxSYS_DEFAULT_GUI_FONT);
	if ( !StaticText2Font.Ok() ) StaticText2Font = wxSystemSettings::GetFont(wxSYS_DEFAULT_GUI_FONT);
	StaticText2Font.SetStyle(wxFONTSTYLE_ITALIC);
	StaticText2->SetFont(StaticText2Font);
	FlexGridSizer4->Add(StaticText2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 10);
	FermerBt = new wxButton(this, ID_BUTTON3, _("Close"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer4->Add(FermerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	usePlatformMenuItem = new wxMenuItem((&notUsedPlatformMenu), ID_MENUITEM1, _("Use this platform"), wxEmptyString, wxITEM_NORMAL);
	notUsedPlatformMenu.Append(usePlatformMenuItem);
	removePlatformMenuItem = new wxMenuItem((&usedPlatformMenu), ID_MENUITEM2, _("Do not use this platform anymore"), wxEmptyString, wxITEM_NORMAL);
	usedPlatformMenu.Append(removePlatformMenuItem);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&ProjectExtensionsDialog::OnplatformListItemSelect);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&ProjectExtensionsDialog::OnplatformListItemRClick);
	Connect(ID_CHECKLISTBOX1,wxEVT_COMMAND_CHECKLISTBOX_TOGGLED,(wxObjectEventFunction)&ProjectExtensionsDialog::OnExtensionsListToggled);
	Connect(ID_CHECKLISTBOX1,wxEVT_COMMAND_LISTBOX_SELECTED,(wxObjectEventFunction)&ProjectExtensionsDialog::OnExtensionsListSelect);
	Connect(ID_HYPERLINKCTRL2,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ProjectExtensionsDialog::OnhelpBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ProjectExtensionsDialog::OnFermerBtClick);
	Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectExtensionsDialog::OnusePlatformMenuItemSelected);
	Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectExtensionsDialog::OnremovePlatformMenuItemSelected);
	Connect(wxEVT_SIZE,(wxObjectEventFunction)&ProjectExtensionsDialog::OnResize);
	//*)

    #if defined(__WXMSW__) //Offer nice look to list
    {
        wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
        if(theme) theme->SetWindowTheme((HWND) platformList->GetHWND(), L"EXPLORER", NULL);
    }
    #endif

    FlexGridSizer10->Show(false); //Cross compilation is not available and so the bitmaps are not relevant.

    platformList->InsertColumn(0,_("Platform"), wxLIST_FORMAT_LEFT, 640);
    platformList->InsertColumn(1,_("Description"), wxLIST_FORMAT_LEFT, 640);
    RefreshPlatformList();
	RefreshExtensionList();
}

ProjectExtensionsDialog::~ProjectExtensionsDialog()
{
	//(*Destroy(ProjectExtensionsDialog)
	//*)
}


void ProjectExtensionsDialog::RefreshPlatformList()
{
    platformList->DeleteAllItems();

    wxImageList * imageList = new wxImageList(32,32);
    imageList->Add(wxBitmap("res/icon32.png", wxBITMAP_TYPE_ANY));
    platformList->AssignImageList(imageList, wxIMAGE_LIST_SMALL);

    const std::vector< std::shared_ptr<gd::Platform> > & platforms = gd::PlatformManager::Get()->GetAllPlatforms();
    const std::vector< Platform * > & usedPlatforms = project.GetUsedPlatforms();
    for (std::size_t i = 0;i<platforms.size();++i)
    {
        //Check if the platform is used by the game
        bool used = false;
        for (std::size_t j = 0;j<usedPlatforms.size();++j)
        {
            if (usedPlatforms[j]==platforms[i].get())
            {
                used = true;
                break;
            }
        }

        long index = used ? 0 : platformList->GetItemCount();

        //Add the item
        platformList->InsertItem(index, platforms[i]->GetFullName(), 0);
        gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(platforms[i]->GetName(), used ? "true" : "false");
        platformList->SetItemPtrData(index, wxPtrToUInt(associatedData));
        platformList->SetItem(index, 1, platforms[i]->GetDescription());

        if ( wxFileExists(platforms[i]->GetIcon()))
        {
            wxBitmap icon = wxBitmap(platforms[i]->GetIcon(), wxBITMAP_TYPE_ANY);
            if ( icon.IsOk() && icon.GetWidth() == 32 && icon.GetHeight() == 32)
            {
                imageList->Add(icon);
                platformList->SetItemImage(index, imageList->GetImageCount()-1);
            }
        }

        if (!used)
            platformList->SetItemTextColour(index, wxColor(128,128,128));

        if ( platforms[i].get() == currentPlatform )
            platformList->SetItemState(index, wxLIST_STATE_SELECTED, wxLIST_MASK_STATE);
    }
}

void ProjectExtensionsDialog::RefreshExtensionList()
{
    ExtensionsList->Clear();
    if (!currentPlatform) return;

    const vector < std::shared_ptr<PlatformExtension> > & extensionsInstalled = currentPlatform->GetAllPlatformExtensions();

    //Create the list of available extensions
    for (std::size_t i = 0;i<extensionsInstalled.size();++i)
    {
        wxStringClientData * associatedData = new wxStringClientData(extensionsInstalled[i]->GetName());

        if ( !extensionsInstalled[i]->IsBuiltin() )
            ExtensionsList->Insert(
            	extensionsInstalled[i]->GetFullName() + (extensionsInstalled[i]->IsDeprecated() ? _(" (deprecated)") : ""),
            	extensionsInstalled[i]->IsDeprecated() ? ExtensionsList->GetCount() : 0,
            	associatedData);
    }

    //Check used extensions
    for (std::size_t i =0;i<ExtensionsList->GetCount();++i)
    {
        wxStringClientData * associatedData = dynamic_cast<wxStringClientData*>(ExtensionsList->GetClientObject(i));
        if (associatedData)
        {
            if ( find(  project.GetUsedExtensions().begin(),
                        project.GetUsedExtensions().end(),
                        gd::String(associatedData->GetData())) != project.GetUsedExtensions().end() )
            {
                ExtensionsList->Check(i, true);
            }
        }
    }
}

void ProjectExtensionsDialog::RefreshExtensionListColumnsWidth()
{
    platformList->SetColumnWidth(0, platformList->GetSize().GetWidth()*2.0/5.0-5);
    platformList->SetColumnWidth(1, platformList->GetSize().GetWidth()*3.0/5.0-5);
}

/**
 * Display information about an extension when selecting one.
 */
void ProjectExtensionsDialog::OnExtensionsListSelect(wxCommandEvent& event)
{
    if (!currentPlatform) return;

    int id = event.GetSelection();
    wxStringClientData * associatedData = dynamic_cast<wxStringClientData*>(ExtensionsList->GetClientObject(id));
    if (associatedData == NULL) return;

    const vector < std::shared_ptr<PlatformExtension> > & extensionsInstalled = currentPlatform->GetAllPlatformExtensions();

    for (std::size_t i = 0;i<extensionsInstalled.size();++i)
    {
        if ( extensionsInstalled[i]->GetName() == gd::String(associatedData->GetData()) )
        {
            infoEdit->ChangeValue(extensionsInstalled[i]->GetDescription());
            authorTxt->SetLabel(extensionsInstalled[i]->GetAuthor());
            licenseTxt->SetLabel(extensionsInstalled[i]->GetLicense());

            return;
        }
    }
}

void ProjectExtensionsDialog::OnExtensionsListToggled(wxCommandEvent& event)
{
    if (!currentPlatform) return;

    int id = event.GetSelection();
    wxStringClientData * associatedData = dynamic_cast<wxStringClientData*>(ExtensionsList->GetClientObject(id));
    if (associatedData == NULL) return;

    std::vector<gd::String>::iterator it =
        std::find(project.GetUsedExtensions().begin(), project.GetUsedExtensions().end(), gd::String(associatedData->GetData()));

    if ( ExtensionsList->IsChecked(id) && it == project.GetUsedExtensions().end() )
        project.GetUsedExtensions().push_back(associatedData->GetData());
    else if ( !ExtensionsList->IsChecked(id) && it != project.GetUsedExtensions().end() )
        project.GetUsedExtensions().erase(it);
}

/**
 * Close dialog and save extensions used
 */
void ProjectExtensionsDialog::OnFermerBtClick(wxCommandEvent& event)
{
    //For sanity sake, make sure that built-in extensions are used by the project
    std::vector<gd::String> builtinExtensions = gd::PlatformExtension::GetBuiltinExtensionsNames();
    for(std::size_t i = 0;i<builtinExtensions.size();++i)
    {
        if ( std::find(project.GetUsedExtensions().begin(), project.GetUsedExtensions().end(), builtinExtensions[i])
             == project.GetUsedExtensions().end())
        {
            project.GetUsedExtensions().push_back(builtinExtensions[i]);
        }
    }

    EndModal(0);
}

void ProjectExtensionsDialog::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("en/game_develop/documentation/manual/extensions");
}

void ProjectExtensionsDialog::OnResize(wxSizeEvent& event)
{
    RefreshExtensionListColumnsWidth();
    event.Skip();
}

void ProjectExtensionsDialog::OnusePlatformMenuItemSelected(wxCommandEvent& event)
{
    project.AddPlatform(*currentPlatform);
    RefreshPlatformList();
    RefreshExtensionList();
}

void ProjectExtensionsDialog::OnremovePlatformMenuItemSelected(wxCommandEvent& event)
{
    if ( !project.RemovePlatform(currentPlatform->GetName()) )
    {
        gd::LogWarning(_("Unable to remove this platform: The project must use at least one plaform."));
    }
    RefreshPlatformList();
    RefreshExtensionList();
}

void ProjectExtensionsDialog::OnplatformListItemSelect(wxListEvent& event)
{
    gd::TreeItemStringData * associatedData = reinterpret_cast<gd::TreeItemStringData*>(event.GetItem().GetData());
    if ( associatedData != NULL )
    {
        gd::String chosenPlatform = associatedData->GetString();

        const std::vector< std::shared_ptr<gd::Platform> > & platforms = gd::PlatformManager::Get()->GetAllPlatforms();
        for (std::size_t i = 0;i<platforms.size();++i)
        {
            if ( platforms[i]->GetName() == chosenPlatform )
            {
                currentPlatform = platforms[i].get();
                RefreshExtensionList();
            }
        }
    }
}

void ProjectExtensionsDialog::OnplatformListItemRClick(wxListEvent& event)
{
    gd::TreeItemStringData * associatedData = reinterpret_cast<gd::TreeItemStringData*>(event.GetItem().GetData());
    if ( associatedData != NULL )
    {
        gd::String chosenPlatform = associatedData->GetString();

        const std::vector< std::shared_ptr<gd::Platform> > & platforms = gd::PlatformManager::Get()->GetAllPlatforms();
        for (std::size_t i = 0;i<platforms.size();++i)
        {
            if ( platforms[i]->GetName() == chosenPlatform )
            {
                currentPlatform = platforms[i].get();
            }
        }

        const std::vector< Platform * > & usedPlatforms = project.GetUsedPlatforms();
        for (std::size_t j = 0;j<usedPlatforms.size();++j)
        {
            if ( usedPlatforms[j]->GetName() == chosenPlatform)
            {
                PopupMenu(&usedPlatformMenu);
                return;
            }
        }

        PopupMenu(&notUsedPlatformMenu);
    }
}


}
#endif
