#include "ObjectTypeChoice.h"

//(*InternalHeaders(ObjectTypeChoice)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/imaglist.h>
#include <string>
#include <vector>
#include "GDL/IDE/gdTreeItemStringData.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExtensionBase.h"
#include "GDL/Game.h"
#include "GDCore/IDE/Dialogs/ProjectExtensionsDialog.h"

#ifdef __WXMSW__
#include <wx/msw/uxtheme.h>
#endif

using namespace std;

//(*IdInit(ObjectTypeChoice)
const long ObjectTypeChoice::ID_STATICBITMAP2 = wxNewId();
const long ObjectTypeChoice::ID_STATICTEXT1 = wxNewId();
const long ObjectTypeChoice::ID_PANEL1 = wxNewId();
const long ObjectTypeChoice::ID_STATICLINE1 = wxNewId();
const long ObjectTypeChoice::ID_LISTCTRL1 = wxNewId();
const long ObjectTypeChoice::ID_STATICBITMAP1 = wxNewId();
const long ObjectTypeChoice::ID_TEXTCTRL1 = wxNewId();
const long ObjectTypeChoice::ID_STATICLINE2 = wxNewId();
const long ObjectTypeChoice::ID_BUTTON3 = wxNewId();
const long ObjectTypeChoice::ID_BUTTON1 = wxNewId();
const long ObjectTypeChoice::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ObjectTypeChoice,wxDialog)
	//(*EventTable(ObjectTypeChoice)
	//*)
END_EVENT_TABLE()

ObjectTypeChoice::ObjectTypeChoice(wxWindow* parent, Game & game_) :
game(game_)
{
	//(*Initialize(ObjectTypeChoice)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Choisir un type d\'objet"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	SetClientSize(wxSize(249,163));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(2);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap2 = new wxStaticBitmap(Panel1, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/objeticon64.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer4->Add(StaticBitmap2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Choisissez le type d\'objet à ajouter.\nLe type de l\'objet détermine la façon dont\nil est affiché, ce qu\'il fait, comment peut on\ninteragir avec..."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer4->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer4);
	FlexGridSizer4->Fit(Panel1);
	FlexGridSizer4->SetSizeHints(Panel1);
	FlexGridSizer1->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	objectsList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxSize(277,175), wxLC_ICON|wxLC_ALIGN_LEFT|wxLC_SINGLE_SEL, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer1->Add(objectsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Informations sur l\'objet"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer5->AddGrowableCol(1);
	FlexGridSizer5->AddGrowableRow(0);
	iconBmp = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/unknown32.png")).Rescale(wxSize(32,32).GetWidth(),wxSize(32,32).GetHeight())), wxDefaultPosition, wxSize(32,32), wxSIMPLE_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer5->Add(iconBmp, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	infoEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("Pas d\'informations sur l\'objet."), wxDefaultPosition, wxSize(227,37), wxTE_MULTILINE|wxTE_READONLY, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer5->Add(infoEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	moreObjectsBt = new wxButton(this, ID_BUTTON3, _("Plus d\'objets"), wxDefaultPosition, wxSize(113,23), 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer2->Add(moreObjectsBt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(okBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&ObjectTypeChoice::OnobjectsListItemSelect);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&ObjectTypeChoice::OnobjectsListItemActivated);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ObjectTypeChoice::OnmoreObjectsBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ObjectTypeChoice::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ObjectTypeChoice::OncancelBtClick);
	Connect(wxID_ANY,wxEVT_CLOSE_WINDOW,(wxObjectEventFunction)&ObjectTypeChoice::OnClose);
	//*)

    moreObjectsBt->SetBitmap(wxBitmap("res/extensiononly16.png", wxBITMAP_TYPE_ANY));

    #if defined(__WXMSW__) //Offer nice look to list
    wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
    if(theme) theme->SetWindowTheme((HWND) objectsList->GetHWND(), L"EXPLORER", NULL);
    #endif

    RefreshList();
}

ObjectTypeChoice::~ObjectTypeChoice()
{
	//(*Destroy(ObjectTypeChoice)
	//*)
}

void ObjectTypeChoice::RefreshList()
{
    objectsList->DeleteAllItems();

    ExtensionsManager * extensionManager = ExtensionsManager::GetInstance();
    const vector < boost::shared_ptr<ExtensionBase> > extensions = extensionManager->GetExtensions();

    wxImageList * imageList = new wxImageList(32,32);
    imageList->Add(wxBitmap(wxImage(_T("res/unknown32.png"))));
    objectsList->AssignImageList(imageList, wxIMAGE_LIST_NORMAL);

    //Insert extension objects
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.GetUsedPlatformExtensions().begin(),
                  game.GetUsedPlatformExtensions().end(),
                  extensions[i]->GetName()) == game.GetUsedPlatformExtensions().end() )
            continue;

	    vector<string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
	    for(unsigned int j = 0;j<objectsTypes.size();++j)
	    {
	        if ( objectsTypes[j] != "" ) //Cannot use directly a base object
	        {
                if ( extensions[i]->GetObjectInfo(objectsTypes[j]).icon.IsOk() )
                    imageList->Add(extensions[i]->GetObjectInfo(objectsTypes[j]).icon);
                else
                    imageList->Add(wxBitmap(wxImage(_T("res/unknown32.png"))));

                gdTreeItemStringData * associatedData = new gdTreeItemStringData(objectsTypes[j]);

                wxListItem objectItem;
                objectItem.SetText(extensions[i]->GetObjectInfo(objectsTypes[j]).fullname);
                objectItem.SetImage(imageList->GetImageCount()-1);
                objectItem.SetData(associatedData);

                objectsList->InsertItem(objectItem);
	        }
	    }
	}
}

