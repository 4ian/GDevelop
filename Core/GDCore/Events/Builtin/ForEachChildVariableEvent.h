/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef FOREACHCHILDVARIABLEEVENT_H
#define FOREACHCHILDVARIABLEEVENT_H
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Expression.h"
#include "GDCore/Project/VariablesContainer.h"
namespace gd {
class Instruction;
class Project;
class Layout;
}  // namespace gd

namespace gd {

/**
 * \brief Event repeated for each every child of a structure variable.
 */
class GD_CORE_API ForEachChildVariableEvent : public gd::BaseEvent {
 public:
  ForEachChildVariableEvent();
  virtual ~ForEachChildVariableEvent(){};
  virtual gd::ForEachChildVariableEvent* Clone() const override {
    return new ForEachChildVariableEvent(*this);
  }

  virtual bool IsExecutable() const override { return true; }

  virtual bool CanHaveSubEvents() const override { return true; }
  virtual const gd::EventsList& GetSubEvents() const override { return events; };
  virtual gd::EventsList& GetSubEvents() override { return events; };

  virtual bool CanHaveVariables() const override { return true; }
  virtual const gd::VariablesContainer& GetVariables() const override {
    return variables;
  };
  virtual gd::VariablesContainer& GetVariables() override { return variables; };

  const gd::InstructionsList& GetConditions() const { return conditions; };
  gd::InstructionsList& GetConditions() { return conditions; };

  const gd::InstructionsList& GetActions() const { return actions; };
  gd::InstructionsList& GetActions() { return actions; };

  virtual gd::InstructionsList* GetInstructionList(const gd::String& label) override;
  virtual const gd::InstructionsList* GetInstructionList(const gd::String& label) const override;

  /**
   * \brief Get the iterable variable name attached to the event.
   *
   * It is the structure variable that will be iterated on.
   */
  const gd::String& GetIterableVariableName() const { return iterableVariableName.GetPlainString(); };

  /**
   * \brief Set the iterable variable name attached to the event.
   *
   * It is the structure variable that will be iterated on.
   */
  void SetIterableVariableName(gd::String newName) { iterableVariableName = newName; };

  /**
   * \brief Get the value iterator variable attached to the event.
   *
   * It is the variable that will contain the value of the
   * iterable's child being iterated on.
   */
  const gd::String& GetValueIteratorVariableName() const { return valueIteratorVariableName.GetPlainString(); };

  /**
   * \brief Set the value iterator variable attached to the event.
   *
   * It is the variable that will contain the value of the
   * iterable's child being iterated on.
   */
  void SetValueIteratorVariableName(gd::String newName) { valueIteratorVariableName = newName; };

  /**
   * \brief Get the key iterator variable attached to the event.
   *
   * It is the variable that will contain the name of the
   * iterable's child being iterated on.
   */
  const gd::String& GetKeyIteratorVariableName() const { return keyIteratorVariableName.GetPlainString(); };

  /**
   * \brief Set the key iterator variable attached to the event.
   *
   * It is the variable that will contain the name of the
   * iterable's child being iterated on.
   */
  void SetKeyIteratorVariableName(gd::String newName) { keyIteratorVariableName = newName; };

  const gd::String& GetLoopIndexVariableName() const { return loopIndexVariableName; }
  void SetLoopIndexVariableName(const gd::String& name) { loopIndexVariableName = name; }

  virtual std::vector<const gd::InstructionsList*> GetAllConditionsVectors()
      const override;
  virtual std::vector<const gd::InstructionsList*> GetAllActionsVectors() const override;

  virtual std::vector<gd::InstructionsList*> GetAllConditionsVectors() override;
  virtual std::vector<gd::InstructionsList*> GetAllActionsVectors() override;

  virtual std::vector<std::pair<const gd::Expression*, const gd::ParameterMetadata> >
        GetAllExpressionsWithMetadata() const override;
  virtual std::vector<std::pair<gd::Expression*, gd::ParameterMetadata> >
        GetAllExpressionsWithMetadata() override;

  virtual void SerializeTo(SerializerElement& element) const override;
  virtual void UnserializeFrom(gd::Project& project,
                               const SerializerElement& element) override;

 private:
  gd::Expression valueIteratorVariableName;
  gd::Expression keyIteratorVariableName;
  gd::Expression iterableVariableName;
  gd::InstructionsList conditions;
  gd::InstructionsList actions;
  gd::EventsList events;
  VariablesContainer variables;
  gd::String loopIndexVariableName;
};

}  // namespace gd

#endif  // FOREACHEVENT_H
