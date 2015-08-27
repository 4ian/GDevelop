/**

GDevelop - Light Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef PHYSICSBEHAVIOREDITOR_H
#define PHYSICSBEHAVIOREDITOR_H

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
//(*Headers(LightObstacleBehaviorEditor)
#include <wx/sizer.h>
#include <wx/dialog.h>
//*)
#include <memory>
namespace gd { class Project; }
namespace gd { class MainFrameWrapper; }
class LightObstacleBehavior;
namespace gd { class Layout; }
class SceneLightObstacleDatas;

class LightObstacleBehaviorEditor: public wxDialog
{
	public:

		LightObstacleBehaviorEditor(wxWindow* parent, gd::Project & game_, gd::Layout * scene, LightObstacleBehavior & behavior_ );
		virtual ~LightObstacleBehaviorEditor();

		//(*Declarations(LightObstacleBehaviorEditor)
		//*)

		LightObstacleBehavior & behavior;

	protected:

		//(*Identifiers(LightObstacleBehaviorEditor)
		//*)

	private:

		//(*Handlers(LightObstacleBehaviorEditor)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		//*)

		gd::Project & game;
        gd::Layout * scene;
        std::shared_ptr<SceneLightObstacleDatas> sharedDatas;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

