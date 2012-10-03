/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef NEWPROJECTDIALOG_H
#define NEWPROJECTDIALOG_H

//(*Headers(NewProjectDialog)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class NewProjectDialog: public wxDialog
{
public:

    NewProjectDialog(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
    virtual ~NewProjectDialog();

    //(*Declarations(NewProjectDialog)
    wxStaticText* StaticText2;
    wxListCtrl* platformList;
    wxStaticText* StaticText1;
    wxButton* cancelBt;
    wxTextCtrl* projectFileEdit;
    wxButton* Button3;
    wxStaticLine* StaticLine1;
    wxListCtrl* templateList;
    wxButton* createProjectBt;
    //*)

    /**
     * Return the file of the chosen template. If empty, the user choose an empty project.
     * Be sure to check that the call to ShowModal() returned 1 and not 0 ( in this case, the user canceled ).
     */
    std::string GetChosenTemplateFile() const { return chosenTemplateFile; }

    /**
     * Return the filename chosen where the game must be created. If empty, the user choose an empty project.
     * Be sure to check that the call to ShowModal() returned 1 and not 0 ( in this case, the user canceled ).
     */
    std::string GetChosenFilename() const { return chosenFilename; }

    /**
     * Return the platform used by the chosen template. If empty, the user canceled ( ShowModal() returned 0 )
     */
    std::string GetChosenTemplatePlatform() const { return chosenTemplatePlatform; }

protected:

    //(*Identifiers(NewProjectDialog)
    static const long ID_STATICTEXT1;
    static const long ID_LISTCTRL1;
    static const long ID_LISTCTRL2;
    static const long ID_STATICTEXT2;
    static const long ID_TEXTCTRL1;
    static const long ID_BUTTON3;
    static const long ID_STATICLINE1;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    //*)

private:

    //(*Handlers(NewProjectDialog)
    void OnResize(wxSizeEvent& event);
    void OncreateProjectBtClick(wxCommandEvent& event);
    void OncancelBtClick(wxCommandEvent& event);
    void OntemplateListItemSelect(wxListEvent& event);
    void OnplatformListItemSelect(wxListEvent& event);
    //*)
    void UpdateListColumnsWidth();
    void RefreshTemplateList();
    void RefreshPlatformList();

    std::string chosenFilename;
    std::string chosenTemplateFile;
    std::string chosenTemplatePlatform;


    DECLARE_EVENT_TABLE()
};

#endif
