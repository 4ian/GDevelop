/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "SkinHelper.h"
#include "AuiTabArt.h"
#include <wx/ribbon/bar.h>
#include <wx/ribbon/art.h>
#include <wx/aui/aui.h>
#include <wx/aui/auibar.h>
#include <wx/propgrid/propgrid.h>
#include <wx/config.h>
#include <wx/dcbuffer.h>

namespace gd
{

void SkinHelper::ApplyCurrentSkin(wxRibbonBar & bar)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    wxString result;
    pConfig->Read( _T( "/Skin/RDefined" ), &result );

    //Ribbon skin
    if ( result == "true" )
    {
        int r = 120, v = 120, b = 120;
        int r2 = 120, v2 = 120, b2 = 120;

        wxRibbonArtProvider * ribbonArtProvider = NULL;
        pConfig->Read( _T( "/Skin/RibbonStyle" ), &result );

        //Style
        if ( result == "Office" )
            ribbonArtProvider = new wxRibbonMSWArtProvider();
        else if ( result == "AUI" )
            ribbonArtProvider = new wxRibbonAUIArtProvider();
        else
            ribbonArtProvider = new wxRibbonMSWArtProvider();

        bar.SetArtProvider(ribbonArtProvider);

        //Colors
        pConfig->Read( _T( "/Skin/Ribbon1R" ), &r );
        pConfig->Read( _T( "/Skin/Ribbon1G" ), &v );
        pConfig->Read( _T( "/Skin/Ribbon1B" ), &b );

        pConfig->Read( _T( "/Skin/Ribbon2R" ), &r2 );
        pConfig->Read( _T( "/Skin/Ribbon2G" ), &v2 );
        pConfig->Read( _T( "/Skin/Ribbon2B" ), &b2 );

        wxColour colour, secondary, tertiary;
        bar.GetArtProvider()->GetColourScheme(&colour, &secondary, &tertiary);
        bar.GetArtProvider()->SetColourScheme(wxColour(r, v, b), wxColour(r2, v2, b2), wxColour(0, 0, 0));

    }
    else
    {
        bar.SetArtProvider(new wxRibbonMSWArtProvider());
        bar.GetArtProvider()->SetColourScheme(wxColour(244, 245, 247), wxColour(231, 241, 254), wxColour(0, 0, 0));
    }
}

