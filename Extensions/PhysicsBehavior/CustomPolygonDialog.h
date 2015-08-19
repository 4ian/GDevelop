/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.*/
/**
 * This file was originally written by Victor Levasseur.
 */

#ifndef CUSTOMPOLYGONDIALOG_H
#define CUSTOMPOLYGONDIALOG_H

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

//(*Headers(CustomPolygonDialog)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/radiobut.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/scrolbar.h>
#include <wx/dialog.h>
//*)

#include "SFML/System/Vector2.hpp"
#include <vector>

class CustomPolygonDialog: public wxDialog
{
	public:

		CustomPolygonDialog(wxWindow* parent, std::vector<sf::Vector2f>, unsigned int positioning, sf::Vector2f polygonSize, bool autoResiz,
                            wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~CustomPolygonDialog();

		//(*Declarations(CustomPolygonDialog)
		wxButton* Button4;
		wxTextCtrl* pointsEdit;
		wxStaticText* StaticText2;
		wxRadioButton* OnOriginRadioBt;
		wxButton* Button1;
		wxStaticText* pointLabelTxt;
		wxTextCtrl* polygonHeightTextCtrl;
		wxCheckBox* autoResizingCheckBox;
		wxStaticText* StaticText1;
		wxTextCtrl* polygonWidthTextCtrl;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxButton* Button2;
		wxButton* Button3;
		wxStaticText* StaticText5;
		wxStaticText* cursorPosTxt;
		wxScrollBar* previewPnlVerticalScroll;
		wxRadioButton* OnCenterRadioBt;
		wxScrollBar* previewPnlHorizontalScroll;
		wxPanel* previewPnl;
		wxStaticText* StaticText4;
		wxButton* okBt;
		//*)

		std::vector<sf::Vector2f> coordsVec;
		unsigned int positioning;

        bool automaticResizing;
		float polygonWidth;
		float polygonHeight;

		int horizontalPreviewPos;
		int verticalPreviewPos;

	protected:

		//(*Identifiers(CustomPolygonDialog)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT2;
		static const long ID_RADIOBUTTON3;
		static const long ID_RADIOBUTTON1;
		static const long ID_CHECKBOX1;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL3;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		static const long ID_BUTTON4;
		static const long ID_BUTTON5;
		static const long ID_PANEL1;
		static const long ID_SCROLLBAR1;
		static const long ID_SCROLLBAR2;
		static const long ID_STATICTEXT4;
		static const long ID_STATICTEXT3;
		static const long ID_BUTTON1;
		static const long ID_BUTTON6;
		//*)

	private:

		//(*Handlers(CustomPolygonDialog)
		void OnokBtClick(wxCommandEvent& event);
		void OnPanel1Paint(wxPaintEvent& event);
		void OnpreviewPnlPaint(wxPaintEvent& event);
		void OnTextCtrl1Text(wxCommandEvent& event);
		void OnpreviewPnlMouseMove(wxMouseEvent& event);
		void OnRadioButton1Select(wxCommandEvent& event);
		void OnpreviewScrollChanged(wxScrollEvent& event);
		void OnClose(wxCloseEvent& event);
		void OnautoResizingCheckBoxClick(wxCommandEvent& event);
		void OnpolygonHeightTextCtrlTextEnter(wxCommandEvent& event);
		void OnButton1Click(wxCommandEvent& event);
		void OnButton2Click(wxCommandEvent& event);
		void OnButton3Click(wxCommandEvent& event);
		void OnButton4Click(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnpointsEditText(wxCommandEvent& event);
		void OnpreviewPnlLeftUp(wxMouseEvent& event);
		//*)

		/**
		 * De/activate controls related to the initial size of the object according
		 * to user choice.
		 */
		void UpdateObjectInitialSizeRelatedControls();

		DECLARE_EVENT_TABLE()
};

#endif

#endif

