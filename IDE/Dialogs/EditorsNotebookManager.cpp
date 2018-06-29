#include "EditorsNotebookManager.h"
#include <wx/aui/aui.h>
#include "GDCore/IDE/Dialogs/ResourcesEditor.h"
#include "../ExternalEventsEditor.h"
#include "../EditorScene.h"
#include "../CodeEditor.h"
#include "../LogFileManager.h"
#include "ExternalLayoutEditor.h"
#include "StartHerePage.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/SourceFile.h"
#include "GDCore/String.h"

void EditorsNotebookManager::AddPage(wxWindow * page, wxString name, bool select)
{
	notebook->AddPage(page, GetLabelFor(page, name), select, GetIconFor(page));
	if (onPageAddedCb) onPageAddedCb(page);
}

void EditorsNotebookManager::UpdatePageLabel(int pageIndex, wxString name)
{
	if (pageIndex < 0 || pageIndex >= notebook->GetPageCount())
		return;

	notebook->SetPageText(pageIndex, GetLabelFor(notebook->GetPage(pageIndex), name));
}

void EditorsNotebookManager::NotifyPageDisplayed(wxWindow * newPage)
{
	if ( EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(newPage) )
    {
        sceneEditorPtr->EditorDisplayed();
        LogFileManager::Get()->WriteToLogFile("Switched to the editor of layout \""+sceneEditorPtr->GetLayout().GetName()+"\"");
    }
    else if ( ResourcesEditor * imagesEditorPtr = dynamic_cast<ResourcesEditor*>(newPage) )
    {
        imagesEditorPtr->EditorDisplayed();
        LogFileManager::Get()->WriteToLogFile("Switched to resources editor of project \""+imagesEditorPtr->project.GetName()+"\"");
    }
    else if ( CodeEditor * codeEditorPtr = dynamic_cast<CodeEditor*>(newPage) )
    {
        codeEditorPtr->EditorDisplayed();
        LogFileManager::Get()->WriteToLogFile("Switched to code editor of file \""+codeEditorPtr->filename+"\"");
    }
    else if ( ExternalEventsEditor * externalEventsEditorPtr = dynamic_cast<ExternalEventsEditor*>(newPage) )
    {
        externalEventsEditorPtr->EditorDisplayed();
        LogFileManager::Get()->WriteToLogFile("Switched to the editor of external events \""+externalEventsEditorPtr->events.GetName()+"\"");
    }
    else if ( ExternalLayoutEditor * externalLayoutEditorPtr = dynamic_cast<ExternalLayoutEditor*>(newPage) )
    {
        externalLayoutEditorPtr->EditorDisplayed();
        LogFileManager::Get()->WriteToLogFile("Switched to the editor of external layout \""+externalLayoutEditorPtr->GetExternalLayout().GetName()+"\"");
    }
}

void EditorsNotebookManager::NotifyPageNotDisplayed(wxWindow * newPage)
{
	if ( EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(newPage) )
        sceneEditorPtr->EditorNotDisplayed();
    else if ( ExternalLayoutEditor * externalLayoutEditorPtr = dynamic_cast<ExternalLayoutEditor*>(newPage) )
        externalLayoutEditorPtr->EditorNotDisplayed();
}

void EditorsNotebookManager::MainFrameNotDisplayed()
{
    if (!notebook) return;

	for (std::size_t k =0;k<notebook->GetPageCount();k++)
	{
		wxWindow * page = notebook->GetPage(k);
		NotifyPageNotDisplayed(page);
	}
}

void EditorsNotebookManager::PageChanged(wxWindow * newPage)
{
	for (std::size_t k =0;k<notebook->GetPageCount();k++)
	{
		wxWindow * page = notebook->GetPage(k);
		if (page == newPage) NotifyPageDisplayed(page);
		else NotifyPageNotDisplayed(page);
	}
}

wxBitmap EditorsNotebookManager::GetIconFor(wxWindow * page)
{
	if (dynamic_cast<ResourcesEditor*>(page))
	{
		return gd::SkinHelper::GetIcon("image", 16);
	}
	else if (dynamic_cast<ExternalEventsEditor*>(page))
	{
		return gd::SkinHelper::GetIcon("events", 16);
	}
	else if (dynamic_cast<EditorScene*>(page))
	{
		return gd::SkinHelper::GetIcon("scene", 16);
	}
	else if (dynamic_cast<CodeEditor*>(page))
	{
		return gd::SkinHelper::GetIcon("source_cpp", 16);
	}
	else if (dynamic_cast<ExternalLayoutEditor*>(page))
	{
		return gd::SkinHelper::GetIcon("scene", 16);
	}

	return wxNullBitmap;
}

