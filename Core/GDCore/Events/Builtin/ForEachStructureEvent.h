/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef FOREACHSTRUCTUREEVENT_H
#define FOREACHSTRUCTUREEVENT_H
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
namespace gd {
class Instruction;
class Project;
class Layout;
}  // namespace gd

namespace gd {

/**
 * \brief Event repeated for each every child of a structure variable.
 */
class GD_CORE_API ForEachStructureEvent : public gd::BaseEvent {
 public:
  ForEachStructureEvent();
  virtual ~ForEachStructureEvent(){};
  virtual gd::ForEachStructureEvent* Clone() const {
    return new ForEachStructureEvent(*this);
  }

  virtual bool IsExecutable() const { return true; }

  virtual bool CanHaveSubEvents() const { return true; }
  virtual const gd::EventsList& GetSubEvents() const { return events; };
  virtual gd::EventsList& GetSubEvents() { return events; };

  const gd::InstructionsList& GetConditions() const { return conditions; };
  gd::InstructionsList& GetConditions() { return conditions; };

  const gd::InstructionsList& GetActions() const { return actions; };
  gd::InstructionsList& GetActions() { return actions; };

  /**
   * \brief Get the structure attached to the event.
   *
   * The structure is the structure variable that will be iterated on.
   */
  const gd::String& GetStructure() const { return structure; };

  /**
   * \brief Set the structure attached to the event.
   *
   * The structure is the structure variable that will be iterated on.
   */
  void SetStructure(gd::String newStructure) { structure = newStructure; };

  /**
   * \brief Get the variable attached to the event.
   *
   * The variable is the variable that will contain the value of the linked
   * child of the iteration.
   */
  const gd::String& GetVariable() const { return variable; };

  /**
   * \brief Set the variable attached to the event.
   *
   * The variable is the variable that will contain the value of the linked
   * child of the iteration.
   */
  void SetVariable(gd::String newVariable) { variable = newVariable; };

  virtual std::vector<const gd::InstructionsList*> GetAllConditionsVectors()
      const;
  virtual std::vector<const gd::InstructionsList*> GetAllActionsVectors() const;

  virtual std::vector<gd::InstructionsList*> GetAllConditionsVectors();
  virtual std::vector<gd::InstructionsList*> GetAllActionsVectors();

  virtual void SerializeTo(SerializerElement& element) const;
  virtual void UnserializeFrom(gd::Project& project,
                               const SerializerElement& element);

 private:
  gd::String structure;
  gd::String variable;
  gd::InstructionsList conditions;
  gd::InstructionsList actions;
  gd::EventsList events;
};

}  // namespace gd

#endif  // FOREACHEVENT_H
