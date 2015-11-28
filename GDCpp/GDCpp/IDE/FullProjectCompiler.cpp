/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
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
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/ProjectFileWriter.h"
#include "GDCpp/IDE/CodeCompiler.h"
#include "GDCpp/IDE/CodeCompilationHelpers.h"
#include "GDCpp/DatFile.h"
#include "GDCpp/Project/Project.h"
#include "GDCpp/Project/Layout.h"
#include "GDCpp/Project/Object.h"
#include "GDCore/Project/SourceFile.h"
#include "GDCpp/SceneNameMangler.h"
#include "GDCpp/Tools/AES.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/ProjectStripper.h"
#include "GDCore/IDE/Project/ResourcesMergingHelper.h"
#include "GDCpp/IDE/ExecutableIconChanger.h"
#include "GDCpp/IDE/BaseProfiler.h"
#include "GDCpp/IDE/DependenciesAnalyzer.h"
#include "GDCore/IDE/wxTools/SafeYield.h"
#include "GDCpp/Extensions/CppPlatform.h"

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
bool CreateWholeProjectRuntimeLinkingTask(gd::Project & game, const gd::String & outputFilename)
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
        std::shared_ptr<gd::PlatformExtension> gdExtension = CppPlatform::Get().GetExtension(game.GetUsedExtensions()[i]);
        std::shared_ptr<ExtensionBase> extension = std::dynamic_pointer_cast<ExtensionBase>(gdExtension);
        if ( extension == std::shared_ptr<ExtensionBase>() ) continue;

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
        std::cout << "Added GD" << gd::String::From(&game.GetLayout(l)) << "RuntimeObjectFile.o (Layout object file) to the linking." << std::endl;
        task.compilerCall.extraObjectFiles.push_back(gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&game.GetLayout(l)))+"RuntimeObjectFile.o");

        DependenciesAnalyzer analyzer(game, game.GetLayout(l));
        if ( !analyzer.Analyze() )
        {
            std::cout << "WARNING: Circular dependency for scene " << game.GetLayout(l).GetName() << std::endl;
            return false;
        }

        for (std::set<gd::String>::const_iterator i = analyzer.GetSourceFilesDependencies().begin();i!=analyzer.GetSourceFilesDependencies().end();++i)
        {
            if (!game.HasSourceFile(*i, "C++")) continue;
            const gd::SourceFile & sourceFile = game.GetSourceFile(*i);

            std::cout << "Added GD" << gd::String::From(&sourceFile) << "RuntimeObjectFile.o (Created from a Source file) to the linking." << std::endl;
            task.compilerCall.extraObjectFiles.push_back(gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&sourceFile)+"RuntimeObjectFile.o"));
        }
    }
    for (unsigned int l= 0;l<game.GetExternalEventsCount();++l)
    {
        gd::ExternalEvents & externalEvents = game.GetExternalEvents(l);

        DependenciesAnalyzer analyzer(game, externalEvents);
        if ( !analyzer.ExternalEventsCanBeCompiledForAScene().empty() )
        {
            std::cout << "Added GD" << gd::String::From(&externalEvents) << "RuntimeObjectFile.o (Created from external events) to the linking." << std::endl;
            task.compilerCall.extraObjectFiles.push_back(gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&externalEvents)+"RuntimeObjectFile.o"));
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
    #elif defined(MACOS)
        windowsTarget = false;
        linuxTarget = true;
        macTarget = false;
    #else
        #warning Unknown OS
    #endif

    gd::String winExecutableName = gameToCompile.winExecutableFilename.empty() ? "GameWin.exe" : gameToCompile.winExecutableFilename+".exe";
    gd::String linuxExecutableName = gameToCompile.linuxExecutableFilename.empty() ? "GameLinux" : gameToCompile.linuxExecutableFilename;
    gd::String macExecutableName = gameToCompile.macExecutableFilename.empty() ? "GameMac" : gameToCompile.macExecutableFilename;

    diagnosticManager.OnMessage(_("Project compilation launching"));
    if ( !windowsTarget && !linuxTarget && !macTarget)
    {
        diagnosticManager.AddError(_("No chosen target system."));
        diagnosticManager.OnCompilationFailed();
        return;
    }

    //Used to handle all files which must be exported
    gd::ResourcesMergingHelper resourcesMergingHelper(NativeFileSystem::Get());
    resourcesMergingHelper.SetBaseDirectory(wxFileName::FileName(gameToCompile.GetProjectFile()).GetPath());

    wxLogNull noLogPlease;
    wxString tempDir = GetTempDir();
    ClearDirectory(tempDir);

    //Wait current compilations to end
    if ( CodeCompiler::Get()->CompilationInProcess() )
    {
        diagnosticManager.OnMessage(_("Compilation waiting for other task to finish..."));

        wxStopWatch yieldClock;
        while (CodeCompiler::Get()->CompilationInProcess())
        {
            if ( yieldClock.Time() > 150 )
            {
                gd::SafeYield::Do(NULL, true);
                yieldClock.Start();
            }
        }
    }

    //Create a separate copy of the game in memory, as we're going to apply it some modifications ( i.e changing resources path )
    gd::Project game = gameToCompile;

    //Prepare resources to copy
    diagnosticManager.OnMessage( _("Preparing resources...") );

    //Add resources
    game.ExposeResources(resourcesMergingHelper);

    //Compile all scene events to object files
    for (unsigned int i = 0;i<game.GetLayoutsCount();++i)
    {
        if ( game.GetLayout(i).GetProfiler() ) game.GetLayout(i).GetProfiler()->profilingActivated = false;

        diagnosticManager.OnMessage(_("Compiling scene ")+game.GetLayout(i).GetName()+_("."));
        CodeCompilerTask task;
        task.compilerCall.compilationForRuntime = true;
        task.compilerCall.optimize = false;
        task.compilerCall.eventsGeneratedCode = true;
        task.compilerCall.inputFile = gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&game.GetLayout(i))+"RuntimeEventsSource.cpp");
        task.compilerCall.outputFile = gd::String(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(&game.GetLayout(i))+"RuntimeObjectFile.o");
        task.userFriendlyName = "Compilation of events of scene "+game.GetLayout(i).GetName();
        task.preWork = std::shared_ptr<CodeCompilerExtraWork>(new EventsCodeCompilerRuntimePreWork(&game, &game.GetLayout(i), resourcesMergingHelper));
        task.scene = &game.GetLayout(i);

        CodeCompiler::Get()->AddTask(task);

        wxStopWatch yieldClock;
        while (CodeCompiler::Get()->CompilationInProcess())
        {
            if ( yieldClock.Time() > 150 )
            {
                gd::SafeYield::Do(NULL, true);
                yieldClock.Start();
            }
        }

        if ( !wxFileExists(task.compilerCall.outputFile) )
        {
            diagnosticManager.AddError(_("Compilation of scene ")+game.GetLayout(i).GetName()+_(" failed: Please go on our website to report this error, joining this file:\n")
                                                    +CodeCompiler::Get()->GetOutputDirectory()+"LatestCompilationOutput.txt"
                                                    +_("\n\nIf you think the error is related to an extension, please contact its developer."));
            diagnosticManager.OnCompilationFailed();
            return;
        }
        else
            diagnosticManager.OnMessage(_("Compiling scene ")+game.GetLayout(i).GetName()+_(" succeeded"));

        diagnosticManager.OnPercentUpdate( static_cast<float>(i) / static_cast<float>(game.GetLayoutsCount())*50.0 );
    }

    //Now copy resources
    diagnosticManager.OnMessage( _("Copying resources...") );
    map<gd::String, gd::String> & resourcesNewFilename = resourcesMergingHelper.GetAllResourcesOldAndNewFilename();
    unsigned int i = 0;
    for(auto it = resourcesNewFilename.begin(); it != resourcesNewFilename.end(); ++it)
    {
        diagnosticManager.OnMessage( _("Copying resources..."), it->first );

        if ( !it->first.empty() && wxCopyFile( it->first, tempDir + "/" + it->second, true ) == false )
            diagnosticManager.AddError(_( "Unable to copy " )+it->first+_(" in compilation directory.\n" ));

        ++i;
        diagnosticManager.OnPercentUpdate( 50.0 + static_cast<float>(i) / static_cast<float>(resourcesNewFilename.size())*25.0 );
        gd::SafeYield::Do();
    }

    gd::SafeYield::Do();
    diagnosticManager.OnMessage(_( "Copying resources..." ), _( "Step 1 out of 3" ));
    gd::Project strippedProject = game;
    gd::ProjectStripper::StripProject(strippedProject);
    gd::ProjectFileWriter::SaveToFile(strippedProject, tempDir + "/GDProjectSrcFile.gdg", true);
    diagnosticManager.OnPercentUpdate(80);

    gd::SafeYield::Do();
    diagnosticManager.OnMessage(_( "Copying resources..." ), _( "Step 2 out of 3" ));

    //Encrypt the source file.
    {
		gd::String ifileName = tempDir + "/GDProjectSrcFile.gdg";
		gd::String ofileName = tempDir + "/src";

        ifstream ifile(ifileName.ToLocale().c_str(), ios_base::binary);
        ofstream ofile(ofileName.ToLocale().c_str(), ios_base::binary);

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

    diagnosticManager.OnMessage(_( "Copying resources..." ), _( "Step 3 out of 3" ));
    gd::SafeYield::Do();

    //List all resources files
    std::vector < gd::String > files;
    {
        wxString file = wxFindFirstFile( tempDir + "/*" );
        while ( !file.empty() )
        {
            wxFileName filename(file);

            files.push_back( filename.GetFullName() );
            file = wxFindNextFile();
        }
    }

    //Create the file containing the resources
    DatFile gameDatFile;
    gameDatFile.Create(files, tempDir, tempDir + "/gam.egd");

    //Remove resources that we just merged
    {
        wxString file = wxFindFirstFile( tempDir + "/*" );
        while ( !file.empty() )
        {
            wxFileName filename(file);
            if ( filename.GetFullName() != "gam.egd" ) //On supprime tout sauf gam.egd
            {
                if ( !wxRemoveFile( file ) )
                    diagnosticManager.AddError(_( "Unable to delete the file" ) + file + _(" in compilation directory.\n" ));
            }

            file = wxFindNextFile();
        }
    }

    //Link all the object files to the final object
    {
        diagnosticManager.OnMessage(_( "Linking project files..." ));
        #if defined(WINDOWS)
        gd::String codeOutputFile = "Code.dll";
        #else
        gd::String codeOutputFile = "Code.so";
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
                gd::SafeYield::Do(NULL, true);
                yieldClock.Start();
            }
        }

        if ( !wxFileExists(codeOutputFile) )
        {
            diagnosticManager.AddError(_("Linking of project failed: Please go on our website to report this error, joining this file:\n")
                                                    +CodeCompiler::Get()->GetOutputDirectory()+"LatestCompilationOutput.txt"
                                                    +_("\n\nIf you think the error is related to an extension, please contact its developer."));
            diagnosticManager.OnCompilationFailed();
            return;
        }
        else
            diagnosticManager.OnMessage(_("Linking project ")+game.GetName()+_(" succeeded"));
    }

    diagnosticManager.OnPercentUpdate(90);
    diagnosticManager.OnMessage(_( "Exporting game..." ));
    gd::SafeYield::Do();

    //Copy extensions
    for (unsigned int i = 0;i<game.GetUsedExtensions().size();++i)
    {
        //Builtin extensions does not have a namespace.
        std::shared_ptr<gd::PlatformExtension> gdExtension = CppPlatform::Get().GetExtension(game.GetUsedExtensions()[i]);
        std::shared_ptr<ExtensionBase> extension = std::dynamic_pointer_cast<ExtensionBase>(gdExtension);

        if ( extension == std::shared_ptr<ExtensionBase>() ) continue;

        if ( ( extension->GetNameSpace() != "" || extension->GetName() == "CommonDialogs" )
            && extension->GetName() != "BuiltinCommonInstructions" ) //Extension with a namespace but builtin
        {
            if ( windowsTarget)
            {
                if ( wxCopyFile( "CppPlatform/Extensions/Runtime/"+game.GetUsedExtensions()[i]+".xgdw", tempDir + "/" + game.GetUsedExtensions()[i]+".xgdw", true ) == false )
                    diagnosticManager.AddError(_( "Unable to copy extension ")+game.GetUsedExtensions()[i]+_(" for Windows in compilation directory.\n" ));
            }

            if ( linuxTarget )
            {
                if ( wxCopyFile( "CppPlatform/Extensions/Runtime/"+game.GetUsedExtensions()[i]+".xgd", tempDir + "/"+game.GetUsedExtensions()[i]+".xgd", true ) == false )
                    diagnosticManager.AddError(_( "Unable to copy extension ")+game.GetUsedExtensions()[i]+_(" for Linux in compilation directory.\n" ));
            }

            if ( macTarget )
            {
                if ( wxCopyFile( "CppPlatform/Extensions/Runtime/"+game.GetUsedExtensions()[i]+".xgd", tempDir + "/"+game.GetUsedExtensions()[i]+".xgd", true ) == false )
                    diagnosticManager.AddError(_( "Unable to copy extension ")+game.GetUsedExtensions()[i]+_(" for Mac OS in compilation directory.\n" ));
            }
        }

        const std::vector < std::pair<gd::String, gd::String> > & supplementaryFiles = extension->GetSupplementaryRuntimeFiles();
        for (unsigned int i = 0;i<supplementaryFiles.size();++i)
        {
            if ( (supplementaryFiles[i].first == "Windows" && windowsTarget) ||
                 (supplementaryFiles[i].first == "Linux" && linuxTarget) ||
                 (supplementaryFiles[i].first == "Mac" && macTarget) )
            {

                if ( wxCopyFile( supplementaryFiles[i].second, tempDir + "/" + wxFileName::FileName(supplementaryFiles[i].second).GetFullName(), true ) == false )
                    diagnosticManager.AddError(_( "Unable to copy ")+supplementaryFiles[i].second+_(" in compilation directory.\n" ));
            }
        }
    }
    if ( game.UseExternalSourceFiles() )
    {
        if ( wxCopyFile( "dynext.dxgd", tempDir + "/" + "dynext.dxgd", true ) == false )
            diagnosticManager.AddError(_( "Unable to copy C++ sources ( dynext.dxgd ) in compilation directory.\n" ));
    }


    //Copy specific files
    if ( windowsTarget )
    {
        if ( wxCopyFile( "CppPlatform/Runtime/PlayWin.exe", tempDir + "/" + winExecutableName, true ) == false )
            diagnosticManager.AddError(_( "Unable to create ")+"l'executable Windows"+_(" in compilation directory.\n" ));

        if ( wxCopyFile( "CppPlatform/Runtime/GDCpp.dll", tempDir + "/GDCpp.dll", true ) == false )
            diagnosticManager.AddError(_( "Unable to create ")+"GDCpp.dll"+_(" in compilation directory.\n" ));

    }
    if ( linuxTarget )
    {
        if ( wxCopyFile( "CppPlatform/Runtime/ExeLinux", tempDir + "/ExeLinux", true ) == false )
            diagnosticManager.AddError(_( "Unable to create ")+"l'executable Linux"+_(" in compilation directory.\n" ));

        if ( wxCopyFile( "CppPlatform/Runtime/PlayLinux", tempDir + "/" + linuxExecutableName, true ) == false )
            diagnosticManager.AddError(_( "Unable to create ")+"le script executable Linux"+_(" in compilation directory.\n" ));

        if ( wxCopyFile( "CppPlatform/Runtime/libGDCpp.so", tempDir + "/libGDCpp.so", true ) == false )
            diagnosticManager.AddError(_( "Unable to create ")+"libGDCpp.so"+_(" in compilation directory.\n" ));
    }
    if ( macTarget )
    {
        if ( wxCopyFile( "CppPlatform/MacRuntime/MacExe", tempDir + "/MacExe", true ) == false )
            diagnosticManager.AddError(_( "Unable to create ")+"l'executable Mac OS"+_(" in compilation directory.\n" ));

        if ( wxCopyFile( "CppPlatform/MacRuntime/libGDCpp.dylib", tempDir + "/libGDCpp.dylib", true ) == false )
            diagnosticManager.AddError(_( "Unable to create ")+"libGDCpp.dylib"+_(" in compilation directory.\n" ));
    }

    //Copy everything into the destination directory
    wxString file = wxFindFirstFile( tempDir + "/*" );
    while ( !file.empty() )
    {
        wxFileName fileName(file);
        if ( !wxCopyFile( file, outDir + "/" + fileName.GetFullName(), true ) )
            diagnosticManager.AddError(_("Unable to copy file") + gd::String(file) + _(" from compilation directory to final directory.\n" ));

        file = wxFindNextFile();
    }

    //Update executable icon
    #if defined(WINDOWS)
    if ( windowsTarget )
        ExecutableIconChanger::ChangeWindowsExecutableIcon(outDir+"/"+winExecutableName, game.winExecutableIconFile);
    #endif

    diagnosticManager.OnMessage(_( "Compilation finished" ));
    diagnosticManager.OnPercentUpdate(100);

    diagnosticManager.OnCompilationSucceeded();
