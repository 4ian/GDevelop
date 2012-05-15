/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_InstructionsMetadataHolder_H
#define GDCORE_InstructionsMetadataHolder_H
#include <string>
#include "GDCore/Events/InstructionMetadata.h"
namespace gd { class ExpressionMetadata; }
namespace gd { class StrExpressionMetadata; }

namespace gd
{

/**
 * \brief Deliver metadata for instructions ( i.e. Actions and conditions )
 *
 * \todo Enhance this class to avoid that each platform has to implement it.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API InstructionsMetadataHolder
{
public:
    InstructionsMetadataHolder();
    virtual ~InstructionsMetadataHolder();

    /**
     * Get the metadata of an action.
     * Must work for object, automatisms and static actions.
     */
    virtual const gd::InstructionMetadata & GetActionMetadata(std::string actionType) const =0;

    /**
     * Get the metadata of a condition.
     * Must Work for object, automatisms and static conditions.
     */
    virtual const gd::InstructionMetadata & GetConditionMetadata(std::string conditionType) const =0;

    /**
     * Get information about an expression from its type
     * Works for static expressions.
     */
    virtual const gd::ExpressionMetadata & GetExpressionMetadata(std::string exprType) const =0;

    /**
     * Get information about an expression from its type
     * Works for object expressions.
     */
    virtual const gd::ExpressionMetadata & GetObjectExpressionMetadata(std::string objectType, std::string exprType) const =0;

    /**
     * Get information about an expression from its type
     * Works for automatism expressions.
     */
    virtual const gd::ExpressionMetadata & GetAutomatismExpressionMetadata(std::string autoType, std::string exprType) const =0;

    /**
     * Get information about a string expression from its type
     * Works for static expressions.
     */
    virtual const gd::StrExpressionMetadata & GetStrExpressionMetadata(std::string exprType) const =0;

    /**
     * Get information about a string expression from its type
     * Works for object expressions.
     */
    virtual const gd::StrExpressionMetadata & GetObjectStrExpressionMetadata(std::string objectType, std::string exprType) const =0;

    /**
     * Get information about a string expression from its type
     * Works for automatism expressions.
     */
    virtual const gd::StrExpressionMetadata & GetAutomatismStrExpressionMetadata(std::string autoType, std::string exprType) const =0;

    /**
     * Verifying if a ( object ) action exists
     * @return true if the ( object ) action exists
     */
    virtual bool HasObjectAction(std::string objectType, std::string name) const =0;

    /**
     * Verifying if a ( Automatism ) action exists
     * @return true if the ( Automatism ) action exists
     */
    virtual bool HasAutomatismAction(std::string automatismType, std::string name) const =0;

    /**
     * Verifying if a ( static ) expression exists
     * @return true if the ( static ) expression exists
     */
    virtual bool HasExpression(std::string name) const =0;

    /**
     * Verifying if a ( object ) expression exists
     * @return true if the ( object ) expression exists
     */
    virtual bool HasObjectExpression(std::string objectType, std::string name) const =0;

    /**
     * Verifying if a ( automatism ) expression exists
     * @return true if the ( automatism ) expression exists
     */
    virtual bool HasAutomatismExpression(std::string automatismType, std::string name) const =0;

    /**
     * Verifying if a ( static ) string expression exists
     * @return true if the ( static ) string expression exists
     */
    virtual bool HasStrExpression(std::string name) const =0;

    /**
     * Verifying if a ( object ) string expression exists
     * @return true if the ( object ) string expression exists
     */
    virtual bool HasObjectStrExpression(std::string objectType, std::string name) const =0;

    /**
     * Verifying if a ( object ) string expression exists
     * @return true if the ( object ) string expression exists
     */
    virtual bool HasAutomatismStrExpression(std::string automatismType, std::string name) const =0;

protected:
    static gd::InstructionMetadata badInstructionMetadata;
};

}

#endif // GDCORE_InstructionsMetadataHolder_H
