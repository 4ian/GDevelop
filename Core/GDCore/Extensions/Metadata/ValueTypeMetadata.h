/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef VALUE_TYPE_METADATA_H
#define VALUE_TYPE_METADATA_H
#include <map>
#include <memory>

#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}  // namespace gd

namespace gd {

/**
 * \brief Define a type for parameters of a function (action, condition or
 * expression) or the returned value of an expression.
 *
 * \see gd::EventsFunction
 * \ingroup Events
 */
class GD_CORE_API ValueTypeMetadata {
 public:
  ValueTypeMetadata();
  virtual ~ValueTypeMetadata(){};

  /**
   * \brief Return the string representation of the type.
   */
  const gd::String &GetName() const { return name; }

  /**
   * \brief Set the string representation of the type.
   */
  ValueTypeMetadata &SetName(const gd::String &name_) {
    name = name_;
    return *this;
  }

  /**
   * \brief Return an optional additional information, used for some parameters
   * with special type (for example, it can contains the type of object accepted
   * by the parameter).
   */
  const gd::String &GetExtraInfo() const { return supplementaryInformation; }

  /**
   * \brief Set an optional additional information, used for some parameters
   * with special type (for example, it can contains the type of object accepted
   * by the parameter).
   */
  ValueTypeMetadata &SetExtraInfo(const gd::String &supplementaryInformation_) {
    supplementaryInformation = supplementaryInformation_;
    return *this;
  }

  /**
   * \brief Return true if the parameter is optional.
   */
  bool IsOptional() const { return optional; }

  /**
   * \brief Set if the parameter is optional.
   */
  ValueTypeMetadata &SetOptional(bool optional_ = true) {
    optional = optional_;
    return *this;
  }

  /**
   * \brief Get the default value for the parameter.
   */
  const gd::String &GetDefaultValue() const { return defaultValue; }

  /**
   * \brief Set the default value, if the parameter is optional.
   */
  ValueTypeMetadata &SetDefaultValue(const gd::String &defaultValue_) {
    defaultValue = defaultValue_;
    return *this;
  }

  /**
   * \brief Return true if the type is defined.
   */
  bool IsDefined() const {
    return !name.empty();
  }

  /**
   * \brief Return true if the type is representing one object
   * (or more, i.e: an object group).
   */
  bool IsObject() const {
    return gd::ValueTypeMetadata::IsTypeObject(name);
  }

  /**
   * \brief Return true if the type is "behavior".
   */
  bool IsBehavior() const {
    return gd::ValueTypeMetadata::IsTypeBehavior(name);
  }

  /**
   * \brief Return true if the type is an expression of the
   * given type.
   */
  bool IsNumber() const {
    return gd::ValueTypeMetadata::IsTypeExpression("number", name);
  }

  /**
   * \brief Return true if the type is a string.
   */
  bool IsString() const {
    return gd::ValueTypeMetadata::IsTypeExpression("string", name);
  }

  /**
   * \brief Return true if the type is a boolean.
   */
  bool IsBoolean() const {
    return gd::ValueTypeMetadata::IsTypeExpression("boolean", name);
  }

  /**
   * \brief Return true if the type of the parameter is a number.
   * \note If you had a new type of parameter, also add it in the IDE (
   * see EventsFunctionParametersEditor, ParameterRenderingService
   * and ExpressionAutocompletion) and in the EventsCodeGenerator.
   */
  bool IsVariable() const {
    return gd::ValueTypeMetadata::IsTypeExpression("variable", name);
  }

  /**
   * \brief Return true if the type is a variable but from a specific scope
   * (scene, project or object). In new code, prefer to use the more generic "variable"
   * parameter (which accepts any variable coming from an object or from containers in the scope).
   */
  bool IsLegacyPreScopedVariable() const {
    return gd::ValueTypeMetadata::IsTypeLegacyPreScopedVariable(name);
  }

  /**
   * \brief Return true if the type is a variable but from a specific scope
   * (scene, project or object). In new code, prefer to use the more generic "variable"
   * parameter (which accepts any variable coming from an object or from containers in the scope).
   */
  static bool IsTypeLegacyPreScopedVariable(const gd::String &type) {
    return type == "scenevar" || type == "globalvar" || type == "objectvar";
  }

