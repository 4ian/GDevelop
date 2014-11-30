/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef RESOURCESABSOLUTEPATHCHECKER_H
#define RESOURCESABSOLUTEPATHCHECKER_H

#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include <string>

namespace gd
{

/**
 * \brief Helper used to check if a project has at least a resource with an absolute filename.
 *
 * \see ArbitraryResourceWorker
 *
 * \ingroup IDE
 */
class GD_CORE_API ResourcesAbsolutePathChecker : public ArbitraryResourceWorker
{
public:
    ResourcesAbsolutePathChecker(AbstractFileSystem & fileSystem) : ArbitraryResourceWorker(), hasAbsoluteFilenames(false), fs(fileSystem) {};
    virtual ~ResourcesAbsolutePathChecker() {};

    /**
     * Return true if there is at least a resource with an absolute filename.
     */
    bool HasResourceWithAbsoluteFilenames() const { return hasAbsoluteFilenames; };

    /**
     * Check if there is a resource with an absolute path
     */
    virtual void ExposeFile(std::string & resource);

    virtual void ExposeImage(std::string & imageName) {};
    virtual void ExposeShader(std::string & shaderName) {};

private:
    bool hasAbsoluteFilenames;
    AbstractFileSystem & fs;
};

}

#endif // RESOURCESABSOLUTEPATHCHECKER_H
