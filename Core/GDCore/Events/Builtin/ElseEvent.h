/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/InstructionsList.h"
#include "GDCore/Project/VariablesContainer.h"

namespace gd {
class Project;

/**
 * \brief Else event, with optional conditions, actions and support for sub events.
 */
class GD_CORE_API ElseEvent : public gd::BaseEvent {
 public:
  ElseEvent();
  virtual ~ElseEvent();
  virtual gd::ElseEvent* Clone() const override { return new ElseEvent(*this); }

  virtual bool IsExecutable() const override { return true; }

  virtual bool CanHaveSubEvents() const override { return true; }
  virtual const gd::EventsList& GetSubEvents() const override { return events; };
  virtual gd::EventsList& GetSubEvents() override { return events; };

  virtual bool CanHaveVariables() const override { return true; }
  virtual const gd::VariablesContainer& GetVariables() const override { return variables; };
  virtual gd::VariablesContainer& GetVariables() override { return variables; };

  const gd::InstructionsList& GetConditions() const { return conditions; };
  gd::InstructionsList& GetConditions() { return conditions; };

  const gd::InstructionsList& GetActions() const { return actions; };
  gd::InstructionsList& GetActions() { return actions; };

  virtual gd::InstructionsList* GetInstructionList(const gd::String& label) override;
  virtual const gd::InstructionsList* GetInstructionList(const gd::String& label) const override;

  virtual std::vector<const gd::InstructionsList*> GetAllConditionsVectors() const override;
  virtual std::vector<const gd::InstructionsList*> GetAllActionsVectors() const override;
  virtual std::vector<gd::InstructionsList*> GetAllConditionsVectors() override;
  virtual std::vector<gd::InstructionsList*> GetAllActionsVectors() override;

  virtual void SerializeTo(SerializerElement& element) const override;
  virtual void UnserializeFrom(gd::Project& project,
                               const SerializerElement& element) override;

 private:
  gd::InstructionsList conditions;
  gd::InstructionsList actions;
  EventsList events;
  VariablesContainer variables;
};

}  // namespace gd

