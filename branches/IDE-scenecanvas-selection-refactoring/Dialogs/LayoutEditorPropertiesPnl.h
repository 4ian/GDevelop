/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef LAYOUTEDITORPROPERTIESPNL_H
#define LAYOUTEDITORPROPERTIESPNL_H

//(*Headers(LayoutEditorPropertiesPnl)
#include <wx/sizer.h>
#include <wx/propgrid/propgrid.h>
#include <wx/panel.h>
//*)
namespace gd { class InitialInstance; }

class LayoutEditorPropertiesPnl: public wxPanel
{
public:

    LayoutEditorPropertiesPnl(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
    virtual ~LayoutEditorPropertiesPnl();

    //(*Declarations(LayoutEditorPropertiesPnl)
    wxPropertyGrid* propertyGrid;
    //*)
    void SelectInitialPosition(const gd::InitialInstance & instance);

protected:

    //(*Identifiers(LayoutEditorPropertiesPnl)
    static const long ID_PROPGRID;
    //*)

private:

    //(*Handlers(LayoutEditorPropertiesPnl)
    //*)
    void OnPropertySelected(wxPropertyGridEvent& event);
    void OnPropertyChanged(wxPropertyGridEvent& event);

    DECLARE_EVENT_TABLE()
};

#endif
