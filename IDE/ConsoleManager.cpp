#include "ConsoleManager.h"
#ifdef ___WXMSW___
#include <wx/msw/winundef.h>
#endif
#include "ConsoleFrame.h"
#ifdef ___WXMSW___
#include <wx/msw/winundef.h>
#endif

ConsoleManager::ConsoleManager()
{
    console = new ConsoleFrame(0);
}

ConsoleManager::~ConsoleManager()
{
    console->Destroy();
}

void ConsoleManager::ShowConsole()
{
    console->Show();
}
