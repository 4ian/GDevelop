/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef ChooseAutomatismDialog_H
#define ChooseAutomatismDialog_H

//(*Headers(ChooseAutomatismDialog)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/listbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/srchctrl.h>
#include <string>
namespace gd { class Project; }
namespace gd { class Layout; }

namespace gd
{

/**
 * \brief Dialog used to choose an automatism of an object.
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API ChooseAutomatismDialog: public wxDialog
{
public:

    /**
     * Default constructor
     *
     * \param parent The wxWidgets parent window
     * \param project Project
     * \param layout Layout
     * \param parentObject The object from which an automatism must be chosen
     * \param automatismTypeAllowed If not empty, only automatisms of this type will be shown
     */
    ChooseAutomatismDialog(wxWindow* parent, Project & project, gd::Layout & layout, std::string parentObject_, std::string automatismTypeAllowed_);
    virtual ~ChooseAutomatismDialog();

    /**
     * Return the chosen automatism name
     */
    const std::string & GetChosenAutomatism() const { return automatismChosen; }

    //(*Declarations(ChooseAutomatismDialog)
    wxSearchCtrl* searchCtrl;
    wxButton* ChoisirBt;
    wxPanel* Panel1;
    wxStaticText* StaticText1;
    wxStaticLine* StaticLine2;
    wxButton* AnnulerBt;
    wxListBox* automatismsList;
    wxStaticBitmap* StaticBitmap3;
    //*)

protected:

    //(*Identifiers(ChooseAutomatismDialog)
    static const long ID_STATICBITMAP3;
    static const long ID_STATICTEXT1;
    static const long ID_PANEL1;
    static const long ID_STATICLINE2;
    static const long ID_LISTBOX1;
    static const long ID_TEXTCTRL1;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    //*)

private:

    //(*Handlers(ChooseAutomatismDialog)
    void OnChoisirBtClick(wxCommandEvent& event);
    void OnCancelBtClick(wxCommandEvent& event);
    void OnsearchCtrlText(wxCommandEvent& event);
    void OnsearchCtrlTextEnter(wxCommandEvent& event);
    //*)

    void RefreshList();
    Project & project;
    gd::Layout & layout;
    std::string parentObject;
    std::string automatismTypeAllowed;
    std::string automatismChosen;

    DECLARE_EVENT_TABLE()
};

}
#endif
#endif
