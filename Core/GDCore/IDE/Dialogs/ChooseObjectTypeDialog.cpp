/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */


#include <string>
#include <vector>
//(*InternalHeaders(ChooseObjectTypeDialog)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/imaglist.h>
#include <wx/settings.h>
#include <boost/shared_ptr.hpp>
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/PlatformDefinition/Platform.h"
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
const long ChooseObjectTypeDialog::ID_STATICBITMAP1 = wxNewId();
const long ChooseObjectTypeDialog::ID_TEXTCTRL1 = wxNewId();
const long ChooseObjectTypeDialog::ID_STATICLINE2 = wxNewId();
const long ChooseObjectTypeDialog::ID_BUTTON3 = wxNewId();
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
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Choose an object type"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Choose the kind of object to add:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer1->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	objectsList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxDefaultSize, wxLC_ICON|wxLC_ALIGN_LEFT|wxLC_SINGLE_SEL, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer1->Add(objectsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Information about the object"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer5->AddGrowableCol(1);
	FlexGridSizer5->AddGrowableRow(0);
	iconBmp = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/unknown32.png")).Rescale(wxSize(32,32).GetWidth(),wxSize(32,32).GetHeight())), wxDefaultPosition, wxSize(32,32), wxNO_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer5->Add(iconBmp, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	infoEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("No information about the object."), wxDefaultPosition, wxSize(335,37), wxTE_MULTILINE|wxTE_READONLY, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer5->Add(infoEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 4, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	moreObjectsBt = new wxButton(this, ID_BUTTON3, _("More objects"), wxDefaultPosition, wxSize(113,23), 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer2->Add(moreObjectsBt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP5, wxBitmap(wxImage(_T("res/helpicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP5"));
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
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObjectTypeDialog::OnmoreObjectsBtClick);
	Connect(ID_HYPERLINKCTRL2,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ChooseObjectTypeDialog::OnhelpBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObjectTypeDialog::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObjectTypeDialog::OncancelBtClick);
	Connect(wxID_ANY,wxEVT_CLOSE_WINDOW,(wxObjectEventFunction)&ChooseObjectTypeDialog::OnClose);
	//*)

    moreObjectsBt->SetBitmap(wxBitmap("res/extensiononly16.png", wxBITMAP_TYPE_ANY));

    #if defined(__WXMSW__) //Offer nice look to list
    wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
    if(theme) theme->SetWindowTheme((HWND) objectsList->GetHWND(), L"EXPLORER", NULL);
    #endif

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
    objectsList->DeleteAllItems();

    wxImageList * imageList = new wxImageList(32,32);
    imageList->Add(wxBitmap(wxImage(_T("res/unknown32.png"))));
    objectsList->AssignImageList(imageList, wxIMAGE_LIST_NORMAL);

    //Insert extension objects
    const vector < boost::shared_ptr<PlatformExtension> > extensions = project.GetPlatform().GetAllPlatformExtensions();
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(project.GetUsedPlatformExtensions().begin(),
                  project.GetUsedPlatformExtensions().end(),
                  extensions[i]->GetName()) == project.GetUsedPlatformExtensions().end() )
            continue;

	    vector<string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
	    for(unsigned int j = 0;j<objectsTypes.size();++j)
	    {
	        if ( objectsTypes[j] != "" ) //Cannot use directly a base object
	        {
                if ( extensions[i]->GetObjectMetadata(objectsTypes[j]).GetBitmapIcon().IsOk() )
                    imageList->Add(extensions[i]->GetObjectMetadata(objectsTypes[j]).GetBitmapIcon());
                else
                    imageList->Add(wxBitmap(wxImage(_T("res/unknown32.png"))));

                gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(objectsTypes[j]);

                long insertedItem = objectsList->InsertItem(0,
                                                            extensions[i]->GetObjectMetadata(objectsTypes[j]).GetFullName(),
                                                            imageList->GetImageCount()-1);
                objectsList->SetItemPtrData(insertedItem, wxPtrToUInt(associatedData));

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

    //We need to find the extension the selected object type belongs to so as to display informations
    const vector < boost::shared_ptr<PlatformExtension> > extensions = project.GetPlatform().GetAllPlatformExtensions();
    boost::shared_ptr<PlatformExtension> extension = boost::shared_ptr<PlatformExtension>();

	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    vector<string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
	    if ( find(objectsTypes.begin(), objectsTypes.end(), selectedObjectType) != objectsTypes.end() )
            extension = extensions[i];
	}

    if ( extension == boost::shared_ptr<PlatformExtension>() )
        return;

    infoEdit->ChangeValue(extension->GetObjectMetadata(selectedObjectType).GetDescription());
    iconBmp->SetBitmap(extension->GetObjectMetadata(selectedObjectType).GetBitmapIcon());
}

void ChooseObjectTypeDialog::OnobjectsListItemActivated(wxListEvent& event)
{
    //Get the object type associated with the item
    wxListItem item = event.GetItem();
    gd::TreeItemStringData * associatedData = reinterpret_cast<gd::TreeItemStringData*>(item.GetData()); //Why GetData return long ?
    if ( associatedData != NULL )
    {
        selectedObjectType = associatedData->GetString();
    }

    EndModal(1);
}

void ChooseObjectTypeDialog::OncancelBtClick(wxCommandEvent& event)
{
    selectedObjectType = "";
    EndModal(0);
}

void ChooseObjectTypeDialog::OnokBtClick(wxCommandEvent& event)
{
    if ( selectedObjectType != "" ) EndModal(1);
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
    gd::HelpFileAccess::GetInstance()->OpenURL(_("http://wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/edit_object"));
}

}
