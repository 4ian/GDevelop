/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#ifndef NEWPROJECTDIALOG_H
#define NEWPROJECTDIALOG_H

//(*Headers(NewProjectDialog)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDCore/String.h"

class NewProjectDialog: public wxDialog
{
public:

    NewProjectDialog(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
    virtual ~NewProjectDialog();

    /**
     * Return the file of the chosen template. If empty, the user choose an empty project.
     * Be sure to check that the call to ShowModal() returned 1 and not 0 ( in this case, the user canceled ).
     */
    gd::String GetChosenTemplateFile() const { return chosenTemplateFile; }

    /**
     * Return the filename chosen where the game must be created. If empty, the user choose an empty project.
     * Be sure to check that the call to ShowModal() returned 1 and not 0 ( in this case, the user canceled ).
     */
    gd::String GetChosenFilename() const { return chosenFilename; }

    /**
     * Return the platform used by the chosen template. If empty, the user canceled ( ShowModal() returned 0 )
     */
    gd::String GetChosenTemplatePlatform() const { return chosenTemplatePlatform; }

    /**
     * Return true if the user clicked on the button to browse examples ( ShowModal() returned 0 )
     */
    bool UserWantToBrowseExamples() const { return userWantToBrowseExamples; }

protected:

    //(*Declarations(NewProjectDialog)
    wxStaticText* descTxt;
    wxStaticText* StaticText2;
    wxListCtrl* platformList;
    wxStaticText* StaticText1;
    wxButton* cancelBt;
    wxTextCtrl* projectFileEdit;
    wxStaticLine* StaticLine1;
    wxListCtrl* templateList;
    wxButton* browseBt;
    wxButton* createProjectBt;
    wxHyperlinkCtrl* examplesBt;
    //*)

    //(*Identifiers(NewProjectDialog)
    static const long ID_STATICTEXT1;
    static const long ID_LISTCTRL1;
    static const long ID_LISTCTRL2;
    static const long ID_STATICTEXT3;
    static const long ID_STATICTEXT2;
    static const long ID_TEXTCTRL1;
    static const long ID_BUTTON3;
    static const long ID_STATICLINE1;
    static const long ID_HYPERLINKCTRL1;
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
    void OnbrowseBtClick(wxCommandEvent& event);
    void OnexamplesBtClick(wxCommandEvent& event);
    void OntemplateListItemActivated(wxListEvent& event);
    //*)
    void UpdateListColumnsWidth();
    void RefreshTemplateList();
    void RefreshPlatformList();
    void SendAnalyticsData();

    wxString newProjectBaseFolder; ///< Computed in the constructor

    gd::String chosenFilename;
    gd::String chosenTemplateFile;
    gd::String chosenTemplatePlatform;
    bool userWantToBrowseExamples;

    DECLARE_EVENT_TABLE()
};

#endif
