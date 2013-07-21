/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/MetadataProvider.h"
#include "GDCore/IDE/ActionSentenceFormatter.h"
#include "GDCore/IDE/Dialogs/ObjectListDialogsHelper.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/IDE/ExpressionsCorrectnessTesting.h"
#include "GDCore/IDE/Dialogs/ProjectExtensionsDialog.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDCore/IDE/Dialogs/EditExpressionDialog.h"
#include "GDCore/IDE/Dialogs/EditStrExpressionDialog.h"
#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/IDE/Dialogs/ChooseAutomatismDialog.h"
#include "GDCore/IDE/Dialogs/ChooseLayerDialog.h"
#include "GDCore/CommonTools.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"
#include "ChoixClavier.h"
#include "SigneModification.h"
#include "GeneratePassword.h"
#include "ChoiceJoyAxis.h"
#include "ChoiceFile.h"

#ifdef __WXMSW__
#include <wx/msw/uxtheme.h>
#endif

using namespace gd;

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
const long ChoixAction::ID_STATICLINE2 = wxNewId();
const long ChoixAction::ID_BUTTON4 = wxNewId();
const long ChoixAction::ID_CHECKBOX2 = wxNewId();
const long ChoixAction::ID_STATICBITMAP2 = wxNewId();
const long ChoixAction::ID_HYPERLINKCTRL1 = wxNewId();
const long ChoixAction::ID_BUTTON1 = wxNewId();
const long ChoixAction::ID_BUTTON2 = wxNewId();
//*)
const long ChoixAction::ID_EDITARRAY = wxNewId();
const long ChoixAction::ID_TEXTARRAY = wxNewId();
const long ChoixAction::ID_BUTTONARRAY = wxNewId();
const long ChoixAction::ID_CHECKARRAY = wxNewId();

BEGIN_EVENT_TABLE(ChoixAction,wxDialog)
	//(*EventTable(ChoixAction)
	//*)
END_EVENT_TABLE()

