/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef EDITTEXTE_H
#define EDITTEXTE_H

//(*Headers(EditStrExpressionDialog)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/aui/aui.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
#include <wx/stc/stc.h>
//*)
#include "GDCore/String.h"
#include <vector>
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class ParameterMetadata; }

namespace gd
{

/**
 * \brief Dialog used to edit a gd::String expression
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API EditStrExpressionDialog: public wxDialog
{
public:

    /**
     * Default constructor
     * \param parent The wxWidgets parent window
     * \param expression The expression to edit
     * \param project Project
     * \param layout Layout
     */
    EditStrExpressionDialog(wxWindow* parent, gd::String expression, gd::Project & project_, gd::Layout & layout_);
    virtual ~EditStrExpressionDialog();

    /**
     * Return the expression
     */
    const gd::String & GetExpression() const {return returnedExpression;}

    //(*Declarations(EditStrExpressionDialog)
    wxPanel* objectsFunctionsPanel;
    wxButton* OkBt;
    wxStaticBitmap* StaticBitmap2;
    wxAuiManager* mgr;
    wxButton* AddFunctionBt;
    wxPanel* centerPanel;
    wxTreeCtrl* ValList;
    wxHyperlinkCtrl* errorTxt;
    wxStyledTextCtrl* TexteEdit;
    wxHyperlinkCtrl* HyperlinkCtrl1;
    wxPanel* freeFunctionsPanel;
    wxTreeCtrl* ObjList;
    wxButton* AddPropBt;
    //*)

protected:

    //(*Identifiers(EditStrExpressionDialog)
    static const long ID_CUSTOM1;
    static const long ID_BUTTON2;
    static const long ID_HYPERLINKCTRL1;
    static const long ID_STATICBITMAP5;
    static const long ID_HYPERLINKCTRL2;
    static const long ID_PANEL1;
    static const long ID_TREECTRL1;
    static const long ID_BUTTON10;
    static const long ID_PANEL2;
    static const long ID_TREECTRL2;
    static const long ID_BUTTON7;
    static const long ID_PANEL3;
    //*)

private:

    //(*Handlers(EditStrExpressionDialog)
    void OnAnnulerBtClick(wxCommandEvent& event);
    void OnOkBtClick(wxCommandEvent& event);
    void OnInsertBtClick(wxCommandEvent& event);
    void OnExpressionTxtEditClick(wxCommandEvent& event);
    void OnVarGlobalTxtEditClick(wxCommandEvent& event);
    void OnVarSceneTxtEditClick(wxCommandEvent& event);
    void OnTexteEditText(wxCommandEvent& event);
    void OnAddPropBtClick(wxCommandEvent& event);
    void OnAddFunctionBtClick(wxCommandEvent& event);
    void OnTreeCtrl1ItemActivated(wxTreeEvent& event);
    void OnObjListItemActivated(wxTreeEvent& event);
    void OnObjListSelectionChanged(wxTreeEvent& event);
    void OnTreeCtrl1SelectionChanged(wxTreeEvent& event);
    void OnerrorTxtClick(wxCommandEvent& event);
    void OnhelpBtClick(wxCommandEvent& event);
    //*)
    void TextModified(wxStyledTextEvent& event);
    void UpdateTextCtrl(wxStyledTextEvent& event);

    gd::String ShowParameterDialog(const gd::ParameterMetadata & ParameterMetadata, bool & userCancelled, gd::String object = "");

    gd::String returnedExpression;

    //Items selected
    wxTreeItemId itemObj;
    wxTreeItemId itemVal;

    wxImageList * imageListObj;
    wxImageList * imageListVal;

    //Utile pour selectionner un objet
    //( quand on souhaite acc�der aux propri�t�s d'un objet )
    gd::Project & project;
    gd::Layout & layout;

    size_t lastErrorPos;

    DECLARE_EVENT_TABLE()
};

}
#endif
#endif
