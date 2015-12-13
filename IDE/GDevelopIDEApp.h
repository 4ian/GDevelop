/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#ifndef GAME_DEVELOP_EDITORAPP_H
#define GAME_DEVELOP_EDITORAPP_H

#include <iostream>
#include <wx/app.h>
#include "GDCore/Tools/Log.h"
#include <wx/ipc.h>
#include <wx/snglinst.h>
#include "GDCore/Project/Project.h"
#include "Dialogs/Rebrander.h"
#include "GDCore/CommonTools.h"
#include "MainFrame.h"
class STServer;

/**
 * \brief Class managing the application, e.g. its initialization, creation of the main window...
 */
class GDevelopIDEApp : public wxApp
{
public:
    virtual bool    OnInit();
    virtual int     OnExit();
    #ifndef DEBUG
    virtual void    OnUnhandledException();
    #endif
    virtual bool    OnExceptionInMainLoop();
    virtual void    OnKeyPressed(wxKeyEvent& event) { if (mainEditor) mainEditor->OnKeyDown(event);};

    MainFrame * mainEditor;
    wxSingleInstanceChecker * singleInstanceChecker;
    STServer * server;
    Rebrander rebrander;
};

/** \brief Tool class used when dealing with interprocess communications.
 */
class STConnection : public wxConnection
{
public:
    STConnection() {}
    ~STConnection() {}

    virtual bool OnExec(const wxString & topic, const wxString &data);
};

/** \brief Tool class used when dealing with interprocess communications by the first instance.
 */
class STServer : public wxServer
{
public:
    wxConnectionBase * OnAcceptConnection(const wxString & topic)
    {
        if ( topic != "GDevelop IDE" ) return NULL;

        //Check that there are no modal dialogs active

        #if (wxUSE_STD_CONTAINERS == 1) //Not the same code if wxWidgets is built with std containers
        wxWindowList::compatibility_iterator node = wxTopLevelWindows.GetFirst();
		#else
        wxWindowList::Node * node = wxTopLevelWindows.GetFirst();
        #endif
        while(node)
        {
            wxDialog * dialog = wxDynamicCast(node->GetData(), wxDialog);
            if ( dialog && dialog->IsModal() ) return NULL;

            node = node->GetNext();
        }

        return new STConnection;
    }
};

class STClient : public wxClient
{
public:
    STClient() {};
    wxConnectionBase * OnMakeConnection() { return new STConnection; };
};

#endif // GAME_DEVELOP_EDITORAPP_H
