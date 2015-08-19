/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef METADATAPROVIDER_H
#define METADATAPROVIDER_H
#include "GDCore/String.h"
#include "GDCore/Events/InstructionMetadata.h"
namespace gd { class BehaviorMetadata; }
namespace gd { class ObjectMetadata; }
namespace gd { class ExpressionMetadata; }
namespace gd { class ExpressionMetadata; }
namespace gd { class Platform; }

namespace gd
{

/**
 * \brief Allow to easily get metadata for instructions (i.e actions and conditions),
 * objects and behaviors.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API MetadataProvider
{
public:

    /**
     * Get the metadata about a behavior in a project using a platform
     */
    static const BehaviorMetadata & GetBehaviorMetadata(const gd::Platform & platform, gd::String behaviorType);

    /**
     * Get the metadata about an object in a project using a platform
     */
    static const ObjectMetadata & GetObjectMetadata(const gd::Platform & platform, gd::String type);

    /**
     * Get the metadata of an action.
     * Must work for object, behaviors and static actions.
     */
    static const gd::InstructionMetadata & GetActionMetadata(const gd::Platform & platform, gd::String actionType);

    /**
     * Get the metadata of a condition.
     * Must Work for object, behaviors and static conditions.
     */
    static const gd::InstructionMetadata & GetConditionMetadata(const gd::Platform & platform, gd::String conditionType);

    /**
     * Get information about an expression from its type
     * Works for static expressions.
     */
    static const gd::ExpressionMetadata & GetExpressionMetadata(const gd::Platform & platform, gd::String exprType);

    /**
     * Get information about an expression from its type
     * Works for object expressions.
     */
    static const gd::ExpressionMetadata & GetObjectExpressionMetadata(const gd::Platform & platform, gd::String objectType, gd::String exprType);

    /**
     * Get information about an expression from its type
     * Works for behavior expressions.
     */
    static const gd::ExpressionMetadata & GetBehaviorExpressionMetadata(const gd::Platform & platform, gd::String autoType, gd::String exprType);

    /**
     * Get information about a gd::String expression from its type
     * Works for static expressions.
     */
    static const gd::ExpressionMetadata & GetStrExpressionMetadata(const gd::Platform & platform, gd::String exprType);

    /**
     * Get information about a gd::String expression from its type
     * Works for object expressions.
     */
    static const gd::ExpressionMetadata & GetObjectStrExpressionMetadata(const gd::Platform & platform, gd::String objectType, gd::String exprType);

    /**
     * Get information about a gd::String expression from its type
     * Works for behavior expressions.
     */
    static const gd::ExpressionMetadata & GetBehaviorStrExpressionMetadata(const gd::Platform & platform, gd::String autoType, gd::String exprType);

    /**
     * Verifying if a ( static ) condition exists
     * @return true if the ( static ) condition exists
     */
    static bool HasCondition(const gd::Platform & platform, gd::String name);

    /**
     * Verifying if a ( static ) action exists
     * @return true if the ( static ) action exists
     */
    static bool HasAction(const gd::Platform & platform, gd::String name);

    /**
     * Verifying if a ( object ) action exists
     * @return true if the ( object ) action exists
     */
    static bool HasObjectAction(const gd::Platform & platform, gd::String objectType, gd::String name);

    /**
     * Verifying if a ( object ) condition exists
     * @return true if the ( object ) condition exists
     */
    static bool HasObjectCondition(const gd::Platform & platform, gd::String objectType, gd::String name);

    /**
     * Verifying if a ( Behavior ) action exists
     * @return true if the ( Behavior ) action exists
     */
    static bool HasBehaviorAction(const gd::Platform & platform, gd::String behaviorType, gd::String name);

    /**
     * Verifying if a ( Behavior ) condition exists
     * @return true if the ( Behavior ) condition exists
     */
    static bool HasBehaviorCondition(const gd::Platform & platform, gd::String behaviorType, gd::String name);

    /**
     * Verifying if a ( static ) expression exists
     * @return true if the ( static ) expression exists
     */
    static bool HasExpression(const gd::Platform & platform, gd::String name);

    /**
     * Verifying if a ( object ) expression exists
     * @return true if the ( object ) expression exists
     */
    static bool HasObjectExpression(const gd::Platform & platform, gd::String objectType, gd::String name);

    /**
     * Verifying if a ( behavior ) expression exists
     * @return true if the ( behavior ) expression exists
     */
    static bool HasBehaviorExpression(const gd::Platform & platform, gd::String behaviorType, gd::String name);

    /**
     * Verifying if a ( static ) gd::String expression exists
     * @return true if the ( static ) gd::String expression exists
     */
    static bool HasStrExpression(const gd::Platform & platform, gd::String name);

    /**
     * Verifying if a ( object ) gd::String expression exists
     * @return true if the ( object ) gd::String expression exists
     */
    static bool HasObjectStrExpression(const gd::Platform & platform, gd::String objectType, gd::String name);

    /**
     * Verifying if a ( object ) gd::String expression exists
     * @return true if the ( object ) gd::String expression exists
     */
    static bool HasBehaviorStrExpression(const gd::Platform & platform, gd::String behaviorType, gd::String name);

    virtual ~MetadataProvider();
private:
    MetadataProvider();

    static BehaviorMetadata badBehaviorInfo;
    static ObjectMetadata badObjectInfo;
    static gd::InstructionMetadata badInstructionMetadata;
    static gd::ExpressionMetadata badExpressionMetadata;
    static gd::ExpressionMetadata badStrExpressionMetadata;
    int useless; //Useless member to avoid emscripten "must have a positive integer typeid pointer" runtime error.
};

}

#endif // METADATAPROVIDER_H
