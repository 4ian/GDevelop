#include <iostream>
#include <SFML/Graphics.hpp>
#include <windows.h>
#include <windows.h>
#include <Commdlg.h>
#include <sstream>
typedef HINSTANCE Handle;
typedef int (*EntryPointType)(int, char**);

int AbortWithMessage(const std::string & message)
{
    std::cout << message;
    MessageBox(NULL, message.c_str(), "Fatal error :(", MB_ICONERROR);
    return EXIT_FAILURE;
}

using namespace std;

std::string GetDynamicLibLastError()
{
    LPSTR lpMsgBuf;
    DWORD dw = GetLastError();

    FormatMessage(
        FORMAT_MESSAGE_ALLOCATE_BUFFER |
        FORMAT_MESSAGE_FROM_SYSTEM |
        FORMAT_MESSAGE_IGNORE_INSERTS,
        NULL,
        dw,
        MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
        (LPTSTR) &lpMsgBuf,
        0, NULL );


    std::ostringstream oss;
    oss << dw;

    std::string errorMsg = "Error ("+oss.str()+"): "+std::string(lpMsgBuf);
    return errorMsg;
}

int main(int argc, char ** argv)
{
    std::cout << "Game Develop IDE Launcher" << std::endl;
    std::cout << "Creating a dummy SFML object..." << std::endl;
    sf::Texture texture;

    std::cout << "Opening GDIDE.dll..." << std::endl;
    Handle lib = LoadLibrary("GDIDE.dll");
    if ( lib == NULL )
    {
        std::string error =  "Unable to open GDIDE.dll!\n";
        error += "Full error message:\n";
        error += GetDynamicLibLastError();
        error += "\n\nMake sure that Game Develop is correctly installed and that GDIDE.dll is not missing.";

        return AbortWithMessage(error);
    }

    EntryPointType entryPoint = (EntryPointType)GetProcAddress(lib, "LaunchGDIDE");

    if ( entryPoint == NULL )
    {
        std::string error =  "Unable to find the IDE entry point!\n";
        error += "Full error message:\n";
        error += GetDynamicLibLastError();
        error += "\n\nPlease report this error on the Game Develop forum.";

        return AbortWithMessage(error);
    }

    std::cout << "Starting Game Develop..." << std::endl;
    int code = entryPoint(argc, argv);
    std::cout << "Closing GDIDE.dll..";
    FreeLibrary(lib);

    std::cout << "." << std::endl;
    return code;
}
