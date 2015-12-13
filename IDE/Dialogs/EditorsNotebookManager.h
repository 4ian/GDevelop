/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#ifndef EDITORSNOTEBOOKMANAGER_H
#define EDITORSNOTEBOOKMANAGER_H
#include <functional>
#include <wx/string.h>
class wxAuiNotebook;
class wxString;
class wxBitmap;
class wxWindow;
namespace gd { class ExternalEvents; }
namespace gd { class ExternalLayout; }
namespace gd { class SourceFile; }
namespace gd { class Layout; }
namespace gd { class Project; }
namespace gd { class String; }

class EditorsNotebookManager {
public:
	EditorsNotebookManager() {}
	~EditorsNotebookManager() {}
	void SetNotebook(wxAuiNotebook * notebook_) { notebook = notebook_; };
	void ShouldDisplayPrefix(std::function<bool()> predicat) { shouldDisplayPrefix = predicat; };

	void AddPage(wxWindow * page, wxString name = "", bool select = false);
	void OnPageAdded(std::function<void(wxWindow*)> cb) { onPageAddedCb = cb; }

	void UpdatePageLabel(int pageIndex, wxString name);

	void CloseAllPagesFor(gd::Project & project);
	void CloseAllPagesFor(const gd::Layout & layout);
	void CloseAllPagesFor(const gd::ExternalEvents & events);
	void CloseAllPagesFor(const gd::ExternalLayout & externalLayout);
	void CloseAllPagesFor(const gd::SourceFile & sourceFile);

	int GetPageOfResourceEditorFor(const gd::Project & project);
	int GetPageOfEditorFor(const gd::ExternalEvents & events);
	int GetPageOfEditorFor(const gd::ExternalLayout & externalLayout);
	int GetPageOfEditorFor(const gd::Layout & layout);
	int GetPageOfCodeEditorFor(gd::String filename);
	int GetPageOfStartHerePage();

	bool SelectResourceEditorFor(const gd::Project & project);
	bool SelectEditorFor(const gd::ExternalEvents & events);
	bool SelectEditorFor(const gd::ExternalLayout & externalLayout);
	bool SelectEditorFor(const gd::Layout & layout);
	bool SelectCodeEditorFor(gd::String filename, int line);
	bool SelectStartHerePage();

	wxString GetLabelFor(wxWindow * page, wxString name = "");
private:
	gd::Project * GetProjectFor(wxWindow * page);
	wxBitmap GetIconFor(wxWindow * page);

	wxAuiNotebook * notebook;
	std::function<bool()> shouldDisplayPrefix;
	std::function<void(wxWindow*)> onPageAddedCb;
    static const std::size_t gameMaxCharDisplayedInEditor = 15;
};

#endif
