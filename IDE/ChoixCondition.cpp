/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "CppUnitLite/TestHarness.h"

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
#include "GDL/gdTreeItemStringData.h"
#include "GDL/HelpFileAccess.h"
#include "GDL/TranslateCondition.h"
#include "GDL/EditExpression.h"
#include "GDL/EditTextDialog.h"
#include "GDL/ChooseObject.h"
#include "GDL/CommonTools.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExtensionBase.h"
#include "GDL/ChooseAutomatismDlg.h"
#include "ChoixBouton.h"
#include "ChoixClavier.h"
#include "GDL/BitmapGUIManager.h"
#include "TrueOrFalse.h"
#include "GDL/ChooseLayer.h"
#include "ChoiceJoyAxis.h"
#include "ChoiceFile.h"
#include "GDL/ChooseVariableDialog.h"
#include "GDL/ObjectListDialogsHelper.h"
#include "GDL/ExpressionsCorrectnessTesting.h"
#include "Extensions.h"
#include "SigneTest.h"

#include <wx/help.h>
#include <boost/algorithm/string.hpp>

using namespace std;

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
const long ChoixCondition::ID_RADIOBUTTON1 = wxNewId();
const long ChoixCondition::ID_RADIOBUTTON2 = wxNewId();
const long ChoixCondition::ID_CHECKBOX1 = wxNewId();
const long ChoixCondition::ID_STATICLINE2 = wxNewId();
const long ChoixCondition::ID_BUTTON4 = wxNewId();
const long ChoixCondition::ID_CHECKBOX3 = wxNewId();
const long ChoixCondition::ID_BUTTON1 = wxNewId();
const long ChoixCondition::ID_BUTTON2 = wxNewId();
const long ChoixCondition::ID_BUTTON3 = wxNewId();
//*)
const long ChoixCondition::ID_EDITARRAY = wxNewId();
const long ChoixCondition::ID_TEXTARRAY = wxNewId();
const long ChoixCondition::ID_BUTTONARRAY = wxNewId();
const long ChoixCondition::ID_CHECKARRAY = wxNewId();

BEGIN_EVENT_TABLE( ChoixCondition, wxDialog )
    //(*EventTable(ChoixCondition)
    //*)
END_EVENT_TABLE()


