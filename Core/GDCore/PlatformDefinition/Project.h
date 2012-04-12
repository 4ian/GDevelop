/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_PROJECT_H
#define GDCORE_PROJECT_H
#include <string>
#include <vector>
#include "GDCore/PlatformDefinition/Layout.h"

namespace gd
{
class Platform;

/**
 * \brief Base class used to represent a project of a platform
 *
 * \todo Current implementation status: Used in some part of the IDE: Currently, the IDE automatically create the Project class of the GD C++ Platform when it is need.
 */
class GD_CORE_API Project
{
public:
    Project();
    virtual ~Project();

    /**
     * Must change the name of the project with the name passed as parameter.
     */
    virtual void SetName(const std::string & name) =0;

    /**
     * Must return the name of the project.
     */
    virtual const std::string & GetName() const =0;

    /**
     * Must change the name of the project with the name passed as parameter.
     */
    virtual void SetAuthor(const std::string & name) =0;

    /**
     * Must return the name of the project.
     */
    virtual const std::string & GetAuthor() =0;

    /**
     * Must change the default width of the project main window
     */
    virtual void SetMainWindowDefaultWidth(unsigned int width) =0;

    /**
     * Must return the default width of the project main window
     */
    virtual unsigned int GetMainWindowDefaultWidth() const  =0;

    /**
     * Must change the default width of the project main window
     */
    virtual void SetMainWindowDefaultHeight(unsigned int width) =0;

    /**
     * Must return the default width of the project main window
     */
    virtual unsigned int GetMainWindowDefaultHeight() const  =0;

    /**
     * Must change the maximum number of frames allowed to be rendered per seconds
     */
    virtual void SetMaximumFPS(int maxFPS) =0;

    /**
     * Must return the maximum number of frames allowed to be rendered per seconds
     */
    virtual int GetMaximumFPS() const  =0;

    /**
     * Must change the minimum number of frames allowed to be rendered per seconds
     */
    virtual void SetMinimumFPS(unsigned int minFPS) =0;

    /**
     * Must return the minimum number of frames allowed to be rendered per seconds
     */
    virtual unsigned int GetMinimumFPS() const =0;

    virtual bool IsVerticalSynchronizationEnabledByDefault() const =0;
    virtual void SetVerticalSyncActivatedByDefault(bool enable) =0;

    /**
     * Must return a vector containing the names of extensions used by the project.
     *
     * \note Default implementation: Return an empty vector
     */
    virtual const std::vector < std::string > & GetUsedPlatformExtensions() const { return noPlatformExtensionsUsed; };

    /**
     * Must return a vector containing the names of extensions used by the project.
     *
     * \note Default implementation: Return an empty vector
     */
    virtual std::vector < std::string > & GetUsedPlatformExtensions() { return noPlatformExtensionsUsed; };

    /**
     * Must return a reference to the platform the project is based on.
     */
    virtual Platform & GetPlatform() const =0;

    virtual bool HasLayoutNamed(const std::string & name) =0;
    virtual Layout & GetLayout(const std::string & name) =0;
    virtual const Layout & GetLayout(const std::string & name) const =0;
    virtual Layout & GetLayout(unsigned int index) =0;
    virtual const Layout & GetLayout (unsigned int index) const =0;
    virtual unsigned int GetLayoutPosition(const std::string & name) const =0;
    virtual unsigned int GetLayoutCount() const =0;
    virtual void InsertNewLayout(std::string & name, unsigned int position) =0;
    virtual void InsertLayout(Layout & layout, unsigned int position) =0;
    virtual void RemoveLayout(const std::string & name) =0;

private:

    static std::vector < std::string > noPlatformExtensionsUsed;
};

}


#endif // GDCORE_PROJECT_H
