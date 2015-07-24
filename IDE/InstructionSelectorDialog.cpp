/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License.
 */

#include "InstructionSelectorDialog.h"

#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
#include "wx/image.h"
#include "wx/icon.h"
#include "GDCore/Tools/Log.h"
#include <wx/imaglist.h>
#include <wx/colordlg.h>
#include <wx/filedlg.h>
#include <wx/help.h>
#include <wx/msgdlg.h>
#include <wx/config.h>
#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/MetadataProvider.h"
#include "GDCore/IDE/InstructionSentenceFormatter.h"
#include "GDCore/IDE/Dialogs/ObjectListDialogsHelper.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/IDE/ExpressionsCorrectnessTesting.h"
#include "GDCore/IDE/Dialogs/ProjectExtensionsDialog.h"
#include "GDCore/CommonTools.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"

#ifdef __WXMSW__
#include <wx/msw/uxtheme.h>
#endif

BEGIN_EVENT_TABLE( InstructionSelectorDialog, wxDialog )
END_EVENT_TABLE()

using namespace gd;

const long InstructionSelectorDialog::ID_TREECTRL1 = wxNewId();
const long InstructionSelectorDialog::ID_NOTEBOOK2 = wxNewId();
const long InstructionSelectorDialog::ID_TEXTCTRL2 = wxNewId();
const long InstructionSelectorDialog::ID_PANEL1 = wxNewId();
const long InstructionSelectorDialog::ID_TEXTCTRL1 = wxNewId();
const long InstructionSelectorDialog::ID_STATICBITMAP1 = wxNewId();
const long InstructionSelectorDialog::ID_STATICTEXT1 = wxNewId();
const long InstructionSelectorDialog::ID_STATICTEXT2 = wxNewId();
const long InstructionSelectorDialog::ID_STATICLINE1 = wxNewId();
const long InstructionSelectorDialog::ID_STATICLINE2 = wxNewId();
const long InstructionSelectorDialog::ID_BUTTON4 = wxNewId();
const long InstructionSelectorDialog::ID_CHECKBOX2 = wxNewId();
const long InstructionSelectorDialog::ID_STATICBITMAP2 = wxNewId();
const long InstructionSelectorDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long InstructionSelectorDialog::ID_BUTTON1 = wxNewId();
const long InstructionSelectorDialog::ID_BUTTON2 = wxNewId();
const long InstructionSelectorDialog::ID_CHECKBOX1 = wxNewId();

