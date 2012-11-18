/**

Game Develop - Tiled Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)

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
#ifndef TILEDSPRITEINITIALPOSITIONPANEL_H
#define TILEDSPRITEINITIALPOSITIONPANEL_H

//(*Headers(TiledSpriteInitialPositionPanel)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/panel.h>
//*)

class TiledSpriteInitialPositionPanel: public wxPanel
{
	public:

		TiledSpriteInitialPositionPanel(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~TiledSpriteInitialPositionPanel();

		//(*Declarations(TiledSpriteInitialPositionPanel)
		wxStaticText* StaticText1;
		wxTextCtrl* angleTextCtrl;
		//*)

	protected:

		//(*Identifiers(TiledSpriteInitialPositionPanel)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		//*)

	private:

		//(*Handlers(TiledSpriteInitialPositionPanel)
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
#endif

