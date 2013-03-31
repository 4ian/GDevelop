/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef CODECOMPILER_H
#define CODECOMPILER_H
#include <string>
#include <vector>
#include <set>
#include <SFML/System.hpp>
#include <boost/shared_ptr.hpp>
#include <wx/event.h>
#include <wx/process.h>
#include <wx/thread.h>
class CodeCompilerExtraWork;
class Scene;
class CodeCompilerThreadStateNotifier;

/**
 * \brief Generate the call that must be executed by the CodeCompiler for a task
 * \see CodeCompiler
 * \see CodeCompilerTask
 */
class GD_API CodeCompilerCall
{
public:

    /**
     * Default constructor : Construct an object without options, just the default compiler set.
     */
    CodeCompilerCall();

    /**
     * Return the full command line that must be executed by the compiler
     */
    std::string GetFullCall() const;

    const std::string & GetCompilerExecutable() const { return compilerExecutable; }
    void SetCompilerExecutable(const std::string & compilerExecutableFullPath) { compilerExecutable = compilerExecutableFullPath; }

    bool link; ///< If set to true, the task must be to link the inputFile and extraInputFiles.
    std::string inputFile; ///< The input file ( i.e. Source file if link == false, Object file if link == true )
    std::string outputFile; ///< The output file ( i.e. Object file if link == false, shared library if link == true )

    std::vector<std::string> extraObjectFiles; ///< Additional object files to be linked ( Only relevant when link is set to true )
    std::vector<std::string> extraLibFiles; ///< Additional libraries files to be used ( Only relevant when link is set to true )
    std::vector<std::string> extraHeaderDirectories; ///< Extra directories used when searching for includes.  ( Only relevant when link is set to false )
    std::vector<std::string> extraOptions; ///< Extra options that will be added raw as the end of the command line.

    bool optimize; ///< Activate optimization flag if set to true
    bool compilationForRuntime; ///< Automatically define GD_IDE_ONLY if set to true
    bool eventsGeneratedCode; ///< If set to true, the compiler will be set up with common options for events compilation.

    /**
     * Method to check if the task is the same as another. ( Compare files/options but does not take in account pre/post work )
     */
    bool IsSameAs(CodeCompilerCall & other) const {
        return (inputFile == other.inputFile && outputFile == other.outputFile && compilationForRuntime == other.compilationForRuntime
                && optimize == other.optimize && eventsGeneratedCode == other.eventsGeneratedCode );
    }

private:

    std::string compilerExecutable; ///< Automatically set up to the default compiler by the default constructor.
};

/**
 * \brief Define a task to be processed by the code compiler.
 * \see CodeCompiler
 * \see CodeCompiler::AddTask
 */
class GD_API CodeCompilerTask
{
public:
    CodeCompilerTask() : emptyTask(false), scene(NULL) {};
    virtual ~CodeCompilerTask() {};

    bool emptyTask; ///< If set to true, this task will be skipped.

    boost::shared_ptr<CodeCompilerExtraWork> postWork; ///< Post work that will be launched when the compilation of the task is over
    boost::shared_ptr<CodeCompilerExtraWork> preWork;  ///< Pre work that will be launched before the compilation of the task is launched
    CodeCompilerCall compilerCall; ///< The main work to be executed

    std::string userFriendlyName; ///< Task name displayed to the user
    Scene * scene; ///< Optional pointer to a scene to specify that the task work is related to this scene.

    /**
     * Method to check if the task is the same as another. ( Compare files/options but does not take in account pre/post work )
     */
    bool IsSameTaskAs(CodeCompilerTask & other) const {
        return (emptyTask == other.emptyTask &&compilerCall.IsSameAs(other.compilerCall) && scene == other.scene);
    }
};

/**
 * \brief Define a special work to be done after/before a task
 * \see CodeCompiler
 * \see CodeCompilerTask
 */
class GD_API CodeCompilerExtraWork
{
public:
    /**
     * Override this method with the extra work to do. Must return true if successful.
     */
    virtual bool Execute() {return true;};

    bool requestRelaunchCompilationLater; ///< If the task set this bool to true, the task will be skipped and relaunched later.
    bool compilationSucceeded; ///< Set to true by the CodeCompiler if the compilation associated to the task was a success. Only applicable for post work.

