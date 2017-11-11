/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
//(*InternalHeaders(EditStrExpressionDialog)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <algorithm>
#include <wx/msgdlg.h>
#include <wx/settings.h>
#include <wx/stc/stc.h>
#include <wx/textdlg.h>
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Dialogs/EditExpressionDialog.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDCore/IDE/Dialogs/ChooseLayerDialog.h"
#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/IDE/Dialogs/ChooseBehaviorDialog.h"
#include "GDCore/IDE/Events/ExpressionsCorrectnessTesting.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCore/IDE/Dialogs/AdvancedEntryDialog.h"
#include "GDCore/IDE/wxTools/TreeItemExpressionMetadata.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "EditStrExpressionDialog.h"

using namespace std;

namespace gd
{

//(*IdInit(EditStrExpressionDialog)
const long EditStrExpressionDialog::ID_CUSTOM1 = wxNewId();
const long EditStrExpressionDialog::ID_BUTTON2 = wxNewId();
const long EditStrExpressionDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long EditStrExpressionDialog::ID_STATICBITMAP5 = wxNewId();
const long EditStrExpressionDialog::ID_HYPERLINKCTRL2 = wxNewId();
const long EditStrExpressionDialog::ID_PANEL1 = wxNewId();
const long EditStrExpressionDialog::ID_TREECTRL1 = wxNewId();
const long EditStrExpressionDialog::ID_BUTTON10 = wxNewId();
const long EditStrExpressionDialog::ID_PANEL2 = wxNewId();
const long EditStrExpressionDialog::ID_TREECTRL2 = wxNewId();
const long EditStrExpressionDialog::ID_BUTTON7 = wxNewId();
const long EditStrExpressionDialog::ID_PANEL3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditStrExpressionDialog,wxDialog)
	//(*EventTable(EditStrExpressionDialog)
	//*)
END_EVENT_TABLE()

