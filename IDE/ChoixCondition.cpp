/**
 * Game Develop
 *    ( Nom)
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Choisir et paramétrer une condition
 */

#ifndef RELEASE
#define _MEMORY_TRACKER
#include "debugMem.h" //suivi mémoire
#endif

#include "CppUnitLite/TestHarness.h"

#include "ChoixCondition.h"

//(*InternalHeaders(ChoixCondition)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/image.h>
#include <wx/icon.h>
#include <wx/bitmap.h>
#include <wx/filedlg.h>
#include <wx/config.h>
#include <wx/log.h>
#include <wx/msgdlg.h>
#include "gdTreeItemStringData.h"

#include "TranslateCondition.h"
#include "EditExpression.h"
#include "EditTexte.h"
#include "ChoixObjet.h"
#include "ChoixBouton.h"
#include "ChoixClavier.h"
#include "GDL/BitmapGUIManager.h"
#include "TrueOrFalse.h"
#include "ChoixLayer.h"
#include "ChoiceJoyAxis.h"
#include "ChoiceFile.h"
#include "ChoixVariableDialog.h"
#include "Extensions.h"

#include <string>
#include <vector>
#include "GDL/StdAlgo.h"
#include "MemTrace.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/ExtensionsManager.h"
#include <wx/help.h>
#include "SigneTest.h"

extern MemTrace MemTracer;

using namespace std;

