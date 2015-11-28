/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCORE_RESOURCESEDITOR_H
#define GDCORE_RESOURCESEDITOR_H
//(*Headers(ResourcesEditor)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/textctrl.h>
#include <wx/aui/aui.h>
#include <wx/propgrid/manager.h>
#include <wx/panel.h>
//*)
#include <wx/srchctrl.h>
#include <wx/aui/aui.h>
#include <memory>
#include "GDCore/String.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
namespace gd { class ResourceLibraryDialog; }
namespace gd { class Project; }
namespace gd { class Resource; }

/**
 * \brief Panel for editing the resources of a game.
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API ResourcesEditor: public wxPanel
{
public:

    ResourcesEditor(wxWindow* parent, gd::Project & project, gd::MainFrameWrapper & mainFrameWrapper_, bool useRibbon_ = false );
    virtual ~ResourcesEditor();

    gd::Project & project; ///< The project being edited in the editor

    void Refresh();

    /**
     * Ask the resources editor to add the resources contained into \a filenames.
     * \return A vector containing the name of the added resources.
     */
    std::vector<gd::String> AddResources(const std::vector<gd::String> & filenames, const gd::String & kind);

    /**
     * Ask the resources editor to add the resources contained into \a filenames.
     * If \a destinationDir is not empty, the resources files are copied into this directory
     * (which is relative to the project directory) before being added to the project.
     * \return A vector containing the name of the added resources.
     */
    std::vector<gd::String> CopyAndAddResources(std::vector<gd::String> filenames, const gd::String & destinationDir, const gd::String & kind);

    /**
     * \brief Called by DndTextResourcesEditor when one or more resources from the editor has been dropped
     * into this same editor.
     *
     * \see DndTextResourcesEditor
     */
    void TriggerDrop(wxCoord x, wxCoord y, std::vector<gd::String > resources);

    //Item s�lectionn� dans la liste
    wxTreeItemId m_itemSelected;

    //(*Declarations(ResourcesEditor)
    wxAuiManager* AuiManager1;
    wxMenuItem* MenuItem8;
    wxAuiToolBar* toolbar;
    wxMenuItem* MenuItem7;
    wxSearchCtrl* searchCtrl;
    wxPropertyGridManager* propertyGrid;
    wxMenu emptyMenu;
    wxMenuItem* MenuItem5;
    wxMenuItem* MenuItem2;
    wxTreeCtrl* resourcesTree;
    wxMenuItem* MenuItem4;
    wxMenuItem* MenuItem14;
    wxMenuItem* MenuItem11;
    wxMenuItem* MenuItem15;
    wxMenuItem* MenuItem13;
    wxMenu ContextMenu;
    wxMenuItem* MenuItem10;
    wxMenuItem* MenuItem12;
    wxPanel* corePanel;
    wxMenuItem* MenuItem6;
    wxPanel* previewPanel;
    wxPanel* propertiesPanel;
    wxMenuItem* MenuItem16;
    wxMenuItem* MenuItem9;
    wxMenu folderMenu;
    //*)

    //static void CreateRibbonPage(wxRibbonPage * page); //Creation is made inside MainFrame.

    /**
     * Can be called by parent so as to refresh ribbon for this editor.
     */
    void ForceRefreshRibbonAndConnect();

    static const long idRibbonAdd;
    static const long idRibbonAddFromLibrary;
    static const long idRibbonDel;
    static const long idRibbonAddDossier;
    static const long idRibbonRemoveDossier;
    static const long idRibbonUp;
    static const long idRibbonDown;
    static const long idRibbonShowPreview;
    static const long idRibbonShowPropertyGrid;
    static const long idRibbonExternalProgram;
    static const long idRibbonHelp;
    static const long idRibbonRefresh;
    static const long idRibbonDeleteUnused;

protected:

    //(*Identifiers(ResourcesEditor)
    static const long ID_AUITOOLBARITEM1;
    static const long ID_AUITOOLBARITEM2;
    static const long ID_AUITOOLBARITEM5;
    static const long ID_AUITOOLBAR1;
    static const long ID_TREECTRL1;
    static const long ID_TEXTCTRL1;
    static const long ID_PANEL1;
    static const long ID_PANEL3;
    static const long ID_PROPGRID;
    static const long ID_PANEL2;
    static const long idMenuMod;
    static const long idMenuAjouter;
    static const long idMenuAddAudio;
    static const long idMenuDel;
    static const long ID_MENUITEM9;
    static const long idMoveUp;
    static const long idMoveDown;
    static const long ID_MENUITEM1;
    static const long ID_MENUITEM10;
    static const long ID_MENUITEM2;
    static const long ID_MENUITEM3;
    static const long ID_MENUITEM6;
    static const long ID_MENUITEM11;
    static const long ID_MENUITEM5;
    static const long ID_MENUITEM4;
    static const long ID_MENUITEM7;
    static const long ID_MENUITEM8;
    //*)
    static const long ID_BITMAPBUTTON1;
    static const long ID_BITMAPBUTTON5;
    static const long ID_BITMAPBUTTON3;
    static const long ID_BITMAPBUTTON6;
    static const long idMenuResourcesLibrary;


