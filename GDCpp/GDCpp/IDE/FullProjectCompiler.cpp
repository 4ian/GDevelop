/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include "FullProjectCompiler.h"
#include <fstream>
#include <iostream>
#include <wx/filefn.h>
#include "GDCore/Tools/Log.h"
#include <wx/msgdlg.h>
#include <wx/stopwatch.h>
#include <wx/dir.h>
#include <wx/help.h>
#include <wx/config.h>
#include <wx/dirdlg.h>
#include <wx/filedlg.h>
#include <wx/msgdlg.h>
#include <cstdio>
#include <wx/filename.h>
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCpp/IDE/CodeCompiler.h"
#include "GDCpp/Events/CodeCompilationHelpers.h"
#include "GDCpp/DatFile.h"
#include "GDCpp/Project.h"
#include "GDCpp/Scene.h"
#include "GDCpp/Object.h"
#include "GDCore/PlatformDefinition/SourceFile.h"
#include "GDCpp/SceneNameMangler.h"
#include "GDCpp/Tools/AES.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/ExtensionBase.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/CommonTools.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/IDE/ProjectStripper.h"
#include "GDCore/IDE/ResourcesMergingHelper.h"
#include "GDCpp/IDE/ExecutableIconChanger.h"
#include "GDCpp/IDE/BaseProfiler.h"
#include "GDCpp/IDE/DependenciesAnalyzer.h"
#include "GDCpp/CppPlatform.h"

using namespace std;
using namespace gd;

