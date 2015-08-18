/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCore/IDE/Dialogs/ResourcesEditor.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include "GDCore/Tools/Localization.h"
//(*InternalHeaders(ResourcesEditor)
#include <wx/bitmap.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <algorithm>

#include <wx/choicdlg.h>
#include <wx/toolbar.h>
#include <wx/config.h>
#include <wx/msgdlg.h>
#include <wx/aui/aui.h>
#include <wx/settings.h>
#include <wx/filedlg.h>
#include <wx/image.h>
#include <wx/imaglist.h>
#include <wx/textdlg.h>
#include <wx/help.h>
#include <wx/file.h>
#include <wx/dcbuffer.h>
#include <wx/dnd.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/ResourcesManager.h"
#include "GDCore/IDE/ProjectResourcesAdder.h"
#include "GDCore/IDE/ImagesUsedInventorizer.h"
#include "GDCore/IDE/Dialogs/ResourceLibraryDialog.h"
#include "GDCore/IDE/wxTools/FileProperty.h"
#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/IDE/Dialogs/DndResourcesEditor.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

//(*IdInit(ResourcesEditor)
const long ResourcesEditor::ID_AUITOOLBARITEM1 = wxNewId();
const long ResourcesEditor::ID_AUITOOLBARITEM2 = wxNewId();
const long ResourcesEditor::ID_AUITOOLBARITEM5 = wxNewId();
const long ResourcesEditor::ID_AUITOOLBAR1 = wxNewId();
const long ResourcesEditor::ID_TREECTRL1 = wxNewId();
const long ResourcesEditor::ID_TEXTCTRL1 = wxNewId();
const long ResourcesEditor::ID_PANEL1 = wxNewId();
const long ResourcesEditor::ID_PANEL3 = wxNewId();
const long ResourcesEditor::ID_PROPGRID = wxNewId();
const long ResourcesEditor::ID_PANEL2 = wxNewId();
const long ResourcesEditor::idMenuMod = wxNewId();
const long ResourcesEditor::idMenuAjouter = wxNewId();
const long ResourcesEditor::idMenuDel = wxNewId();
const long ResourcesEditor::ID_MENUITEM9 = wxNewId();
const long ResourcesEditor::idMoveUp = wxNewId();
const long ResourcesEditor::idMoveDown = wxNewId();
const long ResourcesEditor::ID_MENUITEM1 = wxNewId();
const long ResourcesEditor::ID_MENUITEM2 = wxNewId();
const long ResourcesEditor::ID_MENUITEM3 = wxNewId();
const long ResourcesEditor::ID_MENUITEM5 = wxNewId();
const long ResourcesEditor::ID_MENUITEM6 = wxNewId();
const long ResourcesEditor::ID_MENUITEM4 = wxNewId();
const long ResourcesEditor::ID_MENUITEM7 = wxNewId();
const long ResourcesEditor::ID_MENUITEM8 = wxNewId();
//*)
const long ResourcesEditor::ID_BITMAPBUTTON1 = wxNewId();
const long ResourcesEditor::ID_BITMAPBUTTON5 = wxNewId();
const long ResourcesEditor::ID_BITMAPBUTTON3 = wxNewId();
const long ResourcesEditor::ID_BITMAPBUTTON6 = wxNewId();
const long ResourcesEditor::idRibbonAdd = wxNewId();
const long ResourcesEditor::idRibbonAddFromLibrary = wxNewId();
const long ResourcesEditor::idRibbonDel= wxNewId();
const long ResourcesEditor::idRibbonAddDossier= wxNewId();
const long ResourcesEditor::idRibbonRemoveDossier= wxNewId();
const long ResourcesEditor::idRibbonUp= wxNewId();
const long ResourcesEditor::idRibbonDown= wxNewId();
const long ResourcesEditor::idRibbonShowPreview= wxNewId();
const long ResourcesEditor::idRibbonShowPropertyGrid= wxNewId();
const long ResourcesEditor::idRibbonExternalProgram= wxNewId();
const long ResourcesEditor::idRibbonHelp= wxNewId();
const long ResourcesEditor::idRibbonRefresh = wxNewId();
const long ResourcesEditor::idRibbonDeleteUnused = wxNewId();
const long ResourcesEditor::idMenuResourcesLibrary = wxNewId();


BEGIN_EVENT_TABLE( ResourcesEditor, wxPanel )
    //(*EventTable(ResourcesEditor)
    //*)
END_EVENT_TABLE()

