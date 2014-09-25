/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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
#include <string>
#include <vector>
#include "GDCore/Events/ExpressionMetadata.h"
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class ParameterMetadata; }

namespace gd
{

/**
 * \brief Dialog used to edit a string expression
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
    EditStrExpressionDialog(wxWindow* parent, std::string expression, gd::Project & project_, gd::Layout & layout_);
    virtual ~EditStrExpressionDialog();

    /**
     * Return the expression
     */
    const std::string & GetExpression() const {return returnedExpression;}

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

    std::string ShowParameterDialog(const gd::ParameterMetadata & ParameterMetadata, bool & userCancelled, std::string object = "");

    std::string returnedExpression;

    //Items selected
    wxTreeItemId itemObj;
    wxTreeItemId itemVal;

    wxImageList * imageListObj;
    wxImageList * imageListVal;

    //Utile pour selectionner un objet
    //( quand on souhaite accéder aux propriétés d'un objet )
    gd::Project & project;
    gd::Layout & layout;

    size_t lastErrorPos;

    DECLARE_EVENT_TABLE()
};

/**
 * \brief Internal class used by EditStrExpressionDialog
 * This class can be used by wxTreeCtrl, to attach
 * information ( an gd::StrExpressionMetadata and the name of the expression ) to an item
 */
class GD_CORE_API TreeItemStrExpressionInfoData : public wxTreeItemData
{
public:
    TreeItemStrExpressionInfoData(const std::string & name_, const gd::StrExpressionMetadata & info_) : name(name_), info(info_) { };
    virtual ~TreeItemStrExpressionInfoData() {};

    const std::string & GetName() const { return name; }
    const gd::StrExpressionMetadata & GetStrExpressionMetadata() const { return info; }

private:
    std::string name;
    gd::StrExpressionMetadata info;
};

}
#endif
#endif
