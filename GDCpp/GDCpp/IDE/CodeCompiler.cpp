/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include "CodeCompiler.h"
#include <SFML/System.hpp>
#include <iostream>
#include <fstream>
#include <string>
#include <wx/filename.h>
#include <wx/filefn.h>
#include <wx/txtstrm.h>
#include "GDCpp/CommonTools.h"
#include "GDCpp/Scene.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"

using namespace std;

CodeCompiler *CodeCompiler::_singleton = NULL;
sf::Mutex CodeCompiler::openSaveDialogMutex;
const wxEventType CodeCompiler::refreshEventType = wxNewEventType();
const wxEventType CodeCompiler::processEndedEventType = wxNewEventType();

namespace {

/**
 * \brief Tool function to create a task which is empty.
 */
CodeCompilerTask ConstructEmptyTask()
{
    CodeCompilerTask task;
    task.emptyTask = true;
    return task;
}

}

gd::String CodeCompilerCall::GetFullCall() const
{
    #if defined(WINDOWS)
    gd::String compilerExecutable = "\""+CodeCompiler::Get()->GetBaseDirectory()+"CppPlatform/MinGW32/bin/g++.exe\"";
    #else
    gd::String compilerExecutable = "g++";
    #endif

    gd::String baseDir = CodeCompiler::Get()->GetBaseDirectory();

    std::vector<gd::String> args;
	args.push_back("-std=gnu++11");
    #if defined(WINDOWS)
    args.push_back("-m32");
    args.push_back("-nostdinc");
    args.push_back("-nostdinc++");
    args.push_back("-B\""+CodeCompiler::Get()->GetBaseDirectory()+"CppPlatform/MinGW32/bin\"");
    #else
        args.push_back("-fPIC"); //Necessary, on 64 bits platforms to avoid "relocation R_X86_64_32 against `.rodata' can not be used when making a shared object" error.
        //Rely on the default includes directories of the compiler
    #endif
    for (std::size_t i = 0;i<extraOptions.size();++i)
        args.push_back(extraOptions[i]);

    args.push_back("-o \""+outputFile+"\"");
    if ( optimize ) args.push_back("-O1");

    if ( !link ) //Generate argument for compiling a file
    {
        if ( !compilationForRuntime ) args.push_back("-include \""+baseDir+"CppPlatform/include/GDCpp/GDCpp/EventsPrecompiledHeader.h\"");
        args.push_back("-c \""+inputFile+"\"");

        //Compiler default directories
        std::vector<gd::String> standardsIncludeDirs;
        #if defined(WINDOWS)
        gd::String gccVersion = gd::String::From(__GNUC__) + "." + gd::String::From(__GNUC_MINOR__) + "." + gd::String::From(__GNUC_PATCHLEVEL__);
        standardsIncludeDirs.push_back("CppPlatform/MinGW32/include");
        standardsIncludeDirs.push_back("CppPlatform/MinGW32/lib/gcc/mingw32/" + gccVersion + "/include");
        standardsIncludeDirs.push_back("CppPlatform/MinGW32/lib/gcc/mingw32/" + gccVersion + "/include/c++");
        standardsIncludeDirs.push_back("CppPlatform/MinGW32/lib/gcc/mingw32/" + gccVersion + "/include/c++/mingw32");
        #elif defined(LINUX)
        standardsIncludeDirs.push_back("CppPlatform/include/linux/usr/include/i686-linux-gnu/");
        standardsIncludeDirs.push_back("CppPlatform/include/linux/usr/lib/gcc/i686-linux-gnu/4.7/include");
        standardsIncludeDirs.push_back("CppPlatform/include/linux/usr/include");
        standardsIncludeDirs.push_back("CppPlatform/include/linux/usr/include/c++/4.7/");
        standardsIncludeDirs.push_back("CppPlatform/include/linux/usr/include/c++/4.7/i686-linux-gnu");
        standardsIncludeDirs.push_back("CppPlatform/include/linux/usr/include/c++/4.7/backward");
        #elif defined(MACOS)
        #endif

        standardsIncludeDirs.push_back("CppPlatform/include/GDCpp");
        standardsIncludeDirs.push_back("CppPlatform/include/Core");
        standardsIncludeDirs.push_back("CppPlatform/include/SFML/include");
        standardsIncludeDirs.push_back("CppPlatform/include/wxwidgets/include");
        standardsIncludeDirs.push_back("CppPlatform/include/wxwidgets/lib/gcc_dll/msw");
        standardsIncludeDirs.push_back("CppPlatform/Extensions/include");

        for (std::size_t i =0;i<standardsIncludeDirs.size();++i)
            args.push_back("-I\""+baseDir+standardsIncludeDirs[i]+"\"");

        //CodeCompiler extra headers directories
        const std::set<gd::String> & codeCompilerHeaders = CodeCompiler::Get()->GetAllHeadersDirectories();
        for (std::set<gd::String>::const_iterator header = codeCompilerHeaders.begin();header != codeCompilerHeaders.end();++header)
            args.push_back("-I\""+*header+"\"");

        //Additional headers for the task
        for (std::size_t i = 0;i<extraHeaderDirectories.size();++i)
            args.push_back("-I\""+extraHeaderDirectories[i]+"\"");

        if ( !compilationForRuntime ) args.push_back("-DGD_IDE_ONLY");

        //GD library related defines.
        #if defined(WINDOWS)
        args.push_back("-DGD_CORE_API=__declspec(dllimport)");
        args.push_back("-DGD_API=__declspec(dllimport)");
        args.push_back("-DGD_EXTENSION_API=__declspec(dllimport)");
        #elif defined(LINUX)
        args.push_back("-DGD_CORE_API= ");
        args.push_back("-DGD_API= ");
        args.push_back("-DGD_EXTENSION_API= ");
        #elif defined(MACOS)
        args.push_back("-DGD_CORE_API= ");
        args.push_back("-DGD_API= ");
        args.push_back("-DGD_EXTENSION_API= ");
        #endif

        //Other common defines.
        #if defined(RELEASE)
        args.push_back("-DRELEASE");
        args.push_back("-DNDEBUG");
        args.push_back("-DBOOST_DISABLE_ASSERTS");
        #elif defined(DEV)
        args.push_back("-DDEV");
        args.push_back("-DNDEBUG");
        args.push_back("-DBOOST_DISABLE_ASSERTS");
        #elif defined(DEBUG)
        args.push_back("-DDEBUG");
        #endif
    }
    else //Generate argument for linking files
    {
        args.push_back("-shared");
        if ( !inputFile.empty() ) args.push_back("\""+inputFile+"\"");
        for (std::size_t i = 0;i<extraObjectFiles.size();++i)
        {
            if (!extraObjectFiles[i].empty()) args.push_back("\""+extraObjectFiles[i]+"\"");
        }

        //Libraries and libraries directories
        #if defined(WINDOWS)
        args.push_back("-L\""+baseDir+"CppPlatform/MinGW32/lib/\"");
        #endif
        if ( !compilationForRuntime )
        {
            args.push_back("-L\""+baseDir+"\"");
            args.push_back("-L\""+baseDir+"CppPlatform/Extensions/\"");
            args.push_back("-lGDCpp");
        }
        else
        {
            args.push_back("-L\""+baseDir+"\"");
            args.push_back("-L\""+baseDir+"CppPlatform/Runtime/\"");
            args.push_back("-L\""+baseDir+"CppPlatform/Extensions/Runtime/\"");
            #if defined(WINDOWS)
            args.push_back("\""+baseDir+"CppPlatform/Runtime/libGDCpp.dll.a\"");
            #elif defined(MACOS)
            args.push_back("\""+baseDir+"CppPlatform/Runtime/libGDCpp.dylib\"");
            #else
            args.push_back("\""+baseDir+"CppPlatform/Runtime/libGDCpp.so\"");
            #endif
        }

        args.push_back("-lstdc++");
        if ( !compilationForRuntime ) args.push_back("-lGDCore");
        #if defined(RELEASE) || defined(DEV)
        #if defined(WINDOWS)
        args.push_back("-lsfml-audio");
        args.push_back("-lsfml-network");
        args.push_back("-lsfml-graphics");
        args.push_back("-lsfml-window");
        args.push_back("-lsfml-system");
        #elif defined(MACOS)
        args.push_back("\""+baseDir+"libsfml-audio.dylib\"");
        args.push_back("\""+baseDir+"libsfml-network.dylib\"");
        args.push_back("\""+baseDir+"libsfml-graphics.dylib\"");
        args.push_back("\""+baseDir+"libsfml-window.dylib\"");
        args.push_back("\""+baseDir+"libsfml-system.dylib\"");
        #else
        args.push_back("\""+baseDir+"libsfml-audio.so.2\"");
        args.push_back("\""+baseDir+"libsfml-network.so.2\"");
        args.push_back("\""+baseDir+"libsfml-graphics.so.2\"");
        args.push_back("\""+baseDir+"libsfml-window.so.2\"");
        args.push_back("\""+baseDir+"libsfml-system.so.2\"");
        #endif
        #elif defined(DEBUG)
        #if defined(WINDOWS)
        args.push_back("-lsfml-audio-d");
        args.push_back("-lsfml-network-d");
        args.push_back("-lsfml-graphics-d");
        args.push_back("-lsfml-window-d");
        args.push_back("-lsfml-system-d");
        #elif defined(MACOS)
        args.push_back("\""+baseDir+"libsfml-audio.dylib\"");
        args.push_back("\""+baseDir+"libsfml-network.dylib\"");
        args.push_back("\""+baseDir+"libsfml-graphics.dylib\"");
        args.push_back("\""+baseDir+"libsfml-window.dylib\"");
        args.push_back("\""+baseDir+"libsfml-system.dylib\"");
        #else
        args.push_back("\""+baseDir+"libsfml-audio-d.so.2\"");
        args.push_back("\""+baseDir+"libsfml-network-d.so.2\"");
        args.push_back("\""+baseDir+"libsfml-graphics-d.so.2\"");
        args.push_back("\""+baseDir+"libsfml-window-d.so.2\"");
        args.push_back("\""+baseDir+"libsfml-system-d.so.2\"");
        #endif
        #endif
        for (std::size_t i = 0;i<extraLibFiles.size();++i)
        {
            if ( !extraLibFiles[i].empty())
                args.push_back("-l\""+extraLibFiles[i]+"\"");
        }
    }

    gd::String argsStr;
    for (std::size_t i = 0;i<args.size();++i) argsStr += args[i]+" ";

    return compilerExecutable+" "+argsStr;
}

