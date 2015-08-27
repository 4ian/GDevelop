/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include "GDCore/String.h"
#include <vector>
//(*InternalHeaders(ChooseObjectTypeDialog)
#include <wx/bitmap.h>
#include "GDCore/Tools/Localization.h"
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/imaglist.h>
#include <wx/msgdlg.h>
#include <wx/settings.h>
#include <algorithm>
#include <memory>
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"
#include "GDCore/IDE/Dialogs/ProjectExtensionsDialog.h"
#include "GDCore/IDE/Dialogs/ChooseObjectTypeDialog.h"
#include "GDCore/Tools/HelpFileAccess.h"

#ifdef __WXMSW__
#include <wx/msw/uxtheme.h>
#endif

using namespace std;

namespace gd
{

//(*IdInit(ChooseObjectTypeDialog)
const long ChooseObjectTypeDialog::ID_STATICTEXT2 = wxNewId();
const long ChooseObjectTypeDialog::ID_LISTCTRL1 = wxNewId();
const long ChooseObjectTypeDialog::ID_STATICTEXT1 = wxNewId();
const long ChooseObjectTypeDialog::ID_STATICLINE2 = wxNewId();
const long ChooseObjectTypeDialog::ID_CHOICE1 = wxNewId();
const long ChooseObjectTypeDialog::ID_STATICBITMAP5 = wxNewId();
const long ChooseObjectTypeDialog::ID_HYPERLINKCTRL2 = wxNewId();
const long ChooseObjectTypeDialog::ID_BUTTON1 = wxNewId();
const long ChooseObjectTypeDialog::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChooseObjectTypeDialog,wxDialog)
	//(*EventTable(ChooseObjectTypeDialog)
	//*)
END_EVENT_TABLE()

