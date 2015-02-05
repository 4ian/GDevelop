/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

//(*InternalHeaders(ChooseAutomatismTypeDialog)
#include <wx/bitmap.h>
#include "GDCore/Tools/Localization.h"
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/imaglist.h>
#include <wx/config.h>
#include <wx/msgdlg.h>
#include <wx/settings.h>
#include "GDCore/IDE/SkinHelper.h"
#include <boost/shared_ptr.hpp>
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"
#include "GDCore/IDE/Dialogs/ChooseAutomatismTypeDialog.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/CommonTools.h"

#ifdef __WXMSW__
#include <wx/msw/uxtheme.h>
#endif

using namespace std;

namespace gd
{

//(*IdInit(ChooseAutomatismTypeDialog)
const long ChooseAutomatismTypeDialog::ID_STATICTEXT1 = wxNewId();
const long ChooseAutomatismTypeDialog::ID_LISTCTRL1 = wxNewId();
const long ChooseAutomatismTypeDialog::ID_STATICTEXT2 = wxNewId();
const long ChooseAutomatismTypeDialog::ID_STATICLINE2 = wxNewId();
const long ChooseAutomatismTypeDialog::ID_CHOICE1 = wxNewId();
const long ChooseAutomatismTypeDialog::ID_STATICBITMAP5 = wxNewId();
const long ChooseAutomatismTypeDialog::ID_HYPERLINKCTRL2 = wxNewId();
const long ChooseAutomatismTypeDialog::ID_BUTTON1 = wxNewId();
const long ChooseAutomatismTypeDialog::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChooseAutomatismTypeDialog,wxDialog)
	//(*EventTable(ChooseAutomatismTypeDialog)
	//*)
END_EVENT_TABLE()