void CodeCompiler::StartTheNextTask()
{
    //Check if there is a task to be made
    {
        sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

        if ( !currentTask.emptyTask )
        {
           //currentTask is not empty: Do it.
        }
        else
        {
            bool newTaskFound = false;
            for (std::size_t i = 0;i<pendingTasks.size();++i)
            {
                //Be sure that the task is not disabled
                if ( find(compilationDisallowed.begin(), compilationDisallowed.end(), pendingTasks[i].scene) == compilationDisallowed.end() )
                {
                    currentTask = pendingTasks[i];
                    pendingTasks.erase(pendingTasks.begin()+i);

                    newTaskFound = true;
                    break;
                }
            }
            if ( !newTaskFound ) //Bail out if no task can be made
            {
                if ( pendingTasks.empty() )
                    std::cout << "No more task to be processed." << std::endl;
                else
                    std::cout << "No more task to be processed ( But "+gd::String::From(pendingTasks.size())+" disabled task(s) waiting for being enabled )." << std::endl;

                processLaunched = false;
                NotifyControls();
                return;
            }

        }
    }

    std::cout << "Processing task " << currentTask.userFriendlyName << "..." << std::endl;
    lastTaskFailed = false;
    NotifyControls();
    bool skip = false; //Set to true if the preworker of the task asked to relaunch the task later.

    if ( currentTask.preWork != std::shared_ptr<CodeCompilerExtraWork>() )
    {
        std::cout << "Launching pre work..." << std::endl;
        bool result = currentTask.preWork->Execute();

        if ( !result )
        {
            std::cout << "Preworker execution failed, task skipped." << std::endl;
            skip = true;
        }
        else if ( currentTask.preWork->requestRelaunchCompilationLater )
        {
            std::cout << "Preworker asked to launch the task later" << std::endl;
            sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.
            pendingTasks.push_back(currentTask);
            pendingTasks.back().preWork->requestRelaunchCompilationLater = false;

            skip = true;
        }
    }

    if ( skip ) //The preworker asked to skip the task
    {
        currentTask = ConstructEmptyTask();
        NotifyControls();
        StartTheNextTask(); //Calling recursively StartTheNextTask() is not a problem: The function will be called until a process is launched
                            //or until all tasks are skipped
        return;
    }

    lastTaskMessages.clear();

    //Launching the process
    std::cout << "Launching compiler process...\n";
    std::cout << currentTask.compilerCall.GetFullCall() << "\n";
    currentTaskProcess = new CodeCompilerProcess(this);
    currentTaskProcess->Redirect();
    if ( wxExecute(currentTask.compilerCall.GetFullCall(), wxEXEC_ASYNC, currentTaskProcess) == 0 )
    {
        gd::LogError(_("Unable to launch the internal compiler: Try to reinstall GDevelop to make sure that every needed file are present."));
        delete currentTaskProcess;
        currentTaskProcess = NULL;
    }
    else
    {
        //Also launch the thread which will read the output of the process
        currentTaskOutputThread = new sf::Thread(&CodeCompilerProcess::WatchOutput, currentTaskProcess);
        currentTaskOutputThread->launch();

        //When the process ends, it will call ProcessEndedWork()...
    }
}