ResourcesEditor::ResourcesEditor( wxWindow* parent, gd::Project & project_, gd::MainFrameWrapper & mainFrameWrapper_, bool useRibbon_ ) :
project(project_),
toolbar(NULL),
mainFrameWrapper(mainFrameWrapper_),
useRibbon(useRibbon_),
editorJustConstructed(true),
resourceLibraryDialog(new gd::ResourceLibraryDialog(this))
{
    //(*Initialize(ResourcesEditor)
    wxFlexGridSizer* FlexGridSizer3;
    wxMenuItem* MenuItem1;
    wxMenuItem* MenuItem3;
    wxMenuItem* deleteImageItem;
    wxFlexGridSizer* FlexGridSizer1;

    Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
    AuiManager1 = new wxAuiManager(this, wxAUI_MGR_DEFAULT);
    toolbar = new wxAuiToolBar(this, ID_AUITOOLBAR1, wxDefaultPosition, wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
    toolbar->AddTool(ID_AUITOOLBARITEM1, _("Add an image"), gd::SkinHelper::GetIcon("add", 16), wxNullBitmap, wxITEM_NORMAL, _("Add an image"), _("Add an image"), NULL);
    toolbar->AddTool(ID_AUITOOLBARITEM2, _("Add from resource library"), wxBitmap(wxImage(_T("res/package16.png"))), wxNullBitmap, wxITEM_NORMAL, _("Add from resource library"), _("Add from resource library"), NULL);
    toolbar->AddSeparator();
    toolbar->AddTool(ID_AUITOOLBARITEM5, _("Help"), gd::SkinHelper::GetIcon("help", 16), wxNullBitmap, wxITEM_NORMAL, _("Get help about using the resource manager"), _("Get help about using the resource manager"), NULL);
    toolbar->Realize();
    AuiManager1->AddPane(toolbar, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().DockFixed().Floatable(false).Movable(false).Gripper(false));
    corePanel = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    FlexGridSizer3->AddGrowableRow(0);
    resourcesTree = new wxTreeCtrl(corePanel, ID_TREECTRL1, wxDefaultPosition, wxSize(200,170), wxTR_EDIT_LABELS|wxTR_HIDE_ROOT|wxTR_MULTIPLE|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
    resourcesTree->SetToolTip(_("Right click on an image to access to more options"));
    FlexGridSizer3->Add(resourcesTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    searchCtrl = new wxSearchCtrl(corePanel, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    FlexGridSizer3->Add(searchCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    corePanel->SetSizer(FlexGridSizer3);
    FlexGridSizer3->Fit(corePanel);
    FlexGridSizer3->SetSizeHints(corePanel);
    AuiManager1->AddPane(corePanel, wxAuiPaneInfo().Name(_T("corePane")).Caption(_("Pane caption")).CaptionVisible(false).CloseButton(false).Center());
    previewPanel = new wxPanel(this, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxSUNKEN_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL3"));
    AuiManager1->AddPane(previewPanel, wxAuiPaneInfo().Name(_T("previewPane")).Caption(_("Preview")).CaptionVisible().Right());
    propertiesPanel = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(0);
    propertyGrid = new wxPropertyGridManager(propertiesPanel,ID_PROPGRID,wxDefaultPosition,wxDefaultSize,0,_T("ID_PROPGRID"));
    FlexGridSizer1->Add(propertyGrid, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    propertiesPanel->SetSizer(FlexGridSizer1);
    FlexGridSizer1->Fit(propertiesPanel);
    FlexGridSizer1->SetSizeHints(propertiesPanel);
    AuiManager1->AddPane(propertiesPanel, wxAuiPaneInfo().Name(_T("propertiesPane")).Caption(_("Properties")).CaptionVisible().Position(1).Right());
    AuiManager1->Update();
    MenuItem3 = new wxMenuItem((&ContextMenu), idMenuMod, _("Rename\tF2"), wxEmptyString, wxITEM_NORMAL);
    MenuItem3->SetBitmap(gd::SkinHelper::GetIcon("rename", 16));
    ContextMenu.Append(MenuItem3);
    ContextMenu.AppendSeparator();
    MenuItem1 = new wxMenuItem((&ContextMenu), idMenuAjouter, _("Add an image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem1->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
    ContextMenu.Append(MenuItem1);
    deleteImageItem = new wxMenuItem((&ContextMenu), idMenuDel, _("Delete the image\tDEL"), wxEmptyString, wxITEM_NORMAL);
    deleteImageItem->SetBitmap(gd::SkinHelper::GetIcon("delete", 16));
    ContextMenu.Append(deleteImageItem);
    MenuItem14 = new wxMenuItem((&ContextMenu), ID_MENUITEM9, _("Remove from folder only"), wxEmptyString, wxITEM_NORMAL);
    ContextMenu.Append(MenuItem14);
    ContextMenu.AppendSeparator();
    MenuItem7 = new wxMenuItem((&ContextMenu), idMoveUp, _("Move up\tCtrl-J"), _("Move the image up"), wxITEM_NORMAL);
    MenuItem7->SetBitmap(gd::SkinHelper::GetIcon("up", 16));
    ContextMenu.Append(MenuItem7);
    MenuItem8 = new wxMenuItem((&ContextMenu), idMoveDown, _("Move down\tCtrl-K"), _("Move the image down"), wxITEM_NORMAL);
    MenuItem8->SetBitmap(gd::SkinHelper::GetIcon("down", 16));
    ContextMenu.Append(MenuItem8);
    MenuItem2 = new wxMenuItem((&emptyMenu), ID_MENUITEM1, _("Add an image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem2->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
    emptyMenu.Append(MenuItem2);
    emptyMenu.AppendSeparator();
    MenuItem6 = new wxMenuItem((&emptyMenu), ID_MENUITEM2, _("Add a folder"), wxEmptyString, wxITEM_NORMAL);
    MenuItem6->SetBitmap(wxBitmap(wxImage(_T("res/foldericon.png"))));
    emptyMenu.Append(MenuItem6);
    MenuItem9 = new wxMenuItem((&folderMenu), ID_MENUITEM3, _("Rename\tF2"), wxEmptyString, wxITEM_NORMAL);
    MenuItem9->SetBitmap(gd::SkinHelper::GetIcon("rename", 16));
    folderMenu.Append(MenuItem9);
    MenuItem13 = new wxMenuItem((&folderMenu), ID_MENUITEM5, _("Delete\tDEL"), wxEmptyString, wxITEM_NORMAL);
    MenuItem13->SetBitmap(gd::SkinHelper::GetIcon("delete", 16));
    folderMenu.Append(MenuItem13);
    folderMenu.AppendSeparator();
    MenuItem10 = new wxMenuItem((&folderMenu), ID_MENUITEM6, _("Add an image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem10->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
    folderMenu.Append(MenuItem10);
    folderMenu.AppendSeparator();
    MenuItem5 = new wxMenuItem((&folderMenu), ID_MENUITEM4, _("Add a folder"), wxEmptyString, wxITEM_NORMAL);
    MenuItem5->SetBitmap(wxBitmap(wxImage(_T("res/foldericon.png"))));
    folderMenu.Append(MenuItem5);
    folderMenu.AppendSeparator();
    MenuItem11 = new wxMenuItem((&folderMenu), ID_MENUITEM7, _("Move up\tCtrl-J"), wxEmptyString, wxITEM_NORMAL);
    MenuItem11->SetBitmap(gd::SkinHelper::GetIcon("up", 16));
    folderMenu.Append(MenuItem11);
    MenuItem12 = new wxMenuItem((&folderMenu), ID_MENUITEM8, _("Move down\tCtrl-K"), wxEmptyString, wxITEM_NORMAL);
    MenuItem12->SetBitmap(gd::SkinHelper::GetIcon("down", 16));
    folderMenu.Append(MenuItem12);

    Connect(ID_AUITOOLBARITEM1,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnAddImageBtClick);
    Connect(ID_AUITOOLBARITEM5,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnAideBtClick);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_DRAG,(wxObjectEventFunction)&ResourcesEditor::OnresourcesTreeBeginDrag);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&ResourcesEditor::OnresourcesTreeBeginLabelEdit);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&ResourcesEditor::OnresourcesTreeEndLabelEdit);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ResourcesEditor::OnresourcesTreeItemActivated);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ResourcesEditor::OnresourcesTreeSelectionChanged);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_KEY_DOWN,(wxObjectEventFunction)&ResourcesEditor::OnresourcesTreeKeyDown);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_MENU,(wxObjectEventFunction)&ResourcesEditor::OnresourcesTreeItemMenu);
    Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ResourcesEditor::OnsearchCtrlText);
    previewPanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&ResourcesEditor::OnpreviewPanelPaint,0,this);
    previewPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&ResourcesEditor::OnpreviewPanelResize,0,this);
    Connect(idMenuMod,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnModNameImageBtClick);
    Connect(idMenuAjouter,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnAddImageBtClick);
    Connect(idMenuDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnDelImageBtClick);
    Connect(ID_MENUITEM9,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnremoveFolderOnlySelected);
    Connect(idMoveUp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnMoveUpSelected);
    Connect(idMoveDown,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnMoveDownSelected);
    Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnAddImageBtClick);
    Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnAddFolderSelected);
    Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnModNameImageBtClick);
    Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnDelImageBtClick);
    Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnAddImageBtClick);
    Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnAddFolderSelected);
    Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnMoveUpSelected);
    Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnMoveDownSelected);
    Connect(wxEVT_SIZE,(wxObjectEventFunction)&ResourcesEditor::OnResize);
    //*)
    Connect(ID_PROPGRID, wxEVT_PG_CHANGED, (wxObjectEventFunction)&ResourcesEditor::OnPropertyChanged);
    Connect(ID_PROPGRID, wxEVT_PG_CHANGING, (wxObjectEventFunction)&ResourcesEditor::OnPropertyChanging);
    Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnRefreshBtClick);
    Connect(ID_BITMAPBUTTON5,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnOpenPaintProgramClick);
    Connect(ID_BITMAPBUTTON6,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnMoreOptions);
    Connect(ID_BITMAPBUTTON3,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnAideBtClick);
    Connect(idMenuResourcesLibrary,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnAddFromLibraryBtClick);
    Connect(ID_AUITOOLBARITEM2,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnAddFromLibraryBtClick);

    //Offer nice theme to property grid
    propertyGrid->SetWindowStyle(wxPG_HIDE_MARGIN|wxPGMAN_DEFAULT_STYLE|wxPG_DESCRIPTION);
    propertyGrid->AddPage("SinglePage");
    gd::SkinHelper::ApplyCurrentSkin(*propertyGrid->GetGrid());

    //ResourcesEditor can be used without ribbon
    if ( useRibbon )
    {
        ConnectEvents();
        AuiManager1->GetPane(toolbar).Hide();
    }

    SetDropTarget(new DndTextResourcesEditor(*this));

    //Apply skins and nice colours
    gd::SkinHelper::ApplyCurrentSkin(*toolbar);
    gd::SkinHelper::ApplyCurrentSkin(*AuiManager1);

    AuiManager1->GetPane(previewPanel).MinSize(200,200).BestSize(400,200);
    AuiManager1->GetPane(propertiesPanel).MinSize(200,200).BestSize(400,200);
    AuiManager1->Update();

    Refresh();
}

