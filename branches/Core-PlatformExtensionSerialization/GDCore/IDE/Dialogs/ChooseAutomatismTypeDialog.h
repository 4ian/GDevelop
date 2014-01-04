/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_AUTOMATISMTYPECHOICE_H
#define GDCORE_AUTOMATISMTYPECHOICE_H

//(*Headers(ChooseAutomatismTypeDialog)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/choice.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
namespace gd { class Project; }

namespace gd {

/**
 * \brief Dialog displaying all the automatisms types available in a project, allowing the user to choose one.
 * \ingroup IDEDialogs
 */
class GD_CORE_API ChooseAutomatismTypeDialog: public wxDialog
{
public:

    /**
     * \brief Default constructor
     *
     * \param parent The parent wxWindow
     * \param project The project in which the automatism type must be selected
     */
    ChooseAutomatismTypeDialog(wxWindow* parent, gd::Project & project);
    virtual ~ChooseAutomatismTypeDialog();

    /**
     * Returns the selected automatism type.
     */
    const std::string & GetSelectedAutomatismType() const { return selectedAutomatismType; }

private:

    //(*Declarations(ChooseAutomatismTypeDialog)
    wxStaticBitmap* StaticBitmap2;
    wxChoice* platformChoice;
    wxStaticText* StaticText2;
    wxStaticText* StaticText1;
    wxButton* cancelBt;
    wxStaticLine* StaticLine2;
    wxListCtrl* automatismsList;
    wxHyperlinkCtrl* helpBt;
    wxButton* okBt;
    //*)

    //(*Identifiers(ChooseAutomatismTypeDialog)
    static const long ID_STATICTEXT1;
    static const long ID_LISTCTRL1;
    static const long ID_STATICTEXT2;
    static const long ID_STATICLINE2;
    static const long ID_CHOICE1;
    static const long ID_STATICBITMAP5;
    static const long ID_HYPERLINKCTRL2;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    //*)

    //(*Handlers(ChooseAutomatismTypeDialog)
    void OnautomatismsListItemActivated(wxListEvent& event);
    void OnautomatismsListItemSelect(wxListEvent& event);
    void OnokBtClick(wxCommandEvent& event);
    void OncancelBtClick(wxCommandEvent& event);
    void OnmoreAutomatismsBtClick(wxCommandEvent& event);
    void OnResize(wxSizeEvent& event);
    void OnhelpBtClick(wxCommandEvent& event);
    void OnplatformChoiceSelect(wxCommandEvent& event);
    //*)
    void UpdateListColumnsWidth();
    void RefreshList();

    gd::Project & project;
    std::string selectedAutomatismType;

    DECLARE_EVENT_TABLE()
};

}
#endif
