/**

Game Develop - TextEntry Object Extension
Copyright (c) 2011 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef TEXTOBJECTEDITOR_H
#define TEXTOBJECTEDITOR_H

//(*Headers(TextEntryObjectEditor)
#include <wx/sizer.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
class Game;
class TextEntryObject;
class MainEditorCommand;

class TextEntryObjectEditor: public wxDialog
{
	public:

		TextEntryObjectEditor( wxWindow* parent, Game & game_, TextEntryObject & object_, MainEditorCommand & mainEditorCommand_ );
		virtual ~TextEntryObjectEditor();

		//(*Declarations(TextEntryObjectEditor)
		wxStaticLine* StaticLine1;
		wxButton* okBt;
		//*)

	protected:

		//(*Identifiers(TextEntryObjectEditor)
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(TextEntryObjectEditor)
		void OnokBtClick(wxCommandEvent& event);
		void OncolorBtClick(wxCommandEvent& event);
		void OnfontBtClick(wxCommandEvent& event);
		void OnSizeEditChange(wxSpinEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		//*)

		Game & game;
		MainEditorCommand & mainEditorCommand;
		TextEntryObject & object;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