void ResourcesEditor::OnpreviewPanelResize(wxSizeEvent& event)
{
    previewPanel->Refresh();
    previewPanel->Update();
}

void ResourcesEditor::OnResize(wxSizeEvent& event)
{
    if ( editorJustConstructed )
    {
        if ( GetSize().GetWidth() < 350 )
        {
            AuiManager1->GetPane(previewPanel).Bottom();
            AuiManager1->GetPane(propertiesPanel).Float();
            AuiManager1->GetPane(propertiesPanel).Hide();
            AuiManager1->Update();
        }
        else
        {
            AuiManager1->GetPane(previewPanel).BestSize(GetSize().GetWidth()/2, 200);
            AuiManager1->GetPane(propertiesPanel).BestSize(GetSize().GetWidth()/2, 200);
            AuiManager1->Update();
        }

        editorJustConstructed = false;
    }
    event.Skip();
}

ResourcesEditor::~ResourcesEditor()
{
    //(*Destroy(ResourcesEditor)
    //*)

    AuiManager1->UnInit();
}

void ResourcesEditor::ConnectEvents()
{
    if ( !useRibbon ) return;

    mainFrameWrapper.GetMainEditor()->Connect(idRibbonAdd, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnAddImageBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonAddFromLibrary, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnAddFromLibraryBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDel, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnDelImageBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonAddDossier, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnAddFolderSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonUp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnMoveUpSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDown, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnMoveDownSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonExternalProgram, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnOpenPaintProgramClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnAideBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonRefresh, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnRefreshBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDeleteUnused, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnDeleteUnusedFiles, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonShowPreview, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnShowPreviewBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonShowPropertyGrid, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnShowPropertyGridBtClick, NULL, this);
}

/*void ResourcesEditor::CreateRibbonPage(wxRibbonPage * page)
{
    //After updating to wxWidgets 2.9.2 ( SVN ), buttons are not created correctly if we create them from here.
}*/

wxTreeItemId ResourcesEditor::GetSelectedFolderItem()
{
    wxTreeItemId item = m_itemSelected;

    if ( !item.IsOk() ) return resourcesTree->GetRootItem();

    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(item));
    while ( item.IsOk() && data && data->GetString() != "Folder" && data->GetString() != "BaseFolder" )
    {
        item = resourcesTree->GetItemParent(item);
        data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(item));
    }

    return item.IsOk() ? item : resourcesTree->GetRootItem();
}

/**
 * Add a new image
 */
void ResourcesEditor::OnAddImageBtClick( wxCommandEvent& event )
{
    wxFileDialog FileDialog( this, _("Choose one or more images to add"), "", "", _("Supported image files|*.jpg;*.png|All files|*.*"), wxFD_MULTIPLE|wxFD_PREVIEW );

    if ( FileDialog.ShowModal() == wxID_OK )
    {
        gd::LogStatus( _( "Adding images" ) );

        wxArrayString files;
        FileDialog.GetPaths( files );
        gd::String imageNonAjoutees;

        //Add each image to images list and to folder if any
        std::vector < gd::String > filenames;
        for ( unsigned int i = 0; i < files.GetCount();++i )
            filenames.push_back(files[i]);

        AddResources(filenames);

        gd::LogStatus( _( "Resources successfully added" ) );
    }

}

