/**

Game Develop - Video Object Extension
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

#ifndef VIDEOOBJECTEDITOR_H
#define VIDEOOBJECTEDITOR_H

//(*Headers(VideoObjectEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/spinctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
namespace gd { class Project; }
class VideoObject;
namespace gd { class MainFrameWrapper; }

class VideoObjectEditor: public wxDialog
{
	public:

		VideoObjectEditor( wxWindow* parent, gd::Project & game_, VideoObject & object_, gd::MainFrameWrapper & mainFrameWrapper_ );
		virtual ~VideoObjectEditor();

		//(*Declarations(VideoObjectEditor)
		wxButton* converterBt;
		wxTextCtrl* videoEdit;
		wxCheckBox* loopCheck;
		wxStaticText* StaticText2;
		wxStaticText* StaticText1;
		wxButton* cancelBt;
		wxStaticLine* StaticLine1;
		wxButton* browseBt;
		wxSpinCtrl* soundSpin;
		wxButton* okBt;
		//*)

	protected:

		//(*Identifiers(VideoObjectEditor)
		static const long ID_TEXTCTRL1;
		static const long ID_BUTTON2;
		static const long ID_STATICTEXT1;
		static const long ID_BUTTON4;
		static const long ID_STATICTEXT2;
		static const long ID_SPINCTRL1;
		static const long ID_CHECKBOX1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(VideoObjectEditor)
		void OnokBtClick(wxCommandEvent& event);
		void OncolorBtClick(wxCommandEvent& event);
		void OnfontBtClick(wxCommandEvent& event);
		void OnSizeEditChange(wxSpinEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnbrowseBtClick(wxCommandEvent& event);
		void OnloopCheckClick(wxCommandEvent& event);
		void OnconverterBtClick(wxCommandEvent& event);
		//*)

		gd::Project & game;
		VideoObject & object;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

