#ifndef EDITOROBJETSGROUPS_H
#define EDITOROBJETSGROUPS_H

//(*Headers(EditorObjetsGroups)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/panel.h>
//*)
#include <wx/ribbon/page.h>
#include <wx/toolbar.h>
#include <string>
#include <vector>
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include "GDCore/PlatformDefinition/ObjectGroup.h"
namespace gd { class Project; }
namespace gd { class Layout; }
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

/**
 * \brief Editor which displays the groups of objects available and allows to edit them.
 *
 * \todo Move in GDCore.
 * \todo Replace toolbar with an AUI one.
 */
class EditorObjetsGroups: public wxPanel
{
public:

    EditorObjetsGroups(wxWindow* parent, gd::Project & project_, gd::Layout & layout_, std::vector < gd::ObjectGroup > * objectsGroups_, gd::MainFrameWrapper & mainFrameWrapper);
    virtual ~EditorObjetsGroups();

    //(*Declarations(EditorObjetsGroups)
    wxMenuItem* MenuItem7;
    wxMenuItem* MenuItem5;
    wxMenuItem* MenuItem2;
    wxMenuItem* MenuItem1;
    wxMenuItem* MenuItem4;
    wxMenu ContextMenu;
    wxPanel* Panel3;
    wxMenuItem* MenuItem3;
    wxMenuItem* MenuItem6;
    wxMenu multipleContextMenu;
    wxTreeCtrl* ObjetsGroupsList;
    //*)
    wxTreeItemId itemSelected;

    static void CreateRibbonPage(wxRibbonPage * page);
    void ConnectEvents();

    void Refresh();

protected:

    //(*Identifiers(EditorObjetsGroups)
    static const long ID_PANEL4;
    static const long ID_TREECTRL1;
    static const long IdGroupEdit;
    static const long idModName;
    static const long idAddGroup;
    static const long idDelGroup;
    static const long ID_MENUITEM1;
    static const long ID_MENUITEM2;
    static const long ID_MENUITEM3;
    static const long ID_MENUITEM4;
    //*)
    static const long ID_Refresh;
    static const long ID_AddGroup;
    static const long ID_DelGroup;
    static const long ID_EditGroup;
    static const long ID_Help;
    static const long idRibbonAdd;
    static const long idRibbonDel;
    static const long idRibbonUp;
    static const long idRibbonDown;
    static const long idRibbonEdit;
    static const long idRibbonModName;
    static const long idRibbonHelp;

private:

    //(*Handlers(EditorObjetsGroups)
    void OnPanel3Resize(wxSizeEvent& event);
    void OnTreeCtrl1ItemRightClick(wxTreeEvent& event);
    void OnEditGroupSelected(wxCommandEvent& event);
    void OnAddGroupSelected(wxCommandEvent& event);
    void OnDelGroupSelected(wxCommandEvent& event);
    void OnObjetsGroupsListItemActivated(wxTreeEvent& event);
    void OnObjetsGroupsListBeginLabelEdit(wxTreeEvent& event);
    void OnObjetsGroupsListEndLabelEdit(wxTreeEvent& event);
    void OnModNameSelected(wxCommandEvent& event);
    void OnObjetsGroupsListItemDoubleClicked(wxTreeEvent& event);
    void OnSetFocus(wxFocusEvent& event);
    void OnCopyGroupSelected(wxCommandEvent& event);
    void OnCutGroupSelected(wxCommandEvent& event);
    void OnPasteGroupSelected(wxCommandEvent& event);
    //*)
    void OnHelp(wxCommandEvent& event);
    void OnMoveUpSelected(wxCommandEvent& event);
    void OnMoveDownSelected(wxCommandEvent& event);
    bool EditingLayoutGroups();

    std::string renamedGroupOldName;

    wxToolBar * toolbar;

    gd::Project & project; ///< Reference to the project the groups belong to.
    gd::Layout & layout; ///< Reference to the layout containing the group to edit
    std::vector < gd::ObjectGroup > * objectsGroups; ///< The groups list to edit ( This is not necessarily the groups of the layout, as we can also edit global groups )

    gd::MainFrameWrapper & mainFrameWrapper;

    DECLARE_EVENT_TABLE()
};

#endif

