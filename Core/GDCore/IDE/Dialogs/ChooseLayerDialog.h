/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef CHOIXLAYER_H
#define CHOIXLAYER_H

//(*Headers(ChooseLayerDialog)
#include <wx/sizer.h>
#include <wx/listbox.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDCore/Project/Layout.h"
#include "GDCore/String.h"
#include <vector>

namespace gd
{

/**
 * \brief Dialog used to choose a layer from a layout.
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API ChooseLayerDialog: public wxDialog
{
public:

    /**
     * \brief Default constructor
     */
    ChooseLayerDialog(wxWindow* parent, const gd::Layout & layout, bool addQuotes_ = true);
    virtual ~ChooseLayerDialog();

    /**
     * \brief Return the selected layer
     */
    const gd::String & GetChosenLayer() const { return chosenLayer; }

    //(*Declarations(ChooseLayerDialog)
    wxButton* cancelBt;
    wxListBox* layersList;
    wxStaticLine* StaticLine1;
    wxButton* okBt;
    //*)


protected:

    //(*Identifiers(ChooseLayerDialog)
    static const long ID_LISTBOX1;
    static const long ID_STATICLINE1;
    static const long ID_BUTTON2;
    static const long ID_BUTTON1;
    //*)

private:

    //(*Handlers(ChooseLayerDialog)
    void OnokBtClick(wxCommandEvent& event);
    void OncancelBtClick(wxCommandEvent& event);
    void OnlayersListDClick(wxCommandEvent& event);
    //*)

    bool addQuotes;
    gd::String chosenLayer;

    DECLARE_EVENT_TABLE()
};


}
#endif
#endif
