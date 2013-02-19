/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef HELPVIEWERDLG_H
#define HELPVIEWERDLG_H

//(*Headers(HelpViewerDlg)
#include <wx/sizer.h>
#include <wx/textctrl.h>
#include "HtmlViewerPnl.h"
#include <wx/aui/aui.h>
#include <wx/panel.h>
#include <wx/dialog.h>
#include <wx/timer.h>
//*)
#include <wx/srchctrl.h>
#include "HtmlViewerPnl.h"
#include "GDCore/Tools/HelpFileAccess.h"

/**
 * \brief The dialog showing the help to the user.
 */
class HelpViewerDlg: public wxDialog
{
public:

    /**
     * \brief Default constructor
     */
    HelpViewerDlg(wxWindow* parent, wxString url);
    virtual ~HelpViewerDlg();

    /**
     * \brief Display a web page from an url.
     */
    void OpenURL(wxString url);

    //(*Declarations(HelpViewerDlg)
    wxAuiManager* AuiManager1;
    wxAuiToolBar* AuiToolBar1;
    wxSearchCtrl* searchCtrl;
    wxPanel* Panel1;
    wxTimer searchTimer;
    HtmlViewerPnl* htmlViewerPanel;
    //*)

protected:

    //(*Identifiers(HelpViewerDlg)
    static const long ID_AUITOOLBARITEM1;
    static const long ID_AUITOOLBARITEM2;
    static const long ID_AUITOOLBARITEM4;
    static const long ID_AUITOOLBARITEM3;
    static const long ID_TEXTCTRL1;
    static const long ID_AUITOOLBAR1;
    static const long ID_PANEL1;
    static const long ID_CUSTOM1;
    static const long ID_TIMER1;
    //*)

private:

    //(*Handlers(HelpViewerDlg)
    void OnpreviousItemBtClick(wxCommandEvent& event);
    void OnnextItemBtClick(wxCommandEvent& event);
    void OnhomeItemBtClick(wxCommandEvent& event);
    void OncontentsItemBtClick(wxCommandEvent& event);
    void OnsearchCtrlTextEnter(wxCommandEvent& event);
    void OnsearchTimerTrigger(wxTimerEvent& event);
    void OnPanel1Resize(wxSizeEvent& event);
    void OnResize(wxSizeEvent& event);
    //*)

    DECLARE_EVENT_TABLE()
};

class HelpProvider : public gd::HelpProvider
{
public:
    /**
     * Open a specific section of the help file
     */
    void OpenURL(wxString url)
    {
        if (!helpDialog)
            helpDialog = new HelpViewerDlg(parentWindow, url);
        else
            helpDialog->OpenURL(url);

        helpDialog->Show();
    }

    /**
     * Allow to specify a parent window, so that the HelpViewerDlg will be declared as a child of this dialog.
     */
    void SetParentWindow(wxWindow * window) { parentWindow = window; }

    static HelpProvider *GetInstance()
    {
        if (NULL == _singleton)
            _singleton =  new HelpProvider;

        return _singleton;
    }

    static void DestroySingleton ()
    {
        if (NULL != _singleton)
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

private:
    HelpProvider() : helpDialog(NULL), parentWindow(NULL) {};
    virtual ~HelpProvider() { if (helpDialog) helpDialog->Destroy(); };

    HelpViewerDlg * helpDialog;
    wxWindow * parentWindow;
    static HelpProvider * _singleton;
};

#endif
