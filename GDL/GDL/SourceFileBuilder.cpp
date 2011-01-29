/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#include <wx/process.h>
#include <wx/txtstrm.h>
#include <wx/config.h>
#include <wx/datetime.h>
#include <wx/filename.h>
#include <wx/gauge.h>
#include <wx/stattext.h>
#include "GDL/Game.h"
#include "GDL/SourceFileBuilder.h"
#include "GDL/CommonTools.h"
#include "GDL/SourceFile.h"

SourceFileBuilder::SourceFileBuilder(wxGauge * progressGauge_, wxStaticText * statusText_) :
    currentBuildProcess(NULL),
    state(0),
    linkingNeed(false),
    lastBuildSuccessed(false),
    progressGauge(progressGauge_),
    currentTaskTxt(statusText_)
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

void BuildProcess::OnTerminate(int pid, int status)
{
    while ( HasInput() )  //Be sure we've got all output
        ;

    //Transfer logs and notify parent task is ended.
    std::copy(outputErrors.begin(), outputErrors.end(), std::back_inserter(m_parent->errors));
    m_parent->OnCurrentBuildProcessTerminated(status == 0);
}

bool SourceFileBuilder::LaunchSourceFilesBuild()
{
    if (IsBuilding()) return false; //Make sure another build is not launched

    state = 1;
    currentFileBuilded = 0;
    lastBuildSuccessed = false;
    abordBuild = false;
    linkingNeed = false;
    errors.clear();

    //Launch build process
    OnCurrentBuildProcessTerminated(true);

    return true;
}

/**
 * Manage build system. Called each time a build/link process is terminated.
 */
void SourceFileBuilder::OnCurrentBuildProcessTerminated(bool success)
{
    if ( currentBuildProcess )
    {
        delete currentBuildProcess;
        currentBuildProcess = NULL;
    }

    if ( !success || abordBuild )
    {
        if ( currentTaskTxt ) currentTaskTxt->SetLabel(_("Compilation arrêtée."));
        state = 0;
        return; //Stop build if it failed
    }

    //Build state
    if ( state == 1 || state == 2 )
    {
        if ( state != 1 )
        {
            sourceFiles[currentFileBuilded]->SetLastBuildTimeStamp(wxDateTime::GetTimeNow());
            currentFileBuilded++;
        }
        else state = 2;

        while ( currentFileBuilded < sourceFiles.size() &&
                ( wxFileExists(sourceFiles[currentFileBuilded]->GetFileName()) &&
                  sourceFiles[currentFileBuilded]->GetLastBuildTimeStamp() > wxFileName(sourceFiles[currentFileBuilded]->GetFileName()).GetModificationTime().GetTicks() ) )
            currentFileBuilded++;

        if ( currentFileBuilded < sourceFiles.size() ) //Continue building...
        {
            if ( currentTaskTxt ) currentTaskTxt->SetLabel(_("Compilation de "+sourceFiles[currentFileBuilded]->GetFileName()));
            if ( progressGauge ) progressGauge->SetValue(static_cast<float>(currentFileBuilded)/static_cast<float>(sourceFiles.size())*90.0f);
            linkingNeed = true;

            if ( !wxFileExists(sourceFiles[currentFileBuilded]->GetFileName()) ) //Stop building if file does not exists
            {
                currentTaskTxt->SetLabel(_("Compilation arrêté, ")+sourceFiles[currentFileBuilded]->GetFileName()+_(" est introuvable."));
                state = 0;
                return;
            }

            //Build file
            if ( !BuildSourceFile(sourceFiles[currentFileBuilded]->GetFileName()) )
                state = 0; //Abord build if unable to launch it

            return;
        }
        else
            state = 3; //Go linking when each file has been compiled
    }

    //Linking state
    if (state == 3)
    {
        if ( linkingNeed )
        {
            if ( currentTaskTxt ) currentTaskTxt->SetLabel(_("Edition des liens"));
            if ( progressGauge ) progressGauge->SetValue(90);

            std::vector<std::string> sourcesFilesToLink;
            for (unsigned int i = 0;i<sourceFiles.size();++i)
            {
                wxFileName file(sourceFiles[i]->GetFileName());
                sourcesFilesToLink.push_back(string(file.GetPath().mb_str())+"/"+string(file.GetName().mb_str())+".o");
            }

            if ( !LinkSourceFiles(sourcesFilesToLink) )
            {
                state = 0; //Abord build if unable to launch linking
                return;
            }

            state = 4;
            return;
        }
        else state = 4;
    }

    //Go back to idle state when linking is over.
    if (state == 4)
    {
        if ( currentTaskTxt ) currentTaskTxt->SetLabel(_("Compilation terminée avec succès."));
        if ( progressGauge ) progressGauge->SetValue(100);

        lastBuildSuccessed = true;
        state = 0;
    }
}

/**
 * Launch process for building a single file
 */
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

    std::string cmd = string(wxString(pathManager.gccCompilerExecutablePath+" -O2 -Wall -m32 "+definesStr+" "+includesStr+" -c \""+filename+"\" -o \""+file.GetPath()+"/"+file.GetName()+".o\"").mb_str());

    BuildProcess * process = new BuildProcess(this);
    if ( !wxExecute(cmd, wxEXEC_ASYNC, process) )
    {
        delete process;
        return false;
    }

    currentBuildProcess = process;
    return true;
}

/**
 * Launch process for linking files
 */
bool SourceFileBuilder::LinkSourceFiles(std::vector<std::string> files)
{
    std::string libsDirStr = " -L"+pathManager.gdlLibDir+" -L"+pathManager.wxwidgetsLibDir+" -L"+pathManager.sfmlLibDir;
    std::string libsStr = gdlLibs+" "+wxwidgetsLibs+" "+sfmlLibs+" "+osLibs;

    std::string filesStr;
    for (unsigned int i = 0;i<files.size();++i)
        filesStr += " \""+files[i]+"\"";

    std::string cmd = pathManager.gccCompilerExecutablePath+" -shared -Wl,--dll "+libsDirStr +" " + filesStr +" -o test.dxgd -s " + libsStr + " ";

    BuildProcess * process = new BuildProcess(this);
    if ( !wxExecute(cmd, wxEXEC_ASYNC, process) )
    {
        delete process;
        return false;
    }

    currentBuildProcess = process;
    return true;
}

/**
 * Used to get output emitted by compilers.
 */
bool BuildProcess::HasInput()
{
    bool hasInput = false;

    if ( IsInputAvailable() )
    {
        wxTextInputStream tis(*GetInputStream());

        // this assumes that the output is always line buffered
        wxString msg;
        msg << tis.ReadLine();

        output.push_back(string(msg.mb_str()));

        hasInput = true;
    }

    if ( IsErrorAvailable() )
    {
        wxTextInputStream tis(*GetErrorStream());

        // this assumes that the output is always line buffered
        wxString msg;
        msg << tis.ReadLine();

        outputErrors.push_back(string(msg.mb_str()));

        hasInput = true;
    }

    return hasInput;
}

#endif
#endif
