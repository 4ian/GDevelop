/**

GDevelop - Light Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY)
#ifndef PHYSICSAUTOMATISMEDITOR_H
#define PHYSICSAUTOMATISMEDITOR_H

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
//(*Headers(LightObstacleAutomatismEditor)
#include <wx/sizer.h>
#include <wx/dialog.h>
//*)
#include <boost/shared_ptr.hpp>
namespace gd { class Project; }
namespace gd { class MainFrameWrapper; }
class LightObstacleAutomatism;
namespace gd { class Layout; }
class SceneLightObstacleDatas;

class LightObstacleAutomatismEditor: public wxDialog
{
	public:

		LightObstacleAutomatismEditor(wxWindow* parent, gd::Project & game_, gd::Layout * scene, LightObstacleAutomatism & automatism_ );
		virtual ~LightObstacleAutomatismEditor();

		//(*Declarations(LightObstacleAutomatismEditor)
		//*)

		LightObstacleAutomatism & automatism;

	protected:

		//(*Identifiers(LightObstacleAutomatismEditor)
		//*)

	private:

		//(*Handlers(LightObstacleAutomatismEditor)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		//*)

		gd::Project & game;
        gd::Layout * scene;
        boost::shared_ptr<SceneLightObstacleDatas> sharedDatas;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