    CodeCompilerExtraWork();
    virtual ~CodeCompilerExtraWork();
};

/**
 * \brief Internal class used to launch building tasks.
 *
 * The output of the compiler is read thanks to an OutputReadingThread object.
 * \see OutputReadingThread
 */
class CodeCompilerProcess : public wxProcess
{
public:
    CodeCompilerProcess(wxEvtHandler * parent);
    virtual ~CodeCompilerProcess() {};

    std::vector<std::string> output; ///< The output of the compiler. Must be filled thanks to a OutputReadingThread.
    std::vector<std::string> outputErrors; ///< The error output of the compiler. Must be filled thanks to a OutputReadingThread.
    wxEvtHandler * parent;
    int exitCode; ///< Available when the process has terminated.

    /** Must be launched by an external thread to watch the input. Keeps running until stopWatchOutput is set to false.
     */
    void WatchOutput();

protected:
    virtual void OnTerminate( int pid, int status );
private:

    /** Read the output of the process. Called repeatedly by WatchOutput until stopWatchOutput is set to false.
     */
    void ReadOutput();

    bool stopWatchOutput;
};

/**
 * \brief C++ Code compiler
 * This class uses a thread to launch Clang compiler according to the task added using AddTask.
 * Specific functions are available for preventing the compiler to start a new task involving a specific scene.
 *
 * \see CodeCompilerTask
 */
class GD_API CodeCompiler : public wxEvtHandler
{
public:

    /**
     * Add a task. It will be directly processed or added to a list of pending task if another task is running.
     * If a similar task ( as defined by CodeCompilerTask::IsSameTaskAs ) is waiting in pending task list, the task
     * won't be added to this pending task list.
     */
    void AddTask(CodeCompilerTask task);

    /**
     * Return true if a task involving scene is being processed or will be processed.
     */
    bool HasTaskRelatedTo(Scene & scene) const;

    /**
     * Tell the compiler task related to scene can be launched
     * ( Compiler can launch at this moment a pending task )
     */
    void EnableTaskRelatedTo(Scene & scene);

    /**
     * Tell the compiler to not attempt to compile anything related to scene.
     * However, if a compilation is currently run, it will not stop:
     * That is why the scene has to wait until HasTaskRelatedTo(scene) return false.
     */
    void DisableTaskRelatedTo(Scene & scene);

    /**
     * Remove pending tasks related to scene. The current task is not aborted.
     */
    void RemovePendingTasksRelatedTo(Scene & scene);

    /**
     * Return true if a task is being processed.
     */
    bool CompilationInProcess() const;

    /**
     * Return a list of tasks containing the current task and tasks waiting to be processed
     */
    std::vector < CodeCompilerTask > GetCurrentTasks() const;

    /**
     * Add a directory where headers can be found.
     * The directory is relative to the base directory ( which is by default the IDE directory. See CodeCompiler::SetBaseDirectory )
     * The directory can be absolute ( "C:\...", "/usr/..." ) even if it is not recommended.
     */
    void AddHeaderDirectory(const std::string & dir);

    /**
     * Return a read-only reference to the vector containing the common headers directories
     */
    const std::set<std::string> & GetAllHeadersDirectories() const { return headersDirectories; }

    /**
     * Add a (wxWidgets) control to the list of objects notified when progress has been made
     */
    void AddNotifiedControl(wxEvtHandler * control) { notifiedControls.insert(control); };

    /**
     * Remove a (wxWidgets) control from the list of objects notified when progress has been made
     */
    void RemoveNotifiedControl(wxEvtHandler * control) { notifiedControls.erase(control); };

    /**
     * Return true if the latest task has failed.
     */
    bool LastTaskFailed() { return lastTaskFailed; };

    /**
     * Get the output of the compiler for the last task.
     */
    const std::string & GetLastTaskMessages() { return lastTaskMessages; };

    /**
     * Set if code compiler must delete temporaries files
     */
    void SetMustDeleteTemporaries(bool mustDeleteTemporaries_) { mustDeleteTemporaries = mustDeleteTemporaries_; };

    /**
     * Return true if code compiler must delete temporaries files
     */
    bool MustDeleteTemporaries() { return mustDeleteTemporaries; };

