/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef CHOIXVARIABLEDIALOG_H
#define CHOIXVARIABLEDIALOG_H

//(*Headers(ChooseVariableDialog)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/aui/aui.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
namespace gd { class VariablesContainer; }
#include <wx/toolbar.h>
#include <boost/shared_ptr.hpp>
#include <string>

/**
 * \brief Dialog used to display variables of a gd::VariablesContainer and choose one.
 * Can also be used as an editor.
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API ChooseVariableDialog: public wxDialog
{
public:

    /**
     * Default constructor.
     *
     * \param parent The parent window
     * \param variablesContainer A reference to the container to be used
     * \param editingOnly If set to true, the dialog will act as a dialog to edit the variables and not to choose one ( Double click won't close the dialog for example ).
     */
    ChooseVariableDialog(wxWindow* parent, gd::VariablesContainer & variablesContainer, bool editingOnly=false);

    /**
     * Destructor
     */
    virtual ~ChooseVariableDialog();

    std::string selectedVariable; ///< Contains the name of the last selected variable.

    //(*Declarations(ChooseVariableDialog)
    wxAuiManager* AuiManager1;
    wxButton* helpBt;
    wxPanel* toolbarPanel;
    wxAuiToolBar* toolbar;
    wxStaticBitmap* StaticBitmap1;
    wxListCtrl* variablesList;
    wxButton* cancelBt;
    wxStaticLine* StaticLine2;
    wxStaticLine* StaticLine1;
    wxPanel* Panel2;
    wxStaticText* StaticText4;
    wxButton* okBt;
    //*)

protected:

    //(*Identifiers(ChooseVariableDialog)
    static const long ID_STATICBITMAP1;
    static const long ID_STATICTEXT6;
    static const long ID_PANEL2;
    static const long ID_STATICLINE1;
    static const long ID_AUITOOLBAR1;
    static const long ID_PANEL1;
    static const long ID_LISTCTRL1;
    static const long ID_STATICLINE2;
    static const long ID_BUTTON1;
    static const long ID_BUTTON3;
    static const long ID_BUTTON2;
    //*)
    static const long idAddVar;
    static const long idEditVar;
    static const long idDelVar;
    static const long idMoveUpVar;
    static const long idRenameVar;
    static const long idMoveDownVar;
    static const long ID_Help;

private:

    //(*Handlers(ChooseVariableDialog)
    void OnokBtClick(wxCommandEvent& event);
    void OncancelBtClick(wxCommandEvent& event);
    void OnhelpBtClick(wxCommandEvent& event);
    void OntoolbarPanelResize(wxSizeEvent& event);
    void OnvariablesListItemActivated(wxListEvent& event);
    void OnvariablesListItemSelect(wxListEvent& event);
    void OnvariablesListKeyDown(wxListEvent& event);
    //*)
    void OnAddVarSelected(wxCommandEvent& event);
    void OnDelVarSelected(wxCommandEvent& event);
    void OnEditVarSelected(wxCommandEvent& event);
    void OnRenameVarSelected(wxCommandEvent& event);
    void OnMoveUpVarSelected(wxCommandEvent& event);
    void OnMoveDownVarSelected(wxCommandEvent& event);
    void Refresh();

    gd::VariablesContainer & variablesContainer; ///< gd::VariablesContainer storing the variables
    boost::shared_ptr<gd::VariablesContainer> temporaryContainer; ///< Temporary container used to allow to make temporary changes before applying them to the real variables container if Ok is pressed.
    bool editingOnly; ///< If set to true, the dialog will act as a dialog to edit the variables and not to choose one ( Double click won't close the dialog for example ).

    DECLARE_EVENT_TABLE()
};

#endif
