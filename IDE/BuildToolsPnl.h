#ifndef BUILDTOOLSPNL_H
#define BUILDTOOLSPNL_H

//(*Headers(BuildToolsPnl)
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/panel.h>
//*)
class ProjectManager;
class BuildProgressPnl;
class BuildMessagesPnl;

/**
 * \brief Designed to handheld all GUI related to code compilation.
 * Automatically create its child and associate it if necessary with the needed classes (CodeCompiler)
 *
 * \see CodeCompiler
 * \see BuildProgressPnl
 * \see BuildMessagesPnl
 */
class BuildToolsPnl: public wxPanel
{
public:

	BuildToolsPnl(wxWindow* parent, ProjectManager * projectManager);
	virtual ~BuildToolsPnl();

	//(*Declarations(BuildToolsPnl)
	wxNotebook* notebook;
	//*)

	BuildProgressPnl * buildProgressPnl;
	BuildMessagesPnl * buildMessagesPnl;

protected:

	//(*Identifiers(BuildToolsPnl)
	static const long ID_NOTEBOOK1;
	//*)

private:

	//(*Handlers(BuildToolsPnl)
	//*)

	DECLARE_EVENT_TABLE()
};

#endif