CodeCompilerProcess::CodeCompilerProcess(wxEvtHandler * parent_) :
    wxProcess(0),
    parent(parent_),
    exitCode(0),
    stopWatchOutput(false)
{
    std::cout << "CodeCompilerProcess created." << std::endl;
}

void CodeCompilerProcess::OnTerminate( int pid, int status )
{
    std::cout << "CodeCompilerProcess terminated with status " << status << "." << std::endl;

    exitCode = status;
    stopWatchOutput = true;
    #if defined(WINDOWS)
    wxCommandEvent processEndedEvent( CodeCompiler::processEndedEventType );
    if ( parent != NULL) wxPostEvent(parent, processEndedEvent);
    #else
    wxCommandEvent useless;
    CodeCompiler::Get()->ProcessEndedWork(useless);
    #endif
}

void CodeCompiler::ProcessEndedWork(wxCommandEvent & event)
{
    //...This function is called when a CodeCompilerProcess ends its job.
    std::cout << "CodeCompiler notified that the current process ended work." << std::endl;

    //Also terminate the thread which was reading the output
    currentTaskOutputThread->wait();
    delete currentTaskOutputThread;
    currentTaskOutputThread = NULL;

    // Check if compilation was successful
    bool compilationSucceeded = (currentTaskProcess->exitCode == 0);
    if (!compilationSucceeded)
    {
        std::cout << "Compilation failed with exit code " << currentTaskProcess->exitCode << ".\n";
        lastTaskFailed = true;
    }
    else
    {
        std::cout << "Compilation succeeded." << std::endl;
    }

    //Compilation ended, saving diagnostics
    {
        lastTaskMessages.clear();
        for (std::size_t i = 0;i<currentTaskProcess->output.size();++i)
            lastTaskMessages += currentTaskProcess->output[i]+"\n";

        for (std::size_t i = 0;i<currentTaskProcess->outputErrors.size();++i)
            lastTaskMessages += currentTaskProcess->outputErrors[i]+"\n";

        ofstream outputFile;
        outputFile.open (gd::String(outputDir+"LatestCompilationOutput.txt").ToLocale().c_str());
        if (outputFile.is_open())
        {
            outputFile << lastTaskMessages;
            outputFile.close();
        }
        else cout << "Unable to open LatestCompilationOutput for writing compiler output!";
    }

    //Now do post work and notify task has been done.
    {
        if (currentTask.postWork != std::shared_ptr<CodeCompilerExtraWork>() )
        {
            std::cout << "Launching post task" << std::endl;
            currentTask.postWork->compilationSucceeded = compilationSucceeded;
            currentTask.postWork->Execute();

            if ( currentTask.postWork->requestRelaunchCompilationLater )
            {
                std::cout << "Postworker asked to launch again the task later" << std::endl;

                pendingTasks.push_back(currentTask);
                pendingTasks.back().postWork->requestRelaunchCompilationLater = false;
            }
        }

        std::cout << "Task ended." << std::endl;
        currentTask = ConstructEmptyTask();
        NotifyControls();
    }

    //Launch the next task ( even if there is no task to be done )
    delete currentTaskProcess;
    currentTaskProcess = NULL;
    StartTheNextTask();
}