    /**
     * Set the directory used as the base directory for includes.
     * \note If the base directory does not end with a slash ( / ) or a backslash ( \ ), a slash is added at the end.
     */
    void SetBaseDirectory(std::string baseDir_);

    /**
     * Return the directory used as the base directory for includes.
     */
    const std::string & GetBaseDirectory() const { return baseDir; };

    /**
     * Set the directory used as temporary directory for output files.
     * \note If the base directory does not end with a slash ( / ) or a backslash ( \ ), a slash is added at the end.
     */
    void SetOutputDirectory(std::string outputDir_);

    /**
     * Return the directory used as temporary directory for output files.
     */
    const std::string & GetOutputDirectory() const { return outputDir; };

    /**
     * Erase all files in the output directory ( Even if MustDeleteTemporaries() == false ).
     */
    void ClearOutputDirectory();

    /**
     * Set if CodeCompiler is allowed to launch more than one thread.
     *
     * For example, if a task is requested twice in a short time, CodeCompiler can launch a 2nd
     * thread to do the work and discard the result of the 1st as it is useless.
     * If multithread is disabled or if maxThread count is reached, then the second task is added
     * to pending tasks.
     */
    void AllowMultithread(bool allow = true, unsigned int maxThread = 3);

    static CodeCompiler * GetInstance();
    static void DestroySingleton();

    static sf::Mutex openSaveDialogMutex; ///< wxWidgets Open/Save dialog seems to cause crash when writing bitcode at the same time.
    static const wxEventType refreshEventType; ///< Used to notify associated gui that they need to update.
    static const wxEventType processEndedEventType; ///< Used by process to notify their CodeCompiler parent that they have terminated their work.

private:

    /**
     * \brief Execute the next task to be done.
     *
     * Return without doing nothing special if no task has to be done.<br>
     * If a task must be done, a compilation process is executed ( see CodeCompilerProgress ) and then the function returns.
     * The process will call ProcessEndedWork when it is over.
     */
    void StartTheNextTask();

    /**
     * Post an event to notifiedControls to notify them that progress has been made.
     */
    void NotifyControls();

    /**
     * Set the current process to be considered as garbage.
     */
    void SendCurrentProcessToGarbage();

#if defined(LINUX)
public:
#endif
    /**
     * Called by processes ( CodeCompilerProgress )  when they end they work.
     *
     * Take care of launching the post task worker if needed, and then call StartTheNextTask() to
     * launch the next task if any.
     */
    void ProcessEndedWork(wxCommandEvent& event);
#if defined(LINUX)
private:
#endif

    //Current task
    bool processLaunched; ///< Set to true when the thread is working, and to false when the pending task list has been exhausted.
    CodeCompilerTask currentTask; ///< When a task is being done, it is removed from pendingTasks and stored here.
    CodeCompilerProcess * currentTaskProcess; ///< The process doing the current task
    sf::Thread * currentTaskOutputThread; ///< The wxWidgets thread used to read the output of the compiler.

    //Pending task management
    std::vector < CodeCompilerTask > pendingTasks; ///< Compilation task waiting to be launched.
    mutable sf::Mutex pendingTasksMutex; ///< A mutex is used to be sure that pending tasks are not modified by the thread and another method at the same time.
    std::vector < Scene* > compilationDisallowed; ///< List of scenes which disallow their events to be compiled. (However, if a compilation is being made, it will not be stopped)

    //Global compiler configuration
    std::string baseDir; ///< The directory used as the base directory for searching for includes files.
    std::string outputDir; ///< The directory where temporary files are created
    std::set < std::string > headersDirectories; ///< List of headers that should be used for every compilation task
    bool mustDeleteTemporaries; ///< True if temporary must be deleted

    //Gui related
    std::set<wxEvtHandler*> notifiedControls; ///< List of wxWidgets controls to be notified when some progress has been made.
    std::string lastTaskMessages;  ///< String containing the messages emitted by the compiler for the latest task.
    bool lastTaskFailed; ///< Set to true when a task fail.

    CodeCompiler();
    virtual ~CodeCompiler();
    static CodeCompiler *_singleton;
};

#endif // CODECOMPILER_H
#endif