namespace GDpriv
{


/**
 * Automatically create and submit a task to the code compiler for linking the whole code of a game.
 *
 * \param game Game associated with the scene
 * \param scene Scene with events to compile
 */
bool CreateWholeProjectRuntimeLinkingTask(gd::Project & game, const std::string & outputFilename)
{
    std::cout << "Preparing linking task for project " << game.GetName() << "..." << std::endl;
    CodeCompilerTask task;
    task.compilerCall.link = true;
    task.compilerCall.compilationForRuntime = true;
    task.compilerCall.optimize = false;
    task.compilerCall.outputFile = outputFilename;
    task.userFriendlyName = "Linking code for project "+game.GetName();

    //Construct the list of the external shared libraries files to be used
    for (unsigned int i = 0;i<game.GetUsedExtensions().size();++i)
    {
        boost::shared_ptr<gd::PlatformExtension> gdExtension = CppPlatform::Get().GetExtension(game.GetUsedExtensions()[i]);
        boost::shared_ptr<ExtensionBase> extension = boost::dynamic_pointer_cast<ExtensionBase>(gdExtension);
        if ( extension == boost::shared_ptr<ExtensionBase>() ) continue;

        if ( wxFileExists(CodeCompiler::Get()->GetBaseDirectory()+"CppPlatform/Extensions/Runtime/"+"lib"+extension->GetName()+".a") ||
             wxFileExists(CodeCompiler::Get()->GetBaseDirectory()+"CppPlatform/Extensions/Runtime/"+"lib"+extension->GetName()+".dll.a"))
            task.compilerCall.extraLibFiles.push_back(extension->GetName());

        for (unsigned int j =0;j<extension->GetSupplementaryLibFiles().size();++j)
        {
            if ( wxFileExists(CodeCompiler::Get()->GetBaseDirectory()+"CppPlatform/Extensions/Runtime/"+"lib"+extension->GetSupplementaryLibFiles()[j]+".a") ||
                 wxFileExists(CodeCompiler::Get()->GetBaseDirectory()+"CppPlatform/Extensions/Runtime/"+"lib"+extension->GetSupplementaryLibFiles()[j]+".dll.a") )
                task.compilerCall.extraLibFiles.push_back(extension->GetSupplementaryLibFiles()[j]);
        }
    }

    //Add all the object files of the game
    for (unsigned int l= 0;l<game.GetLayoutsCount();++l)
    {
        std::cout << "Added GD" << gd::ToString(&game.GetLayout(l)) << "RuntimeObjectFile.o (Layout object file) to the linking." << std::endl;
        task.compilerCall.extraObjectFiles.push_back(string(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::ToString(&game.GetLayout(l))+"RuntimeObjectFile.o"));

        DependenciesAnalyzer analyzer(game, game.GetLayout(l));
        if ( !analyzer.Analyze() )
        {
            std::cout << "WARNING: Circular dependency for scene " << game.GetLayout(l).GetName() << std::endl;
            return false;
        }

        for (std::set<std::string>::const_iterator i = analyzer.GetSourceFilesDependencies().begin();i!=analyzer.GetSourceFilesDependencies().end();++i)
        {
            if (!game.HasSourceFile(*i, "C++")) continue;
            const gd::SourceFile & sourceFile = game.GetSourceFile(*i);

            std::cout << "Added GD" << gd::ToString(&sourceFile) << "RuntimeObjectFile.o (Created from a Source file) to the linking." << std::endl;
            task.compilerCall.extraObjectFiles.push_back(string(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::ToString(&sourceFile)+"RuntimeObjectFile.o"));
        }
    }
    for (unsigned int l= 0;l<game.GetExternalEventsCount();++l)
    {
        gd::ExternalEvents & externalEvents = game.GetExternalEvents(l);

        DependenciesAnalyzer analyzer(game, externalEvents);
        if ( !analyzer.ExternalEventsCanBeCompiledForAScene().empty() )
        {
            std::cout << "Added GD" << gd::ToString(&externalEvents) << "RuntimeObjectFile.o (Created from external events) to the linking." << std::endl;
            task.compilerCall.extraObjectFiles.push_back(string(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::ToString(&externalEvents)+"RuntimeObjectFile.o"));
        }
    }

    CodeCompiler::Get()->AddTask(task);
    return true;
}

void FullProjectCompiler::LaunchProjectCompilation()
{
#if defined(GD_NO_WX_GUI)
    gd::LogError("BAD USE: FullProjectCompiler::LaunchProjectCompilation called but compilation is not supported when wxWidgets support is disabled");
#else

    #if defined(WINDOWS)
        windowsTarget = true;
        linuxTarget = false;
        macTarget = false;
    #elif defined(LINUX)
        windowsTarget = false;
        linuxTarget = true;
        macTarget = false;
        compressIfPossible = false;
    #elif defined(MAC)
        windowsTarget = false;
        linuxTarget = true;
        macTarget = false;
        compressIfPossible = false;
    #else
        #warning Unknown OS
    #endif

    std::string winExecutableName = gameToCompile.winExecutableFilename.empty() ? "GameWin.exe" : gameToCompile.winExecutableFilename+".exe";
    std::string linuxExecutableName = gameToCompile.linuxExecutableFilename.empty() ? "GameLinux" : gameToCompile.linuxExecutableFilename;
    std::string macExecutableName = gameToCompile.macExecutableFilename.empty() ? "GameMac" : gameToCompile.macExecutableFilename;

    diagnosticManager.OnMessage(gd::ToString(_("Project compilation launching")));
    if ( !windowsTarget && !linuxTarget && !macTarget)
    {
        diagnosticManager.AddError(gd::ToString(_("No chosen target system.")));
        diagnosticManager.OnCompilationFailed();
        return;
    }

    //Used to handle all files which must be exported
    gd::ResourcesMergingHelper resourcesMergingHelper(NativeFileSystem::Get());
    resourcesMergingHelper.SetBaseDirectory(gd::ToString(wxFileName::FileName(gameToCompile.GetProjectFile()).GetPath()));

    wxLogNull noLogPlease;
    wxString tempDir = GetTempDir();
    ClearDirectory(gd::ToString(tempDir)); //Préparation du répertoire

    //Wait current compilations to end
    if ( CodeCompiler::Get()->CompilationInProcess() )
    {
        diagnosticManager.OnMessage(gd::ToString(_("Compilation waiting for other task to finish...")));

        wxStopWatch yieldClock;
        while (CodeCompiler::Get()->CompilationInProcess())
        {
            if ( yieldClock.Time() > 150 )
            {
                wxSafeYield(NULL, true);
                yieldClock.Start();
            }
        }
    }

    //Create a separate copy of the game in memory, as we're going to apply it some modifications ( i.e changing resources path )
    gd::Project game = gameToCompile;

    //Prepare resources to copy
    diagnosticManager.OnMessage( gd::ToString( _("Preparing resources...") ));

    //Add images
    std::vector<std::string> allResources = game.GetResourcesManager().GetAllResourcesList();
    for ( unsigned int i = 0;i < allResources.size() ;i++ )
    {
        diagnosticManager.OnMessage( gd::ToString(_("Preparing resources...")), allResources[i] );

        if ( game.GetResourcesManager().GetResource(allResources[i]).UseFile() )
            resourcesMergingHelper.ExposeResource(game.GetResourcesManager().GetResource(allResources[i]));
    }

    //Add scenes resources
    for ( unsigned int i = 0;i < game.GetLayoutsCount();i++ )
    {
        for (unsigned int j = 0;j<game.GetLayout(i).GetObjects().size();++j) //Add objects resources
        	game.GetLayout(i).GetObjects()[j]->ExposeResources(resourcesMergingHelper);

        LaunchResourceWorkerOnEvents(game, game.GetLayout(i).GetEvents(), resourcesMergingHelper);
    }
    //Add external events resources
    for ( unsigned int i = 0;i < game.GetExternalEventsCount();i++ )
    {
        LaunchResourceWorkerOnEvents(game, game.GetExternalEvents(i).GetEvents(), resourcesMergingHelper);
    }
    //Add global objects resources
    for (unsigned int j = 0;j<game.GetObjects().size();++j) //Add global objects resources
        game.GetObjects()[j]->ExposeResources(resourcesMergingHelper);

    //Compile all scene events to object files
    for (unsigned int i = 0;i<game.GetLayoutsCount();++i)
    {
        if ( game.GetLayout(i).GetProfiler() ) game.GetLayout(i).GetProfiler()->profilingActivated = false;

        diagnosticManager.OnMessage(gd::ToString(_("Compiling scene ")+game.GetLayout(i).GetName()+_(".")));
        CodeCompilerTask task;
        task.compilerCall.compilationForRuntime = true;
        task.compilerCall.optimize = optimize;
        task.compilerCall.eventsGeneratedCode = true;
        task.compilerCall.inputFile = string(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::ToString(&game.GetLayout(i))+"RuntimeEventsSource.cpp");
        task.compilerCall.outputFile = string(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::ToString(&game.GetLayout(i))+"RuntimeObjectFile.o");
        task.userFriendlyName = "Compilation of events of scene "+game.GetLayout(i).GetName();
        task.preWork = boost::shared_ptr<CodeCompilerExtraWork>(new EventsCodeCompilerRuntimePreWork(&game, &game.GetLayout(i), resourcesMergingHelper));
        task.scene = &game.GetLayout(i);

        CodeCompiler::Get()->AddTask(task);

        wxStopWatch yieldClock;
        while (CodeCompiler::Get()->CompilationInProcess())
        {
            if ( yieldClock.Time() > 150 )
            {
                wxSafeYield(NULL, true);
                yieldClock.Start();
            }
        }

        if ( !wxFileExists(task.compilerCall.outputFile) )
        {
            diagnosticManager.AddError(gd::ToString(_("Compilation of scene ")+game.GetLayout(i).GetName()+_(" failed: Please go on our website to report this error, joining this file:\n")
                                                    +CodeCompiler::Get()->GetOutputDirectory()+"LatestCompilationOutput.txt"
                                                    +_("\n\nIf you think the error is related to an extension, please contact its developer.")));
            diagnosticManager.OnCompilationFailed();
            return;
        }
        else
            diagnosticManager.OnMessage(gd::ToString(_("Compiling scene ")+game.GetLayout(i).GetName()+_(" succeeded")));

        diagnosticManager.OnPercentUpdate( static_cast<float>(i) / static_cast<float>(game.GetLayoutsCount())*50.0 );
    }

    //Now copy resources
    diagnosticManager.OnMessage( gd::ToString( _("Copying resources...") ) );
    map<string, string> & resourcesNewFilename = resourcesMergingHelper.GetAllResourcesOldAndNewFilename();
    unsigned int i = 0;
    for(map<string, string>::const_iterator it = resourcesNewFilename.begin(); it != resourcesNewFilename.end(); ++it)
    {
        diagnosticManager.OnMessage( gd::ToString( _("Copying resources...")), it->first );

        if ( !it->first.empty() && wxCopyFile( it->first, tempDir + "/" + it->second, true ) == false )
            diagnosticManager.AddError(gd::ToString(_( "Unable to copy " )+it->first+_(" in compilation directory.\n" )));

        ++i;
        diagnosticManager.OnPercentUpdate( 50.0 + static_cast<float>(i) / static_cast<float>(resourcesNewFilename.size())*25.0 );
        wxSafeYield();
    }

    wxSafeYield();
    diagnosticManager.OnMessage(gd::ToString(_( "Copying resources..." )), gd::ToString(_( "Step 1 out of 3" )));
    gd::Project strippedProject = game;
    gd::ProjectStripper::StripProject(strippedProject);
    strippedProject.SaveToFile(static_cast<string>( tempDir + "/GDProjectSrcFile.gdg" ));
    diagnosticManager.OnPercentUpdate(80);

    wxSafeYield();
    diagnosticManager.OnMessage(gd::ToString(_( "Copying resources..." )), gd::ToString(_( "Step 2 out of 3" )));

    //Encrypt the source file.
    {
        ifstream ifile(tempDir+"/GDProjectSrcFile.gdg",ios_base::binary);
        ofstream ofile(tempDir+"/src",ios_base::binary);

        // get file size
        ifile.seekg(0,ios_base::end);
        int size,fsize = ifile.tellg();
        ifile.seekg(0,ios_base::beg);

        // round up (ignore pad for here)
        size = (fsize+15)&(~15);

        char * ibuffer = new char[size];
        char * obuffer = new char[size];
        ifile.read(ibuffer,fsize);


        unsigned char key[] = "-P:j$4t&OHIUVM/Z+u4DeDP.";
        const unsigned char iv[16] = { 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F };

        aes_ks_t keySetting;
        aes_setks_encrypt(key, 192, &keySetting);
        aes_cbc_encrypt(reinterpret_cast<const unsigned char*>(ibuffer), reinterpret_cast<unsigned char*>(obuffer),
            (uint8_t*)iv, size/AES_BLOCK_SIZE, &keySetting);

        ofile.write(obuffer,size);

        ofile.close();
        ifile.close();

        delete [] ibuffer;
        delete [] obuffer;
	}
    wxRemoveFile( tempDir + "/compil.gdg" );
    diagnosticManager.OnPercentUpdate(85);

    //Création du fichier gam.egd
    diagnosticManager.OnMessage(gd::ToString(_( "Copying resources..." )), gd::ToString(_( "Step 3 out of 3" )));
    wxSafeYield();

    //On créé une liste avec tous les fichiers
    vector < string > files;
    {
        wxString file = wxFindFirstFile( tempDir + "/*" );
        while ( !file.empty() )
        {
            wxFileName filename(file);

            files.push_back( static_cast<string>(filename.GetFullName()) );
            file = wxFindNextFile();
        }
    }

    //On créé le fichier à partir des fichiers
    DatFile gameDatFile;
    gameDatFile.Create(files, static_cast<string>(tempDir), static_cast<string>(tempDir + "/gam.egd"));

    //On supprime maintenant tout le superflu
    {
        wxString file = wxFindFirstFile( tempDir + "/*" );
        while ( !file.empty() )
        {
            wxFileName filename(file);
            if ( filename.GetFullName() != "gam.egd" ) //On supprime tout sauf gam.egd
            {
                if ( !wxRemoveFile( file ) )
                    diagnosticManager.AddError(gd::ToString( _( "Unable to delete the file" ) + file + _(" in compilation directory.\n" )));
            }

            file = wxFindNextFile();
        }
    }

    //Link all the object files to the final object
    {
        diagnosticManager.OnMessage(gd::ToString(_( "Linking project files..." )));
        #if defined(WINDOWS)
        std::string codeOutputFile = "Code.dll";
        #else
        std::string codeOutputFile = "Code.so";
        #endif
        codeOutputFile = tempDir+"/"+codeOutputFile;

        if ( !CreateWholeProjectRuntimeLinkingTask(game, codeOutputFile) )
        {
            std::cout << "Linking cannot be done (Probably circular dependency?)." << std::endl;
            return;
        }

        wxStopWatch yieldClock;
        while (CodeCompiler::Get()->CompilationInProcess())
        {
            if ( yieldClock.Time() > 150 )
            {
                wxSafeYield(NULL, true);
                yieldClock.Start();
            }
        }

        if ( !wxFileExists(codeOutputFile) )
        {
            diagnosticManager.AddError(gd::ToString(_("Linking of project failed: Please go on our website to report this error, joining this file:\n")
                                                    +CodeCompiler::Get()->GetOutputDirectory()+"LatestCompilationOutput.txt"
                                                    +_("\n\nIf you think the error is related to an extension, please contact its developer.")));
            diagnosticManager.OnCompilationFailed();
            return;
        }
        else
            diagnosticManager.OnMessage(gd::ToString(_("Linking project ")+game.GetName()+_(" succeeded")));
    }

    diagnosticManager.OnPercentUpdate(90);
    diagnosticManager.OnMessage(gd::ToString(_( "Exporting game..." )));
    wxSafeYield();

    //Copy extensions
    for (unsigned int i = 0;i<game.GetUsedExtensions().size();++i)
    {
        //Builtin extensions does not have a namespace.
        boost::shared_ptr<gd::PlatformExtension> gdExtension = CppPlatform::Get().GetExtension(game.GetUsedExtensions()[i]);
        boost::shared_ptr<ExtensionBase> extension = boost::dynamic_pointer_cast<ExtensionBase>(gdExtension);

        if ( extension == boost::shared_ptr<ExtensionBase>() ) continue;

        if ( ( extension->GetNameSpace() != "" || extension->GetName() == "CommonDialogs" )
            && extension->GetName() != "BuiltinCommonInstructions" ) //Extension with a namespace but builtin
        {
            if ( windowsTarget)
            {
                if ( wxCopyFile( "CppPlatform/Extensions/Runtime/"+game.GetUsedExtensions()[i]+".xgdw", tempDir + "/" + game.GetUsedExtensions()[i]+".xgdw", true ) == false )
                    diagnosticManager.AddError(gd::ToString(_( "Unable to copy extension ")+game.GetUsedExtensions()[i]+_(" for Windows in compilation directory.\n" )));
            }

            if ( linuxTarget )
            {
                if ( wxCopyFile( "CppPlatform/Extensions/Runtime/"+game.GetUsedExtensions()[i]+".xgdl", tempDir + "/"+game.GetUsedExtensions()[i]+".xgdl", true ) == false )
                    diagnosticManager.AddError(gd::ToString(_( "Unable to copy extension ")+game.GetUsedExtensions()[i]+_(" for Linux in compilation directory.\n" )));
            }

            if ( macTarget )
            {
                if ( wxCopyFile( "CppPlatform/Extensions/Runtime/"+game.GetUsedExtensions()[i]+".xgdm", tempDir + "/"+game.GetUsedExtensions()[i]+".xgdm", true ) == false )
                    diagnosticManager.AddError(gd::ToString(_( "Unable to copy extension ")+game.GetUsedExtensions()[i]+_(" for Mac OS in compilation directory.\n" )));
            }
        }

        const std::vector < std::pair<std::string, std::string> > & supplementaryFiles = extension->GetSupplementaryRuntimeFiles();
        for (unsigned int i = 0;i<supplementaryFiles.size();++i)
        {
            if ( (supplementaryFiles[i].first == "Windows" && windowsTarget) ||
                 (supplementaryFiles[i].first == "Linux" && linuxTarget) ||
                 (supplementaryFiles[i].first == "Mac" && macTarget) )
            {

                if ( wxCopyFile( supplementaryFiles[i].second, tempDir + "/" + wxFileName::FileName(supplementaryFiles[i].second).GetFullName(), true ) == false )
                    diagnosticManager.AddError(gd::ToString(_( "Unable to copy ")+supplementaryFiles[i].second+_(" in compilation directory.\n" )));
            }
        }
    }
    if ( game.UseExternalSourceFiles() )
    {
        if ( wxCopyFile( "dynext.dxgd", tempDir + "/" + "dynext.dxgd", true ) == false )
            diagnosticManager.AddError(gd::ToString(_( "Unable to copy C++ sources ( dynext.dxgd ) in compilation directory.\n" )));
    }

    //Copie des derniers fichiers
    if ( !compressIfPossible )
    {
        //Fichier pour windows
        if ( windowsTarget )
        {
            if ( wxCopyFile( "CppPlatform/Runtime/PlayWin.exe", tempDir + "/" + winExecutableName, true ) == false )
                diagnosticManager.AddError(gd::ToString(_( "Unable to create ")+"l'executable Windows"+_(" in compilation directory.\n" )));

            if ( wxCopyFile( "CppPlatform/Runtime/GDCpp.dll", tempDir + "/GDCpp.dll", true ) == false )
                diagnosticManager.AddError(gd::ToString(_( "Unable to create ")+"GDCpp.dll"+_(" in compilation directory.\n" )));

        }
        //Fichiers pour linux
        if ( linuxTarget )
        {
            if ( wxCopyFile( "CppPlatform/Runtime/ExeLinux", tempDir + "/ExeLinux", true ) == false )
                diagnosticManager.AddError(gd::ToString(_( "Unable to create ")+"l'executable Linux"+_(" in compilation directory.\n" )));

            if ( wxCopyFile( "CppPlatform/Runtime/PlayLinux", tempDir + "/" + linuxExecutableName, true ) == false )
                diagnosticManager.AddError(gd::ToString(_( "Unable to create ")+"le script executable Linux"+_(" in compilation directory.\n" )));

            if ( wxCopyFile( "CppPlatform/Runtime/libGDCpp.so", tempDir + "/libGDCpp.so", true ) == false )
                diagnosticManager.AddError(gd::ToString(_( "Unable to create ")+"libGDCpp.so"+_(" in compilation directory.\n" )));
        }
        if ( macTarget )
        {
            if ( wxCopyFile( "CppPlatform/MacRuntime/MacExe", tempDir + "/MacExe", true ) == false )
                diagnosticManager.AddError(gd::ToString(_( "Unable to create ")+"l'executable Mac OS"+_(" in compilation directory.\n" )));

            if ( wxCopyFile( "CppPlatform/MacRuntime/libGDCpp.dylib", tempDir + "/libGDCpp.dylib", true ) == false )
                diagnosticManager.AddError(gd::ToString(_( "Unable to create ")+"libGDCpp.dylib"+_(" in compilation directory.\n" )));
        }

        //Copie du tout dans le répertoire final
        wxString file = wxFindFirstFile( tempDir + "/*" );
        while ( !file.empty() )
        {
            wxFileName fileName(file);
            if ( !wxCopyFile( file, outDir + "/" + fileName.GetFullName(), true ) )
                diagnosticManager.AddError(gd::ToString(_( "Unable to copy file") + file + _(" from compilation directory to final directory.\n" )));

            file = wxFindNextFile();
        }
    }
    else
    {
        if ( windowsTarget )
        {
            if ( wxCopyFile( "CppPlatform/Runtime/PlayWin.exe", tempDir + "/internalstart.exe", true ) == false )
                diagnosticManager.AddError(gd::ToString(_( "Unable to create ")+"l'executable Windows"+_(" in compilation directory.\n" )));

            if ( wxCopyFile( "CppPlatform/Runtime/GDCpp.dll", tempDir + "/GDCpp.dll", true ) == false )
                diagnosticManager.AddError(gd::ToString(_( "Unable to create ")+"GDCpp.dll"+_(" in compilation directory.\n" )));

            //Use 7zip to create a single archive
            diagnosticManager.OnMessage( gd::ToString( _("Exporting game... ( Compressing )") ) );
            wxArrayString arrStdOut, arrStdErr;
            wxExecute( _T( "7za.exe a  \""+ tempDir +"/archive.7z\" \"" + tempDir + "/*\"" ), arrStdOut, arrStdErr, wxEXEC_SYNC  );

            //Make the archive autoextractible
            std::ofstream outFile;
            outFile.open (std::string(outDir+"/"+winExecutableName).c_str(), std::ofstream::out | std::ofstream::binary);
            {
                std::ifstream file;
                char buffer[1];

                file.open ("7zS.sfx", std::ifstream::in | std::ifstream::binary);
                if (file.is_open())
                {
                    file.seekg (0, std::ios::beg);
                    while (file.read (buffer, 1))
                        outFile.write (buffer, 1);

                    file.close();
                }
                else
                    diagnosticManager.AddError( gd::ToString(_("Unable to open 7zS.sfx")) );
            }
            {
                std::ifstream file;
                char buffer[1];

                file.open ("config.txt", std::ifstream::in | std::ifstream::binary);
                if (file.is_open())
                {
                    file.seekg (0, std::ios::beg);
                    while (file.read (buffer, 1))
                        outFile.write (buffer, 1);

                    file.close();
                }
                else
                    diagnosticManager.AddError( gd::ToString(_("Unable to open config.txt")) );
            }
            {
                std::ifstream file;
                char buffer[1];

                file.open (std::string(tempDir +"/archive.7z").c_str(), std::ifstream::in | std::ifstream::binary);
                if (file.is_open())
                {
                    file.seekg (0, std::ios::beg);
                    while (file.read (buffer, 1))
                        outFile.write (buffer, 1);

                    file.close();
                }
                else
                    diagnosticManager.AddError( gd::ToString(_("Unable to open "))+std::string(tempDir +"/archive.7z") );
            }

            outFile.close();
        }
    }

    //Prepare executables
    #if defined(WINDOWS)
    if ( windowsTarget )
        ExecutableIconChanger::ChangeWindowsExecutableIcon(string(outDir+"/"+winExecutableName), game.winExecutableIconFile);
    #endif

    diagnosticManager.OnMessage(gd::ToString(_( "Compilation finished" )));
    diagnosticManager.OnPercentUpdate(100);

    diagnosticManager.OnCompilationSuccessed();
#endif
}


/**
 * Return a temporary directory
 */
std::string FullProjectCompiler::GetTempDir()
{
#if !defined(GD_NO_WX_GUI)
    std::string tempDir = forcedTempDir;
    if ( tempDir.empty() ) //If the user has not forced a directory
    {
        tempDir = wxFileName::GetTempDir();
        if ( !wxFileName::IsDirWritable(tempDir) )
            tempDir = wxGetCwd();

        if ( !wxFileName::IsDirWritable(tempDir) )
            tempDir = wxFileName::GetHomeDir();

        if ( !wxFileName::IsDirWritable(tempDir) )
            wxMessageBox(_("GDevelop is unable to find a temporary compilation directory.\nIf compilation fail, go in the options and choose a temporary direction where you have read and write permissions."), _("Compilation may fail!"), wxICON_EXCLAMATION);
    }

    return tempDir + "/GDDeploymentTemporaries";
#endif
}

void FullProjectCompiler::ClearDirectory(std::string directory)
{
#if !defined(GD_NO_WX_GUI)
    if ( !wxDirExists( directory ) && !wxMkdir( directory ) )
            diagnosticManager.AddError(gd::ToString(_( "Unable to create directory:" ) + directory + "\n"));

    wxString file = wxFindFirstFile( directory + "/*" );
    while ( !file.empty() )
    {
        if ( !wxRemoveFile( file ) )
            diagnosticManager.AddError(gd::ToString(_("Unable to delete ") + file + _("in directory ")+directory+"\n" ));

        file = wxFindNextFile();
    }
#endif
}


void FullProjectCompilerConsoleDiagnosticManager::OnCompilationFailed()
{
    cout << _("Compilation failed with these errors:") << endl;
    cout << GetErrors();
}

void FullProjectCompilerConsoleDiagnosticManager::OnCompilationSuccessed()
{
    cout << _("Compilation successed.") << endl;
}

void FullProjectCompilerConsoleDiagnosticManager::OnMessage(std::string message, std::string message2)
{
    if ( message2.empty() )
        cout << message << endl;
    else
        cout << message << ": " << message2 << endl;
}

void FullProjectCompilerConsoleDiagnosticManager::OnPercentUpdate(float percents)
{
    cout << _("Progress:") << gd::ToString(percents) << endl;
}


}
#endif
