/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCORE_CHOOSEVARIABLEDIALOG_H
#define GDCORE_CHOOSEVARIABLEDIALOG_H

//(*Headers(ChooseVariableDialog)
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/treelist.h>
#include <wx/aui/aui.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
namespace gd { class VariablesContainer; }
namespace gd { class Object; }
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class Variable; }
#include <wx/toolbar.h>
#include <memory>
#include "GDCore/String.h"

namespace gd
{

/**
 * \brief Dialog used to display variables of a gd::VariablesContainer, edit them and/or choose one.
 *
 * Also offer a nice feature to scan the associated project/layout for undeclared variables.<br>
 * The dialog can be used as an editor only, see the constructor.
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API ChooseVariableDialog: public wxDialog
{
public:

    /**
     * \brief Default constructor.
     *
     * \param parent The parent window
     * \param variablesContainer A reference to the container to be used
     * \param editingOnly If set to true, the dialog will act as a dialog to edit the variables and not to choose one ( Double click won't close the dialog for example ).
     */
    ChooseVariableDialog(wxWindow* parent, gd::VariablesContainer & variablesContainer, bool editingOnly=false);

    /**
     * \brief Specify an optional associated project
     * \param project Associated project. If different from NULL, global variables from this project will be scanned when searching for undeclared variables
     */
    void SetAssociatedProject(const gd::Project * project);

    /**
     * \brief Specify an optional associated layout
     * \param project Associated project.
     * \param project Associated layout. If different from NULL, layout variables from this layout will be scanned when searching for undeclared variables
     */
    void SetAssociatedLayout(const gd::Project * project, const gd::Layout * layout);

    /**
     * \brief Specify an optional associated object
     * \param project Associated project.
     * \param project Associated layout.
     * \param project Associated object. If different from NULL, object variables from this layout will be scanned when searching for undeclared variables
     */
    void SetAssociatedObject(const gd::Project * project, const gd::Layout * layout, const gd::Object * object);

    /**
     * \brief Return the full name of the selected variable.
     */
    gd::String GetSelectedVariable() const { return selectedVariableFullName; };

    /**
     * Destructor
     */
    virtual ~ChooseVariableDialog();

    //(*Declarations(ChooseVariableDialog)
    wxAuiManager* AuiManager1;
    wxStaticBitmap* StaticBitmap2;
    wxPanel* toolbarPanel;
    wxAuiToolBar* toolbar;
    wxMenuItem* MenuItem2;
    wxMenuItem* MenuItem1;
    wxMenuItem* MenuItem4;
    wxHyperlinkCtrl* HyperlinkCtrl1;
    wxButton* cancelBt;
    wxTreeListCtrl* variablesList;
    wxStaticLine* StaticLine2;
    wxMenuItem* MenuItem3;
    wxMenu contextMenu;
    wxButton* okBt;
    //*)

protected:

    //(*Identifiers(ChooseVariableDialog)
    static const long ID_AUITOOLBAR1;
    static const long ID_PANEL1;
    static const long ID_TREELISTCTRL1;
    static const long ID_STATICLINE2;
    static const long ID_STATICBITMAP2;
    static const long ID_HYPERLINKCTRL1;
    static const long ID_BUTTON1;
    static const long ID_BUTTON3;
    static const long ID_MENUITEM1;
    static const long ID_MENUITEM2;
    static const long ID_MENUITEM3;
    static const long ID_MENUITEM4;
    //*)
    static const long idAddVar;
    static const long idEditVar;
    static const long idDelVar;
    static const long idMoveUpVar;
    static const long idRenameVar;
    static const long idMoveDownVar;
    static const long ID_Help;
    static const long idFindUndeclared;

private:

    //(*Handlers(ChooseVariableDialog)
    void OnokBtClick(wxCommandEvent& event);
    void OncancelBtClick(wxCommandEvent& event);
    void OnhelpBtClick(wxCommandEvent& event);
    void OntoolbarPanelResize(wxSizeEvent& event);
    void OnResize(wxSizeEvent& event);
    void OnvariablesListKeyDown1(wxKeyEvent& event);
    void OnEditValueSelected(wxCommandEvent& event);
    void OnRenameSelected(wxCommandEvent& event);
    void OnAddChildSelected(wxCommandEvent& event);
    void OnRemoveSelected(wxCommandEvent& event);
    //*)
    void OnItemActivated(wxTreeListEvent& event);
    void OnRightClick(wxTreeListEvent& event);
    void OnItemSelectionChanged(wxTreeListEvent& event);
    void OnAddVarSelected(wxCommandEvent& event);
    void OnDelVarSelected(wxCommandEvent& event);
    void OnMoveUpVarSelected(wxCommandEvent& event);
    void OnMoveDownVarSelected(wxCommandEvent& event);
    void OnFindUndeclaredSelected(wxCommandEvent& event);
    void RefreshAll();
    void UpdateTitle();
    void UpdateSelectedAndParentVariable();
    void RefreshVariable(wxTreeListItem item, const gd::String & name, const gd::Variable & variable);
    wxTreeListItem GetPreviousSibling(wxTreeListCtrl * ctrl, wxTreeListItem item);

    gd::VariablesContainer & variablesContainer; ///< gd::VariablesContainer storing the variables
    std::shared_ptr<gd::VariablesContainer> temporaryContainer; ///< Temporary container used to allow to make temporary changes before applying them to the real variables container if Ok is pressed.
    bool editingOnly; ///< If set to true, the dialog will act as a dialog to edit the variables and not to choose one ( Double click won't close the dialog for example ).
    const gd::Project * associatedProject;
    const gd::Layout * associatedLayout;
    const gd::Object * associatedObject;

    gd::String selectedVariableName; ///< Contains the name of the last selected variable.
    gd::String selectedVariableFullName; ///< Contains the full name of the last selected variable. ( full gd::String to access to the variable )
    gd::Variable * selectedVariable; ///< A pointer to the focused variable ( Can be NULL ).
    gd::Variable * parentVariable; ///< A pointer to the parent of the selected variable ( Can be NULL if not applicable ).

    gd::String oldName; ///< Used to remember the variable old name when renaming
    unsigned int modificationCount; ///< Track the number of modification. If the user made lots of modifications and wants to cancel, he will be warned.

    DECLARE_EVENT_TABLE()
};

}

#endif
#endif
