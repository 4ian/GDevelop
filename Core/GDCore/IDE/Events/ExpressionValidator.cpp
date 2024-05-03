/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/ExpressionValidator.h"

#include <algorithm>
#include <memory>
#include <vector>

#include "GDCore/CommonTools.h"
#include "GDCore/Events/Expression.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ObjectsContainersList.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Project/VariablesContainersList.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/MakeUnique.h"

using namespace std;

namespace gd {

namespace {
/**
 * Return the minimum number of parameters, starting from a given parameter
 * (by convention, 1 for object functions and 2 for behavior functions).
 */
size_t GetMinimumParametersNumber(
    const std::vector<gd::ParameterMetadata>& parameters,
    size_t initialParameterIndex) {
  size_t nb = 0;
  for (std::size_t i = initialParameterIndex; i < parameters.size(); ++i) {
    if (!parameters[i].IsOptional() && !parameters[i].codeOnly) nb++;
  }

  return nb;
}

/**
 * Return the maximum number of parameters, starting from a given parameter
 * (by convention, 1 for object functions and 2 for behavior functions).
 */
size_t GetMaximumParametersNumber(
    const std::vector<gd::ParameterMetadata>& parameters,
    size_t initialParameterIndex) {
  size_t nb = 0;
  for (std::size_t i = initialParameterIndex; i < parameters.size(); ++i) {
    if (!parameters[i].codeOnly) nb++;
  }

  return nb;
}

}  // namespace

bool ExpressionValidator::ValidateObjectVariableOrVariableOrProperty(
    const gd::IdentifierNode& identifier) {
  auto validateVariableTypeForExpression =
      [this, &identifier](gd::Variable::Type type) {
        // Collections type can't be used directly in expressions, a child
        // must be accessed.
        if (type == Variable::Structure) {
          RaiseTypeError(_("You need to specify the name of the child variable "
                           "to access. For example: `MyVariable.child`."),
                         identifier.identifierNameLocation);
        } else if (type == Variable::Array) {
          RaiseTypeError(_("You need to specify the name of the child variable "
                           "to access. For example: `MyVariable[0]`."),
                         identifier.identifierNameLocation);

        } else {
          // Number, string or boolean variables can be used in expressions.
          return;
        }
      };

  const auto& variablesContainersList = projectScopedContainers.GetVariablesContainersList();
  const auto& objectsContainersList = projectScopedContainers.GetObjectsContainersList();
  const auto& propertiesContainersList = projectScopedContainers.GetPropertiesContainersList();
  const auto& parametersVectorsList = projectScopedContainers.GetParametersVectorsList();

  // Unless we find something precise (like a variable or property or parameter with a known type),
  // we consider this node will be of the type required by the parent.
  childType = parentType;

  return projectScopedContainers.MatchIdentifierWithName<bool>(identifier.identifierName,
    [&]() {
      // This represents an object.
      if (identifier.childIdentifierName.empty()) {
        RaiseTypeError(_("An object variable or expression should be entered."),
                        identifier.identifierNameLocation);

        return true; // We should have found a variable.
      }

      auto variableExistence = objectsContainersList.HasObjectOrGroupWithVariableNamed(identifier.identifierName, identifier.childIdentifierName);

      if (variableExistence == gd::ObjectsContainersList::DoesNotExist) {
        RaiseTypeError(_("This variable does not exist on this object or group."),
                        identifier.childIdentifierNameLocation);

        return true; // We should have found a variable.
      }
      else if (variableExistence == gd::ObjectsContainersList::ExistsOnlyOnSomeObjectsOfTheGroup) {
        RaiseTypeError(_("This variable only exists on some objects of the group. It must be declared for all objects."),
                        identifier.childIdentifierNameLocation);

        return true; // We should have found a variable.
      }
      else if (variableExistence == gd::ObjectsContainersList::GroupIsEmpty) {
        RaiseTypeError(_("This group is empty. Add an object to this group first."),
                        identifier.identifierNameLocation);

        return true; // We should have found a variable.
      }

      auto variableType = objectsContainersList.GetTypeOfObjectOrGroupVariable(identifier.identifierName, identifier.childIdentifierName);
      ReadChildTypeFromVariable(variableType);

      return true; // We found a variable.
    }, [&]() {
      // This is a variable.

      // Try to identify a declared variable with the name (and maybe the child
      // variable).
      const gd::Variable& variable =
          variablesContainersList.Get(identifier.identifierName);

      if (identifier.childIdentifierName.empty()) {
        // Just the root variable is accessed, check it can be used in an
        // expression.
        validateVariableTypeForExpression(variable.GetType());
        ReadChildTypeFromVariable(variable.GetType());

        return true; // We found a variable.
      } else {
        // A child variable is accessed, check it can be used in an expression.
        if (!variable.HasChild(identifier.childIdentifierName)) {
          RaiseTypeError(_("No child variable with this name found."),
                        identifier.childIdentifierNameLocation);

          return true; // We should have found a variable.
        }

        const gd::Variable& childVariable =
            variable.GetChild(identifier.childIdentifierName);
        ReadChildTypeFromVariable(childVariable.GetType());
        return true; // We found a variable.
      }
    }, [&]() {
      // This is a property.
      if (!identifier.childIdentifierName.empty()) {
        RaiseTypeError(_("Accessing a child variable of a property is not possible - just write the property name."),
            identifier.childIdentifierNameLocation);

        return true; // We found a property, even if the child is not allowed.
      }

      const gd::NamedPropertyDescriptor& property = projectScopedContainers
          .GetPropertiesContainersList().Get(identifier.identifierName).second;

      if (property.GetType() == "Number") {
       childType = Type::Number;
      } else if (property.GetType() == "Boolean") {
        // Nothing - we don't know the precise type (this could be used a string or as a number)
      } else {
        // Assume type is String or equivalent.
        childType = Type::String;
      }

      return true; // We found a property.
    }, [&]() {
      // This is a parameter.
      if (!identifier.childIdentifierName.empty()) {
        RaiseTypeError(_("Accessing a child variable of a parameter is not possible - just write the parameter name."),
            identifier.childIdentifierNameLocation);

        return true; // We found a parameter, even if the child is not allowed.
      }

      const auto& parameter = gd::ParameterMetadataTools::Get(parametersVectorsList, identifier.identifierName);
      const auto& valueTypeMetadata = parameter.GetValueTypeMetadata();
      if (valueTypeMetadata.IsNumber()) {
        childType = Type::Number;
      } else if (valueTypeMetadata.IsString()) {
        childType = Type::String;
      } else if (valueTypeMetadata.IsBoolean()) {
        // Nothing - we don't know the precise type (this could be used as a string or as a number).
      } else {
        RaiseTypeError(_("This parameter is not a string, number or boolean - it can't be used in an expression."),
            identifier.identifierNameLocation);

        return true; // We found a parameter, even though the type is incompatible.
      }

      return true; // We found a parameter.
    }, [&]() {
      // This is something else.
      return false;
    });
}

ExpressionValidator::Type ExpressionValidator::ValidateFunction(
    const gd::FunctionCallNode& function) {
  ReportAnyError(function);

  auto& objectsContainersList = projectScopedContainers.GetObjectsContainersList();

  gd::String objectType =
      function.objectName.empty()
          ? ""
          : objectsContainersList.GetTypeOfObject(function.objectName);

  gd::String behaviorType = function.behaviorName.empty()
                                ? ""
                                : objectsContainersList.GetTypeOfBehavior(function.behaviorName);

  const gd::ExpressionMetadata& metadata =
      function.behaviorName.empty()
          ? function.objectName.empty()
                ? MetadataProvider::GetAnyExpressionMetadata(
                      platform, function.functionName)
                : MetadataProvider::GetObjectAnyExpressionMetadata(
                      platform, objectType, function.functionName)
          : MetadataProvider::GetBehaviorAnyExpressionMetadata(
                platform, behaviorType, function.functionName);

  Type returnType = StringToType(metadata.GetReturnType());

  if (!function.objectName.empty() &&
      !objectsContainersList.HasObjectOrGroupNamed(function.objectName)) {
    RaiseTypeError(_("This object doesn't exist."),
                   function.objectNameLocation,
                   /*isFatal=*/false);
    return returnType;
  }

  if (!function.behaviorName.empty() &&
      !objectsContainersList.HasBehaviorInObjectOrGroup(function.objectName,
                                      function.behaviorName)) {
    RaiseTypeError(_("This behavior is not attached to this object."),
                   function.behaviorNameLocation,
                   /*isFatal=*/false);
    return returnType;
  }

  if (!function.objectName.empty() &&
      // If the function needs a capability on the object that may not be
      // covered by all objects, check it now.
      !metadata.GetRequiredBaseObjectCapability().empty()) {
    const gd::ObjectMetadata& objectMetadata =
        MetadataProvider::GetObjectMetadata(platform, objectType);
  }

  if (gd::MetadataProvider::IsBadExpressionMetadata(metadata)) {
    if (function.functionName.empty()) {
      RaiseError("invalid_function_name",
               _("Enter the name of the function to call."),
               function.location);
    } else {
      RaiseError("invalid_function_name",
               _("Cannot find an expression with this name: ") +
                   function.functionName + "\n" +
                   _("Double check that you've not made any typo in the name."),
               function.location);
    }
    return returnType;
  }

  // Validate the type of the function
  if (returnType == Type::Number) {
    if (parentType == Type::String) {
      RaiseTypeError(
          _("You tried to use an expression that returns a number, but a "
            "string is expected. Use `ToString` if you need to convert a "
            "number to a string."),
          function.location);
      return returnType;
    } else if (parentType != Type::Number &&
               parentType != Type::NumberOrString) {
      RaiseTypeError(_("You tried to use an expression that returns a "
                       "number, but another type is expected:") +
                         " " + TypeToString(parentType),
                     function.location);
      return returnType;
    }
  } else if (returnType == Type::String) {
    if (parentType == Type::Number) {
      RaiseTypeError(
          _("You tried to use an expression that returns a string, but a "
            "number is expected. Use `ToNumber` if you need to convert a "
            "string to a number."),
          function.location);
      return returnType;
    } else if (parentType != Type::String &&
               parentType != Type::NumberOrString) {
      RaiseTypeError(_("You tried to use an expression that returns a "
                       "string, but another type is expected:") +
                         " " + TypeToString(parentType),
                     function.location);
      return returnType;
    }
  } else {
    if (parentType != returnType) {
      RaiseTypeError(
          _("You tried to use an expression with the wrong return type:") +
              " " + TypeToString(returnType),
          function.location);
      return returnType;
    }
  }

  // Validate parameters count
  size_t minParametersCount = GetMinimumParametersNumber(
      metadata.parameters,
      ExpressionParser2::WrittenParametersFirstIndex(function.objectName,
                                                     function.behaviorName));
  size_t maxParametersCount = GetMaximumParametersNumber(
      metadata.parameters,
      ExpressionParser2::WrittenParametersFirstIndex(function.objectName,
                                                     function.behaviorName));
  if (function.parameters.size() < minParametersCount ||
      function.parameters.size() > maxParametersCount) {
    gd::String expectedCountMessage =
        minParametersCount == maxParametersCount
            ? _("The number of parameters must be exactly ") +
                  gd::String::From(minParametersCount)
            : _("The number of parameters must be: ") +
                  gd::String::From(minParametersCount) + "-" +
                  gd::String::From(maxParametersCount);

    if (function.parameters.size() < minParametersCount) {
      RaiseError(
          "too_few_parameters",
          _("You have not entered enough parameters for the expression.") +
              " " + expectedCountMessage,
          function.location);
    } else {
      RaiseError(
          "extra_parameter",
          _("This parameter was not expected by this expression. Remove it "
            "or verify that you've entered the proper expression name.") +
              " " + expectedCountMessage,
          ExpressionParserLocation(function.parameters[maxParametersCount]
                                       ->location.GetStartPosition(),
                                   function.location.GetEndPosition() - 1));
    }
    return returnType;
  }

  // TODO: reverse the order of diagnostic?
  size_t writtenParametersFirstIndex =
      ExpressionParser2::WrittenParametersFirstIndex(function.objectName,
                                                     function.behaviorName);
  int metadataIndex = writtenParametersFirstIndex;
  for (int parameterIndex = 0; parameterIndex < function.parameters.size();
       parameterIndex++) {
    auto& parameter = function.parameters[parameterIndex];
    while (metadata.GetParameters()[metadataIndex].IsCodeOnly()) {
      // The sizes are already checked above.
      metadataIndex++;
    }
    auto& parameterMetadata = metadata.GetParameters()[metadataIndex];

    if (!parameterMetadata.IsOptional() ||
        dynamic_cast<EmptyNode*>(parameter.get()) == nullptr) {
      auto currentParentType = parentType;
      parentType = StringToType(parameterMetadata.GetType());
      parameter->Visit(*this);
      parentType = currentParentType;

      const gd::String& expectedParameterType = parameterMetadata.GetType();
      if (gd::ParameterMetadata::IsExpression(
              ExpressionValidator::variableTypeString, expectedParameterType)) {
        if (dynamic_cast<IdentifierNode*>(parameter.get()) == nullptr &&
            dynamic_cast<VariableNode*>(parameter.get()) == nullptr) {
          RaiseError("malformed_variable_parameter",
                     _("A variable name was expected but something else was "
                       "written. Enter just the name of the variable for this "
                       "parameter."),
                     parameter->location);
        }
      } else if (gd::ParameterMetadata::IsObject(expectedParameterType)) {
        if (dynamic_cast<IdentifierNode*>(parameter.get()) == nullptr) {
          RaiseError("malformed_object_parameter",
                     _("An object name was expected but something else was "
                       "written. Enter just the name of the object for this "
                       "parameter."),
                     parameter->location);
        }
      }
      // String and number are already checked in children.
      else if (!gd::ParameterMetadata::IsExpression(
                   ExpressionValidator::numberTypeString,
                   expectedParameterType) &&
               !gd::ParameterMetadata::IsExpression(
                   ExpressionValidator::stringTypeString,
                   expectedParameterType)) {
        RaiseError("unknown_parameter_type",
                   _("This function is improperly set up. Reach out to the "
                     "extension developer or a GDevelop maintainer to fix "
                     "this issue"),
                   parameter->location);
      }
    }
    metadataIndex++;
  }
  return returnType;
}

// TODO factorize in a file with an enum and helpers?
const gd::String ExpressionValidator::unknownTypeString = "unknown";
const gd::String ExpressionValidator::numberTypeString = "number";
const gd::String ExpressionValidator::stringTypeString = "string";
const gd::String ExpressionValidator::numberOrStringTypeString =
    "number|string";
const gd::String ExpressionValidator::variableTypeString = "variable";
const gd::String ExpressionValidator::objectTypeString = "object";
const gd::String ExpressionValidator::emptyTypeString = "empty";

const gd::String& ExpressionValidator::TypeToString(Type type) {
  switch (type) {
    case Type::Unknown:
      return unknownTypeString;
    case Type::Number:
      return numberTypeString;
    case Type::String:
      return stringTypeString;
    case Type::NumberOrString:
      return numberOrStringTypeString;
    case Type::Variable:
      return variableTypeString;
    case Type::Object:
      return objectTypeString;
    case Type::Empty:
      return emptyTypeString;
  }
  return unknownTypeString;
}

ExpressionValidator::Type ExpressionValidator::StringToType(
    const gd::String& type) {
  if (type == ExpressionValidator::numberTypeString ||
      gd::ParameterMetadata::IsExpression(ExpressionValidator::numberTypeString,
                                          type)) {
    return Type::Number;
  }
  if (type == ExpressionValidator::stringTypeString ||
      gd::ParameterMetadata::IsExpression(ExpressionValidator::stringTypeString,
                                          type)) {
    return Type::String;
  }
  if (type == ExpressionValidator::numberOrStringTypeString) {
    return Type::NumberOrString;
  }
  if (type == ExpressionValidator::variableTypeString ||
      gd::ParameterMetadata::IsExpression(
          ExpressionValidator::variableTypeString, type)) {
    return Type::Variable;
  }
  if (type == ExpressionValidator::objectTypeString ||
      gd::ParameterMetadata::IsObject(type)) {
    return Type::Object;
  }
  return Type::Unknown;
}
}  // namespace gd
