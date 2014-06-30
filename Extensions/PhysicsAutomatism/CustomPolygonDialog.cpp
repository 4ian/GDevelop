/**

Game Develop - Physics Automatism Extension
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
/**
 * This file was originally written by Victor Levasseur.
 */

#include "CustomPolygonDialog.h"

#include "PhysicsAutomatism.h"

#if defined(GD_IDE_ONLY)

//(*InternalHeaders(CustomPolygonDialog)
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/dcbuffer.h>
#include <wx/msgdlg.h>
#include <wx/textdlg.h>
#include <wx/numdlg.h>

#include "GDCpp/CommonTools.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include <string>
#include <cmath>


//(*IdInit(CustomPolygonDialog)
const long CustomPolygonDialog::ID_STATICTEXT1 = wxNewId();
const long CustomPolygonDialog::ID_TEXTCTRL1 = wxNewId();
const long CustomPolygonDialog::ID_STATICTEXT2 = wxNewId();
const long CustomPolygonDialog::ID_RADIOBUTTON3 = wxNewId();
const long CustomPolygonDialog::ID_RADIOBUTTON1 = wxNewId();
const long CustomPolygonDialog::ID_CHECKBOX1 = wxNewId();
const long CustomPolygonDialog::ID_STATICTEXT5 = wxNewId();
const long CustomPolygonDialog::ID_STATICTEXT6 = wxNewId();
const long CustomPolygonDialog::ID_TEXTCTRL2 = wxNewId();
const long CustomPolygonDialog::ID_STATICTEXT7 = wxNewId();
const long CustomPolygonDialog::ID_TEXTCTRL3 = wxNewId();
const long CustomPolygonDialog::ID_BUTTON2 = wxNewId();
const long CustomPolygonDialog::ID_BUTTON3 = wxNewId();
const long CustomPolygonDialog::ID_BUTTON4 = wxNewId();
const long CustomPolygonDialog::ID_BUTTON5 = wxNewId();
const long CustomPolygonDialog::ID_PANEL1 = wxNewId();
const long CustomPolygonDialog::ID_SCROLLBAR1 = wxNewId();
const long CustomPolygonDialog::ID_SCROLLBAR2 = wxNewId();
const long CustomPolygonDialog::ID_STATICTEXT4 = wxNewId();
const long CustomPolygonDialog::ID_STATICTEXT3 = wxNewId();
const long CustomPolygonDialog::ID_BUTTON1 = wxNewId();
const long CustomPolygonDialog::ID_BUTTON6 = wxNewId();
//*)

BEGIN_EVENT_TABLE(CustomPolygonDialog,wxDialog)
	//(*EventTable(CustomPolygonDialog)
	//*)
END_EVENT_TABLE()

