/**

GDevelop - Video Object Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
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

