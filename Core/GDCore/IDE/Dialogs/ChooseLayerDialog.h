/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef CHOIXLAYER_H
#define CHOIXLAYER_H

//(*Headers(ChooseLayerDialog)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/listbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDCore/PlatformDefinition/Layout.h"
#include <string>
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
    const std::string & GetChosenLayer() const { return chosenLayer; }

    //(*Declarations(ChooseLayerDialog)
    wxPanel* Panel1;
    wxStaticText* StaticText1;
    wxButton* cancelBt;
    wxStaticLine* StaticLine2;
    wxListBox* layersList;
    wxStaticLine* StaticLine1;
    wxButton* okBt;
    wxStaticBitmap* StaticBitmap3;
    //*)


protected:

    //(*Identifiers(ChooseLayerDialog)
    static const long ID_STATICBITMAP3;
    static const long ID_STATICTEXT1;
    static const long ID_PANEL1;
    static const long ID_STATICLINE2;
    static const long ID_LISTBOX1;
    static const long ID_STATICLINE1;
    static const long ID_BUTTON2;
    static const long ID_BUTTON1;
    //*)

private:

    //(*Handlers(ChooseLayerDialog)
    void OnokBtClick(wxCommandEvent& event);
    void OncancelBtClick(wxCommandEvent& event);
    //*)

    bool addQuotes;
    std::string chosenLayer;

    DECLARE_EVENT_TABLE()
};


}
#endif
