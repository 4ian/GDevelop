/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EXTENSIONSMANAGER_H
#define EXTENSIONSMANAGER_H
#include <string>
#include <iostream>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
#include <boost/bimap/bimap.hpp>
#undef CreateEvent //Thanks windows.h
namespace gd { class Object; }
class RuntimeObject;
namespace gd { class Automatism; }; typedef gd::Automatism Automatism;
class ExtensionBase;
class RuntimeScene;
namespace gd { class InstructionMetadata;}
namespace gd { class ExpressionMetadata; }
namespace gd { class StrExpressionMetadata; }
class ExtensionObjectInfos;
class AutomatismInfo;
namespace gd { class AutomatismsSharedData; }
namespace gd { class BaseEvent; }
typedef void (*DestroyFunPtr)(gd::Object*);
typedef gd::Object * (*CreateFunPtr)(std::string name);
typedef void (*DestroyRuntimeObjectFunPtr)(RuntimeObject*);
typedef RuntimeObject * (*CreateRuntimeObjectFunPtr)(RuntimeScene & scene, const gd::Object & object);

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/MetadataProvider.h"
class Game;
namespace gd { class MainFrameWrapper; }
#endif

using namespace std;

/**
 * \brief Internal class managing extensions.
 *
 * ExtensionsManager manages extensions, and provide useful things like :
 * - Functions for creating an object ( from another or from a type ).
 * - Functions for getting pointers to actions/conditions functions.
 */
class GD_API ExtensionsManager
{
public:

    /** \name Extensions management
     * Member functions used to manage the extensions
     */
    ///@{

    /**
     * Add an extension to the manager.
     * \see ExtensionsLoader
     */
    bool AddExtension(boost::shared_ptr<ExtensionBase> extension);

    /**
     * Return true if an extension with the same name is loaded
     */
    bool IsExtensionLoaded(string name) const;

    /**
     * Get an extension
     * @return Shared pointer to the extension
     */
    boost::shared_ptr<ExtensionBase> GetExtension(string name) const;

    /**
     * Get all extensions
     * @return Vector of Shared pointer containing all extensions
     */
    inline const vector < boost::shared_ptr<ExtensionBase> > & GetExtensions() const { return extensionsLoaded; };

    ///@}

    /** \name Extensions features
     * Member functions providing access to extensions features
     */
    ///@{

    /**
     * Return a shared_ptr to a new object.
     */
    boost::shared_ptr<gd::Object> CreateObject(std::string type, std::string name);

    /**
     * Return a shared_ptr to a new runtime object created from \a object.
     */
    boost::shared_ptr<RuntimeObject> CreateRuntimeObject(RuntimeScene & scene, gd::Object & object);

    /**
     * Create a new automatism of given type
     */
    Automatism* CreateAutomatism(std::string automatismType) const;

    /**
     * Create shared datas of the automatism of given type
     */
    boost::shared_ptr<gd::AutomatismsSharedData> CreateAutomatismSharedDatas(std::string automatismType) const;

    #if defined(GD_IDE_ONLY)
    /**
     * Check if an event type is available
     */
    bool HasEventType(std::string eventType) const;

    /**
     * Create a new event of given type
     */
    boost::shared_ptr<gd::BaseEvent> CreateEvent(std::string eventType) const;

    /**
     * Check if an automatism type is available
     */
    bool HasAutomatism(std::string automatism) const;
    #endif

    ///@}

    static ExtensionsManager *GetInstance()
    {
        if ( NULL == _singleton )
        {
            _singleton = new ExtensionsManager;
        }

        return ( static_cast<ExtensionsManager*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

private:
    ExtensionsManager();
    virtual ~ExtensionsManager() {};

    std::vector < boost::shared_ptr<ExtensionBase> > extensionsLoaded;
    std::map < std::string, CreateFunPtr >           creationFunctionTable;
    std::map < std::string, DestroyFunPtr >          destroyFunctionTable;
    std::map < std::string, CreateRuntimeObjectFunPtr > runtimeObjCreationFunctionTable;
    std::map < std::string, DestroyRuntimeObjectFunPtr > runtimeObjDestroyFunctionTable;

    static ExtensionsManager *_singleton;
};

#endif // EXTENSIONSMANAGER_H