CustomPolygonDialog::CustomPolygonDialog(wxWindow* parent, std::vector<sf::Vector2f> coords, unsigned int positioning, sf::Vector2f polygonSize, bool autoResize, wxWindowID id,const wxPoint& pos,const wxSize& size) :
	coordsVec(coords),
	automaticResizing(autoResize),
    polygonWidth(polygonSize.x),
    polygonHeight(polygonSize.y)
{
	//(*Initialize(CustomPolygonDialog)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxStaticBoxSizer* StaticBoxSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxStaticBoxSizer* StaticBoxSizer3;
	wxGridSizer* GridSizer1;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;

	Create(parent, wxID_ANY, _("Collision polygon coordinates"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5 = new wxFlexGridSizer(5, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Enter each coordinates of the polygon :\n( Each line must have a point x;y )"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer5->Add(StaticText1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	pointsEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(321,120), wxTE_MULTILINE|wxVSCROLL, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	pointsEdit->SetMaxSize(wxSize(-1,120));
	FlexGridSizer5->Add(pointsEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Coordinates must be entere with a clockwise wind."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	wxFont StaticText2Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText2->SetFont(StaticText2Font);
	FlexGridSizer5->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Positioning"));
	GridSizer1 = new wxGridSizer(3, 1, 0, 0);
	OnCenterRadioBt = new wxRadioButton(this, ID_RADIOBUTTON3, _("Position according to object's center"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON3"));
	OnCenterRadioBt->SetValue(true);
	GridSizer1->Add(OnCenterRadioBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	OnOriginRadioBt = new wxRadioButton(this, ID_RADIOBUTTON1, _("Position according to object's origin"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
	GridSizer1->Add(OnOriginRadioBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(GridSizer1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Resizing"));
	FlexGridSizer9 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer9->AddGrowableCol(0);
	autoResizingCheckBox = new wxCheckBox(this, ID_CHECKBOX1, _("Resize automatically according to object size"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	autoResizingCheckBox->SetValue(false);
	FlexGridSizer9->Add(autoResizingCheckBox, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT5, _("So as to let the polygon resize itself according to the object size, you must define the initial size of the object."), wxDefaultPosition, wxSize(291,47), wxST_NO_AUTORESIZE, _T("ID_STATICTEXT5"));
	StaticText3->Disable();
	wxFont StaticText3Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText3->SetFont(StaticText3Font);
	FlexGridSizer9->Add(StaticText3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10 = new wxFlexGridSizer(0, 4, 0, 0);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT6, _("Width:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	StaticText4->Disable();
	FlexGridSizer10->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	polygonWidthTextCtrl = new wxTextCtrl(this, ID_TEXTCTRL2, _("200"), wxDefaultPosition, wxSize(87,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	polygonWidthTextCtrl->Disable();
	FlexGridSizer10->Add(polygonWidthTextCtrl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT7, _("Height:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	StaticText5->Disable();
	FlexGridSizer10->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	polygonHeightTextCtrl = new wxTextCtrl(this, ID_TEXTCTRL3, _("200"), wxDefaultPosition, wxSize(88,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	polygonHeightTextCtrl->Disable();
	FlexGridSizer10->Add(polygonHeightTextCtrl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer3->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(2, 1, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(0);
	StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Tools"));
	FlexGridSizer11 = new wxFlexGridSizer(0, 4, 0, 0);
	Button1 = new wxButton(this, ID_BUTTON2, _("Move..."), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	Button1->SetToolTip(_("Move the shape"));
	FlexGridSizer11->Add(Button1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	Button2 = new wxButton(this, ID_BUTTON3, _("Resize..."), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	Button2->SetToolTip(_("Resize the shape"));
	FlexGridSizer11->Add(Button2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	Button3 = new wxButton(this, ID_BUTTON4, _("Rotation..."), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	Button3->SetToolTip(_("Turn the polygon around a point"));
	FlexGridSizer11->Add(Button3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	Button4 = new wxButton(this, ID_BUTTON5, _("Round..."), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON5"));
	Button4->SetToolTip(_("Round coordinates"));
	FlexGridSizer11->Add(Button4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	StaticBoxSizer4->Add(FlexGridSizer11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Add(StaticBoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Preview of the collision polygon:"));
	FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	FlexGridSizer6->AddGrowableRow(0);
	FlexGridSizer8 = new wxFlexGridSizer(2, 2, 0, 0);
	FlexGridSizer8->AddGrowableCol(0);
	previewPnl = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(440,348), wxSIMPLE_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer8->Add(previewPnl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	previewPnlVerticalScroll = new wxScrollBar(this, ID_SCROLLBAR1, wxDefaultPosition, wxDefaultSize, wxSB_VERTICAL, wxDefaultValidator, _T("ID_SCROLLBAR1"));
	previewPnlVerticalScroll->SetScrollbar(600, 500, 2000, 500);
	FlexGridSizer8->Add(previewPnlVerticalScroll, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	previewPnlHorizontalScroll = new wxScrollBar(this, ID_SCROLLBAR2, wxDefaultPosition, wxDefaultSize, wxSB_HORIZONTAL, wxDefaultValidator, _T("ID_SCROLLBAR2"));
	previewPnlHorizontalScroll->SetScrollbar(600, 500, 2000, 500);
	FlexGridSizer8->Add(previewPnlHorizontalScroll, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer7 = new wxFlexGridSizer(0, 2, 0, 0);
	pointLabelTxt = new wxStaticText(this, ID_STATICTEXT4, _("The point indicates the origin of the object."), wxDefaultPosition, wxSize(277,13), 0, _T("ID_STATICTEXT4"));
	wxFont pointLabelTxtFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	pointLabelTxt->SetFont(pointLabelTxtFont);
	FlexGridSizer7->Add(pointLabelTxt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cursorPosTxt = new wxStaticText(this, ID_STATICTEXT3, _("Cursor position:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	wxFont cursorPosTxtFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	cursorPosTxt->SetFont(cursorPosTxtFont);
	FlexGridSizer7->Add(cursorPosTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON6, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON6"));
	FlexGridSizer2->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&CustomPolygonDialog::OnpointsEditText);
	Connect(ID_RADIOBUTTON3,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&CustomPolygonDialog::OnRadioButton1Select);
	Connect(ID_RADIOBUTTON1,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&CustomPolygonDialog::OnRadioButton1Select);
	Connect(ID_CHECKBOX1,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&CustomPolygonDialog::OnautoResizingCheckBoxClick);
	Connect(ID_TEXTCTRL2,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&CustomPolygonDialog::OnpolygonHeightTextCtrlTextEnter);
	Connect(ID_TEXTCTRL3,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&CustomPolygonDialog::OnpolygonHeightTextCtrlTextEnter);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&CustomPolygonDialog::OnButton1Click);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&CustomPolygonDialog::OnButton2Click);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&CustomPolygonDialog::OnButton3Click);
	Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&CustomPolygonDialog::OnButton4Click);
	previewPnl->Connect(wxEVT_PAINT,(wxObjectEventFunction)&CustomPolygonDialog::OnpreviewPnlPaint,0,this);
	previewPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&CustomPolygonDialog::OnpreviewPnlLeftUp,0,this);
	previewPnl->Connect(wxEVT_MOTION,(wxObjectEventFunction)&CustomPolygonDialog::OnpreviewPnlMouseMove,0,this);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&CustomPolygonDialog::OnpreviewScrollChanged);
	Connect(ID_SCROLLBAR2,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&CustomPolygonDialog::OnpreviewScrollChanged);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&CustomPolygonDialog::OnokBtClick);
	Connect(ID_BUTTON6,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&CustomPolygonDialog::OncancelBtClick);
	Connect(wxID_ANY,wxEVT_CLOSE_WINDOW,(wxObjectEventFunction)&CustomPolygonDialog::OnClose);
	//*)

    //Setup controls
	pointsEdit->SetValue(wxString(PhysicsAutomatism::GetStringFromCoordsVector(coordsVec)));
	OnOriginRadioBt->SetValue(positioning == 0);
	OnCenterRadioBt->SetValue(positioning == 2);
    autoResizingCheckBox->SetValue(automaticResizing);
    polygonWidthTextCtrl->SetValue(ToString<float>(polygonWidth));
    polygonHeightTextCtrl->SetValue(ToString<float>(polygonHeight));

    //Setup scrollbars
    wxSize panelSize = previewPnl->GetSize();
    previewPnlHorizontalScroll->SetPageSize(panelSize.GetWidth());
    previewPnlVerticalScroll->SetPageSize(panelSize.GetHeight());
    previewPnlHorizontalScroll->SetRange(2000); //Arbitrary size of the preview panel : 2000x2000
    previewPnlVerticalScroll->SetRange(2000);
    previewPnlHorizontalScroll->SetThumbPosition(2000/2-previewPnlHorizontalScroll->GetPageSize()/2); //Put scrollbars at the center
    previewPnlVerticalScroll->SetThumbPosition(2000/2-previewPnlVerticalScroll->GetPageSize()/2);

    UpdateObjectInitialSizeRelatedControls();
}

CustomPolygonDialog::~CustomPolygonDialog()
{
	//(*Destroy(CustomPolygonDialog)
	//*)
}

void CustomPolygonDialog::OnokBtClick(wxCommandEvent& event)
{
    coordsVec.clear();
    coordsVec = PhysicsAutomatism::GetCoordsVectorFromString(ToString(pointsEdit->GetValue()));

    positioning = OnOriginRadioBt->GetValue() ? 0 : 2;

    polygonWidth = ToFloat(ToString(polygonWidthTextCtrl->GetValue()));
    polygonHeight = ToFloat(ToString(polygonHeightTextCtrl->GetValue()));

    automaticResizing = autoResizingCheckBox->GetValue();

    EndModal(1);
}

void CustomPolygonDialog::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void CustomPolygonDialog::OnClose(wxCloseEvent& event)
{
    EndModal(0);
}

void CustomPolygonDialog::OnpreviewPnlPaint(wxPaintEvent& event)
{
    wxBufferedPaintDC dc(previewPnl);
    wxSize panelSize = previewPnl->GetSize();
    float xOffset = (previewPnlHorizontalScroll->GetThumbPosition() - previewPnlHorizontalScroll->GetRange()/2);
    float yOffset = (previewPnlVerticalScroll->GetThumbPosition() - previewPnlVerticalScroll->GetRange()/2);

    //Draw background
    dc.SetBrush(gd::CommonBitmapManager::Get()->transparentBg);
    dc.DrawRectangle(0,0, panelSize.GetWidth(), panelSize.GetHeight());

    //Draw Collision Polygon

    std::vector<sf::Vector2f> coordsVec = PhysicsAutomatism::GetCoordsVectorFromString(ToString(pointsEdit->GetValue()));
    if ( coordsVec.empty() ) return; //Bail out now if no point to draw

    //Constructing the wxWidgets polygon.
    std::vector<wxPoint> points;
    for (unsigned int i = 0;i<coordsVec.size();++i)
    {
        points.push_back(wxPoint(coordsVec[i].x-xOffset,
                                 coordsVec[i].y-yOffset));
    }

    //Draw polygon
    dc.SetBrush(wxBrush(wxColor(50, 57, 122), wxFDIAGONAL_HATCH));
    dc.SetPen(wxPen(wxColor(50, 57, 122)));
    dc.DrawPolygon(points.size(), &points[0]);

    //Draw Polygon Size

    if(autoResizingCheckBox->GetValue() && !OnOriginRadioBt->GetValue())
    {
        dc.SetBrush(wxBrush(wxColor(48, 137, 255), wxTRANSPARENT));
        dc.SetPen(wxPen(wxColor(48, 137, 255)));

        std::vector<wxPoint> polygonSizePoints;

        float polygonWidth_ = ToFloat(ToString(polygonWidthTextCtrl->GetValue()));
        float polygonHeight_ = ToFloat(ToString(polygonHeightTextCtrl->GetValue()));

        if(OnCenterRadioBt->GetValue())
        {
            polygonSizePoints.push_back(wxPoint(0 - polygonWidth_/2                                         -xOffset,
                                                0 - polygonHeight_/2                                        -yOffset));

            polygonSizePoints.push_back(wxPoint(polygonWidth_/2                                             -xOffset,
                                                0 - polygonHeight_/2                                        -yOffset));

            polygonSizePoints.push_back(wxPoint(polygonWidth_ /2                                            -xOffset,
                                                polygonHeight_ /2                                           -yOffset));

            polygonSizePoints.push_back(wxPoint(0 - polygonWidth_/2                                         -xOffset,
                                                polygonHeight_ /2                                           -yOffset));
        }

        dc.DrawPolygon(polygonSizePoints.size(), &polygonSizePoints[0]);
    }

    //Draw origin
    wxBitmap point(gd::CommonBitmapManager::Get()->point);
    dc.DrawBitmap(point,
                  (0-point.GetWidth()/2)    -xOffset,
                  (0-point.GetHeight()/2)   -yOffset,
                  true /* use mask */);
}


void CustomPolygonDialog::OnpreviewPnlLeftUp(wxMouseEvent& event)
{
    float xOffset = (previewPnlHorizontalScroll->GetThumbPosition() - previewPnlHorizontalScroll->GetRange()/2);
    float yOffset = (previewPnlVerticalScroll->GetThumbPosition() - previewPnlVerticalScroll->GetRange()/2);

    pointsEdit->AppendText("\n"+ToString(event.GetX()+xOffset)+";"+ToString(event.GetY()+yOffset));
}

void CustomPolygonDialog::OnpointsEditText(wxCommandEvent& event)
{
    previewPnl->Refresh(); //Refresh
    previewPnl->Update(); //Immediately
}

void CustomPolygonDialog::OnpreviewPnlMouseMove(wxMouseEvent& event)
{
    float xOffset = (previewPnlHorizontalScroll->GetThumbPosition() - previewPnlHorizontalScroll->GetRange()/2);
    float yOffset = (previewPnlVerticalScroll->GetThumbPosition() - previewPnlVerticalScroll->GetRange()/2);

    wxSize panelSize = previewPnl->GetSize();
    cursorPosTxt->SetLabel(_("Cursor position:")+" "
                           +ToString(event.GetPosition().x+xOffset)
                           +";"
                           +ToString(event.GetPosition().y+yOffset));
}


void CustomPolygonDialog::OnRadioButton1Select(wxCommandEvent& event)
{
    if(OnOriginRadioBt->GetValue())
    {
        autoResizingCheckBox->SetValue(false);
        autoResizingCheckBox->Enable(false);
    }
    else
    {
        autoResizingCheckBox->Enable(true);
    }

    UpdateObjectInitialSizeRelatedControls();
    previewPnl->Refresh(); //Refresh
    previewPnl->Update(); //Immediately
}

void CustomPolygonDialog::OnpreviewScrollChanged(wxScrollEvent& event)
{
    previewPnl->Refresh(); //Refresh
    previewPnl->Update(); //Immediately
}

void CustomPolygonDialog::OnautoResizingCheckBoxClick(wxCommandEvent& event)
{
    UpdateObjectInitialSizeRelatedControls();
    previewPnl->Refresh(); //Refresh
    previewPnl->Update(); //Immediately
}

void CustomPolygonDialog::OnpolygonHeightTextCtrlTextEnter(wxCommandEvent& event)
{
    previewPnl->Refresh(); //Refresh
    previewPnl->Update(); //Immediately
}

void CustomPolygonDialog::UpdateObjectInitialSizeRelatedControls()
{
	if(OnOriginRadioBt->GetValue())
    {
        pointLabelTxt->SetLabel("Le point indique l'origine de l'objet.");
    }
    else
    {
        pointLabelTxt->SetLabel("Le point indique le centre de l'objet.");
    }

    StaticText3->Enable(autoResizingCheckBox->GetValue());
    StaticText4->Enable(autoResizingCheckBox->GetValue());
    StaticText5->Enable(autoResizingCheckBox->GetValue());
    polygonHeightTextCtrl->Enable(autoResizingCheckBox->GetValue());
    polygonWidthTextCtrl->Enable(autoResizingCheckBox->GetValue());
}

//Décalage
void CustomPolygonDialog::OnButton1Click(wxCommandEvent& event)
{
    wxString xOffsetStr = wxGetTextFromUser(_("X offset"), _("Move..."), "0", this);
    wxString yOffsetStr = wxGetTextFromUser(_("Y offset"), _("Move..."), "0", this);

    float xOffset;
    float yOffset;

    if(xOffsetStr == "")
        xOffset = 0;
    else
        xOffset = ToFloat(ToString(xOffsetStr));

    if(yOffsetStr == "")
        yOffset = 0;
    else
        yOffset = ToFloat(ToString(yOffsetStr));

    std::vector<sf::Vector2f> pointList = PhysicsAutomatism::GetCoordsVectorFromString(std::string(pointsEdit->GetValue().mb_str()));
    for(unsigned int a = 0; a < pointList.size(); a++)
    {
        pointList.at(a).x += xOffset;
        pointList.at(a).y += yOffset;
    }

    pointsEdit->SetValue(wxString(PhysicsAutomatism::GetStringFromCoordsVector(pointList)));
}

void CustomPolygonDialog::OnButton2Click(wxCommandEvent& event)
{
    wxString xScaleStr = wxGetTextFromUser(_("X scale"), _("Resize..."), "1", this);
    wxString yScaleStr = wxGetTextFromUser(_("Y scale"), _("Resize..."), "1", this);

    float xScale;
    float yScale;

    if(xScaleStr == "")
        xScale = 1;
    else
        xScale = ToFloat(ToString(xScaleStr));

    if(yScaleStr == "")
        yScale = 1;
    else
        yScale = ToFloat(ToString(yScaleStr));

    std::vector<sf::Vector2f> pointList = PhysicsAutomatism::GetCoordsVectorFromString(std::string(pointsEdit->GetValue().mb_str()));
    for(unsigned int a = 0; a < pointList.size(); a++)
    {
        pointList.at(a).x *= xScale;
        pointList.at(a).y *= yScale;
    }

    pointsEdit->SetValue(wxString(PhysicsAutomatism::GetStringFromCoordsVector(pointList)));
}

void CustomPolygonDialog::OnButton3Click(wxCommandEvent& event)
{
    wxString angleStr = wxGetTextFromUser(_("Rotation angle"), _("Rotation..."), "0", this);
    wxString originStr = wxGetTextFromUser(_("Point around which the rotation should be made.\nPoint 0;0 is the point draw on the polygon preview."), _("Rotation..."), "0;0", this);
    int precision = wxGetNumberFromUser(_("Precision allow to choose the number of decimal digits of the result"), _("Precision"), _("Rotation..."), 2, 0, 10, this);

    if(precision == -1)
        return;

    float angleRad = -ToFloat(ToString(angleStr)) * M_PI/180;
    sf::Vector2f origin(ToFloat(SplitString<std::string>(ToString(originStr), ';').at(0)),
                        ToFloat(SplitString<std::string>(ToString(originStr), ';').at(1)));

    std::vector<sf::Vector2f> pointList = PhysicsAutomatism::GetCoordsVectorFromString(std::string(pointsEdit->GetValue().mb_str()));
    for(unsigned int a = 0; a < pointList.size(); a++)
    {
        sf::Vector2f pointProjOnOrigin(pointList.at(a).x - origin.x,
                                       pointList.at(a).y - origin.y);

        pointList.at(a).x = round((cos(angleRad) * pointProjOnOrigin.x + sin(angleRad) * pointProjOnOrigin.y) * pow(10,precision)) / pow(10,precision) + origin.x;
        pointList.at(a).y = round((-sin(angleRad) * pointProjOnOrigin.x + cos(angleRad) * pointProjOnOrigin.y) * pow(10,precision)) / pow(10,precision) + origin.y;

    }

    pointsEdit->SetValue(wxString(PhysicsAutomatism::GetStringFromCoordsVector(pointList)));
}

void CustomPolygonDialog::OnButton4Click(wxCommandEvent& event)
{
    int precision = wxGetNumberFromUser(_("( There may be a loss of precision beyond 8 decimal digits )"), _("Precision ( Number of decimal digits )"), _("Round..."), 2, 0, 10, this);

    if(precision == -1)
        return;

    std::vector<sf::Vector2f> pointList = PhysicsAutomatism::GetCoordsVectorFromString(std::string(pointsEdit->GetValue().mb_str()));
    for(unsigned int a = 0; a < pointList.size(); a++)
    {
        pointList.at(a).x = round(pointList.at(a).x * pow(10, precision)) / pow(10, precision);
        pointList.at(a).y = round(pointList.at(a).y * pow(10, precision)) / pow(10, precision);
    }

    pointsEdit->SetValue(wxString(PhysicsAutomatism::GetStringFromCoordsVector(pointList)));
}


#endif

