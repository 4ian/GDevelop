#ifndef GDCORE_PLATFORMEXTENSION_H
#define GDCORE_PLATFORMEXTENSION_H
#include <map>
#include <string>
#include <vector>
class Instruction;
class InstructionMetadata;
class ExpressionMetadata;
class StrExpressionMetadata;
class ArbitraryResourceWorker;

namespace gd
{

class GD_CORE_API PlatformExtension
{
public:
    PlatformExtension();
    virtual ~PlatformExtension();

    /**
     * Get objects types provided by the extension
     */
    virtual std::vector < std::string > GetExtensionObjectsTypes() const = 0;

    /**
     * Get automatism types provided by the extension
     */
    virtual std::vector < std::string > GetAutomatismsTypes() const = 0;

    virtual const std::map<std::string, InstructionMetadata > & GetAllActions() const { return badActionsMetadata; };
    virtual const std::map<std::string, InstructionMetadata > & GetAllConditions() const { return badConditionsMetadata; };
    virtual const std::map<std::string, ExpressionMetadata > & GetAllExpressions() const { return badExpressionsMetadata; };
    virtual const std::map<std::string, StrExpressionMetadata > & GetAllStrExpressions() const { return badStrExpressionsMetadata; };
    virtual const std::map<std::string, InstructionMetadata > & GetAllActionsForObject(std::string objectType) const { return badActionsMetadata; };
    virtual const std::map<std::string, InstructionMetadata > & GetAllConditionsForObject(std::string objectType) const { return badConditionsMetadata; };
    virtual const std::map<std::string, ExpressionMetadata > & GetAllExpressionsForObject(std::string objectType) const { return badExpressionsMetadata; };
    virtual const std::map<std::string, StrExpressionMetadata > & GetAllStrExpressionsForObject(std::string objectType) const { return badStrExpressionsMetadata; };
    virtual const std::map<std::string, InstructionMetadata > & GetAllActionsForAutomatism(std::string autoType) const { return badActionsMetadata; };
    virtual const std::map<std::string, InstructionMetadata > & GetAllConditionsForAutomatism(std::string autoType) const { return badConditionsMetadata; };
    virtual const std::map<std::string, ExpressionMetadata > & GetAllExpressionsForAutomatism(std::string autoType) const { return badExpressionsMetadata; };
    virtual const std::map<std::string, StrExpressionMetadata > & GetAllStrExpressionsForAutomatism(std::string autoType) const { return badStrExpressionsMetadata; };

    /**
     * Called ( e.g. during compilation ) so as to inventory resources used by conditions and update their filename
     *
     * \see gd::PlatformExtension::ExposeActionsResources
     */
    virtual void ExposeConditionsResources(Instruction & condition, ArbitraryResourceWorker & worker) {};

    /**
     * Called ( e.g. during compilation ) so as to inventory resources used by actions and update their filename
     *
     * \see ArbitraryResourceWorker
     */
    virtual void ExposeActionsResources(Instruction & action, ArbitraryResourceWorker & worker) {};

private:

    static std::map<std::string, InstructionMetadata > badConditionsMetadata; ///< Used when a condition is not found in the extension
    static std::map<std::string, InstructionMetadata > badActionsMetadata;  ///< Used when an action is not found in the extension
    static std::map<std::string, ExpressionMetadata > badExpressionsMetadata; ///< Used when an expression is not found in the extension
    static std::map<std::string, StrExpressionMetadata > badStrExpressionsMetadata;///< Used when an expression is not found in the extension
};

}

#endif // GDCORE_PLATFORMEXTENSION_H
