/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if !defined(GD_NO_WX_GUI)
#include "RebrandingHelper.h"
#include <wx/stattext.h>
#include <wx/menu.h>
#include <wx/panel.h>
#include <wx/treectrl.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/panel.h>
#include <wx/ribbon/page.h>
#include <wx/ribbon/panel.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/propgrid/propgrid.h>

namespace gd {

void RebrandingHelper::Rename(wxString scope, wxString newName)
{
    rename[scope] = newName;
}

void RebrandingHelper::Delete(wxString scope)
{
    deletions.insert(scope);
}

void RebrandingHelper::Rename(std::regex scope, wxString newName)
{
    renameRegex.push_back(make_pair(scope, newName));
}

void RebrandingHelper::Delete(std::regex scope)
{
    deletionsRegex.push_back(scope);
}

bool RebrandingHelper::ShouldRename(wxString scope) const
{
	if (rename.find(scope) != rename.end())
		return true;

	for(auto & it : renameRegex)
	{
		if (std::regex_match(scope.ToStdString(), it.first))
			return true;
	}

	return false;
}

wxString RebrandingHelper::GetNewName(wxString scope) const
{
	if (rename.find(scope) != rename.end())
		return rename.find(scope)->second;

	for(auto & it : renameRegex)
	{
		if (std::regex_match(scope.ToStdString(), it.first))
			return it.second;
	}

	return "";
}

bool RebrandingHelper::ShouldDelete(wxString scope) const
{
	if (deletions.find(scope) != deletions.end())
		return true;

	for(auto & regex : deletionsRegex)
	{
		if (std::regex_match(scope.ToStdString(), regex))
			return true;
	}

	return false;
}

void RebrandingHelper::ApplyBranding(wxMenu & menu, wxString scope)
{
    size_t separatorIndex = 0;

	wxMenuItemList & itemsList = menu.GetMenuItems();
	for(auto itemIt = itemsList.begin(); itemIt != itemsList.end();++itemIt)
	{
	    wxMenuItem * item = *itemIt;
	    if (!item) continue;

        wxString name = menu.GetLabelText(item->GetId());
        if (item->GetId() == wxID_SEPARATOR)
        {
            name = "Separator_";
            name << separatorIndex;
            separatorIndex++;
        }

	    wxString itemScope = scope + "." + name;

	    if (ShouldDelete(itemScope)) menu.Destroy(item);
	    else if (ShouldRename(itemScope)) item->SetItemLabel(GetNewName(itemScope));
	}
}

void RebrandingHelper::ApplyBranding(wxRibbonBar * bar, wxString scope)
{
    for (size_t pageIndex = 0;pageIndex < bar->GetPageCount();pageIndex++)
    {
        wxRibbonPage * page = bar->GetPage(pageIndex);
        if (page)
        {
	        wxString pageScope = scope + "." + page->GetLabel();
	        if (ShouldDelete(pageScope)) bar->HidePage(pageIndex);
			else if (ShouldRename(pageScope)) page->SetLabel(GetNewName(pageScope));

	        wxWindowList & children = page->GetChildren();
	        for(auto childIt = children.begin();childIt != children.end();++childIt)
	        {
	            wxWindow * child = *childIt;
	            if (!child) continue;

			    if (wxRibbonPanel * panel = dynamic_cast<wxRibbonPanel*>(child))
			    {
			        ApplyBranding(panel, pageScope);
			    }
	        }
        }
    }
	bar->Realize();
}

void RebrandingHelper::ApplyBranding(wxRibbonPanel * panel, wxString scope)
{
	if (!panel) return;

	wxString panelScope = scope + "." + panel->GetLabel();
	if (ShouldDelete(panelScope))
    {
    	panel->Destroy();
    	return;
    }

    if (ShouldRename(panelScope)) panel->SetLabel(GetNewName(panelScope));

    wxWindowList & children = panel->GetChildren();
    for(auto childIt = children.begin();childIt != children.end();++childIt)
    {
        wxWindow * child = *childIt;
        if (!child) continue;

	    if (wxRibbonButtonBar * buttonBar = dynamic_cast<wxRibbonButtonBar*>(child))
	    {
	        ApplyBranding(buttonBar, panelScope + ".ButtonBar");
	    }
    }
	panel->Realize();
}

void RebrandingHelper::ApplyBranding(wxRibbonButtonBar * buttonBar, wxString scope)
{
	size_t buttonIndex = 0;
	size_t nameIndex = 0;
	while(buttonIndex < buttonBar->GetButtonCount())
	{
		bool deleted = false;
		wxRibbonButtonBarButtonBase * button = buttonBar->GetItem(buttonIndex);
		if (button)
		{
			wxString buttonScope = scope + ".";
			buttonScope << nameIndex;
			if (ShouldDelete(buttonScope))
			{
				buttonBar->DeleteButton(buttonBar->GetItemId(button));
				deleted = true;
			}
		}

		if (!deleted) ++buttonIndex;
		++nameIndex;
	}

	buttonBar->Realize();
}

void RebrandingHelper::ApplyBranding(wxTreeCtrl * treeCtrl, wxTreeItemId item, wxString scope)
{
    while(item.IsOk())
    {
        wxTreeItemId next = treeCtrl->GetNextSibling(item);

        wxString itemScope = scope + "." + treeCtrl->GetItemText(item);
        if (ShouldDelete(itemScope)) treeCtrl->Delete(item);
        else
        {
        	if (treeCtrl->ItemHasChildren(item))
            {
                void * cookie;
                ApplyBranding(treeCtrl, treeCtrl->GetFirstChild(item, cookie), itemScope);
            }

        	if (ShouldRename(itemScope)) treeCtrl->SetItemText(item, GetNewName(itemScope));
        }


        item = next;
    }
}

void RebrandingHelper::ApplyBranding(wxPropertyGrid * grid, wxString scope)
{
    wxPropertyGridIterator it = grid->GetIterator();
    while (!it.AtEnd())
    {
        wxPGProperty * property = it.GetProperty();
        it.Next();
        if (property) {
            wxString propertyScope = scope + "." + property->GetName();
            if (ShouldDelete(propertyScope)) property->Hide(true);
            else if(ShouldRename(propertyScope)) property->SetLabel(GetNewName(propertyScope));
        }
    }

}

void RebrandingHelper::ApplyBranding(wxWindow * window, wxString scope)
{
    if (!window) return;

    wxWindowList & children = window->GetChildren();
    for(auto childIt = children.begin();childIt != children.end();++childIt)
    {
        wxWindow * child = *childIt;
        if (!child) continue;

	    if (wxStaticText * text = dynamic_cast<wxStaticText*>(child))
	        ApplyBranding(text, scope);
        else if (wxPanel * panel = dynamic_cast<wxPanel*>(child))
            ApplyBranding(panel, scope);
    }
}

void RebrandingHelper::ApplyBranding(wxStaticText * text, wxString scope)
{
    if (!text) return;

    wxString textScope = scope + "." + text->GetLabel();
    if (ShouldRename(textScope)) text->SetLabel(GetNewName(textScope));
}

wxString RebrandingHelper::ApplyBranding(wxString str, wxString scope)
{
    wxString updatedStr = str;
    wxString strScope = scope + "." + str;
    if (ShouldRename(strScope)) updatedStr = GetNewName(strScope);

    return updatedStr;
}

}
#endif