void ObjectTypeChoice::OnobjectsListItemSelect(wxListEvent& event)
{
    //Get the object type associated with the item
    wxListItem item = event.GetItem();
    gdTreeItemStringData * associatedData = reinterpret_cast<gdTreeItemStringData*>(item.GetData()); //Why GetData return long ?
    if ( associatedData != NULL )
    {
        selectedObjectType = associatedData->GetString();
    }

    ExtensionsManager * extensionManager = ExtensionsManager::GetInstance();
    const vector < boost::shared_ptr<ExtensionBase> > extensions = extensionManager->GetExtensions();

    boost::shared_ptr<ExtensionBase> extension = boost::shared_ptr<ExtensionBase> ();

	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    vector<string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
	    if ( find(objectsTypes.begin(), objectsTypes.end(), selectedObjectType) != objectsTypes.end() )
            extension = extensions[i];
	}

    if ( extension == boost::shared_ptr<ExtensionBase> () )
        return;

    infoEdit->ChangeValue(extension->GetObjectInfo(selectedObjectType).informations);
    iconBmp->SetBitmap(extension->GetObjectInfo(selectedObjectType).icon);
}

void ObjectTypeChoice::OnobjectsListItemActivated(wxListEvent& event)
{
    //Get the object type associated with the item
    wxListItem item = event.GetItem();
    gdTreeItemStringData * associatedData = reinterpret_cast<gdTreeItemStringData*>(item.GetData()); //Why GetData return long ?
    if ( associatedData != NULL )
    {
        selectedObjectType = associatedData->GetString();
    }

    EndModal(1);
}

void ObjectTypeChoice::OncancelBtClick(wxCommandEvent& event)
{
    selectedObjectType = "";
    EndModal(0);
}

void ObjectTypeChoice::OnokBtClick(wxCommandEvent& event)
{
    if ( selectedObjectType != "" ) EndModal(1);
}

void ObjectTypeChoice::OnClose(wxCloseEvent& event)
{
    EndModal(0);
}

void ObjectTypeChoice::OnmoreObjectsBtClick(wxCommandEvent& event)
{
    gd::ProjectExtensionsDialog dialog(this, game);
    dialog.ShowModal();

    RefreshList();
}