std::vector<gd::String> ResourcesEditor::CopyAndAddResources(std::vector<gd::String> filenames, const gd::String & destinationDirStr)
{
    if ( !project.GetProjectFile().empty() ) //If game is not saved, we keep absolute filenames and do not copy resources.
    {
        //Copy all resources into the destination directory
        wxString projectDirectory = wxFileName::FileName(project.GetProjectFile()).GetPath();

        wxFileName destinationDir = wxFileName::FileName(projectDirectory+"/"+destinationDirStr+"/");
        destinationDir.MakeAbsolute(projectDirectory);
        for (unsigned int i = 0;i<filenames.size();++i)
        {
            wxString name = wxFileName::FileName(filenames[i]).GetFullName();
            wxFileName destinationFile = wxFileName::FileName(destinationDir.GetPath()+"/"+name);

            gd::LogStatus( _( "Copy of" ) + " " + name );

            //Copy the resource
            wxCopyFile(filenames[i], destinationFile.GetFullPath(), true);
            filenames[i] = destinationFile.GetFullPath();
        }
    }

    return AddResources(filenames);
}

std::vector<gd::String> ResourcesEditor::AddResources(const std::vector<gd::String> & filenames)
{
    std::vector<gd::String> resourceNames;
    gd::String alreadyExistingResources;

    //Find current folder, if any.
    gd::ResourceFolder * currentFolder = NULL;
    wxTreeItemId currentFolderItem = GetSelectedFolderItem();
    gd::TreeItemStringData * currentFolderData = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData( currentFolderItem ));
    if ( currentFolderData && currentFolderData->GetString() == "Folder" )
    {
        if ( project.GetResourcesManager().HasFolder(currentFolderData->GetSecondString()) )
            currentFolder = &project.GetResourcesManager().GetFolder(currentFolderData->GetSecondString());
    }

    wxString projectDirectory = wxFileName::FileName(project.GetProjectFile()).GetPath();

    //Add each resource to the list and to the folder if any
    for ( unsigned int i = 0; i < filenames.size();++i )
    {
        wxFileName file = wxFileName::FileName(filenames[i]);
        if (!projectDirectory.empty())  //If game is not saved, we keep absolute filenames
            file.MakeRelativeTo(projectDirectory);

        gd::String name = file.GetFullName();
        gd::LogStatus( _( "Adding " ) + name );

        //Add to all images
        if ( project.GetResourcesManager().AddResource(name, file.GetFullPath()) )
        {
            for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnResourceModified(project, name);

            resourcesTree->AppendItem( allImagesItem, name, -1, -1, new gd::TreeItemStringData("Image", name));
            resourceNames.push_back(name);
        }
        else
            alreadyExistingResources += "\n"+name;

        //Add image to folder if a folder is selected
        if ( currentFolder && !currentFolder->HasResource(name) )
        {
            currentFolder->AddResource(name, project.GetResourcesManager());
            resourcesTree->AppendItem( currentFolderItem, name, -1, -1, new gd::TreeItemStringData("Image", name));
        }
    }

    resourcesTree->ExpandAll();

    if ( !alreadyExistingResources.empty() )
    {
        gd::LogMessage(_("Some images in the list have already the same name, and have not been added:")+"\n"+alreadyExistingResources);
    }

    return resourceNames;
}

void ResourcesEditor::OnAddFromLibraryBtClick( wxCommandEvent& event )
{
    resourceLibraryDialog->Show(true);
}
void ResourcesEditor::OnAddFromLibraryToolbarBtClick(wxCommandEvent& event)
{
    OnAddFromLibraryBtClick(event);
}

void ResourcesEditor::OnremoveFolderOnlySelected(wxCommandEvent& event)
{
    gd::TreeItemStringData * itemData = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(m_itemSelected));

    wxTreeItemId folderItem = GetSelectedFolderItem();
    gd::TreeItemStringData * folderData = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(folderItem));

    if ( itemData && folderItem.IsOk() && itemData->GetString() == "Image" && folderData && folderData->GetString() == "Folder" )
    {
        gd::String folderName = folderData->GetSecondString();
        if ( !project.GetResourcesManager().HasFolder(folderName) ) return;

        project.GetResourcesManager().GetFolder(folderName).RemoveResource(itemData->GetSecondString());

        resourcesTree->Delete(m_itemSelected);
    }
    else
        gd::LogStatus( _( "No image selected" ) );
}

/**
 * Tool function
 */
void ResourcesEditor::RemoveImageFromTree(wxTreeItemId parent, gd::String imageName)
{
    void * cookie;
    wxTreeItemId item = resourcesTree->GetFirstChild( parent, cookie );
    while ( item.IsOk() )
    {
        //Recurse if needed
        if ( resourcesTree->ItemHasChildren(item) )
            RemoveImageFromTree(item, imageName);

        //Delete item if needed
        gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(item));
        if ( data && data->GetSecondString() == imageName && data->GetString() == "Image")
        {
            wxTreeItemId next = resourcesTree->GetNextSibling( item );
            resourcesTree->Delete(item);
            item = next;
        }
        else
            item = resourcesTree->GetNextSibling( item );
    }
}

/**
 * Delete an image from folder/all images
 */
void ResourcesEditor::OnDelImageBtClick( wxCommandEvent& event )
{
    wxArrayTreeItemIds selection;
    resourcesTree->GetSelections(selection);
    for (unsigned int i = 0;i<selection.size();++i)
    {
        gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(selection[i]));
        if ( data && data->GetString() == "Image")
        {
            gd::String imageName = data->GetSecondString();

            project.GetResourcesManager().RemoveResource(imageName);
            for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnResourceModified(project, imageName);
            RemoveImageFromTree( resourcesTree->GetRootItem(), imageName );
        }
        else if ( data && data->GetString() == "Folder" )
        {
            project.GetResourcesManager().RemoveFolder(data->GetSecondString());
            resourcesTree->Delete(selection[i]);
        }
        else
        {
            gd::LogStatus( _( "No image selected" ) );
        }
    }
}

void ResourcesEditor::OnModNameImageBtClick( wxCommandEvent& event )
{
    if ( m_itemSelected.IsOk() && resourcesTree->GetChildrenCount( m_itemSelected ) == 0 )
        resourcesTree->EditLabel( m_itemSelected );
    else
        gd::LogStatus( _( "No image selected" ) );
}

void ResourcesEditor::OnresourcesTreeItemMenu( wxTreeEvent& event )
{
    //Editor have focus
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    m_itemSelected = event.GetItem();

    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(event.GetItem()));
    if ( data && data->GetString() == "Image" )
        PopupMenu( &ContextMenu );
    else if ( data && data->GetString() == "Folder" )
        PopupMenu( &folderMenu);
    else
        PopupMenu( &emptyMenu );
}

void ResourcesEditor::OnMoreOptions( wxCommandEvent& event )
{
    PopupMenu( &ContextMenu );
}

