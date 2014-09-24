/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef METADATAPROVIDER_H
#define METADATAPROVIDER_H
#include <string>
#include "GDCore/Events/InstructionMetadata.h"
namespace gd { class AutomatismMetadata; }
namespace gd { class ObjectMetadata; }
namespace gd { class ExpressionMetadata; }
namespace gd { class ExpressionMetadata; }
namespace gd { class StrExpressionMetadata; }
namespace gd { class Platform; }

namespace gd
{

/**
 * \brief Deliver metadata for instructions ( i.e. Actions and conditions )
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API MetadataProvider
{
public:

    /**
     * Get the metadata about an automatism in a project using a platform
     */
    static const AutomatismMetadata & GetAutomatismMetadata(const gd::Platform & platform, std::string automatismType);

    /**
     * Get the metadata about an object in a project using a platform
     */
    static const ObjectMetadata & GetObjectMetadata(const gd::Platform & platform, std::string type);

    /**
     * Get the metadata of an action.
     * Must work for object, automatisms and static actions.
     */
    static const gd::InstructionMetadata & GetActionMetadata(const gd::Platform & platform, std::string actionType);

    /**
     * Get the metadata of a condition.
     * Must Work for object, automatisms and static conditions.
     */
    static const gd::InstructionMetadata & GetConditionMetadata(const gd::Platform & platform, std::string conditionType);

    /**
     * Get information about an expression from its type
     * Works for static expressions.
     */
    static const gd::ExpressionMetadata & GetExpressionMetadata(const gd::Platform & platform, std::string exprType);

    /**
     * Get information about an expression from its type
     * Works for object expressions.
     */
    static const gd::ExpressionMetadata & GetObjectExpressionMetadata(const gd::Platform & platform, std::string objectType, std::string exprType);

    /**
     * Get information about an expression from its type
     * Works for automatism expressions.
     */
    static const gd::ExpressionMetadata & GetAutomatismExpressionMetadata(const gd::Platform & platform, std::string autoType, std::string exprType);

    /**
     * Get information about a string expression from its type
     * Works for static expressions.
     */
    static const gd::StrExpressionMetadata & GetStrExpressionMetadata(const gd::Platform & platform, std::string exprType);

    /**
     * Get information about a string expression from its type
     * Works for object expressions.
     */
    static const gd::StrExpressionMetadata & GetObjectStrExpressionMetadata(const gd::Platform & platform, std::string objectType, std::string exprType);

    /**
     * Get information about a string expression from its type
     * Works for automatism expressions.
     */
    static const gd::StrExpressionMetadata & GetAutomatismStrExpressionMetadata(const gd::Platform & platform, std::string autoType, std::string exprType);

    /**
     * Verifying if a ( static ) condition exists
     * @return true if the ( static ) condition exists
     */
    static bool HasCondition(const gd::Platform & platform, std::string name);

    /**
     * Verifying if a ( static ) action exists
     * @return true if the ( static ) action exists
     */
    static bool HasAction(const gd::Platform & platform, std::string name);

    /**
     * Verifying if a ( object ) action exists
     * @return true if the ( object ) action exists
     */
    static bool HasObjectAction(const gd::Platform & platform, std::string objectType, std::string name);

    /**
     * Verifying if a ( object ) condition exists
     * @return true if the ( object ) condition exists
     */
    static bool HasObjectCondition(const gd::Platform & platform, std::string objectType, std::string name);

    /**
     * Verifying if a ( Automatism ) action exists
     * @return true if the ( Automatism ) action exists
     */
    static bool HasAutomatismAction(const gd::Platform & platform, std::string automatismType, std::string name);

    /**
     * Verifying if a ( Automatism ) condition exists
     * @return true if the ( Automatism ) condition exists
     */
    static bool HasAutomatismCondition(const gd::Platform & platform, std::string automatismType, std::string name);

    /**
     * Verifying if a ( static ) expression exists
     * @return true if the ( static ) expression exists
     */
    static bool HasExpression(const gd::Platform & platform, std::string name);

    /**
     * Verifying if a ( object ) expression exists
     * @return true if the ( object ) expression exists
     */
    static bool HasObjectExpression(const gd::Platform & platform, std::string objectType, std::string name);

    /**
     * Verifying if a ( automatism ) expression exists
     * @return true if the ( automatism ) expression exists
     */
    static bool HasAutomatismExpression(const gd::Platform & platform, std::string automatismType, std::string name);

    /**
     * Verifying if a ( static ) string expression exists
     * @return true if the ( static ) string expression exists
     */
    static bool HasStrExpression(const gd::Platform & platform, std::string name);

    /**
     * Verifying if a ( object ) string expression exists
     * @return true if the ( object ) string expression exists
     */
    static bool HasObjectStrExpression(const gd::Platform & platform, std::string objectType, std::string name);

    /**
     * Verifying if a ( object ) string expression exists
     * @return true if the ( object ) string expression exists
     */
    static bool HasAutomatismStrExpression(const gd::Platform & platform, std::string automatismType, std::string name);

    virtual ~MetadataProvider();
private:
    MetadataProvider();

    static AutomatismMetadata badAutomatismInfo;
    static ObjectMetadata badObjectInfo;
    static gd::InstructionMetadata badInstructionMetadata;
    static gd::ExpressionMetadata badExpressionMetadata;
    static gd::StrExpressionMetadata badStrExpressionMetadata;
    int useless; //Useless member to avoid emscripten "must have a positive integer typeid pointer" runtime error.
};

}

#endif // METADATAPROVIDER_H
