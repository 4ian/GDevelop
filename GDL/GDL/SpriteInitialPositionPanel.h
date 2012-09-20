/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)

#ifndef SPRITEINITIALPOSITIONPANEL_H
#define SPRITEINITIALPOSITIONPANEL_H

//(*Headers(SpriteInitialPositionPanel)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/panel.h>
#include <wx/combobox.h>
//*)

class SpriteInitialPositionPanel: public wxPanel
{
	public:

		SpriteInitialPositionPanel(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~SpriteInitialPositionPanel();

		//(*Declarations(SpriteInitialPositionPanel)
		wxStaticText* StaticText5;
		wxComboBox* AnimationCombo;
		wxStaticText* StaticText4;
		wxTextCtrl* DirectionEdit;
		//*)

	protected:

		//(*Identifiers(SpriteInitialPositionPanel)
		static const long ID_STATICTEXT6;
		static const long ID_COMBOBOX2;
		static const long ID_STATICTEXT5;
		static const long ID_TEXTCTRL3;
		//*)

	private:

		//(*Handlers(SpriteInitialPositionPanel)
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
#endif