void ResourcesEditor::OnRefreshBtClick( wxCommandEvent& event )
{
    Refresh();
}

/**
 * Selecting an image
 */
void ResourcesEditor::OnresourcesTreeSelectionChanged( wxTreeEvent& event )
{
    //Editor have focus
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    gd::String name = resourcesTree->GetItemText(event.GetItem());
    //Changement de l'item s�lectionn�
    m_itemSelected = event.GetItem();

    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(event.GetItem()));
    if ( data && data->GetString() == "Image" )
    {
        if ( !project.GetResourcesManager().HasResource(name) )
            return;

        //Update resource preview
        selectedResource = name;
        previewPanel->Refresh();
        previewPanel->Update();
    }

    //Update resource properties
    UpdatePropertyGrid();
}

void ResourcesEditor::UpdatePropertyGrid()
{
    std::vector<gd::String> commonProperties; ///< The name of the properties to be displayed
    bool aFolderIsSelected = false;

    //First construct the list of common properties
    wxArrayTreeItemIds selection;
    resourcesTree->GetSelections(selection);
    for (unsigned int i = 0;i<selection.size();++i)
    {
        gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(selection[i]));
        if ( data && data->GetString() == "Image")
        {
            std::vector<gd::String> properties = project.GetResourcesManager().GetResource(data->GetSecondString()).GetAllProperties(project);
            if ( i == 0 )
                commonProperties = properties;
            else
            {
                //Keep only properties that are common to all the selected resources
                for (unsigned int j = 0;j<commonProperties.size();)
                {
                    if ( find(properties.begin(), properties.end(), commonProperties[j]) == properties.end() )
                        commonProperties.erase(commonProperties.begin()+j);
                    else
                        ++j;
                }
            }
        }
        else if ( data && data->GetString() == "Folder")
            aFolderIsSelected = true;
    }

    //Then display properties and their values
    propertyGrid->GetGrid()->Clear();
    propertyGrid->Append( new wxPropertyCategory(_("General")) );
    wxPGProperty * nameProperty = propertyGrid->Append( new wxStringProperty(_("Name"), "Name", "") );
    if ( selection.size() == 1 )
    {
        gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(selection[0]));
        if ( data )
            propertyGrid->SetPropertyValue(nameProperty, data->GetSecondString());
    }
    else
    {
        if ( !selection.empty() )
        {
            propertyGrid->SetPropertyValue(nameProperty, wxString(_("(Multiple values)")));
            propertyGrid->SetPropertyReadOnly(nameProperty);
        }
    }

    if ( !aFolderIsSelected )
    {
        wxPGProperty * fileProperty = propertyGrid->Append( new gd::FileProperty(_("File"), "File", "") );
        fileProperty->SetAttribute(wxPG_FILE_DIALOG_TITLE, wxString(_("Choose the resource file")));
        fileProperty->SetAttribute(wxPG_FILE_INITIAL_PATH, wxFileName::FileName(project.GetProjectFile()).GetPath());
        fileProperty->SetAttribute(wxPG_FILE_SHOW_RELATIVE_PATH, wxFileName::FileName(project.GetProjectFile()).GetPath());
        propertyGrid->SetPropertyHelpString(fileProperty, _("File of the resource.\nThe filename is relative to the project directory."));
        for (unsigned int i = 0;i<selection.size();++i)
        {
            gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(selection[i]));
            if ( data && data->GetString() == "Image")
            {
                gd::Resource & resource = project.GetResourcesManager().GetResource(data->GetSecondString());

                //If one of the selected resource has no file, mark the file field as N/A.
                if ( !resource.UseFile() )
                {
                    propertyGrid->SetPropertyValue(fileProperty, wxString(_("N/A")));
                    propertyGrid->SetPropertyReadOnly(fileProperty);
                    break;
                }
                else
                {
                    if ( i == 0 )
                        propertyGrid->SetPropertyValue(fileProperty, wxString(resource.GetFile()));
                    else
                    {
                        propertyGrid->SetPropertyValue(fileProperty, wxString(_("(Multiple values)")));
                        propertyGrid->SetPropertyReadOnly(fileProperty);
                        break;
                    }
                }
            }
        }

        //Other properties
        if ( !commonProperties.empty() ) propertyGrid->Append( new wxPropertyCategory(_("Other properties")) );
        for (unsigned int j = 0;j<commonProperties.size();++j)
        {
            wxPGProperty * property = propertyGrid->Append( new wxStringProperty("", commonProperties[j], "") );
            wxString commonValue;

            for (unsigned int i = 0;i<selection.size();++i)
            {
                gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(selection[i]));
                if ( data && data->GetString() == "Image")
                {
                    //It is assumed that the description and the user friendly name
                    //are the same for all the properties with the same name.
                    gd::String propertyUserFriendlyName;
                    gd::String propertyDescription;
                    project.GetResourcesManager().GetResource(data->GetSecondString()).GetPropertyInformation(project, commonProperties[j], propertyUserFriendlyName, propertyDescription);
                    propertyGrid->SetPropertyLabel(property, propertyUserFriendlyName);
                    propertyGrid->SetPropertyHelpString(property, propertyDescription);

                    //Values can be different though
                    gd::String propertyValue = project.GetResourcesManager().GetResource(data->GetSecondString()).GetProperty(project, commonProperties[j]);
                    if ( i == 0 ) commonValue = propertyValue;
                    else if ( commonValue != propertyValue ) commonValue = _("(Multiple values)");
                }
            }

            propertyGrid->SetPropertyValue(property, commonValue);
        }
    }
}

void ResourcesEditor::OnPropertyChanged(wxPropertyGridEvent& event)
{
    gd::String propertyName = event.GetPropertyName();
    gd::String propertyNewValue = event.GetPropertyValue().GetString();

    wxArrayTreeItemIds selection;
    resourcesTree->GetSelections(selection);
    for (unsigned int i = 0;i<selection.size();++i)
    {
        gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(selection[i]));
        if ( data && data->GetString() == "Image")
        {
            if ( propertyName == "File" )
            {
                project.GetResourcesManager().GetResource(data->GetSecondString()).SetFile(propertyNewValue); //Convert it to the current locale (Paths are in the current locale)
                previewPanel->Refresh();
                previewPanel->Update();
            }
            if ( propertyName == "Name" )
            {
                project.GetResourcesManager().RenameResource(renamedItemOldName, propertyNewValue);

                for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
                {
                    project.GetUsedPlatforms()[j]->GetChangesNotifier().OnResourceModified(project, renamedItemOldName);
                    project.GetUsedPlatforms()[j]->GetChangesNotifier().OnResourceModified(project, propertyNewValue);
                }

                RenameInTree(resourcesTree->GetRootItem(), renamedItemOldName, propertyNewValue, "Image");
            }
            else
                project.GetResourcesManager().GetResource(data->GetSecondString()).ChangeProperty(project, propertyName, propertyNewValue);

            for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnResourceModified(project, data->GetSecondString());
        }
        else if ( data && data->GetString() == "Folder")
        {
            if ( project.GetResourcesManager().HasFolder(renamedItemOldName) )
                project.GetResourcesManager().GetFolder(renamedItemOldName).SetName(propertyNewValue);

            RenameInTree(resourcesTree->GetRootItem(), renamedItemOldName, propertyNewValue, "Folder");
        }
    }
}

