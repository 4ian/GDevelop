#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"

#include <algorithm>
#include <utility>

#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/ObjectsContainersList.h"
#include "GDCore/Project/Project.h"

using namespace std;

namespace gd {

/**
 * Generate call using a relational operator.
 * Relational operator position is deduced from parameters type.
 * Rhs hand side expression is assumed to be placed just before the relational
 * operator.
 *
 * \param Information about the instruction
 * \param Arguments, in their C++ form.
 * \param String to be placed at the start of the call ( the function to be
 * called typically ). Example : MyObject->Get \param Arguments will be
 * generated starting from this number. For example, set this to 1 to skip the
 * first argument.
 */
gd::String EventsCodeGenerator::GenerateRelationalOperatorCall(
    const gd::InstructionMetadata& instrInfos,
    const vector<gd::String>& arguments,
    const gd::String& callStartString,
    std::size_t startFromArgument) {
  std::size_t relationalOperatorIndex = instrInfos.parameters.size();
  for (std::size_t i = startFromArgument; i < instrInfos.parameters.size();
       ++i) {
    if (instrInfos.parameters[i].GetType() == "relationalOperator")
      relationalOperatorIndex = i;
  }
  // Ensure that there is at least one parameter after the relational operator
  if (relationalOperatorIndex + 1 >= instrInfos.parameters.size()) {
    ReportError();
    return "";
  }

  gd::String relationalOperator = arguments[relationalOperatorIndex];
  if (relationalOperator.size() > 2)
    relationalOperator = relationalOperator.substr(
        1,
        relationalOperator.length() - 1 -
            1);  // Relational operator contains quote which must be removed.

  gd::String rhs = arguments[relationalOperatorIndex + 1];
  gd::String argumentsStr;
  for (std::size_t i = startFromArgument; i < arguments.size(); ++i) {
    if (i != relationalOperatorIndex && i != relationalOperatorIndex + 1) {
      if (!argumentsStr.empty()) argumentsStr += ", ";
      argumentsStr += arguments[i];
    }
  }

  auto lhs = callStartString + "(" + argumentsStr + ")";
  return GenerateRelationalOperation(relationalOperator, lhs, rhs);
}

/**
 * @brief Generate a relational operation
 * 
 * @param relationalOperator the operator
 * @param lhs the left hand operand
 * @param rhs the right hand operand
 * @return gd::String 
 */
gd::String EventsCodeGenerator::GenerateRelationalOperation(
    const gd::String& relationalOperator,
    const gd::String& lhs,
    const gd::String& rhs) {
  return lhs + " " + GenerateRelationalOperatorCodes(relationalOperator) + " " + rhs;
}

const gd::String EventsCodeGenerator::GenerateRelationalOperatorCodes(const gd::String &operatorString) {
    if (operatorString == "=") {
        return "==";
    }
    if (operatorString != "<" && operatorString != ">" &&
        operatorString != "<=" && operatorString != ">=" && operatorString != "!=" &&
        operatorString != "startsWith" && operatorString != "endsWith" && operatorString != "contains") {
      cout << "Warning: Bad relational operator: Set to == by default." << endl;
      return "==";
    }
    return operatorString;
}

/**
 * Generate call using an operator ( =,+,-,*,/ ).
 * Operator position is deduced from parameters type.
 * Expression is assumed to be placed just before the operator.
 *
 * \param Information about the instruction
 * \param Arguments, in their C++ form.
 * \param String to be placed at the start of the call ( the function to be
 * called typically ). Example : MyObject->Set \param String to be placed at the
 * start of the call of the getter ( the "getter" function to be called
 * typically ). Example : MyObject->Get \param Arguments will be generated
 * starting from this number. For example, set this to 1 to skip the first
 * argument.
 */
gd::String EventsCodeGenerator::GenerateOperatorCall(
    const gd::InstructionMetadata& instrInfos,
    const vector<gd::String>& arguments,
    const gd::String& callStartString,
    const gd::String& getterStartString,
    std::size_t startFromArgument) {
  std::size_t operatorIndex = instrInfos.parameters.size();
  for (std::size_t i = startFromArgument; i < instrInfos.parameters.size();
       ++i) {
    if (instrInfos.parameters[i].GetType() == "operator") operatorIndex = i;
  }

  // Ensure that there is at least one parameter after the operator
  if (operatorIndex + 1 >= instrInfos.parameters.size()) {
    ReportError();
    return "";
  }

  gd::String operatorStr = arguments[operatorIndex];
  if (operatorStr.size() > 2)
    operatorStr = operatorStr.substr(
        1,
        operatorStr.length() - 1 -
            1);  // Operator contains quote which must be removed.

  gd::String rhs = arguments[operatorIndex + 1];

  // Generate arguments for calling the "getter" function
  gd::String getterArgumentsStr;
  for (std::size_t i = startFromArgument; i < arguments.size(); ++i) {
    if (i != operatorIndex && i != operatorIndex + 1) {
      if (!getterArgumentsStr.empty()) getterArgumentsStr += ", ";
      getterArgumentsStr += arguments[i];
    }
  }

  // Generate arguments for calling the function ("setter")
  gd::String argumentsStr;
  for (std::size_t i = startFromArgument; i < arguments.size(); ++i) {
    if (i != operatorIndex &&
        i != operatorIndex + 1)  // Generate classic arguments
    {
      if (!argumentsStr.empty()) argumentsStr += ", ";
      argumentsStr += arguments[i];
    }
    if (i == operatorIndex + 1) {
      if (!argumentsStr.empty()) argumentsStr += ", ";
      if (operatorStr != "=")
        argumentsStr += getterStartString + "(" + getterArgumentsStr + ") " +
                        operatorStr + " (" + rhs + ")";
      else
        argumentsStr += rhs;
    }
  }

  return callStartString + "(" + argumentsStr + ")";
}

/**
 * Generate call using a compound assignment operators ( =,+=,-=,*=,/= ).
 * Operator position is deduced from parameters type.
 * Expression is assumed to be placed just before the operator.
 *
 * \param Information about the instruction
 * \param Arguments, in their C++ form.
 * \param String to be placed at the start of the call ( the function to be
 * called typically ). Example : MyObject->Set \param Arguments will be
 * generated starting from this number. For example, set this to 1 to skip the
 * first argument.
 */
gd::String EventsCodeGenerator::GenerateCompoundOperatorCall(
    const gd::InstructionMetadata& instrInfos,
    const vector<gd::String>& arguments,
    const gd::String& callStartString,
    std::size_t startFromArgument) {
  std::size_t operatorIndex = instrInfos.parameters.size();
  for (std::size_t i = startFromArgument; i < instrInfos.parameters.size();
       ++i) {
    if (instrInfos.parameters[i].GetType() == "operator") operatorIndex = i;
  }

  // Ensure that there is at least one parameter after the operator
  if (operatorIndex + 1 >= instrInfos.parameters.size()) {
    ReportError();
    return "";
  }

  gd::String operatorStr = arguments[operatorIndex];
  if (operatorStr.size() > 2)
    operatorStr = operatorStr.substr(
        1,
        operatorStr.length() - 1 -
            1);  // Operator contains quote which must be removed.

  gd::String rhs = arguments[operatorIndex + 1];

  // Generate real operator string.
  if (operatorStr == "+")
    operatorStr = "+=";
  else if (operatorStr == "-")
    operatorStr = "-=";
  else if (operatorStr == "/")
    operatorStr = "/=";
  else if (operatorStr == "*")
    operatorStr = "*=";

  // Generate arguments for calling the function ("setter")
  gd::String argumentsStr;
  for (std::size_t i = startFromArgument; i < arguments.size(); ++i) {
    if (i != operatorIndex &&
        i != operatorIndex + 1)  // Generate classic arguments
    {
      if (!argumentsStr.empty()) argumentsStr += ", ";
      argumentsStr += arguments[i];
    }
  }

  return callStartString + "(" + argumentsStr + ") " + operatorStr + " (" +
         rhs + ")";
}

gd::String EventsCodeGenerator::GenerateMutatorCall(
    const gd::InstructionMetadata& instrInfos,
    const vector<gd::String>& arguments,
    const gd::String& callStartString,
    std::size_t startFromArgument) {
  std::size_t operatorIndex = instrInfos.parameters.size();
  for (std::size_t i = startFromArgument; i < instrInfos.parameters.size();
       ++i) {
    if (instrInfos.parameters[i].GetType() == "operator") operatorIndex = i;
  }

  // Ensure that there is at least one parameter after the operator
  if (operatorIndex + 1 >= instrInfos.parameters.size()) {
    ReportError();
    return "";
  }

  gd::String operatorStr = arguments[operatorIndex];
  if (operatorStr.size() > 2)
    operatorStr = operatorStr.substr(
        1,
        operatorStr.length() - 1 -
            1);  // Operator contains quote which must be removed.

  auto mutators = instrInfos.codeExtraInformation.optionalMutators;
  auto mutator = mutators.find(operatorStr);
  if (mutator == mutators.end()) {
    ReportError();
    return "";
  }

  gd::String rhs = arguments[operatorIndex + 1];

  // Generate arguments for calling the mutator
  gd::String argumentsStr;
  for (std::size_t i = startFromArgument; i < arguments.size(); ++i) {
    if (i != operatorIndex &&
        i != operatorIndex + 1)  // Generate classic arguments
    {
      if (!argumentsStr.empty()) argumentsStr += ", ";
      argumentsStr += arguments[i];
    }
  }

  return callStartString + "(" + argumentsStr + ")." + mutator->second + "(" +
         rhs + ")";
}

gd::String EventsCodeGenerator::GenerateConditionCode(
    gd::Instruction& condition,
    gd::String returnBoolean,
    EventsCodeGenerationContext& context) {
  gd::String conditionCode;

  const gd::InstructionMetadata& instrInfos =
      MetadataProvider::GetConditionMetadata(platform, condition.GetType());
  if (MetadataProvider::IsBadInstructionMetadata(instrInfos)) {
    return "/* Unknown instruction - skipped. */";
  }

  AddIncludeFiles(instrInfos.GetIncludeFiles());
  maxConditionsListsSize =
      std::max(maxConditionsListsSize, condition.GetSubInstructions().size());

  if (instrInfos.HasCustomCodeGenerator()) {
    context.EnterCustomCondition();
    conditionCode += instrInfos.codeExtraInformation.customCodeGenerator(
        condition, *this, context);
    maxCustomConditionsDepth =
        std::max(maxCustomConditionsDepth, context.GetCurrentConditionDepth());
    context.LeaveCustomCondition();

    return "{" + conditionCode + "}\n";
  }

  // Insert code only parameters and be sure there is no lack of parameter.
  while (condition.GetParameters().size() < instrInfos.parameters.size()) {
    vector<gd::Expression> parameters = condition.GetParameters();
    parameters.push_back(gd::Expression(""));
    condition.SetParameters(parameters);
  }

  // Verify that there are no mismatches between object type in parameters.
  for (std::size_t pNb = 0; pNb < instrInfos.parameters.size(); ++pNb) {
    if (ParameterMetadata::IsObject(instrInfos.parameters[pNb].GetType())) {
      gd::String objectInParameter =
          condition.GetParameter(pNb).GetPlainString();

      if (!GetObjectsContainersList().HasObjectOrGroupNamed(objectInParameter)) {
        return "/* Unknown object - skipped. */";
      } else if (!instrInfos.parameters[pNb].GetExtraInfo().empty() &&
                GetObjectsContainersList().GetTypeOfObject(objectInParameter) !=
                     instrInfos.parameters[pNb].GetExtraInfo()) {
        return "/* Mismatched object type - skipped. */";
      }
    }
  }

  if (instrInfos.IsObjectInstruction()) {
    gd::String objectName = condition.GetParameter(0).GetPlainString();
    if (!objectName.empty() && !instrInfos.parameters.empty()) {
      std::vector<gd::String> realObjects =
          GetObjectsContainersList().ExpandObjectName(objectName, context.GetCurrentObject());
      for (std::size_t i = 0; i < realObjects.size(); ++i) {
        // Set up the context
        gd::String objectType = GetObjectsContainersList().GetTypeOfObject(realObjects[i]);
        const ObjectMetadata& objInfo =
            MetadataProvider::GetObjectMetadata(platform, objectType);

          AddIncludeFiles(objInfo.includeFiles);
          context.SetCurrentObject(realObjects[i]);
          context.ObjectsListNeeded(realObjects[i]);

          // Prepare arguments and generate the condition whole code
          vector<gd::String> arguments = GenerateParametersCodes(
              condition.GetParameters(), instrInfos.parameters, context);
          conditionCode += GenerateObjectCondition(realObjects[i],
                                                   objInfo,
                                                   arguments,
                                                   instrInfos,
                                                   returnBoolean,
                                                   condition.IsInverted(),
                                                   context);

          context.SetNoCurrentObject();
      }
    }
  } else if (instrInfos.IsBehaviorInstruction()) {
    gd::String objectName = condition.GetParameter(0).GetPlainString();
    gd::String behaviorType = GetObjectsContainersList().GetTypeOfBehavior(condition.GetParameter(1).GetPlainString());
    if (instrInfos.parameters.size() >= 2) {
      std::vector<gd::String> realObjects =
          GetObjectsContainersList().ExpandObjectName(objectName, context.GetCurrentObject());
      for (std::size_t i = 0; i < realObjects.size(); ++i) {
        // Setup context
        const BehaviorMetadata& autoInfo =
            MetadataProvider::GetBehaviorMetadata(platform, behaviorType);
        AddIncludeFiles(autoInfo.includeFiles);
        context.SetCurrentObject(realObjects[i]);
        context.ObjectsListNeeded(realObjects[i]);

        // Prepare arguments and generate the whole condition code
        vector<gd::String> arguments = GenerateParametersCodes(
            condition.GetParameters(), instrInfos.parameters, context);
        conditionCode += GenerateBehaviorCondition(
            realObjects[i],
            condition.GetParameter(1).GetPlainString(),
            autoInfo,
            arguments,
            instrInfos,
            returnBoolean,
            condition.IsInverted(),
            context);

        context.SetNoCurrentObject();
      }
    }
  } else {
    std::vector<std::pair<gd::String, gd::String> >
        supplementaryParametersTypes;
    supplementaryParametersTypes.push_back(std::make_pair(
        "conditionInverted", condition.IsInverted() ? "true" : "false"));
    vector<gd::String> arguments =
        GenerateParametersCodes(condition.GetParameters(),
                                instrInfos.parameters,
                                context,
                                &supplementaryParametersTypes);

    conditionCode += GenerateFreeCondition(
        arguments, instrInfos, returnBoolean, condition.IsInverted(), context);
  }

  return conditionCode;
}

/**
 * Generate code for a list of conditions.
 * Bools containing conditions results are named conditionXIsTrue.
 */
gd::String EventsCodeGenerator::GenerateConditionsListCode(
    gd::InstructionsList& conditions, EventsCodeGenerationContext& context) {
  gd::String outputCode;

  for (std::size_t i = 0; i < conditions.size(); ++i)
    outputCode += GenerateBooleanInitializationToFalse(
        "condition" + gd::String::From(i) + "IsTrue", context);

  for (std::size_t cId = 0; cId < conditions.size(); ++cId) {
    gd::String conditionCode =
        GenerateConditionCode(conditions[cId],
                              "condition" + gd::String::From(cId) + "IsTrue",
                              context);
    if (!conditions[cId].GetType().empty()) {
      for (std::size_t i = 0; i < cId;
           ++i)  // Skip conditions if one condition is false. //TODO : Can be
                 // optimized
      {
        if (i == 0)
          outputCode += "if ( ";
        else
          outputCode += " && ";
        outputCode += "condition" + gd::String::From(i) + "IsTrue";
        if (i == cId - 1) outputCode += ") ";
      }

      outputCode += "{\n";
      outputCode += conditionCode;
      outputCode += "}";
    } else {
      // Deprecated way to cancel code generation - but still honor it.
      // Can be removed once condition is passed by const reference to
      // GenerateConditionCode.
      outputCode += "/* Skipped condition (empty type) */";
    }
  }

  maxConditionsListsSize = std::max(maxConditionsListsSize, conditions.size());

  return outputCode;
}

/**
 * Generate code for an action.
 */
gd::String EventsCodeGenerator::GenerateActionCode(
    gd::Instruction& action,
    EventsCodeGenerationContext& context,
    const gd::String& optionalAsyncCallbackName) {
  gd::String actionCode;

  const gd::InstructionMetadata& instrInfos =
      MetadataProvider::GetActionMetadata(platform, action.GetType());
  if (MetadataProvider::IsBadInstructionMetadata(instrInfos)) {
    return "/* Unknown instruction - skipped. */";
  }

  AddIncludeFiles(instrInfos.GetIncludeFiles());

  if (instrInfos.HasCustomCodeGenerator()) {
    return instrInfos.codeExtraInformation.customCodeGenerator(
        action, *this, context);
  }

  // Get the correct function name depending on whether it should be async or
  // not.
  const gd::String& functionCallName =
      instrInfos.IsAsync() &&
              (!instrInfos.IsOptionallyAsync() || action.IsAwaited())
          ? instrInfos.codeExtraInformation.asyncFunctionCallName
          : instrInfos.codeExtraInformation.functionCallName;

  // Be sure there is no lack of parameter.
  while (action.GetParameters().size() < instrInfos.parameters.size()) {
    vector<gd::Expression> parameters = action.GetParameters();
    parameters.push_back(gd::Expression(""));
    action.SetParameters(parameters);
  }

  // Verify that there are no mismatches between object type in parameters.
  for (std::size_t pNb = 0; pNb < instrInfos.parameters.size(); ++pNb) {
    if (ParameterMetadata::IsObject(instrInfos.parameters[pNb].GetType())) {
      gd::String objectInParameter = action.GetParameter(pNb).GetPlainString();
      if (!GetObjectsContainersList().HasObjectOrGroupNamed(objectInParameter)) {
        return "/* Unknown object - skipped. */";
      } else if (!instrInfos.parameters[pNb].GetExtraInfo().empty() &&
                 GetObjectsContainersList().GetTypeOfObject(objectInParameter) !=
                     instrInfos.parameters[pNb].GetExtraInfo()) {
        return "/* Mismatched object type - skipped. */";
      }
    }
  }

  // Call free function first if available
  if (instrInfos.IsObjectInstruction()) {
    gd::String objectName = action.GetParameter(0).GetPlainString();

    if (!instrInfos.parameters.empty()) {
      std::vector<gd::String> realObjects =
          GetObjectsContainersList().ExpandObjectName(objectName, context.GetCurrentObject());
      for (std::size_t i = 0; i < realObjects.size(); ++i) {
        // Setup context
        gd::String objectType = GetObjectsContainersList().GetTypeOfObject(realObjects[i]);
        const ObjectMetadata& objInfo =
            MetadataProvider::GetObjectMetadata(platform, objectType);

          AddIncludeFiles(objInfo.includeFiles);
          context.SetCurrentObject(realObjects[i]);
          context.ObjectsListNeeded(realObjects[i]);

          // Prepare arguments and generate the whole action code
          vector<gd::String> arguments = GenerateParametersCodes(
              action.GetParameters(), instrInfos.parameters, context);
          actionCode += GenerateObjectAction(realObjects[i],
                                             objInfo,
                                             functionCallName,
                                             arguments,
                                             instrInfos,
                                             context,
                                             optionalAsyncCallbackName);

          context.SetNoCurrentObject();
      }
    }
  } else if (instrInfos.IsBehaviorInstruction()) {
    gd::String objectName = action.GetParameter(0).GetPlainString();
    gd::String behaviorType = GetObjectsContainersList().GetTypeOfBehavior(action.GetParameter(1).GetPlainString());

    if (instrInfos.parameters.size() >= 2) {
      std::vector<gd::String> realObjects =
          GetObjectsContainersList().ExpandObjectName(objectName, context.GetCurrentObject());
      for (std::size_t i = 0; i < realObjects.size(); ++i) {
        // Setup context
        const BehaviorMetadata& autoInfo =
            MetadataProvider::GetBehaviorMetadata(platform, behaviorType);
        AddIncludeFiles(autoInfo.includeFiles);
        context.SetCurrentObject(realObjects[i]);
        context.ObjectsListNeeded(realObjects[i]);

        // Prepare arguments and generate the whole action code
        vector<gd::String> arguments = GenerateParametersCodes(
            action.GetParameters(), instrInfos.parameters, context);
        actionCode +=
            GenerateBehaviorAction(realObjects[i],
                                   action.GetParameter(1).GetPlainString(),
                                   autoInfo,
                                   functionCallName,
                                   arguments,
                                   instrInfos,
                                   context,
                                   optionalAsyncCallbackName);

        context.SetNoCurrentObject();
      }
    }
  } else {
    vector<gd::String> arguments = GenerateParametersCodes(
        action.GetParameters(), instrInfos.parameters, context);
    actionCode += GenerateFreeAction(functionCallName,
                                     arguments,
                                     instrInfos,
                                     context,
                                     optionalAsyncCallbackName);
  }

  return actionCode;
}

const EventsCodeGenerator::CallbackDescriptor
EventsCodeGenerator::GenerateCallback(
    const gd::String& callbackID,
    gd::EventsCodeGenerationContext& parentContext,
    gd::InstructionsList& actions,
    gd::EventsList* subEvents) {
  gd::EventsCodeGenerationContext callbackContext;
  callbackContext.InheritsAsAsyncCallbackFrom(parentContext);
  const gd::String callbackFunctionName =
      GetCodeNamespaceAccessor() + "asyncCallback" + callbackID;
  const gd::String callbackFunctionArguments =
      GenerateEventsParameters(callbackContext);

  // Generate actions
  gd::String actionsCode = GenerateActionsListCode(actions, callbackContext);

  // Generate subevents
  if (subEvents != nullptr)  // Sub events
  {
    actionsCode += "\n{ //Subevents\n";
    actionsCode += GenerateEventsListCode(*subEvents, callbackContext);
    actionsCode += "} //End of subevents\n";
  }

  // Compose the callback function and add outside main
  const gd::String actionsDeclarationsCode =
      GenerateObjectsDeclarationCode(callbackContext);

  const gd::String callbackCode = callbackFunctionName + " = function (" +
                                  GenerateEventsParameters(callbackContext) +
                                  ") {\n" + actionsDeclarationsCode +
                                  actionsCode + "}\n";

  AddCustomCodeOutsideMain(callbackCode);

  std::set<gd::String> requiredObjects;
  // Build the list of all objects required by the callback. Any object that has
  // already been declared could have gone through previous object picking, so
  // if such an object is used by the actions or subevents of this callback, we
  // must ask the caller to pass the already existing objects lists through a
  // `LongLivedObjectsList` to the callback function.
  for (const auto& objectUsedInSubTree :
       callbackContext.GetAllDeclaredObjectsAcrossChildren()) {
    if (callbackContext.ObjectAlreadyDeclaredByParents(objectUsedInSubTree))
      requiredObjects.insert(objectUsedInSubTree);
  };

  return CallbackDescriptor(
      callbackFunctionName, callbackFunctionArguments, requiredObjects);
};

const gd::String EventsCodeGenerator::GenerateEventsParameters(
    const gd::EventsCodeGenerationContext& context) {
  gd::String parameters = "runtimeScene";
  if (!HasProjectAndLayout()) parameters += ", eventsFunctionContext";
  if (context.IsInsideAsync()) parameters += ", asyncObjectsList";
  return parameters;
};

/**
 * Generate actions code.
 */
gd::String EventsCodeGenerator::GenerateActionsListCode(
    gd::InstructionsList& actions, EventsCodeGenerationContext& context) {
  gd::String outputCode;
  for (std::size_t aId = 0; aId < actions.size(); ++aId) {
    gd::String actionCode = GenerateActionCode(actions[aId], context);

    outputCode += "{";
    if (actions[aId].GetType().empty()) {
      // Deprecated way to cancel code generation - but still honor it.
      // Can be removed once action is passed by const reference to
      // GenerateActionCode.
      outputCode += "/* Skipped action (empty type) */";
    } else {
      outputCode += actionCode;
    }
    outputCode += "}";
  }

  return outputCode;
}

gd::String EventsCodeGenerator::GenerateParameterCodes(
    const gd::Expression& parameter,
    const gd::ParameterMetadata& metadata,
    gd::EventsCodeGenerationContext& context,
    const gd::String& lastObjectName,
    std::vector<std::pair<gd::String, gd::String> >*
        supplementaryParametersTypes) {
  gd::String argOutput;

  if (ParameterMetadata::IsExpression("number", metadata.GetType())) {
    argOutput = gd::ExpressionCodeGenerator::GenerateExpressionCode(
        *this, context, "number", parameter, lastObjectName);
  } else if (ParameterMetadata::IsExpression("string", metadata.GetType())) {
    argOutput = gd::ExpressionCodeGenerator::GenerateExpressionCode(
        *this, context, "string", parameter, lastObjectName);
  } else if (ParameterMetadata::IsExpression("variable", metadata.GetType())) {
    argOutput = gd::ExpressionCodeGenerator::GenerateExpressionCode(
        *this, context, metadata.GetType(), parameter, lastObjectName);
  } else if (ParameterMetadata::IsObject(metadata.GetType())) {
    // It would be possible to run a gd::ExpressionCodeGenerator if later
    // objects can have nested objects, or function returning objects.
    argOutput =
        GenerateObject(parameter.GetPlainString(), metadata.GetType(), context);
  } else if (metadata.GetType() == "relationalOperator") {
    argOutput += parameter.GetPlainString();
    argOutput = "\"" + argOutput + "\"";
  } else if (metadata.GetType() == "operator") {
    argOutput += parameter.GetPlainString();
    if (argOutput != "=" && argOutput != "+" && argOutput != "-" &&
        argOutput != "/" && argOutput != "*") {
      cout << "Warning: Bad operator: Set to = by default." << endl;
      argOutput = "=";
    }

    argOutput = "\"" + argOutput + "\"";
  } else if (ParameterMetadata::IsBehavior(metadata.GetType())) {
    argOutput = GenerateGetBehaviorNameCode(parameter.GetPlainString());
  } else if (metadata.GetType() == "key") {
    argOutput = "\"" + ConvertToString(parameter.GetPlainString()) + "\"";
  } else if (metadata.GetType() == "audioResource" ||
             metadata.GetType() == "bitmapFontResource" ||
             metadata.GetType() == "fontResource" ||
             metadata.GetType() == "imageResource" ||
             metadata.GetType() == "jsonResource" ||
             metadata.GetType() == "tilemapResource" ||
             metadata.GetType() == "tilesetResource" ||
             metadata.GetType() == "videoResource" ||
             metadata.GetType() == "model3DResource" ||
             metadata.GetType() == "atlasResource" ||
             metadata.GetType() == "spineResource" ||
             // Deprecated, old parameter names:
             metadata.GetType() == "password" || metadata.GetType() == "musicfile" ||
             metadata.GetType() == "soundfile" || metadata.GetType() == "police") {
    argOutput = "\"" + ConvertToString(parameter.GetPlainString()) + "\"";
  } else if (metadata.GetType() == "mouse") {
    argOutput = "\"" + ConvertToString(parameter.GetPlainString()) + "\"";
  } else if (metadata.GetType() == "yesorno") {
    auto parameterString = parameter.GetPlainString();
    argOutput += (parameterString == "yes" || parameterString == "oui")
                     ? GenerateTrue()
                     : GenerateFalse();
  } else if (metadata.GetType() == "trueorfalse") {
    auto parameterString = parameter.GetPlainString();
    // This is duplicated in AdvancedExtension.cpp for GDJS
    argOutput += (parameterString == "True" || parameterString == "Vrai")
                     ? GenerateTrue()
                     : GenerateFalse();
  }
  // Code only parameter type
  else if (metadata.GetType() == "inlineCode") {
    argOutput += metadata.GetExtraInfo();
  } else {
    // Try supplementary types if provided
    if (supplementaryParametersTypes) {
      for (std::size_t i = 0; i < supplementaryParametersTypes->size(); ++i) {
        if ((*supplementaryParametersTypes)[i].first == metadata.GetType())
          argOutput += (*supplementaryParametersTypes)[i].second;
      }
    }

    // Type unknown
    if (argOutput.empty()) {
      if (!metadata.GetType().empty())
        cout << "Warning: Unknown type of parameter \"" << metadata.GetType()
             << "\"." << std::endl;
      argOutput += "\"" + ConvertToString(parameter.GetPlainString()) + "\"";
    }
  }

  return argOutput;
}

vector<gd::String> EventsCodeGenerator::GenerateParametersCodes(
    const vector<gd::Expression>& parameters,
    const vector<gd::ParameterMetadata>& parametersInfo,
    EventsCodeGenerationContext& context,
    std::vector<std::pair<gd::String, gd::String> >*
        supplementaryParametersTypes) {
  vector<gd::String> arguments;

  gd::ParameterMetadataTools::IterateOverParameters(
      parameters,
      parametersInfo,
      [this, &context, &supplementaryParametersTypes, &arguments](
          const gd::ParameterMetadata& parameterMetadata,
          const gd::Expression& parameterValue,
          const gd::String& lastObjectName) {
        gd::String argOutput =
            GenerateParameterCodes(parameterValue,
                                   parameterMetadata,
                                   context,
                                   lastObjectName,
                                   supplementaryParametersTypes);
        arguments.push_back(argOutput);
      });

  return arguments;
}

gd::String EventsCodeGenerator::GenerateGetBehaviorNameCode(
    const gd::String& behaviorName) {
  return ConvertToStringExplicit(behaviorName);
}

gd::String EventsCodeGenerator::GenerateObjectsDeclarationCode(
    EventsCodeGenerationContext& context) {
  auto declareObjectList = [this](gd::String object,
                                  gd::EventsCodeGenerationContext& context) {
    gd::String objectListName = GetObjectListName(object, context);
    if (!context.GetParentContext()) {
      std::cout << "ERROR: During code generation, a context tried to use an "
                   "already declared object list without having a parent"
                << std::endl;
      return "/* Could not declare " + objectListName + " */";
    }

    //*Optimization*: Avoid a copy of the object list if we're using
    // the same list as the one from the parent context.
    if (context.IsSameObjectsList(object, *context.GetParentContext()))
      return "/* Reuse " + objectListName + " */";

    gd::String declarationCode;

    // Use a temporary variable as the names of lists are the same between
    // contexts.
    gd::String copiedListName =
        GetObjectListName(object, *context.GetParentContext());
    declarationCode += "std::vector<RuntimeObject*> & " + objectListName +
                       "T = " + copiedListName + ";\n";
    declarationCode += "std::vector<RuntimeObject*> " + objectListName + " = " +
                       objectListName + "T;\n";
    return declarationCode;
  };

  gd::String declarationsCode;
  for (auto object : context.GetObjectsListsToBeDeclared()) {
    gd::String objectListDeclaration = "";
    if (!context.ObjectAlreadyDeclaredByParents(object)) {
      objectListDeclaration = "std::vector<RuntimeObject*> " +
                              GetObjectListName(object, context) +
                              " = runtimeContext->GetObjectsRawPointers(\"" +
                              ConvertToString(object) + "\");\n";
    } else
      objectListDeclaration = declareObjectList(object, context);

    declarationsCode += objectListDeclaration + "\n";
  }
  for (auto object : context.GetObjectsListsToBeEmptyIfJustDeclared()) {
    gd::String objectListDeclaration = "";
    if (!context.ObjectAlreadyDeclaredByParents(object)) {
      objectListDeclaration = "std::vector<RuntimeObject*> " +
                              GetObjectListName(object, context) + ";\n";
    } else
      objectListDeclaration = declareObjectList(object, context);

    declarationsCode += objectListDeclaration + "\n";
  }
  for (auto object : context.GetObjectsListsToBeDeclaredEmpty()) {
    gd::String objectListDeclaration = "";
    if (!context.ObjectAlreadyDeclaredByParents(object)) {
      objectListDeclaration = "std::vector<RuntimeObject*> " +
                              GetObjectListName(object, context) + ";\n";
    } else
      objectListDeclaration = "std::vector<RuntimeObject*> " +
                              GetObjectListName(object, context) + ";\n";

    declarationsCode += objectListDeclaration + "\n";
  }

  return declarationsCode;
}

/**
 * Generate events list code.
 */
gd::String EventsCodeGenerator::GenerateEventsListCode(
    gd::EventsList& events, EventsCodeGenerationContext& parentContext) {
  gd::String output;
  for (std::size_t eId = 0; eId < events.size(); ++eId) {
    // Each event has its own context : Objects picked in an event are totally
    // different than the one picked in another.
    gd::EventsCodeGenerationContext newContext;
    newContext.InheritsFrom(
        parentContext);  // Events in the same "level" share
                         // the same context as their parent.

    //*Optimization*: when the event is the last of a list, we can use the
    // same lists of objects as the parent (as they will be discarded just
    // after). This avoids a copy of the lists of objects which is an expensive
    // operation.
    bool reuseParentContext =
        parentContext.CanReuse() && eId == events.size() - 1;

    // TODO: avoid creating if useless.
    gd::EventsCodeGenerationContext reusedContext;
    reusedContext.Reuse(parentContext);

    auto& context = reuseParentContext ? reusedContext : newContext;

    gd::String eventCoreCode = events[eId].GenerateEventCode(*this, context);
    gd::String scopeBegin = GenerateScopeBegin(context);
    gd::String scopeEnd = GenerateScopeEnd(context);
    gd::String declarationsCode = GenerateObjectsDeclarationCode(context);

    output += "\n" + scopeBegin + "\n" + declarationsCode + "\n" +
              eventCoreCode + "\n" + scopeEnd + "\n";
  }

  return output;
}

gd::String EventsCodeGenerator::ConvertToString(gd::String plainString) {
  plainString = plainString.FindAndReplace("\\", "\\\\")
                    .FindAndReplace("\r", "\\r")
                    .FindAndReplace("\n", "\\n")
                    .FindAndReplace("\"", "\\\"");

  return plainString;
}

gd::String EventsCodeGenerator::ConvertToStringExplicit(
    gd::String plainString) {
  return "\"" + ConvertToString(plainString) + "\"";
}

void EventsCodeGenerator::DeleteUselessEvents(gd::EventsList& events) {
  for (std::size_t eId = events.size() - 1; eId < events.size(); --eId) {
    if (events[eId].CanHaveSubEvents())  // Process sub events, if any
      DeleteUselessEvents(events[eId].GetSubEvents());

    if (!events[eId].IsExecutable() ||
        events[eId].IsDisabled())  // Delete events that are not executable
      events.RemoveEvent(eId);
  }
}

/**
 * Call preprocessing method of each event
 */
void EventsCodeGenerator::PreprocessEventList(gd::EventsList& listEvent) {
  for (std::size_t i = 0; i < listEvent.GetEventsCount(); ++i) {
    if (listEvent[i].IsDisabled()) continue;

    listEvent[i].Preprocess(*this, listEvent, i);
    if (i <
        listEvent.GetEventsCount()) {  // Be sure that that there is still an
                                       // event! ( Preprocess can remove it. )
      if (listEvent[i].CanHaveSubEvents())
        PreprocessEventList(listEvent[i].GetSubEvents());
    }
  }
}

void EventsCodeGenerator::ReportError() { errorOccurred = true; }

gd::String EventsCodeGenerator::GenerateObjectFunctionCall(
    gd::String objectListName,
    const gd::ObjectMetadata& objMetadata,
    const gd::ExpressionCodeGenerationInformation& codeInfo,
    gd::String parametersStr,
    gd::String defaultOutput,
    gd::EventsCodeGenerationContext& context) {
  // To be used for testing only.
  return objectListName + "." + codeInfo.functionCallName + "(" +
         parametersStr + ") ?? " + defaultOutput;
}

gd::String EventsCodeGenerator::GenerateObjectBehaviorFunctionCall(
    gd::String objectListName,
    gd::String behaviorName,
    const gd::BehaviorMetadata& autoInfo,
    const gd::ExpressionCodeGenerationInformation& codeInfo,
    gd::String parametersStr,
    gd::String defaultOutput,
    gd::EventsCodeGenerationContext& context) {
  // To be used for testing only.
  return objectListName + "::" + behaviorName + "." +
         codeInfo.functionCallName + "(" + parametersStr + ") ?? " +
         defaultOutput;
}

gd::String EventsCodeGenerator::GenerateFreeCondition(
    const std::vector<gd::String>& arguments,
    const gd::InstructionMetadata& instrInfos,
    const gd::String& returnBoolean,
    bool conditionInverted,
    gd::EventsCodeGenerationContext& context) {
  // Generate call
  gd::String predicate;
  if (instrInfos.codeExtraInformation.type == "number" ||
      instrInfos.codeExtraInformation.type == "string") {
    predicate = GenerateRelationalOperatorCall(
        instrInfos,
        arguments,
        instrInfos.codeExtraInformation.functionCallName);
  } else {
    predicate = instrInfos.codeExtraInformation.functionCallName + "(" +
               GenerateArgumentsList(arguments, 0) + ")";
  }

  // Add logical not if needed
  bool conditionAlreadyTakeCareOfInversion = false;
  for (std::size_t i = 0; i < instrInfos.parameters.size();
       ++i)  // Some conditions already have a "conditionInverted" parameter
  {
    if (instrInfos.parameters[i].GetType() == "conditionInverted")
      conditionAlreadyTakeCareOfInversion = true;
  }
  if (!conditionAlreadyTakeCareOfInversion && conditionInverted)
    predicate = GenerateNegatedPredicate(predicate);

  // Generate condition code
  return returnBoolean + " = " + predicate + ";\n";
}

gd::String EventsCodeGenerator::GenerateObjectCondition(
    const gd::String& objectName,
    const gd::ObjectMetadata& objInfo,
    const std::vector<gd::String>& arguments,
    const gd::InstructionMetadata& instrInfos,
    const gd::String& returnBoolean,
    bool conditionInverted,
    gd::EventsCodeGenerationContext& context) {
  // Prepare call
  // Add a static_cast if necessary
  gd::String objectFunctionCallNamePart =
      (!instrInfos.parameters[0].GetExtraInfo().empty())
          ? "static_cast<" + objInfo.className + "*>(" +
                GetObjectListName(objectName, context) + "[i])->" +
                instrInfos.codeExtraInformation.functionCallName
          : GetObjectListName(objectName, context) + "[i]->" +
                instrInfos.codeExtraInformation.functionCallName;

  // Create call
  gd::String predicate;
  if ((instrInfos.codeExtraInformation.type == "number" ||
       instrInfos.codeExtraInformation.type == "string")) {
    predicate = GenerateRelationalOperatorCall(
        instrInfos, arguments, objectFunctionCallNamePart, 1);
  } else {
    predicate = objectFunctionCallNamePart + "(" +
               GenerateArgumentsList(arguments, 1) + ")";
  }
  if (conditionInverted) predicate = GenerateNegatedPredicate(predicate);

  return "For each picked object \"" + objectName + "\", check " + predicate +
         ".\n";
}

gd::String EventsCodeGenerator::GenerateBehaviorCondition(
    const gd::String& objectName,
    const gd::String& behaviorName,
    const gd::BehaviorMetadata& autoInfo,
    const std::vector<gd::String>& arguments,
    const gd::InstructionMetadata& instrInfos,
    const gd::String& returnBoolean,
    bool conditionInverted,
    gd::EventsCodeGenerationContext& context) {
  // Create call
  gd::String predicate;
  if ((instrInfos.codeExtraInformation.type == "number" ||
       instrInfos.codeExtraInformation.type == "string")) {
    predicate = GenerateRelationalOperatorCall(instrInfos, arguments, "", 2);
  } else {
    predicate = "(" + GenerateArgumentsList(arguments, 2) + ")";
  }
  if (conditionInverted) predicate = GenerateNegatedPredicate(predicate);

  return "For each picked object \"" + objectName + "\", check " + predicate +
         " for behavior \"" + behaviorName + "\".\n";
}

gd::String EventsCodeGenerator::GenerateFreeAction(
      const gd::String& functionCallName,
    const std::vector<gd::String>& arguments,
    const gd::InstructionMetadata& instrInfos,
    gd::EventsCodeGenerationContext& context,
    const gd::String& optionalAsyncCallbackName) {
  // Generate call
  gd::String call;
  if (instrInfos.codeExtraInformation.type == "number" ||
      instrInfos.codeExtraInformation.type == "string") {
    if (instrInfos.codeExtraInformation.accessType ==
        gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor)
      call = GenerateOperatorCall(
          instrInfos,
          arguments,
          functionCallName,
          instrInfos.codeExtraInformation.optionalAssociatedInstruction);
    else if (instrInfos.codeExtraInformation.accessType ==
             gd::InstructionMetadata::ExtraInformation::Mutators)
      call =
          GenerateMutatorCall(instrInfos,
                              arguments,
                              functionCallName);
    else
      call = GenerateCompoundOperatorCall(
          instrInfos,
          arguments,
          functionCallName);
  } else {
    call = functionCallName + "(" +
           GenerateArgumentsList(arguments) + ")";
  }

  if (!optionalAsyncCallbackName.empty())
    call = "runtimeScene.getAsyncTasksManager().addTask(" + call + ", " +
           optionalAsyncCallbackName + ")";

  return call + ";\n";
}

gd::String EventsCodeGenerator::GenerateObjectAction(
    const gd::String& objectName,
    const gd::ObjectMetadata& objInfo,
    const gd::String& functionCallName,
    const std::vector<gd::String>& arguments,
    const gd::InstructionMetadata& instrInfos,
    gd::EventsCodeGenerationContext& context,
    const gd::String& optionalAsyncCallbackName) {
  // Create call
  gd::String call;
  if ((instrInfos.codeExtraInformation.type == "number" ||
       instrInfos.codeExtraInformation.type == "string")) {
    if (instrInfos.codeExtraInformation.accessType ==
        gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor)
      call = GenerateOperatorCall(
          instrInfos,
          arguments,
          functionCallName,
          instrInfos.codeExtraInformation.optionalAssociatedInstruction,
          2);
    else
      call = GenerateCompoundOperatorCall(
          instrInfos, arguments, functionCallName, 2);

    return "For each picked object \"" + objectName + "\", call " + call +
           ".\n";
  } else {
    gd::String argumentsStr = GenerateArgumentsList(arguments, 1);

    call = functionCallName + "(" + argumentsStr + ")";

    return "For each picked object \"" + objectName + "\", call " + call + "(" +
           argumentsStr + ")" +
           (optionalAsyncCallbackName.empty()
                ? ""
                : (", then call" + optionalAsyncCallbackName)) +
           ".\n";
  }
}

gd::String EventsCodeGenerator::GenerateBehaviorAction(
    const gd::String& objectName,
    const gd::String& behaviorName,
    const gd::BehaviorMetadata& autoInfo,
    const gd::String& functionCallName,
    const std::vector<gd::String>& arguments,
    const gd::InstructionMetadata& instrInfos,
    gd::EventsCodeGenerationContext& context,
    const gd::String& optionalAsyncCallbackName) {
  // Create call
  gd::String call;
  if ((instrInfos.codeExtraInformation.type == "number" ||
       instrInfos.codeExtraInformation.type == "string")) {
    if (instrInfos.codeExtraInformation.accessType ==
        gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor)
      call = GenerateOperatorCall(
          instrInfos,
          arguments,
          functionCallName,
          instrInfos.codeExtraInformation.optionalAssociatedInstruction,
          2);
    else
      call = GenerateCompoundOperatorCall(
          instrInfos,
          arguments,
          functionCallName,
          2);
    return "For each picked object \"" + objectName + "\", call " + call +
           " for behavior \"" + behaviorName + "\".\n";
  } else {
    gd::String argumentsStr = GenerateArgumentsList(arguments, 2);

    call = functionCallName + "(" +
           argumentsStr + ")";

    return "For each picked object \"" + objectName + "\", call " + call + "(" +
           argumentsStr + ")" + " for behavior \"" + behaviorName + "\"" +
           (optionalAsyncCallbackName.empty()
                ? ""
                : (", then call" + optionalAsyncCallbackName)) +
           ".\n";
  }
}

size_t EventsCodeGenerator::GenerateSingleUsageUniqueIdForEventsList() {
  return eventsListNextUniqueId++;
}

size_t EventsCodeGenerator::GenerateSingleUsageUniqueIdFor(
    const Instruction* instruction) {
  if (!instruction) {
    std::cout << "ERROR: During code generation, a null pointer was passed to "
                 "GenerateSingleUsageUniqueIdFor."
              << std::endl;
  }

  // Base the unique id on the address in memory so that the same instruction
  // in memory will get the same id across different code generations.
  size_t uniqueId = (size_t)instruction;

  // While in most case this function is called a single time for each
  // instruction, it's possible for an instruction to be appearing more than
  // once in the events, if we used links. In this case, simply increment the
  // unique id to be sure that ids are effectively uniques, and stay stable
  // (given the same order of links).
  while (instructionUniqueIds.find(uniqueId) != instructionUniqueIds.end()) {
    uniqueId++;
  }
  instructionUniqueIds.insert(uniqueId);
  return uniqueId;
}

gd::String EventsCodeGenerator::GetObjectListName(
    const gd::String& name, const gd::EventsCodeGenerationContext& context) {
  return ManObjListName(name);
}

gd::String EventsCodeGenerator::GenerateArgumentsList(
    const std::vector<gd::String>& arguments, size_t startFrom) {
  gd::String argumentsStr;
  for (std::size_t i = startFrom; i < arguments.size(); ++i) {
    if (!argumentsStr.empty()) argumentsStr += ", ";
    argumentsStr += arguments[i];
  }

  return argumentsStr;
}

gd::String EventsCodeGenerator::GeneratePropertyGetter(const gd::PropertiesContainer& propertiesContainer,
                                                       const gd::NamedPropertyDescriptor& property,
                                                       const gd::String& type,
                                                       gd::EventsCodeGenerationContext& context) {
  return "getProperty" + property.GetName() + "As" + type + "()";
}

gd::String EventsCodeGenerator::GenerateParameterGetter(const gd::ParameterMetadata& parameter,
                                                        const gd::String& type,
                                                        gd::EventsCodeGenerationContext& context) {
  return "getParameter" + parameter.GetName() + "As" + type + "()";
}

EventsCodeGenerator::EventsCodeGenerator(const gd::Project& project_,
                                         const gd::Layout& layout,
                                         const gd::Platform& platform_)
    : platform(platform_),
      projectScopedContainers(gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project_, layout)),
      hasProjectAndLayout(true),
      project(&project_),
      scene(&layout),
      errorOccurred(false),
      compilationForRuntime(false),
      maxCustomConditionsDepth(0),
      maxConditionsListsSize(0),
      eventsListNextUniqueId(0){};

EventsCodeGenerator::EventsCodeGenerator(
    const gd::Platform& platform_,
    const gd::ProjectScopedContainers& projectScopedContainers_)
    : platform(platform_),
      projectScopedContainers(projectScopedContainers_),
      hasProjectAndLayout(false),
      project(nullptr),
      scene(nullptr),
      errorOccurred(false),
      compilationForRuntime(false),
      maxCustomConditionsDepth(0),
      maxConditionsListsSize(0),
      eventsListNextUniqueId(0){};

}  // namespace gd
