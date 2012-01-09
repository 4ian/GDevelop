/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include "GDL/EditTextDialog.h"

//(*InternalHeaders(EditTextDialog)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/stc/stc.h>
#include "GDL/EditExpression.h"
#include "GDL/ExtensionBase.h"
#include "GDL/IDE/Dialogs/ChooseObject.h"
#include "GDL/IDE/Dialogs/ChooseLayer.h"
#include "GDL/IDE/Dialogs/ChooseVariableDialog.h"
#include <wx/textdlg.h>
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/CommonTools.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/gdTreeItemStringData.h"
#include "GDL/TreeItemStrExpressionInfoData.h"
#include "GDL/IDE/Dialogs/ChooseAutomatismDlg.h"
#include "GDL/IDE/AdvancedTextEntryDlg.h"
#include "GDL/HelpFileAccess.h"
#include "GDL/ExpressionsCorrectnessTesting.h"

//(*IdInit(EditTextDialog)
const long EditTextDialog::ID_CUSTOM1 = wxNewId();
const long EditTextDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long EditTextDialog::ID_BUTTON2 = wxNewId();
const long EditTextDialog::ID_BUTTON1 = wxNewId();
const long EditTextDialog::ID_BUTTON4 = wxNewId();
const long EditTextDialog::ID_STATICTEXT1 = wxNewId();
const long EditTextDialog::ID_TREECTRL1 = wxNewId();
const long EditTextDialog::ID_BUTTON10 = wxNewId();
const long EditTextDialog::ID_STATICTEXT4 = wxNewId();
const long EditTextDialog::ID_TREECTRL2 = wxNewId();
const long EditTextDialog::ID_BUTTON7 = wxNewId();
const long EditTextDialog::ID_STATICTEXT2 = wxNewId();
const long EditTextDialog::ID_BUTTON3 = wxNewId();
const long EditTextDialog::ID_STATICLINE2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditTextDialog,wxDialog)
	//(*EventTable(EditTextDialog)
	//*)
END_EVENT_TABLE()