EditStrExpressionDialog::EditStrExpressionDialog(wxWindow* parent, gd::String expression, gd::Project & project_, gd::Layout & layout_) :
    project(project_),
    layout(layout_),
    lastErrorPos(gd::String::npos)
{
	//(*Initialize(EditStrExpressionDialog)
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Edit the text"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("wxID_ANY"));
	wxIcon FrameIcon;
	FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/texteicon.png"))));
	SetIcon(FrameIcon);
	mgr = new wxAuiManager(this, wxAUI_MGR_DEFAULT);
	centerPanel = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer9->AddGrowableCol(0);
	FlexGridSizer9->AddGrowableRow(0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	TexteEdit = new wxStyledTextCtrl(centerPanel,ID_CUSTOM1,wxDefaultPosition,wxSize(300,28),0,_T("ID_CUSTOM1"));
	FlexGridSizer3->Add(TexteEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	OkBt = new wxButton(centerPanel, ID_BUTTON2, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(OkBt, 1, wxALL|wxALIGN_BOTTOM|wxALIGN_CENTER_HORIZONTAL, 5);
	errorTxt = new wxHyperlinkCtrl(centerPanel, ID_HYPERLINKCTRL1, _("No errors."), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_LEFT|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	errorTxt->SetToolTip(_("Click to position cursor on the error."));
	FlexGridSizer3->Add(errorTxt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(centerPanel, ID_STATICBITMAP5, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP5"));
	FlexGridSizer17->Add(StaticBitmap2, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(centerPanel, ID_HYPERLINKCTRL2, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	HyperlinkCtrl1->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer17, 1, wxRIGHT|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	centerPanel->SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(centerPanel);
	FlexGridSizer1->SetSizeHints(centerPanel);
	mgr->AddPane(centerPanel, wxAuiPaneInfo().Name(_T("centerPane")).DefaultPane().Caption(_("Pane caption")).CaptionVisible(false).CloseButton(false).Center().DockFixed().Floatable(false).Movable(false).PaneBorder(false));
	objectsFunctionsPanel = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer7->AddGrowableRow(0);
	ObjList = new wxTreeCtrl(objectsFunctionsPanel, ID_TREECTRL1, wxDefaultPosition, wxSize(195,177), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer7->Add(ObjList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	AddPropBt = new wxButton(objectsFunctionsPanel, ID_BUTTON10, _("Add"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON10"));
	FlexGridSizer7->Add(AddPropBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	objectsFunctionsPanel->SetSizer(FlexGridSizer7);
	FlexGridSizer7->Fit(objectsFunctionsPanel);
	FlexGridSizer7->SetSizeHints(objectsFunctionsPanel);
	mgr->AddPane(objectsFunctionsPanel, wxAuiPaneInfo().Name(_T("objectsFunctionsPane")).DefaultPane().Caption(_("Objects functions")).CaptionVisible().Bottom());
	freeFunctionsPanel = new wxPanel(this, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer10->AddGrowableCol(0);
	FlexGridSizer10->AddGrowableRow(0);
	ValList = new wxTreeCtrl(freeFunctionsPanel, ID_TREECTRL2, wxDefaultPosition, wxSize(195,177), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL2"));
	FlexGridSizer10->Add(ValList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	AddFunctionBt = new wxButton(freeFunctionsPanel, ID_BUTTON7, _("Add"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON7"));
	FlexGridSizer10->Add(AddFunctionBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	freeFunctionsPanel->SetSizer(FlexGridSizer10);
	FlexGridSizer10->Fit(freeFunctionsPanel);
	FlexGridSizer10->SetSizeHints(freeFunctionsPanel);
	mgr->AddPane(freeFunctionsPanel, wxAuiPaneInfo().Name(_T("freeFunctionsPane")).DefaultPane().Caption(_("Other functions")).CaptionVisible().Bottom());
	mgr->Update();
	Center();

	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditStrExpressionDialog::OnOkBtClick);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&EditStrExpressionDialog::OnerrorTxtClick);
	Connect(ID_HYPERLINKCTRL2,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&EditStrExpressionDialog::OnhelpBtClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditStrExpressionDialog::OnObjListItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditStrExpressionDialog::OnObjListSelectionChanged);
	Connect(ID_BUTTON10,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditStrExpressionDialog::OnAddPropBtClick);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditStrExpressionDialog::OnTreeCtrl1ItemActivated);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditStrExpressionDialog::OnTreeCtrl1SelectionChanged);
	Connect(ID_BUTTON7,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditStrExpressionDialog::OnAddFunctionBtClick);
	//*)
	Connect(ID_CUSTOM1, wxEVT_STC_MODIFIED, (wxObjectEventFunction)&EditStrExpressionDialog::TextModified);
	Connect(ID_CUSTOM1, wxEVT_STC_UPDATEUI, (wxObjectEventFunction)&EditStrExpressionDialog::UpdateTextCtrl);

    //Prepare image lists
    imageListObj = new wxImageList( 16, 16 );
    imageListObj->Add(( wxBitmap( "res/actions/uneaction.png", wxBITMAP_TYPE_ANY ) ) );
    ObjList->AssignImageList( imageListObj );

    imageListVal = new wxImageList( 16, 16 );
    imageListVal->Add(( wxBitmap( "res/actions/uneaction.png", wxBITMAP_TYPE_ANY ) ) );
    ValList->AssignImageList( imageListVal );

    //Prepare lists
    ObjList->DeleteAllItems();
    ObjList->AddRoot( _( "All properties" ), 0 );

    ValList->DeleteAllItems();
    ValList->AddRoot( _( "All special values" ), 0 );

    //Insert extension objects expressions
    const vector < std::shared_ptr<PlatformExtension> > extensions = project.GetCurrentPlatform().GetAllPlatformExtensions();
	for (std::size_t i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(project.GetUsedExtensions().begin(),
                  project.GetUsedExtensions().end(),
                  extensions[i]->GetName()) == project.GetUsedExtensions().end() )
            continue;

	    std::vector<gd::String>  objectsTypes = extensions[i]->GetExtensionObjectsTypes();
	    std::vector<gd::String>  behaviorsTypes = extensions[i]->GetBehaviorsTypes();

        wxTreeItemId extensionItem = ObjList->GetRootItem();

	    for(std::size_t j = 0;j<objectsTypes.size();++j)
	    {
            wxTreeItemId objectTypeItem =   objectsTypes[j] == "" ?
                                            ObjList->AppendItem(extensionItem, _("All objects"), 0) :
                                            ObjList->AppendItem(extensionItem, _("Object") + wxString(" ") + extensions[i]->GetObjectMetadata(objectsTypes[j]).GetFullName(), 0) ;

            //Add each object expression
            std::map<gd::String, gd::ExpressionMetadata > allObjExpr = extensions[i]->GetAllStrExpressionsForObject(objectsTypes[j]);
            for(std::map<gd::String, gd::ExpressionMetadata>::const_iterator it = allObjExpr.begin(); it != allObjExpr.end(); ++it)
            {
                if ( it->second.IsShown() )
                {
                    //Search and/or add group item
                    wxTreeItemIdValue cookie;
                    wxTreeItemId groupItem = ObjList->GetFirstChild(objectTypeItem, cookie);
                    while ( groupItem.IsOk() && ObjList->GetItemText(groupItem) != it->second.GetGroup())
                    {
                        groupItem = ObjList->GetNextSibling(groupItem);
                    }
                    if ( !groupItem.IsOk() ) groupItem = ObjList->AppendItem(objectTypeItem, it->second.GetGroup(), 0);

                    //Add expression item
                    int IDimage = 0;
                    if ( it->second.GetBitmapIcon().IsOk() )
                    {
                        imageListObj->Add(it->second.GetBitmapIcon());
                        IDimage = imageListObj->GetImageCount()-1;
                    }

                    gd::TreeItemExpressionMetadata * associatedData = new gd::TreeItemExpressionMetadata(it->first, it->second);
                    ObjList->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
                }
            }
	    }

	    for(std::size_t j = 0;j<behaviorsTypes.size();++j)
	    {
            wxTreeItemId behaviorTypeItem =   behaviorsTypes[j] == "" ?
                                            ObjList->AppendItem(extensionItem, _("All objects"), 0) :
                                            ObjList->AppendItem(extensionItem, _("Behavior") + wxString(" ") + extensions[i]->GetBehaviorMetadata(behaviorsTypes[j]).GetFullName(), 0) ;

            //Add each behavior expression
            std::map<gd::String, gd::ExpressionMetadata > allAutoExpr = extensions[i]->GetAllStrExpressionsForBehavior(behaviorsTypes[j]);
            for(std::map<gd::String, gd::ExpressionMetadata>::const_iterator it = allAutoExpr.begin(); it != allAutoExpr.end(); ++it)
            {
                if ( it->second.IsShown() )
                {
                    //Search and/or add group item
                    wxTreeItemIdValue cookie;
                    wxTreeItemId groupItem = ObjList->GetFirstChild(behaviorTypeItem, cookie);
                    while ( groupItem.IsOk() && ObjList->GetItemText(groupItem) != it->second.GetGroup())
                    {
                        groupItem = ObjList->GetNextSibling(groupItem);
                    }
                    if ( !groupItem.IsOk() ) groupItem = ObjList->AppendItem(behaviorTypeItem, it->second.GetGroup(), 0);

                    //Add expression item
                    int IDimage = 0;
                    if ( it->second.GetBitmapIcon().IsOk() )
                    {
                        imageListObj->Add(it->second.GetBitmapIcon());
                        IDimage = imageListObj->GetImageCount()-1;
                    }

                    gd::TreeItemExpressionMetadata * associatedData = new gd::TreeItemExpressionMetadata(it->first, it->second);
                    ObjList->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
                }
            }
	    }

        //Add each expression
        extensionItem = ValList->GetRootItem();

        std::map<gd::String, gd::ExpressionMetadata > allExpr = extensions[i]->GetAllStrExpressions();
        for(std::map<gd::String, gd::ExpressionMetadata>::const_iterator it = allExpr.begin(); it != allExpr.end(); ++it)
        {
            if ( it->second.IsShown() )
            {
                //Search and/or add group item
                wxTreeItemIdValue cookie;
                wxTreeItemId groupItem = ValList->GetFirstChild(extensionItem, cookie);
                while ( groupItem.IsOk() && ValList->GetItemText(groupItem) != it->second.GetGroup())
                {
                    groupItem = ValList->GetNextSibling(groupItem);
                }
                if ( !groupItem.IsOk() ) groupItem = ValList->AppendItem(extensionItem, it->second.GetGroup(), 0);

                //Add expression item
                int IDimage = 0;
                if ( it->second.GetBitmapIcon().IsOk() )
                {
                    imageListVal->Add(it->second.GetBitmapIcon());
                    IDimage = imageListVal->GetImageCount()-1;
                }

                gd::TreeItemExpressionMetadata * associatedData = new gd::TreeItemExpressionMetadata(it->first, it->second);
                ValList->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
            }
        }
	}

    ObjList->Expand(ObjList->GetRootItem());
    ValList->Expand(ValList->GetRootItem());

	TexteEdit->SetLexer(wxSTC_LEX_CPP);
    TexteEdit->StyleSetFont(wxSTC_STYLE_DEFAULT, gd::EventsRenderingHelper::Get()->GetFont());
	TexteEdit->StyleClearAll();

	TexteEdit->StyleSetForeground(4, *wxBLACK); //Numbers
	TexteEdit->StyleSetForeground(10, *wxRED); //Operators
	TexteEdit->StyleSetForeground(6, *wxBLUE); //String
	TexteEdit->StyleSetForeground(5, wxColour(0,28,158)); //(Key)Word
	TexteEdit->StyleSetBackground(34, wxColour(119, 255, 119)); //Brace
	TexteEdit->StyleSetBackground(35, wxColour(255, 119, 119)); //Brace

    //Prepare keyword highlighting
    gd::String keywords;
	for (std::size_t i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(project.GetUsedExtensions().begin(),
                  project.GetUsedExtensions().end(),
                  extensions[i]->GetName()) == project.GetUsedExtensions().end() )
            continue;

        //Add keywords of static expressions
	    const std::map<gd::String, gd::ExpressionMetadata > & allExprs = extensions[i]->GetAllExpressions();
        for(std::map<gd::String, gd::ExpressionMetadata >::const_iterator it = allExprs.begin(); it != allExprs.end(); ++it)
	        keywords += " "+it->first;

	    const std::map<gd::String, gd::ExpressionMetadata > & allStrExprs = extensions[i]->GetAllStrExpressions();
        for(std::map<gd::String, gd::ExpressionMetadata >::const_iterator it = allStrExprs.begin(); it != allStrExprs.end(); ++it)
	        keywords += " "+it->first;

        //Add keywords of objects expressions
	    std::vector<gd::String> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
        for (std::size_t j = 0;j<objectsTypes.size();++j)
        {
            const std::map<gd::String, gd::ExpressionMetadata > & allExprs = extensions[i]->GetAllExpressionsForObject(objectsTypes[j]);
            for(std::map<gd::String, gd::ExpressionMetadata >::const_iterator it = allExprs.begin(); it != allExprs.end(); ++it)
                keywords += " "+it->first;

            const std::map<gd::String, gd::ExpressionMetadata > & allStrExprs = extensions[i]->GetAllStrExpressionsForObject(objectsTypes[j]);
            for(std::map<gd::String, gd::ExpressionMetadata >::const_iterator it = allStrExprs.begin(); it != allStrExprs.end(); ++it)
                keywords += " "+it->first;
        }

        //Add keywords of behaviors expressions
	    std::vector<gd::String> behaviorsTypes = extensions[i]->GetBehaviorsTypes();
        for (std::size_t j = 0;j<behaviorsTypes.size();++j)
        {
            const std::map<gd::String, gd::ExpressionMetadata > & allExprs = extensions[i]->GetAllExpressionsForBehavior(behaviorsTypes[j]);
            for(std::map<gd::String, gd::ExpressionMetadata >::const_iterator it = allExprs.begin(); it != allExprs.end(); ++it)
                keywords += " "+it->first;

            const std::map<gd::String, gd::ExpressionMetadata > & allStrExprs = extensions[i]->GetAllStrExpressionsForBehavior(behaviorsTypes[j]);
            for(std::map<gd::String, gd::ExpressionMetadata >::const_iterator it = allStrExprs.begin(); it != allStrExprs.end(); ++it)
                keywords += " "+it->first;
        }
	}
	TexteEdit->SetKeyWords(0, keywords);
    TexteEdit->SetWrapMode(wxSTC_WRAP_WORD);
    TexteEdit->SetMarginLeft(1);

    mgr->GetArtProvider()->SetColor(wxAUI_DOCKART_SASH_COLOUR, wxSystemSettings::GetColour(wxSYS_COLOUR_MENU));
    mgr->GetArtProvider()->SetColor(wxAUI_DOCKART_BACKGROUND_COLOUR, wxSystemSettings::GetColour(wxSYS_COLOUR_MENU));
	mgr->GetPane(centerPanel).MinSize(450,50).BestSize(450,50);
	mgr->GetPane(objectsFunctionsPanel).MinSize(200,300);
	mgr->GetPane(freeFunctionsPanel).MinSize(200,300);
	mgr->Update();
	#if defined(WINDOWS)
	SetSize(580,500); //Values tuned for looking best on Windows
	#else
	SetSize(580,500);
	#endif

	TexteEdit->SetText(expression);
	if ( expression.empty() ) TexteEdit->SetText("\"\"");
}

EditStrExpressionDialog::~EditStrExpressionDialog()
{
	//(*Destroy(EditStrExpressionDialog)
	//*)
	mgr->UnInit();
}

/**
 * Syntax highlighting
 */
void EditStrExpressionDialog::UpdateTextCtrl(wxStyledTextEvent& event)
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

void EditStrExpressionDialog::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditStrExpressionDialog::OnOkBtClick(wxCommandEvent& event)
{
    returnedExpression = TexteEdit->GetValue();

    gd::CallbacksForExpressionCorrectnessTesting callbacks(project, layout);
    gd::ExpressionParser expressionParser(returnedExpression);

    if ( !expressionParser.ParseStringExpression(project.GetCurrentPlatform(), project, layout, callbacks) )
    {
        if ( wxMessageBox(_("The expression is malformed. Are you sur you want to validate this expression \?"), _("The expression contains one or more errors."), wxYES_NO | wxICON_EXCLAMATION, this) == wxNO )
            return;
    }

    EndModal(1);
}

/**
 * Show a dialog for completing a parameter
 */
gd::String EditStrExpressionDialog::ShowParameterDialog(const gd::ParameterMetadata & parameterMetadata, bool & userCancelled, gd::String objectNameAssociated)
{
    if ( parameterMetadata.type == "expression" )
    {
        gd::AdvancedTextEntryDialog dialog(this, _("Parameter"), parameterMetadata.description, "0", gd::AdvancedTextEntryDialog::MathExpression, &project, &layout);
        if ( dialog.ShowModal() == wxOK )
            return dialog.text;
        else
            userCancelled = true;
    }
    else if ( gd::ParameterMetadata::IsObject(parameterMetadata.type) )
    {
        gd::ChooseObjectDialog dialog(this, project, layout, true, parameterMetadata.supplementaryInformation);
        if ( dialog.ShowModal() == 0 ) return "";

        return dialog.GetChosenObject();
    }
    else if ( parameterMetadata.type == "string" )
    {
        gd::AdvancedTextEntryDialog dialog(this, _("Parameter"), parameterMetadata.description, "\"\"", gd::AdvancedTextEntryDialog::TextExpression, &project, &layout);
        if ( dialog.ShowModal() == wxOK )
            return dialog.text;
        else
            userCancelled = true;
    }
    else if ( parameterMetadata.type == "layer" )
    {
        gd::ChooseLayerDialog dialog(this, layout);
        if ( dialog.ShowModal() == 0 ) return "";

        return dialog.GetChosenLayer();
    }
    else if ( parameterMetadata.type == "scenevar" )
    {
        gd::ChooseVariableDialog dialog(this, layout.GetVariables());
        dialog.SetAssociatedLayout(&project, &layout);
        if ( dialog.ShowModal() == 1 )
            return dialog.GetSelectedVariable();

        return "";
    }
    else if ( parameterMetadata.type == "globalvar" )
    {
        gd::ChooseVariableDialog dialog(this, project.GetVariables());
        dialog.SetAssociatedProject(&project);
        if ( dialog.ShowModal() == 1 )
            return dialog.GetSelectedVariable();

        return "";
    }
    else if ( parameterMetadata.type == "objectvar" )
    {
        gd::Object * object = NULL;

        if ( layout.HasObjectNamed(objectNameAssociated) )
            object = &layout.GetObject(objectNameAssociated);
        else if ( project.HasObjectNamed(objectNameAssociated) )
            object = &project.GetObject(objectNameAssociated);
        else
            return wxGetTextFromUser(parameterMetadata.description, _("Variable"), "", this);

        gd::ChooseVariableDialog dialog(this, object->GetVariables());
        dialog.SetAssociatedObject(&project, &layout, object);
        if ( dialog.ShowModal() == 1 )
            return dialog.GetSelectedVariable();

        return "";
    }
    else if ( parameterMetadata.type == "camera" )
    {
        gd::String param = wxGetTextFromUser(parameterMetadata.description, _("Camera number"), "0", this);
        return param;
    }
    else if ( parameterMetadata.type == "" )
    {
        gd::String param = wxGetTextFromUser(parameterMetadata.description, _("Parameter"), "", this);
        return param;
    }

    return "";
}

/**
 * Insert a numeric expression
 */
void EditStrExpressionDialog::OnInsertBtClick(wxCommandEvent& event)
{
    EditExpressionDialog dialog(this, "", project, layout);
    dialog.ShowModal();

    TexteEdit->AddText("ToString("+dialog.GetExpression()+")");
}

/**
 * Real time expression checking
 */
void EditStrExpressionDialog::TextModified(wxStyledTextEvent& event)
{
    gd::String text = TexteEdit->GetValue();

    gd::CallbacksForExpressionCorrectnessTesting callbacks(project, layout);
    gd::ExpressionParser expressionParser(text);
    if ( !expressionParser.ParseStringExpression(project.GetCurrentPlatform(), project, layout, callbacks) )
    {
        errorTxt->SetLabel(expressionParser.GetFirstError());
        lastErrorPos = expressionParser.GetFirstErrorPosition();
    }
    else
    {
        errorTxt->SetLabel(_("No errors."));
        lastErrorPos = gd::String::npos;
    }


    errorTxt->Refresh(); //Need to call manually update.
}

void EditStrExpressionDialog::OnAddPropBtClick(wxCommandEvent& event)
{
    if ( !itemObj.IsOk() ) return;

    gd::TreeItemExpressionMetadata * infos = dynamic_cast<gd::TreeItemExpressionMetadata*>(ObjList->GetItemData(itemObj));
    if ( infos != NULL )
    {
        if ( infos->GetExpressionMetadata().parameters.empty() ) return; //Not even a parameter for the object ?

        bool cancelled = false;
        gd::String object = ShowParameterDialog(infos->GetExpressionMetadata().parameters[0], cancelled);
        if ( cancelled ) return;

        gd::String parametersStr, behaviorStr;
        for (std::size_t i = 1;i<infos->GetExpressionMetadata().parameters.size();++i)
        {
            if ( i == 1 && infos->GetExpressionMetadata().parameters[i].type == "behavior")
            {
                gd::ChooseBehaviorDialog dialog(this, project, layout, object, infos->GetExpressionMetadata().parameters[i].supplementaryInformation);
                if ( dialog.DeduceBehavior() || dialog.ShowModal() == 1 )
                    behaviorStr = dialog.GetChosenBehavior()+"::";
            }
            else
            {
                if ( !parametersStr.empty() ) parametersStr += ",";
                parametersStr += ShowParameterDialog(infos->GetExpressionMetadata().parameters[i], cancelled, object);
                if ( cancelled ) return;
            }
        }

        if ( TexteEdit->GetText() == "\"\"" ) TexteEdit->SetText("");
        TexteEdit->AddText(object+"."+behaviorStr+infos->GetName()+"("+parametersStr+")");
        return;
    }
}

void EditStrExpressionDialog::OnObjListItemActivated(wxTreeEvent& event)
{
    itemObj = event.GetItem();
    wxCommandEvent uselessEvent;
    OnAddPropBtClick(uselessEvent);
}

void EditStrExpressionDialog::OnObjListSelectionChanged(wxTreeEvent& event)
{
    itemObj = event.GetItem();
}

void EditStrExpressionDialog::OnAddFunctionBtClick(wxCommandEvent& event)
{
    if ( !itemVal.IsOk() ) return;

    gd::TreeItemExpressionMetadata * infos = dynamic_cast<gd::TreeItemExpressionMetadata*>(ValList->GetItemData(itemVal));
    if ( infos != NULL )
    {
        bool cancelled = false;

        gd::String parametersStr;
        for (std::size_t i = 0;i<infos->GetExpressionMetadata().parameters.size();++i)
        {
            if ( !parametersStr.empty() ) parametersStr += ",";
            parametersStr += ShowParameterDialog(infos->GetExpressionMetadata().parameters[i], cancelled);
            if ( cancelled ) return;
        }

        TexteEdit->AddText(infos->GetName()+"("+parametersStr+")");
        return;
    }
}

void EditStrExpressionDialog::OnTreeCtrl1ItemActivated(wxTreeEvent& event)
{
    itemVal = event.GetItem();
    wxCommandEvent uselessEvent;
    OnAddFunctionBtClick(uselessEvent);
}

void EditStrExpressionDialog::OnTreeCtrl1SelectionChanged(wxTreeEvent& event)
{
    itemVal = event.GetItem();
}

void EditStrExpressionDialog::OnerrorTxtClick(wxCommandEvent& event)
{
    if ( lastErrorPos != gd::String::npos )
        TexteEdit->GotoPos(lastErrorPos);
}

void EditStrExpressionDialog::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/edit_text");
}

}
#endif
