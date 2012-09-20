/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef ChooseObjectTypeDialog_H
#define ChooseObjectTypeDialog_H

//(*Headers(ChooseObjectTypeDialog)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <string>
namespace gd { class Project; }

namespace gd
{

/**
 * \brief Dialog used to choose an object type, typically when an object must be created.
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API ChooseObjectTypeDialog: public wxDialog
{
public:

    /**
     * \brief Default constructor
     *
     * \param parent The parent wxWindow
     * \param project The project in which the object type must be selected
     */
    ChooseObjectTypeDialog(wxWindow* parent, gd::Project & project);
    virtual ~ChooseObjectTypeDialog();

    /**
     * Returns the selected object type.
     */
    const std::string & GetSelectedObjectType() const { return selectedObjectType; }

    //(*Declarations(ChooseObjectTypeDialog)
    wxStaticBitmap* iconBmp;
    wxStaticText* StaticText2;
    wxTextCtrl* infoEdit;
    wxButton* moreObjectsBt;
    wxButton* cancelBt;
    wxStaticLine* StaticLine2;
    wxButton* okBt;
    wxListCtrl* objectsList;
    //*)


protected:

    //(*Identifiers(ChooseObjectTypeDialog)
    static const long ID_STATICTEXT2;
    static const long ID_LISTCTRL1;
    static const long ID_STATICBITMAP1;
    static const long ID_TEXTCTRL1;
    static const long ID_STATICLINE2;
    static const long ID_BUTTON3;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    //*)

private:

    //(*Handlers(ChooseObjectTypeDialog)
    void OnobjectsListItemSelect(wxListEvent& event);
    void OnobjectsListItemActivated(wxListEvent& event);
    void OncancelBtClick(wxCommandEvent& event);
    void OnokBtClick(wxCommandEvent& event);
    void OnClose(wxCloseEvent& event);
    void OnmoreObjectsBtClick(wxCommandEvent& event);
    //*)

    void RefreshList();

    gd::Project & project;
    std::string selectedObjectType;

    DECLARE_EVENT_TABLE()
};

}

#endif
