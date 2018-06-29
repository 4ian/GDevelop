#ifndef OBJECTSEDITOR_H
#define OBJECTSEDITOR_H

//(*Headers(ObjectsEditor)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/textctrl.h>
#include <wx/panel.h>
//*)
#include <wx/toolbar.h>
#include <wx/image.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>
#include <wx/srchctrl.h>
#include <functional>
#include <string>
#include <vector>
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/ObjectListDialogsHelper.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasAssociatedEditor.h"
#include "GDCore/String.h"
class LayoutEditorPropertiesPnl;

namespace gd {

/**
 * \brief Panel allowing to display and edit objects
 *
 * \todo Move this to GDCore.
 */
class ObjectsEditor: public wxPanel, public gd::LayoutEditorCanvasAssociatedEditor
{
public:

    /**
     * \brief Default constructor
     * \param parent wxWidgets parent window
     * \param project The project being edited
     * \param layout The layout being edited.
     * \param mainFrameWrapper gd::MainFrameWrapper object
     */
    ObjectsEditor(wxWindow* parent, gd::Project & project, gd::Layout & layout, gd::MainFrameWrapper & mainFrameWrapper_);

    virtual ~ObjectsEditor();

    /**
     * \brief Open the editor of the specified object
     */
    void EditObject(gd::Object & object, bool isGlobalObject);

    /**
     * \brief Select the specified object in the list
     */
    void SelectObject(const gd::Object & object, bool isGlobalObject);

    /**
     * \brief Refresh the editor.
     */
    void Refresh();

    /**
     * \brief Set a function to call each time the list is refreshed.
     */
    void OnRefreshed(std::function<void()> cb) { onRefreshedCb = cb; }

    /**
     * \brief Set a function to call each time a change is made.
     */
    void OnChange(std::function<void(gd::String)> cb) { onChangeCb = cb; }

    /**
     * \brief Create the ribbon buttons for this editor
     */
    static void CreateRibbonPage(wxRibbonPage * page);

    /**
     * \brief Connect the ribbons buttons to this editor instance
     */
    void ConnectEvents();

    /**
     * \brief Enable or disable the editor.
     */
    virtual bool Enable(bool enable=true) { return wxWindow::Enable(enable); };

    /**
     * \brief Can be called by another editor ( Typically a gd::LayoutEditorCanvas, which has a list of editors
     * of type gd::LayoutEditorCanvasAssociatedEditor ) to notify that objects have been changed.
     */
    virtual void ObjectsUpdated() { Refresh(); };

    /**
     * \brief Can be used to associate a LayoutEditorPropertiesPnl, and the wxAuiManager used to display it,
     * to the editor.
     */
    void SetAssociatedPropertiesPanel(LayoutEditorPropertiesPnl * propPnl, wxAuiManager * manager);

    /**
     * \brief Get the wxTreeCtrl used to render the objects and groups list.
     */
    wxTreeCtrl * GetObjectsList() { return objectsList; }

    wxMenu & GetContextMenu() { return contextMenu; }
    wxMenu & GetEmptyContextMenu() { return emptyContextMenu; }
    wxMenu & GetMultipleContextMenu() { return multipleContextMenu; }

protected:

    //(*Identifiers(ObjectsEditor)
    static const long ID_TREECTRL1;
    static const long ID_TEXTCTRL1;
    static const long idMenuModObj;
    static const long idMenuAddAuto;
    static const long idMenuProp;
    static const long idMenuAddObj;
    static const long idMenuDelObj;
    static const long idMenuModName;
    static const long ID_SETGLOBALITEM;
    static const long idMoveUp;
    static const long idMoveDown;
    static const long idMenuCopy;
    static const long idMenuCut;
    static const long idMenuPaste;
    static const long ID_MENUITEM7;
    static const long IdGroupEdit;
    static const long idModName;
    static const long ID_MENUITEM8;
    static const long idAddGroup;
    static const long idDelGroup;
    static const long ID_MENUITEM1;
    static const long ID_MENUITEM2;
    static const long ID_MENUITEM3;
    static const long ID_MENUITEM4;
    static const long ID_MENUITEM5;
    static const long ID_MENUITEM6;
    //*)
    static const long idRibbonAdd;
    static const long idRibbonAddGroup;
    static const long idRibbonDel;
    static const long idRibbonUp;
    static const long idRibbonDown;
    static const long idRibbonModProp;
    static const long idRibbonModName;
    static const long idRibbonCopy;
    static const long idRibbonCut;
    static const long idRibbonPaste;
    static const long idRibbonHelp;
    static const long idRibbonRefresh;

private:

