/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GAME_DEVELOP_EDITORAPP_H
#define GAME_DEVELOP_EDITORAPP_H

#include <wx/app.h>
#include <wx/log.h>
#include <wx/snglinst.h>
#include "GDL/Game.h"
#include "Game_Develop_EditorMain.h"

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

        Game_Develop_EditorFrame * mainEditor;
        wxSingleInstanceChecker * singleInstanceChecker;
        wxLogGui *log;
        wxLogChain *logChain;
};

#endif // GAME_DEVELOP_EDITORAPP_H
