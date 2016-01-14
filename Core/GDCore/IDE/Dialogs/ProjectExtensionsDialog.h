/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef ProjectExtensionsDialog_H
#define ProjectExtensionsDialog_H

//(*Headers(ProjectExtensionsDialog)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/menu.h>
#include <wx/textctrl.h>
#include <wx/checklst.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/htmllbox.h>
#include <memory>
namespace gd { class Project; }
namespace gd { class Platform; }

namespace gd
{

/**
 * \brief Dialog designed for editing the extensions used by a project.
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API ProjectExtensionsDialog: public wxDialog
{
public:

    ProjectExtensionsDialog(wxWindow* parent, gd::Project & project_);
    virtual ~ProjectExtensionsDialog();

    //(*Declarations(ProjectExtensionsDialog)
    wxStaticText* authorTxt;
    wxStaticBitmap* StaticBitmap2;
    wxStaticBitmap* maccompatibleBmp;
    wxCheckListBox* ExtensionsList;
    wxStaticText* StaticText2;
    wxButton* FermerBt;
    wxStaticText* StaticText6;
    wxTextCtrl* infoEdit;
    wxMenu notUsedPlatformMenu;
    wxListCtrl* platformList;
    wxStaticText* StaticText1;
    wxStaticText* StaticText3;
    wxHyperlinkCtrl* HyperlinkCtrl1;
    wxMenuItem* removePlatformMenuItem;
    wxMenuItem* usePlatformMenuItem;
    wxStaticText* StaticText5;
    wxStaticText* StaticText7;
    wxStaticLine* StaticLine1;
    wxHyperlinkCtrl* helpBt;
    wxStaticText* licenseTxt;
    wxMenu usedPlatformMenu;
    wxStaticText* StaticText4;
    wxStaticBitmap* wincompatibleBmp;
    wxStaticBitmap* linuxcompatibleBmp;
    //*)

protected:

    //(*Identifiers(ProjectExtensionsDialog)
    static const long ID_LISTCTRL1;
    static const long ID_STATICTEXT1;
    static const long ID_CHECKLISTBOX1;
    static const long ID_STATICTEXT9;
    static const long ID_TEXTCTRL2;
    static const long ID_STATICTEXT5;
    static const long ID_STATICTEXT3;
    static const long ID_STATICTEXT6;
    static const long ID_STATICTEXT4;
    static const long ID_STATICTEXT7;
    static const long ID_STATICBITMAP2;
    static const long ID_STATICBITMAP4;
    static const long ID_STATICBITMAP1;
    static const long ID_STATICTEXT8;
    static const long ID_HYPERLINKCTRL1;
    static const long ID_STATICLINE1;
    static const long ID_STATICBITMAP5;
    static const long ID_HYPERLINKCTRL2;
    static const long ID_STATICTEXT2;
    static const long ID_BUTTON3;
    static const long ID_MENUITEM1;
    static const long ID_MENUITEM2;
    //*)

private:

    //(*Handlers(ProjectExtensionsDialog)
    void OninstallNewExtensionBtClick(wxCommandEvent& event);
    void OnuninstallExtensionBtClick(wxCommandEvent& event);
    void OnExtensionsListSelect(wxCommandEvent& event);
    void OnFermerBtClick(wxCommandEvent& event);
    void OnHyperlinkCtrl2Click(wxCommandEvent& event);
    void OnhelpBtClick(wxCommandEvent& event);
    void OnResize(wxSizeEvent& event);
    void OnusePlatformMenuItemSelected(wxCommandEvent& event);
    void OnremovePlatformMenuItemSelected(wxCommandEvent& event);
    void OnplatformListItemSelect(wxListEvent& event);
    void OnplatformListItemRClick(wxListEvent& event);
    void OnExtensionsListToggled(wxCommandEvent& event);
    //*)
    void RefreshExtensionList();
    void RefreshPlatformList();
    void RefreshExtensionListColumnsWidth();

    gd::Project & project;
    gd::Platform * currentPlatform;

    DECLARE_EVENT_TABLE()
};

}

#endif
#endif
