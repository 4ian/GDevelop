/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#include <wx/datetime.h>
#include <wx/filename.h>
#include "GDL/Game.h"
#include "GDL/SourceFileBuilder.h"
#include "GDL/CommonTools.h"
#include "GDL/SourceFile.h"

std::string SourceFileBuilder::gccCompilerExecutablePath = "C:/Mingw/bin/mingw32-g++";
std::string SourceFileBuilder::wxwidgetsLibDir = "C:/Libs/wxwidgets/lib/gcc_dll";
std::string SourceFileBuilder::wxwidgetsLibDir2 = "C:/Libs/wxwidgets/lib/gcc_dll/msw";
std::string SourceFileBuilder::wxwidgetsIncludeDir2 = "C:/Libs/wxwidgets/lib/gcc_dll/msw";
std::string SourceFileBuilder::wxwidgetsIncludeDir = "C:/Libs/wxwidgets/include/";
std::string SourceFileBuilder::wxwidgetsLibs = " -lwxmsw29_xrc -lwxmsw29_richtext -lwxmsw29_ribbon -lwxmsw29_aui -lwxmsw29_adv -lwxmsw29_html -lwxmsw29_core -lwxbase29_xml -lwxbase29_net -lwxexpat -lwxbase29 -lwxpng -lwxjpeg -lwxzlib -lwxtiff";
std::string SourceFileBuilder::wxwidgetsDefines = "wxUSE_UNICODE=0 wxDEBUG_LEVEL=0 WXUSINGDLL __GNUWIN32__ __WXMSW__";
std::string SourceFileBuilder::sfmlLibDir = "C:/Libs/SFML/bin-mingw-release/lib";
std::string SourceFileBuilder::sfmlIncludeDir = "C:/Libs/SFML/include/";
std::string SourceFileBuilder::sfmlLibs = "-lsfml-audio -lsfml-graphics -lsfml-network -lsfml-window -lsfml-system";
std::string SourceFileBuilder::sfmlDefines = "SFML_DYNAMIC";
std::string SourceFileBuilder::boostIncludeDir = "C:/Libs/boost_1_43_0";
std::string SourceFileBuilder::boostDefines = "BOOST_DISABLE_ASSERTS";
std::string SourceFileBuilder::gdlIncludeDir = "D:/Florian/Programmation/GameDevelop/GDL";
std::string SourceFileBuilder::gdlLibDir = "D:/Florian/Programmation/GameDevelop/IDE/bin/dev";
std::string SourceFileBuilder::gdlDefines = "GD_IDE_ONLY GD_DYNAMIC_EXTENSIONS GD_API=__declspec(dllimport) DEV NDEBUG PYSUPPORT";
std::string SourceFileBuilder::gdlLibs = "-lgdl.dll";
std::string SourceFileBuilder::osLibs = "-lkernel32 -luser32 -lopengl32 -limm32 -lcomctl32 -lglu32 -lws2_32 -lgdi32 -lwinmm -luuid -lshell32 -lole32 -lwinspool -ladvapi32 -lcomdlg32 -loleaut32 -lopengl32 -lglu32";
std::string SourceFileBuilder::osDefines = "WINDOWS";



SourceFileBuilder::SourceFileBuilder(Game & game_) :
    game(game_)
{
}

bool SourceFileBuilder::BuildSourceFiles()
{
    std::string compilerOutput;
    bool needLinking = false;

    for (unsigned int i = 0;i<game.externalSourceFiles.size();++i)
    {
        wxFileName file(game.externalSourceFiles[i]->GetFileName());
        if ( file.GetModificationTime().GetTicks() > game.externalSourceFiles[i]->GetLastBuildTimeStamp() )
        {
            needLinking = true;
            if ( !BuildSourceFile(string(file.GetFullPath().mb_str()), compilerOutput) )
            {
                cout << "Build failed";
                return false;
            }

            game.externalSourceFiles[i]->SetLastBuildTimeStamp(wxDateTime::GetTimeNow());
        }
    }

    if ( !needLinking ) return true;

    std::vector<std::string> sourcesFilesToLink;
    for (unsigned int i = 0;i<game.externalSourceFiles.size();++i)
    {
        wxFileName file(game.externalSourceFiles[i]->GetFileName());
        sourcesFilesToLink.push_back(string(file.GetPath().mb_str())+"/"+string(file.GetName().mb_str())+".o");
    }

    if ( !LinkSourceFiles(sourcesFilesToLink, compilerOutput) )
    {
        return false;
    }

    return true;
}

