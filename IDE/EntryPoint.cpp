#include "EntryPoint.h"
#include "GDevelopIDEApp.h"

extern "C" int LaunchGDIDE(int argc, char **argv)
{
    GDevelopIDEApp * app = new GDevelopIDEApp;
    wxApp::SetInstance(app);
    return wxEntry(argc, argv);
}