void CodeCompiler::NotifyControls()
{
    wxCommandEvent refreshEvent( refreshEventType );
    for (std::set<wxEvtHandler*>::iterator it = notifiedControls.begin();it != notifiedControls.end();++it)
    {
        if ( (*it) != NULL) wxPostEvent((*it), refreshEvent);
    }
}
/* TODO
void CodeCompiler::SendCurrentThreadToGarbage()
{
    sf::Lock lock(garbageThreadsMutex); //Disallow modifying garbageThreads.
    std::cout << "Old thread (" << currentTaskThread.get() << ") sent to garbage." << std::endl;

    garbageThreads.push_back(currentTaskThread);
    livingGarbageThreadsCount++; //We increment livingGarbageThreadsCount as the thread sent to garbageThreads was alive ( i.e. : doing work )

    currentTaskThread = std::shared_ptr<sf::Thread>();
    processLaunched = false;
}*/

void CodeCompiler::AddTask(CodeCompilerTask task)
{
    {
        sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

        //Check if an equivalent task is not waiting in the pending list
        for (std::size_t i = 0;i<pendingTasks.size();++i)
        {
            if ( task.IsSameTaskAs(pendingTasks[i]) ) return;
        }

        //If the task is equivalent to the current one, abort it.
        if ( processLaunched && task.IsSameTaskAs(currentTask) )
        {
            std::cout << "Task requested is equivalent to the current one (" << task.userFriendlyName << ")" << std::endl;

            /*if ( livingGarbageThreadsCount < maxGarbageThread ) TODO
            {
                SendCurrentProcessToGarbage();
            }
            else*/
            {
                pendingTasks.push_back(task);
                std::cout << "Max thread count reached, new pending task added (" << task.userFriendlyName << ")" << std::endl;
            }
        }
        else
        {
            pendingTasks.push_back(task);
            std::cout << "New pending task added (" << task.userFriendlyName << ")" << std::endl;
        }
    }

    if ( !processLaunched )
    {
        std::cout << "Launching new compilation run";
        processLaunched = true;
        StartTheNextTask();
    }
}