EditTextDialog::EditTextDialog(wxWindow* parent, string texte, Game & game_, Scene & scene_) :
game(game_),
scene(scene_),
lastErrorPos(std::string::npos)
{
	//(*Initialize(EditTextDialog)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer8;
	wxBoxSizer* BoxSizer1;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;

	Create(parent, wxID_ANY, _("Editer le texte"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("wxID_ANY"));
	wxIcon FrameIcon;
	FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/texteicon.png"))));
	SetIcon(FrameIcon);
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer9->AddGrowableCol(0);
	FlexGridSizer9->AddGrowableRow(0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	TexteEdit = new wxStyledTextCtrl(this,ID_CUSTOM1,wxDefaultPosition,wxSize(460,110),0,_T("ID_CUSTOM1"));
	FlexGridSizer3->Add(TexteEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	errorTxt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Pas d\'erreurs."), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_LEFT|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	errorTxt->SetToolTip(_("Cliquer pour positionner le curseur sur l\'erreur."));
	FlexGridSizer3->Add(errorTxt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer8 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer8->AddGrowableCol(0);
	OkBt = new wxButton(this, ID_BUTTON2, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer8->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON1, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer8->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxButton(this, ID_BUTTON4, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer8->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Editer le texte"));
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(0);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer7->AddGrowableRow(1);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Propriétés des objets"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer7->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	ObjList = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxSize(195,177), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer7->Add(ObjList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	AddPropBt = new wxButton(this, ID_BUTTON10, _("Ajouter"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON10"));
	FlexGridSizer7->Add(AddPropBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer10->AddGrowableCol(0);
	FlexGridSizer10->AddGrowableRow(1);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Valeurs spéciales"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer10->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	ValList = new wxTreeCtrl(this, ID_TREECTRL2, wxDefaultPosition, wxSize(195,177), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL2"));
	FlexGridSizer10->Add(ValList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	AddFunctionBt = new wxButton(this, ID_BUTTON7, _("Ajouter"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON7"));
	FlexGridSizer10->Add(AddFunctionBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1->Add(FlexGridSizer10, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Add(BoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Expression numérique :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer11->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	InsertBt = new wxButton(this, ID_BUTTON3, _("Insérer une expression numérique"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	InsertBt->SetToolTip(_("Permet d\'insérer un calcul, ou la valeur d\'une variable"));
	FlexGridSizer11->Add(InsertBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer2->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&EditTextDialog::OnerrorTxtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditTextDialog::OnOkBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditTextDialog::OnAnnulerBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditTextDialog::OnhelpBtClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditTextDialog::OnObjListItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditTextDialog::OnObjListSelectionChanged);
	Connect(ID_BUTTON10,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditTextDialog::OnAddPropBtClick);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditTextDialog::OnTreeCtrl1ItemActivated);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditTextDialog::OnTreeCtrl1SelectionChanged);
	Connect(ID_BUTTON7,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditTextDialog::OnAddFunctionBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditTextDialog::OnInsertBtClick);
	//*)
	Connect(ID_CUSTOM1, wxEVT_STC_MODIFIED, (wxObjectEventFunction)&EditTextDialog::TextModified);
	Connect(ID_CUSTOM1, wxEVT_STC_UPDATEUI, (wxObjectEventFunction)&EditTextDialog::UpdateTextCtrl);

    //Prepare image lists
    imageListObj = new wxImageList( 16, 16 );
    imageListObj->Add(( wxBitmap( "res/actions/uneaction.png", wxBITMAP_TYPE_ANY ) ) );
    ObjList->AssignImageList( imageListObj );

    imageListVal = new wxImageList( 16, 16 );
    imageListVal->Add(( wxBitmap( "res/actions/uneaction.png", wxBITMAP_TYPE_ANY ) ) );
    ValList->AssignImageList( imageListVal );

    //Prepare lists
    ObjList->DeleteAllItems();
    ObjList->AddRoot( _( "Toutes les proprietés" ), 0 );

    ValList->DeleteAllItems();
    ValList->AddRoot( _( "Toutes les valeurs spéciales" ), 0 );

    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const vector < boost::shared_ptr<ExtensionBase> > extensions = extensionManager->GetExtensions();

    //Insert extension objects expressions
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.extensionsUsed.begin(),
                  game.extensionsUsed.end(),
                  extensions[i]->GetName()) == game.extensionsUsed.end() )
            continue;

	    vector<string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
	    vector<string> automatismsTypes = extensions[i]->GetAutomatismsTypes();

        wxTreeItemId extensionItem = ObjList->GetRootItem();

	    for(unsigned int j = 0;j<objectsTypes.size();++j)
	    {
            wxTreeItemId objectTypeItem =   objectsTypes[j] == "" ?
                                            ObjList->AppendItem(extensionItem, _("Tous les objets"), 0) :
                                            ObjList->AppendItem(extensionItem, _("Objet") + wxString(" ") + extensions[i]->GetObjectInfo(objectsTypes[j]).fullname,0) ;

            //Add each object expression
            std::map<string, StrExpressionInfos > allObjExpr = extensions[i]->GetAllStrExpressionsForObject(objectsTypes[j]);
            for(std::map<string, StrExpressionInfos>::const_iterator it = allObjExpr.begin(); it != allObjExpr.end(); ++it)
            {
                if ( it->second.shown )
                {
                    //Search and/or add group item
                    wxTreeItemIdValue cookie;
                    wxTreeItemId groupItem = ObjList->GetFirstChild(objectTypeItem, cookie);
                    while ( groupItem.IsOk() && ObjList->GetItemText(groupItem) != it->second.group )
                    {
                        groupItem = ObjList->GetNextSibling(groupItem);
                    }
                    if ( !groupItem.IsOk() ) groupItem = ObjList->AppendItem(objectTypeItem, it->second.group, 0);

                    //Add expression item
                    int IDimage = 0;
                    if ( it->second.smallicon.IsOk() )
                    {
                        imageListObj->Add(it->second.smallicon);
                        IDimage = imageListObj->GetImageCount()-1;
                    }

                    TreeItemStrExpressionInfoData * associatedData = new TreeItemStrExpressionInfoData(it->first, it->second);
                    ObjList->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
                }
            }
	    }

	    for(unsigned int j = 0;j<automatismsTypes.size();++j)
	    {
            wxTreeItemId automatismTypeItem =   automatismsTypes[j] == "" ?
                                            ObjList->AppendItem(extensionItem, _("Tous les objets"), 0) :
                                            ObjList->AppendItem(extensionItem, _("Automatisme") + wxString(" ") + extensions[i]->GetAutomatismInfo(automatismsTypes[j]).fullname,0) ;

            //Add each automatism expression
            std::map<string, StrExpressionInfos > allAutoExpr = extensions[i]->GetAllStrExpressionsForAutomatism(automatismsTypes[j]);
            for(std::map<string, StrExpressionInfos>::const_iterator it = allAutoExpr.begin(); it != allAutoExpr.end(); ++it)
            {
                if ( it->second.shown )
                {
                    //Search and/or add group item
                    wxTreeItemIdValue cookie;
                    wxTreeItemId groupItem = ObjList->GetFirstChild(automatismTypeItem, cookie);
                    while ( groupItem.IsOk() && ObjList->GetItemText(groupItem) != it->second.group )
                    {
                        groupItem = ObjList->GetNextSibling(groupItem);
                    }
                    if ( !groupItem.IsOk() ) groupItem = ObjList->AppendItem(automatismTypeItem, it->second.group, 0);

                    //Add expression item
                    int IDimage = 0;
                    if ( it->second.smallicon.IsOk() )
                    {
                        imageListObj->Add(it->second.smallicon);
                        IDimage = imageListObj->GetImageCount()-1;
                    }

                    TreeItemStrExpressionInfoData * associatedData = new TreeItemStrExpressionInfoData(it->first, it->second);
                    ObjList->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
                }
            }
	    }

        //Add each expression
        extensionItem = ValList->GetRootItem();

        std::map<string, StrExpressionInfos > allExpr = extensions[i]->GetAllStrExpressions();
        for(std::map<string, StrExpressionInfos>::const_iterator it = allExpr.begin(); it != allExpr.end(); ++it)
        {
            if ( it->second.shown )
            {
                //Search and/or add group item
                wxTreeItemIdValue cookie;
                wxTreeItemId groupItem = ValList->GetFirstChild(extensionItem, cookie);
                while ( groupItem.IsOk() && ValList->GetItemText(groupItem) != it->second.group )
                {
                    groupItem = ValList->GetNextSibling(groupItem);
                }
                if ( !groupItem.IsOk() ) groupItem = ValList->AppendItem(extensionItem, it->second.group, 0);

                //Add expression item
                int IDimage = 0;
                if ( it->second.smallicon.IsOk() )
                {
                    imageListVal->Add(it->second.smallicon);
                    IDimage = imageListVal->GetImageCount()-1;
                }

                TreeItemStrExpressionInfoData * associatedData = new TreeItemStrExpressionInfoData(it->first, it->second);
                ValList->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
            }
        }
	}

    ObjList->Expand(ObjList->GetRootItem());
    ValList->Expand(ValList->GetRootItem());

	TexteEdit->SetLexer(wxSTC_LEX_CPP);
	TexteEdit->StyleSetForeground(4, *wxBLACK); //Numbers
	TexteEdit->StyleSetForeground(10, *wxRED); //Operators
	TexteEdit->StyleSetForeground(6, *wxBLUE); //String
	TexteEdit->StyleSetForeground(5, wxColour(0,28,158)); //(Key)Word
	TexteEdit->StyleSetBackground(34, wxColour(119, 255, 119)); //Brace
	TexteEdit->StyleSetBackground(35, wxColour(255, 119, 119)); //Brace

    //Prepare keyword highlighting
    std::string keywords;
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.extensionsUsed.begin(),
                  game.extensionsUsed.end(),
                  extensions[i]->GetName()) == game.extensionsUsed.end() )
            continue;

        //Add keywords of static expressions
	    const std::map<std::string, ExpressionInfos > & allExprs = extensions[i]->GetAllExpressions();
        for(std::map<std::string, ExpressionInfos >::const_iterator it = allExprs.begin(); it != allExprs.end(); ++it)
	        keywords += " "+it->first;

	    const std::map<std::string, StrExpressionInfos > & allStrExprs = extensions[i]->GetAllStrExpressions();
        for(std::map<std::string, StrExpressionInfos >::const_iterator it = allStrExprs.begin(); it != allStrExprs.end(); ++it)
	        keywords += " "+it->first;

        //Add keywords of objects expressions
	    vector<string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
        for (unsigned int j = 0;j<objectsTypes.size();++j)
        {
            const std::map<std::string, ExpressionInfos > & allExprs = extensions[i]->GetAllExpressionsForObject(objectsTypes[j]);
            for(std::map<std::string, ExpressionInfos >::const_iterator it = allExprs.begin(); it != allExprs.end(); ++it)
                keywords += " "+it->first;

            const std::map<std::string, StrExpressionInfos > & allStrExprs = extensions[i]->GetAllStrExpressionsForObject(objectsTypes[j]);
            for(std::map<std::string, StrExpressionInfos >::const_iterator it = allStrExprs.begin(); it != allStrExprs.end(); ++it)
                keywords += " "+it->first;
        }

        //Add keywords of automatisms expressions
	    vector<string> automatismsTypes = extensions[i]->GetAutomatismsTypes();
        for (unsigned int j = 0;j<automatismsTypes.size();++j)
        {
            const std::map<std::string, ExpressionInfos > & allExprs = extensions[i]->GetAllExpressionsForAutomatism(automatismsTypes[j]);
            for(std::map<std::string, ExpressionInfos >::const_iterator it = allExprs.begin(); it != allExprs.end(); ++it)
                keywords += " "+it->first;

            const std::map<std::string, StrExpressionInfos > & allStrExprs = extensions[i]->GetAllStrExpressionsForAutomatism(automatismsTypes[j]);
            for(std::map<std::string, StrExpressionInfos >::const_iterator it = allStrExprs.begin(); it != allStrExprs.end(); ++it)
                keywords += " "+it->first;
        }
	}
	TexteEdit->SetKeyWords(0, keywords);
    TexteEdit->SetWrapMode(wxSTC_WRAP_WORD);
    TexteEdit->SetMarginLeft(1);

	TexteEdit->SetText(texte);
	if ( texte.empty() ) TexteEdit->SetText("\"\"");
}

EditTextDialog::~EditTextDialog()
{
	//(*Destroy(EditTextDialog)
	//*)
}

/**
 * Syntax highlighting
 */
void EditTextDialog::UpdateTextCtrl(wxStyledTextEvent& event)
{
    char currentChar = TexteEdit->GetCharAt(TexteEdit->GetCurrentPos());
    if ( currentChar != '(' && currentChar != ')')
    {
        TexteEdit->BraceHighlight(wxSTC_INVALID_POSITION, wxSTC_INVALID_POSITION);
        return;
    }

    int otherBrace = TexteEdit->BraceMatch(TexteEdit->GetCurrentPos());

    if ( otherBrace != wxSTC_INVALID_POSITION)
        TexteEdit->BraceHighlight(TexteEdit->GetCurrentPos(), otherBrace);
    else
        TexteEdit->BraceBadLight(TexteEdit->GetCurrentPos());
}

void EditTextDialog::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditTextDialog::OnOkBtClick(wxCommandEvent& event)
{
    returnedText = string(TexteEdit->GetValue().mb_str());

    CallbacksForExpressionCorrectnessTesting callbacks(game, scene);
    GDExpressionParser expressionParser(returnedText);

    if ( !expressionParser.ParseTextExpression(game, scene, callbacks) )
    {
        if ( wxMessageBox(_("L'expression est mal formulée. Êtes vous sûr de vouloir valider cette expression ?"), _("L'expression contient une ou plusieurs erreurs."), wxYES_NO | wxICON_EXCLAMATION, this) == wxNO )
            return;
    }

    EndModal(1);
}

/**
 * Show a dialog for completing a parameter
 */
string EditTextDialog::ShowParameterDialog(const ParameterInfo & parameterInfo, bool & userCancelled, std::string objectNameAssociated)
{
    if ( parameterInfo.type == "expression" )
    {
        AdvancedTextEntryDlg dialog(this, string(_("Paramètre").mb_str()), parameterInfo.description, "0", AdvancedTextEntryDlg::MathExpression, &game, &scene);
        if ( dialog.ShowModal() == wxOK )
            return dialog.text;
        else
            userCancelled = true;
    }
    else if ( parameterInfo.type == "object" )
    {
        ChooseObject Dialog(this, game, scene, true, parameterInfo.supplementaryInformation);
        if ( Dialog.ShowModal() == 0 ) return "";

        return Dialog.objectChosen;
    }
    else if ( parameterInfo.type == "string" )
    {
        AdvancedTextEntryDlg dialog(this, string(_("Paramètre").mb_str()), parameterInfo.description, "\"\"", AdvancedTextEntryDlg::TextExpression, &game, &scene);
        if ( dialog.ShowModal() == wxOK )
            return dialog.text;
        else
            userCancelled = true;
    }
    else if ( parameterInfo.type == "layer" )
    {
        ChooseLayer dialog(this, scene.initialLayers);
        if ( dialog.ShowModal() == 0 ) return "";

        return dialog.layerChosen;
    }
    else if ( parameterInfo.type == "scenevar" )
    {
        ChooseVariableDialog dialog(this, scene.variables);
        if ( dialog.ShowModal() == 1 )
        {
            scene.variables = dialog.variables;
            return dialog.selectedVariable;
        }

        return "";
    }
    else if ( parameterInfo.type == "globalvar" )
    {
        ChooseVariableDialog dialog(this, game.variables);
        if ( dialog.ShowModal() == 1 )
        {
            game.variables = dialog.variables;
            return dialog.selectedVariable;
        }

        return "";
    }
    else if ( parameterInfo.type == "objectvar" )
    {
        std::vector<ObjSPtr>::iterator sceneObject = std::find_if(scene.initialObjects.begin(), scene.initialObjects.end(), std::bind2nd(ObjectHasName(), objectNameAssociated));
        std::vector<ObjSPtr>::iterator globalObject = std::find_if(game.globalObjects.begin(), game.globalObjects.end(), std::bind2nd(ObjectHasName(), objectNameAssociated));

        ObjSPtr object = boost::shared_ptr<Object> ();

        if ( sceneObject != scene.initialObjects.end() )
            object = *sceneObject;
        else if ( globalObject != game.globalObjects.end() )
            object = *globalObject;
        else
            return string(wxGetTextFromUser(parameterInfo.description, _("Variable"), "", this).mb_str());

        ChooseVariableDialog dialog(this, object->variablesObjet);
        if ( dialog.ShowModal() == 1 )
        {
            object->variablesObjet = dialog.variables;
            return dialog.selectedVariable;
        }

        return "";
    }
    else if ( parameterInfo.type == "camera" )
    {
        string param = static_cast<string> (wxGetTextFromUser(parameterInfo.description, _("Numéro de la caméra"), "0", this));
        return param;
    }
    else if ( parameterInfo.type == "" )
    {
        string param = static_cast<string> (wxGetTextFromUser(parameterInfo.description, _("Paramètre"), "", this));
        return param;
    }

    return "";
}

/**
 * Insert a numeric expression
 */
void EditTextDialog::OnInsertBtClick(wxCommandEvent& event)
{
    EditExpression dialog(this, "", game, scene);
    dialog.ShowModal();

    TexteEdit->AddText("ToString("+dialog.expression+")");
}

/**
 * Real time expression checking
 */
void EditTextDialog::TextModified(wxStyledTextEvent& event)
{
    string text = string(TexteEdit->GetValue().mb_str());

    CallbacksForExpressionCorrectnessTesting callbacks(game, scene);
    GDExpressionParser expressionParser(text);
    if ( !expressionParser.ParseTextExpression(game, scene, callbacks) )
    {
        errorTxt->SetLabel(expressionParser.firstErrorStr);
        lastErrorPos = expressionParser.firstErrorPos;
    }
    else
    {
        errorTxt->SetLabel(_("Pas d'erreurs."));
        lastErrorPos = std::string::npos;
    }


    errorTxt->Refresh(); //Need to call manually update.
}

void EditTextDialog::OnAddPropBtClick(wxCommandEvent& event)
{
    if ( !itemObj.IsOk() ) return;

    TreeItemStrExpressionInfoData * infos = dynamic_cast<TreeItemStrExpressionInfoData*>(ObjList->GetItemData(itemObj));
    if ( infos != NULL )
    {
        if ( infos->GetStrExpressionInfos().parameters.empty() ) return; //Not even a parameter for the object ?

        bool cancelled = false;
        string object = ShowParameterDialog(infos->GetStrExpressionInfos().parameters[0], cancelled);
        if ( cancelled ) return;

        string parametersStr, automatismStr;
        for (unsigned int i = 1;i<infos->GetStrExpressionInfos().parameters.size();++i)
        {
            if ( i == 1 && infos->GetStrExpressionInfos().parameters[i].type == "automatism")
            {
                ChooseAutomatismDlg dialog(this, game, scene, object, infos->GetStrExpressionInfos().parameters[i].supplementaryInformation);
                if ( dialog.ShowModal() == 1 )
                    automatismStr = dialog.automatismChosen+"::";
            }
            else
            {
                if ( !parametersStr.empty() ) parametersStr += ",";
                parametersStr += ShowParameterDialog(infos->GetStrExpressionInfos().parameters[i], cancelled, object);
                if ( cancelled ) return;
            }
        }

        TexteEdit->AddText(ReplaceSpacesByTildes(object)+"."+automatismStr+infos->GetName()+"("+parametersStr+")");
        return;
    }
}

void EditTextDialog::OnObjListItemActivated(wxTreeEvent& event)
{
    itemObj = event.GetItem();
    wxCommandEvent uselessEvent;
    OnAddPropBtClick(uselessEvent);
}

void EditTextDialog::OnObjListSelectionChanged(wxTreeEvent& event)
{
    itemObj = event.GetItem();
}

void EditTextDialog::OnAddFunctionBtClick(wxCommandEvent& event)
{
    if ( !itemVal.IsOk() ) return;

    TreeItemStrExpressionInfoData * infos = dynamic_cast<TreeItemStrExpressionInfoData*>(ValList->GetItemData(itemVal));
    if ( infos != NULL )
    {
        bool cancelled = false;

        string parametersStr;
        for (unsigned int i = 0;i<infos->GetStrExpressionInfos().parameters.size();++i)
        {
            if ( !parametersStr.empty() ) parametersStr += ",";
            parametersStr += ShowParameterDialog(infos->GetStrExpressionInfos().parameters[i], cancelled);
            if ( cancelled ) return;
        }

        TexteEdit->AddText(infos->GetName()+"("+parametersStr+")");
        return;
    }
}

void EditTextDialog::OnTreeCtrl1ItemActivated(wxTreeEvent& event)
{
    itemVal = event.GetItem();
    wxCommandEvent uselessEvent;
    OnAddFunctionBtClick(uselessEvent);
}

void EditTextDialog::OnTreeCtrl1SelectionChanged(wxTreeEvent& event)
{
    itemVal = event.GetItem();
}

void EditTextDialog::OnerrorTxtClick(wxCommandEvent& event)
{
    if ( lastErrorPos != std::string::npos )
        TexteEdit->GotoPos(lastErrorPos);
}

void EditTextDialog::OnhelpBtClick(wxCommandEvent& event)
{
    HelpFileAccess::GetInstance()->DisplaySection(55);
}

#endif
