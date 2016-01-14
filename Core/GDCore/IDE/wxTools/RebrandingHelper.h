/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if !defined(GD_NO_WX_GUI)
#ifndef GDCORE_REBRANDINGHELPER_H
#define GDCORE_REBRANDINGHELPER_H
#include <wx/string.h>
#include <vector>
#include <set>
#include <map>
#include <utility>
#include <regex>
class wxMenu;
class wxString;
class wxTreeCtrl;
class wxRibbonBar;
class wxRibbonPanel;
class wxRibbonButtonBar;
class wxPropertyGrid;
class wxTreeItemId;
class wxWindow;
class wxStaticText;

namespace gd
{

/**
 * \brief Provide tool functions to easily rebrand wxWidgets dialogs
 * (basically: replace a word by another, destroy/remove controls).
 *
 * \ingroup IDE
 */
class GD_CORE_API RebrandingHelper
{
public:
    RebrandingHelper() {};
    ~RebrandingHelper() {};

    void Rename(wxString scope, wxString newName);
    void Delete(wxString scope);
    void Rename(std::regex scope, wxString newName);
    void Delete(std::regex scope);

    /**
     * \brief Customize the branding of a menu.
     */
    void ApplyBranding(wxMenu & menu, wxString scope = "");

    void ApplyBranding(wxRibbonBar * ribbon, wxString scope = "");
    void ApplyBranding(wxRibbonPanel * ribbon, wxString scope);
    void ApplyBranding(wxRibbonButtonBar * buttonBar, wxString scope);
    void ApplyBranding(wxTreeCtrl * treeCtrl, wxTreeItemId item, wxString scope);
    void ApplyBranding(wxPropertyGrid * grid, wxString scope);
    void ApplyBranding(wxWindow * window, wxString scope);
    void ApplyBranding(wxStaticText * text, wxString scope);
    wxString ApplyBranding(wxString str, wxString scope);

private:
    bool ShouldDelete(wxString scope) const;
    bool ShouldRename(wxString scope) const;
    wxString GetNewName(wxString scope) const;

    std::set<wxString> deletions;
    std::vector<std::regex> deletionsRegex;
    std::map<wxString, wxString> rename;
    std::vector<std::pair<std::regex, wxString>> renameRegex;
    wxString oldName;
    wxString newName;
};

}

#endif // GDCORE_REBRANDINGHELPER_H
#endif
