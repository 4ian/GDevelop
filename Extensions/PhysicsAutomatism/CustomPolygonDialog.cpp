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

#include "CustomPolygonDialog.h"

#include "PhysicsAutomatism.h"

#if defined(GD_IDE_ONLY)

//(*InternalHeaders(CustomPolygonDialog)
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/dcbuffer.h>
#include "GDL/CommonTools.h"
#include "GDL/BitmapGUIManager.h"
#include <string>

//(*IdInit(CustomPolygonDialog)
const long CustomPolygonDialog::ID_STATICTEXT1 = wxNewId();
const long CustomPolygonDialog::ID_TEXTCTRL1 = wxNewId();
const long CustomPolygonDialog::ID_STATICTEXT2 = wxNewId();
const long CustomPolygonDialog::ID_PANEL1 = wxNewId();
const long CustomPolygonDialog::ID_STATICTEXT4 = wxNewId();
const long CustomPolygonDialog::ID_STATICTEXT3 = wxNewId();
const long CustomPolygonDialog::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(CustomPolygonDialog,wxDialog)
	//(*EventTable(CustomPolygonDialog)
	//*)
END_EVENT_TABLE()

CustomPolygonDialog::CustomPolygonDialog(wxWindow* parent, std::vector<sf::Vector2f> coords, wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(CustomPolygonDialog)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Coordonnées du polygone de collision"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	SetClientSize(wxSize(256,279));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5 = new wxFlexGridSizer(3, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer5->AddGrowableRow(1);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Entrez les coordonnées du polygone de collision :\n( Chaque ligne doit contenir un point sous la forme x;y )"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer5->Add(StaticText1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	TextCtrl1 = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer5->Add(TextCtrl1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Il faut entrer les coordonnées dans le sens des aiguilles\nd\'une montre."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	wxFont StaticText2Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText2->SetFont(StaticText2Font);
	FlexGridSizer5->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Aperçu du polygone de collision :"));
	FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	FlexGridSizer6->AddGrowableRow(0);
	previewPnl = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(440,348), wxSIMPLE_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer6->Add(previewPnl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Le point indique l\'origine de l\'objet."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	wxFont StaticText4Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText4->SetFont(StaticText4Font);
	FlexGridSizer7->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cursorPosTxt = new wxStaticText(this, ID_STATICTEXT3, _("Position du curseur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
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
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&CustomPolygonDialog::OnTextCtrl1Text);
	previewPnl->Connect(wxEVT_PAINT,(wxObjectEventFunction)&CustomPolygonDialog::OnpreviewPnlPaint,0,this);
	previewPnl->Connect(wxEVT_MOTION,(wxObjectEventFunction)&CustomPolygonDialog::OnpreviewPnlMouseMove,0,this);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&CustomPolygonDialog::OnokBtClick);
	//*)

	coordsVec = coords;

	TextCtrl1->SetValue(wxString(PhysicsAutomatism::GetStringFromCoordsVector(coordsVec)));
}

CustomPolygonDialog::~CustomPolygonDialog()
{
	//(*Destroy(CustomPolygonDialog)
	//*)
}

void CustomPolygonDialog::OnokBtClick(wxCommandEvent& event)
{
    coordsVec.clear();
    coordsVec = PhysicsAutomatism::GetCoordsVectorFromString(std::string(TextCtrl1->GetValue().mb_str()));

    EndModal(1);
}

void CustomPolygonDialog::OnpreviewPnlPaint(wxPaintEvent& event)
{
    wxBufferedPaintDC dc(previewPnl);
    wxSize panelSize = previewPnl->GetSize();

    //Draw background
    dc.SetBrush(BitmapGUIManager::GetInstance()->transparentBg);
    dc.DrawRectangle(0,0, panelSize.GetWidth(), panelSize.GetHeight());

    std::vector<sf::Vector2f> coordsVec = PhysicsAutomatism::GetCoordsVectorFromString(std::string(TextCtrl1->GetValue().mb_str()));
    if ( coordsVec.empty() ) return; //Bail out now if no point to draw

    //Constructing the wxWidgets polygon.
    std::vector<wxPoint> points;
    for (unsigned int i = 0;i<coordsVec.size();++i)
    {
        points.push_back(wxPoint(coordsVec[i].x+panelSize.GetWidth()/2,
                                 coordsVec[i].y+panelSize.GetHeight()/2));
    }

    //Draw polygon
    dc.SetBrush(wxBrush(wxColor(50, 57, 122), wxFDIAGONAL_HATCH));
    dc.SetPen(wxPen(wxColor(50, 57, 122)));
    dc.DrawPolygon(points.size(), &points[0]);

    //Draw origin
    wxBitmap point(BitmapGUIManager::GetInstance()->point);
    dc.DrawBitmap(point,
                  (0-point.GetWidth()/2)+panelSize.GetWidth()/2,
                  (0-point.GetHeight()/2)+panelSize.GetHeight()/2,
                  true /* use mask */);
}

void CustomPolygonDialog::OnTextCtrl1Text(wxCommandEvent& event)
{
    previewPnl->Refresh(); //Refresh
    previewPnl->Update(); //Immediately
}

void CustomPolygonDialog::OnpreviewPnlMouseMove(wxMouseEvent& event)
{
    wxSize panelSize = previewPnl->GetSize();
    cursorPosTxt->SetLabel(_("Position du curseur :")+" "
                           +ToString(event.GetPosition().x-(panelSize.GetWidth()/2))
                           +";"
                           +ToString(event.GetPosition().y-(panelSize.GetHeight()/2)));
}


#endif