std::vector < CodeCompilerTask > CodeCompiler::GetCurrentTasks() const
{
    sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

    std::vector < CodeCompilerTask > allTasks = pendingTasks;
    if (processLaunched) allTasks.insert(allTasks.begin(), currentTask);

    return allTasks;
}

bool CodeCompiler::HasTaskRelatedTo(gd::Layout & scene) const
{
    sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

    if ( processLaunched && currentTask.scene == &scene ) return true;

    for (std::size_t i = 0;i<pendingTasks.size();++i)
    {
        if ( pendingTasks[i].scene == &scene ) return true;
    }

    return false;
}

void CodeCompiler::EnableTaskRelatedTo(gd::Layout & scene)
{
    bool mustLaunchCompilation = false;
    {
        sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

        std::cout << "Enabling tasks related to scene:" << scene.GetName() << endl;

        vector<Scene*>::iterator it = find(compilationDisallowed.begin(), compilationDisallowed.end(), &scene);
        if ( it != compilationDisallowed.end())
            compilationDisallowed.erase(it);

        mustLaunchCompilation = !pendingTasks.empty();
    }

    //Launch pending tasks if needed
    if ( !processLaunched && mustLaunchCompilation )
    {
        std::cout << "Launching compilation thread...";
        processLaunched = true;
        StartTheNextTask();
    }
}

void CodeCompiler::RemovePendingTasksRelatedTo(gd::Layout & scene)
{
    sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

    for (std::size_t i = 0;i<pendingTasks.size();)
    {
        if ( pendingTasks[i].scene == &scene )
            pendingTasks.erase(pendingTasks.begin()+i);
        else
            ++i;
    }

}

void CodeCompiler::DisableTaskRelatedTo(gd::Layout & scene)
{
    sf::Lock lock(pendingTasksMutex); //Disallow modifying pending tasks.

    std::cout << "Disabling tasks related to scene:" << scene.GetName() << endl;

    vector<Scene*>::iterator it = find(compilationDisallowed.begin(), compilationDisallowed.end(), &scene);
    if ( it == compilationDisallowed.end())
        compilationDisallowed.push_back(&scene);
}