wxString EditorsNotebookManager::GetLabelFor(wxWindow * page, wxString name)
{
    wxString prefix = "";
    if (gd::Project * project = GetProjectFor(page))
    {
    	if (shouldDisplayPrefix()) {
	        prefix = "["+project->GetName()+"] ";
	        if ( project->GetName().length() > gameMaxCharDisplayedInEditor )
	            prefix = "["+project->GetName().substr(0, gameMaxCharDisplayedInEditor-3)+"...] ";
        }
    }

    if (name.size() == 0)
    {
    	name = "Unknown editor";
		if (dynamic_cast<ResourcesEditor*>(page))
			name = _("Images bank");
		else if (dynamic_cast<StartHerePage*>(page))
			name = _("Start page");
	}

	return prefix + name;
}


gd::Project * EditorsNotebookManager::GetProjectFor(wxWindow * page)
{
    EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(page);
    ExternalEventsEditor * externalEventsEditorPtr = dynamic_cast<ExternalEventsEditor*>(page);
    ResourcesEditor * imagesEditorPtr = dynamic_cast<ResourcesEditor*>(page);
    CodeEditor * codeEditorPtr = dynamic_cast<CodeEditor*>(page);
    ExternalLayoutEditor * externalLayoutEditorPtr = dynamic_cast<ExternalLayoutEditor*>(page);

    if (sceneEditorPtr)
        return &sceneEditorPtr->GetProject();
    else if (imagesEditorPtr)
        return &imagesEditorPtr->project;
    else if (externalEventsEditorPtr)
        return &externalEventsEditorPtr->game;
    else if (codeEditorPtr)
        return codeEditorPtr->game;
    else if (externalLayoutEditorPtr)
        return &externalLayoutEditorPtr->GetProject();

	return NULL;
}

void EditorsNotebookManager::CloseAllPagesFor(gd::Project & project)
{
    for (std::size_t k =0;k<notebook->GetPageCount();)
    {
    	gd::Project * pageProject = GetProjectFor(notebook->GetPage(k));

    	if (&project == pageProject)
    		notebook->DeletePage(k);
    	else
    		k++;
    }
}

void EditorsNotebookManager::CloseAllPagesFor(const gd::ExternalEvents & events)
{
    for (std::size_t k =0;k<static_cast<std::size_t>(notebook->GetPageCount());)
    {
        ExternalEventsEditor * editorPtr = dynamic_cast<ExternalEventsEditor*>(notebook->GetPage(k));
        if ( editorPtr != NULL && &editorPtr->events == &events)
            notebook->DeletePage(k);
        else
            k++;
    }
}

void EditorsNotebookManager::CloseAllPagesFor(const gd::ExternalLayout & externalLayout)
{
    for (std::size_t k =0;k<static_cast<std::size_t>(notebook->GetPageCount());)
    {
        ExternalLayoutEditor * editorPtr = dynamic_cast<ExternalLayoutEditor*>(notebook->GetPage(k));
        if ( editorPtr != NULL && &editorPtr->GetExternalLayout() == &externalLayout)
            notebook->DeletePage(k);
        else
            k++;
    }
}

void EditorsNotebookManager::CloseAllPagesFor(const gd::SourceFile & sourceFile)
{
	for (std::size_t k =0;k<static_cast<std::size_t>(notebook->GetPageCount());)
    {
        CodeEditor * editorPtr = dynamic_cast<CodeEditor*>(notebook->GetPage(k));
        if ( editorPtr != NULL && editorPtr->filename == sourceFile.GetFileName())
            notebook->DeletePage(k);
        else
            k++;
    }
}

void EditorsNotebookManager::CloseAllPagesFor(const gd::Layout & layout)
{
    for (std::size_t k =0;k<static_cast<std::size_t>(notebook->GetPageCount());)
    {
        EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(notebook->GetPage(k));
        ExternalLayoutEditor * externalLayoutEditPtr = dynamic_cast<ExternalLayoutEditor*>(notebook->GetPage(k));

        if ( (sceneEditorPtr != NULL && &sceneEditorPtr->GetLayout() == &layout) ||
             (externalLayoutEditPtr != NULL && &externalLayoutEditPtr->GetAssociatedLayout() == &layout) )
            notebook->DeletePage(k);
        else
            k++;
    }
}

