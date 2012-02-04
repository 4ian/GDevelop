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

    boost::shared_ptr<CodeCompilerExtraWork> postWork;
    boost::shared_ptr<CodeCompilerExtraWork> preWork;

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

    CodeCompilerExtraWork();
    virtual ~CodeCompilerExtraWork();
};

/**
 * \brief C++ Code compiler
 * This class uses a thread to launch Clang compiler according to the task added using AddTask.
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
     * Return a list of tasks containing the current task and tasks waiting to be processed
     */
    std::vector < CodeCompilerTask > GetCurrentTasks() const;

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
     * Add a directory where headers can be found
     */
    void AddHeaderDirectory(const std::string & dir) { headersDirectories.insert(std::string("-I"+dir)); };

    /**
     * Set the directory used as temporary directory for output files.
     */
    void SetWorkingDirectory(std::string workingDir_);

    /**
     * Set if code compiler must delete temporaries files
     */
    void SetMustDeleteTemporaries(bool mustDeleteTemporaries_) { mustDeleteTemporaries = mustDeleteTemporaries_; };

    /**
     * Return true if code compiler must delete temporaries files
     */
    bool MustDeleteTemporaries() { return mustDeleteTemporaries; };

    /**
     * Return the directory used as temporary directory for output files.
     */
    const std::string & GetWorkingDirectory() const { return workingDir; };

    static CodeCompiler * GetInstance();
    static void DestroySingleton();

    static sf::Mutex openSaveDialogMutex; ///< wxWidgets Open/Save dialog seems to cause crash when writing bitcode at the same time.

private:


    bool threadLaunched; ///< Set to true when the thread is working, and to false when the pending task list has been exhausted.
    CodeCompilerTask currentTask;
    sf::Thread currentTaskThread;

    std::vector < CodeCompilerTask > pendingTasks; ///< Compilation task waiting to be launched.
    mutable sf::Mutex pendingTasksMutex; ///< A mutex is used to b sure that pending tasks are not modified by the thread and another method at the same time.

    std::vector < Scene* > compilationDisallowed; ///< List of scenes which disallow their events to be compiled. (However, if a compilation is being made, it will not be stopped)

    /**
     * Execute the current tasks until pending task list is empty. Do not call this method directly: It is only to be used by currentTaskThread.
     */
    void ProcessTasks();

    std::string workingDir;
    std::set < std::string > headersDirectories;
    bool mustDeleteTemporaries;

    CodeCompiler();
    virtual ~CodeCompiler();
    static CodeCompiler *_singleton;
};

#endif // CODECOMPILER_H
#endif