void ResourcesEditor::OnPropertyChanging(wxPropertyGridEvent& event)
{
    gd::String propertyName = event.GetPropertyName();
    gd::String propertyNewValue = event.GetPropertyValue().GetString();

    wxArrayTreeItemIds selection;
    resourcesTree->GetSelections(selection);
    for (unsigned int i = 0;i<selection.size();++i)
    {
        gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(selection[i]));
        if ( data && data->GetString() == "Image")
        {
            if ( propertyName == "Name" )
            {
                if ( project.GetResourcesManager().HasResource(propertyNewValue) )
                {
                    gd::LogWarning( _( "Unable to rename the image: another image has already this name." ) );
                    event.Veto();
                    return;
                }
                renamedItemOldName = event.GetProperty()->GetValue().GetString();
            }
        }
        else if ( data && data->GetString() == "Folder")
        {
            if ( propertyName == "Name" )
            {
                if ( project.GetResourcesManager().HasFolder(propertyNewValue) )
                {
                    gd::LogWarning( _( "Unable to rename the folder: another folder has already this name." ) );
                    event.Veto();
                    return;
                }
                renamedItemOldName = event.GetProperty()->GetValue().GetString();
            }
        }
    }
}

/**
 * Tool function
 */
void ResourcesEditor::RenameInTree(wxTreeItemId parent, gd::String oldName, gd::String newName, gd::String type)
{
    void * cookie;
    wxTreeItemId item = resourcesTree->GetFirstChild( parent, cookie );
    while ( item.IsOk() )
    {
        //Recurse if needed
        if ( resourcesTree->ItemHasChildren(item) )
            RenameInTree(item, oldName, newName, type);

        //Delete item if needed
        gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(item));
        if ( data && data->GetSecondString() == oldName && data->GetString() == type)
        {
            resourcesTree->SetItemText(item, newName);
            data->SetSecondString(newName);
        }

        item = resourcesTree->GetNextSibling( item );
    }
}

/**
 * End renaming something
 */
void ResourcesEditor::OnresourcesTreeEndLabelEdit( wxTreeEvent& event )
{
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(event.GetItem()));
    if ( !event.IsEditCancelled() && data )
    {
        gd::String newName = event.GetLabel();

        if ( data->GetString() == "Folder" )
        {
            if ( project.GetResourcesManager().HasFolder(newName) )
            {
                gd::LogWarning( _( "Unable to rename the folder: another folder has already this name." ) );
                event.Veto();
                return;
            }

            if ( project.GetResourcesManager().HasFolder(renamedItemOldName) )
                project.GetResourcesManager().GetFolder(renamedItemOldName).SetName(newName);

            RenameInTree(resourcesTree->GetRootItem(), renamedItemOldName, newName, "Folder");
        }
        else if ( data->GetString() == "Image" )
        {
            if ( project.GetResourcesManager().HasResource(newName) )
            {
                gd::LogWarning( _( "Unable to rename the image: another image has already this name." ) );
                event.Veto();
                return;
            }

            project.GetResourcesManager().RenameResource(renamedItemOldName, newName);

            for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
            {
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnResourceModified(project, renamedItemOldName);
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnResourceModified(project, newName);
            }

            RenameInTree(resourcesTree->GetRootItem(), renamedItemOldName, newName, "Image");

            return;
        }
    }
}

/**
 * Rename something
 */
void ResourcesEditor::OnresourcesTreeBeginLabelEdit( wxTreeEvent& event )
{
    if ( gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(event.GetItem())) )
    {
        if ( data->GetString() == "BaseFolder" )
            resourcesTree->EndEditLabel( event.GetItem(), true );
        else
            renamedItemOldName = resourcesTree->GetItemText(event.GetItem());
    }
    else
        resourcesTree->EndEditLabel( event.GetItem(), true );
}

/**
 * Refresh images lists
 */
void ResourcesEditor::Refresh()
{
    resourcesTree->DeleteAllItems();
    resourcesTree->AddRoot( "ImagesBank" );

    //Setup search
    gd::String search = searchCtrl->GetValue();
    search = search.ToUpperCase();
    bool searching = search.empty() ? false : true;

    //Folders
    std::vector<gd::String> folders = project.GetResourcesManager().GetAllFolderList();
    for (unsigned int i = 0;i< folders.size() ;++i)
    {
        gd::ResourceFolder & folder = project.GetResourcesManager().GetFolder(folders[i]);
        wxTreeItemId folderItem = resourcesTree->AppendItem( resourcesTree->GetRootItem(), folders[i], -1, -1, new gd::TreeItemStringData("Folder", folders[i] ));

        std::vector<gd::String> resources = folder.GetAllResourcesList();
        for (unsigned int j=0;j<resources.size();++j)
        {
            gd::Resource & resource = folder.GetResource(resources[j]);

            if ( searching && resource.GetName().ToUpperCase().find(search) == gd::String::npos)
                continue;

            resourcesTree->AppendItem( folderItem, resource.GetName(), -1,-1, new gd::TreeItemStringData("Image", resource.GetName() ));
        }
    }

    //All images
    allImagesItem = resourcesTree->AppendItem( resourcesTree->GetRootItem(), _("All images"), -1,-1, new gd::TreeItemStringData("BaseFolder", "" ));
    std::vector<gd::String> resources = project.GetResourcesManager().GetAllResourcesList();
    for ( unsigned int i = 0;i <resources.size();i++ )
    {
        gd::Resource & resource = project.GetResourcesManager().GetResource(resources[i]);

        if ( searching && resource.GetName().ToUpperCase().find(search) == gd::String::npos)
            continue;

        resourcesTree->AppendItem( allImagesItem, resource.GetName(), -1, -1, new gd::TreeItemStringData("Image", resource.GetName() ));
    }

    resourcesTree->Expand( allImagesItem );
}