bool SourceFileBuilder::BuildSourceFile(std::string filename, std::string & compilerOutput)
{
    wxFileName file(filename);

    std::string includesStr = " -I"+gdlIncludeDir+" -I"+wxwidgetsIncludeDir+" -I"+wxwidgetsIncludeDir2+" -I"+sfmlIncludeDir+" -I"+boostIncludeDir;

    std::string definesStr;
    {
        vector < string > defines = SpliterStringToVector<string>(gdlDefines, ' ');
        for (unsigned int i = 0;i<defines.size();++i)
            definesStr += " -D"+defines[i];
    }
    {
        vector < string > defines = SpliterStringToVector<string>(sfmlDefines, ' ');
        for (unsigned int i = 0;i<defines.size();++i)
            definesStr += " -D"+defines[i];
    }
    {
        vector < string > defines = SpliterStringToVector<string>(wxwidgetsDefines, ' ');
        for (unsigned int i = 0;i<defines.size();++i)
            definesStr += " -D"+defines[i];
    }
    {
        vector < string > defines = SpliterStringToVector<string>(osDefines, ' ');
        for (unsigned int i = 0;i<defines.size();++i)
            definesStr += " -D"+defines[i];
    }
    {
        vector < string > defines = SpliterStringToVector<string>(boostDefines, ' ');
        for (unsigned int i = 0;i<defines.size();++i)
            definesStr += " -D"+defines[i];
    }

    wxArrayString output;
    wxArrayString errors;
    wxExecute(gccCompilerExecutablePath+" -O2 -Wall -m32 "+definesStr+" "+includesStr+" -c "+filename+" -o "+file.GetPath()+"/"+file.GetName()+".o", output, errors);

    cout << endl << gccCompilerExecutablePath+" -O2 -Wall -m32 "+definesStr+" "+includesStr+" -c "+filename+" -o "+file.GetPath()+"/"+file.GetName()+".o " << endl;

    for (unsigned int i = 0;i<output.GetCount() && i<20;++i)
        cout << output[i] << endl;
    for (unsigned int i = 0;i<errors.GetCount() && i<20;++i)
        cout << errors[i] << endl;

    return true;
}

bool SourceFileBuilder::LinkSourceFiles(std::vector<std::string> files, std::string & compilerOutput)
{
    std::string libsDirStr = " -L"+gdlLibDir+" -L"+wxwidgetsLibDir+" -L"+sfmlLibDir;
    std::string libsStr = gdlLibs+" "+wxwidgetsLibs+" "+sfmlLibs+" "+osLibs;

    std::string filesStr;
    for (unsigned int i = 0;i<files.size();++i)
        filesStr += " "+files[i];

    wxArrayString output;
    wxArrayString errors;
    wxExecute(gccCompilerExecutablePath+" -shared -Wl,--dll "+libsDirStr +" " + filesStr +" -o test.dxgd -s " + libsStr + " ", output, errors);

    cout << gccCompilerExecutablePath+" -shared -Wl,--dll "+libsDirStr +" " + filesStr +" -o test.dxgd -s " + libsStr + " ";

    for (unsigned int i = 0;i<output.GetCount() && i<20;++i)
        cout << output[i] << endl;
    for (unsigned int i = 0;i<errors.GetCount() && i<20;++i)
        cout << errors[i] << endl;

    return true;
}

#endif
#endif
