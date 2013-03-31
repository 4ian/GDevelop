#include "EntryPoint.h"
#include "Game_Develop_EditorApp.h"

extern "C" int LaunchGDIDE(int argc, char **argv)
{
    Game_Develop_EditorApp * app = new Game_Develop_EditorApp;
    wxApp::SetInstance(app);
    return wxEntry(argc, argv);
}