void ResourcesEditor::OnDeleteUnusedFiles( wxCommandEvent& event )
{
    std::vector<gd::String> unusedImages =
        gd::ProjectResourcesAdder::GetAllUselessResources(project);

    //Construct corresponding wxArrayString with unused images
    wxArrayString imagesNotUsed;
    wxArrayInt initialSelection;
    for ( unsigned int i = 0;i < unusedImages.size() ;i++ )
    {
        imagesNotUsed.push_back(unusedImages[i]);
        initialSelection.push_back(imagesNotUsed.size()-1);
    }

    //Request the user to choose which images to remove.
    wxMultiChoiceDialog dialog(this, _("These resources seems to be useless:\nCheck resources to delete."), _("Remove useless resources"), imagesNotUsed, wxDEFAULT_DIALOG_STYLE | wxRESIZE_BORDER | wxOK | wxCANCEL);
    dialog.SetSelections(initialSelection);
    dialog.ShowModal();

    //Remove selection
    wxArrayInt selection = dialog.GetSelections();
    for (unsigned int i = 0;i<selection.size();++i)
    {
        gd::String imageName = imagesNotUsed[selection[i]];

        project.GetResourcesManager().RemoveResource(imageName);
        RemoveImageFromTree( resourcesTree->GetRootItem(), imageName );
        project.SetDirty();
    }
}

void ResourcesEditor::OnShowPreviewBtClick( wxCommandEvent& event )
{
    AuiManager1->GetPane(previewPanel).Show();
    AuiManager1->Update();
}
void ResourcesEditor::OnShowPropertyGridBtClick( wxCommandEvent& event )
{
    AuiManager1->GetPane(propertyGrid).Show();
    AuiManager1->Update();
}

void ResourcesEditor::OnAideBtClick( wxCommandEvent& event )
{
    gd::HelpFileAccess::Get()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/edit_image"));
}

void ResourcesEditor::OnresourcesTreeItemActivated(wxTreeEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    AuiManager1->GetPane(propertiesPanel).Show();
    AuiManager1->Update();

    #if !defined(WINDOWS) //MacOS and wxGTK needs additional tweaks
    AuiManager1->GetPane(propertiesPanel).Dock().Bottom(); //Ensure panel is docked otherwise it can't get focus.
    AuiManager1->Update();
    toolbar->Realize(); //Toolbar is emptied if not realized again after calling Update.
    #endif
}

/**
 * Open an external image edition program
 */
void ResourcesEditor::OnOpenPaintProgramClick(wxCommandEvent& event)
{
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(m_itemSelected));
    if ( !data || data->GetString() != "Image" || !project.GetResourcesManager().HasResource(data->GetSecondString()) ) return;

    gd::Resource & resource = project.GetResourcesManager().GetResource(data->GetSecondString());

    wxString result;
    wxConfigBase::Get()->Read( "/EditeursExternes/"+resource.GetKind() , &result );

    if ( result.empty() )
    {
        wxFileDialog dialog(this, _("Choose the program for editing this kind of resource"), "", "", _("Programs (*.exe)|*.exe"));
        dialog.ShowModal();

        wxConfigBase::Get()->Write( "/EditeursExternes/"+resource.GetKind(), dialog.GetPath() );
        wxConfigBase::Get()->Read( "/EditeursExternes/"+resource.GetKind(), &result );
    }

    if ( !result.empty() )
        wxExecute(result+" \""+resource.GetAbsoluteFile(project)+"\"");
}

/**
 * Display a preview of the selected image
 */
void ResourcesEditor::OnpreviewPanelPaint(wxPaintEvent& event)
{
    wxPaintDC dc( previewPanel ); //Cr�ation obligatoire du wxBufferedPaintDC

    if ( project.GetResourcesManager().HasResource(selectedResource) )
        project.GetResourcesManager().GetResource(selectedResource).RenderPreview(dc, *previewPanel, project);
    else
    {
        wxSize size = previewPanel->GetSize();
        dc.SetBrush(wxColour(255,255,255));
        dc.DrawRectangle(0,0, size.GetWidth(), size.GetHeight());

        wxString text = _("Choose a resource in the\nlist to display it.\n\n");
        text += useRibbon ? _("You can add and\nmodify resources using the ribbon.") : _("You can add and\nmodify resources using the toolbar");
        dc.DrawLabel(text, wxRect(wxPoint(0,0), size),wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL);
    }
}

/**
 * Tool function
 */
void ResourcesEditor::ShiftUpElementOfTree()
{
    wxTreeItemId previous = resourcesTree->GetPrevSibling(m_itemSelected);
    wxString oldText = resourcesTree->GetItemText( m_itemSelected );
    wxTreeItemData * oldData = resourcesTree->GetItemData( m_itemSelected );

    resourcesTree->SetItemText( m_itemSelected, resourcesTree->GetItemText(previous) );
    resourcesTree->SetItemData( m_itemSelected, resourcesTree->GetItemData(previous) );
    resourcesTree->SetItemText( previous, oldText );
    resourcesTree->SetItemData( previous, oldData );

    resourcesTree->UnselectItem(m_itemSelected);
    resourcesTree->SelectItem(previous);
}

/**
 * Move up an image
 */
void ResourcesEditor::OnMoveUpSelected(wxCommandEvent& event)
{
    gd::String name = resourcesTree->GetItemText(m_itemSelected);
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(m_itemSelected));
    if ( !data ) return;

    //Move an image
    if ( data->GetString() == "Image" )
    {
        gd::TreeItemStringData * parentFolderData = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(GetSelectedFolderItem()));

        //Move image from base folder
        if ( !parentFolderData || parentFolderData->GetString() == "BaseFolder" )
        {
            if ( project.GetResourcesManager().MoveResourceUpInList(name) )
                ShiftUpElementOfTree();
        }
        //Move an image of a folder
        else if ( parentFolderData && parentFolderData->GetString() == "Folder" )
        {
            gd::ResourceFolder & folder = project.GetResourcesManager().GetFolder(parentFolderData->GetSecondString());
            if ( folder.MoveResourceUpInList(name) )
                ShiftUpElementOfTree();
        }

    }
    //Move a folder
    else if ( data->GetString() == "Folder" )
    {
        project.GetResourcesManager().MoveFolderUpInList(name);
        Refresh();
    }
}

