/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EXTENSIONSMANAGER_H
#define EXTENSIONSMANAGER_H
#include "GDL/ExtensionBase.h"
#include <string>
#include <iostream>
#include <vector>
#include <boost/shared_ptr.hpp>
#include <boost/bimap/bimap.hpp>
#undef CreateEvent //Thanks windows.h
class Object;

#if defined(GD_IDE_ONLY)
class Game;
class MainEditorCommand;
#endif

using namespace std;

namespace GDpriv
{

/**
 * \brief Internal class managing static extensions.
 *
 * ExtensionsManager manages static extensions, and provide useful things like :
 * - Functions for creating an object ( from another or from a type ).
 * - Functions for getting pointers to actions/conditions functions.
 */
class GD_API ExtensionsManager
{
    public:

        /**
         * Add an extension to the manager
         */
        bool AddExtension(boost::shared_ptr<ExtensionBase> extension);

        /**
         * Return true if an extension with the sam name is loaded
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
        const InstructionInfos & GetActionInfos(string actionType) const;

        /**
         * Get information about a condition from its type
         * Works for object, automatisms and static conditions.
         */
        const InstructionInfos & GetConditionInfos(string conditionType) const;

        /**
         * Get information about an expression from its type
         * Works for static expressions.
         */
        const ExpressionInfos & GetExpressionInfos(string exprType) const;

        /**
         * Get information about an expression from its type
         * Works for object expressions.
         */
        const ExpressionInfos & GetObjectExpressionInfos(string objectType, string exprType) const;

        /**
         * Get information about an expression from its type
         * Works for automatism expressions.
         */
        const ExpressionInfos & GetAutomatismExpressionInfos(string autoType, string exprType) const;

        /**
         * Get information about a string expression from its type
         * Works for static expressions.
         */
        const StrExpressionInfos & GetStrExpressionInfos(string exprType) const;

        /**
         * Get information about a string expression from its type
         * Works for object expressions.
         */
        const StrExpressionInfos & GetObjectStrExpressionInfos(string objectType, string exprType) const;

        /**
         * Get information about a string expression from its type
         * Works for automatism expressions.
         */
        const StrExpressionInfos & GetAutomatismStrExpressionInfos(string autoType, string exprType) const;

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
         * Return a shared_ptr to a new object.
         */
        boost::shared_ptr<Object> CreateObject(std::string type, std::string name);

        #if defined(GD_IDE_ONLY)
        /**
         * Get information about an object
         */
        const ExtensionObjectInfos & GetObjectInfo(std::string type);
        #endif

        /**
         * Check if an event type is available
         */
        bool HasEventType(std::string eventType) const;

        /**
         * Create a new event of given type
         */
        boost::shared_ptr<BaseEvent> CreateEvent(std::string eventType) const;

        /**
         * Check if an automatism type is available
         */
        bool HasAutomatism(std::string automatism) const;

        /**
         * Get information about an automatism
         */
        const AutomatismInfo & GetAutomatismInfo(std::string automatismType) const;

        /**
         * Create a new automatism of given type
         */
        boost::shared_ptr<Automatism> CreateAutomatism(std::string automatismType) const;

        /**
         * Create shared datas of the automatism of given type
         */
        boost::shared_ptr<AutomatismsSharedDatas> CreateAutomatismSharedDatas(std::string automatismType) const;

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

        vector < boost::shared_ptr<ExtensionBase> > extensionsLoaded;
        map < std::string, CreateFunPtr >             creationFunctionTable;
        map < std::string, DestroyFunPtr >            destroyFunctionTable;

        static InstructionInfos badInstructionInfos;
        static ExpressionInfos badExpressionInfos;
        static StrExpressionInfos badStrExpressionInfos;
        static AutomatismInfo badAutomatismInfo;
        static ExtensionObjectInfos badObjectInfo;

        static ExtensionsManager *_singleton;
};



}
#endif // EXTENSIONSMANAGER_H