////////////////////////////////////////////////////////////
/// Constructeur
///
/// Paramètre pScene : pour passer en argument pour ouvrir par exemple l'éditeur d'objet
/// Paramètre pEvent : pour analyser l'event et savoir si il faut le mettre global/local
////////////////////////////////////////////////////////////
ChoixCondition::ChoixCondition( wxWindow* parent, Game & game_, Scene & scene_) :
game(game_),
scene(scene_)
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
    wxBoxSizer* BoxSizer9;
    wxFlexGridSizer* FlexGridSizer6;
    wxStaticBoxSizer* StaticBoxSizer1;
    wxFlexGridSizer* FlexGridSizer1;
    wxBoxSizer* BoxSizer3;

    Create(parent, wxID_ANY, _("Editer la condition"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("wxID_ANY"));
    SetClientSize(wxSize(650,236));
    SetMinSize(wxSize(640,480));
    wxIcon FrameIcon;
    FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/conditionicon.png"))));
    SetIcon(FrameIcon);
    BoxSizer6 = new wxBoxSizer(wxVERTICAL);
    BoxSizer7 = new wxBoxSizer(wxHORIZONTAL);
    FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer4->AddGrowableCol(0);
    FlexGridSizer4->AddGrowableRow(0);
    Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxSize(270,500), 0, _T("ID_NOTEBOOK1"));
    ConditionsTree = new wxTreeCtrl(Notebook1, ID_TREECTRL1, wxDefaultPosition, wxSize(300,350), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL1"));
    ConditionsTree->SetToolTip(_("Choisissez une condition à paramétrer."));
    Panel1 = new wxPanel(Notebook1, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    BoxSizer10 = new wxBoxSizer(wxVERTICAL);
    BoxSizer11 = new wxBoxSizer(wxVERTICAL);
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
    BoxSizer11->Add(objectsListsNotebook, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    objectsSearchCtrl = new wxSearchCtrl(Panel1, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(10,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
    BoxSizer11->Add(objectsSearchCtrl, 0, wxBOTTOM|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer10->Add(BoxSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    objectConditionsTree = new wxTreeCtrl(Panel1, ID_TREECTRL6, wxDefaultPosition, wxDefaultSize, wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL6"));
    objectConditionsTree->SetToolTip(_("Choisissez une action à paramétrer."));
    BoxSizer10->Add(objectConditionsTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Panel1->SetSizer(BoxSizer10);
    BoxSizer10->Fit(Panel1);
    BoxSizer10->SetSizeHints(Panel1);
    Notebook1->AddPage(ConditionsTree, _("Toutes les conditions"), false);
    Notebook1->AddPage(Panel1, _("Par objet"), false);
    FlexGridSizer4->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    searchCtrl = new wxSearchCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    FlexGridSizer4->Add(searchCtrl, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer7->Add(FlexGridSizer4, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    conditionSizer = new wxBoxSizer(wxVERTICAL);
    FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer3->AddGrowableCol(2);
    FlexGridSizer3->AddGrowableRow(0);
    ConditionImg = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/unknown24.png")).Rescale(wxSize(24,24).GetWidth(),wxSize(24,24).GetHeight())), wxDefaultPosition, wxSize(24,24), wxNO_BORDER, _T("ID_STATICBITMAP1"));
    FlexGridSizer3->Add(ConditionImg, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer4 = new wxBoxSizer(wxHORIZONTAL);
    NomConditionTxt = new wxStaticText(this, ID_STATICTEXT1, _("Aucune condition choisie"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    wxFont NomConditionTxtFont(16,wxSWISS,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    NomConditionTxt->SetFont(NomConditionTxtFont);
    BoxSizer4->Add(NomConditionTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer3->Add(BoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    conditionSizer->Add(FlexGridSizer3, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer3 = new wxBoxSizer(wxHORIZONTAL);
    ConditionTextTxt = new wxStaticText(this, ID_STATICTEXT2, _("Choisissez une condition dans le menu de gauche"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    ConditionTextTxt->SetToolTip(_("Pour plus d\'informations sur la condition, consultez l\'aide."));
    BoxSizer3->Add(ConditionTextTxt, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    conditionSizer->Add(BoxSizer3, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(480,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    BoxSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 3);
    conditionSizer->Add(BoxSizer1, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    GridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
    GridSizer1->AddGrowableCol(1);
    conditionSizer->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer9 = new wxBoxSizer(wxHORIZONTAL);
    StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Sélection des objets"));
    FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer5->AddGrowableCol(0);
    FlexGridSizer6 = new wxFlexGridSizer(0, 2, 0, 0);
    LocaliseCheck = new wxRadioButton(this, ID_RADIOBUTTON1, _("Par défaut"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
    LocaliseCheck->SetValue(true);
    LocaliseCheck->SetToolTip(_("Ne seront pris en compte que les objets concernés par les autres conditions de l\'évènement."));
    FlexGridSizer6->Add(LocaliseCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    GlobalCheck = new wxRadioButton(this, ID_RADIOBUTTON2, _("Forcer en global"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
    GlobalCheck->SetToolTip(_("Tous les objets de la scène seront concernés par cette condition."));
    FlexGridSizer6->Add(GlobalCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticBoxSizer1->Add(FlexGridSizer5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer9->Add(StaticBoxSizer1, 1, wxALL|wxALIGN_BOTTOM|wxALIGN_CENTER_HORIZONTAL, 0);
    StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Inversion"));
    FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer7->AddGrowableCol(1);
    FlexGridSizer7->AddGrowableRow(0);
    ContraireCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Inverser la condition"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
    ContraireCheck->SetValue(false);
    ContraireCheck->SetToolTip(_("Cochez pour que la condition vérifie l\'inverse de ce qu\'elle devrait faire."));
    FlexGridSizer7->Add(ContraireCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer2->Add(FlexGridSizer7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer9->Add(StaticBoxSizer2, 0, wxALL|wxALIGN_BOTTOM|wxALIGN_CENTER_HORIZONTAL, 0);
    conditionSizer->Add(BoxSizer9, 0, wxALL|wxALIGN_LEFT|wxALIGN_BOTTOM, 5);
    BoxSizer7->Add(conditionSizer, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer6->Add(BoxSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer2 = new wxBoxSizer(wxHORIZONTAL);
    StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    BoxSizer2->Add(StaticLine2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer6->Add(BoxSizer2, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer2 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
    moreBt = new wxButton(this, ID_BUTTON4, _("Plus de conditions"), wxDefaultPosition, wxSize(140,23), 0, wxDefaultValidator, _T("ID_BUTTON4"));
    FlexGridSizer1->Add(moreBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    objSortCheck = new wxCheckBox(this, ID_CHECKBOX3, _("Ranger par objets"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
    objSortCheck->SetValue(false);
    FlexGridSizer1->Add(objSortCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer2->Add(FlexGridSizer1, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer5 = new wxBoxSizer(wxHORIZONTAL);
    OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    BoxSizer5->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    CancelBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    BoxSizer5->Add(CancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    AideBt = new wxButton(this, ID_BUTTON3, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
    BoxSizer5->Add(AideBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer2->Add(BoxSizer5, 0, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer6->Add(FlexGridSizer2, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(BoxSizer6);
    BoxSizer6->SetSizeHints(this);
    Center();

    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixCondition::OnConditionsTreeSelectionChanged);
    Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixCondition::OnObjetsListSelectionChanged);
    Connect(ID_TREECTRL3,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixCondition::OnObjetsListSelectionChanged);
    Connect(ID_TREECTRL4,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixCondition::OnObjetsListSelectionChanged);
    Connect(ID_TREECTRL5,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixCondition::OnObjetsListSelectionChanged);
    Connect(ID_TEXTCTRL2,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ChoixCondition::OnobjectsSearchCtrlText);
    Connect(ID_TREECTRL6,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixCondition::OnobjectConditionsTreeSelectionChanged);
    Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ChoixCondition::OnsearchCtrlText);
    Connect(ID_RADIOBUTTON2,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ChoixCondition::OnGlobalCheckSelect);
    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnmoreBtClick);
    Connect(ID_CHECKBOX3,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnobjSortCheckClick);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnOkBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnCancelBtClick);
    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnAideBtClick);
    //*)
    moreBt->SetBitmap(wxBitmap("res/extensiononly16.png", wxBITMAP_TYPE_ANY));

    imageList = new wxImageList( 16, 16 );
    imageList->Add(( wxBitmap( "res/conditions/unecond.png", wxBITMAP_TYPE_ANY ) ) );
    ConditionsTree->AssignImageList( imageList );
    objectConditionsTree->SetImageList( imageList );

    Type = "";
    Loc = true;
    Contraire = false;

    searchCtrl->SetFocus();

    RefreshAllLists();
    Center();
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

/**
 * Create the list of conditions
 */
void ChoixCondition::RefreshList()
{
    ConditionsTree->DeleteAllItems();
    ConditionsTree->AddRoot( _( "Toutes les conditions" ), 0 );

    std::string search = boost::to_upper_copy(string(searchCtrl->GetValue().mb_str()));
    bool searching = search.empty() ? false : true;

    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const vector < boost::shared_ptr<ExtensionBase> > extensions = extensionManager->GetExtensions();

    //Insert extension objects conditions
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.extensionsUsed.begin(),
                  game.extensionsUsed.end(),
                  extensions[i]->GetName()) == game.extensionsUsed.end() )
            continue;

	    vector<string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
	    vector<string> automatismsTypes = extensions[i]->GetAutomatismsTypes();


        wxTreeItemId extensionItem = ConditionsTree->GetRootItem();
        if ( !objectsTypes.empty() || !automatismsTypes.empty() )//Display the extension name only if it contains objects
        {
            if ( extensions[i]->GetName() == "BuiltinObject" )
                extensionItem = ConditionsTree->AppendItem(ConditionsTree->GetRootItem(), _("Tous les objets"), 0);
            else
                extensionItem = ConditionsTree->AppendItem(ConditionsTree->GetRootItem(), extensions[i]->GetFullName(), 0);
        }

	    for(unsigned int j = 0;j<objectsTypes.size();++j)
	    {

            wxTreeItemId objectTypeItem = objSortCheck->GetValue() ?
                                        ConditionsTree->AppendItem(extensionItem,
                                                                _("Objet") + wxString(" ") + extensions[i]->GetObjectInfo(objectsTypes[j]).fullname,
                                                                0) :
                                        extensionItem;
            //Add each object conditions
            std::map<string, InstructionInfos > allConditions = extensions[i]->GetAllConditionsForObject(objectsTypes[j]);
            for(std::map<string, InstructionInfos>::const_iterator it = allConditions.begin(); it != allConditions.end(); ++it)
            {
                //Verify if the condition match the search
                if ( searching &&
                    boost::to_upper_copy(it->second.group).find(search) == string::npos &&
                    boost::to_upper_copy(it->second.fullname).find(search) == string::npos)
                    continue;

                //Search and/or add group item
                wxTreeItemIdValue cookie;
                wxTreeItemId groupItem = ConditionsTree->GetFirstChild(objectTypeItem, cookie);
                while ( groupItem.IsOk() && ConditionsTree->GetItemText(groupItem) != it->second.group )
                {
                    groupItem = ConditionsTree->GetNextSibling(groupItem);
                }
                if ( !groupItem.IsOk() ) groupItem = ConditionsTree->AppendItem(objectTypeItem, it->second.group, 0);

                //Add condition item
                int IDimage = 0;
                if ( it->second.smallicon.IsOk() )
                {
                    imageList->Add(it->second.smallicon);
                    IDimage = imageList->GetImageCount()-1;
                }

                gdTreeItemStringData * associatedData = new gdTreeItemStringData(it->first);
                ConditionsTree->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
            }
	    }

	    for(unsigned int j = 0;j<automatismsTypes.size();++j)
	    {
            wxTreeItemId automatismTypeItem = objSortCheck->GetValue() ?
                                        ConditionsTree->AppendItem(extensionItem,
                                                                _("Automatisme") + wxString(" ") + extensions[i]->GetAutomatismInfo(automatismsTypes[j]).fullname,
                                                                0) :
                                        extensionItem;
            //Add each automatism conditions
            std::map<string, InstructionInfos > allConditions = extensions[i]->GetAllConditionsForAutomatism(automatismsTypes[j]);
            for(std::map<string, InstructionInfos>::const_iterator it = allConditions.begin(); it != allConditions.end(); ++it)
            {
                //Verify if the condition match the search
                if ( searching &&
                    boost::to_upper_copy(it->second.group).find(search) == string::npos &&
                    boost::to_upper_copy(it->second.fullname).find(search) == string::npos)
                    continue;

                //Search and/or add group item
                wxTreeItemIdValue cookie;
                wxTreeItemId groupItem = ConditionsTree->GetFirstChild(automatismTypeItem, cookie);
                while ( groupItem.IsOk() && ConditionsTree->GetItemText(groupItem) != it->second.group )
                {
                    groupItem = ConditionsTree->GetNextSibling(groupItem);
                }
                if ( !groupItem.IsOk() ) groupItem = ConditionsTree->AppendItem(automatismTypeItem, it->second.group, 0);

                //Add condition item
                int IDimage = 0;
                if ( it->second.smallicon.IsOk() )
                {
                    imageList->Add(it->second.smallicon);
                    IDimage = imageList->GetImageCount()-1;
                }

                gdTreeItemStringData * associatedData = new gdTreeItemStringData(it->first);
                ConditionsTree->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
            }
	    }

        //Add each (free) conditions
        std::map<string, InstructionInfos > allConditions = extensions[i]->GetAllConditions();
        for(std::map<string, InstructionInfos>::const_iterator it = allConditions.begin(); it != allConditions.end(); ++it)
        {
            //Verify if the condition match the search
            if ( searching &&
                boost::to_upper_copy(it->second.group).find(search) == string::npos &&
                boost::to_upper_copy(it->second.fullname).find(search) == string::npos)
                continue;

            //Search and/or add group item
            wxTreeItemIdValue cookie;
            wxTreeItemId groupItem = ConditionsTree->GetFirstChild(extensionItem, cookie);
            while ( groupItem.IsOk() && ConditionsTree->GetItemText(groupItem) != it->second.group )
            {
                groupItem = ConditionsTree->GetNextSibling(groupItem);
            }
            if ( !groupItem.IsOk() ) groupItem = ConditionsTree->AppendItem(extensionItem, it->second.group, 0);

            //Add condition item
            int IDimage = 0;
            if ( it->second.smallicon.IsOk() )
            {
                imageList->Add(it->second.smallicon);
                IDimage = imageList->GetImageCount()-1;
            }

            gdTreeItemStringData * associatedData = new gdTreeItemStringData(it->first);
            ConditionsTree->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
        }

	    if ( !ConditionsTree->HasChildren(extensionItem) ) ConditionsTree->Delete(extensionItem);
	}

	if ( searching ) ConditionsTree->ExpandAll();
}

void ChoixCondition::RefreshObjectsLists()
{
    ObjectListDialogsHelper objectListsHelper(game, scene);
    objectListsHelper.RefreshLists(ObjetsList, GroupesList, globalObjectsList, globalObjectGroups, "", string(objectsSearchCtrl->GetValue().mb_str()));
}

void ChoixCondition::RefreshObjectConditionsList()
{
    objectConditionsTree->DeleteAllItems();
    objectConditionsTree->AddRoot( _( "Toutes les conditions" ), 0 );

    std::string search = boost::to_upper_copy(string(searchCtrl->GetValue().mb_str()));
    bool searching = search.empty() ? false : true;

    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const vector < boost::shared_ptr<ExtensionBase> > extensions = extensionManager->GetExtensions();
    std::string selectedObjectType = GetTypeOfObject(game, scene, selectedObject);

    //Insert extension objects conditions
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.extensionsUsed.begin(),
                  game.extensionsUsed.end(),
                  extensions[i]->GetName()) == game.extensionsUsed.end() )
            continue;

        wxTreeItemId extensionItem = objectConditionsTree->GetRootItem();
        std::string objectType = selectedObjectType;
        if ( extensions[i]->GetName() == "BuiltinObject" )
        {
            objectType = "";
            extensionItem = objectConditionsTree->AppendItem(objectConditionsTree->GetRootItem(), _("Tous les objets"), 0);
        }
        else
            extensionItem = objectConditionsTree->AppendItem(objectConditionsTree->GetRootItem(), extensions[i]->GetFullName(), 0);

        wxTreeItemId objectTypeItem = objSortCheck->GetValue() ?
                                    objectConditionsTree->AppendItem(extensionItem,
                                                            _("Objet") + wxString(" ") + extensions[i]->GetObjectInfo(objectType).fullname,
                                                            0) :
                                    extensionItem;

        //Add each object conditions
        std::map<string, InstructionInfos > allConditions = extensions[i]->GetAllConditionsForObject(objectType);
        for(std::map<string, InstructionInfos>::const_iterator it = allConditions.begin(); it != allConditions.end(); ++it)
        {
            //Verify if the condition match the search
            if ( searching &&
                boost::to_upper_copy(it->second.group).find(search) == string::npos &&
                boost::to_upper_copy(it->second.fullname).find(search) == string::npos)
                continue;

            //Search and/or add group item
            wxTreeItemIdValue cookie;
            wxTreeItemId groupItem = objectConditionsTree->GetFirstChild(objectTypeItem, cookie);
            while ( groupItem.IsOk() && objectConditionsTree->GetItemText(groupItem) != it->second.group )
            {
                groupItem = objectConditionsTree->GetNextSibling(groupItem);
            }
            if ( !groupItem.IsOk() ) groupItem = objectConditionsTree->AppendItem(objectTypeItem, it->second.group, 0);

            //Add condition item
            int IDimage = 0;
            if ( it->second.smallicon.IsOk() )
            {
                imageList->Add(it->second.smallicon);
                IDimage = imageList->GetImageCount()-1;
            }

            gdTreeItemStringData * associatedData = new gdTreeItemStringData(it->first);
            objectConditionsTree->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
        }

	    vector<string> automatismsTypes = extensions[i]->GetAutomatismsTypes();
	    vector<std::string> objectAutomatisms = GetAutomatismsOfObject(game, scene, selectedObject);

	    for(unsigned int j = 0;j<objectAutomatisms.size();++j)
	    {
	        std::string automatismType = GetTypeOfAutomatism(game, scene, objectAutomatisms[j]);

	        if ( find(automatismsTypes.begin(), automatismsTypes.end(), automatismType) == automatismsTypes.end() )
                continue;

            wxTreeItemId automatismTypeItem = objSortCheck->GetValue() ?
                                        objectConditionsTree->AppendItem(extensionItem,
                                                                _("Automatisme") + wxString(" ") + extensions[i]->GetAutomatismInfo(automatismType).fullname,
                                                                0) :
                                        extensionItem;
            //Add each automatism conditions
            std::map<string, InstructionInfos > allConditions = extensions[i]->GetAllConditionsForAutomatism(automatismType);
            for(std::map<string, InstructionInfos>::const_iterator it = allConditions.begin(); it != allConditions.end(); ++it)
            {
                //Verify if the condition match the search
                if ( searching &&
                    boost::to_upper_copy(it->second.group).find(search) == string::npos &&
                    boost::to_upper_copy(it->second.fullname).find(search) == string::npos)
                    continue;

                //Search and/or add group item
                wxTreeItemIdValue cookie;
                wxTreeItemId groupItem = objectConditionsTree->GetFirstChild(automatismTypeItem, cookie);
                while ( groupItem.IsOk() && objectConditionsTree->GetItemText(groupItem) != it->second.group )
                {
                    groupItem = objectConditionsTree->GetNextSibling(groupItem);
                }
                if ( !groupItem.IsOk() ) groupItem = objectConditionsTree->AppendItem(automatismTypeItem, it->second.group, 0);

                //Add condition item
                int IDimage = 0;
                if ( it->second.smallicon.IsOk() )
                {
                    imageList->Add(it->second.smallicon);
                    IDimage = imageList->GetImageCount()-1;
                }

                gdTreeItemStringData * associatedData = new gdTreeItemStringData(it->first);
                objectConditionsTree->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
            }
	    }

	    if ( !objectConditionsTree->HasChildren(extensionItem) ) objectConditionsTree->Delete(extensionItem);
	}

	if ( searching ) objectConditionsTree->ExpandAll();
}

void ChoixCondition::OnConditionsTreeSelectionChanged( wxTreeEvent& event )
{
    wxTreeItemId item = event.GetItem();

    gdTreeItemStringData * associatedData = dynamic_cast<gdTreeItemStringData*>(ConditionsTree->GetItemData(item));
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

    gdTreeItemStringData * associatedData = dynamic_cast<gdTreeItemStringData*>(objectConditionsTree->GetItemData(item));
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
    const InstructionInfos & instructionInfos =  GDpriv::ExtensionsManager::GetInstance()->GetConditionInfos(Type);

    NomConditionTxt->SetLabel( instructionInfos.fullname );
    NomConditionTxt->Wrap( 450 );
    ConditionTextTxt->SetLabel( instructionInfos.description );
    ConditionTextTxt->Wrap( 450 );
    if ( instructionInfos.icon.IsOk() ) ConditionImg->SetBitmap( instructionInfos.icon );
    else ConditionImg->SetBitmap(BitmapGUIManager::GetInstance()->unknown24);

    //Update controls count
    while ( ParaEdit.size() < instructionInfos.parameters.size() )
    {
        const string num =ToString( ParaEdit.size() );
        long id = wxNewId(); //Bitmap buttons want an unique id so as to be displayed properly

        //Addings controls
        ParaFac.push_back(new wxCheckBox( this, ID_CHECKARRAY, "", wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, num ));
        ParaText.push_back(new wxStaticText( this, ID_TEXTARRAY, _( "Paramètre :" ), wxDefaultPosition, wxDefaultSize, 0, _T( "TxtPara" + num ) ));
        ParaSpacer1.push_back( new wxPanel(this) );
        ParaSpacer2.push_back( new wxPanel(this) );
        ParaEdit.push_back( new wxTextCtrl( this, ID_EDITARRAY, "", wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T( "EditPara" + num ) ));
        ParaBmpBt.push_back( new wxBitmapButton( this, id, BitmapGUIManager::GetInstance()->expressionBt, wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, num ));

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
    while ( ParaEdit.size() > instructionInfos.parameters.size() )
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
    for ( unsigned int i = 0;i < instructionInfos.parameters.size();i++ )
    {
        if (instructionInfos.parameters[i].codeOnly)
        {
            ParaFac.at(i)->Show(false);
            ParaText.at(i)->Show(false);
            ParaBmpBt.at(i)->Show(false);
            ParaEdit.at(i)->Show(false);
        }
        else
        {
            ParaFac.at(i)->Show(instructionInfos.parameters[i].optional);
            ParaFac.at(i)->SetValue(!ParaEdit.at( i )->GetValue().empty());

            ParaText.at(i)->SetLabel( instructionInfos.parameters[i].description + _(" :") );
            ParaText.at( i )->Show();

            if ( i < Param.size() ) ParaEdit.at( i )->SetValue(Param[i].GetPlainString());
            ParaEdit.at( i )->Show();

            ParaBmpBt.at(i)->SetBitmapLabel( TranslateCondition::BitmapFromType(instructionInfos.parameters[i].type) );
            ParaBmpBt.at(i)->SetToolTip( TranslateCondition::LabelFromType(instructionInfos.parameters[i].type) );
            ParaBmpBt.at(i)->Show( !instructionInfos.parameters[i].type.empty() );

            //De/activate widgets if parameter is optional
            if ( instructionInfos.parameters[i].optional && !ParaFac.at(i)->GetValue() && ParaEdit.at(i)->GetValue().empty() )
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
            if ( !instructionInfos.parameters[i].optional && (i >= Param.size() || Param[i].GetPlainString().empty())  )
            {
                if ( instructionInfos.parameters[i].type == "expression" ) ParaEdit.at( i )->SetValue("0");
                else if ( instructionInfos.parameters[i].type == "string" ) ParaEdit.at( i )->SetValue("\"\"");
                else if ( instructionInfos.parameters[i].type == "file" ) ParaEdit.at( i )->SetValue("\"\"");
            }
        }
    }
    Layout();
    GridSizer1->Layout();

    //Update localization
    LocaliseCheck->SetValue(Loc);
    GlobalCheck->SetValue(!Loc);
    ContraireCheck->SetValue(Contraire);

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

    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(Type);

    if ( i < MaxPara && i < instructionInfos.parameters.size())
    {
        if ( instructionInfos.parameters[i].type == "object" )
        {
            ChooseObject dialog(this, game, scene, true, instructionInfos.parameters[i].supplementaryInformation);
            if ( dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(dialog.objectChosen);
            }
            return;
        }
        else if ( instructionInfos.parameters[i].type == "automatism" )
        {
            std::string object = ParaEdit.empty() ? "" : ParaEdit[0]->GetValue().mb_str();
            ChooseAutomatismDlg dialog(this, game, scene, object, instructionInfos.parameters[i].supplementaryInformation);
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.automatismChosen);

            return;
        }
        else if (  instructionInfos.parameters[i].type == "expression" )
        {
            EditExpression dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ), game, scene);
            if ( dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(dialog.expression);
            }
            return;
        }
        else if ( instructionInfos.parameters[i].type == "mouse" )
        {
            ChoixBouton dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ));
            if ( dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(dialog.bouton);
            }
            return;
        }
        else if ( instructionInfos.parameters[i].type == "key" )
        {
            ChoixClavier dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ));
            if ( dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(dialog.touche);
            }
            return;
        }
        else if ( instructionInfos.parameters[i].type == "file" )
        {
            ChoiceFile dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ), game, scene, true);
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.file);

            return;
        }
        else if ( instructionInfos.parameters[i].type == "string" )
        {
            EditTextDialog dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ), game, scene);
            if ( dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->ChangeValue(dialog.returnedText);
            }
            return;
        }
        else if ( instructionInfos.parameters[i].type == "relationalOperator" )
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
        else if ( instructionInfos.parameters[i].type == "trueorfalse" )
        {
            TrueOrFalse dialog(this, _("Choisissez Vrai ou Faux pour remplir le paramètre"), _("Vrai ou Faux"));
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(_("Vrai"));
            else
                ParaEdit.at(i)->ChangeValue(_("Faux"));
        }
        else if ( instructionInfos.parameters[i].type == "yesorno" )
        {
            if (wxMessageBox("Choisissez Oui ou Non pour compléter ce paramètre :", "Oui ou non",wxYES_NO ) == wxYES)
                ParaEdit.at(i)->ChangeValue(_("oui"));
            else
                ParaEdit.at(i)->ChangeValue(_("non"));

            return;
        }
        else if ( instructionInfos.parameters[i].type == "layer" )
        {
            ChooseLayer dialog(this, scene.initialLayers);
            if( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.layerChosen);

            return;
        }
        else if ( instructionInfos.parameters[i].type == "joyaxis" )
        {
            ChoiceJoyAxis dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ), game, scene, true);
            if( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->ChangeValue(dialog.joyaxis);

            return;
        }
        else if ( instructionInfos.parameters[i].type == "objectvar" )
        {
            if ( ParaEdit.empty() ) return;

            string objectWanted = string(ParaEdit[0]->GetValue().mb_str());
            std::vector<ObjSPtr>::iterator sceneObject = std::find_if(scene.initialObjects.begin(), scene.initialObjects.end(), std::bind2nd(ObjectHasName(), objectWanted));
            std::vector<ObjSPtr>::iterator globalObject = std::find_if(game.globalObjects.begin(), game.globalObjects.end(), std::bind2nd(ObjectHasName(), objectWanted));

            ObjSPtr object = boost::shared_ptr<Object> ();

            if ( sceneObject != scene.initialObjects.end() ) //We check first scene's objects' list.
                object = *sceneObject;
            else if ( globalObject != game.globalObjects.end() ) //Then the global object list
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
        else if ( instructionInfos.parameters[i].type == "scenevar" )
        {
            ChooseVariableDialog dialog(this, scene.variables);
            if ( dialog.ShowModal() == 1 )
            {
                scene.variables = dialog.variables;
                ParaEdit.at(i)->ChangeValue(dialog.selectedVariable);
            }

            return;
        }
        else if ( instructionInfos.parameters[i].type == "globalvar" )
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

void ChoixCondition::OnOkBtClick( wxCommandEvent& event )
{
    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(Type);

    if ( Type == "" )
        return;

    if (ParaEdit.size() < instructionInfos.parameters.size())
    {
        wxLogWarning(_("Trop peu de paramètres. Ceci peut être dû à un bug de Game Develop."));
        return;
    }

    //Check for validity of parameters
    bool parametersHaveErrors = false;
    string message;
    size_t parameterDisplayedNb = 0;
    for ( unsigned int i = 0;i < instructionInfos.parameters.size();i++ )
    {
        if ( !instructionInfos.parameters[i].codeOnly ) parameterDisplayedNb++;

        //Do not check optional parameters which are desactivated
        if ( !ParaFac.at(i)->IsShown() || (ParaFac.at(i)->IsShown() && ParaFac.at(i)->GetValue()))
        {
            CallbacksForExpressionCorrectnessTesting callbacks(game, scene);
            GDExpressionParser expressionParser(string(ParaEdit.at(i)->GetValue().mb_str())) ;

            if (  (instructionInfos.parameters[i].type == "string" && !expressionParser.ParseTextExpression(game, scene, callbacks))
                ||(instructionInfos.parameters[i].type == "file" && !expressionParser.ParseTextExpression(game, scene, callbacks))
                ||(instructionInfos.parameters[i].type == "color" && !expressionParser.ParseTextExpression(game, scene, callbacks))
                ||(instructionInfos.parameters[i].type == "joyaxis" && !expressionParser.ParseTextExpression(game, scene, callbacks))
                ||(instructionInfos.parameters[i].type == "layer" && !expressionParser.ParseTextExpression(game, scene, callbacks))
                ||(instructionInfos.parameters[i].type == "expression" && !expressionParser.ParseMathExpression(game, scene, callbacks)))
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

    for ( unsigned int i = 0;i < instructionInfos.parameters.size();i++ )
    {
        Param.push_back( GDExpression(string(ParaEdit.at(i)->GetValue().mb_str())) );
    }

    if ( ContraireCheck->GetValue() )
    {
        Contraire = true;
    } else { Contraire = false; }


    if ( LocaliseCheck->GetValue() ){ Loc = true;}
    else if ( GlobalCheck->GetValue()) { Loc = false; }
    else //Automatique
    {
        Loc = true;
    }

    EndModal( 0 );
}

void ChoixCondition::OnCancelBtClick( wxCommandEvent& event )
{
    EndModal( 1 );
}

void ChoixCondition::OnAideBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::GetInstance();
    helpFileAccess->DisplaySection(23);
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
    Extensions dialog(this, game);
    dialog.ShowModal();

    RefreshList();
}

void ChoixCondition::OnGlobalCheckSelect(wxCommandEvent& event)
{
    wxLogMessage(_("Attention. Cette option n'est présente que par compatibilité avec les anciennes versions de Game Develop.\nElle ne doit plus être utilisée dans les nouveaux jeux et pourrait être enlevée dans les prochaines versions."));
}

void ChoixCondition::OnsearchCtrlText(wxCommandEvent& event)
{
    RefreshList();
    RefreshObjectConditionsList();
    searchCtrl->SetFocus();
}

void ChoixCondition::OnobjectsSearchCtrlText(wxCommandEvent& event)
{
    RefreshObjectsLists();
    objectsSearchCtrl->SetFocus();
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
