/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef OBJECTSONBADLAYERBOX_H
#define OBJECTSONBADLAYERBOX_H

//(*Headers(ObjectsOnBadLayerDialog)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/choice.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDCore/String.h"
#include <vector>

namespace gd
{

/**
 * \brief Tool dialog used by LayersEditorPanel to ask the user what to do of instances which are on a layer being deleted.
 *
 * Calling ShowModal() on this class will return:<br>
 * - 0 to cancel everything
 * - 1 to delete the instances
 * - 2 to move them on another layer
 *
 * \ingroup IDEdialogs
 */
class GD_CORE_API ObjectsOnBadLayerDialog: public wxDialog
{
public:

    ObjectsOnBadLayerDialog(wxWindow* parent, const std::vector < gd::String > & availableLayers);
    virtual ~ObjectsOnBadLayerDialog();

    //(*Declarations(ObjectsOnBadLayerDialog)
    wxStaticText* StaticText2;
    wxButton* Button1;
    wxStaticBitmap* StaticBitmap1;
    wxPanel* Panel1;
    wxStaticText* StaticText1;
    wxButton* Button2;
    wxButton* Button3;
    wxStaticLine* StaticLine1;
    wxChoice* Choice1;
    //*)

    gd::String moveOnLayerNamed;

protected:

    //(*Identifiers(ObjectsOnBadLayerDialog)
    static const long ID_STATICBITMAP1;
    static const long ID_STATICTEXT1;
    static const long ID_PANEL1;
    static const long ID_STATICLINE1;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    static const long ID_STATICTEXT2;
    static const long ID_CHOICE1;
    static const long ID_BUTTON3;
    //*)

private:

    //(*Handlers(ObjectsOnBadLayerDialog)
    void OnDelClick(wxCommandEvent& event);
    void OnMoveClick(wxCommandEvent& event);
    void OnCancelClick(wxCommandEvent& event);
    //*)

    DECLARE_EVENT_TABLE()
};


}
#endif
#endif
