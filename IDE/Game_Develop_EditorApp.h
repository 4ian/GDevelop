/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GAME_DEVELOP_EDITORAPP_H
#define GAME_DEVELOP_EDITORAPP_H

#include <wx/app.h>
#include <wx/log.h>
#include <wx/snglinst.h>
#include "GDL/Game.h"
#include "MainFrame.h"

/**
 * Class managing the application, e.g. its initialization, creation of the main window...
 */
class Game_Develop_EditorApp : public wxApp
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
};

#endif // GAME_DEVELOP_EDITORAPP_H
