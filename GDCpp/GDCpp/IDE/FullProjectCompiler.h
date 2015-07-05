/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef FULLPROJECTCOMPILER_H
#define FULLPROJECTCOMPILER_H
#include <string>
#include "GDCpp/Utf8String.h"
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
    FullProjectCompiler(gd::Project & game_, FullProjectCompilerDiagnosticManager & diagnosticManager_, gd::String outDir_) :
        gameToCompile(game_),
        diagnosticManager(diagnosticManager_),
        outDir(outDir_),
        windowsTarget(false),
        linuxTarget(false),
        macTarget(false)
        {};
    virtual ~FullProjectCompiler() {};

    void LaunchProjectCompilation();

    void ClearDirectory(gd::String directory);
    gd::String GetTempDir();
    void SetForcedTempDir(const gd::String & dir) { forcedTempDir = dir; };

    //Cross compilation is not available
    /*void TargetWindows(bool enable = true) { windowsTarget = enable; };
    void TargetLinux(bool enable = true) { linuxTarget = enable; };
    void TargetMac(bool enable = true) { macTarget = enable; };*/
    void CompressIfPossible(bool enable = true) { compressIfPossible = enable; };
    void Optimize(bool enable = true) { optimize = enable; };

private:

    gd::Project & gameToCompile;
    FullProjectCompilerDiagnosticManager & diagnosticManager;
    gd::String outDir;
    gd::String forcedTempDir;

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
    virtual void OnCompilationSucceeded() {};
    virtual void OnMessage(gd::String message, gd::String message2 = "") {};
    virtual void OnPercentUpdate(float percents) {};

    gd::String GetErrors() const { return errors; }
    void AddError(gd::String error) { errors += error+"\n"; };

private:
    gd::String errors;
};

/**
 * Display message of FullProjectCompiler in console
 */
class GD_API FullProjectCompilerConsoleDiagnosticManager : public FullProjectCompilerDiagnosticManager
{
public:
    virtual void OnCompilationFailed();
    virtual void OnCompilationSucceeded();
    virtual void OnMessage(gd::String message, gd::String message2 = "");
    virtual void OnPercentUpdate(float percents);
};


}

#endif // FULLPROJECTCOMPILER_H
#endif