//(*IdInit(ChoixCondition)
const long ChoixCondition::ID_TREECTRL1 = wxNewId();
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
    MemTracer.AddObj( "Fenetre choix condition", ( long )this );
    //(*Initialize(ChoixCondition)
    wxBoxSizer* BoxSizer4;
    wxStaticBoxSizer* StaticBoxSizer2;
    wxBoxSizer* BoxSizer6;
    wxBoxSizer* BoxSizer5;
    wxBoxSizer* BoxSizer7;
    wxBoxSizer* BoxSizer8;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer2;
    wxBoxSizer* BoxSizer2;
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
    ConditionsTree = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxSize(285,270), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
    ConditionsTree->SetToolTip(_("Choisissez une condition à paramétrer."));
    BoxSizer7->Add(ConditionsTree, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer8 = new wxBoxSizer(wxVERTICAL);
    FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer3->AddGrowableCol(2);
    FlexGridSizer3->AddGrowableRow(0);
    ConditionImg = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/unknown24.png")).Rescale(wxSize(24,24).GetWidth(),wxSize(24,24).GetHeight())), wxDefaultPosition, wxSize(24,24), 0, _T("ID_STATICBITMAP1"));
    FlexGridSizer3->Add(ConditionImg, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer4 = new wxBoxSizer(wxHORIZONTAL);
    NomConditionTxt = new wxStaticText(this, ID_STATICTEXT1, _("Aucune condition choisie"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    wxFont NomConditionTxtFont(16,wxSWISS,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    NomConditionTxt->SetFont(NomConditionTxtFont);
    BoxSizer4->Add(NomConditionTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer3->Add(BoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer8->Add(FlexGridSizer3, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer3 = new wxBoxSizer(wxHORIZONTAL);
    ConditionTextTxt = new wxStaticText(this, ID_STATICTEXT2, _("Choisissez une condition dans le menu de gauche"), wxDefaultPosition, wxSize(100,13), 0, _T("ID_STATICTEXT2"));
    ConditionTextTxt->SetToolTip(_("Pour plus d\'informations sur la condition, consultez l\'aide."));
    BoxSizer3->Add(ConditionTextTxt, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer8->Add(BoxSizer3, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    BoxSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer8->Add(BoxSizer1, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    GridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
    GridSizer1->AddGrowableCol(1);
    BoxSizer8->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer9 = new wxBoxSizer(wxHORIZONTAL);
    StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Sélection des objets"));
    FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer5->AddGrowableCol(0);
    FlexGridSizer6 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer6->AddGrowableCol(0);
    LocaliseCheck = new wxRadioButton(this, ID_RADIOBUTTON1, _("Par défaut"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
    LocaliseCheck->SetValue(true);
    LocaliseCheck->SetToolTip(_("Ne seront pris en compte que les objets concernés par les autres conditions de l\'évènement."));
    FlexGridSizer6->Add(LocaliseCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    GlobalCheck = new wxRadioButton(this, ID_RADIOBUTTON2, _("Forcer en global"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
    GlobalCheck->SetToolTip(_("Tous les objets de la scène seront concernés par cette condition."));
    FlexGridSizer6->Add(GlobalCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticBoxSizer1->Add(FlexGridSizer5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer9->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_BOTTOM|wxALIGN_CENTER_HORIZONTAL, 0);
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
    BoxSizer8->Add(BoxSizer9, 0, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_BOTTOM, 5);
    BoxSizer7->Add(BoxSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
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
    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnmoreBtClick);
    Connect(ID_CHECKBOX3,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnobjSortCheckClick);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnOkBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnCancelBtClick);
    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixCondition::OnAideBtClick);
    //*)
    moreBt->SetBitmap(wxBitmap("res/extensiononly16.png", wxBITMAP_TYPE_ANY));

    BitmapGUIManager * bitmapGUIManager = BitmapGUIManager::getInstance();

    //Pour chaque paramètres
    for ( unsigned int i = 0;i < MaxPara;i++ )
    {
        //Un sizer

        string num = st( i );

        //Bouton radio pour facultatif ou pas
        ParaFac.push_back(new wxCheckBox( this, ID_CHECKARRAY, "", wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, num ));

        //Un texte
        ParaText.push_back(new wxStaticText( this, ID_TEXTARRAY, _( "Paramètre :" ), wxDefaultPosition, wxDefaultSize, 0, _T( "TxtPara" + num ) ));

        //Une zone à éditer
        ParaEdit.push_back( new wxTextCtrl( this, ID_EDITARRAY,  "", wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, /*_T(*/ num /*)*/ ));

        //Un bitmap bouton
        const long id = wxNewId();
        ParaBmpBt.push_back( new wxBitmapButton( this, id, bitmapGUIManager->unknownBt, wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, /*_T(*/ num /*)*/ ));

        Connect( id, wxEVT_COMMAND_BUTTON_CLICKED,
                 wxCommandEventHandler( ChoixCondition::OnABtClick ) );
        Connect( ID_BUTTONARRAY, wxEVT_COMMAND_BUTTON_CLICKED,
                 wxCommandEventHandler( ChoixCondition::OnABtClick ) );
        Connect( ID_EDITARRAY, wxEVT_COMMAND_TEXT_UPDATED,
                 wxCommandEventHandler( ChoixCondition::OnParamEdit ) );
        Connect( ID_CHECKARRAY, wxEVT_COMMAND_CHECKBOX_CLICKED,
                 wxCommandEventHandler( ChoixCondition::OnFacClicked ) );

        ParaFac.at(i)->Show( false );
        ParaText.at(i)->Show( false );
        ParaEdit.at(i)->Show( false );
        ParaBmpBt.at(i)->Show( false );

        //On ajoute le tout
        GridSizer1->Add( ParaFac.at(i), 1, wxALL | wxALIGN_LEFT | wxALIGN_CENTER_VERTICAL, 5 );
        GridSizer1->Add( ParaText.at(i), 1, wxALL | wxALIGN_LEFT | wxEXPAND | wxALIGN_CENTER_VERTICAL, 5 );
        GridSizer1->AddStretchSpacer(1);
        GridSizer1->AddStretchSpacer(1);
        GridSizer1->Add( ParaEdit.at(i), 1, wxALL | wxALIGN_LEFT | wxEXPAND | wxALIGN_CENTER_VERTICAL, 5 );
        GridSizer1->Add( ParaBmpBt.at(i), 1, wxALL | wxALIGN_LEFT | wxEXPAND | wxALIGN_CENTER_VERTICAL, 5 );
    }
    GridSizer1->Layout();


    imageList = new wxImageList( 16, 16 );
    imageList->Add(( wxBitmap( "res/conditions/unecond.png", wxBITMAP_TYPE_ANY ) ) );
    ConditionsTree->AssignImageList( imageList );

    Type = "";
    Loc = true;
    Contraire = false;

    //On vérifie si on est pas en mode simple.
    wxConfigBase * pConfig = wxConfigBase::Get();

    bool result = false;
    pConfig->Read("/ModeSimple", &result);

    if ( result == true )
    {
        LocaliseCheck->Enable(false);
        GlobalCheck->Enable(false);
        ContraireCheck->Enable(false);
    }

    RefreshList();
    Center();
}

ChoixCondition::~ChoixCondition()
{
    MemTracer.DelObj(( long )this );

    for ( unsigned int i = 0;i < MaxPara;i++ )
    {
    	delete ParaText.at(i);
    	delete ParaEdit.at(i);
    	delete ParaBmpBt.at(i);
    }
    //(*Destroy(ChoixCondition)
    //*)
}

/**
 * Create the list of conditions
 */
void ChoixCondition::RefreshList()
{
    ConditionsTree->DeleteAllItems();
    ConditionsTree->AddRoot( _( "Toutes les conditions" ), 0 );

    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();
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

        wxTreeItemId extensionItem = ConditionsTree->GetRootItem();
        if ( !objectsTypes.empty() )//Display the extension name only if it contains objects
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
                                                                _("Objet") + wxString(" ") + extensions[i]->GetExtensionObjectName(objectsTypes[j]),
                                                                0) :
                                        extensionItem;
            //Add each object conditions
            std::map<string, InstructionInfos > allConditions = extensions[i]->GetAllConditionsForObject(objectsTypes[j]);
            for(std::map<string, InstructionInfos>::const_iterator it = allConditions.begin(); it != allConditions.end(); ++it)
            {
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

        //Add each conditions
        std::map<string, InstructionInfos > allConditions = extensions[i]->GetAllConditions();
        for(std::map<string, InstructionInfos>::const_iterator it = allConditions.begin(); it != allConditions.end(); ++it)
        {
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
	}

    ConditionsTree->Expand(ConditionsTree->GetRootItem());
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

////////////////////////////////////////////////////////////
/// Rafraichissement
///
/// Rafraichit la fenetre et les controles en utilisant les données actuelles
////////////////////////////////////////////////////////////
void ChoixCondition::RefreshFromCondition()
{
    if ( Type == "" )
        return;

    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();
    const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(Type);

    NomConditionTxt->SetLabel( instructionInfos.fullname );
    ConditionTextTxt->SetLabel( instructionInfos.description );
    ConditionImg->SetBitmap( instructionInfos.icon );

    for ( unsigned int i = 0;i < MaxPara;i++ )
    {
        ParaFac.at(i)->Show( false );
        ParaBmpBt.at(i)->Show( false );
        ParaText.at(i)->Show( false );
        ParaEdit.at(i)->Show( false );
    }

    for ( unsigned int i = 0;i < instructionInfos.parameters.size();i++ )
    {
        ParaFac.at(i)->SetValue(true);
        ParaBmpBt.at(i)->Enable(true);
        ParaText.at(i)->Enable(true);
        ParaEdit.at(i)->Enable(true);

        //Attention à ce que la condition ne veuille pas afficher plus de paramètres que l'on ne peut
        if ( i >= MaxPara )
        {
            wxLogWarning(_("La condition comporte trop de paramètres. Ceci peut être dû à un bug de Game Develop.\nConsultez vous à l'aide pour savoir comment nous reporter un bug."));
        }
        else
        {
            ParaFac.at(i)->Show(false);
            ParaFac.at(i)->SetValue(false);
            if ( instructionInfos.parameters[i].optional )
            {
                //Affiche et désactive les autres controles
                ParaFac.at(i)->Show(true);
                ParaBmpBt.at(i)->Enable(false);
                ParaText.at(i)->Enable(false);
                ParaEdit.at(i)->Enable(false);

                //Si il y a du texte, on laisse activé
                if ( ParaEdit.at( i )->GetValue() != "" )
                {
                    ParaFac.at(i)->SetValue(true);
                    ParaBmpBt.at(i)->Enable(true);
                    ParaText.at(i)->Enable(true);
                    ParaEdit.at(i)->Enable(true);
                }
            }

            ParaBmpBt.at(i)->SetToolTip( TranslateCondition::LabelFromType(instructionInfos.parameters[i].type) );
            ParaBmpBt.at(i)->SetBitmapLabel( TranslateCondition::BitmapFromType(instructionInfos.parameters[i].type) );
            if ( instructionInfos.parameters[i].type != "" ) { ParaBmpBt.at(i)->Show( true ); }//Les boutons

            ParaText.at(i)->Show( true ); //Textes
            ParaText.at(i)->SetLabel( instructionInfos.parameters[i].description + " :" );
            ParaEdit.at(i)->Show( true ); //Et zone d'édition
        }
    }
    Layout();
    GridSizer1->Layout();

    for ( unsigned int i = 0;i < Param.size();i++ )
        ParaEdit.at(i)->SetValue( Param[i].GetPlainString() );

    if ( Loc )
    {
        LocaliseCheck->SetValue(true);
        GlobalCheck->SetValue(false);
    }
    else
    {
        LocaliseCheck->SetValue(false);
        GlobalCheck->SetValue(true);
    }

    if ( Contraire )
    {
        ContraireCheck->SetValue(true);
    }
    else
    {
        ContraireCheck->SetValue(false);
    }

    Fit();
}


////////////////////////////////////////////////////////////
/// Clic sur un bouton radio
////////////////////////////////////////////////////////////
void ChoixCondition::OnFacClicked(wxCommandEvent& event)
{
    // On déduit le numéro du paramètre à partir du nom du bouton
    // ( Son nom, pas son label )
    string num = ( string ) wxWindow::FindFocus()->GetName();
    unsigned int i = atoi( num.c_str() );

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

    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();
    const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(Type);

    vector < string > mainObjectsName; //On cherche maintenant le nom des objets principaux
    for (unsigned int i =0;i<instructionInfos.mainObjects.size();++i)
        mainObjectsName.push_back(static_cast<string>(ParaEdit.at(instructionInfos.mainObjects[i])->GetValue()));

    if ( i < MaxPara && i < instructionInfos.parameters.size())
    {
        if ( instructionInfos.parameters[i].type == "objet" )
        {
            ChoixObjet Dialog(this, game, scene, true, instructionInfos.parameters[i].objectType);
            if ( Dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->SetValue(Dialog.NomObjet);
            }
            return;
        }
        else if (  instructionInfos.parameters[i].type == "expression" )
        {
            EditExpression Dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ), game, scene, true, mainObjectsName);
            if ( Dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->SetValue(Dialog.expression);
            }
            return;
        }
        else if ( instructionInfos.parameters[i].type == "mouse" )
        {
            ChoixBouton Dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ));
            if ( Dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->SetValue(Dialog.bouton);
            }
            return;
        }
        else if ( instructionInfos.parameters[i].type == "key" )
        {
            ChoixClavier Dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ));
            if ( Dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->SetValue(Dialog.touche);
            }
            return;
        }
        else if ( instructionInfos.parameters[i].type == "file" )
        {
            ChoiceFile dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ), game, scene, true, mainObjectsName);
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->SetValue(dialog.file);

            return;
        }
        else if ( instructionInfos.parameters[i].type == "texte" )
        {
            EditTexte Dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ), game, scene, true, mainObjectsName);
            if ( Dialog.ShowModal() == 1 )
            {
                ParaEdit.at(i)->SetValue(Dialog.texteFinal);
            }
            return;
        }
        else if ( instructionInfos.parameters[i].type == "signe" )
        {
            SigneTest dialog(this);
            int retour = dialog.ShowModal();

            if ( retour == 1 )
                ParaEdit.at(i)->SetValue("=");
            if ( retour == 2 )
                ParaEdit.at(i)->SetValue(">");
            if ( retour == 3 )
                ParaEdit.at(i)->SetValue("<");
            if ( retour == 4 )
                ParaEdit.at(i)->SetValue(">=");
            if ( retour == 5 )
                ParaEdit.at(i)->SetValue("<=");
            if ( retour == 6 )
                ParaEdit.at(i)->SetValue("!=");

            return;
        }
        else if ( instructionInfos.parameters[i].type == "trueorfalse" )
        {
            TrueOrFalse dialog(this, _("Choisissez Vrai ou Faux pour remplir le paramètre"), _("Vrai ou Faux"));
            if ( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->SetValue(_("Vrai"));
            else
                ParaEdit.at(i)->SetValue(_("Faux"));
        }
        else if ( instructionInfos.parameters[i].type == "yesorno" )
        {
            if (wxMessageBox("Choisissez Oui ou Non pour compléter ce paramètre :", "Oui ou non",wxYES_NO ) == wxYES)
                ParaEdit.at(i)->SetValue(_("oui"));
            else
                ParaEdit.at(i)->SetValue(_("non"));

            return;
        }
        else if ( instructionInfos.parameters[i].type == "layer" )
        {
            ChoixLayer dialog(this, scene.layers);
            if( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->SetValue(dialog.layerChosen);

            return;
        }
        else if ( instructionInfos.parameters[i].type == "joyaxis" )
        {
            ChoiceJoyAxis dialog(this, static_cast<string>( ParaEdit.at(i)->GetValue() ), game, scene, true, mainObjectsName);
            if( dialog.ShowModal() == 1 )
                ParaEdit.at(i)->SetValue(dialog.joyaxis);

            return;
        }
        else if ( instructionInfos.parameters[i].type == "objectvar" )
        {
            if ( ParaEdit.empty() ) return;

            string objectWanted = string(ParaEdit[0]->GetValue().mb_str());
            int IDsceneObject = Picker::PickOneObject( &scene.objetsInitiaux, objectWanted );
            int IDglobalObject = Picker::PickOneObject( &game.globalObjects, objectWanted );

            ObjSPtr object = boost::shared_ptr<Object> ();

            if ( IDsceneObject != -1)
                object = scene.objetsInitiaux[IDsceneObject];
            else if ( IDglobalObject != -1)
                object = game.globalObjects[IDglobalObject];
            else
                return;

            ChoixVariableDialog dialog(this, object->variablesObjet);
            if ( dialog.ShowModal() == 1 )
            {
                object->variablesObjet = dialog.variables;
                ParaEdit.at(i)->SetValue(dialog.selectedVariable);
            }

            return;
        }
        else if ( instructionInfos.parameters[i].type == "scenevar" )
        {
            ChoixVariableDialog dialog(this, scene.variables);
            if ( dialog.ShowModal() == 1 )
            {
                scene.variables = dialog.variables;
                ParaEdit.at(i)->SetValue(dialog.selectedVariable);
            }

            return;
        }
        else if ( instructionInfos.parameters[i].type == "globalvar" )
        {
            ChoixVariableDialog dialog(this, game.variables);
            if ( dialog.ShowModal() == 1 )
            {
                game.variables = dialog.variables;
                ParaEdit.at(i)->SetValue(dialog.selectedVariable);
            }

            return;
        }
    }
}

////////////////////////////////////////////////////////////
/// Modification paramètres
///
/// Mise à jour automatique global/local
////////////////////////////////////////////////////////////
void ChoixCondition::OnParamEdit( wxCommandEvent& event )
{
    //Plus besoin !
}

void ChoixCondition::OnOkBtClick( wxCommandEvent& event )
{
    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();
    const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(Type);

    if ( Type == "" )
        return;

    if (ParaEdit.size() < instructionInfos.parameters.size())
    {
        wxLogWarning(_("Trop peu de paramètres. Ceci peut être dû à un bug de Game Develop."));
        return;
    }

    //On ajoute les paramètres
    Param.clear();

    for ( unsigned int i = 0;i < instructionInfos.parameters.size();i++ )
    {
        Param.push_back( GDExpression(ParaEdit.at(i)->GetValue().mb_str()) );
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

TEST( Dialogues, ChoixCondition )
{
    wxLogNull log;
    Scene scene;
    Game jeu;
    vector < string > unused;
    //ChoixCondition Dialog(NULL, jeu, scene, unused);

    //Initialisation avec des valeurs
/*    Dialog.Type = "Collision";
    vector < string > Param;
    Param.push_back("objet 1");
    Param.push_back("objet 2");
    Dialog.Param = Param;

    Dialog.RefreshFromCondition();

    CHECK_EQUAL(Dialog.Loc, true);
    CHECK_EQUAL(Dialog.ParaEdit.at(0)->IsShown(), true);
    CHECK_EQUAL(Dialog.ParaEdit.at(1)->IsShown(), true);
    CHECK_EQUAL(Dialog.ParaEdit.at(2)->IsShown(), false);
    CHECK_EQUAL(Dialog.ParaEdit.at(3)->IsShown(), false);
    CHECK_EQUAL(Dialog.ParaEdit.at(4)->IsShown(), false);

    CHECK_EQUAL(static_cast<string>(Dialog.ParaEdit.at(0)->GetValue()), "objet 1");
    CHECK_EQUAL(static_cast<string>(Dialog.ParaEdit.at(1)->GetValue()), "objet 2");

    Dialog.Type = "KeyPressed";
    Dialog.RefreshFromCondition();
    CHECK_EQUAL(Dialog.ParaEdit.at(0)->IsShown(), true);
    CHECK_EQUAL(Dialog.ParaEdit.at(1)->IsShown(), false);


    Dialog.Type = "trucquinemarcherapas";
    Dialog.RefreshFromCondition();

    CHECK_EQUAL(Dialog.Loc, true);
    CHECK_EQUAL(Dialog.ParaEdit.at(0)->IsShown(), false);*/

}

void ChoixCondition::OnAideBtClick(wxCommandEvent& event)
{
    wxHelpController * help = new wxHelpController;
    help->Initialize( "aide.chm" );
    help->DisplaySection(23);
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
