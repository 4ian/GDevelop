/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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
class CodeCompilerExtraWork;
class Scene;

/**
 * \brief Define a task to be processed by the code compiler.
 * \see CodeCompiler
 * \see CodeCompiler::AddTask
 */
class GD_API CodeCompilerTask
{
public:
    CodeCompilerTask() : compilationForRuntime(false), optimize(false), eventsGeneratedCode(true), scene(NULL) {};
    virtual ~CodeCompilerTask() {};

    std::string inputFile;
    std::string outputFile;

    bool compilationForRuntime; ///< Automatically define GD_IDE_ONLY if set to true
    bool optimize; ///< Activate optimization flag if set to true
    bool eventsGeneratedCode; ///< If set to true, the compiler will be set up with common options for events compilation.
    Scene * scene; ///< Optional pointer to a scene to specify that the task work is related to this scene.

    boost::shared_ptr<CodeCompilerExtraWork> postWork; ///< Post work that will be launched when the compilation of the task is over
    boost::shared_ptr<CodeCompilerExtraWork> preWork;  ///< Pre work that will be launched before the compilation of the task is launched

    std::vector<std::string> additionalHeaderDirectories; ///< Extra directories used when searching for includes.

    std::string userFriendlyName; ///< Task name displayed to the user

    /**
     * Method to check if the task is the same as another. ( Compare files/options but does not take in account pre/post work )
     */
    bool IsSameTaskAs(CodeCompilerTask & other) const {
        return (inputFile == other.inputFile && outputFile == other.outputFile && compilationForRuntime == other.compilationForRuntime
                && optimize == other.optimize && eventsGeneratedCode == other.eventsGeneratedCode && scene == other.scene );
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
 * \brief C++ Code compiler
 * This class uses a thread to launch Clang compiler according to the task added using AddTask.
 * Specific functions are available for preventing the compiler to start a new task involving a specific scene.
 *
 * \see CodeCompilerTask
 */
class GD_API CodeCompiler
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

    static CodeCompiler * GetInstance();
    static void DestroySingleton();

    static sf::Mutex openSaveDialogMutex; ///< wxWidgets Open/Save dialog seems to cause crash when writing bitcode at the same time.
    static const wxEventType refreshEventType; ///< Used to notify associated gui that they need to update.

private:

    /**
     * Execute the current tasks until pending task list is empty. Do not call this method directly: It is only to be used by currentTaskThread.
     */
    void ProcessTasks();

    /**
     * Post an event to notifiedControls to notify them that progress has been made.
     */
    void NotifyControls();

    //Current tasks
    bool threadLaunched; ///< Set to true when the thread is working, and to false when the pending task list has been exhausted.
    CodeCompilerTask currentTask; ///< When a task is being done, it is removed from pendingTasks and stored here.
    sf::Thread currentTaskThread; ///< The thread used to process tasks

    //Pending task management
    std::vector < CodeCompilerTask > pendingTasks; ///< Compilation task waiting to be launched.
    mutable sf::Mutex pendingTasksMutex; ///< A mutex is used to b sure that pending tasks are not modified by the thread and another method at the same time.
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
