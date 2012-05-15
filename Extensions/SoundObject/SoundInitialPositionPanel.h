/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy

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
#ifndef SOUNDINITIALPOSITIONPANEL_H
#define SOUNDINITIALPOSITIONPANEL_H

#if defined(GD_IDE_ONLY)

//(*Headers(SoundInitialPositionPanel)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/panel.h>
//*)

/**
 * \brief Custom panel showing an extra "Z position" text control.
 */
class SoundInitialPositionPanel: public wxPanel
{
	public:

		SoundInitialPositionPanel(wxWindow* parent,wxWindowID id=wxID_ANY);
		virtual ~SoundInitialPositionPanel();

		//(*Declarations(SoundInitialPositionPanel)
		wxStaticText* StaticText1;
		wxTextCtrl* zPositionTextCtrl;
		//*)

	protected:

		//(*Identifiers(SoundInitialPositionPanel)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		//*)

	private:

		//(*Handlers(SoundInitialPositionPanel)
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
#endif
