/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ChoixAction.h"

//(*InternalHeaders(ChoixAction)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)

#include "wx/image.h"
#include "wx/icon.h"
#include <wx/log.h>
#include <wx/imaglist.h>
#include <wx/colordlg.h>
#include <wx/filedlg.h>
#include <wx/help.h>
#include <wx/msgdlg.h>
#include <wx/config.h>
#include <boost/algorithm/string.hpp>
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDL/CommonTools.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/Object.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExtensionBase.h"
#include "GDL/IDE/gdTreeItemStringData.h"
#include "GDL/IDE/HelpFileAccess.h"
#include "GDCore/IDE/ActionSentenceFormatter.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDL/IDE/ExpressionsCorrectnessTesting.h"
#include "Extensions.h"

#include "GDL/IDE/Dialogs/ChooseObject.h"
#include "GDL/IDE/Dialogs/EditExpression.h"
#include "GDL/IDE/Dialogs/EditTextDialog.h"
#include "GDL/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDL/IDE/Dialogs/ChooseAutomatismDlg.h"
#include "GDL/IDE/Dialogs/ObjectListDialogsHelper.h"
#include "GDL/IDE/Dialogs/ChooseLayer.h"
#include "ChoixClavier.h"
#include "SigneModification.h"
#include "GeneratePassword.h"
#include "ChoiceJoyAxis.h"
#include "ChoiceFile.h"

#ifdef __WXMSW__
#include <wx/msw/uxtheme.h>
#endif

//(*IdInit(ChoixAction)
const long ChoixAction::ID_TREECTRL1 = wxNewId();
const long ChoixAction::ID_TREECTRL2 = wxNewId();
const long ChoixAction::ID_TREECTRL3 = wxNewId();
const long ChoixAction::ID_TREECTRL4 = wxNewId();
const long ChoixAction::ID_TREECTRL5 = wxNewId();
const long ChoixAction::ID_NOTEBOOK2 = wxNewId();
const long ChoixAction::ID_TEXTCTRL2 = wxNewId();
const long ChoixAction::ID_TREECTRL6 = wxNewId();
const long ChoixAction::ID_PANEL1 = wxNewId();
const long ChoixAction::ID_NOTEBOOK1 = wxNewId();
const long ChoixAction::ID_TEXTCTRL1 = wxNewId();
const long ChoixAction::ID_STATICBITMAP1 = wxNewId();
const long ChoixAction::ID_STATICTEXT1 = wxNewId();
const long ChoixAction::ID_STATICTEXT2 = wxNewId();
const long ChoixAction::ID_STATICLINE1 = wxNewId();
const long ChoixAction::ID_RADIOBUTTON1 = wxNewId();
const long ChoixAction::ID_RADIOBUTTON2 = wxNewId();
const long ChoixAction::ID_STATICLINE2 = wxNewId();
const long ChoixAction::ID_BUTTON4 = wxNewId();
const long ChoixAction::ID_CHECKBOX2 = wxNewId();
const long ChoixAction::ID_BUTTON1 = wxNewId();
const long ChoixAction::ID_BUTTON2 = wxNewId();
const long ChoixAction::ID_BUTTON3 = wxNewId();
//*)
const long ChoixAction::ID_EDITARRAY = wxNewId();
const long ChoixAction::ID_TEXTARRAY = wxNewId();
const long ChoixAction::ID_BUTTONARRAY = wxNewId();
const long ChoixAction::ID_CHECKARRAY = wxNewId();

BEGIN_EVENT_TABLE(ChoixAction,wxDialog)
	//(*EventTable(ChoixAction)
	//*)
END_EVENT_TABLE()