ChooseAutomatismTypeDialog::ChooseAutomatismTypeDialog(wxWindow* parent, gd::Project & project_) :
project(project_)
{
	//(*Initialize(ChooseAutomatismTypeDialog)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Choose an automatism"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Automatisms can be used to add a specific behaviour\nto an object. Choose the automatism to add:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer1->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	automatismsList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxSize(277,175), wxLC_REPORT|wxLC_NO_HEADER|wxLC_SINGLE_SEL, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer1->Add(automatismsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("You can also use the grayed automatisms:\nTheir associated extension will be automatically enabled."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer1->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 4, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	platformChoice = new wxChoice(this, ID_CHOICE1, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE1"));
	platformChoice->Hide();
	FlexGridSizer2->Add(platformChoice, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP5, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP5"));
	FlexGridSizer17->Add(StaticBitmap2, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL2, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer17, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(okBt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&ChooseAutomatismTypeDialog::OnautomatismsListItemSelect);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseAutomatismTypeDialog::OnautomatismsListItemActivated);
	Connect(ID_CHOICE1,wxEVT_COMMAND_CHOICE_SELECTED,(wxObjectEventFunction)&ChooseAutomatismTypeDialog::OnplatformChoiceSelect);
	Connect(ID_HYPERLINKCTRL2,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ChooseAutomatismTypeDialog::OnhelpBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseAutomatismTypeDialog::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseAutomatismTypeDialog::OncancelBtClick);
	Connect(wxEVT_SIZE,(wxObjectEventFunction)&ChooseAutomatismTypeDialog::OnResize);
	//*)

    #if defined(__WXMSW__) //Offer nice look to list
    wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
    if(theme) theme->SetWindowTheme((HWND) automatismsList->GetHWND(), L"EXPLORER", NULL);
    #endif

    for (unsigned int i = 0;i<project.GetUsedPlatforms().size();++i)
    {
        platformChoice->Append( project.GetUsedPlatforms()[i]->GetFullName() );
        if ( project.GetUsedPlatforms()[i] == &project.GetCurrentPlatform() ) platformChoice->SetSelection(i);
    }

    if ( project.GetUsedPlatforms().size() != 1 ) platformChoice->Show();

    automatismsList->InsertColumn(0,_("Automatism"), wxLIST_FORMAT_LEFT, 320);
    automatismsList->InsertColumn(1,_("Description"), wxLIST_FORMAT_LEFT, 320);
    RefreshList();

    int x;
    int y;
    int width;
    int height;
    wxConfigBase::Get()->Read("ChooseAutomatismTypeDialog/x", &x, wxDefaultCoord);
    wxConfigBase::Get()->Read("ChooseAutomatismTypeDialog/y", &y, wxDefaultCoord);
    wxConfigBase::Get()->Read("ChooseAutomatismTypeDialog/Width", &width, wxDefaultCoord);
    wxConfigBase::Get()->Read("ChooseAutomatismTypeDialog/Height", &height, wxDefaultCoord);

    if ( x <= wxSystemSettings::GetMetric(wxSYS_SCREEN_X) && y <= wxSystemSettings::GetMetric(wxSYS_SCREEN_Y) )
        SetSize(x,y,width, height);
    else
        SetSize(500,500); //Offer a convenient default size.

    UpdateListColumnsWidth();
}

ChooseAutomatismTypeDialog::~ChooseAutomatismTypeDialog()
{
	//(*Destroy(ChooseAutomatismTypeDialog)
	//*)
    wxConfigBase::Get()->Write("ChooseAutomatismTypeDialog/x", GetPosition().x);
    wxConfigBase::Get()->Write("ChooseAutomatismTypeDialog/y", GetPosition().y);
    wxConfigBase::Get()->Write("ChooseAutomatismTypeDialog/Width", GetSize().GetWidth());
    wxConfigBase::Get()->Write("ChooseAutomatismTypeDialog/Height", GetSize().GetHeight());
}

void ChooseAutomatismTypeDialog::RefreshList()
{
    automatismsList->DeleteAllItems();

    wxImageList * imageList = new wxImageList(32,32);
    imageList->Add(wxBitmap(wxImage(_T("res/unknown32.png"))));
    automatismsList->AssignImageList(imageList, wxIMAGE_LIST_SMALL);

    //Insert extension objects
    const vector < boost::shared_ptr<PlatformExtension> > extensions = project.GetCurrentPlatform().GetAllPlatformExtensions();
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if this extension is enabled
	    bool extensionEnabled = find(project.GetUsedExtensions().begin(),
                                      project.GetUsedExtensions().end(),
                                      extensions[i]->GetName()) != project.GetUsedExtensions().end();

	    vector<string> automatismsTypes = extensions[i]->GetAutomatismsTypes();
	    for(unsigned int j = 0;j<automatismsTypes.size();++j)
	    {
	        if ( !automatismsTypes[j].empty() )
	        {
	            //Generate the icon
	            wxBitmap objectIcon = extensions[i]->GetAutomatismMetadata(automatismsTypes[j]).GetBitmapIcon().IsOk() ?
                                      extensions[i]->GetAutomatismMetadata(automatismsTypes[j]).GetBitmapIcon() :
                                      wxBitmap(wxImage(_T("res/unknown32.png")));

                imageList->Add(extensionEnabled ? objectIcon : objectIcon.ConvertToImage().ConvertToGreyscale().ConvertToDisabled(255));

                //And add the object to the list
                long index = extensionEnabled ? 0 : automatismsList->GetItemCount();
                gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(automatismsTypes[j]);
                automatismsList->InsertItem(index, extensions[i]->GetAutomatismMetadata(automatismsTypes[j]).GetFullName());
                automatismsList->SetItem(index, 1, extensions[i]->GetAutomatismMetadata(automatismsTypes[j]).GetDescription());
                automatismsList->SetItemImage(index ,imageList->GetImageCount()-1);
                automatismsList->SetItemData(index, wxPtrToUInt(associatedData));
                if ( !extensionEnabled ) automatismsList->SetItemTextColour(index, wxColor(128,128,128));
	        }
	    }
	}
}

void ChooseAutomatismTypeDialog::OnautomatismsListItemSelect(wxListEvent& event)
{
    //Get the automatism type associated with the item
    wxListItem item = event.GetItem();
    gd::TreeItemStringData * associatedData = reinterpret_cast<gd::TreeItemStringData*>(item.GetData()); //Why GetData return long ?
    if ( associatedData != NULL )
    {
        selectedAutomatismType = associatedData->GetString();
    }
}

void ChooseAutomatismTypeDialog::OnautomatismsListItemActivated(wxListEvent& event)
{
    OnautomatismsListItemSelect(event);

    wxCommandEvent useless;
    OnokBtClick(useless);
}

