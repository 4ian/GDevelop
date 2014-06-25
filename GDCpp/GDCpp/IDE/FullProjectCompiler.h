/*
 * Game Develop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef FULLPROJECTCOMPILER_H
#define FULLPROJECTCOMPILER_H
#include <string>
namespace gd { class Project; }

namespace GDpriv
{

class FullProjectCompilerDiagnosticManager; //Definition below

/**
 * Compile a whole project
 */
class GD_API FullProjectCompiler
{
public:
    FullProjectCompiler(gd::Project & game_, FullProjectCompilerDiagnosticManager & diagnosticManager_, std::string outDir_) :
        gameToCompile(game_),
        diagnosticManager(diagnosticManager_),
        outDir(outDir_),
        windowsTarget(false),
        linuxTarget(false),
        macTarget(false)
        {};
    virtual ~FullProjectCompiler() {};

    void LaunchProjectCompilation();

    void ClearDirectory(std::string directory);
    std::string GetTempDir();
    void SetForcedTempDir(const std::string & dir) { forcedTempDir = dir; };

    //Cross compilation is not available
    /*void TargetWindows(bool enable = true) { windowsTarget = enable; };
    void TargetLinux(bool enable = true) { linuxTarget = enable; };
    void TargetMac(bool enable = true) { macTarget = enable; };*/
    void CompressIfPossible(bool enable = true) { compressIfPossible = enable; };
    void Optimize(bool enable = true) { optimize = enable; };

private:

    gd::Project & gameToCompile;
    FullProjectCompilerDiagnosticManager & diagnosticManager;
    std::string outDir;
    std::string forcedTempDir;

    bool windowsTarget;
    bool linuxTarget;
    bool macTarget;
    bool compressIfPossible;
    bool optimize;
};

/**
 * \brief Base class for implementing message display for FullProjectCompiler.
 * Inherits from this class and implement OnXXX functions.
 */
class GD_API FullProjectCompilerDiagnosticManager
{
public:
    virtual void OnCompilationFailed() {};
    virtual void OnCompilationSuccessed() {};
    virtual void OnMessage(std::string message, std::string message2 = "") {};
    virtual void OnPercentUpdate(float percents) {};

    std::string GetErrors() const { return errors; }
    void AddError(std::string error) { errors += error+"\n"; };

private:
    std::string errors;
};

/**
 * Display message of FullProjectCompiler in console
 */
class GD_API FullProjectCompilerConsoleDiagnosticManager : public FullProjectCompilerDiagnosticManager
{
public:
    virtual void OnCompilationFailed();
    virtual void OnCompilationSuccessed();
    virtual void OnMessage(std::string message, std::string message2 = "");
    virtual void OnPercentUpdate(float percents);
};


}

#endif // FULLPROJECTCOMPILER_H
#endif

