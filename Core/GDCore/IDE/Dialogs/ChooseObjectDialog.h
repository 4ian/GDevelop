/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef GDCORE_CHOOSEOBJECTDIALOG_H
#define GDCORE_CHOOSEOBJECTDIALOG_H

#include "GDCore/String.h"
#include <vector>
//(*Headers(ChooseObjectDialog)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/imaglist.h>
#include <wx/srchctrl.h>
namespace gd { class Project; }
namespace gd { class Layout; }

namespace gd
{

/**
 * \brief Dialog used to choose an object (or a group) among project/layout objects or groups.
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API ChooseObjectDialog: public wxDialog
{
public:

    /**
     * Default constructor
     * \param parent The wxWidgets parent window
     * \param project Project
     * \param layout Layout
     * \param canSelectGroup true if objects group can be chosen
     * \param onlyObjectOfType if not empty, only objects of this type will be displayed
     * \param allowMultipleSelection if true, more than one object can be chosen in the dialog
     */
    ChooseObjectDialog(wxWindow* parent,
                       Project & project,
                       gd::Layout & layout,
                       bool canSelectGroup = true,
                       gd::String onlyObjectOfType_ = "",
                       bool allowMultipleSelection_ = false);

    virtual ~ChooseObjectDialog();

    /**
     * Return the chosen object
     */
    const gd::String & GetChosenObject() const { return objectChosen; }

    /**
     * Return the chosen objects when multiple selection is allowed
     */
    const std::vector <gd::String> & GetChosenObjects() const  { return objectsChosen; }

    //(*Declarations(ChooseObjectDialog)
    wxMenu Menu2;
    wxMenu Menu1;
    wxSearchCtrl* searchCtrl;
    wxMenuItem* MenuItem1;
    wxMenuItem* MenuItem4;
    wxTreeCtrl* objectsList;
    wxButton* ChoisirBt;
    wxMenuItem* editGroupMenuItem;
    wxStaticLine* StaticLine1;
    wxButton* AnnulerBt;
    wxMenuItem* editMenuItem;
    //*)


protected:

    //(*Identifiers(ChooseObjectDialog)
    static const long ID_TREECTRL1;
    static const long ID_TEXTCTRL1;
    static const long ID_STATICLINE1;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    static const long ID_MENUITEM2;
    static const long ID_MENUITEM1;
    static const long ID_MENUITEM3;
    static const long ID_MENUITEM4;
    //*)

private:

    //(*Handlers(ChooseObjectDialog)
    void OnObjetsListSelectionChanged(wxTreeEvent& event);
    void OnChoisirBtClick(wxCommandEvent& event);
    void OnAnnulerBtClick(wxCommandEvent& event);
    void OnObjetsListItemRightClick(wxTreeEvent& event);
    void OnGroupesListSelectionChanged(wxTreeEvent& event);
    void OnObjetsListItemActivated(wxTreeEvent& event);
    void OnGroupesListItemRightClick(wxTreeEvent& event);
    void OnGroupesListItemActivated(wxTreeEvent& event);
    void OnglobalObjectsListSelectionChanged(wxTreeEvent& event);
    void OnglobalObjectsListItemRightClick(wxTreeEvent& event);
    void OnglobalObjectsListItemActivated(wxTreeEvent& event);
    void OnglobalObjectGroupsItemActivated(wxTreeEvent& event);
    void OnglobalObjectGroupsSelectionChanged(wxTreeEvent& event);
    void OnglobalObjectGroupsItemRightClick(wxTreeEvent& event);
    void OnsearchCtrlText(wxCommandEvent& event);
    //*)

    /**
     * Populate trees with objects
     */
    void Refresh();

    wxTreeItemId item; ///< The selected item in the tree.

    Project & project;
    gd::Layout & layout;

    gd::String objectChosen;
    std::vector <gd::String> objectsChosen; ///< Used if dialog support multiple selection.

    wxImageList * imageList;
    gd::String onlyObjectOfType;
    bool allowMultipleSelection;
    bool canSelectGroup;

    DECLARE_EVENT_TABLE()
};

}
#endif
#endif