  /**
   * \brief Return true if the type is representing one object
   * (or more, i.e: an object group).
   */
  static bool IsTypeObject(const gd::String &parameterType) {
    return parameterType == "object" || parameterType == "objectPtr" ||
           parameterType == "objectList" ||
           parameterType == "objectListOrEmptyIfJustDeclared" ||
           parameterType == "objectListOrEmptyWithoutPicking";
  }

  /**
   * \brief Return true if the type is "behavior".
   */
  static bool IsTypeBehavior(const gd::String &parameterType) {
    return parameterType == "behavior";
  }

  /**
   * \brief Return true if the type is an expression of the given type.
   * \note If you are adding a new type of parameter, also add it in the IDE (
   * see EventsFunctionParametersEditor, ParameterRenderingService
   * and ExpressionAutocompletion) and in the EventsCodeGenerator.
   */
  static bool IsTypeExpression(const gd::String &type,
                           const gd::String &parameterType) {
    if (type == "number") {
      return parameterType == "number" || parameterType == "expression" ||
             parameterType == "camera" || parameterType == "forceMultiplier";
    } else if (type == "string") {
      return parameterType == "string" || parameterType == "layer" ||
             parameterType == "color" || parameterType == "file" ||
             parameterType == "stringWithSelector" ||
             parameterType == "sceneName" ||
             parameterType == "layerEffectName" ||
             parameterType == "layerEffectParameterName" ||
             parameterType == "objectEffectName" ||
             parameterType == "objectEffectParameterName" ||
             parameterType == "objectPointName" ||
             parameterType == "objectAnimationName" ||
             parameterType == "functionParameterName" ||
             parameterType == "externalLayoutName" ||
             parameterType == "leaderboardId" ||
             parameterType == "identifier";
    } else if (type == "boolean") {
      return parameterType == "yesorno" || parameterType == "trueorfalse";
    } else if (type == "variable") {
      return
             parameterType == "variable" || // Any variable.
             // Old, "pre-scoped" variables:
             parameterType == "objectvar" || parameterType == "globalvar" ||
             parameterType == "scenevar";
    } else if (type == "resource") {
      return parameterType == "fontResource" ||
             parameterType == "soundfile" ||
             parameterType == "musicfile" ||
             parameterType == "bitmapFontResource" ||
             parameterType == "imageResource" ||
             parameterType == "jsonResource" ||
             parameterType == "tilemapResource" ||
             parameterType == "tilesetResource" ||
             parameterType == "model3DResource" ||
             parameterType == "atlasResource" ||
             parameterType == "spineResource";
    }
    return false;
  }

  /**
   * \brief Return the expression type from the parameter type.
   * Declinations of "number" and "string" types (like "forceMultiplier" or
   * "sceneName") are replaced by "number" and "string".
   *
   * \note It only maps string and number types.
   */
  static const gd::String &GetExpressionPrimitiveValueType(const gd::String &parameterType);

  /**
   * \brief Return the primitive type from the parameter type.
   * Declinations of "number" and "string" types (like "forceMultiplier" or
   * "sceneName") are replaced by "number" and "string".
   *
   * \note It also maps variable and boolean types.
   */
  static const gd::String &GetPrimitiveValueType(const gd::String &parameterType);
  static const gd::String numberType;
  static const gd::String stringType;
  static const gd::String variableType;
  static const gd::String booleanType;

  /**
   * \brief Return the ValueTypeMetadata name for a property type.
   * \see gd::PropertyDescriptor
   */
  static const gd::String &ConvertPropertyTypeToValueType(const gd::String &propertyType);

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the ParameterMetadata to the specified element
   */
  void SerializeTo(gd::SerializerElement &element) const;

  /**
   * \brief Load the ParameterMetadata from the specified element
   */
  void UnserializeFrom(const gd::SerializerElement &element);
  ///@}

 private:
  gd::String name;                      ///< Parameter type
  gd::String supplementaryInformation;  ///< Used if needed
  bool optional;                        ///< True if the parameter is optional
  gd::String defaultValue;     ///< Used as a default value in editor or if an
                               ///< optional parameter is empty.

  static const gd::String numberValueType;
  static const gd::String booleanValueType;
  static const gd::String colorValueType;
  static const gd::String choiceValueType;
  static const gd::String stringValueType;
};

}  // namespace gd

#endif  // VALUE_TYPE_METADATA_H
