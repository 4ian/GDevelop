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
  virtual gd::ElseEvent* Clone() const { return new ElseEvent(*this); }

  virtual bool IsExecutable() const { return true; }

  virtual bool CanHaveSubEvents() const { return true; }
  virtual const gd::EventsList& GetSubEvents() const { return events; };
  virtual gd::EventsList& GetSubEvents() { return events; };

  virtual bool CanHaveVariables() const { return true; }
  virtual const gd::VariablesContainer& GetVariables() const { return variables; };
  virtual gd::VariablesContainer& GetVariables() { return variables; };

  const gd::InstructionsList& GetConditions() const { return conditions; };
  gd::InstructionsList& GetConditions() { return conditions; };

  const gd::InstructionsList& GetActions() const { return actions; };
  gd::InstructionsList& GetActions() { return actions; };

  virtual std::vector<const gd::InstructionsList*> GetAllConditionsVectors() const;
  virtual std::vector<const gd::InstructionsList*> GetAllActionsVectors() const;
  virtual std::vector<gd::InstructionsList*> GetAllConditionsVectors();
  virtual std::vector<gd::InstructionsList*> GetAllActionsVectors();

  virtual void SerializeTo(SerializerElement& element) const;
  virtual void UnserializeFrom(gd::Project& project,
                               const SerializerElement& element);

 private:
  gd::InstructionsList conditions;
  gd::InstructionsList actions;
  EventsList events;
  VariablesContainer variables;
};

}  // namespace gd

