/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#ifndef INITIALPOSITIONBROWSERDLG_H
#define INITIALPOSITIONBROWSERDLG_H

//(*Headers(InitialPositionBrowserDlg)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/panel.h>
//*)
#include <vector>
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasAssociatedEditor.h"
namespace gd { class InitialInstancesContainer; }
namespace gd { class LayoutEditorCanvas; }

/**
 * \brief Panel displaying a list of the instances of a gd::InitialInstancesContainer.
 *
 * Usually used to display the objects of a layout.
 */
class InitialPositionBrowserDlg: public wxPanel, public gd::LayoutEditorCanvasAssociatedEditor
{
public:

    InitialPositionBrowserDlg(wxWindow* parent, gd::InitialInstancesContainer & initialInstancesContainer_, gd::LayoutEditorCanvas & layoutEditorCanvas);
    virtual ~InitialPositionBrowserDlg();

    virtual void SelectedInitialInstance(const gd::InitialInstance & instance);
    virtual void DeselectedInitialInstance(const gd::InitialInstance & instance);
    virtual void DeselectedAllInitialInstance();
    virtual void InitialInstancesUpdated();
    virtual void Refresh();
    virtual bool Enable(bool enable=true) { return wxWindow::Enable(enable); };

    //(*Declarations(InitialPositionBrowserDlg)
    wxListCtrl* initialPositionsList;
    //*)

protected:

    //(*Identifiers(InitialPositionBrowserDlg)
    static const long ID_LISTCTRL1;
    //*)

private:

    //(*Handlers(InitialPositionBrowserDlg)
    void OninitialPositionsListItemActivated(wxListEvent& event);
    void OninitialPositionsListKeyDown(wxListEvent& event);
    void OninitialPositionsListItemDeselect(wxListEvent& event);
    void OninitialPositionsListItemSelect(wxListEvent& event);
    //*)
    gd::InitialInstancesContainer & instancesContainer;
    gd::LayoutEditorCanvas & layoutCanvas;

    bool deletingInitialInstances; ///< Used to avoid refreshing multiple times the editor when deleting instances
    bool notUserSelection; ///< Used to avoid to consider the selection of an item made by SelectedInitialInstance as a user click.

    DECLARE_EVENT_TABLE()
    friend class InitialPositionBrowserDlgRefresher;
};

#endif