#endif
}


/**
 * Return a temporary directory
 */
gd::String FullProjectCompiler::GetTempDir()
{
#if !defined(GD_NO_WX_GUI)
    gd::String tempDir = forcedTempDir;
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

void FullProjectCompiler::ClearDirectory(gd::String directory)
{
#if !defined(GD_NO_WX_GUI)
    if ( !wxDirExists( directory ) && !wxMkdir( directory ) )
            diagnosticManager.AddError(_( "Unable to create directory:" ) + directory + "\n");

    wxString file = wxFindFirstFile( directory + "/*" );
    while ( !file.empty() )
    {
        if ( !wxRemoveFile( file ) )
            diagnosticManager.AddError(_("Unable to delete ") + gd::String(file) + _("in directory ")+ directory +"\n" );

        file = wxFindNextFile();
    }
#endif
}


void FullProjectCompilerConsoleDiagnosticManager::OnCompilationFailed()
{
    cout << _("Compilation failed with these errors:") << endl;
    cout << GetErrors();
}

void FullProjectCompilerConsoleDiagnosticManager::OnCompilationSucceeded()
{
    cout << _("Compilation succeeded.") << endl;
}

void FullProjectCompilerConsoleDiagnosticManager::OnMessage(gd::String message, gd::String message2)
{
    if ( message2.empty() )
        cout << message << endl;
    else
        cout << message << ": " << message2 << endl;
}

void FullProjectCompilerConsoleDiagnosticManager::OnPercentUpdate(float percents)
{
    cout << _("Progress:") << gd::String::From(percents) << endl;
}


}
#endif
