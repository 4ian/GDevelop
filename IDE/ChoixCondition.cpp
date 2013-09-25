/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ChoixCondition.h"

//(*InternalHeaders(ChoixCondition)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <string>
#include <vector>
#include <wx/image.h>
#include <wx/icon.h>
#include <wx/bitmap.h>
#include <wx/filedlg.h>
#include <wx/config.h>
#include <wx/log.h>
#include <wx/msgdlg.h>
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/CommonTools.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/ConditionSentenceFormatter.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/IDE/Dialogs/ChooseAutomatismDialog.h"
#include "GDCore/IDE/Dialogs/ObjectListDialogsHelper.h"
#include "GDCore/IDE/ExpressionsCorrectnessTesting.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/IDE/Dialogs/ChooseLayerDialog.h"
#include "GDCore/IDE/Dialogs/EditExpressionDialog.h"
#include "GDCore/IDE/Dialogs/EditStrExpressionDialog.h"
#include "GDCore/IDE/MetadataProvider.h"
#include "TrueOrFalse.h"
#include "ChoiceJoyAxis.h"
#include "ChoiceFile.h"
#include "GDCore/IDE/Dialogs/ProjectExtensionsDialog.h"
#include "SigneTest.h"
#include "ChoixBouton.h"
#include "ChoixClavier.h"

#include <wx/help.h>
#include <boost/algorithm/string.hpp>

#ifdef __WXMSW__
#include <wx/msw/uxtheme.h>
#endif

using namespace std;
using namespace gd;

//(*IdInit(ChoixCondition)
const long ChoixCondition::ID_TREECTRL1 = wxNewId();
const long ChoixCondition::ID_TREECTRL2 = wxNewId();
const long ChoixCondition::ID_TREECTRL3 = wxNewId();
const long ChoixCondition::ID_TREECTRL4 = wxNewId();
const long ChoixCondition::ID_TREECTRL5 = wxNewId();
const long ChoixCondition::ID_NOTEBOOK2 = wxNewId();
const long ChoixCondition::ID_TEXTCTRL2 = wxNewId();
const long ChoixCondition::ID_TREECTRL6 = wxNewId();
const long ChoixCondition::ID_PANEL1 = wxNewId();
const long ChoixCondition::ID_NOTEBOOK1 = wxNewId();
const long ChoixCondition::ID_TEXTCTRL1 = wxNewId();
const long ChoixCondition::ID_STATICBITMAP1 = wxNewId();
const long ChoixCondition::ID_STATICTEXT1 = wxNewId();
const long ChoixCondition::ID_STATICTEXT2 = wxNewId();
const long ChoixCondition::ID_STATICLINE1 = wxNewId();
const long ChoixCondition::ID_CHECKBOX1 = wxNewId();
const long ChoixCondition::ID_STATICLINE2 = wxNewId();
const long ChoixCondition::ID_BUTTON4 = wxNewId();
const long ChoixCondition::ID_CHECKBOX3 = wxNewId();
const long ChoixCondition::ID_STATICBITMAP2 = wxNewId();
const long ChoixCondition::ID_HYPERLINKCTRL1 = wxNewId();
const long ChoixCondition::ID_BUTTON1 = wxNewId();
const long ChoixCondition::ID_BUTTON2 = wxNewId();
//*)
const long ChoixCondition::ID_EDITARRAY = wxNewId();
const long ChoixCondition::ID_TEXTARRAY = wxNewId();
const long ChoixCondition::ID_BUTTONARRAY = wxNewId();
const long ChoixCondition::ID_CHECKARRAY = wxNewId();

BEGIN_EVENT_TABLE( ChoixCondition, wxDialog )
    //(*EventTable(ChoixCondition)
    //*)
END_EVENT_TABLE()

