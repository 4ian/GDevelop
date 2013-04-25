/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_PLATFORM_H
#define GDCORE_PLATFORM_H
#include <boost/shared_ptr.hpp>
#include <vector>
#include <string>
#include <map>
#include "GDCore/PlatformDefinition/ChangesNotifier.h"
namespace gd { class InstructionsMetadataHolder; }
namespace gd { class Project; }
namespace gd { class Object; }
namespace gd { class Automatism; }
namespace gd { class AutomatismMetadata; }
namespace gd { class ObjectMetadata; }
namespace gd { class BaseEvent; }
namespace gd { class AutomatismsSharedData; }
namespace gd { class PlatformExtension; }

typedef void (*DestroyFunPtr)(gd::Object*);
typedef gd::Object * (*CreateFunPtr)(std::string name);

namespace gd
{

/**
 * \brief Base class for implementing a platform
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Platform
{
public:
    Platform();
    virtual ~Platform();

    /**
     * Must return the platform name
     */
    virtual std::string GetName() const { return "Unnamed platform"; }


    /** \name Extensions management
     * Member functions used to manage the extensions
     */
    ///@{

    /**
     * Add an extension to the manager.
     *
     * \note This method is virtual and can be redefined by platforms if they want to do special work when an extension is loaded.
     *
     * \see gd::ExtensionsLoader
     */
    virtual bool AddExtension(boost::shared_ptr<PlatformExtension> extension);

    /**
     * Return true if an extension with the same name is loaded
     */
    bool IsExtensionLoaded(const std::string & name) const;

    /**
     * Get an extension
     * @return Shared pointer to the extension
     */
    boost::shared_ptr<PlatformExtension> GetExtension(const std::string & name) const;

    /**
     * Get all extensions
     * @return Vector of Shared pointer containing all extensions
     */
    const std::vector < boost::shared_ptr<gd::PlatformExtension> > & GetAllPlatformExtensions() const { return extensionsLoaded; };

    ///@}

    /** \name Factory method
     * Member functions used to create the platforms objects
     */
    ///@{

    /**
     * Create an object of given type with the specified name.
     */
    boost::shared_ptr<gd::Object> CreateObject(std::string type, const std::string & name) const;

    /**
     * Create an automatism
     */
    gd::Automatism* CreateAutomatism(const std::string & type) const;

    /**
     * Create an automatism shared data object.
     */
    boost::shared_ptr<gd::AutomatismsSharedData> CreateAutomatismSharedDatas(const std::string & type) const;

    #if defined(GD_IDE_ONLY)
    /**
     * Create an event of given type
     */
    boost::shared_ptr<gd::BaseEvent> CreateEvent(const std::string & type) const;
    #endif

    ///@}

    #if defined(GD_IDE_ONLY)

    /** \name Notification of changes
     * The platform can do extra work when a change occurs by providing a special gd::ChangesNotifier
     */
    ///@{

    /**
     * Must provide a ChangesNotifier object that will be called by the IDE if needed.
     * The IDE is not supposed to store the returned object.
     *
     * The default implementation simply return a ChangesNotifier object doing nothing.
     */
    virtual ChangesNotifier & GetChangesNotifier() const { return defaultEmptyChangesNotifier; };
    ///@}

    /**
     * Called when the IDE is about to shut down: Take this opportunity for erasing
     * for example any temporary file.
     */
    virtual void OnIDEClosed() {};

    /**
     * Called when the IDE is initialized and ready to be used.
     */
    virtual void OnIDEInitialized() {};

    #endif

private:

    std::vector < boost::shared_ptr<PlatformExtension> >    extensionsLoaded; ///< Extensions of the platform
    std::map < std::string, CreateFunPtr >                  creationFunctionTable; ///< Creation functions for objects
    std::map < std::string, DestroyFunPtr >                 destroyFunctionTable; ///< Destroy functions for objects

    #if defined(GD_IDE_ONLY)
    static ChangesNotifier defaultEmptyChangesNotifier;
    #endif
};

}

#endif // GDCORE_PLATFORM_H