    //(*Declarations(ObjectsEditor)
    wxMenuItem* MenuItem8;
    wxMenuItem* MenuItem7;
    wxSearchCtrl* searchCtrl;
    wxMenuItem* MenuItem5;
    wxMenuItem* MenuItem2;
    wxMenu groupContextMenu;
    wxMenuItem* MenuItem1;
    wxMenuItem* MenuItem4;
    wxTreeCtrl* objectsList;
    wxMenuItem* MenuItem11;
    wxMenuItem* copyMenuI;
    wxMenuItem* MenuItem13;
    wxMenuItem* MenuItem10;
    wxMenuItem* MenuItem12;
    wxMenuItem* moveUpMenuI;
    wxMenuItem* MenuItem3;
    wxMenu contextMenu;
    wxMenuItem* MenuItem6;
    wxMenuItem* moveDownMenuI;
    wxMenuItem* cutMenuI;
    wxMenu emptyContextMenu;
    wxMenu multipleContextMenu;
    wxMenuItem* MenuItem9;
    wxMenuItem* pasteMenuI;
    //*)

    //(*Handlers(ObjectsEditor)
    void OnobjectsListItemActivated(wxTreeEvent& event);
    void OnobjectsListItemRightClick(wxTreeEvent& event);
    void OnobjectsListItemMenu(wxTreeEvent& event);
    void OnobjectsListKeyDown(wxTreeEvent& event);
    void OnobjectsListBeginLabelEdit(wxTreeEvent& event);
    void OnobjectsListEndLabelEdit(wxTreeEvent& event);
    void OnobjectsListSelectionChanged(wxTreeEvent& event);
    void OnMenuEditObjectSelected(wxCommandEvent& event);
    void OnMenuPropertiesSelected(wxCommandEvent& event);
    void OnMenuRenameSelected(wxCommandEvent& event);
    void OnAddObjectSelected(wxCommandEvent& event);
    void OnDeleteSelected(wxCommandEvent& event);
    void OnMoveupSelected(wxCommandEvent& event);
    void OnMoveDownSelected(wxCommandEvent& event);
    void OnCopySelected(wxCommandEvent& event);
    void OnCutSelected(wxCommandEvent& event);
    void OnPasteSelected(wxCommandEvent& event);
    void OnAddGroupSelected(wxCommandEvent& event);
    void OnsearchCtrlText(wxCommandEvent& event);
    void OnSetGlobalSelected(wxCommandEvent& event);
    void OnSetFocus(wxFocusEvent& event);
    void OnobjectsListBeginDrag(wxTreeEvent& event);
    void OnMenuAddBehaviorSelected(wxCommandEvent& event);
    //*)
    void OnHelpSelected(wxCommandEvent& event);
    wxTreeItemId AddObjectsToList(gd::ClassWithObjects & objects, bool globalObject);
    wxTreeItemId AddGroupsToList(std::vector <gd::ObjectGroup> & groups, bool globalGroup);
    void UpdateGroup(wxTreeItemId groupItem);
    gd::Object * GetSelectedObject();
    gd::ObjectGroup * GetSelectedGroup();
    void UpdateAssociatedPropertiesPanel();
    void SelectItem(wxTreeItemId parent, gd::String name, gd::String dataStr1, gd::String dataStr2);

    wxTreeItemId GetLastLayoutObjectItem() const;
    wxTreeItemId GetLastGlobalObjectItem() const;
    wxTreeItemId GetLastLayoutGroupItem() const;
    wxTreeItemId GetLastGlobalGroupItem() const;

    //Tools functions
    bool HasGroupNamed(gd::String name, const std::vector<gd::ObjectGroup> & groups) const;
    gd::ObjectGroup & GetGroup(gd::String name, std::vector<gd::ObjectGroup> & groups);
    void RemoveGroup(gd::String name, std::vector<gd::ObjectGroup> & groups);

    gd::String GetExistingObjectsErrorMessage(unsigned int nameCheckResult, const std::vector<gd::String> &layoutsWithSameName) const;

    gd::Project & project;
    gd::Layout & layout;
    gd::MainFrameWrapper & mainFrameWrapper;

    static wxRibbonButtonBar * objectsRibbonBar;
    static wxRibbonButtonBar * selectionRibbonBar;
    static wxRibbonButtonBar * clipboardRibbonBar;

    LayoutEditorPropertiesPnl * propPnl;
    wxAuiManager * propPnlManager;

    ObjectListDialogsHelper listsHelper; ///< The helper used for rendering lists.
    wxTreeItemId objectsRootItem;
    wxTreeItemId groupsRootItem;

    gd::String renamedItemOldName;
    wxTreeItemId lastSelectedItem;
    std::function<void()> onRefreshedCb;
    std::function<void(gd::String)> onChangeCb;

    DECLARE_EVENT_TABLE()
};

}

#endif
