/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef METADATAPROVIDER_H
#define METADATAPROVIDER_H
#include <GDCore/Utf8String.h>
#include "GDCore/Events/InstructionMetadata.h"
namespace gd { class AutomatismMetadata; }
namespace gd { class ObjectMetadata; }
namespace gd { class ExpressionMetadata; }
namespace gd { class ExpressionMetadata; }
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
    static const AutomatismMetadata & GetAutomatismMetadata(const gd::Platform & platform, gd::String automatismType);

    /**
     * Get the metadata about an object in a project using a platform
     */
    static const ObjectMetadata & GetObjectMetadata(const gd::Platform & platform, gd::String type);

    /**
     * Get the metadata of an action.
     * Must work for object, automatisms and static actions.
     */
    static const gd::InstructionMetadata & GetActionMetadata(const gd::Platform & platform, gd::String actionType);

    /**
     * Get the metadata of a condition.
     * Must Work for object, automatisms and static conditions.
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
     * Works for automatism expressions.
     */
    static const gd::ExpressionMetadata & GetAutomatismExpressionMetadata(const gd::Platform & platform, gd::String autoType, gd::String exprType);

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
     * Works for automatism expressions.
     */
    static const gd::ExpressionMetadata & GetAutomatismStrExpressionMetadata(const gd::Platform & platform, gd::String autoType, gd::String exprType);

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
     * Verifying if a ( Automatism ) action exists
     * @return true if the ( Automatism ) action exists
     */
    static bool HasAutomatismAction(const gd::Platform & platform, gd::String automatismType, gd::String name);

    /**
     * Verifying if a ( Automatism ) condition exists
     * @return true if the ( Automatism ) condition exists
     */
    static bool HasAutomatismCondition(const gd::Platform & platform, gd::String automatismType, gd::String name);

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
     * Verifying if a ( automatism ) expression exists
     * @return true if the ( automatism ) expression exists
     */
    static bool HasAutomatismExpression(const gd::Platform & platform, gd::String automatismType, gd::String name);

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
    static bool HasAutomatismStrExpression(const gd::Platform & platform, gd::String automatismType, gd::String name);

    virtual ~MetadataProvider();
private:
    MetadataProvider();

    static AutomatismMetadata badAutomatismInfo;
    static ObjectMetadata badObjectInfo;
    static gd::InstructionMetadata badInstructionMetadata;
    static gd::ExpressionMetadata badExpressionMetadata;
    static gd::ExpressionMetadata badStrExpressionMetadata;
    int useless; //Useless member to avoid emscripten "must have a positive integer typeid pointer" runtime error.
};

}

#endif // METADATAPROVIDER_H
