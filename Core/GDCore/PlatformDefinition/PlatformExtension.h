/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

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

/**
 * \brief Base class for implementing platform's extensions.
 *
 * \todo Current implementation status: Used in some part of the IDE: Currently, the IDE automatically create the PlatformExtension classes of the GD C++ Platform when it is need.
 */
class GD_CORE_API PlatformExtension
{
public:
    PlatformExtension();
    virtual ~PlatformExtension();

    /**
     * Must return the name extension user friendly name.
     */
    virtual const std::string & GetFullName() const =0;

    /**
     * Must return the name of the extension
     */
    virtual const std::string & GetName() const =0;

    /**
     * Must return a description of the extension
     */
    virtual const std::string & GetDescription() const =0;

    /**
     * Must return the name of the extension developer
     */
    virtual const std::string & GetAuthor() const =0;

    /**
     * Must return the name of extension license
     */
    virtual const std::string & GetLicense() const =0;

    /**
     * Must return true if the extension is a standard extension that cannot be deactivated
     */
    virtual bool IsBuiltin() const =0;

    /**
     * Must return a vector containing all the object types provided by the extension
     */
    virtual std::vector < std::string > GetExtensionObjectsTypes() const = 0;

    /**
     * Must return a vector containing all the automatism types provided by the extension
     */
    virtual std::vector < std::string > GetAutomatismsTypes() const = 0;

    /**
     * Must return a reference to a map containing the names of the actions (in the first members) and the metadata associated with (in the second members).
     *
     * \note Typically, a such map is stored by the extension and filled when loading the extension.
     */
    virtual const std::map<std::string, InstructionMetadata > & GetAllActions() const { return badActionsMetadata; };

    /**
     * \see gd::PlatformExtension::GetAllActions
     */
    virtual const std::map<std::string, InstructionMetadata > & GetAllConditions() const { return badConditionsMetadata; };

    /**
     * \see gd::PlatformExtension::GetAllActions
     */
    virtual const std::map<std::string, ExpressionMetadata > & GetAllExpressions() const { return badExpressionsMetadata; };

    /**
     * \see gd::PlatformExtension::GetAllActions
     */
    virtual const std::map<std::string, StrExpressionMetadata > & GetAllStrExpressions() const { return badStrExpressionsMetadata; };

    /**
     * Must return a reference to a map containing the names of the actions, related to the object type, and the metadata associated with.
     *
     * \note Typically, a such map is stored by the extension and filled when loading the extension.
     */
    virtual const std::map<std::string, InstructionMetadata > & GetAllActionsForObject(std::string objectType) const { return badActionsMetadata; };

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    virtual const std::map<std::string, InstructionMetadata > & GetAllConditionsForObject(std::string objectType) const { return badConditionsMetadata; };

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    virtual const std::map<std::string, ExpressionMetadata > & GetAllExpressionsForObject(std::string objectType) const { return badExpressionsMetadata; };

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    virtual const std::map<std::string, StrExpressionMetadata > & GetAllStrExpressionsForObject(std::string objectType) const { return badStrExpressionsMetadata; };

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    virtual const std::map<std::string, InstructionMetadata > & GetAllActionsForAutomatism(std::string autoType) const { return badActionsMetadata; };

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    virtual const std::map<std::string, InstructionMetadata > & GetAllConditionsForAutomatism(std::string autoType) const { return badConditionsMetadata; };

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    virtual const std::map<std::string, ExpressionMetadata > & GetAllExpressionsForAutomatism(std::string autoType) const { return badExpressionsMetadata; };

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
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