void SkinHelper::ApplyCurrentSkin(wxAuiManager & auiManager)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    wxString result;

    //DockArt skin
    wxAuiDefaultDockArt *dockArt = new wxAuiDefaultDockArt();
    pConfig->Read( _T( "/Skin/Defined" ), &result );
    if ( result == "true" )
    {
        int r = 120, v = 120, b = 120;

        pConfig->Read( _T( "/Skin/PaneA1R" ), &r );
        pConfig->Read( _T( "/Skin/PaneA1G" ), &v );
        pConfig->Read( _T( "/Skin/PaneA1B" ), &b );
        dockArt->SetColour( 7, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/PaneA2R" ), &r );
        pConfig->Read( _T( "/Skin/PaneA2G" ), &v );
        pConfig->Read( _T( "/Skin/PaneA2B" ), &b );
        dockArt->SetColour( 8, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/PaneI1R" ), &r );
        pConfig->Read( _T( "/Skin/PaneI1G" ), &v );
        pConfig->Read( _T( "/Skin/PaneI1B" ), &b );
        dockArt->SetColour( 9, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/PaneI2R" ), &r );
        pConfig->Read( _T( "/Skin/PaneI2G" ), &v );
        pConfig->Read( _T( "/Skin/PaneI2B" ), &b );
        dockArt->SetColour( 10, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/BorderR" ), &r );
        pConfig->Read( _T( "/Skin/BorderG" ), &v );
        pConfig->Read( _T( "/Skin/BorderB" ), &b );
        dockArt->SetColour( 13, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/BackR" ), &r );
        pConfig->Read( _T( "/Skin/BackG" ), &v );
        pConfig->Read( _T( "/Skin/BackB" ), &b );
        dockArt->SetColour( 6, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/ATextR" ), &r );
        pConfig->Read( _T( "/Skin/ATextG" ), &v );
        pConfig->Read( _T( "/Skin/ATextB" ), &b );
        dockArt->SetColour( 11, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/ITextR" ), &r );
        pConfig->Read( _T( "/Skin/ITextG" ), &v );
        pConfig->Read( _T( "/Skin/ITextB" ), &b );
        dockArt->SetColour( 12, wxColour( r, v, b ) );
    }
    else
    {
        dockArt->SetColour(6, wxColour(211,222,246));
        dockArt->SetColour(13, wxColour(172,183,208));
        dockArt->SetColour(9, wxColour(214,221,233));
        dockArt->SetColour(10, wxColour(214,221,233));
        dockArt->SetColour(7, wxColour(221,229,246));
        dockArt->SetColour(8, wxColour(221,229,246));
        dockArt->SetColour(11, wxColour(104,114,138));
        dockArt->SetColour(12, wxColour(104,114,138));
    }
    dockArt->SetColour(wxAUI_DOCKART_BACKGROUND_COLOUR, wxSystemSettings::GetColour(wxSYS_COLOUR_MENU));

    auiManager.SetArtProvider(dockArt);
}

void SkinHelper::ApplyCurrentSkin(wxAuiNotebook & notebook)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    wxString result;

    gd::AuiTabArt * tabArt = new gd::AuiTabArt();
    pConfig->Read( _T( "/Skin/Defined" ), &result );
    if ( result == "true" )
    {
        wxColor tabColor;
        pConfig->Read( _T( "/Skin/TabColor" ), &tabColor );
        tabArt->SetColour(tabColor);

        wxColor activeTabColor;
        pConfig->Read( _T( "/Skin/ActiveTabColor" ), &activeTabColor );
        tabArt->SetActiveColour(activeTabColor);
    }
    else
    {
        tabArt->SetColour(wxColour(220, 225, 232));
        tabArt->SetActiveColour(wxColour(220, 225, 232));
    }

    notebook.SetArtProvider(tabArt);
}

class AuiToolBarArt : public wxAuiDefaultToolBarArt
{
public:

    AuiToolBarArt() : wxAuiDefaultToolBarArt() {};
    virtual ~AuiToolBarArt() {};

    virtual wxAuiToolBarArt* Clone() { return static_cast<wxAuiToolBarArt*>(new AuiToolBarArt); };

    virtual void DrawBackground( wxDC& dc, wxWindow* wnd, const wxRect& rect_)
    {
        //Defines the two rectangles for gradient
        wxRect rect1 = rect_;
        rect1.height /= 3;
        wxRect rect2 = rect_;
        rect2.y += rect1.height;
        rect2.height = rect2.height*2.0/3.0+1;

        wxColour startColour = m_baseColour.ChangeLightness(165);
        wxColour intermediateColour = m_baseColour.ChangeLightness(140);
        wxColour endColour = m_baseColour.ChangeLightness(125);
        intermediateColour.Set(intermediateColour.Red()-10,intermediateColour.Green()-10, intermediateColour.Blue()+10);

        dc.GradientFillLinear(rect1, startColour, intermediateColour, wxSOUTH);
        dc.GradientFillLinear(rect2, intermediateColour, endColour, wxSOUTH);
    }
};

void SkinHelper::ApplyCurrentSkin(wxAuiToolBar & toolbar)
{
    toolbar.SetArtProvider(new AuiToolBarArt);
}

void SkinHelper::ApplyCurrentSkin(wxPropertyGrid & propertyGrid)
{
    propertyGrid.SetMarginColour( wxSystemSettings::GetColour(wxSYS_COLOUR_MENU) );
    propertyGrid.SetCaptionBackgroundColour( wxSystemSettings::GetColour(wxSYS_COLOUR_MENU) );
    propertyGrid.SetEmptySpaceColour( wxSystemSettings::GetColour(wxSYS_COLOUR_MENU) );
    propertyGrid.SetCellBackgroundColour( *wxWHITE );
    propertyGrid.SetCellTextColour( *wxBLACK );
    propertyGrid.SetLineColour( wxColour(212,208,200) );
}

}
