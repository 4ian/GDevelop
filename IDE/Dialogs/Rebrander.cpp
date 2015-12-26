#include "Rebrander.h"
#include "../ProjectManager.h"
#include "../MainFrame.h"
#include "ExternalLayoutEditor.h"
#include "ObjectsEditor.h"
#include "LayoutEditorPropertiesPnl.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Serialization/Serializer.h"
#include <fstream>
#include <regex>
#include <wx/aboutdlg.h>

using namespace gd;

bool Rebrander::LoadRebrandingConfigFromFile(const gd::String & filename)
{
    std::ifstream ifs(filename.ToLocale().c_str());
    if (!ifs.is_open()) return false;

    std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
    LoadRebrandingConfig(gd::Serializer::FromJSON(str));

    return true;
}

void Rebrander::LoadRebrandingConfig(const SerializerElement & config)
{
    config.ConsiderAsArrayOf("Element");
    for(size_t i = 0;i < config.GetChildrenCount();++i)
    {
        SerializerElement & element = config.GetChild(i);

        gd::String scope = element.GetChild("scope").GetValue().GetString();

        if (element.HasChild("rename"))
        {
            gd::String rename = element.GetChild("rename").GetValue().GetString();
            if (element.HasChild("regex") && element.GetChild("regex").GetValue().GetBool())
                brander.Rename(std::regex(scope.c_str()), rename);
            else
                brander.Rename(scope, rename);
        }

        if (element.HasChild("delete") && element.GetChild("delete").GetValue().GetBool())
        {
            if (element.HasChild("regex") && element.GetChild("regex").GetValue().GetBool())
                brander.Delete(std::regex(scope.c_str()));
            else
                brander.Delete(scope);
        }
    }

    hasBranding = true;
}

wxString Rebrander::ApplyBranding(wxString str, wxString scope)
{
    return brander.ApplyBranding(str, scope);
}


void Rebrander::ApplyBranding(MainFrame * mainEditor)
{
    brander.ApplyBranding(mainEditor->GetHelpMenu(), "HelpMenu");
    brander.ApplyBranding(mainEditor->GetFileMenu(), "FileMenu");
    brander.ApplyBranding(mainEditor->GetRibbon(), "Ribbon");

    mainEditor->GetProjectManager()->OnRefreshed([this, mainEditor]() {
        wxTreeCtrl * projectsTree = mainEditor->GetProjectManager()->projectsTree;

        void * projectCookie;
        wxTreeItemId projectItem = projectsTree->GetFirstChild(projectsTree->GetRootItem(), projectCookie);
        while (projectItem.IsOk())
        {
            void * cookie;
            brander.ApplyBranding(
                projectsTree,
                projectsTree->GetFirstChild(projectItem, cookie),
                "ProjectManager"
            );

            projectItem = projectsTree->GetNextSibling(projectItem);
        }
    });

    mainEditor->GetEditorsManager().OnPageAdded([this](wxWindow * page) {
        if (ExternalLayoutEditor * editor = dynamic_cast<ExternalLayoutEditor *>(page))
        {
            brander.ApplyBranding(page, "ExternalLayoutEditor");
            editor->OnAssociatedLayoutChanged([editor, this]() {
                gd::LayoutEditorCanvas * layoutEditorCanvas = editor->GetLayoutEditorCanvas();
                if (layoutEditorCanvas)
                {
                    brander.ApplyBranding(layoutEditorCanvas->GetContextMenu(), "LayoutEditorCanvas.ContextMenu");
                    brander.ApplyBranding(layoutEditorCanvas->GetNoObjectContextMenu(), "LayoutEditorCanvas.NoObjectContextMenu");
                    layoutEditorCanvas->OnRibbonButtonBarUpdated([this](wxRibbonButtonBar * bar) {
                        brander.ApplyBranding(bar, "LayoutEditorCanvas.RibbonToolsButtonBar");
                    });
                    layoutEditorCanvas->RecreateRibbonToolbar();
                }

                ObjectsEditor * objectsEditor = editor->GetObjectsEditor().get();
                if (objectsEditor)
                {
                    objectsEditor->OnRefreshed([objectsEditor, this]() {
                        wxTreeCtrl * tree = objectsEditor->GetObjectsList();
                        if (!tree) return;

                        void * cookie;
                        brander.ApplyBranding(tree, tree->GetFirstChild(tree->GetRootItem(), cookie),
                            "ObjectsEditor");
                    });

                    objectsEditor->Refresh();
                    brander.ApplyBranding(objectsEditor->GetContextMenu(), "ObjectsEditor.ContextMenu");
                    brander.ApplyBranding(objectsEditor->GetEmptyContextMenu(), "ObjectsEditor.EmptyContextMenu");
                    brander.ApplyBranding(objectsEditor->GetMultipleContextMenu(), "ObjectsEditor.MultipleContextMenu");

                    LayoutEditorPropertiesPnl * propertiesPanel = editor->GetPropertiesPanel().get();
                    propertiesPanel->OnRefreshed([propertiesPanel, this]() {
                        wxPropertyGrid * grid = propertiesPanel->grid;

                        brander.ApplyBranding(grid, "PropertyGrid");
                    });
                }
            });

            editor->Refresh();
        }
    });

    if (hasBranding)
    {
        mainEditor->GetEditorsNotebook()->DeleteAllPages();
        mainEditor->SetBaseTitle(brander.ApplyBranding("Title", "General"));
    }

    mainEditor->OnAboutBox([this]() {
        if (!hasBranding) return false;

        wxAboutDialogInfo info;
        info.SetName(brander.ApplyBranding("Title", "General"));
        info.SetVersion(brander.ApplyBranding("Version", "General"));
        info.SetDescription(brander.ApplyBranding("Description", "AboutBox"));
        info.SetCopyright(brander.ApplyBranding("Copyright", "AboutBox")
            + "\n\n" + "This editor is based on GDevelop, an open-source game development framework"
            + " originally created by Florian Rival.");

        wxAboutBox(info);
        return true;
    });
}