private:

    //(*Handlers(ResourcesEditor)
    void OnHautImageBtClick(wxCommandEvent& event);
    void OnDelImageBtClick(wxCommandEvent& event);
    void OnModNameImageBtClick(wxCommandEvent& event);
    void OnAddImageBtClick(wxCommandEvent& event);
    void OnPaint(wxPaintEvent& event);
    void OnBanqueImageListItemMenu(wxTreeEvent& event);
    void OnRefreshBtClick(wxCommandEvent& event);
    void OnBanqueImageListItemActivated(wxTreeEvent& event);
    void OnBanqueImageListSelectionChanged(wxTreeEvent& event);
    void OnBanqueImageListDeleteItem(wxTreeEvent& event);
    void OnBanqueImageListEndLabelEdit(wxTreeEvent& event);
    void OnBanqueImageListBeginLabelEdit(wxTreeEvent& event);
    void OnBanqueImageListBeginDrag(wxTreeEvent& event);
    void OnModFileImage(wxCommandEvent& event);
    void OnChercherBtClick(wxCommandEvent& event);
    void OnAideBtClick(wxCommandEvent& event);
    void DossierBt(wxCommandEvent& event);
    void OnMenuItem5Selected(wxCommandEvent& event);
    void OnMenuItem6Selected(wxCommandEvent& event);
    void OnModPropSelected(wxCommandEvent& event);
    void OnOpenPaintProgramClick(wxCommandEvent& event);
    void OnBanqueImageListItemActivated1(wxTreeEvent& event);
    void OntoolbarPanelResize(wxSizeEvent& event);
    void OnapercuPanelPaint(wxPaintEvent& event);
    void OnMoveUpSelected(wxCommandEvent& event);
    void OnMoveDownSelected(wxCommandEvent& event);
    void OnSetFocus(wxFocusEvent& event);
    void OnResize(wxSizeEvent& event);
    void OnAddFolderSelected(wxCommandEvent& event);
    void OnRemoveFolderSelected(wxCommandEvent& event);
    void OnremoveFolderOnlySelected(wxCommandEvent& event);
    void OnsearchCtrlText(wxCommandEvent& event);
    void OnresourcesTreeBeginLabelEdit(wxTreeEvent& event);
    void OnresourcesTreeEndLabelEdit(wxTreeEvent& event);
    void OnresourcesTreeItemActivated(wxTreeEvent& event);
    void OnresourcesTreeSelectionChanged(wxTreeEvent& event);
    void OnresourcesTreeItemMenu(wxTreeEvent& event);
    void OnapercuPanelResize(wxSizeEvent& event);
    void OnresourcesTreeBeginDrag(wxTreeEvent& event);
    void OnpreviewPanelPaint(wxPaintEvent& event);
    void OnpreviewPanelResize(wxSizeEvent& event);
    void OnresourcesTreeKeyDown(wxTreeEvent& event);
    void OnresourcesTreeEndDrag(wxTreeEvent& event);
    void OnAddFromLibraryToolbarBtClick(wxCommandEvent& event);
    void OnAddAudioSelected(wxCommandEvent& event);
    //*)
    void OnMoreOptions( wxCommandEvent& event );
    void OnAddFromLibraryBtClick(wxCommandEvent& event);
    void OnDeleteUnusedFiles( wxCommandEvent& event );
    void OnShowPreviewBtClick( wxCommandEvent& event );
    void OnShowPropertyGridBtClick( wxCommandEvent& event );
    void ConnectEvents();
    void OnPropertyChanged(wxPropertyGridEvent& event);
    void OnPropertyChanging(wxPropertyGridEvent& event);


    void UpdatePropertyGrid();
    void RemoveImageFromTree(wxTreeItemId parent, gd::String imageName);
    void RenameInTree(wxTreeItemId parent, gd::String oldName, gd::String newName, gd::String type);
    wxTreeItemId GetSelectedFolderItem();
    void ShiftUpElementOfTree();
    void ShiftDownElementOfTree();

    wxTreeItemId allImagesItem;

    gd::MainFrameWrapper mainFrameWrapper;
    bool useRibbon;
    bool editorJustConstructed;

    gd::String selectedResource;
    gd::String renamedItemOldName;

    gd::ResourceLibraryDialog * resourceLibraryDialog;

    DECLARE_EVENT_TABLE()
};
#endif
#endif
