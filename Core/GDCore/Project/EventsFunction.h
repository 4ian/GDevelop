/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef GDCORE_EVENTSFUNCTION_H
#define GDCORE_EVENTSFUNCTION_H

#include <vector>

#include "GDCore/Events/EventsList.h"
#include "GDCore/Project/ObjectGroupsContainer.h"
#include "GDCore/String.h"
// TODO: In theory (for separation of concerns between Project and
// extensions/events), this include should be removed and gd::ParameterMetadata
// replaced by a new gd::EventsFunctionParameter class.
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
namespace gd {
class SerializerElement;
class Project;
}  // namespace gd

namespace gd {

/**
 * \brief Events that can be generated as a stand-alone function, and used
 * as a condition, action or expression.
 *
 * \note The code generation can be done using gd::EventsCodeGenerator
 *
 * \note The conversion to an extension is not in GDCore and should be done
 * by the IDE (see EventsFunctionsExtensionsLoader)
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API EventsFunction {
 public:
  EventsFunction();
  virtual ~EventsFunction(){};

  /**
   * \brief Return a pointer to a new EventsFunction constructed from
   * this one.
   */
  EventsFunction* Clone() const { return new EventsFunction(*this); };

  /**
   * \brief Get the description of the function, that is displayed in the
   * editor.
   */
  const gd::String& GetDescription() const { return description; };

  /**
   * \brief Set the description of the function, to be displayed in the editor.
   */
  EventsFunction& SetDescription(const gd::String& description_) {
    description = description_;
    return *this;
  }

  /**
   * \brief Get the name of the function, to be used for the
   * action/condition/expression name.
   */
  const gd::String& GetName() const { return name; };

  /**
   * \brief Set the name of the function, to be used for the
   * action/condition/expression name.
   */
  EventsFunction& SetName(const gd::String& name_) {
    name = name_;
    return *this;
  }

  /**
   * \brief Get the name of the function, that is displayed in the editor.
   */
  const gd::String& GetFullName() const { return fullName; };

  /**
   * \brief Set the name of the function, to be displayed in the editor.
   */
  EventsFunction& SetFullName(const gd::String& fullName_) {
    fullName = fullName_;
    return *this;
  }

  /**
   * \brief Get the sentence of the function, that is used for the
   * condition/action in the Events Editor.
   */
  const gd::String& GetSentence() const { return sentence; };

  /**
   * \brief Set the sentence of the function, to be used for the
   * condition/action in the Events Editor.
   */
  EventsFunction& SetSentence(const gd::String& sentence_) {
    sentence = sentence_;
    return *this;
  }

  /**
   * \brief Get the group of the instruction in the editor.
   */
  const gd::String& GetGroup() const { return group; };

  /**
   * \brief Set the group of the instruction in the editor.
   */
  EventsFunction& SetGroup(const gd::String& group_) {
    group = group_;
    return *this;
  }

  enum FunctionType { Action, Condition, Expression, StringExpression, ExpressionAndCondition, StringExpressionAndCondition };

  /**
   * \brief Set the type of the function
   */
  EventsFunction& SetFunctionType(FunctionType type) {
    functionType = type;
    return *this;
  }

  /**
   * \brief Get the type of the function
   */
  FunctionType GetFunctionType() const { return functionType; }

  /**
   * \brief Return true if the function is an action.
   */
  bool IsAction() const {
    return functionType == gd::EventsFunction::Action;
 }

  /**
   * \brief Return true if the function is an expression.
   * 
   * Note that a function can be both an expression and a condition.
   */
  bool IsExpression() const {
    return functionType == gd::EventsFunction::Expression ||
           functionType == gd::EventsFunction::StringExpression ||
           functionType == gd::EventsFunction::ExpressionAndCondition ||
           functionType == gd::EventsFunction::StringExpressionAndCondition;
 }

  /**
   * \brief Return true if the function is a condition.
   * 
   * Note that a function can be both an expression and a condition.
   */
  bool IsCondition() const {
    return functionType == gd::EventsFunction::Condition ||
           functionType == gd::EventsFunction::ExpressionAndCondition ||
           functionType == gd::EventsFunction::StringExpressionAndCondition;
 }

  /**
   * \brief Returns true if the function is private.
   */
  bool IsPrivate() { return isPrivate; }

  /**
   * \brief Sets the privateness of the function.
   */
  EventsFunction& SetPrivate(bool _isPrivate) {
    isPrivate = _isPrivate;
    return *this;
  }

  /**
   * \brief Return the events.
   */
  const gd::EventsList& GetEvents() const { return events; };

  /**
   * \brief Return the events.
   */
  gd::EventsList& GetEvents() { return events; };

  /**
   * \brief Return the parameters of the function.
   *
   * \note During code/extension generation, new parameters are added
   * to the generated function, like "runtimeScene" and "eventsFunctionContext".
   * This should be transparent to the user.
   */
  const std::vector<gd::ParameterMetadata>& GetParameters() const {
    return parameters;
  };

  /**
   * \brief Return the parameters.
   */
  std::vector<gd::ParameterMetadata>& GetParameters() { return parameters; };

  /**
   * \brief Return a reference to the object groups that can be used in the
   * function.
   */
  ObjectGroupsContainer& GetObjectGroups() { return objectGroups; }

  /**
   * \brief Return a const reference to the object groups that can be used in
   * the function.
   */
  const ObjectGroupsContainer& GetObjectGroups() const { return objectGroups; }

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the EventsFunction to the specified element
   */
  void SerializeTo(gd::SerializerElement& element) const;

  /**
   * \brief Load the EventsFunction from the specified element
   */
  void UnserializeFrom(gd::Project& project,
                       const gd::SerializerElement& element);
  ///@}

 private:
  gd::String name;
  gd::String fullName;
  gd::String description;
  gd::String sentence;
  gd::String group;
  gd::EventsList events;
  FunctionType functionType;
  std::vector<gd::ParameterMetadata> parameters;
  gd::ObjectGroupsContainer objectGroups;
  bool isPrivate = false;
};

}  // namespace gd

#endif  // GDCORE_EVENTSFUNCTION_H
#endif
