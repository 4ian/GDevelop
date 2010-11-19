#ifndef INITIALPOSITIONBROWSERDLG_H
#define INITIALPOSITIONBROWSERDLG_H

//(*Headers(InitialPositionBrowserDlg)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/panel.h>
//*)
#include <vector>
class InitialPosition;
class SceneCanvas;

class InitialPositionBrowserDlg: public wxPanel
{
	public:

		InitialPositionBrowserDlg(wxWindow* parent, std::vector < InitialPosition > & initialPositions_, SceneCanvas & sceneCanvas_);
		virtual ~InitialPositionBrowserDlg();

		//(*Declarations(InitialPositionBrowserDlg)
		wxListCtrl* initialPositionsList;
		//*)
		void SelectInitialPosition(unsigned int id);
		void DeselectAll();
		void Refresh();

	protected:

		//(*Identifiers(InitialPositionBrowserDlg)
		static const long ID_LISTCTRL1;
		//*)

	private:

		//(*Handlers(InitialPositionBrowserDlg)
		void OninitialPositionsListItemActivated(wxListEvent& event);
		//*)
		std::vector < InitialPosition > & initialPositions;
		SceneCanvas & sceneCanvas;

		DECLARE_EVENT_TABLE()
};

#endif