ChoixAction::ChoixAction(wxWindow* parent, gd::Project & game_, gd::Layout & scene_) :
game(game_),
scene(scene_)
{
	//(*Initialize(ChoixAction)
	wxBoxSizer* BoxSizer4;
	wxBoxSizer* BoxSizer6;
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
	wxFlexGridSizer* FlexGridSizer1;
	wxBoxSizer* BoxSizer3;

	Create(parent, wxID_ANY, _("Edit the action"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("wxID_ANY"));
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
	ActionsTree = new wxTreeCtrl(Notebook1, ID_TREECTRL1, wxDefaultPosition, wxDefaultSize, wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL1"));
	ActionsTree->SetToolTip(_("Choose an action to set up."));
	Panel1 = new wxPanel(Notebook1, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	BoxSizer9 = new wxBoxSizer(wxVERTICAL);
	BoxSizer10 = new wxBoxSizer(wxVERTICAL);
	objectsListsNotebook = new wxNotebook(Panel1, ID_NOTEBOOK2, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK2"));
	ObjetsList = new wxTreeCtrl(objectsListsNotebook, ID_TREECTRL2, wxPoint(-71,-11), wxSize(179,170), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL2"));
	ObjetsList->SetToolTip(_("Choose an object in the list"));
	GroupesList = new wxTreeCtrl(objectsListsNotebook, ID_TREECTRL3, wxPoint(-71,-11), wxSize(179,170), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL3"));
	GroupesList->SetToolTip(_("Choose an object in the list"));
	globalObjectsList = new wxTreeCtrl(objectsListsNotebook, ID_TREECTRL4, wxPoint(-71,-11), wxSize(179,170), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL4"));
	globalObjectsList->SetToolTip(_("Choose an object in the list"));
	globalObjectGroups = new wxTreeCtrl(objectsListsNotebook, ID_TREECTRL5, wxPoint(-71,-11), wxSize(281,190), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL5"));
	globalObjectGroups->SetToolTip(_("Choose an object in the list"));
	objectsListsNotebook->AddPage(ObjetsList, _("Objects"), false);
	objectsListsNotebook->AddPage(GroupesList, _("Objects groups"), false);
	objectsListsNotebook->AddPage(globalObjectsList, _("Global objects"), false);
	objectsListsNotebook->AddPage(globalObjectGroups, _("Global groups"), false);
	BoxSizer10->Add(objectsListsNotebook, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	objectsSearchCtrl = new wxSearchCtrl(Panel1, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(10,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	BoxSizer10->Add(objectsSearchCtrl, 0, wxBOTTOM|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer9->Add(BoxSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	objectActionsTree = new wxTreeCtrl(Panel1, ID_TREECTRL6, wxDefaultPosition, wxDefaultSize, wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL6"));
	objectActionsTree->SetToolTip(_("Choose an action to set up."));
	BoxSizer9->Add(objectActionsTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel1->SetSizer(BoxSizer9);
	BoxSizer9->Fit(Panel1);
	BoxSizer9->SetSizeHints(Panel1);
	Notebook1->AddPage(ActionsTree, _("All actions"), false);
	Notebook1->AddPage(Panel1, _("By object"), false);
	FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	searchCtrl = new wxSearchCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	searchCtrl->SetMinSize(wxSize(-1,24));
	FlexGridSizer1->Add(searchCtrl, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer7->Add(FlexGridSizer1, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer8 = new wxBoxSizer(wxVERTICAL);
	FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
	ActionImg = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/unknown24.png")).Rescale(wxSize(24,24).GetWidth(),wxSize(24,24).GetHeight())), wxDefaultPosition, wxSize(24,24), wxNO_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer3->Add(ActionImg, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer4 = new wxBoxSizer(wxHORIZONTAL);
	NomActionTxt = new wxStaticText(this, ID_STATICTEXT1, _("No action chosen"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	wxFont NomActionTxtFont(16,wxSWISS,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	NomActionTxt->SetFont(NomActionTxtFont);
	BoxSizer4->Add(NomActionTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(BoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer8->Add(FlexGridSizer3, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer3 = new wxBoxSizer(wxHORIZONTAL);
	ActionTextTxt = new wxStaticText(this, ID_STATICTEXT2, _("Choose an action in left menu"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	ActionTextTxt->SetToolTip(_("See Help for more information about the condition."));
	BoxSizer3->Add(ActionTextTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer8->Add(BoxSizer3, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(480,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	BoxSizer1->Add(StaticLine1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 3);
	BoxSizer8->Add(BoxSizer1, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	GridSizer1->AddGrowableCol(1);
	BoxSizer8->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer7->Add(BoxSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer6->Add(BoxSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer2 = new wxBoxSizer(wxHORIZONTAL);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	BoxSizer2->Add(StaticLine2, 1, wxTOP|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	BoxSizer6->Add(BoxSizer2, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	moreBt = new wxButton(this, ID_BUTTON4, _("More actions"), wxDefaultPosition, wxSize(119,23), 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer6->Add(moreBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	objSortCheck = new wxCheckBox(this, ID_CHECKBOX2, _("Sort by objects"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	objSortCheck->SetValue(false);
	objSortCheck->Hide();
	FlexGridSizer6->Add(objSortCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/helpicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer5->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	HyperlinkCtrl1->SetToolTip(_("Display help about this window"));
	FlexGridSizer5->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer6, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer5 = new wxBoxSizer(wxHORIZONTAL);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	BoxSizer5->Add(OkBt, 1, wxALL|wxFIXED_MINSIZE|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	CancelBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	BoxSizer5->Add(CancelBt, 1, wxALL|wxFIXED_MINSIZE|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(BoxSizer5, 0, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer6->Add(FlexGridSizer2, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(BoxSizer6);
	SetSizer(BoxSizer6);
	Layout();
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
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ChoixAction::OnAideBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixAction::OnOkBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixAction::OnCancelBtClick);
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
    ActionsTree->AddRoot( _( "All actions" ),0);

    std::string search = boost::to_upper_copy(string(searchCtrl->GetValue().mb_str()));
    bool searching = search.empty() ? false : true;

    //Insert extension objects actions
    const vector < boost::shared_ptr<gd::PlatformExtension> > extensions = game.GetCurrentPlatform().GetAllPlatformExtensions();
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.GetUsedExtensions().begin(),
                  game.GetUsedExtensions().end(),
                  extensions[i]->GetName()) == game.GetUsedExtensions().end() )
            continue;

	    vector<string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
	    vector<string> automatismsTypes = extensions[i]->GetAutomatismsTypes();

        wxTreeItemId extensionItem = ActionsTree->GetRootItem();
        if ( !objectsTypes.empty() || !automatismsTypes.empty() )//Display the extension name only if it contains objects/automatisms
        {
            if ( extensions[i]->GetName() == "BuiltinObject" )
                extensionItem = ActionsTree->AppendItem(ActionsTree->GetRootItem(), _("All objects"), 0);
            else
                extensionItem = ActionsTree->AppendItem(ActionsTree->GetRootItem(), extensions[i]->GetFullName(), 0);
        }

	    for(unsigned int j = 0;j<objectsTypes.size();++j)
	    {
            wxTreeItemId objectTypeItem = objSortCheck->GetValue() ?
                                        ActionsTree->AppendItem(extensionItem,
                                                                wxString::Format(_("%s Object"), extensions[i]->GetObjectMetadata(objectsTypes[j]).GetFullName().c_str()),
                                                                0) :
                                        extensionItem;
            //Add each object actions
            std::map<string, gd::InstructionMetadata > allObjActions = extensions[i]->GetAllActionsForObject(objectsTypes[j]);
            for(std::map<string, gd::InstructionMetadata>::const_iterator it = allObjActions.begin(); it != allObjActions.end(); ++it)
            {
                //Verify if the action match the search
                if ( searching &&
                    boost::to_upper_copy(it->second.GetGroup()).find(search) == string::npos &&
                    boost::to_upper_copy(it->second.GetFullName()).find(search) == string::npos)
                    continue;

                if ( it->second.IsHidden() ) continue;

                //Search and/or add group item
                wxTreeItemIdValue cookie;
                wxTreeItemId groupItem = ActionsTree->GetFirstChild(objectTypeItem, cookie);
                while ( groupItem.IsOk() && ActionsTree->GetItemText(groupItem) != it->second.GetGroup() )
                {
                    groupItem = ActionsTree->GetNextSibling(groupItem);
                }
                if ( !groupItem.IsOk() )
                {
                    if ( !it->second.GetGroup().empty() )
                        groupItem = ActionsTree->AppendItem(objectTypeItem, it->second.GetGroup(), 0);
                    else
                        groupItem = objectTypeItem;
                }

                //Add action item
                int IDimage = 0;
                if ( it->second.GetSmallBitmapIcon().IsOk() )
                {
                    imageList->Add(it->second.GetSmallBitmapIcon());
                    IDimage = imageList->GetImageCount()-1;
                }

                gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(it->first);
                ActionsTree->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
            }
	    }

	    for(unsigned int j = 0;j<automatismsTypes.size();++j)
	    {
            wxTreeItemId automatismTypeItem = objSortCheck->GetValue() ?
                                        ActionsTree->AppendItem(extensionItem,
                                                                wxString::Format(_("%s Automatism"), extensions[i]->GetAutomatismMetadata(automatismsTypes[j]).GetFullName().c_str()),
                                                                0) :
                                        extensionItem;
            //Add each automatism actions
            std::map<string, gd::InstructionMetadata > allAutoActions = extensions[i]->GetAllActionsForAutomatism(automatismsTypes[j]);
            for(std::map<string, gd::InstructionMetadata>::const_iterator it = allAutoActions.begin(); it != allAutoActions.end(); ++it)
            {
                //Verify if the action match the search
                if ( searching
                    && boost::to_upper_copy(it->second.GetGroup()).find(search) == string::npos
                    && boost::to_upper_copy(it->second.GetFullName()).find(search) == string::npos)
                    continue;

                if ( it->second.IsHidden() ) continue;

                //Search and/or add group item
                wxTreeItemIdValue cookie;
                wxTreeItemId groupItem = ActionsTree->GetFirstChild(automatismTypeItem, cookie);
                while ( groupItem.IsOk() && ActionsTree->GetItemText(groupItem) != it->second.GetGroup() )
                {
                    groupItem = ActionsTree->GetNextSibling(groupItem);
                }
                if ( !groupItem.IsOk() )
                {
                    if ( !it->second.GetGroup().empty() )
                        groupItem = ActionsTree->AppendItem(automatismTypeItem, it->second.GetGroup(), 0);
                    else
                        groupItem = automatismTypeItem;
                }

                //Add action item
                int IDimage = 0;
                if ( it->second.GetSmallBitmapIcon().IsOk() )
                {
                    imageList->Add(it->second.GetSmallBitmapIcon());
                    IDimage = imageList->GetImageCount()-1;
                }

                gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(it->first);
                ActionsTree->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
            }
	    }

        //Add each (free) actions
        std::map<string, gd::InstructionMetadata > allActions = extensions[i]->GetAllActions();
        for(std::map<string, gd::InstructionMetadata>::const_iterator it = allActions.begin(); it != allActions.end(); ++it)
        {
            //Verify if the action match the search
            if ( searching &&
                boost::to_upper_copy(it->second.GetGroup()).find(search) == string::npos &&
                boost::to_upper_copy(it->second.GetFullName()).find(search) == string::npos)
                continue;

            if ( it->second.IsHidden() ) continue;

            //Search and/or add group item
            wxTreeItemIdValue cookie;
            wxTreeItemId groupItem = ActionsTree->GetFirstChild(extensionItem, cookie);
            while ( groupItem.IsOk() && ActionsTree->GetItemText(groupItem) != it->second.GetGroup() )
            {
                groupItem = ActionsTree->GetNextSibling(groupItem);
            }
            if ( !groupItem.IsOk() )
            {
                if ( !it->second.GetGroup().empty() )
                    groupItem = ActionsTree->AppendItem(extensionItem, it->second.GetGroup(), 0);
                else
                    groupItem = extensionItem;
            }

            //Add action item
            int IDimage = 0;
            if ( it->second.GetSmallBitmapIcon().IsOk() )
            {
                imageList->Add(it->second.GetSmallBitmapIcon());
                IDimage = imageList->GetImageCount()-1;
            }

            gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(it->first);
            ActionsTree->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
        }

        if ( !ActionsTree->HasChildren(extensionItem) ) ActionsTree->Delete(extensionItem);
	}

	if ( searching ) ActionsTree->ExpandAll();
}

void ChoixAction::RefreshObjectsLists()
{
    gd::ObjectListDialogsHelper objectListsHelper(game, scene);
    objectListsHelper.SetSearchText(ToString(objectsSearchCtrl->GetValue()));
    objectListsHelper.SetAllowedObjectType("");
    objectListsHelper.RefreshLists(ObjetsList, GroupesList, globalObjectsList, globalObjectGroups);
}

void ChoixAction::RefreshObjectActionsList()
{
    objectActionsTree->DeleteAllItems();
    objectActionsTree->AddRoot( _( "All actions" ),0);

    std::string search = boost::to_upper_copy(string(searchCtrl->GetValue().mb_str()));
    bool searching = search.empty() ? false : true;

    std::string selectedObjectType = gd::GetTypeOfObject(game, scene, selectedObject);

    //Insert extension objects actions
    const vector < boost::shared_ptr<gd::PlatformExtension> > extensions = game.GetCurrentPlatform().GetAllPlatformExtensions();
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.GetUsedExtensions().begin(),
                  game.GetUsedExtensions().end(),
                  extensions[i]->GetName()) == game.GetUsedExtensions().end() )
            continue;

        wxTreeItemId extensionItem = objectActionsTree->GetRootItem();
        std::string objectType = selectedObjectType;
        if ( extensions[i]->GetName() == "BuiltinObject" )
        {
            objectType = "";
            extensionItem = objectActionsTree->AppendItem(objectActionsTree->GetRootItem(), _("All objects"), 0);
        }
        else
            extensionItem = objectActionsTree->AppendItem(objectActionsTree->GetRootItem(), extensions[i]->GetFullName(), 0);

        wxTreeItemId objectTypeItem = objSortCheck->GetValue() ?
                                    objectActionsTree->AppendItem(extensionItem,
                                                            wxString::Format(_("%s Object"), extensions[i]->GetObjectMetadata(objectType).GetFullName().c_str()),
                                                            0) :
                                    extensionItem;

        //Add each object actions
        std::map<string, gd::InstructionMetadata > allObjActions = extensions[i]->GetAllActionsForObject(objectType);
        for(std::map<string, gd::InstructionMetadata>::const_iterator it = allObjActions.begin(); it != allObjActions.end(); ++it)
        {
            //Verify if the action match the search
            if ( searching &&
                boost::to_upper_copy(it->second.GetGroup()).find(search) == string::npos &&
                boost::to_upper_copy(it->second.GetFullName()).find(search) == string::npos)
                continue;

            if ( it->second.IsHidden() ) continue;

            //Search and/or add group item
            wxTreeItemIdValue cookie;
            wxTreeItemId groupItem = objectActionsTree->GetFirstChild(objectTypeItem, cookie);
            while ( groupItem.IsOk() && objectActionsTree->GetItemText(groupItem) != it->second.GetGroup() )
            {
                groupItem = objectActionsTree->GetNextSibling(groupItem);
            }
            if ( !groupItem.IsOk() )
            {
                if ( !it->second.GetGroup().empty() )
                    groupItem = objectActionsTree->AppendItem(objectTypeItem, it->second.GetGroup(), 0);
                else
                    groupItem = objectTypeItem;
            }

            //Add action item, if it is not hidden
            int IDimage = 0;
            if ( it->second.GetSmallBitmapIcon().IsOk() )
            {
                imageList->Add(it->second.GetSmallBitmapIcon());
                IDimage = imageList->GetImageCount()-1;
            }

            gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(it->first);
            objectActionsTree->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
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
                                                                wxString::Format(_("%s Automatism"), extensions[i]->GetAutomatismMetadata(automatismType).GetFullName().c_str()),
                                                                0) :
                                        extensionItem;
            //Add each automatism actions
            std::map<string, gd::InstructionMetadata > allAutoActions = extensions[i]->GetAllActionsForAutomatism(automatismType);
            for(std::map<string, gd::InstructionMetadata>::const_iterator it = allAutoActions.begin(); it != allAutoActions.end(); ++it)
            {
                //Verify if the action match the search
                if ( searching &&
                    boost::to_upper_copy(it->second.GetGroup()).find(search) == string::npos &&
                    boost::to_upper_copy(it->second.GetFullName()).find(search) == string::npos)
                    continue;

                if ( it->second.IsHidden() ) continue;

                //Search and/or add group item
                wxTreeItemIdValue cookie;
                wxTreeItemId groupItem = objectActionsTree->GetFirstChild(automatismTypeItem, cookie);
                while ( groupItem.IsOk() && objectActionsTree->GetItemText(groupItem) != it->second.GetGroup() )
                {
                    groupItem = objectActionsTree->GetNextSibling(groupItem);
                }
                if ( !groupItem.IsOk() )
                {
                    if ( !it->second.GetGroup().empty() )
                        groupItem = objectActionsTree->AppendItem(automatismTypeItem, it->second.GetGroup(), 0);
                    else
                        groupItem = automatismTypeItem;
                }

                //Add action item
                int IDimage = 0;
                if ( it->second.GetSmallBitmapIcon().IsOk() )
                {
                    imageList->Add(it->second.GetSmallBitmapIcon());
                    IDimage = imageList->GetImageCount()-1;
                }

                gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(it->first);
                objectActionsTree->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
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
    gd::TreeItemStringData * associatedData = dynamic_cast<gd::TreeItemStringData*>(ActionsTree->GetItemData(event.GetItem()));
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
    gd::TreeItemStringData * associatedData = dynamic_cast<gd::TreeItemStringData*>(objectActionsTree->GetItemData(event.GetItem()));
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

    const gd::InstructionMetadata & instructionMetadata = gd::MetadataProvider::GetActionMetadata(game.GetCurrentPlatform(), Type);

    //Display action main properties
    NomActionTxt->SetLabel( instructionMetadata.GetFullName() );
    NomActionTxt->Wrap( 450 );
    ActionTextTxt->SetLabel( instructionMetadata.GetDescription() );
    ActionTextTxt->Wrap( 450 );
    if ( instructionMetadata.GetBitmapIcon().IsOk() ) ActionImg->SetBitmap( instructionMetadata.GetBitmapIcon() );
    else ActionImg->SetBitmap(gd::CommonBitmapManager::GetInstance()->unknown24);

    //Update controls count
    while ( ParaEdit.size() < instructionMetadata.parameters.size() )
    {
        const string num =ToString( ParaEdit.size() );
        long id = wxNewId(); //Bitmap buttons want an unique id so as to be displayed properly

        //Addings controls
        ParaFac.push_back(new wxCheckBox( this, ID_CHECKARRAY, "", wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, num ));
        ParaText.push_back(new wxStaticText( this, ID_TEXTARRAY, _( "Parameter :" ), wxDefaultPosition, wxDefaultSize, 0, _T( "TxtPara" + num ) ));
        ParaSpacer1.push_back( new wxPanel(this) );
        ParaSpacer2.push_back( new wxPanel(this) );
        ParaEdit.push_back( new wxTextCtrl( this, ID_EDITARRAY, "", wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T( "EditPara" + num ) ));
        ParaBmpBt.push_back( new wxBitmapButton( this, id, gd::CommonBitmapManager::GetInstance()->expressionBt, wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, num ));

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
    while ( ParaEdit.size() > instructionMetadata.parameters.size() )
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
    for ( unsigned int i = 0;i < instructionMetadata.parameters.size();i++ )
    {
        if (instructionMetadata.parameters[i].codeOnly)
        {
            ParaFac.at(i)->Show(false);
            ParaText.at(i)->Show(false);
            ParaBmpBt.at(i)->Show(false);
            ParaEdit.at(i)->Show(false);
        }
        else
        {
            ParaFac.at(i)->Show(instructionMetadata.parameters[i].optional);
            ParaFac.at(i)->SetValue(!ParaEdit.at( i )->GetValue().empty());

            ParaText.at(i)->SetLabel( instructionMetadata.parameters[i].description + _(":") );
            ParaText.at(i)->Show();

            if ( i < Param.size() ) ParaEdit.at( i )->SetValue(Param[i].GetPlainString());
            ParaEdit.at(i)->Show();

            ParaBmpBt.at(i)->SetBitmapLabel( gd::ActionSentenceFormatter::GetInstance()->BitmapFromType(instructionMetadata.parameters[i].type) );
            ParaBmpBt.at(i)->SetToolTip( gd::ActionSentenceFormatter::GetInstance()->LabelFromType(instructionMetadata.parameters[i].type) );
            ParaBmpBt.at(i)->Show( !instructionMetadata.parameters[i].type.empty() );

            //De/activate widgets if parameter is optional
            if ( instructionMetadata.parameters[i].optional && !ParaFac.at(i)->GetValue() && ParaEdit.at(i)->GetValue().empty() )
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
            if ( !instructionMetadata.parameters[i].optional && (i >= Param.size() || Param[i].GetPlainString().empty())  )
            {
                if ( instructionMetadata.parameters[i].type == "expression" ) ParaEdit.at( i )->SetValue("0");
                else if ( instructionMetadata.parameters[i].type == "string" ) ParaEdit.at( i )->SetValue("\"\"");
                else if ( instructionMetadata.parameters[i].type == "operator" ) ParaEdit.at( i )->SetValue("=");
            }

        }
    }
    Layout();
    GridSizer1->Layout();

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

    const gd::InstructionMetadata & instructionMetadata = gd::MetadataProvider::GetActionMetadata(game.GetCurrentPlatform(), Type);

    if ( i < ParaEdit.size() && i < instructionMetadata.parameters.size())
    {
        if ( gd::ParameterMetadata::IsObject(instructionMetadata.parameters[i].type) )
        {
            gd::ChooseObjectDialog dialog(this, game, scene, true, instructionMetadata.parameters[i].supplementaryInformation);
            if ( dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(dialog.GetChosenObject());
            }
            return;
        }
        else if ( instructionMetadata.parameters[i].type == "automatism" )
        {
            std::string object = ParaEdit.empty() ? "" : ParaEdit[0]->GetValue().mb_str();
            gd::ChooseAutomatismDialog dialog(this, game, scene, object, instructionMetadata.parameters[i].supplementaryInformation);
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.GetChosenAutomatism());

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "expression" )
        {
            gd::EditExpressionDialog dialog(this, ToString( ParaEdit.at(i)->GetValue() ), game, scene);
            if ( dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(dialog.GetExpression());
            }
            return;
        }
        else if ( instructionMetadata.parameters[i].type == "string" )
        {
            gd::EditStrExpressionDialog dialog(this, ToString( ParaEdit.at(i)->GetValue() ), game, scene);
            if ( dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(dialog.GetExpression());
            }
            return;
        }
        else if ( instructionMetadata.parameters[i].type == "color" )
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
        else if ( instructionMetadata.parameters[i].type == "police" )
        {
            wxString gameDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();
            wxFileDialog dialog(this, _("Choose a font ( ttf/ttc files )"), gameDirectory, "", "Polices (*.ttf, *.ttc)|*.ttf;*.ttc");
            dialog.ShowModal();

            if ( dialog.GetPath() != "" ) //Note that path is relative to the project file:
            {
                wxFileName filename(dialog.GetPath()); filename.MakeRelativeTo(gameDirectory);
                ParaEdit[i]->ChangeValue(filename.GetFullPath());
            }

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "musicfile" )
        {
            wxString gameDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();
            wxFileDialog dialog(this, _("Choose a music ( ogg files )"), gameDirectory, "", "Fichiers audio (*.ogg)|*.ogg");
            dialog.ShowModal();

            if ( dialog.GetPath() != "" ) //Note that path is relative to the project file:
            {
                wxFileName filename(dialog.GetPath()); filename.MakeRelativeTo(gameDirectory);
                ParaEdit[i]->ChangeValue(filename.GetFullPath());
            }

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "soundfile" )
        {
            wxString gameDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();
            wxFileDialog dialog(this, _("Choose a sound ( wav file )"), gameDirectory, "", "Fichiers audio (*.wav)|*.wav");
            dialog.ShowModal();

            if ( dialog.GetPath() != "" ) //Note that path is relative to the project file:
            {
                wxFileName filename(dialog.GetPath()); filename.MakeRelativeTo(gameDirectory);
                ParaEdit[i]->ChangeValue(filename.GetFullPath());
            }

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "operator" )
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
        else if ( instructionMetadata.parameters[i].type == "password" )
        {
            GeneratePassword dialog(this);

            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.mdp);

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "yesorno" )
        {
            if (wxMessageBox("Choisissez Oui ou Non pour compléter ce paramètre :", "Oui ou non",wxYES_NO ) == wxYES)
            {
                ParaEdit.at(i)->ChangeValue(_("yes"));
            }
            else
            {
                ParaEdit.at(i)->ChangeValue(_("no"));
            }

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "layer" )
        {
            gd::ChooseLayerDialog dialog(this, scene);
            if( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.GetChosenLayer());

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "joyaxis" )
        {
            ChoiceJoyAxis dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ), game, scene);
            if( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.joyaxis);

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "file" )
        {
            ChoiceFile dialog(this, ToString( ParaEdit.at(i)->GetValue() ), game, scene);

            if ( dialog.ShowModal() == 1 )
                ParaEdit[i]->ChangeValue(dialog.file);

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "objectvar" )
        {
            if ( ParaEdit.empty() ) return;

            std::string objectWanted = ToString(ParaEdit[0]->GetValue());
            std::vector<ObjSPtr>::iterator sceneObject = std::find_if(scene.GetObjects().begin(), scene.GetObjects().end(), std::bind2nd(ObjectHasName(), objectWanted));
            std::vector<ObjSPtr>::iterator globalObject = std::find_if(game.GetObjects().begin(), game.GetObjects().end(), std::bind2nd(ObjectHasName(), objectWanted));

            ObjSPtr object = boost::shared_ptr<gd::Object> ();

            if ( sceneObject != scene.GetObjects().end() ) //We check first scene's objects' list.
                object = *sceneObject;
            else if ( globalObject != game.GetObjects().end() ) //Then the global object list
                object = *globalObject;
            else
                return;

            gd::ChooseVariableDialog dialog(this, object->GetVariables());
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.selectedVariable);

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "scenevar" )
        {
            gd::ChooseVariableDialog dialog(this, scene.GetVariables());
            dialog.SetAssociatedLayout(&game, &scene);
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.selectedVariable);

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "globalvar" )
        {
            gd::ChooseVariableDialog dialog(this, game.GetVariables());
            dialog.SetAssociatedProject(&game);
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.selectedVariable);

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
    const gd::InstructionMetadata & instructionMetadata = gd::MetadataProvider::GetActionMetadata(game.GetCurrentPlatform(), Type);

    if ( Type == "" )
        return;

    if (ParaEdit.size() < instructionMetadata.parameters.size())
    {
        wxLogWarning(_("The action has to many parameters. This can be a bug of Game Develop.\nRead Help to know how report a bug."));
        return;
    }

    //Check for validity of parameters
    bool parametersHaveErrors = false;
    string message;
    size_t parameterDisplayedNb = 0;
    for ( unsigned int i = 0;i < instructionMetadata.parameters.size();i++ )
    {
        if (!instructionMetadata.parameters[i].codeOnly ) parameterDisplayedNb++;

        //Do not check optional parameters which are desactivated
        if ( !ParaFac.at(i)->IsShown() || (ParaFac.at(i)->IsShown() && ParaFac.at(i)->GetValue()))
        {
            gd::CallbacksForExpressionCorrectnessTesting callbacks(game, scene);
            gd::ExpressionParser expressionParser(string(ParaEdit.at(i)->GetValue().mb_str())) ;

            if (  (instructionMetadata.parameters[i].type == "string" && !expressionParser.ParseStringExpression(game.GetCurrentPlatform(), game, scene, callbacks))
                ||(instructionMetadata.parameters[i].type == "file" && !expressionParser.ParseStringExpression(game.GetCurrentPlatform(), game, scene, callbacks))
                ||(instructionMetadata.parameters[i].type == "color" && !expressionParser.ParseStringExpression(game.GetCurrentPlatform(), game, scene, callbacks))
                ||(instructionMetadata.parameters[i].type == "joyaxis" && !expressionParser.ParseStringExpression(game.GetCurrentPlatform(), game, scene, callbacks))
                ||(instructionMetadata.parameters[i].type == "layer" && !expressionParser.ParseStringExpression(game.GetCurrentPlatform(), game, scene, callbacks))
                ||(instructionMetadata.parameters[i].type == "expression" && !expressionParser.ParseMathExpression(game.GetCurrentPlatform(), game, scene, callbacks)))
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
        if ( wxMessageBox(wxString::Format(_("Error in parameter #%i : %s\n\nPlease correct it in order to validate the action."), parameterDisplayedNb, message.c_str()), _("The expression contains one or more errors."), wxYES_NO | wxICON_EXCLAMATION, this) == wxNO )
            return;
    }

    //On ajoute les paramètres
    Param.clear();
    for ( unsigned int i = 0;i < instructionMetadata.parameters.size();i++ )
    {
        //Si un paramètre facultatif est desactivé
        if ( ParaFac.at(i)->IsShown() && !ParaFac.at(i)->GetValue())
        {
            Param.push_back(gd::Expression(""));
        }
        else
            Param.push_back(gd::Expression(string(ParaEdit.at(i)->GetValue().mb_str())));
    }

    EndModal( 0 );
}

void ChoixAction::OnCancelBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void ChoixAction::OnAideBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/events_editor/action"));
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
    gd::ProjectExtensionsDialog dialog(this, game);
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
}

void ChoixAction::OnsearchCtrlText(wxCommandEvent& event)
{
    RefreshList();
    RefreshObjectActionsList();
}

