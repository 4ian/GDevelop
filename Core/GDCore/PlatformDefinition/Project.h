/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_PROJECT_H
#define GDCORE_PROJECT_H
#include <string>
#include <vector>
namespace gd { class Layout; }
namespace gd { class ExternalEvents; }

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

    /**
     * Must return true if vertical synchronization is activated by default when starting the game
     */
    virtual bool IsVerticalSynchronizationEnabledByDefault() const =0;

    /**
     * Must change the value of the vertical synchronization activation
     */
    virtual void SetVerticalSyncActivatedByDefault(bool enable) =0;

    /**
     * Must return a reference to the vector containing the names of extensions used by the project.
     *
     * \note Default implementation: Return a reference to an empty vector
     */
    virtual const std::vector < std::string > & GetUsedPlatformExtensions() const { return noPlatformExtensionsUsed; };

    /**
     * Must return a reference to the vector containing the names of extensions used by the project.
     *
     * \note Default implementation: Return a reference to an empty vector
     */
    virtual std::vector < std::string > & GetUsedPlatformExtensions() { return noPlatformExtensionsUsed; };

    /**
     * Must return a reference to the platform the project is based on.
     */
    virtual Platform & GetPlatform() const =0;

    /**
     * Must return true if layout called "name" exists.
     */
    virtual bool HasLayoutNamed(const std::string & name) const =0;

    /**
     * Must return a reference to the layout called "name".
     */
    virtual Layout & GetLayout(const std::string & name) =0;

    /**
     * Must return a reference to the layout called "name".
     */
    virtual const Layout & GetLayout(const std::string & name) const =0;

    /**
     * Must return a reference to the layout at position "index" in the layout list
     */
    virtual Layout & GetLayout(unsigned int index) =0;

    /**
     * Must return a reference to the layout at position "index" in the layout list
     */
    virtual const Layout & GetLayout (unsigned int index) const =0;

    /**
     * Must return the position of the layout called "name" in the layout list
     */
    virtual unsigned int GetLayoutPosition(const std::string & name) const =0;

    /**
     * Must return the number of layouts.
     */
    virtual unsigned int GetLayoutCount() const =0;

    /**
     * Must add a new empty layout called "name" at the specified position in the layout list.
     */
    virtual void InsertNewLayout(std::string & name, unsigned int position) =0;

    /**
     * Must add a new layout constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the layout passed as parameter.
     * \param layout The layout that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the layout must be inserted at the end of the layout list.
     */
    virtual void InsertLayout(const Layout & layout, unsigned int position) =0;

    /**
     * Must delete layout named "name".
     */
    virtual void RemoveLayout(const std::string & name) =0;

    /**
     * Must return true if external events called "name" exists.
     */
    virtual bool HasExternalEventsNamed(const std::string & name) const =0;

    /**
     * Must return a reference to the external events called "name".
     */
    virtual ExternalEvents & GetExternalEvents(const std::string & name) =0;

    /**
     * Must return a reference to the external events called "name".
     */
    virtual const ExternalEvents & GetExternalEvents(const std::string & name) const =0;

    /**
     * Must return a reference to the external events at position "index" in the external events list
     */
    virtual ExternalEvents & GetExternalEvents(unsigned int index) =0;

    /**
     * Must return a reference to the external events at position "index" in the external events list
     */
    virtual const ExternalEvents & GetExternalEvents (unsigned int index) const =0;

    /**
     * Must return the position of the external events called "name" in the external events list
     */
    virtual unsigned int GetExternalEventsPosition(const std::string & name) const =0;

    /**
     * Must return the number of external events.
     */
    virtual unsigned int GetExternalEventsCount() const =0;

    /**
     * Must add a new empty external events sheet called "name" at the specified position in the layout list.
     */
    virtual void InsertNewExternalEvents(std::string & name, unsigned int position) =0;

    /**
     * Must add a new external events sheet constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the external events passed as parameter.
     * \param externalEvents The external events that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the external events must be inserted at the end of the external events list.
     */
    virtual void InsertExternalEvents(const ExternalEvents & externalEvents, unsigned int position) =0;

    /**
     * Must delete external events named "name".
     */
    virtual void RemoveExternalEvents(const std::string & name) =0;

private:

    static std::vector < std::string > noPlatformExtensionsUsed;
};

}


#endif // GDCORE_PROJECT_H
