/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#ifndef GDCORE_STANDARDEVENT_H
#define GDCORE_STANDARDEVENT_H
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/InstructionsList.h"
namespace gd {
class Instruction;
class Project;
}

namespace gd {

/**
 * \brief Standard event, with conditions, actions and support for sub events.
 */
class GD_CORE_API StandardEvent : public gd::BaseEvent {
 public:
  StandardEvent();
  virtual ~StandardEvent();
  virtual gd::StandardEvent* Clone() const { return new StandardEvent(*this); }

  virtual bool IsExecutable() const { return true; }

  virtual bool CanHaveSubEvents() const { return true; }
  virtual const gd::EventsList& GetSubEvents() const { return events; };
  virtual gd::EventsList& GetSubEvents() { return events; };

  const gd::InstructionsList& GetConditions() const { return conditions; };
  gd::InstructionsList& GetConditions() { return conditions; };

  const gd::InstructionsList& GetActions() const { return actions; };
  gd::InstructionsList& GetActions() { return actions; };

  virtual std::vector<const gd::InstructionsList*> GetAllConditionsVectors()
      const;
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
};

}  // namespace gd

#endif  // GDCORE_STANDARDEVENT_H
#endif