InstructionSelectorDialog::InstructionSelectorDialog(wxWindow* parent, gd::Project & game_, gd::Layout & scene_, bool chooseAction) :
    game(game_),
    scene(scene_),
    isInverted(false),
    parametersHelper(ParaFac, ParaSpacer1, ParaText, ParaSpacer2, ParaBmpBt, ParaEdit),
    editingAction(chooseAction)
{
    wxBoxSizer* BoxSizer4;
    wxBoxSizer* BoxSizer6;
    wxBoxSizer* BoxSizer5;
    wxBoxSizer* BoxSizer10;
    wxBoxSizer* topPartSizer;
    wxBoxSizer* rightPartSizer;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer2;
    wxBoxSizer* BoxSizer2;
    wxBoxSizer* BoxSizer1;
    wxBoxSizer* BoxSizer9;
    wxFlexGridSizer* FlexGridSizer6;
    wxFlexGridSizer* treeSizer;
    wxBoxSizer* BoxSizer3;

    wxString title = editingAction ? _("Edit the action") : _("Edit the condition");
    Create(parent, wxID_ANY, title, wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("wxID_ANY"));
    wxIcon FrameIcon;
    FrameIcon.CopyFromBitmap(wxBitmap(wxImage(editingAction ? _T("res/actionicon.png") : _T("res/conditionicon.png"))));
    SetIcon(FrameIcon);

    BoxSizer6 = new wxBoxSizer(wxVERTICAL);
    topPartSizer = new wxBoxSizer(wxHORIZONTAL);
    treeSizer = new wxFlexGridSizer(0, 1, 0, 0);
    treeSizer->AddGrowableCol(0);
    treeSizer->AddGrowableRow(0);

    instructionsTree = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxDefaultSize, wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL1"));
    instructionsTree->SetMinSize(wxSize(300,-1));
    instructionsTree->SetToolTip(editingAction ? _("Choose the action to use") : _("Choose the condition to use"));

    treeSizer->Add(instructionsTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);

    searchCtrl = new wxSearchCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    searchCtrl->SetMinSize(wxSize(-1,24));

    treeSizer->Add(searchCtrl, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    topPartSizer->Add(treeSizer, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    rightPartSizer = new wxBoxSizer(wxVERTICAL);
    FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer3->AddGrowableCol(1);
    FlexGridSizer3->AddGrowableRow(0);
    ActionImg = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/unknownAction24.png")).Rescale(wxSize(24,24).GetWidth(),wxSize(24,24).GetHeight())), wxDefaultPosition, wxSize(24,24), wxNO_BORDER, _T("ID_STATICBITMAP1"));
    FlexGridSizer3->Add(ActionImg, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer4 = new wxBoxSizer(wxHORIZONTAL);
    instructionNameTxt = new wxStaticText(this, ID_STATICTEXT1, editingAction ? _("No action chosen") : _("No condition chosen"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    wxFont instructionNameTxtFont(16,wxSWISS,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    instructionNameTxt->SetFont(instructionNameTxtFont);
    BoxSizer4->Add(instructionNameTxt, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer3->Add(BoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    rightPartSizer->Add(FlexGridSizer3, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer3 = new wxBoxSizer(wxHORIZONTAL);
    instructionDescriptionTxt = new wxStaticText(this, ID_STATICTEXT2, editingAction ? _("Choose an action in the list") : _("Choose a condition in the list"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    BoxSizer3->Add(instructionDescriptionTxt, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    rightPartSizer->Add(BoxSizer3, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(480,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    BoxSizer1->Add(StaticLine1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 3);
    rightPartSizer->Add(BoxSizer1, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    GridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
    GridSizer1->AddGrowableCol(1);
    rightPartSizer->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    topPartSizer->Add(rightPartSizer, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer6->Add(topPartSizer, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer2 = new wxBoxSizer(wxHORIZONTAL);

    //Invert button:
    wxStaticBoxSizer* invertBox = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Inversion"));
    wxFlexGridSizer * invertCheckboxSizer = new wxFlexGridSizer(0, 3, 0, 0);
    invertCheckboxSizer->AddGrowableCol(1);
    invertCheckboxSizer->AddGrowableRow(0);
    invertedCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Invert the condition"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
    invertedCheck->SetValue(false);
    invertedCheck->SetToolTip(_("When inverted, a condition will check the negation of what it normally does."));
    invertCheckboxSizer->Add(invertedCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    invertBox->Add(invertCheckboxSizer, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    rightPartSizer->Add(invertBox, 0, wxALL | wxALIGN_BOTTOM, 5);

    //Bottom part
    StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    BoxSizer2->Add(StaticLine2, 1, wxTOP|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
    BoxSizer6->Add(BoxSizer2, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
    moreBt = new wxButton(this, ID_BUTTON4, editingAction ? _("More actions") : _("More conditions"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
    FlexGridSizer6->Add(moreBt, 1, wxALL|wxFIXED_MINSIZE|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);

    FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer5->AddGrowableRow(0);
    StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
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
    BoxSizer6->Fit(this);
    BoxSizer6->SetSizeHints(this);
    SetMinSize(wxSize(500,500));
    Center();

    parametersHelper.SetWindowAndSizer(this, GridSizer1)
        .SetProjectAndLayout(game, scene);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&InstructionSelectorDialog::OninstructionsTreeItemActivated);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&InstructionSelectorDialog::OninstructionsTreeSelectionChanged);
    Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&InstructionSelectorDialog::OnsearchCtrlText);
    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&InstructionSelectorDialog::OnmoreBtClick);
    Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&InstructionSelectorDialog::OnHelpBtClick);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&InstructionSelectorDialog::OnOkBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&InstructionSelectorDialog::OnCancelBtClick);

    #if defined(__WXMSW__) //Offer nice look to list
    wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
    if(theme) theme->SetWindowTheme((HWND) instructionsTree->GetHWND(), L"EXPLORER", NULL);
    #endif

    searchCtrl->SetFocus();

    imageList = new wxImageList(16, 16);
    imageList->Add(( wxBitmap( editingAction ? "res/actions/uneaction.png" : "res/conditions/unecond.png", wxBITMAP_TYPE_ANY ) ) );
    instructionsTree->AssignImageList( imageList );

    instructionType = "";

    if (editingAction) invertBox->Show(false);
    RefreshList();
    Center();
    SetSize(-1, 600);
}

InstructionSelectorDialog::~InstructionSelectorDialog()
{
    //(*Destroy(InstructionSelectorDialog)
    //*)
}

wxTreeItemId InstructionSelectorDialog::GetGroupItem(wxTreeCtrl * treeCtrl, wxTreeItemId parent, gd::String groupStr, bool insertIfNotExist)
{
    std::vector<gd::String> groups = groupStr.Split(U'/');

    for(unsigned int i = 0;i<groups.size();++i)
    {
        if ( groups[i].empty() ) continue;

        wxTreeItemIdValue cookie;
        wxTreeItemId groupItem = treeCtrl->GetFirstChild(parent, cookie);
        size_t latestGroupPos = 0;
        while ( groupItem.IsOk() && treeCtrl->GetItemText(groupItem) != groups[i].ToWxString() )
        {
            if ( treeCtrl->HasChildren(groupItem) ) latestGroupPos++;
            groupItem = treeCtrl->GetNextSibling(groupItem);
        }
        if ( !groupItem.IsOk() && insertIfNotExist)
            groupItem = treeCtrl->InsertItem(parent, latestGroupPos, groups[i], 0);
        else if( !groupItem.IsOk() && !insertIfNotExist)
        {
            return groupItem;
        }

        parent = groupItem;
    }

    return parent;
}

bool InstructionSelectorDialog::SelectInstruction(const gd::String & type, wxTreeItemId parent)
{
    wxTreeItemIdValue cookie;
    for(wxTreeItemId instructionItem = instructionsTree->GetFirstChild(parent, cookie);
        instructionItem.IsOk();
        instructionItem = instructionsTree->GetNextChild(parent, cookie))
    {
        gd::TreeItemStringData *itemData = dynamic_cast<gd::TreeItemStringData*>(instructionsTree->GetItemData(instructionItem));
        if(itemData && itemData->GetString() == type)
        {
            instructionsTree->EnsureVisible(instructionItem);
            instructionsTree->SelectItem(instructionItem);
            return true; //Found, stop here.
        }

        if (instructionsTree->ItemHasChildren(instructionItem))
        {
            bool result = SelectInstruction(type, instructionItem);
            if (result)
                return true;
        }
    }

    return false; //Instruction item not found in the children of parent item.
}

bool InstructionSelectorDialog::MatchSearchCriteria(gd::String search, const gd::InstructionMetadata & instrMetadata)
{
    if (search.empty()) return true;

    return instrMetadata.GetGroup().FindCaseInsensitive(search) != string::npos ||
        instrMetadata.GetFullName().FindCaseInsensitive(search) != string::npos;
}

/**
 * Create the list of instructions
 */
void InstructionSelectorDialog::RefreshList()
{
    instructionsTree->DeleteAllItems();
    instructionsTree->AddRoot(editingAction ? _("All actions") : _("All conditions"), 0);

    gd::String search = searchCtrl->GetValue();
    bool searching = search.empty() ? false : true;

    //Insert extension instructions
    const vector < std::shared_ptr<gd::PlatformExtension> > extensions = game.GetCurrentPlatform().GetAllPlatformExtensions();
    for (unsigned int i = 0;i<extensions.size();++i)
    {
        //Verify if that extension is enabled
        if ( find(game.GetUsedExtensions().begin(),
                  game.GetUsedExtensions().end(),
                  extensions[i]->GetName()) == game.GetUsedExtensions().end() )
            continue;

        std::vector<gd::String> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
        std::vector<gd::String> automatismsTypes = extensions[i]->GetAutomatismsTypes();

        wxTreeItemId extensionItem = instructionsTree->GetRootItem();
        if ( !objectsTypes.empty() || !automatismsTypes.empty() )//Display the extension name only if it contains objects/automatisms
        {
            if ( extensions[i]->GetName() == "BuiltinObject" )
                extensionItem = instructionsTree->AppendItem(instructionsTree->GetRootItem(), _("All objects"), 0);
            else
                extensionItem = instructionsTree->AppendItem(instructionsTree->GetRootItem(), extensions[i]->GetFullName(), 0);
        }

        for(unsigned int j = 0;j<objectsTypes.size();++j)
        {
            //Add each object instructions
            std::map<gd::String, gd::InstructionMetadata > allObjActions = editingAction ?
                extensions[i]->GetAllActionsForObject(objectsTypes[j]) :
                extensions[i]->GetAllConditionsForObject(objectsTypes[j]);

            for(auto it = allObjActions.begin(); it != allObjActions.end(); ++it)
            {
                if (!MatchSearchCriteria(search, it->second) || it->second.IsHidden())
                    continue;

                //Search and/or add group item
                wxTreeItemId groupItem = GetGroupItem(instructionsTree, extensionItem, it->second.GetGroup());

                //Add instruction item
                int IDimage = 0;
                if ( it->second.GetSmallBitmapIcon().IsOk() )
                {
                    imageList->Add(it->second.GetSmallBitmapIcon());
                    IDimage = imageList->GetImageCount()-1;
                }

                gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(it->first);
                instructionsTree->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
            }
        }

        for(unsigned int j = 0;j<automatismsTypes.size();++j)
        {
            //Add each automatism instructions
            std::map<gd::String, gd::InstructionMetadata > allAutoActions = editingAction ?
                extensions[i]->GetAllActionsForAutomatism(automatismsTypes[j]) :
                extensions[i]->GetAllConditionsForAutomatism(automatismsTypes[j]);

            for(auto it = allAutoActions.begin(); it != allAutoActions.end(); ++it)
            {
                if (!MatchSearchCriteria(search, it->second) || it->second.IsHidden())
                    continue;

                //Search and/or add group item
                wxTreeItemId groupItem = GetGroupItem(instructionsTree, extensionItem, it->second.GetGroup());

                //Add instruction item
                int IDimage = 0;
                if ( it->second.GetSmallBitmapIcon().IsOk() )
                {
                    imageList->Add(it->second.GetSmallBitmapIcon());
                    IDimage = imageList->GetImageCount()-1;
                }

                gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(it->first);
                instructionsTree->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
            }
        }

        //Add each (free) conditions
        std::map<gd::String, gd::InstructionMetadata > allActions = editingAction ?
            extensions[i]->GetAllActions() :
            extensions[i]->GetAllConditions();

        for(auto it = allActions.begin(); it != allActions.end(); ++it)
        {
            if (!MatchSearchCriteria(search, it->second) || it->second.IsHidden())
                continue;

            //Search and/or add group item
            wxTreeItemId groupItem = GetGroupItem(instructionsTree, extensionItem, it->second.GetGroup());

            //Add instruction item
            int IDimage = 0;
            if ( it->second.GetSmallBitmapIcon().IsOk() )
            {
                imageList->Add(it->second.GetSmallBitmapIcon());
                IDimage = imageList->GetImageCount()-1;
            }

            gd::TreeItemStringData * associatedData = new gd::TreeItemStringData(it->first);
            instructionsTree->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
        }

        if ( !instructionsTree->HasChildren(extensionItem) ) instructionsTree->Delete(extensionItem);
    }

    if ( searching ) instructionsTree->ExpandAll();
}

void InstructionSelectorDialog::OninstructionsTreeSelectionChanged(wxTreeEvent& event)
{
    gd::TreeItemStringData * associatedData = dynamic_cast<gd::TreeItemStringData*>(instructionsTree->GetItemData(event.GetItem()));
    if ( associatedData == NULL ) return;

    instructionType = associatedData->GetString();
    RefreshFromInstruction();
}

void InstructionSelectorDialog::RefreshFromInstruction()
{
    if ( instructionType.empty() ) return;

    const gd::InstructionMetadata & instructionMetadata = editingAction ?
        gd::MetadataProvider::GetActionMetadata(game.GetCurrentPlatform(), instructionType) :
        gd::MetadataProvider::GetConditionMetadata(game.GetCurrentPlatform(), instructionType);

    //Select the current selected instruction
    SelectInstruction(instructionType, instructionsTree->GetRootItem());

    //Display instruction main properties
    instructionNameTxt->SetLabel( instructionMetadata.GetFullName() );
    instructionNameTxt->Wrap( 450 );
    instructionDescriptionTxt->SetLabel( instructionMetadata.GetDescription() );
    instructionDescriptionTxt->Wrap( 450 );
    if ( instructionMetadata.GetBitmapIcon().IsOk() ) ActionImg->SetBitmap( instructionMetadata.GetBitmapIcon() );
    else ActionImg->SetBitmap(gd::CommonBitmapManager::Get()->unknownAction24);

    //Update parameters controls
    parametersHelper.UpdateControls(instructionMetadata.parameters.size());
    for ( unsigned int i = 0;i < instructionMetadata.parameters.size();i++ ) {
        parametersHelper.UpdateParameterContent(i, instructionMetadata.parameters[i],
            i < Param.size() ? Param[i].GetPlainString() : "");
    }

    GridSizer1->Layout();

    if (!editingAction)
        invertedCheck->SetValue(isInverted);
}

void InstructionSelectorDialog::OnOkBtClick(wxCommandEvent& event)
{
    if ( instructionType == "" )
        return;

    const gd::InstructionMetadata & instructionMetadata = editingAction ?
        gd::MetadataProvider::GetActionMetadata(game.GetCurrentPlatform(), instructionType) :
        gd::MetadataProvider::GetConditionMetadata(game.GetCurrentPlatform(), instructionType);

    if (ParaEdit.size() < instructionMetadata.parameters.size())
    {
        gd::LogWarning(_("The instruction has to many parameters. This can be a bug of GDevelop.\nRead Help to know how report a bug."));
        return;
    }

    //Check for validity of parameters
    bool parametersHaveErrors = false;
    gd::String message;
    size_t parameterDisplayIndex = 0;
    for ( unsigned int i = 0;i < instructionMetadata.parameters.size();i++ )
    {
        if (!instructionMetadata.parameters[i].codeOnly ) parameterDisplayIndex++;

        //Do not check optional parameters which are desactivated
        if ( !ParaFac.at(i)->IsShown() || (ParaFac.at(i)->IsShown() && ParaFac.at(i)->GetValue()))
        {
            gd::CallbacksForExpressionCorrectnessTesting callbacks(game, scene);
            gd::ExpressionParser expressionParser(ParaEdit.at(i)->GetValue());

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
        if ( wxMessageBox(wxString::Format(_("Error in parameter #%i: %s\n\nYou should correct it before closing this dialog.\nClose the dialog anyway?").ToWxString(),
            parameterDisplayIndex, message.c_str()), _("The instruction contains one or more errors."), wxYES_NO | wxICON_EXCLAMATION, this) == wxNO )
            return;
    }

    //On ajoute les param�tres
    Param.clear();
    for ( unsigned int i = 0;i < instructionMetadata.parameters.size();i++ )
    {
        if ( ParaFac.at(i)->IsShown() && !ParaFac.at(i)->GetValue())
            Param.push_back(gd::Expression("")); //Optional parameter not filled stay empty.
        else
            Param.push_back(gd::Expression(gd::String(ParaEdit.at(i)->GetValue())));
    }

    isInverted = editingAction ? false : invertedCheck->GetValue();

    EndModal( 0 );
}

void InstructionSelectorDialog::OnCancelBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void InstructionSelectorDialog::OnHelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenURL(editingAction ?
        _("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/events_editor/action") :
        _("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/events_editor/condition"));
}

void InstructionSelectorDialog::OnmoreBtClick(wxCommandEvent& event)
{
    gd::ProjectExtensionsDialog dialog(this, game);
    dialog.ShowModal();

    RefreshList();
}

void InstructionSelectorDialog::OnsearchCtrlText(wxCommandEvent& event)
{
    RefreshList();
}

void InstructionSelectorDialog::OninstructionsTreeItemActivated(wxTreeEvent& event)
{
    if ( !ParaEdit.empty() ) ParaEdit[0]->SetFocus();
}