/**
 * Tool function
 */
void ResourcesEditor::ShiftDownElementOfTree()
{
    wxTreeItemId next = resourcesTree->GetNextSibling(m_itemSelected);
    wxString oldText = resourcesTree->GetItemText( m_itemSelected );
    wxTreeItemData * oldData = resourcesTree->GetItemData( m_itemSelected );

    resourcesTree->SetItemText( m_itemSelected, resourcesTree->GetItemText(next) );
    resourcesTree->SetItemData( m_itemSelected, resourcesTree->GetItemData(next) );
    resourcesTree->SetItemText( next, oldText );
    resourcesTree->SetItemData( next, oldData );

    resourcesTree->UnselectItem(m_itemSelected);
    resourcesTree->SelectItem(next);
}

/**
 * Move down an image
 */
void ResourcesEditor::OnMoveDownSelected(wxCommandEvent& event)
{
    gd::String name = resourcesTree->GetItemText(m_itemSelected);
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(m_itemSelected));
    if ( !data ) return;

    //Move an image
    if ( data->GetString() == "Image" )
    {
        gd::TreeItemStringData * parentFolderData = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(GetSelectedFolderItem()));

        //Move image from base folder
        if ( !parentFolderData || parentFolderData->GetString() == "BaseFolder" )
        {
            if ( project.GetResourcesManager().MoveResourceDownInList(name) )
                ShiftDownElementOfTree();
        }
        //Move an image of a folder
        else if ( parentFolderData && parentFolderData->GetString() == "Folder" )
        {
            gd::ResourceFolder & folder = project.GetResourcesManager().GetFolder(parentFolderData->GetSecondString());
            if ( folder.MoveResourceDownInList(name) )
                ShiftDownElementOfTree();
        }

    }
    //Move a folder
    else if ( data->GetString() == "Folder" )
    {
        project.GetResourcesManager().MoveFolderDownInList(name);
        Refresh();
    }
}

void ResourcesEditor::TriggerDrop(wxCoord x, wxCoord y, std::vector<gd::String > resources)
{
    m_itemSelected = resourcesTree->HitTest(wxPoint(x,y));
    if ( !m_itemSelected.IsOk() ) return;

    gd::String name = resourcesTree->GetItemText(m_itemSelected);
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData( m_itemSelected ));
    if ( !data ) return;

    std::cout << "TODO: Unimplemented drop of resources";

    //Move an image
    /*if ( data->GetString() == "Image" )
    {
        gd::TreeItemStringData * parentFolderData = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(GetSelectedFolderItem()));

        //Move image from base folder
        if ( !parentFolderData || parentFolderData->GetString() == "BaseFolder" )
        {
        }
        //Move into a folder
        else if ( parentFolderData && parentFolderData->GetString() == "Folder" )
        {
            gd::ResourceFolder & folder = project.GetResourcesManager().GetFolder(parentFolderData->GetSecondString());
            if ( !folder.HasResource(selectedResource) )
            {
                project.GetResourcesManager().GetFolder(name).AddResource(selectedResource, project.GetResourcesManager());
            }
        }

    }
    //Move into a folder
    else if ( data->GetString() == "Folder" )
    {
        gd::ResourceFolder & folder = project.GetResourcesManager().GetFolder(name);
        if ( !folder.HasResource(selectedResource) )
        {
            project.GetResourcesManager().GetFolder(name).AddResource(selectedResource, project.GetResourcesManager());
        }

        Refresh();
    }*/
}

/**
 * Show appropriate ribbon page when get focus.
 */
void ResourcesEditor::OnSetFocus(wxFocusEvent& event)
{
    ForceRefreshRibbonAndConnect();
}

void ResourcesEditor::ForceRefreshRibbonAndConnect()
{
    if ( useRibbon )
    {
        mainFrameWrapper.GetRibbon()->SetActivePage(1);
        ConnectEvents();
    }
}

void ResourcesEditor::OnAddFolderSelected(wxCommandEvent& event)
{
    gd::String newName = _("New folder");
    unsigned int i = 1;
    while( project.GetResourcesManager().HasFolder(newName) )
    {
        newName = _("New folder") + " " + gd::String::From(i);
        ++i;
    }

    project.GetResourcesManager().CreateFolder(newName);

    wxTreeItemId newFolderItem = resourcesTree->InsertItem(resourcesTree->GetRootItem(),
                                                           project.GetResourcesManager().GetAllFolderList().size(),
                                                           newName, -1, -1, new gd::TreeItemStringData("Folder", newName));
    resourcesTree->EditLabel(newFolderItem);
}

void ResourcesEditor::OnsearchCtrlText(wxCommandEvent& event)
{
    Refresh();
}

void ResourcesEditor::OnresourcesTreeBeginDrag(wxTreeEvent& event)
{
    wxArrayTreeItemIds selection;
    resourcesTree->GetSelections(selection);

    wxString draggedImagesPartialCommand;
    for (unsigned int i = 0;i<selection.size();++i)
    {
        gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(resourcesTree->GetItemData(selection[i]));
        if ( !data ) continue;

        //Move an image
        if ( data->GetString() == "Image" )
        {
            draggedImagesPartialCommand += ";"+resourcesTree->GetItemText(selection[i]);
        }
    }

    if (!draggedImagesPartialCommand.empty())
    {
        //Start dragging one or more images.
        wxTextDataObject name("NORMAL"+draggedImagesPartialCommand);
        wxDropSource dragSource(this);
        dragSource.SetData(name);
        dragSource.DoDragDrop(true);
        event.Veto();
    }
}

void ResourcesEditor::OnresourcesTreeKeyDown(wxTreeEvent& event)
{
    if ( event.GetItem().IsOk() ) m_itemSelected = event.GetItem();

    if(event.GetKeyEvent().GetModifiers() == wxMOD_CMD)
    {
        switch(event.GetKeyCode()) {
            case 'J':
            {
                wxCommandEvent useless;
                OnMoveUpSelected(useless);
                break;
            }
            case 'K':
            {
                wxCommandEvent useless;
                OnMoveDownSelected(useless);
                break;
            }
            default:
                break;
        }
    }
    else
    {
        switch(event.GetKeyCode()) {
            case WXK_F2:
            {
                wxCommandEvent useless;
                OnModNameImageBtClick(useless);
                break;
            }
            case WXK_DELETE:
            {
                wxCommandEvent useless;
                OnDelImageBtClick(useless);
                break;
            }
            default:
                break;
        }
    }

    event.Skip();
}

#endif
