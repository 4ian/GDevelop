/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef PARAMETER_METADATA_H
#define PARAMETER_METADATA_H
#include <map>
#include <memory>

#include "GDCore/String.h"
#include "GDCore/Extensions/Metadata/ValueTypeMetadata.h"

namespace gd {
class SerializerElement;
}  // namespace gd

namespace gd {

/**
 * \brief Describe a parameter of an instruction (action, condition) or of an
 * expression: type, user-friendly description, etc...
 *
 * \ingroup Events
 */
class GD_CORE_API ParameterMetadata {
 public:
  ParameterMetadata();
  virtual ~ParameterMetadata(){};

  /**
   * \brief Return the metadata of the parameter type.
   */
  gd::ValueTypeMetadata &GetValueTypeMetadata() { return valueTypeMetadata; }

  /**
   * \brief Return the metadata of the parameter type.
   */
  const gd::ValueTypeMetadata &GetValueTypeMetadata() const { return valueTypeMetadata; }

  /**
   * \brief Set the metadata of the parameter type.
   */
  ParameterMetadata &SetValueTypeMetadata(const gd::ValueTypeMetadata &valueTypeMetadata_) {
    valueTypeMetadata = valueTypeMetadata_;
    return *this;
  }

  /**
   * \brief Return the type of the parameter.
   * \see gd::ParameterMetadata::IsObject
   * \deprecated Use gd::ValueTypeMetadata instead.
   */
  const gd::String &GetType() const { return valueTypeMetadata.GetName(); }

  /**
   * \brief Set the type of the parameter.
   * \deprecated Use gd::ValueTypeMetadata instead.
   */
  ParameterMetadata &SetType(const gd::String &type_) {
    valueTypeMetadata.SetName(type_);
    return *this;
  }

  /**
   * \brief Return the name of the parameter.
   *
   * Name is optional, and won't be filled for most parameters of extensions.
   * It is useful when generating a function from events, where parameters must
   * be named.
   */
  const gd::String &GetName() const { return name; }

  /**
   * \brief Set the name of the parameter.
   *
   * Name is optional, and won't be filled for most parameters of extensions.
   * It is useful when generating a function from events, where parameters must
   * be named.
   */
  ParameterMetadata &SetName(const gd::String &name_) {
    name = name_;
    return *this;
  }

  /**
   * \brief Return an optional additional information, used for some parameters
   * with special type (for example, it can contains the type of object accepted
   * by the parameter).
   * \deprecated Use gd::ValueTypeMetadata instead.
   */
  const gd::String &GetExtraInfo() const { return valueTypeMetadata.GetExtraInfo(); }

  /**
   * \brief Set an optional additional information, used for some parameters
   * with special type (for example, it can contains the type of object accepted
   * by the parameter).
   * \deprecated Use gd::ValueTypeMetadata instead.
   */
  ParameterMetadata &SetExtraInfo(const gd::String &supplementaryInformation_) {
    valueTypeMetadata.SetExtraInfo(supplementaryInformation_);
    return *this;
  }

  /**
   * \brief Return true if the parameter is optional.
   * \deprecated Use gd::ValueTypeMetadata instead.
   */
  bool IsOptional() const { return valueTypeMetadata.IsOptional(); }

  /**
   * \brief Set if the parameter is optional.
   * \deprecated Use gd::ValueTypeMetadata instead.
   */
  ParameterMetadata &SetOptional(bool optional_ = true) {
    valueTypeMetadata.SetOptional(optional_);
    return *this;
  }

  /**
   * \brief Return the description of the parameter
   */
  const gd::String &GetDescription() const { return description; }

  /**
   * \brief Set the description of the parameter.
   */
  ParameterMetadata &SetDescription(const gd::String &description_) {
    description = description_;
    return *this;
  }

  /**
   * \brief Return true if the parameter is only meant to be completed during
   * compilation and must not be displayed to the user.
   */
  bool IsCodeOnly() const { return codeOnly; }

  /**
   * \brief Set if the parameter is only meant to be completed during
   * compilation and must not be displayed to the user.
   */
  ParameterMetadata &SetCodeOnly(bool codeOnly_ = true) {
    codeOnly = codeOnly_;
    return *this;
  }

  /**
   * \brief Get the default value for the parameter.
   */
  const gd::String &GetDefaultValue() const {
    return valueTypeMetadata.GetDefaultValue();
  }

  /**
   * \brief Set the default value, if the parameter is optional.
   */
  ParameterMetadata &SetDefaultValue(const gd::String &defaultValue_) {
    valueTypeMetadata.SetDefaultValue(defaultValue_);
    return *this;
  }

  /**
   * \brief Get the user friendly, long description for the parameter.
   */
  const gd::String &GetLongDescription() const { return longDescription; }

  /**
   * \brief Set the user friendly, long description for the parameter.
   */
  ParameterMetadata &SetLongDescription(const gd::String &longDescription_) {
    longDescription = longDescription_;
    return *this;
  }

  // TODO Remove these deprecated functions.

  /**
   * \brief Return true if the type of the parameter is representing one object
   * (or more, i.e: an object group).
   *
   * \see gd::ParameterMetadata::GetType
   * \deprecated Use gd::ValueTypeMetadata instead.
   */
  static bool IsObject(const gd::String &parameterType) {
    return gd::ValueTypeMetadata::IsTypeObject(parameterType);
  }

  /**
   * \brief Return true if the type of the parameter is "behavior".
   *
   * \see gd::ParameterMetadata::GetType
   * \deprecated Use gd::ValueTypeMetadata instead.
   */
  static bool IsBehavior(const gd::String &parameterType) {
    return gd::ValueTypeMetadata::IsTypeBehavior(parameterType);
  }

  /**
   * \brief Return true if the type of the parameter is an expression of the
   * given type.
   * \note If you had a new type of parameter, also add it in the IDE (
   * see EventsFunctionParametersEditor, ParameterRenderingService
   * and ExpressionAutocompletion) and in the EventsCodeGenerator.
   * \deprecated Use gd::ValueTypeMetadata instead.
   */
  static bool IsExpression(const gd::String &type,
                           const gd::String &parameterType) {
    return gd::ValueTypeMetadata::IsTypeExpression(type, parameterType);
  }

  /**
   * \brief Return the expression type from the parameter type.
   * Declinations of "number" and "string" types (like "forceMultiplier" or
   * "sceneName") are replaced by "number" and "string".
   * \deprecated Use gd::ValueTypeMetadata or gd::GetExpressionPrimitiveValueType instead.
   */
  static const gd::String &GetExpressionValueType(const gd::String &parameterType) {
    return gd::ValueTypeMetadata::GetExpressionPrimitiveValueType(parameterType);
  }

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

  // TODO: Deprecated public fields. Any direct usage should be moved to
  // getter/setter.

  gd::String description;  ///< Description shown in editor
  bool codeOnly;  ///< True if parameter is relative to code generation only,
                  ///< i.e. must not be shown in editor
 private:
  gd::ValueTypeMetadata valueTypeMetadata; ///< Parameter type
  gd::String longDescription;  ///< Long description shown in the editor.
  gd::String name;             ///< The name of the parameter to be used in code
                               ///< generation. Optional.
};

}  // namespace gd

#endif  // PARAMETER_METADATA_H
