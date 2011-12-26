/**

Game Develop - Physic Automatism Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

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
/**
 * This file was originally written by Victor Levasseur.
 */

#ifndef CUSTOMPOLYGONDIALOG_H
#define CUSTOMPOLYGONDIALOG_H

#if defined(GD_IDE_ONLY)

//(*Headers(CustomPolygonDialog)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

#include "SFML/System/Vector2.hpp"
#include <vector>

class CustomPolygonDialog: public wxDialog
{
	public:

		CustomPolygonDialog(wxWindow* parent, std::vector<sf::Vector2f>,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~CustomPolygonDialog();

		//(*Declarations(CustomPolygonDialog)
		wxStaticText* StaticText2;
		wxStaticText* StaticText1;
		wxStaticText* cursorPosTxt;
		wxTextCtrl* TextCtrl1;
		wxPanel* previewPnl;
		wxStaticText* StaticText4;
		wxButton* okBt;
		//*)

		std::vector<sf::Vector2f> coordsVec;

	protected:

		//(*Identifiers(CustomPolygonDialog)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT2;
		static const long ID_PANEL1;
		static const long ID_STATICTEXT4;
		static const long ID_STATICTEXT3;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(CustomPolygonDialog)
		void OnButton1Click(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OnPanel1Paint(wxPaintEvent& event);
		void OnpreviewPnlPaint(wxPaintEvent& event);
		void OnTextCtrl1Text(wxCommandEvent& event);
		void OnpreviewPnlMouseMove(wxMouseEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif

#endif
