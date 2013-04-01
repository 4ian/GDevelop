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
class Object;
class RuntimeObject;
class Automatism;
class ExtensionBase;
class RuntimeScene;
namespace gd { class InstructionMetadata;}
namespace gd { class ExpressionMetadata; }
namespace gd { class StrExpressionMetadata; }
class ExtensionObjectInfos;
class AutomatismInfo;
class AutomatismsSharedDatas;
namespace gd { class BaseEvent; }
typedef void (*DestroyFunPtr)(Object*);
typedef Object * (*CreateFunPtr)(std::string name);
typedef void (*DestroyRuntimeObjectFunPtr)(RuntimeObject*);
typedef RuntimeObject * (*CreateRuntimeObjectFunPtr)(RuntimeScene & scene, const Object & object);

#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/InstructionsMetadataHolder.h"
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
#if defined(GD_IDE_ONLY)
: public gd::InstructionsMetadataHolder
#endif
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
    boost::shared_ptr<Object> CreateObject(std::string type, std::string name);

    /**
     * Return a shared_ptr to a new runtime object created from \a object.
     */
    boost::shared_ptr<RuntimeObject> CreateRuntimeObject(RuntimeScene & scene, Object & object);

    /**
     * Create a new automatism of given type
     */
    Automatism* CreateAutomatism(std::string automatismType) const;

    /**
     * Create shared datas of the automatism of given type
     */
    boost::shared_ptr<AutomatismsSharedDatas> CreateAutomatismSharedDatas(std::string automatismType) const;

    #if defined(GD_IDE_ONLY)
    /**
     * Verifying if a ( static ) condition exists
     * @return true if the ( static ) condition exists
     */
    bool HasCondition(string name) const;

    /**
     * Verifying if a ( object ) condition exists
     * @return true if the ( object ) condition exists
     */
    bool HasObjectCondition(std::string objectType, string name) const;

    /**
     * Verifying if a ( automatism ) condition exists
     * @return true if the ( automatism ) condition exists
     */
    bool HasAutomatismCondition(std::string automatismType, string name) const;

    /**
     * Verifying if a ( static ) action exists
     * @return true if the ( static ) action exists
     */
    bool HasAction(string name) const;

    /**
     * Get information about an action from its type
     * Works for object, automatisms and static actions.
     */
    const gd::InstructionMetadata & GetActionMetadata(string actionType) const;

    /**
     * Get information about a condition from its type
     * Works for object, automatisms and static conditions.
     */
    const gd::InstructionMetadata & GetConditionMetadata(string conditionType) const;

    /**
     * Get information about an expression from its type
     * Works for static expressions.
     */
    const gd::ExpressionMetadata & GetExpressionMetadata(string exprType) const;

    /**
     * Get information about an expression from its type
     * Works for object expressions.
     */
    const gd::ExpressionMetadata & GetObjectExpressionMetadata(string objectType, string exprType) const;

    /**
     * Get information about an expression from its type
     * Works for automatism expressions.
     */
    const gd::ExpressionMetadata & GetAutomatismExpressionMetadata(string autoType, string exprType) const;

    /**
     * Get information about a string expression from its type
     * Works for static expressions.
     */
    const gd::StrExpressionMetadata & GetStrExpressionMetadata(string exprType) const;

    /**
     * Get information about a string expression from its type
     * Works for object expressions.
     */
    const gd::StrExpressionMetadata & GetObjectStrExpressionMetadata(string objectType, string exprType) const;

    /**
     * Get information about a string expression from its type
     * Works for automatism expressions.
     */
    const gd::StrExpressionMetadata & GetAutomatismStrExpressionMetadata(string autoType, string exprType) const;

    /**
     * Verifying if a ( object ) action exists
     * @return true if the ( object ) action exists
     */
    bool HasObjectAction(std::string objectType, string name) const;

    /**
     * Verifying if a ( Automatism ) action exists
     * @return true if the ( Automatism ) action exists
     */
    bool HasAutomatismAction(std::string automatismType, string name) const;

    /**
     * Verifying if a ( static ) expression exists
     * @return true if the ( static ) expression exists
     */
    bool HasExpression(string name) const;

    /**
     * Verifying if a ( object ) expression exists
     * @return true if the ( object ) expression exists
     */
    bool HasObjectExpression(std::string objectType, string name) const;

    /**
     * Verifying if a ( automatism ) expression exists
     * @return true if the ( automatism ) expression exists
     */
    bool HasAutomatismExpression(std::string automatismType, string name) const;

    /**
     * Verifying if a ( static ) string expression exists
     * @return true if the ( static ) string expression exists
     */
    bool HasStrExpression(string name) const;

    /**
     * Verifying if a ( object ) string expression exists
     * @return true if the ( object ) string expression exists
     */
    bool HasObjectStrExpression(std::string objectType, string name) const;

    /**
     * Verifying if a ( object ) string expression exists
     * @return true if the ( object ) string expression exists
     */
    bool HasAutomatismStrExpression(std::string automatismType, string name) const;

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

    /**
     * Get information about an automatism
     */
    const AutomatismInfo & GetAutomatismMetadata(std::string automatismType) const;

    /**
     * Get information about an object
     */
    const ExtensionObjectInfos & GetObjectMetadata(std::string type);
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

    #if defined(GD_IDE_ONLY)
    static gd::InstructionMetadata badInstructionMetadata;
    static gd::ExpressionMetadata badExpressionMetadata;
    static gd::StrExpressionMetadata badStrExpressionMetadata;
    #endif
    static AutomatismInfo badAutomatismInfo;
    static ExtensionObjectInfos badObjectInfo;

    static ExtensionsManager *_singleton;
};

#endif // EXTENSIONSMANAGER_H