ChoixAction::ChoixAction(wxWindow* parent, Game & game_, Scene & scene_) :
game(game_),
scene(scene_)
{
	//(*Initialize(ChoixAction)
	wxBoxSizer* BoxSizer4;
	wxBoxSizer* BoxSizer6;
	wxFlexGridSizer* FlexGridSizer4;
	wxBoxSizer* BoxSizer5;
	wxBoxSizer* BoxSizer10;
	wxBoxSizer* BoxSizer7;
	wxBoxSizer* BoxSizer8;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxBoxSizer* BoxSizer2;
	wxBoxSizer* BoxSizer1;
	wxBoxSizer* BoxSizer9;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxBoxSizer* BoxSizer3;

	Create(parent, wxID_ANY, _("Editer l\'action"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("wxID_ANY"));
	SetClientSize(wxSize(717,396));
	SetMinSize(wxSize(640,480));
	wxIcon FrameIcon;
	FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/actionicon.png"))));
	SetIcon(FrameIcon);
	BoxSizer6 = new wxBoxSizer(wxVERTICAL);
	BoxSizer7 = new wxBoxSizer(wxHORIZONTAL);
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxSize(270,500), 0, _T("ID_NOTEBOOK1"));
	ActionsTree = new wxTreeCtrl(Notebook1, ID_TREECTRL1, wxDefaultPosition, wxSize(300,350), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL1"));
	ActionsTree->SetToolTip(_("Choisissez une action à paramétrer."));
	Panel1 = new wxPanel(Notebook1, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	BoxSizer9 = new wxBoxSizer(wxVERTICAL);
	BoxSizer10 = new wxBoxSizer(wxVERTICAL);
	objectsListsNotebook = new wxNotebook(Panel1, ID_NOTEBOOK2, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK2"));
	ObjetsList = new wxTreeCtrl(objectsListsNotebook, ID_TREECTRL2, wxPoint(-71,-11), wxSize(179,170), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL2"));
	ObjetsList->SetToolTip(_("Choisissez un objet dans la liste"));
	GroupesList = new wxTreeCtrl(objectsListsNotebook, ID_TREECTRL3, wxPoint(-71,-11), wxSize(179,170), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL3"));
	GroupesList->SetToolTip(_("Choisissez un objet dans la liste"));
	globalObjectsList = new wxTreeCtrl(objectsListsNotebook, ID_TREECTRL4, wxPoint(-71,-11), wxSize(179,170), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL4"));
	globalObjectsList->SetToolTip(_("Choisissez un objet dans la liste"));
	globalObjectGroups = new wxTreeCtrl(objectsListsNotebook, ID_TREECTRL5, wxPoint(-71,-11), wxSize(281,190), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL5"));
	globalObjectGroups->SetToolTip(_("Choisissez un objet dans la liste"));
	objectsListsNotebook->AddPage(ObjetsList, _("Objets"), false);
	objectsListsNotebook->AddPage(GroupesList, _("Groupes d\'objets"), false);
	objectsListsNotebook->AddPage(globalObjectsList, _("Objets globaux"), false);
	objectsListsNotebook->AddPage(globalObjectGroups, _("Groupes globaux"), false);
	BoxSizer10->Add(objectsListsNotebook, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	objectsSearchCtrl = new wxSearchCtrl(Panel1, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(10,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	BoxSizer10->Add(objectsSearchCtrl, 0, wxBOTTOM|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer9->Add(BoxSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	objectActionsTree = new wxTreeCtrl(Panel1, ID_TREECTRL6, wxDefaultPosition, wxDefaultSize, wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL6"));
	objectActionsTree->SetToolTip(_("Choisissez une action à paramétrer."));
	BoxSizer9->Add(objectActionsTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel1->SetSizer(BoxSizer9);
	BoxSizer9->Fit(Panel1);
	BoxSizer9->SetSizeHints(Panel1);
	Notebook1->AddPage(ActionsTree, _("Toutes les actions"), false);
	Notebook1->AddPage(Panel1, _("Par objet"), false);
	FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	searchCtrl = new wxSearchCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer1->Add(searchCtrl, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer7->Add(FlexGridSizer1, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer8 = new wxBoxSizer(wxVERTICAL);
	FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
	ActionImg = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/unknown24.png")).Rescale(wxSize(24,24).GetWidth(),wxSize(24,24).GetHeight())), wxDefaultPosition, wxSize(24,24), wxNO_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer3->Add(ActionImg, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer4 = new wxBoxSizer(wxHORIZONTAL);
	NomActionTxt = new wxStaticText(this, ID_STATICTEXT1, _("Aucune action choisie"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	wxFont NomActionTxtFont(16,wxSWISS,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	NomActionTxt->SetFont(NomActionTxtFont);
	BoxSizer4->Add(NomActionTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(BoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer8->Add(FlexGridSizer3, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer3 = new wxBoxSizer(wxHORIZONTAL);
	ActionTextTxt = new wxStaticText(this, ID_STATICTEXT2, _("Choisissez une action dans le menu de gauche"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	ActionTextTxt->SetToolTip(_("Pour plus d\'informations sur la condition, consultez l\'aide."));
	BoxSizer3->Add(ActionTextTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer8->Add(BoxSizer3, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(480,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	BoxSizer1->Add(StaticLine1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 3);
	BoxSizer8->Add(BoxSizer1, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	GridSizer1->AddGrowableCol(1);
	BoxSizer8->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 4, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Sélection des objets"));
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	LocaliseCheck = new wxRadioButton(this, ID_RADIOBUTTON1, _("Par défaut"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
	LocaliseCheck->SetValue(true);
	LocaliseCheck->SetToolTip(_("Ne seront pris en compte que les objets concernés par les autres conditions et actions de l\'évènement."));
	FlexGridSizer5->Add(LocaliseCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GlobalCheck = new wxRadioButton(this, ID_RADIOBUTTON2, _("Forcer en global"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
	GlobalCheck->SetToolTip(_("Tous les objets de la scène seront concernés par cette action."));
	FlexGridSizer5->Add(GlobalCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer8->Add(FlexGridSizer4, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer7->Add(BoxSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer6->Add(BoxSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer2 = new wxBoxSizer(wxHORIZONTAL);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	BoxSizer2->Add(StaticLine2, 1, wxTOP|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	BoxSizer6->Add(BoxSizer2, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	moreBt = new wxButton(this, ID_BUTTON4, _("Plus d\'actions"), wxDefaultPosition, wxSize(119,23), 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer6->Add(moreBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	objSortCheck = new wxCheckBox(this, ID_CHECKBOX2, _("Ranger par objets"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	objSortCheck->SetValue(false);
	FlexGridSizer6->Add(objSortCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer6, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer5 = new wxBoxSizer(wxHORIZONTAL);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	BoxSizer5->Add(OkBt, 1, wxALL|wxFIXED_MINSIZE|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	CancelBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	BoxSizer5->Add(CancelBt, 1, wxALL|wxFIXED_MINSIZE|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	AideBt = new wxButton(this, ID_BUTTON3, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	BoxSizer5->Add(AideBt, 1, wxALL|wxFIXED_MINSIZE|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(BoxSizer5, 0, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer6->Add(FlexGridSizer2, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(BoxSizer6);
	BoxSizer6->SetSizeHints(this);
	Center();

	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixAction::OnActionsTreeSelectionChanged);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixAction::OnObjetsListSelectionChanged);
	Connect(ID_TREECTRL3,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixAction::OnObjetsListSelectionChanged);
	Connect(ID_TREECTRL4,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixAction::OnObjetsListSelectionChanged);
	Connect(ID_TREECTRL5,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixAction::OnObjetsListSelectionChanged);
	Connect(ID_TEXTCTRL2,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ChoixAction::OnobjectsSearchCtrlText);
	Connect(ID_TREECTRL6,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixAction::OnobjectActionsTreeSelectionChanged);
	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ChoixAction::OnsearchCtrlText);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixAction::OnmoreBtClick);
	Connect(ID_CHECKBOX2,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&ChoixAction::OnobjSortCheckClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixAction::OnOkBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixAction::OnCancelBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixAction::OnAideBtClick);
	//*)
    moreBt->SetBitmap(wxBitmap("res/extensiononly16.png", wxBITMAP_TYPE_ANY));

    #if defined(__WXMSW__) //Offer nice look to list
    wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
    if(theme) theme->SetWindowTheme((HWND) ActionsTree->GetHWND(), L"EXPLORER", NULL);
    if(theme) theme->SetWindowTheme((HWND) ObjetsList->GetHWND(), L"EXPLORER", NULL);
    if(theme) theme->SetWindowTheme((HWND) GroupesList->GetHWND(), L"EXPLORER", NULL);
    if(theme) theme->SetWindowTheme((HWND) globalObjectsList->GetHWND(), L"EXPLORER", NULL);
    if(theme) theme->SetWindowTheme((HWND) globalObjectGroups->GetHWND(), L"EXPLORER", NULL);
    if(theme) theme->SetWindowTheme((HWND) objectActionsTree->GetHWND(), L"EXPLORER", NULL);
    #endif

    searchCtrl->SetFocus();

    imageList = new wxImageList( 16, 16 );
    imageList->Add(( wxBitmap( "res/actions/uneaction.png", wxBITMAP_TYPE_ANY ) ) );
    ActionsTree->AssignImageList( imageList );
    objectActionsTree->SetImageList( imageList );

    Type = "";
    Loc = true;

    RefreshAllLists();
    Center();
}

ChoixAction::~ChoixAction()
{
	//(*Destroy(ChoixAction)
	//*)
}

void ChoixAction::RefreshAllLists()
{
    RefreshObjectsLists();
    RefreshObjectActionsList();
    RefreshList();
}


/**
 * Create the list of actions
 */
void ChoixAction::RefreshList()
{
    ActionsTree->DeleteAllItems();
    ActionsTree->AddRoot( _( "Toutes les actions" ),0);

    std::string search = boost::to_upper_copy(string(searchCtrl->GetValue().mb_str()));
    bool searching = search.empty() ? false : true;

    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const vector < boost::shared_ptr<ExtensionBase> > extensions = extensionManager->GetExtensions();

    //Insert extension objects actions
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.GetUsedPlatformExtensions().begin(),
                  game.GetUsedPlatformExtensions().end(),
                  extensions[i]->GetName()) == game.GetUsedPlatformExtensions().end() )
            continue;

	    vector<string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
	    vector<string> automatismsTypes = extensions[i]->GetAutomatismsTypes();

        wxTreeItemId extensionItem = ActionsTree->GetRootItem();
        if ( !objectsTypes.empty() || !automatismsTypes.empty() )//Display the extension name only if it contains objects/automatisms
        {
            if ( extensions[i]->GetName() == "BuiltinObject" )
                extensionItem = ActionsTree->AppendItem(ActionsTree->GetRootItem(), _("Tous les objets"), 0);
            else
                extensionItem = ActionsTree->AppendItem(ActionsTree->GetRootItem(), extensions[i]->GetFullName(), 0);
        }

	    for(unsigned int j = 0;j<objectsTypes.size();++j)
	    {
            wxTreeItemId objectTypeItem = objSortCheck->GetValue() ?
                                        ActionsTree->AppendItem(extensionItem,
                                                                _("Objet") + wxString(" ") + extensions[i]->GetObjectInfo(objectsTypes[j]).fullname,
                                                                0) :
                                        extensionItem;
            //Add each object actions
            std::map<string, InstructionMetadata > allObjActions = extensions[i]->GetAllActionsForObject(objectsTypes[j]);
            for(std::map<string, InstructionMetadata>::const_iterator it = allObjActions.begin(); it != allObjActions.end(); ++it)
            {
                //Verify if the action match the search
                if ( searching &&
                    boost::to_upper_copy(it->second.group).find(search) == string::npos &&
                    boost::to_upper_copy(it->second.fullname).find(search) == string::npos)
                    continue;

                //Search and/or add group item
                wxTreeItemIdValue cookie;
                wxTreeItemId groupItem = ActionsTree->GetFirstChild(objectTypeItem, cookie);
                while ( groupItem.IsOk() && ActionsTree->GetItemText(groupItem) != it->second.group )
                {
                    groupItem = ActionsTree->GetNextSibling(groupItem);
                }
                if ( !groupItem.IsOk() ) groupItem = ActionsTree->AppendItem(objectTypeItem, it->second.group, 0);

                //Add action item
                int IDimage = 0;
                if ( it->second.smallicon.IsOk() )
                {
                    imageList->Add(it->second.smallicon);
                    IDimage = imageList->GetImageCount()-1;
                }

                gdTreeItemStringData * associatedData = new gdTreeItemStringData(it->first);
                ActionsTree->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
            }
	    }

	    for(unsigned int j = 0;j<automatismsTypes.size();++j)
	    {
            wxTreeItemId automatismTypeItem = objSortCheck->GetValue() ?
                                        ActionsTree->AppendItem(extensionItem,
                                                                _("Automatisme") + wxString(" ") + extensions[i]->GetAutomatismInfo(automatismsTypes[j]).fullname,
                                                                0) :
                                        extensionItem;
            //Add each automatism actions
            std::map<string, InstructionMetadata > allAutoActions = extensions[i]->GetAllActionsForAutomatism(automatismsTypes[j]);
            for(std::map<string, InstructionMetadata>::const_iterator it = allAutoActions.begin(); it != allAutoActions.end(); ++it)
            {
                //Verify if the action match the search
                if ( searching
                    && boost::to_upper_copy(it->second.group).find(search) == string::npos
                    && boost::to_upper_copy(it->second.fullname).find(search) == string::npos)
                    continue;

                //Search and/or add group item
                wxTreeItemIdValue cookie;
                wxTreeItemId groupItem = ActionsTree->GetFirstChild(automatismTypeItem, cookie);
                while ( groupItem.IsOk() && ActionsTree->GetItemText(groupItem) != it->second.group )
                {
                    groupItem = ActionsTree->GetNextSibling(groupItem);
                }
                if ( !groupItem.IsOk() ) groupItem = ActionsTree->AppendItem(automatismTypeItem, it->second.group, 0);

                //Add action item
                int IDimage = 0;
                if ( it->second.smallicon.IsOk() )
                {
                    imageList->Add(it->second.smallicon);
                    IDimage = imageList->GetImageCount()-1;
                }

                gdTreeItemStringData * associatedData = new gdTreeItemStringData(it->first);
                ActionsTree->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
            }
	    }

        //Add each (free) actions
        std::map<string, InstructionMetadata > allActions = extensions[i]->GetAllActions();
        for(std::map<string, InstructionMetadata>::const_iterator it = allActions.begin(); it != allActions.end(); ++it)
        {
            //Verify if the action match the search
            if ( searching &&
                boost::to_upper_copy(it->second.group).find(search) == string::npos &&
                boost::to_upper_copy(it->second.fullname).find(search) == string::npos)
                continue;

            //Search and/or add group item
            wxTreeItemIdValue cookie;
            wxTreeItemId groupItem = ActionsTree->GetFirstChild(extensionItem, cookie);
            while ( groupItem.IsOk() && ActionsTree->GetItemText(groupItem) != it->second.group )
            {
                groupItem = ActionsTree->GetNextSibling(groupItem);
            }
            if ( !groupItem.IsOk() ) groupItem = ActionsTree->AppendItem(extensionItem, it->second.group, 0);

            //Add action item
            int IDimage = 0;
            if ( it->second.smallicon.IsOk() )
            {
                imageList->Add(it->second.smallicon);
                IDimage = imageList->GetImageCount()-1;
            }

            gdTreeItemStringData * associatedData = new gdTreeItemStringData(it->first);
            ActionsTree->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
        }

        if ( !ActionsTree->HasChildren(extensionItem) ) ActionsTree->Delete(extensionItem);
	}

	if ( searching ) ActionsTree->ExpandAll();
}

void ChoixAction::RefreshObjectsLists()
{
    ObjectListDialogsHelper objectListsHelper(game, scene);
    objectListsHelper.RefreshLists(ObjetsList, GroupesList, globalObjectsList, globalObjectGroups, "", string(objectsSearchCtrl->GetValue().mb_str()));
}

void ChoixAction::RefreshObjectActionsList()
{
    objectActionsTree->DeleteAllItems();
    objectActionsTree->AddRoot( _( "Toutes les actions" ),0);

    std::string search = boost::to_upper_copy(string(searchCtrl->GetValue().mb_str()));
    bool searching = search.empty() ? false : true;

    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const vector < boost::shared_ptr<ExtensionBase> > extensions = extensionManager->GetExtensions();
    std::string selectedObjectType = gd::GetTypeOfObject(game, scene, selectedObject);

    //Insert extension objects actions
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.GetUsedPlatformExtensions().begin(),
                  game.GetUsedPlatformExtensions().end(),
                  extensions[i]->GetName()) == game.GetUsedPlatformExtensions().end() )
            continue;

        wxTreeItemId extensionItem = objectActionsTree->GetRootItem();
        std::string objectType = selectedObjectType;
        if ( extensions[i]->GetName() == "BuiltinObject" )
        {
            objectType = "";
            extensionItem = objectActionsTree->AppendItem(objectActionsTree->GetRootItem(), _("Tous les objets"), 0);
        }
        else
            extensionItem = objectActionsTree->AppendItem(objectActionsTree->GetRootItem(), extensions[i]->GetFullName(), 0);

        wxTreeItemId objectTypeItem = objSortCheck->GetValue() ?
                                    objectActionsTree->AppendItem(extensionItem,
                                                            _("Objet") + wxString(" ") + extensions[i]->GetObjectInfo(objectType).fullname,
                                                            0) :
                                    extensionItem;

        //Add each object actions
        std::map<string, InstructionMetadata > allObjActions = extensions[i]->GetAllActionsForObject(objectType);
        for(std::map<string, InstructionMetadata>::const_iterator it = allObjActions.begin(); it != allObjActions.end(); ++it)
        {
            //Verify if the action match the search
            if ( searching &&
                boost::to_upper_copy(it->second.group).find(search) == string::npos &&
                boost::to_upper_copy(it->second.fullname).find(search) == string::npos)
                continue;

            //Search and/or add group item
            wxTreeItemIdValue cookie;
            wxTreeItemId groupItem = objectActionsTree->GetFirstChild(objectTypeItem, cookie);
            while ( groupItem.IsOk() && objectActionsTree->GetItemText(groupItem) != it->second.group )
            {
                groupItem = objectActionsTree->GetNextSibling(groupItem);
            }
            if ( !groupItem.IsOk() ) groupItem = objectActionsTree->AppendItem(objectTypeItem, it->second.group, 0);

            //Add action item
            int IDimage = 0;
            if ( it->second.smallicon.IsOk() )
            {
                imageList->Add(it->second.smallicon);
                IDimage = imageList->GetImageCount()-1;
            }

            gdTreeItemStringData * associatedData = new gdTreeItemStringData(it->first);
            objectActionsTree->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
        }

	    vector<string> automatismsTypes = extensions[i]->GetAutomatismsTypes();
	    vector<std::string> objectAutomatisms = gd::GetAutomatismsOfObject(game, scene, selectedObject);

	    for(unsigned int j = 0;j<objectAutomatisms.size();++j)
	    {
	        std::string automatismType = gd::GetTypeOfAutomatism(game, scene, objectAutomatisms[j]);

	        if ( find(automatismsTypes.begin(), automatismsTypes.end(), automatismType) == automatismsTypes.end() )
                continue;

            wxTreeItemId automatismTypeItem = objSortCheck->GetValue() ?
                                        objectActionsTree->AppendItem(extensionItem,
                                                                _("Automatisme") + wxString(" ") + extensions[i]->GetAutomatismInfo(automatismType).fullname,
                                                                0) :
                                        extensionItem;
            //Add each automatism actions
            std::map<string, InstructionMetadata > allAutoActions = extensions[i]->GetAllActionsForAutomatism(automatismType);
            for(std::map<string, InstructionMetadata>::const_iterator it = allAutoActions.begin(); it != allAutoActions.end(); ++it)
            {
                //Verify if the action match the search
                if ( searching &&
                    boost::to_upper_copy(it->second.group).find(search) == string::npos &&
                    boost::to_upper_copy(it->second.fullname).find(search) == string::npos)
                    continue;

                //Search and/or add group item
                wxTreeItemIdValue cookie;
                wxTreeItemId groupItem = objectActionsTree->GetFirstChild(automatismTypeItem, cookie);
                while ( groupItem.IsOk() && objectActionsTree->GetItemText(groupItem) != it->second.group )
                {
                    groupItem = objectActionsTree->GetNextSibling(groupItem);
                }
                if ( !groupItem.IsOk() ) groupItem = objectActionsTree->AppendItem(automatismTypeItem, it->second.group, 0);

                //Add action item
                int IDimage = 0;
                if ( it->second.smallicon.IsOk() )
                {
                    imageList->Add(it->second.smallicon);
                    IDimage = imageList->GetImageCount()-1;
                }

                gdTreeItemStringData * associatedData = new gdTreeItemStringData(it->first);
                objectActionsTree->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
            }
	    }

	    if ( !objectActionsTree->HasChildren(extensionItem) ) objectActionsTree->Delete(extensionItem);
	}

	if ( searching ) objectActionsTree->ExpandAll();
}

/**
 * Action chosen in all actions list.
 */
void ChoixAction::OnActionsTreeSelectionChanged(wxTreeEvent& event)
{
    gdTreeItemStringData * associatedData = dynamic_cast<gdTreeItemStringData*>(ActionsTree->GetItemData(event.GetItem()));
    if ( associatedData != NULL )
    {
        Type = associatedData->GetString();

        RefreshFromAction();
        return;
    }
}

/**
 * Action chosen in object actions list.
 */
void ChoixAction::OnobjectActionsTreeSelectionChanged(wxTreeEvent& event)
{
    gdTreeItemStringData * associatedData = dynamic_cast<gdTreeItemStringData*>(objectActionsTree->GetItemData(event.GetItem()));
    if ( associatedData != NULL )
    {
        Type = associatedData->GetString();

        RefreshFromAction();
        if ( !ParaEdit.empty() ) ParaEdit[0]->SetValue(selectedObject);
        return;
    }
}

////////////////////////////////////////////////////////////
/// Rafraichissement
///
/// Rafraichit la fenetre et les controles en utilisant les données actuelles
////////////////////////////////////////////////////////////
void ChoixAction::RefreshFromAction()
{
    if ( Type.empty() ) return;

    const InstructionMetadata & InstructionMetadata = GDpriv::ExtensionsManager::GetInstance()->GetActionInfos(Type);

    //Display action main properties
    NomActionTxt->SetLabel( InstructionMetadata.fullname );
    NomActionTxt->Wrap( 450 );
    ActionTextTxt->SetLabel( InstructionMetadata.description );
    ActionTextTxt->Wrap( 450 );
    if ( InstructionMetadata.icon.IsOk() ) ActionImg->SetBitmap( InstructionMetadata.icon );
    else ActionImg->SetBitmap(CommonBitmapManager::GetInstance()->unknown24);

    //Update controls count
    while ( ParaEdit.size() < InstructionMetadata.parameters.size() )
    {
        const string num =ToString( ParaEdit.size() );
        long id = wxNewId(); //Bitmap buttons want an unique id so as to be displayed properly

        //Addings controls
        ParaFac.push_back(new wxCheckBox( this, ID_CHECKARRAY, "", wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, num ));
        ParaText.push_back(new wxStaticText( this, ID_TEXTARRAY, _( "Paramètre :" ), wxDefaultPosition, wxDefaultSize, 0, _T( "TxtPara" + num ) ));
        ParaSpacer1.push_back( new wxPanel(this) );
        ParaSpacer2.push_back( new wxPanel(this) );
        ParaEdit.push_back( new wxTextCtrl( this, ID_EDITARRAY, "", wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T( "EditPara" + num ) ));
        ParaBmpBt.push_back( new wxBitmapButton( this, id, CommonBitmapManager::GetInstance()->expressionBt, wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, num ));

        //Connecting events
        Connect( id, wxEVT_COMMAND_BUTTON_CLICKED, wxCommandEventHandler( ChoixAction::OnABtClick ) );
        Connect( ID_CHECKARRAY, wxEVT_COMMAND_CHECKBOX_CLICKED, wxCommandEventHandler( ChoixAction::OnFacClicked ) );

        //Placing controls
        GridSizer1->Add( ParaFac.back(), 1, wxALL | wxALIGN_LEFT | wxALIGN_CENTER_VERTICAL, 5 );
        GridSizer1->Add( ParaText.back(), 1, wxALL | wxALIGN_LEFT | wxEXPAND | wxALIGN_CENTER_VERTICAL, 5 );
        GridSizer1->Add( ParaSpacer1.back(), 0, 0 );
        GridSizer1->Add( ParaSpacer2.back(), 0, 0 );
        GridSizer1->Add( ParaEdit.back(), 1, wxALL | wxALIGN_LEFT | wxEXPAND | wxALIGN_CENTER_VERTICAL, 5 );
        GridSizer1->Add( ParaBmpBt.back(), 1, wxALL | wxALIGN_LEFT | wxEXPAND | wxALIGN_CENTER_VERTICAL, 5 );

        ParaSpacer1.back()->Show(false);
        ParaSpacer2.back()->Show(false);
    }
    while ( ParaEdit.size() > InstructionMetadata.parameters.size() )
    {
    	ParaFac.back()->Destroy();
    	ParaFac.erase(ParaFac.begin()+ParaFac.size()-1);
    	ParaText.back()->Destroy();
    	ParaText.erase(ParaText.begin()+ParaText.size()-1);
    	ParaSpacer1.back()->Destroy();
    	ParaSpacer1.erase(ParaSpacer1.begin()+ParaSpacer1.size()-1);
    	ParaSpacer2.back()->Destroy();
    	ParaSpacer2.erase(ParaSpacer2.begin()+ParaSpacer2.size()-1);
    	ParaEdit.back()->Destroy();
    	ParaEdit.erase(ParaEdit.begin()+ParaEdit.size()-1);
    	ParaBmpBt.back()->Destroy();
    	ParaBmpBt.erase(ParaBmpBt.begin()+ParaBmpBt.size()-1);
    }

    //Update parameters
    for ( unsigned int i = 0;i < InstructionMetadata.parameters.size();i++ )
    {
        if (InstructionMetadata.parameters[i].codeOnly)
        {
            ParaFac.at(i)->Show(false);
            ParaText.at(i)->Show(false);
            ParaBmpBt.at(i)->Show(false);
            ParaEdit.at(i)->Show(false);
        }
        else
        {
            ParaFac.at(i)->Show(InstructionMetadata.parameters[i].optional);
            ParaFac.at(i)->SetValue(!ParaEdit.at( i )->GetValue().empty());

            ParaText.at(i)->SetLabel( InstructionMetadata.parameters[i].description + _(" :") );
            ParaText.at(i)->Show();

            if ( i < Param.size() ) ParaEdit.at( i )->SetValue(Param[i].GetPlainString());
            ParaEdit.at(i)->Show();

            ParaBmpBt.at(i)->SetBitmapLabel( TranslateAction::GetInstance()->BitmapFromType(InstructionMetadata.parameters[i].type) );
            ParaBmpBt.at(i)->SetToolTip( TranslateAction::GetInstance()->LabelFromType(InstructionMetadata.parameters[i].type) );
            ParaBmpBt.at(i)->Show( !InstructionMetadata.parameters[i].type.empty() );

            //De/activate widgets if parameter is optional
            if ( InstructionMetadata.parameters[i].optional && !ParaFac.at(i)->GetValue() && ParaEdit.at(i)->GetValue().empty() )
            {
                ParaBmpBt.at(i)->Enable(false);
                ParaText.at(i)->Enable(false);
                ParaEdit.at(i)->Enable(false);
                ParaFac.at(i)->SetValue(false);
            }
            else
            {
                ParaBmpBt.at(i)->Enable(true);
                ParaText.at(i)->Enable(true);
                ParaEdit.at(i)->Enable(true);
                ParaFac.at(i)->SetValue(true);
            }

            //Add defaults
            if ( !InstructionMetadata.parameters[i].optional && (i >= Param.size() || Param[i].GetPlainString().empty())  )
            {
                if ( InstructionMetadata.parameters[i].type == "expression" ) ParaEdit.at( i )->SetValue("0");
                else if ( InstructionMetadata.parameters[i].type == "string" ) ParaEdit.at( i )->SetValue("\"\"");
                else if ( InstructionMetadata.parameters[i].type == "operator" ) ParaEdit.at( i )->SetValue("=");
            }

        }
    }
    Layout();
    GridSizer1->Layout();

    //Update localization
    LocaliseCheck->SetValue(Loc);
    GlobalCheck->SetValue(!Loc);

    Layout();
}

////////////////////////////////////////////////////////////
/// Clic sur un bouton
////////////////////////////////////////////////////////////
void ChoixAction::OnABtClick(wxCommandEvent& event)
{
    // On déduit le numéro du paramètre à partir du nom du bouton
    // ( Son nom, pas son label )
    string num = ( string ) wxWindow::FindFocus()->GetName();
    unsigned int i = ToInt(num);

    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const InstructionMetadata & InstructionMetadata = extensionManager->GetActionInfos(Type);

    if ( i < MaxPara && i < InstructionMetadata.parameters.size())
    {
        if ( InstructionMetadata.parameters[i].type == "object" )
        {
            ChooseObject Dialog(this, game, scene, true, InstructionMetadata.parameters[i].supplementaryInformation);
            if ( Dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(Dialog.objectChosen);
            }
            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "automatism" )
        {
            std::string object = ParaEdit.empty() ? "" : ParaEdit[0]->GetValue().mb_str();
            ChooseAutomatismDlg dialog(this, game, scene, object, InstructionMetadata.parameters[i].supplementaryInformation);
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.automatismChosen);

            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "expression" )
        {
            EditExpression Dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ), game, scene);
            if ( Dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(Dialog.expression);
            }
            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "string" )
        {
            EditTextDialog Dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ), game, scene);
            if ( Dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(Dialog.returnedText);
            }
            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "color" )
        {
            wxColour color = wxGetColourFromUser(this, wxColour(0,0,0));
            if ( color.IsOk() )
            {
                wxString r; r << static_cast<int>(color.Red());
                wxString v; v << static_cast<int>(color.Green());
                wxString b; b << static_cast<int>(color.Blue());

                ParaEdit.at(i)->ChangeValue("\""+r+";"+v+";"+b+"\"");
            }
            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "police" )
        {
            wxFileDialog dialog(this, _("Choisissez une police de caractère ( fichiers ttf, ttc )"), "", "", "Polices (*.ttf, *.ttc)|*.ttf;*.ttc");
            dialog.ShowModal();

            if ( dialog.GetPath() != "" )
            {
                ParaEdit.at(i)->ChangeValue(static_cast<string> ( dialog.GetPath() ));
            }

            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "musicfile" )
        {
            wxFileDialog dialog(this, _("Choisissez une musique ( fichiers ogg )"), "", "", "Fichiers audio (*.ogg)|*.ogg");
            dialog.ShowModal();

            if ( dialog.GetPath() != "" )
            {
                ParaEdit.at(i)->ChangeValue(static_cast<string> ( dialog.GetPath() ));
            }

            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "soundfile" )
        {
            wxFileDialog dialog(this, _("Choisissez un son ( fichiers wav )"), "", "", "Fichiers audio (*.wav)|*.wav");
            dialog.ShowModal();

            if ( dialog.GetPath() != "" )
            {
                ParaEdit.at(i)->ChangeValue(static_cast<string> ( dialog.GetPath() ));
            }

            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "operator" )
        {
            SigneModification dialog(this);
            int retour = dialog.ShowModal();

            if ( retour == 1 )
                ParaEdit.at(i)->ChangeValue("=");
            if ( retour == 2 )
                ParaEdit.at(i)->ChangeValue("+");
            if ( retour == 3 )
                ParaEdit.at(i)->ChangeValue("-");
            if ( retour == 4 )
                ParaEdit.at(i)->ChangeValue("*");
            if ( retour == 5 )
                ParaEdit.at(i)->ChangeValue("/");

            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "password" )
        {
            GeneratePassword dialog(this);

            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.mdp);

            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "yesorno" )
        {
            if (wxMessageBox("Choisissez Oui ou Non pour compléter ce paramètre :", "Oui ou non",wxYES_NO ) == wxYES)
            {
                ParaEdit.at(i)->ChangeValue(_("oui"));
            }
            else
            {
                ParaEdit.at(i)->ChangeValue(_("non"));
            }

            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "layer" )
        {
            ChooseLayer dialog(this, scene.initialLayers);
            if( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.layerChosen);

            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "joyaxis" )
        {
            ChoiceJoyAxis dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ), game, scene, true);
            if( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.joyaxis);

            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "file" )
        {
            ChoiceFile dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ), game, scene, true);
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.file);

            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "objectvar" )
        {
            if ( ParaEdit.empty() ) return;

            string objectWanted = string(ParaEdit[0]->GetValue().mb_str());
            std::vector<ObjSPtr>::iterator sceneObject = std::find_if(scene.GetInitialObjects().begin(), scene.GetInitialObjects().end(), std::bind2nd(ObjectHasName(), objectWanted));
            std::vector<ObjSPtr>::iterator globalObject = std::find_if(game.GetGlobalObjects().begin(), game.GetGlobalObjects().end(), std::bind2nd(ObjectHasName(), objectWanted));

            ObjSPtr object = boost::shared_ptr<Object> ();

            if ( sceneObject != scene.GetInitialObjects().end() ) //We check first scene's objects' list.
                object = *sceneObject;
            else if ( globalObject != game.GetGlobalObjects().end() ) //Then the global object list
                object = *globalObject;
            else
                return;

            ChooseVariableDialog dialog(this, object->variablesObjet);
            if ( dialog.ShowModal() == 1 )
            {
                object->variablesObjet = dialog.variables;
                ParaEdit.at(i)->ChangeValue(dialog.selectedVariable);
            }

            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "scenevar" )
        {
            ChooseVariableDialog dialog(this, scene.variables);
            if ( dialog.ShowModal() == 1 )
            {
                scene.variables = dialog.variables;
                ParaEdit.at(i)->ChangeValue(dialog.selectedVariable);
            }

            return;
        }
        else if ( InstructionMetadata.parameters[i].type == "globalvar" )
        {
            ChooseVariableDialog dialog(this, game.variables);
            if ( dialog.ShowModal() == 1 )
            {
                game.variables = dialog.variables;
                ParaEdit.at(i)->ChangeValue(dialog.selectedVariable);
            }

            return;
        }
    }
}

////////////////////////////////////////////////////////////
/// Clic sur un bouton radio
////////////////////////////////////////////////////////////
void ChoixAction::OnFacClicked(wxCommandEvent& event)
{
    // On déduit le numéro du paramètre à partir du nom du bouton
    // ( Son nom, pas son label )
    string num = string(wxWindow::FindFocus()->GetName().mb_str());
    unsigned int i = ToInt(num);

    if ( ParaFac.at(i)->GetValue() )
    {
        ParaBmpBt.at(i)->Enable(true);
        ParaText.at(i)->Enable(true);
        ParaEdit.at(i)->Enable(true);
    }
    else
    {
        ParaBmpBt.at(i)->Enable(false);
        ParaText.at(i)->Enable(false);
        ParaEdit.at(i)->Enable(false);
    }
}

void ChoixAction::OnOkBtClick(wxCommandEvent& event)
{
    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const InstructionMetadata & InstructionMetadata = extensionManager->GetActionInfos(Type);

    if ( Type == "" )
        return;

    if (ParaEdit.size() < InstructionMetadata.parameters.size())
    {
        wxLogWarning(_("Trop peu de paramètres. Ceci peut être dû à un bug de Game Develop."));
        return;
    }

    //Check for validity of parameters
    bool parametersHaveErrors = false;
    string message;
    size_t parameterDisplayedNb = 0;
    for ( unsigned int i = 0;i < InstructionMetadata.parameters.size();i++ )
    {
        if (!InstructionMetadata.parameters[i].codeOnly ) parameterDisplayedNb++;

        //Do not check optional parameters which are desactivated
        if ( !ParaFac.at(i)->IsShown() || (ParaFac.at(i)->IsShown() && ParaFac.at(i)->GetValue()))
        {
            CallbacksForExpressionCorrectnessTesting callbacks(game, scene);
            GDExpressionParser expressionParser(string(ParaEdit.at(i)->GetValue().mb_str())) ;

            if (  (InstructionMetadata.parameters[i].type == "string" && !expressionParser.ParseTextExpression(game, scene, callbacks))
                ||(InstructionMetadata.parameters[i].type == "file" && !expressionParser.ParseTextExpression(game, scene, callbacks))
                ||(InstructionMetadata.parameters[i].type == "color" && !expressionParser.ParseTextExpression(game, scene, callbacks))
                ||(InstructionMetadata.parameters[i].type == "joyaxis" && !expressionParser.ParseTextExpression(game, scene, callbacks))
                ||(InstructionMetadata.parameters[i].type == "layer" && !expressionParser.ParseTextExpression(game, scene, callbacks))
                ||(InstructionMetadata.parameters[i].type == "expression" && !expressionParser.ParseMathExpression(game, scene, callbacks)))
            {
                message = expressionParser.firstErrorStr;

                parametersHaveErrors = true;
                ParaEdit[i]->SetBackgroundColour(wxColour(255, 194, 191));
                break;
            }
            else
                ParaEdit[i]->SetBackgroundColour(wxColour(255, 255, 255));

            ParaEdit[i]->Update();
        }
    }

    if ( parametersHaveErrors )
    {
        if ( wxMessageBox(wxString::Format(_("Erreur dans le paramètre n°%i : %s\n\nÊtes vous sûr de vouloir valider ce paramètre ?"), parameterDisplayedNb, message.c_str()), _("Un paramètre contient une ou plusieurs erreurs."), wxYES_NO | wxICON_EXCLAMATION, this) == wxNO )
            return;
    }

    //On ajoute les paramètres
    Param.clear();
    for ( unsigned int i = 0;i < InstructionMetadata.parameters.size();i++ )
    {
        //Si un paramètre facultatif est desactivé
        if ( ParaFac.at(i)->IsShown() && !ParaFac.at(i)->GetValue())
        {
            Param.push_back(GDExpression(""));
        }
        else
            Param.push_back(GDExpression(string(ParaEdit.at(i)->GetValue().mb_str())));
    }

    if ( LocaliseCheck->GetValue() )
    {
        Loc = true;
    } else { Loc = false; }

    EndModal( 0 );
}

void ChoixAction::OnCancelBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void ChoixAction::OnAideBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::GetInstance();
    helpFileAccess->DisplaySection(29);
}

void ChoixAction::OnextSortCheckClick(wxCommandEvent& event)
{
    RefreshList();
}

void ChoixAction::OnobjSortCheckClick(wxCommandEvent& event)
{
    RefreshList();
}

void ChoixAction::OnmoreBtClick(wxCommandEvent& event)
{
    Extensions dialog(this, game);
    dialog.ShowModal();

    RefreshList();
}

void ChoixAction::OnObjetsListSelectionChanged(wxTreeEvent& event)
{
    if ( objectsListsNotebook->GetSelection() == 0 && ObjetsList->GetRootItem() != ObjetsList->GetFocusedItem() )
        selectedObject = ObjetsList->GetItemText( ObjetsList->GetFocusedItem() ).mb_str();
    else if ( objectsListsNotebook->GetSelection() == 1 && GroupesList->GetRootItem() != GroupesList->GetFocusedItem() )
        selectedObject = GroupesList->GetItemText( GroupesList->GetFocusedItem() ).mb_str();
    else if ( objectsListsNotebook->GetSelection() == 2 && globalObjectsList->GetRootItem() != globalObjectsList->GetFocusedItem() )
        selectedObject = globalObjectsList->GetItemText( globalObjectsList->GetFocusedItem() ).mb_str();
    else if ( objectsListsNotebook->GetSelection() == 3 && globalObjectGroups->GetRootItem() != globalObjectGroups->GetFocusedItem() )
        selectedObject = globalObjectGroups->GetItemText( globalObjectGroups->GetFocusedItem() ).mb_str();

    RefreshObjectActionsList();
}

void ChoixAction::OnobjectsSearchCtrlText(wxCommandEvent& event)
{
    RefreshObjectsLists();
    objectsSearchCtrl->SetFocus();
}

void ChoixAction::OnsearchCtrlText(wxCommandEvent& event)
{
    RefreshList();
    RefreshObjectActionsList();
    searchCtrl->SetFocus();
}