ChooseObjectTypeDialog::ChooseObjectTypeDialog(wxWindow* parent, gd::Project & project_) :
project(project_)
{
	//(*Initialize(ChooseObjectTypeDialog)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Choose an object type"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Choose the kind of object to add:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer1->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	objectsList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxDefaultSize, wxLC_REPORT|wxLC_ALIGN_TOP|wxLC_NO_HEADER|wxLC_SINGLE_SEL, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer1->Add(objectsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("You can also use the grayed objects:\nTheir associated extension will be automatically enabled."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer1->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 4, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	platformChoice = new wxChoice(this, ID_CHOICE1, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE1"));
	platformChoice->Hide();
	FlexGridSizer2->Add(platformChoice, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP5, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP5"));
	FlexGridSizer17->Add(StaticBitmap2, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL2, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer17, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(okBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&ChooseObjectTypeDialog::OnobjectsListItemSelect);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseObjectTypeDialog::OnobjectsListItemActivated);
	Connect(ID_CHOICE1,wxEVT_COMMAND_CHOICE_SELECTED,(wxObjectEventFunction)&ChooseObjectTypeDialog::OnplatformChoiceSelect);
	Connect(ID_HYPERLINKCTRL2,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ChooseObjectTypeDialog::OnhelpBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObjectTypeDialog::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObjectTypeDialog::OncancelBtClick);
	Connect(wxID_ANY,wxEVT_CLOSE_WINDOW,(wxObjectEventFunction)&ChooseObjectTypeDialog::OnClose);
	Connect(wxEVT_SIZE,(wxObjectEventFunction)&ChooseObjectTypeDialog::OnResize);
	//*)

    #if defined(__WXMSW__) //Offer nice look to list
    wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
    if(theme) theme->SetWindowTheme((HWND) objectsList->GetHWND(), L"EXPLORER", NULL);
    #endif

    for (std::size_t i = 0;i<project.GetUsedPlatforms().size();++i)
    {
        platformChoice->Append( project.GetUsedPlatforms()[i]->GetFullName() );
        if ( project.GetUsedPlatforms()[i] == &project.GetCurrentPlatform() ) platformChoice->SetSelection(i);
    }

    if ( project.GetUsedPlatforms().size() != 1 ) platformChoice->Show();

    objectsList->InsertColumn(0, _("Object"), wxLIST_FORMAT_LEFT, 320);
    objectsList->InsertColumn(1, _("Description"), wxLIST_FORMAT_LEFT, 320);
    RefreshList();

    int x;
    int y;
    int width;
    int height;
    wxConfigBase::Get()->Read("ChooseObjectTypeDialog/x", &x, wxDefaultCoord);
    wxConfigBase::Get()->Read("ChooseObjectTypeDialog/y", &y, wxDefaultCoord);
    wxConfigBase::Get()->Read("ChooseObjectTypeDialog/Width", &width, wxDefaultCoord);
    wxConfigBase::Get()->Read("ChooseObjectTypeDialog/Height", &height, wxDefaultCoord);

    if ( x <= wxSystemSettings::GetMetric(wxSYS_SCREEN_X) && y <= wxSystemSettings::GetMetric(wxSYS_SCREEN_Y) )
        SetSize(x,y,width, height);
    else
        SetSize(460,400); //Offer a convenient default size.

    UpdateListColumnsWidth();
}

ChooseObjectTypeDialog::~ChooseObjectTypeDialog()
{
	//(*Destroy(ChooseObjectTypeDialog)
	//*)
    wxConfigBase::Get()->Write("ChooseObjectTypeDialog/x", GetPosition().x);
    wxConfigBase::Get()->Write("ChooseObjectTypeDialog/y", GetPosition().y);
    wxConfigBase::Get()->Write("ChooseObjectTypeDialog/Width", GetSize().GetWidth());
    wxConfigBase::Get()->Write("ChooseObjectTypeDialog/Height", GetSize().GetHeight());
}

void ChooseObjectTypeDialog::RefreshList()
{
    selectedObjectType = "";
    objectsList->DeleteAllItems();

    wxImageList * imageList = new wxImageList(32,32);
    imageList->Add(wxBitmap(wxImage(_T("res/unknown32.png"))));
    objectsList->AssignImageList(imageList, wxIMAGE_LIST_SMALL);

    //Insert extension objects
    const vector < std::shared_ptr<PlatformExtension> > extensions = project.GetCurrentPlatform().GetAllPlatformExtensions();
	for (std::size_t i = 0;i<extensions.size();++i)
	{
        if (extensions[i]->IsDeprecated()) continue;

	    //Verify if this extension is enabled
	    bool extensionEnabled = find(project.GetUsedExtensions().begin(),
                                      project.GetUsedExtensions().end(),
                                      extensions[i]->GetName()) != project.GetUsedExtensions().end();

	    std::vector<gd::String> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
	    for(std::size_t j = 0;j<objectsTypes.size();++j)
	    {
	        if ( objectsTypes[j] != "" ) //Cannot use directly a base object
	        {
	            //Generate the icon
	            wxBitmap objectIcon = extensions[i]->GetObjectMetadata(objectsTypes[j]).GetBitmapIcon().IsOk() ?
                                      extensions[i]->GetObjectMetadata(objectsTypes[j]).GetBitmapIcon() :
                                      wxBitmap(wxImage(_T("res/unknown32.png")));

                imageList->Add(extensionEnabled ? objectIcon : objectIcon.ConvertToImage().ConvertToGreyscale().ConvertToDisabled(255));

                //And add the object to the list
                long index = extensionEnabled ? 0 : objectsList->GetItemCount();
                gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(objectsTypes[j]);
                objectsList->InsertItem(index, extensions[i]->GetObjectMetadata(objectsTypes[j]).GetFullName());
                objectsList->SetItem(index, 1, extensions[i]->GetObjectMetadata(objectsTypes[j]).GetDescription());
                objectsList->SetItemImage(index, imageList->GetImageCount()-1);
                objectsList->SetItemPtrData(index, wxPtrToUInt(associatedData));
                if ( !extensionEnabled ) objectsList->SetItemTextColour(index, wxColor(128,128,128));

                //Ensure the selected object type is the focused element (focused element is not considered
                //as selected with wxGTK).
                selectedObjectType = selectedObjectType.empty() || extensionEnabled ?
                    objectsTypes[j] : selectedObjectType;
	        }
	    }
	}
}

void ChooseObjectTypeDialog::OnobjectsListItemSelect(wxListEvent& event)
{
    //Get the object type associated with the item
    wxListItem item = event.GetItem();
    gd::TreeItemStringData * associatedData = reinterpret_cast<gd::TreeItemStringData*>(item.GetData()); //Why GetData return long ?
    if ( associatedData != NULL )
    {
        selectedObjectType = associatedData->GetString();
    }
}

void ChooseObjectTypeDialog::OnobjectsListItemActivated(wxListEvent& event)
{
    OnobjectsListItemSelect(event);

    wxCommandEvent useless;
    OnokBtClick(useless);
}

void ChooseObjectTypeDialog::OncancelBtClick(wxCommandEvent& event)
{
    selectedObjectType = "";
    EndModal(0);
}

void ChooseObjectTypeDialog::OnokBtClick(wxCommandEvent& event)
{
    if ( selectedObjectType.empty() ) return;

    //We need to find the extension the selected object type belongs to so as to activate it if necessary
    const vector < std::shared_ptr<PlatformExtension> > extensions = project.GetCurrentPlatform().GetAllPlatformExtensions();
    std::shared_ptr<PlatformExtension> extension = std::shared_ptr<PlatformExtension>();

	for (std::size_t i = 0;i<extensions.size();++i)
	{
	    std::vector<gd::String> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
	    if ( find(objectsTypes.begin(), objectsTypes.end(), selectedObjectType) != objectsTypes.end() )
        {
            extension = extensions[i]; break;
        }
	}

    if ( extension != std::shared_ptr<PlatformExtension>() )
    {
	    bool extensionEnabled = find(project.GetUsedExtensions().begin(),
                                      project.GetUsedExtensions().end(),
                                      extension->GetName()) != project.GetUsedExtensions().end();

        if ( !extensionEnabled )
        {
            if (wxMessageBox(_("This object is provided by the ")+
                             extension->GetFullName()+
                             _(" extension, but this extension is not activated for the current game.\n\nDo you want to use this extension in your game?"),
                             _("Activate extension ")+extension->GetFullName(),
                             wxYES_NO|wxICON_QUESTION|wxYES_DEFAULT
                            ) == wxNO)
            {
                return;
            }
            else
                project.GetUsedExtensions().push_back(extension->GetName());

        }
    }

     EndModal(1);
}

void ChooseObjectTypeDialog::OnClose(wxCloseEvent& event)
{
    EndModal(0);
}

void ChooseObjectTypeDialog::OnmoreObjectsBtClick(wxCommandEvent& event)
{
    gd::ProjectExtensionsDialog dialog(this, project);
    dialog.ShowModal();

    RefreshList();
}

void ChooseObjectTypeDialog::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenURL(_("http://wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/edit_object"));
}

void ChooseObjectTypeDialog::UpdateListColumnsWidth()
{
    objectsList->SetColumnWidth(0, objectsList->GetSize().GetWidth()*2.0/5.0-5);
    objectsList->SetColumnWidth(1, objectsList->GetSize().GetWidth()*3.0/5.0-5);
}

void ChooseObjectTypeDialog::OnResize(wxSizeEvent& event)
{
    UpdateListColumnsWidth();
    objectsList->Refresh();
    objectsList->Update();
    event.Skip();
}

void ChooseObjectTypeDialog::OnplatformChoiceSelect(wxCommandEvent& event)
{
    if ( event.GetInt() >= project.GetUsedPlatforms().size() ) return;

    project.SetCurrentPlatform(project.GetUsedPlatforms()[event.GetInt()]->GetName());
    RefreshList();
}

}
#endif
