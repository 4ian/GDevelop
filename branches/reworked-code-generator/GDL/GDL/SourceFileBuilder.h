/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#ifndef SOURCEFILEBUILDER_H
#define SOURCEFILEBUILDER_H

#include <wx/process.h>
class wxGauge;
class wxStaticText;
#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>
#include <iostream>
#include "GDL/CompilerToolchainPathManager.h"
class Game;

namespace GDpriv
{
class SourceFile;
class BuildProcess;

/**
 * \brief Internal class for building source files.
 * Manage build of sources file of a project.
 * Use processes to allow asynchronous compilation.
 */
class GD_API SourceFileBuilder
{
    public:
        friend class BuildProcess;

        SourceFileBuilder(wxGauge * progressGauge = NULL, wxStaticText * statusText = NULL, bool buildForRuntime = false);
        virtual ~SourceFileBuilder() {};

        /**
         * Launch build process.
         * Build end can be tested with IsBuilding();
         */
        bool LaunchSourceFilesBuild();

        /**
         * Return true if building source files is needed.
         */
        bool BuildNeeded();

        /**
         * Set files to compile
         */
        void SetFiles(std::vector < boost::shared_ptr<SourceFile> > sourceFiles_) { sourceFiles = sourceFiles_; };

        /**
         * Set static extensions which can be used
         */
        void SetExtensionsUsed(std::vector < std::string > extensionsUsed_) { extensionsUsed = extensionsUsed_; UpdateExtensionsLibs(); };

        /**
         * Return true if the IsBuilding is compiling sources files.
         */
        bool IsBuilding() const { return (state != 0); }

        /**
         * Return true if the IsBuilding is compiling sources files.
         */
        bool LastBuildSuccessed() const { return lastBuildSuccessed; }

        /**
         * Return a vector of string containing raw errors messages.
         */
        std::vector<std::string> GetErrors() const { return errors; };

        /**
         * Try to abord build process.
         */
        void AbordBuild() { abordBuild = true; };

        /**
         * Change wxWidgets controls used for display progress
         */
        void SetProgressControls(wxGauge * progressGauge_, wxStaticText * statusText) { progressGauge = progressGauge_; currentTaskTxt = statusText; }

        /**
         * Called by processes so as to advance build.
         */
        void OnCurrentBuildProcessTerminated(bool success);

    private:

        bool BuildSourceFile(std::string filename);
        bool LinkSourceFiles(std::vector<std::string> files);

        void UpdateExtensionsLibs();

        std::vector < boost::shared_ptr<SourceFile> > sourceFiles;
        std::vector < std::string > extensionsUsed;

        std::string wxwidgetsLibs;
        std::string wxwidgetsDefines;
        std::string sfmlLibs;
        std::string sfmlDefines;
        std::string boostDefines;
        std::string gdlLibs;
        std::string gdlDefines;
        std::string osLibs;
        std::string osDefines;

        std::vector<std::string > errors;

        BuildProcess * currentBuildProcess; ///< Each build step is realized using a separate process to allow continue working with Game Develop
        int state; ///< Used to remember the build state ( Idle, compiling, linking, finishing... )
        unsigned int currentFileBuilded; ///< The file currently/lastly compiled.
        bool abordBuild;
        bool linkingNeed;
        bool lastBuildSuccessed;

        bool buildForRuntime;

        wxGauge * progressGauge;
        wxStaticText * currentTaskTxt;

        CompilerToolchainPathManager pathManager;
        std::vector<std::string> fileExtensionsToCompile;
};

/**
 * \brief Internal class used to launch building tasks.
 * Process used for building tasks.
 */
class BuildProcess : public wxProcess
{
public:
    BuildProcess(SourceFileBuilder *parent) :
        wxProcess(0),
        m_parent(parent)
    {
        std::cout << "BuildProcess created" << std::endl;
        Redirect();
    }

    virtual void OnTerminate(int pid, int status);
    virtual bool HasInput();

    std::vector<std::string> output;
    std::vector<std::string> outputErrors;

protected:
    SourceFileBuilder *m_parent; ///< Build process must be able to notify its parent his work is finished.
};

}

#endif // SOURCEFILEBUILDER_H

#endif
#endif
