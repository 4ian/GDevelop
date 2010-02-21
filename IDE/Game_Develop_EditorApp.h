/***************************************************************
 * Name:      Game_Develop_EditorApp.h
 * Purpose:   Defines Application Class
 * Author:    Florian "4ian" Rival ()
 * Created:   2008-03-01
 * Copyright: Florian "4ian" Rival ()
 * License:
 **************************************************************/

#ifndef GAME_DEVELOP_EDITORAPP_H
#define GAME_DEVELOP_EDITORAPP_H

#include <wx/app.h>
#include <wx/log.h>
#include "GDL/Game.h"
#include "Game_Develop_EditorMain.h"

class Game_Develop_EditorApp : public wxApp
{
    public:
        virtual bool    OnInit();
        virtual int     OnExit();
        virtual void    OnUnhandledException();
        virtual bool    OnExceptionInMainLoop();

        Game_Develop_EditorFrame * Frame;
        wxLogGui *log;
        wxLogStderr *log_stderr_;
        wxLogChain *logChain;
        wxLogChain *logChain2;
        wxLocale m_locale;
};

#endif // GAME_DEVELOP_EDITORAPP_H