ChoixCondition::ChoixCondition( wxWindow* parent, gd::Project & game_, gd::Layout & scene_) :
game(game_),
scene(scene_),
conditionInverted(false)
{
    //(*Initialize(ChoixCondition)
    wxBoxSizer* BoxSizer4;
    wxStaticBoxSizer* StaticBoxSizer2;
    wxBoxSizer* BoxSizer6;
    wxFlexGridSizer* FlexGridSizer4;
    wxBoxSizer* BoxSizer5;
    wxBoxSizer* BoxSizer10;
    wxBoxSizer* BoxSizer7;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer2;
    wxBoxSizer* BoxSizer2;
    wxBoxSizer* BoxSizer11;
    wxFlexGridSizer* FlexGridSizer7;
    wxBoxSizer* BoxSizer1;
    wxFlexGridSizer* FlexGridSizer1;
    wxBoxSizer* BoxSizer3;

    Create(parent, wxID_ANY, _("Edit the condition"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("wxID_ANY"));
    wxIcon FrameIcon;
    FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/conditionicon.png"))));
    SetIcon(FrameIcon);
    BoxSizer6 = new wxBoxSizer(wxVERTICAL);
    BoxSizer7 = new wxBoxSizer(wxHORIZONTAL);
    FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer4->AddGrowableCol(0);
    FlexGridSizer4->AddGrowableRow(0);
    Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
    Notebook1->SetMinSize(wxSize(270,-1));
    ConditionsTree = new wxTreeCtrl(Notebook1, ID_TREECTRL1, wxDefaultPosition, wxDefaultSize, wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL1"));
    ConditionsTree->SetToolTip(_("Choose an condition to set up."));
    Panel1 = new wxPanel(Notebook1, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    BoxSizer10 = new wxBoxSizer(wxVERTICAL);
    BoxSizer11 = new wxBoxSizer(wxVERTICAL);
    objectsListsNotebook = new wxNotebook(Panel1, ID_NOTEBOOK2, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK2"));
    ObjetsList = new wxTreeCtrl(objectsListsNotebook, ID_TREECTRL2, wxPoint(-71,-11), wxDefaultSize, wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL2"));
    ObjetsList->SetToolTip(_("Choose an object in the list"));
    GroupesList = new wxTreeCtrl(objectsListsNotebook, ID_TREECTRL3, wxPoint(-71,-11), wxDefaultSize, wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL3"));
    GroupesList->SetToolTip(_("Choose an object in the list"));
    globalObjectsList = new wxTreeCtrl(objectsListsNotebook, ID_TREECTRL4, wxPoint(-71,-11), wxDefaultSize, wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL4"));
    globalObjectsList->SetToolTip(_("Choose an object in the list"));
    globalObjectGroups = new wxTreeCtrl(objectsListsNotebook, ID_TREECTRL5, wxPoint(-71,-11), wxDefaultSize, wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL5"));
    globalObjectGroups->SetToolTip(_("Choose an object in the list"));
    objectsListsNotebook->AddPage(ObjetsList, _("Objects"), false);
    objectsListsNotebook->AddPage(GroupesList, _("Objects groups"), false);
    objectsListsNotebook->AddPage(globalObjectsList, _("Global objects"), false);
    objectsListsNotebook->AddPage(globalObjectGroups, _("Global groups"), false);
    BoxSizer11->Add(objectsListsNotebook, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    objectsSearchCtrl = new wxSearchCtrl(Panel1, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(10,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
    BoxSizer11->Add(objectsSearchCtrl, 0, wxBOTTOM|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer10->Add(BoxSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    objectConditionsTree = new wxTreeCtrl(Panel1, ID_TREECTRL6, wxDefaultPosition, wxDefaultSize, wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL6"));
    objectConditionsTree->SetToolTip(_("Choose an action to set up."));
    BoxSizer10->Add(objectConditionsTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Panel1->SetSizer(BoxSizer10);
    BoxSizer10->Fit(Panel1);
    BoxSizer10->SetSizeHints(Panel1);
    Notebook1->AddPage(ConditionsTree, _("All conditions"), false);
    Notebook1->AddPage(Panel1, _("By object"), false);
    FlexGridSizer4->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    searchCtrl = new wxSearchCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    FlexGridSizer4->Add(searchCtrl, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer7->Add(FlexGridSizer4, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    conditionSizer = new wxBoxSizer(wxVERTICAL);
    FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer3->AddGrowableCol(2);
    FlexGridSizer3->AddGrowableRow(0);
    ConditionImg = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/unknownCondition24.png")).Rescale(wxSize(24,24).GetWidth(),wxSize(24,24).GetHeight())), wxDefaultPosition, wxSize(24,24), wxNO_BORDER, _T("ID_STATICBITMAP1"));
    FlexGridSizer3->Add(ConditionImg, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer4 = new wxBoxSizer(wxHORIZONTAL);
    NomConditionTxt = new wxStaticText(this, ID_STATICTEXT1, _("No condition chosen"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    wxFont NomConditionTxtFont(16,wxSWISS,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    NomConditionTxt->SetFont(NomConditionTxtFont);
    BoxSizer4->Add(NomConditionTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer3->Add(BoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    conditionSizer->Add(FlexGridSizer3, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer3 = new wxBoxSizer(wxHORIZONTAL);
    ConditionTextTxt = new wxStaticText(this, ID_STATICTEXT2, _("Choose a condition in left menu"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    ConditionTextTxt->SetToolTip(_("See Help for more information about the condition."));
    BoxSizer3->Add(ConditionTextTxt, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    conditionSizer->Add(BoxSizer3, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(480,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    BoxSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 3);
    conditionSizer->Add(BoxSizer1, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    GridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
    GridSizer1->AddGrowableCol(1);
    conditionSizer->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Inversion"));
    FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer7->AddGrowableCol(1);
    FlexGridSizer7->AddGrowableRow(0);
    ContraireCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Invert the condition"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
    ContraireCheck->SetValue(false);
    ContraireCheck->SetToolTip(_("Check so as to that the condition verify the reverse of what it should do."));
    FlexGridSizer7->Add(ContraireCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer2->Add(FlexGridSizer7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    conditionSizer->Add(StaticBoxSizer2, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer7->Add(conditionSizer, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer6->Add(BoxSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer2 = new wxBoxSizer(wxHORIZONTAL);
    StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    BoxSizer2->Add(StaticLine2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer6->Add(BoxSizer2, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer2 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
    moreBt = new wxButton(this, ID_BUTTON4, _("More conditions"), wxDefaultPosition, wxSize(140,23), 0, wxDefaultValidator, _T("ID_BUTTON4"));
    FlexGridSizer1->Add(moreBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    objSortCheck = new wxCheckBox(this, ID_CHECKBOX3, _("Sort by objects"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
    objSortCheck->SetValue(false);
    objSortCheck->Hide();
    FlexGridSizer1->Add(objSortCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer5->AddGrowableRow(0);
    StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/helpicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
    FlexGridSizer5->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
    HyperlinkCtrl1->SetToolTip(_("Display help about this window"));
    FlexGridSizer5->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer2->Add(FlexGridSizer1, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer5 = new wxBoxSizer(wxHORIZONTAL);
    OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    BoxSizer5->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    CancelBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    BoxSizer5->Add(CancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer2->Add(BoxSizer5, 0, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer6->Add(FlexGridSizer2, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(BoxSizer6);
    BoxSizer6->Fit(this);
    BoxSizer6->SetSizeHints(this);
    Center();

    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ChoixCondition::OnConditionsTreeItemActivated);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixCondition::OnConditionsTreeSelectionChanged);
    Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixCondition::OnObjetsListSelectionChanged);
    Connect(ID_TREECTRL3,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixCondition::OnObjetsListSelectionChanged);
    Connect(ID_TREECTRL4,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixCondition::OnObjetsListSelectionChanged);
    Connect(ID_TREECTRL5,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixCondition::OnObjetsListSelectionChanged);
    Connect(ID_TEXTCTRL2,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ChoixCondition::OnobjectsSearchCtrlText);
    Connect(ID_TREECTRL6,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ChoixCondition::OnobjectConditionsTreeItemActivated);
    Connect(ID_TREECTRL6,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixCondition::OnobjectConditionsTreeSelectionChanged);
    Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ChoixCondition::OnsearchCtrlText);
    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnmoreBtClick);
    Connect(ID_CHECKBOX3,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnobjSortCheckClick);
    Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ChoixCondition::OnAideBtClick);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnOkBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnCancelBtClick);
    //*)

    #if defined(__WXMSW__) //Offer nice look to list
    wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
    if(theme) theme->SetWindowTheme((HWND) ConditionsTree->GetHWND(), L"EXPLORER", NULL);
    if(theme) theme->SetWindowTheme((HWND) ObjetsList->GetHWND(), L"EXPLORER", NULL);
    if(theme) theme->SetWindowTheme((HWND) GroupesList->GetHWND(), L"EXPLORER", NULL);
    if(theme) theme->SetWindowTheme((HWND) globalObjectsList->GetHWND(), L"EXPLORER", NULL);
    if(theme) theme->SetWindowTheme((HWND) globalObjectGroups->GetHWND(), L"EXPLORER", NULL);
    if(theme) theme->SetWindowTheme((HWND) objectConditionsTree->GetHWND(), L"EXPLORER", NULL);
    #endif

    moreBt->SetBitmap(wxBitmap("res/extensiononly16.png", wxBITMAP_TYPE_ANY));
    imageList = new wxImageList( 16, 16 );
    imageList->Add(( wxBitmap( "res/conditions/unecond.png", wxBITMAP_TYPE_ANY ) ) );
    ConditionsTree->AssignImageList( imageList );
    objectConditionsTree->SetImageList( imageList );

    searchCtrl->SetFocus();

    RefreshAllLists();
    Center();
    SetSize(wxDefaultCoord, 600);
}

ChoixCondition::~ChoixCondition()
{
    //(*Destroy(ChoixCondition)
    //*)
}

void ChoixCondition::RefreshAllLists()
{
    RefreshObjectsLists();
    RefreshObjectConditionsList();
    RefreshList();
}

wxTreeItemId ChoixCondition::GetGroupItem(wxTreeCtrl * treeCtrl, wxTreeItemId parent, std::string groupStr)
{
    std::vector<std::string> groups = SplitString<string>(groupStr, '/');

    for(unsigned int i = 0;i<groups.size();++i)
    {
        if ( groups[i].empty() ) continue;

        wxTreeItemIdValue cookie;
        wxTreeItemId groupItem = treeCtrl->GetFirstChild(parent, cookie);
        size_t latestGroupPos = 0;
        while ( groupItem.IsOk() && treeCtrl->GetItemText(groupItem) != groups[i] )
        {
            if ( treeCtrl->HasChildren(groupItem) ) latestGroupPos++;
            groupItem = treeCtrl->GetNextSibling(groupItem);
        }
        if ( !groupItem.IsOk() )
            groupItem = treeCtrl->InsertItem(parent, latestGroupPos, groups[i], 0);

        parent = groupItem;
    }

    return parent;
}

/**
 * Create the list of conditions
 */
void ChoixCondition::RefreshList()
{
    ConditionsTree->DeleteAllItems();
    ConditionsTree->AddRoot( _( "All conditions" ), 0 );

    std::string search = boost::to_upper_copy(string(searchCtrl->GetValue().mb_str()));
    bool searching = search.empty() ? false : true;

    //Insert extension objects conditions
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


        wxTreeItemId extensionItem = ConditionsTree->GetRootItem();
        if ( !objectsTypes.empty() || !automatismsTypes.empty() )//Display the extension name only if it contains objects
        {
            if ( extensions[i]->GetName() == "BuiltinObject" )
                extensionItem = ConditionsTree->AppendItem(ConditionsTree->GetRootItem(), _("All objects"), 0);
            else
                extensionItem = ConditionsTree->AppendItem(ConditionsTree->GetRootItem(), extensions[i]->GetFullName(), 0);
        }

	    for(unsigned int j = 0;j<objectsTypes.size();++j)
	    {

            wxTreeItemId objectTypeItem = objSortCheck->GetValue() ?
                                        ConditionsTree->AppendItem(extensionItem,
                                                                wxString::Format(_("%s Object"), extensions[i]->GetObjectMetadata(objectsTypes[j]).GetFullName().c_str()),
                                                                0) :
                                        extensionItem;
            //Add each object conditions
            std::map<string, gd::InstructionMetadata > allConditions = extensions[i]->GetAllConditionsForObject(objectsTypes[j]);
            for(std::map<string, gd::InstructionMetadata>::const_iterator it = allConditions.begin(); it != allConditions.end(); ++it)
            {
                //Verify if the condition match the search
                if ( searching &&
                    boost::to_upper_copy(it->second.GetGroup()).find(search) == string::npos &&
                    boost::to_upper_copy(it->second.GetFullName()).find(search) == string::npos)
                    continue;

                if ( it->second.IsHidden() ) continue;

                //Search and/or add group item
                wxTreeItemId groupItem = GetGroupItem(ConditionsTree, objectTypeItem, it->second.GetGroup());

                //Add condition item
                int IDimage = 0;
                if ( it->second.GetSmallBitmapIcon().IsOk() )
                {
                    imageList->Add(it->second.GetSmallBitmapIcon());
                    IDimage = imageList->GetImageCount()-1;
                }

                gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(it->first);
                ConditionsTree->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
            }
	    }

	    for(unsigned int j = 0;j<automatismsTypes.size();++j)
	    {
            wxTreeItemId automatismTypeItem = objSortCheck->GetValue() ?
                                        ConditionsTree->AppendItem(extensionItem,
                                                                wxString::Format(_("%s Automatism"), extensions[i]->GetAutomatismMetadata(automatismsTypes[j]).GetFullName().c_str()),
                                                                0) :
                                        extensionItem;
            //Add each automatism conditions
            std::map<string, gd::InstructionMetadata > allConditions = extensions[i]->GetAllConditionsForAutomatism(automatismsTypes[j]);
            for(std::map<string, gd::InstructionMetadata>::const_iterator it = allConditions.begin(); it != allConditions.end(); ++it)
            {
                //Verify if the condition match the search
                if ( searching &&
                    boost::to_upper_copy(it->second.GetGroup()).find(search) == string::npos &&
                    boost::to_upper_copy(it->second.GetFullName()).find(search) == string::npos)
                    continue;

                if ( it->second.IsHidden() ) continue;

                //Search and/or add group item
                wxTreeItemId groupItem = GetGroupItem(ConditionsTree, automatismTypeItem, it->second.GetGroup());

                //Add condition item
                int IDimage = 0;
                if ( it->second.GetSmallBitmapIcon().IsOk() )
                {
                    imageList->Add(it->second.GetSmallBitmapIcon());
                    IDimage = imageList->GetImageCount()-1;
                }

                gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(it->first);
                ConditionsTree->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
            }
	    }

        //Add each (free) conditions
        std::map<string, gd::InstructionMetadata > allConditions = extensions[i]->GetAllConditions();
        for(std::map<string, gd::InstructionMetadata>::const_iterator it = allConditions.begin(); it != allConditions.end(); ++it)
        {
            //Verify if the condition match the search
            if ( searching &&
                boost::to_upper_copy(it->second.GetGroup()).find(search) == string::npos &&
                boost::to_upper_copy(it->second.GetFullName()).find(search) == string::npos)
                continue;

            if ( it->second.IsHidden() ) continue;

            //Search and/or add group item
            wxTreeItemId groupItem = GetGroupItem(ConditionsTree, extensionItem, it->second.GetGroup());

            //Add condition item
            int IDimage = 0;
            if ( it->second.GetSmallBitmapIcon().IsOk() )
            {
                imageList->Add(it->second.GetSmallBitmapIcon());
                IDimage = imageList->GetImageCount()-1;
            }

            gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(it->first);
            ConditionsTree->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
        }

	    if ( !ConditionsTree->HasChildren(extensionItem) ) ConditionsTree->Delete(extensionItem);
	}

	if ( searching ) ConditionsTree->ExpandAll();
}

void ChoixCondition::RefreshObjectsLists()
{
    gd::ObjectListDialogsHelper objectListsHelper(game, scene);
    objectListsHelper.SetSearchText(ToString(objectsSearchCtrl->GetValue()));
    objectListsHelper.SetAllowedObjectType("");
    objectListsHelper.RefreshLists(ObjetsList, GroupesList, globalObjectsList, globalObjectGroups);
}

void ChoixCondition::RefreshObjectConditionsList()
{
    objectConditionsTree->DeleteAllItems();
    objectConditionsTree->AddRoot( _( "All conditions" ), 0 );

    std::string search = boost::to_upper_copy(string(searchCtrl->GetValue().mb_str()));
    bool searching = search.empty() ? false : true;

    std::string selectedObjectType = gd::GetTypeOfObject(game, scene, selectedObject);

    //Insert extension objects conditions
    const vector < boost::shared_ptr<gd::PlatformExtension> > extensions = game.GetCurrentPlatform().GetAllPlatformExtensions();
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.GetUsedExtensions().begin(),
                  game.GetUsedExtensions().end(),
                  extensions[i]->GetName()) == game.GetUsedExtensions().end() )
            continue;

        wxTreeItemId extensionItem = objectConditionsTree->GetRootItem();
        std::string objectType = selectedObjectType;
        if ( extensions[i]->GetName() == "BuiltinObject" )
        {
            objectType = "";
            extensionItem = objectConditionsTree->AppendItem(objectConditionsTree->GetRootItem(), _("All objects"), 0);
        }
        else
            extensionItem = objectConditionsTree->AppendItem(objectConditionsTree->GetRootItem(), extensions[i]->GetFullName(), 0);

        wxTreeItemId objectTypeItem = objSortCheck->GetValue() ?
                                    objectConditionsTree->AppendItem(extensionItem,
                                                            wxString::Format(_("%s Object"), extensions[i]->GetObjectMetadata(objectType).GetFullName().c_str()),
                                                            0) :
                                    extensionItem;

        //Add each object conditions
        std::map<string, gd::InstructionMetadata > allConditions = extensions[i]->GetAllConditionsForObject(objectType);
        for(std::map<string, gd::InstructionMetadata>::const_iterator it = allConditions.begin(); it != allConditions.end(); ++it)
        {
            //Verify if the condition match the search
            if ( searching &&
                boost::to_upper_copy(it->second.GetGroup()).find(search) == string::npos &&
                boost::to_upper_copy(it->second.GetFullName()).find(search) == string::npos)
                continue;

            if ( it->second.IsHidden() ) continue;

            //Search and/or add group item
            wxTreeItemId groupItem = GetGroupItem(objectConditionsTree, objectTypeItem, it->second.GetGroup());

            //Add condition item
            int IDimage = 0;
            if ( it->second.GetSmallBitmapIcon().IsOk() )
            {
                imageList->Add(it->second.GetSmallBitmapIcon());
                IDimage = imageList->GetImageCount()-1;
            }

            gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(it->first);
            objectConditionsTree->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
        }

	    vector<string> automatismsTypes = extensions[i]->GetAutomatismsTypes();
	    vector<std::string> objectAutomatisms = gd::GetAutomatismsOfObject(game, scene, selectedObject);

	    for(unsigned int j = 0;j<objectAutomatisms.size();++j)
	    {
	        std::string automatismType = gd::GetTypeOfAutomatism(game, scene, objectAutomatisms[j]);

	        if ( find(automatismsTypes.begin(), automatismsTypes.end(), automatismType) == automatismsTypes.end() )
                continue;

            wxTreeItemId automatismTypeItem = objSortCheck->GetValue() ?
                                        objectConditionsTree->AppendItem(extensionItem,
                                                                wxString::Format(_("%s Automatism"), extensions[i]->GetAutomatismMetadata(automatismType).GetFullName().c_str()),
                                                                0) :
                                        extensionItem;
            //Add each automatism conditions
            std::map<string, gd::InstructionMetadata > allConditions = extensions[i]->GetAllConditionsForAutomatism(automatismType);
            for(std::map<string, gd::InstructionMetadata>::const_iterator it = allConditions.begin(); it != allConditions.end(); ++it)
            {
                //Verify if the condition match the search
                if ( searching &&
                    boost::to_upper_copy(it->second.GetGroup()).find(search) == string::npos &&
                    boost::to_upper_copy(it->second.GetFullName()).find(search) == string::npos)
                    continue;

                if ( it->second.IsHidden() ) continue;

                //Search and/or add group item
                wxTreeItemId groupItem = GetGroupItem(objectConditionsTree, automatismTypeItem, it->second.GetGroup());

                //Add condition item
                int IDimage = 0;
                if ( it->second.GetSmallBitmapIcon().IsOk() )
                {
                    imageList->Add(it->second.GetSmallBitmapIcon());
                    IDimage = imageList->GetImageCount()-1;
                }

                gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(it->first);
                objectConditionsTree->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
            }
	    }

	    if ( !objectConditionsTree->HasChildren(extensionItem) ) objectConditionsTree->Delete(extensionItem);
	}

	if ( searching ) objectConditionsTree->ExpandAll();
}

void ChoixCondition::OnConditionsTreeSelectionChanged( wxTreeEvent& event )
{
    wxTreeItemId item = event.GetItem();

    gd::TreeItemStringData * associatedData = dynamic_cast<gd::TreeItemStringData*>(ConditionsTree->GetItemData(item));
    if ( associatedData != NULL )
    {
        Type = associatedData->GetString();

        RefreshFromCondition();
        return;
    }
}

void ChoixCondition::OnobjectConditionsTreeSelectionChanged(wxTreeEvent& event)
{
    wxTreeItemId item = event.GetItem();

    gd::TreeItemStringData * associatedData = dynamic_cast<gd::TreeItemStringData*>(objectConditionsTree->GetItemData(item));
    if ( associatedData != NULL )
    {
        Type = associatedData->GetString();

        RefreshFromCondition();
        if ( !ParaEdit.empty() ) ParaEdit[0]->SetValue(selectedObject);;
        return;
    }
}

////////////////////////////////////////////////////////////
/// Rafraichissement
///
/// Rafraichit la fenetre et les controles en utilisant les données actuelles
////////////////////////////////////////////////////////////
void ChoixCondition::RefreshFromCondition()
{
    if ( Type.empty() ) return;

    //Display action main properties
    const gd::InstructionMetadata & instructionMetadata = gd::MetadataProvider::GetConditionMetadata(game.GetCurrentPlatform(), Type);

    NomConditionTxt->SetLabel( instructionMetadata.GetFullName() );
    NomConditionTxt->Wrap( 450 );
    ConditionTextTxt->SetLabel( instructionMetadata.GetDescription() );
    ConditionTextTxt->Wrap( 450 );
    if ( instructionMetadata.GetBitmapIcon().IsOk() ) ConditionImg->SetBitmap( instructionMetadata.GetBitmapIcon() );
    else ConditionImg->SetBitmap(gd::CommonBitmapManager::GetInstance()->unknownCondition24);

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
        Connect( id, wxEVT_COMMAND_BUTTON_CLICKED, wxCommandEventHandler( ChoixCondition::OnABtClick ) );
        Connect( ID_CHECKARRAY, wxEVT_COMMAND_CHECKBOX_CLICKED, wxCommandEventHandler( ChoixCondition::OnFacClicked ) );

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
            ParaText.at( i )->Show();

            if ( i < Param.size() ) ParaEdit.at( i )->SetValue(Param[i].GetPlainString());
            ParaEdit.at( i )->Show();

            ParaBmpBt.at(i)->SetBitmapLabel( gd::ConditionSentenceFormatter::BitmapFromType(instructionMetadata.parameters[i].type) );
            ParaBmpBt.at(i)->SetToolTip( gd::ConditionSentenceFormatter::LabelFromType(instructionMetadata.parameters[i].type) );
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
                else if ( instructionMetadata.parameters[i].type == "file" ) ParaEdit.at( i )->SetValue("\"\"");
            }
        }
    }
    Layout();
    GridSizer1->Layout();

    ContraireCheck->SetValue(conditionInverted);

    Layout();
}


////////////////////////////////////////////////////////////
/// Clic sur un bouton radio
////////////////////////////////////////////////////////////
void ChoixCondition::OnFacClicked(wxCommandEvent& event)
{
    // On déduit le numéro du paramètre à partir du nom du bouton
    // ( Son nom, pas son label )
    string num = string(wxWindow::FindFocus()->GetName().mb_str());
    unsigned int i = ToInt( num );

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


////////////////////////////////////////////////////////////
/// Clic sur les boutons
///
/// Ouverture des dialogs appropriés en fonction des boutons
////////////////////////////////////////////////////////////
void ChoixCondition::OnABtClick( wxCommandEvent& event )
{
    string num = ( string ) wxWindow::FindFocus()->GetName();
    unsigned int i = atoi( num.c_str() );

    const gd::InstructionMetadata & instructionMetadata = gd::MetadataProvider::GetConditionMetadata(game.GetCurrentPlatform(), Type);

    if ( i < MaxPara && i < instructionMetadata.parameters.size())
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
        else if (  instructionMetadata.parameters[i].type == "expression" )
        {
            gd::EditExpressionDialog dialog(this, ToString( ParaEdit.at(i)->GetValue() ), game, scene);
            if ( dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(dialog.GetExpression());
            }
            return;
        }
        else if ( instructionMetadata.parameters[i].type == "mouse" )
        {
            ChoixBouton dialog(this, ToString( ParaEdit.at(i)->GetValue() ));
            if ( dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(dialog.bouton);
            }
            return;
        }
        else if ( instructionMetadata.parameters[i].type == "key" )
        {
            ChoixClavier dialog(this, ToString( ParaEdit.at(i)->GetValue() ));
            if ( dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(dialog.selectedKey);
            }
            return;
        }
        else if ( instructionMetadata.parameters[i].type == "file" )
        {
            ChoiceFile dialog(this, ToString( ParaEdit.at(i)->GetValue() ), game, scene);

            if ( dialog.ShowModal() == 1 )
                ParaEdit[i]->ChangeValue(dialog.file);

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
        else if ( instructionMetadata.parameters[i].type == "relationalOperator" )
        {
            SigneTest dialog(this);
            int retour = dialog.ShowModal();

            if ( retour == 1 )
                ParaEdit.at(i)->ChangeValue("=");
            if ( retour == 2 )
                ParaEdit.at(i)->ChangeValue(">");
            if ( retour == 3 )
                ParaEdit.at(i)->ChangeValue("<");
            if ( retour == 4 )
                ParaEdit.at(i)->ChangeValue(">=");
            if ( retour == 5 )
                ParaEdit.at(i)->ChangeValue("<=");
            if ( retour == 6 )
                ParaEdit.at(i)->ChangeValue("!=");

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "trueorfalse" )
        {
            TrueOrFalse dialog(this, _("Choose True or False to fill the parameter"), _("True or False"));
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(_("True"));
            else
                ParaEdit.at(i)->ChangeValue(_("False"));
        }
        else if ( instructionMetadata.parameters[i].type == "yesorno" )
        {
            if (wxMessageBox(_("Choose yes or no to fullfil this parameter:"), _("Yes or no") ,wxYES_NO ) == wxYES)
                ParaEdit.at(i)->ChangeValue(_("yes"));
            else
                ParaEdit.at(i)->ChangeValue(_("no"));

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
        else if ( instructionMetadata.parameters[i].type == "objectvar" )
        {
            if ( ParaEdit.empty() ) return;

            string objectWanted = string(ParaEdit[0]->GetValue().mb_str());
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
                ParaEdit.at(i)->ChangeValue(dialog.GetSelectedVariable());

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "scenevar" )
        {
            gd::ChooseVariableDialog dialog(this, scene.GetVariables());
            dialog.SetAssociatedLayout(&game, &scene);
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.GetSelectedVariable());

            return;
        }
        else if ( instructionMetadata.parameters[i].type == "globalvar" )
        {
            gd::ChooseVariableDialog dialog(this, game.GetVariables());
            dialog.SetAssociatedProject(&game);
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.GetSelectedVariable());

            return;
        }
    }
}

void ChoixCondition::OnOkBtClick( wxCommandEvent& event )
{
    const gd::InstructionMetadata & instructionMetadata = gd::MetadataProvider::GetConditionMetadata(game.GetCurrentPlatform(), Type);

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
        if ( !instructionMetadata.parameters[i].codeOnly ) parameterDisplayedNb++;

        //Do not check optional parameters which are desactivated
        if ( !ParaFac.at(i)->IsShown() || (ParaFac.at(i)->IsShown() && ParaFac.at(i)->GetValue()))
        {
            gd::CallbacksForExpressionCorrectnessTesting callbacks(game, scene);
            gd::ExpressionParser expressionParser(ToString(ParaEdit[i]->GetValue()));

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
        Param.push_back( gd::Expression(ToString(ParaEdit.at(i)->GetValue())) );
    }

    conditionInverted = ContraireCheck->GetValue();

    EndModal( 0 );
}

void ChoixCondition::OnCancelBtClick( wxCommandEvent& event )
{
    EndModal( 1 );
}

void ChoixCondition::OnAideBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/events_editor/condition"));
}

void ChoixCondition::OnextSortCheckClick(wxCommandEvent& event)
{
    RefreshList();
}

void ChoixCondition::OnobjSortCheckClick(wxCommandEvent& event)
{
    RefreshList();
}

void ChoixCondition::OnmoreBtClick(wxCommandEvent& event)
{
    gd::ProjectExtensionsDialog dialog(this, game);
    dialog.ShowModal();

    RefreshList();
}

void ChoixCondition::OnGlobalCheckSelect(wxCommandEvent& event)
{
    wxLogMessage(_("Warning. This option is only available for backward compatibility.\nIt must not be used anymore in new game, and it might be removed in a next version."));
}

void ChoixCondition::OnsearchCtrlText(wxCommandEvent& event)
{
    RefreshList();
    RefreshObjectConditionsList();
}

void ChoixCondition::OnobjectsSearchCtrlText(wxCommandEvent& event)
{
    RefreshObjectsLists();
}

void ChoixCondition::OnObjetsListSelectionChanged(wxTreeEvent& event)
{
    if ( objectsListsNotebook->GetSelection() == 0 && ObjetsList->GetRootItem() != ObjetsList->GetFocusedItem() )
        selectedObject = ObjetsList->GetItemText( ObjetsList->GetFocusedItem() ).mb_str();
    else if ( objectsListsNotebook->GetSelection() == 1 && GroupesList->GetRootItem() != GroupesList->GetFocusedItem() )
        selectedObject = GroupesList->GetItemText( GroupesList->GetFocusedItem() ).mb_str();
    else if ( objectsListsNotebook->GetSelection() == 2 && globalObjectsList->GetRootItem() != globalObjectsList->GetFocusedItem() )
        selectedObject = globalObjectsList->GetItemText( globalObjectsList->GetFocusedItem() ).mb_str();
    else if ( objectsListsNotebook->GetSelection() == 3 && globalObjectGroups->GetRootItem() != globalObjectGroups->GetFocusedItem() )
        selectedObject = globalObjectGroups->GetItemText( globalObjectGroups->GetFocusedItem() ).mb_str();

    RefreshObjectConditionsList();
}

void ChoixCondition::OnResize(wxSizeEvent& event)
{
    Layout();
}

void ChoixCondition::OnConditionsTreeItemActivated(wxTreeEvent& event)
{
    if ( !ParaEdit.empty() ) ParaEdit[0]->SetFocus();
}

void ChoixCondition::OnobjectConditionsTreeItemActivated(wxTreeEvent& event)
{
    if ( !ParaEdit.empty() ) ParaEdit[0]->SetFocus();
}
