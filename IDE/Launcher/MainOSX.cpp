#include <iostream>
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>

using namespace std;

/**
 * Retrieve current working directory
 */
std::string GetCurrentWorkingDirectory()
{
    char path[2048];
    getcwd(path, 2048);
    return path;
}

std::string GetExecutablePath(char *p_argv[])
{
    string fullExecutablePath;
    if ( *p_argv[0] != '/' )
    {
        fullExecutablePath += GetCurrentWorkingDirectory();
        fullExecutablePath += "/";
    }

    #if !defined(WINDOWS)
    fullExecutablePath += p_argv[0];
    #endif
    return fullExecutablePath.substr( 0, fullExecutablePath.find_last_of( "/" ) );
}

int main(int argc, char *p_argv[])
{
    std::cout << "GDevelop IDE Launcher" << std::endl;

    std::string executablePath = GetExecutablePath(p_argv);
    std::string gdidePath = executablePath + "/../Resources";

    std::cout << "Changing working directory to " << gdidePath << std::endl;
    chdir(gdidePath.c_str());

    std::cout << "Starting GDIDE..." << std::endl;
    int code = system("./GDIDE");
    std::cout << "GDIDE ended with code " << code << "." << std::endl;

    return code;
}
