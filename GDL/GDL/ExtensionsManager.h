/**
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
class Object;

#if defined(GD_IDE_ONLY)
class Game;
class MainEditorCommand;
#endif

using namespace std;

namespace GDpriv
{

/**
 * ExtensionsManager manages extension, and provide useful things like :
 *
 * -Functions for creating an object ( from another or from a type ).
 * -Functions for getting pointers to actions/conditions functions.
 * -Convert typeId to type name and vice-versa.
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
         * Get a pointer to a ( static ) condition
         * @return Pointer to the condition, NULL if this latter does not exist.
         */
        InstructionFunPtr GetConditionFunctionPtr(string name) const;

        /**
         * Verifying if a ( object ) condition exists
         * @return true if the ( object ) condition exists
         */
        bool HasObjectCondition(unsigned int objectTypeId, string name) const;

        /**
         * Get a pointer to a ( object ) condition
         * @return Pointer to the condition, NULL if this latter does not exist.
         */
        InstructionObjectFunPtr GetObjectConditionFunctionPtr(unsigned int objectTypeId, string name) const;

        /**
         * Verifying if a ( automatism ) condition exists
         * @return true if the ( automatism ) condition exists
         */
        bool HasAutomatismCondition(unsigned int automatismTypeId, string name) const;

        /**
         * Get a pointer to a ( automatism ) condition
         * @return Pointer to the condition, NULL if this latter does not exist.
         */
        InstructionAutomatismFunPtr GetAutomatismConditionFunctionPtr(unsigned int automatismTypeId, string name) const;

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
         * Get a pointer to a ( static ) action
         * @return Pointer to the action, NULL if this latter does not exist.
         */
        InstructionFunPtr GetActionFunctionPtr(string name) const;

        /**
         * Verifying if a ( object ) action exists
         * @return true if the ( object ) action exists
         */
        bool HasObjectAction(unsigned int objectTypeId, string name) const;

        /**
         * Get a pointer to a ( object ) action
         * @return Pointer to the action, NULL if this latter does not exist.
         */
        InstructionObjectFunPtr GetObjectActionFunctionPtr(unsigned int objectTypeId, string name) const;

        /**
         * Verifying if a ( Automatism ) action exists
         * @return true if the ( Automatism ) action exists
         */
        bool HasAutomatismAction(unsigned int automatismTypeId, string name) const;

        /**
         * Get a pointer to a ( Automatism ) action
         * @return Pointer to the action, NULL if this latter does not exist.
         */
        InstructionAutomatismFunPtr GetAutomatismActionFunctionPtr(unsigned int automatismTypeId, string name) const;

        /**
         * Verifying if a ( static ) expression exists
         * @return true if the ( static ) expression exists
         */
        bool HasExpression(string name) const;

        /**
         * Get a pointer to a ( static ) expression
         * @return Pointer to the expression, NULL if this latter does not exist.
         */
        ExpressionFunPtr GetExpressionFunctionPtr(string name) const;

        /**
         * Verifying if a ( object ) expression exists
         * @return true if the ( object ) expression exists
         */
        bool HasObjectExpression(unsigned int objectTypeId, string name) const;

        /**
         * Get a pointer to a ( object ) expression
         * @return Pointer to the expression, NULL if this latter does not exist.
         */
        ExpressionObjectFunPtr GetObjectExpressionFunctionPtr(unsigned int objectTypeId, string name) const;

        /**
         * Verifying if a ( automatism ) expression exists
         * @return true if the ( automatism ) expression exists
         */
        bool HasAutomatismExpression(unsigned int automatismTypeId, string name) const;

        /**
         * Get a pointer to a ( automatism ) expression
         * @return Pointer to the expression, NULL if this latter does not exist.
         */
        ExpressionAutomatismFunPtr GetAutomatismExpressionFunctionPtr(unsigned int automatismTypeId, string name) const;

        /**
         * Verifying if a ( static ) string expression exists
         * @return true if the ( static ) string expression exists
         */
        bool HasStrExpression(string name) const;

        /**
         * Get a pointer to a ( static ) string expression
         * @return Pointer to the string expression, NULL if this latter does not exist.
         */
        StrExpressionFunPtr GetStrExpressionFunctionPtr(string name) const;

        /**
         * Verifying if a ( object ) string expression exists
         * @return true if the ( object ) string expression exists
         */
        bool HasObjectStrExpression(unsigned int objectTypeId, string name) const;

        /**
         * Get a pointer to a ( object ) string expression
         * @return Pointer to the string expression, NULL if this latter does not exist.
         */
        StrExpressionObjectFunPtr GetObjectStrExpressionFunctionPtr(unsigned int objectTypeId, string name) const;

        /**
         * Verifying if a ( object ) string expression exists
         * @return true if the ( object ) string expression exists
         */
        bool HasAutomatismStrExpression(unsigned int automatismTypeId, string name) const;

        /**
         * Get a pointer to a ( automatism ) string expression
         * @return Pointer to the string expression, NULL if this latter does not exist.
         */
        StrExpressionAutomatismFunPtr GetAutomatismStrExpressionFunctionPtr(unsigned int automatismTypeId, string name) const;

        /**
         * Return a shared_ptr to a new object.
         */
        boost::shared_ptr<Object> CreateObject(unsigned int typeId, std::string name);

        /**
         * Check if an event type is available
         */
        bool HasEventType(std::string evenType) const;

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

        /**
         * Get the typeId associated with a name
         * @return typeId ( 0 if not found )
         */
        inline unsigned int GetTypeIdFromString(std::string name)
        {
            if ( extObjectNameToTypeId.left.find(name) != extObjectNameToTypeId.left.end())
                return extObjectNameToTypeId.left.at(name);

            return 0;
        }

        /**
         * Get the name associated with a typeId
         * @return name ( "" if not found )
         */
        inline std::string GetStringFromTypeId(unsigned int typeId)
        {
            if ( extObjectNameToTypeId.right.find(typeId) != extObjectNameToTypeId.right.end())
                return extObjectNameToTypeId.right.at(typeId);

            return "";
        }

        static ExtensionsManager *getInstance()
        {
            if ( NULL == _singleton )
            {
                _singleton = new ExtensionsManager;
            }

            return ( static_cast<ExtensionsManager*>( _singleton ) );
        }

        static void kill()
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
        vector < CreateFunPtr >             creationFunctionTable;
        vector < DestroyFunPtr >            destroyFunctionTable;

        typedef boost::bimaps::bimap < string, unsigned int > StringToTypeIdBiMap;
        StringToTypeIdBiMap                 extObjectNameToTypeId;

        static InstructionInfos badInstructionInfos;
        static ExpressionInfos badExpressionInfos;
        static StrExpressionInfos badStrExpressionInfos;
        static AutomatismInfo badAutomatismInfo;

        static ExtensionsManager *_singleton;
};



}
#endif // EXTENSIONSMANAGER_H
