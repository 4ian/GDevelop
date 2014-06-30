/**

Game Develop - Light Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

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