void ChooseAutomatismTypeDialog::OnokBtClick(wxCommandEvent& event)
{
    if (selectedAutomatismType.empty()) return;

    //We need to find the extension the selected object type belongs to so as to activate it if necessary
    const vector < boost::shared_ptr<PlatformExtension> > extensions = project.GetCurrentPlatform().GetAllPlatformExtensions();
    boost::shared_ptr<PlatformExtension> extension = boost::shared_ptr<PlatformExtension>();

	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    vector<string> automatismsTypes = extensions[i]->GetAutomatismsTypes();
	    if ( find(automatismsTypes.begin(), automatismsTypes.end(), selectedAutomatismType) != automatismsTypes.end() )
        {
            extension = extensions[i]; break;
        }
	}

    if ( extension != boost::shared_ptr<PlatformExtension>() )
    {
	    bool extensionEnabled = find(project.GetUsedExtensions().begin(),
                                      project.GetUsedExtensions().end(),
                                      extension->GetName()) != project.GetUsedExtensions().end();

        if ( !extensionEnabled )
        {
            if (wxMessageBox(_("This object is provided by the ")+
                             extension->GetFullName()+
                             _(" extension, but this extension is not activated for the current game.\n\nDo you want to use this extension in your game?"),
                             _("Activate extension ")+extension->GetFullName(), wxYES_NO|wxICON_QUESTION|wxYES_DEFAULT ) == wxNO)
            {
                return;
            }
            else
                project.GetUsedExtensions().push_back(extension->GetName());
        }
    }

    EndModal(1);
}

void ChooseAutomatismTypeDialog::OncancelBtClick(wxCommandEvent& event)
{
    selectedAutomatismType = "";
    EndModal(0);
}

void ChooseAutomatismTypeDialog::UpdateListColumnsWidth()
{
    automatismsList->SetColumnWidth(0, automatismsList->GetSize().GetWidth()*2.0/5.0-5);
    automatismsList->SetColumnWidth(1, automatismsList->GetSize().GetWidth()*3.0/5.0-5);
}

void ChooseAutomatismTypeDialog::OnResize(wxSizeEvent& event)
{
    UpdateListColumnsWidth();
    automatismsList->Refresh();
    automatismsList->Update();
    event.Skip();
}

void ChooseAutomatismTypeDialog::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenURL(_("http://wiki.compilgames.net/doku.php/game_develop/documentation/manual/edit_object")); //TODO: Automatism help page
}

void ChooseAutomatismTypeDialog::OnplatformChoiceSelect(wxCommandEvent& event)
{
    if ( event.GetInt() >= project.GetUsedPlatforms().size() ) return;

    project.SetCurrentPlatform(project.GetUsedPlatforms()[event.GetInt()]->GetName());
    RefreshList();
}

bool ChooseAutomatismTypeDialog::ChooseAndAddAutomatismToObject(wxWindow * parent, gd::Project & project, gd::Object * object, gd::Layout * layout, bool isGlobalObject)
{
    gd::ChooseAutomatismTypeDialog dialog(parent, project);
    if ( dialog.ShowModal() == 1)
    {
        //Find automatism metadata
        boost::shared_ptr<gd::PlatformExtension> extension = boost::shared_ptr<gd::PlatformExtension> ();
        std::vector < boost::shared_ptr<gd::PlatformExtension> > extensions = project.GetCurrentPlatform().GetAllPlatformExtensions();
        for (unsigned int i = 0;i<extensions.size();++i)
        {
            std::vector<std::string> automatismsTypes = extensions[i]->GetAutomatismsTypes();
            if ( find(automatismsTypes.begin(), automatismsTypes.end(), dialog.GetSelectedAutomatismType()) != automatismsTypes.end() )
                extension = extensions[i];
        }
        gd::AutomatismMetadata metadata = extension->GetAutomatismMetadata(dialog.GetSelectedAutomatismType());

        //Add automatism to object
        std::string autoName = metadata.GetDefaultName();
        for (unsigned int j = 2;object->HasAutomatismNamed(autoName);++j)
            autoName = metadata.GetDefaultName()+gd::ToString(j);

        object->AddNewAutomatism(project, dialog.GetSelectedAutomatismType(), autoName);

        //Let the scene know about the new automatism
        if ( isGlobalObject && layout )
            layout->UpdateAutomatismsSharedData(project);
        else //Scene pointer is NULL: Update shared data of all layouts
        {
            for (unsigned int i = 0;i<project.GetLayoutsCount();++i)
                project.GetLayout(i).UpdateAutomatismsSharedData(project);
        }

        for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
            project.GetUsedPlatforms()[j]->GetChangesNotifier().OnAutomatismAdded(project, isGlobalObject ? NULL : layout, *object, object->GetAutomatism(autoName));

        return true;
    }

    return false;
}

}
#endif