bool CodeCompiler::CompilationInProcess() const
{
    return processLaunched;
}

void CodeCompiler::SetOutputDirectory(gd::String outputDir_)
{
    outputDir = outputDir_;
    if ( outputDir.empty() || (outputDir[outputDir.length()-1] != '/' && outputDir[outputDir.length()-1] != '\\' ) )
        outputDir += "/";

    if (!wxDirExists(outputDir.c_str()))
        wxMkdir(outputDir);
}

void CodeCompiler::ClearOutputDirectory()
{
    wxString file = wxFindFirstFile( outputDir + "*" );
    while ( !file.empty() )
    {
        if ( !wxRemoveFile( file ) )
            std::cout << _( "Unable to delete file" ) + file + _(" in compiler output directory.\n" );

        file = wxFindNextFile();
    }
}

void CodeCompiler::AddHeaderDirectory(const gd::String & dir)
{
    wxFileName filename = wxFileName::FileName(dir);
    filename.MakeAbsolute(baseDir);

    headersDirectories.insert(filename.GetPath());
}

void CodeCompiler::SetBaseDirectory(gd::String baseDir_)
{
    gd::String oldBaseDir = baseDir; //Remember the old base directory, see below
    baseDir = baseDir_;

    if ( baseDir.empty() || (baseDir[baseDir.length()-1] != '/' && baseDir[baseDir.length()-1] != '\\' ) )
        baseDir += "/"; //Normalize the path if needed
}

void CodeCompiler::AllowMultithread(bool allow, unsigned int maxThread)
{
    /*if (!allow || maxThread == 1)
        maxGarbageThread = 0;
    else
        maxGarbageThread = maxThread-1;*/
}

CodeCompiler::CodeCompiler() :
    processLaunched(false),
    currentTask(ConstructEmptyTask()),
    currentTaskProcess(NULL),
    currentTaskOutputThread(NULL),
    //maxGarbageThread(2),
    lastTaskFailed(false)
{
    Connect(wxID_ANY, processEndedEventType, (wxObjectEventFunction) (wxEventFunction) (wxCommandEventFunction) &CodeCompiler::ProcessEndedWork);
}


void CodeCompilerProcess::WatchOutput()
{
    while(!stopWatchOutput)
        ReadOutput();

    while(IsInputAvailable() || IsErrorAvailable())
        ReadOutput(); //Also do not forget to read the last output emitted by the process!
}

void CodeCompilerProcess::ReadOutput()
{
    char c;

    if(IsInputAvailable())
    {
        gd::String line;
        do
        {
            c = GetInputStream()->GetC();
            if ( GetInputStream()->Eof() ) break; // Check we've not just overrun

            if ( c=='\n' ) break; // If \n, break to print the line
            line.Raw() += c;
        }
        while ( IsInputAvailable() ); // Unless \n, loop to get another char

        output.push_back(line.ReplaceInvalid()); // Either there's a full line in 'line', or we've run out of input. Either way, print it
    }
    if(IsErrorAvailable())
    {
        gd::String line;
        do
        {
            c = GetErrorStream()->GetC();
            if ( GetErrorStream()->Eof() ) break; // Check we've not just overrun

            if ( c=='\n' ) break; // If \n, break to print the line
            line.Raw() += c;
        }
        while ( IsErrorAvailable() );                           // Unless \n, loop to get another char

        outputErrors.push_back(line.ReplaceInvalid()); // Either there's a full line in 'line', or we've run out of input. Either way, print it
    }
}

CodeCompilerCall::CodeCompilerCall() :
    link(false),
    compilationForRuntime(false),
    optimize(false),
    eventsGeneratedCode(true)
{
}

CodeCompilerExtraWork::CodeCompilerExtraWork() :
    requestRelaunchCompilationLater(false)
{
}
CodeCompilerExtraWork::~CodeCompilerExtraWork()
{
}

CodeCompiler::~CodeCompiler()
{
}

CodeCompiler * CodeCompiler::Get()
{
    if ( NULL == _singleton )
        _singleton = new CodeCompiler;

    return ( static_cast<CodeCompiler*>( _singleton ) );
}

void CodeCompiler::DestroySingleton()
{
    if ( NULL != _singleton )
    {
        delete _singleton;
        _singleton = NULL;
    }
}
#endif