bool EditorsNotebookManager::SelectResourceEditorFor(const gd::Project & project)
{
	int page = GetPageOfResourceEditorFor(project);
	if (page != -1)
	{
		notebook->SetSelection(page);
		return true;
	}

	return false;
}

bool EditorsNotebookManager::SelectEditorFor(const gd::ExternalEvents & events)
{
	int page = GetPageOfEditorFor(events);
	if (page != -1)
	{
		notebook->SetSelection(page);
		return true;
	}

	return false;
}

bool EditorsNotebookManager::SelectEditorFor(const gd::ExternalLayout & externalLayout)
{
	int page = GetPageOfEditorFor(externalLayout);
	if (page != -1)
	{
		notebook->SetSelection(page);
		return true;
	}

	return false;
}

bool EditorsNotebookManager::SelectCodeEditorFor(gd::String filename, int line)
{
	int page = GetPageOfCodeEditorFor(filename);
	if (page != -1)
	{
        notebook->SetSelection(page);

        //Select the specified line.
        if (CodeEditor * editorPtr = dynamic_cast<CodeEditor*>(notebook->GetPage(page)))
        {
            if ( line != gd::String::npos ) editorPtr->SelectLine(line);
        }

        return true;
	}

    return false;
}

bool EditorsNotebookManager::SelectEditorFor(const gd::Layout & layout)
{
    int page = GetPageOfEditorFor(layout);
    if (page != -1)
    {
        notebook->SetSelection(page);
        return true;
    }

    return false;
}

bool EditorsNotebookManager::SelectStartHerePage()
{
	int page = GetPageOfStartHerePage();
	if (page != -1)
	{
		notebook->SetSelection(page);
		return true;
	}

	return false;
}

int EditorsNotebookManager::GetPageOfStartHerePage()
{
    for (std::size_t i = 0;i<notebook->GetPageCount();++i)
    {
        if ( dynamic_cast<StartHerePage*>(notebook->GetPage(i)) != NULL )
        {
            return i;
        }
    }

    return -1;
}

int EditorsNotebookManager::GetPageOfResourceEditorFor(const gd::Project & project)
{
    for (std::size_t j =0;j<notebook->GetPageCount() ;j++ )
    {
        ResourcesEditor * imagesEditorPtr = dynamic_cast<ResourcesEditor*>(notebook->GetPage(j));
        if (imagesEditorPtr != NULL && &imagesEditorPtr->project == &project)
	        return j;
    }

    return -1;
}

int EditorsNotebookManager::GetPageOfEditorFor(const gd::ExternalEvents & events)
{
    for (std::size_t j =0;j<notebook->GetPageCount() ;j++ )
    {
        ExternalEventsEditor * eventsEditorPtr = dynamic_cast<ExternalEventsEditor*>(notebook->GetPage(j));
        if ( eventsEditorPtr != NULL && &eventsEditorPtr->events == &events)
        	return j;
    }

    return -1;
}

int EditorsNotebookManager::GetPageOfEditorFor(const gd::ExternalLayout & externalLayout)
{
    for (std::size_t j =0;j<notebook->GetPageCount() ;j++ )
    {
        ExternalLayoutEditor * externalLayoutEditorPtr = dynamic_cast<ExternalLayoutEditor*>(notebook->GetPage(j));
        if ( externalLayoutEditorPtr != NULL && &externalLayoutEditorPtr->GetExternalLayout() == &externalLayout )
        	return j;
    }

    return -1;
}

int EditorsNotebookManager::GetPageOfCodeEditorFor(gd::String filename)
{
    for (std::size_t j =0;j<notebook->GetPageCount() ;j++ )
    {
        CodeEditor * editorPtr = dynamic_cast<CodeEditor*>(notebook->GetPage(j));
        if ( editorPtr != NULL && editorPtr->filename == filename )
        	return j;
    }

    return -1;
}

int EditorsNotebookManager::GetPageOfEditorFor(const gd::Layout & layout)
{
    for (std::size_t j =0;j<notebook->GetPageCount() ;j++ )
    {
        EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(notebook->GetPage(j));
        if (sceneEditorPtr != NULL && &sceneEditorPtr->GetLayout() == &layout)
        	return j;
    }

    return -1;
}
