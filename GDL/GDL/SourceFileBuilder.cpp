/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#include <wx/config.h>
#include <wx/datetime.h>
#include <wx/filename.h>
#include "GDL/Game.h"
#include "GDL/SourceFileBuilder.h"
#include "GDL/CommonTools.h"
#include "GDL/SourceFile.h"


SourceFileBuilder::SourceFileBuilder(Game & game_) :
    game(game_)
{
    wxwidgetsLibs = " -lwxmsw29_xrc -lwxmsw29_richtext -lwxmsw29_ribbon -lwxmsw29_aui -lwxmsw29_adv -lwxmsw29_html -lwxmsw29_core -lwxbase29_xml -lwxbase29_net -lwxexpat -lwxbase29 -lwxpng -lwxjpeg -lwxzlib -lwxtiff";
    wxwidgetsDefines = "wxUSE_UNICODE=0 wxDEBUG_LEVEL=0 WXUSINGDLL __GNUWIN32__ __WXMSW__";
    sfmlLibs = "-lsfml-audio -lsfml-graphics -lsfml-network -lsfml-window -lsfml-system";
    sfmlDefines = "SFML_DYNAMIC";
    boostDefines = "BOOST_DISABLE_ASSERTS";
    gdlDefines = "GD_IDE_ONLY GD_DYNAMIC_EXTENSIONS GD_API=__declspec(dllimport) DEV NDEBUG PYSUPPORT";
    gdlLibs = "-lgdl.dll";
    osLibs = "-lkernel32 -luser32 -lopengl32 -limm32 -lcomctl32 -lglu32 -lws2_32 -lgdi32 -lwinmm -luuid -lshell32 -lole32 -lwinspool -ladvapi32 -lcomdlg32 -loleaut32 -lopengl32 -lglu32";
    osDefines = "WINDOWS";
}

bool SourceFileBuilder::BuildSourceFiles()
{
    bool needLinking = false;
    errors.clear();

    //Compiling
    for (unsigned int i = 0;i<game.externalSourceFiles.size();++i)
    {
        wxFileName file(game.externalSourceFiles[i]->GetFileName());
        if ( file.GetModificationTime().GetTicks() > game.externalSourceFiles[i]->GetLastBuildTimeStamp() )
        {
            needLinking = true;
            if ( !BuildSourceFile(string(file.GetFullPath().mb_str())) )
                return false;

            game.externalSourceFiles[i]->SetLastBuildTimeStamp(wxDateTime::GetTimeNow());
        }
    }

    //Linking
    if ( !needLinking ) return true;

    std::vector<std::string> sourcesFilesToLink;
    for (unsigned int i = 0;i<game.externalSourceFiles.size();++i)
    {
        wxFileName file(game.externalSourceFiles[i]->GetFileName());
        sourcesFilesToLink.push_back(string(file.GetPath().mb_str())+"/"+string(file.GetName().mb_str())+".o");
    }

    if ( !LinkSourceFiles(sourcesFilesToLink) )
        return false;

    return true;
}

bool SourceFileBuilder::BuildSourceFile(std::string filename)
{
    wxFileName file(filename);

    std::string includesStr = " -I"+pathManager.gdlIncludeDir+" -I"+pathManager.wxwidgetsIncludeDir+" -I"+
                              pathManager.wxwidgetsIncludeDir2+" -I"+pathManager.sfmlIncludeDir+" -I"+pathManager.boostIncludeDir;

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
    wxArrayString outputErrors;
    wxExecute(pathManager.gccCompilerExecutablePath+" -O2 -Wall -m32 "+definesStr+" "+includesStr+" -c "+filename+" -o "+file.GetPath()+"/"+file.GetName()+".o", output, outputErrors);

    for (unsigned int i = 0;i<output.GetCount() && i<20;)
    {
        errors.push_back(string(output[i].mb_str()));

        ++i;
        if ( i == 20 ) errors.push_back(string(_("Plus d'erreurs non affichées.").mb_str()));
    }
    for (unsigned int i = 0;i<outputErrors.GetCount() && i<20;)
    {
        errors.push_back(string(outputErrors[i].mb_str()));

        ++i;
        if ( i == 20 ) errors.push_back(string(_("Plus d'erreurs non affichées.").mb_str()));
    }

    return errors.empty();
}

bool SourceFileBuilder::LinkSourceFiles(std::vector<std::string> files)
{
    std::string libsDirStr = " -L"+pathManager.gdlLibDir+" -L"+pathManager.wxwidgetsLibDir+" -L"+pathManager.sfmlLibDir;
    std::string libsStr = gdlLibs+" "+wxwidgetsLibs+" "+sfmlLibs+" "+osLibs;

    std::string filesStr;
    for (unsigned int i = 0;i<files.size();++i)
        filesStr += " "+files[i];

    wxArrayString output;
    wxArrayString outputErrors;
    wxExecute(pathManager.gccCompilerExecutablePath+" -shared -Wl,--dll "+libsDirStr +" " + filesStr +" -o test.dxgd -s " + libsStr + " ", output, outputErrors);

    for (unsigned int i = 0;i<output.GetCount() && i<20;)
    {
        errors.push_back(string(output[i].mb_str()));

        ++i;
        if ( i == 20 ) errors.push_back(string(_("Plus d'erreurs non affichées.").mb_str()));
    }
    for (unsigned int i = 0;i<outputErrors.GetCount() && i<20;)
    {
        errors.push_back(string(outputErrors[i].mb_str()));

        ++i;
        if ( i == 20 ) errors.push_back(string(_("Plus d'erreurs non affichées.").mb_str()));
    }

    return errors.empty();
}

#endif
#endif
