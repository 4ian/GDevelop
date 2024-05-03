/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef FOREACHEVENT_H
#define FOREACHEVENT_H
#include <vector>

#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
namespace gd {
class Instruction;
class Project;
class Layout;
}

namespace gd {

/**
 * \brief Event repeated for each object of a list.
 *
 * Each time the event is repeated, only the specific object of the list is
 * picked.
 */
class GD_CORE_API ForEachEvent : public gd::BaseEvent {
 public:
  ForEachEvent();
  virtual ~ForEachEvent(){};
  virtual gd::ForEachEvent* Clone() const { return new ForEachEvent(*this); }

  virtual bool IsExecutable() const { return true; }

  virtual bool CanHaveSubEvents() const { return true; }
  virtual const gd::EventsList& GetSubEvents() const { return events; };
  virtual gd::EventsList& GetSubEvents() { return events; };

  const gd::InstructionsList& GetConditions() const { return conditions; };
  gd::InstructionsList& GetConditions() { return conditions; };

  const gd::InstructionsList& GetActions() const { return actions; };
  gd::InstructionsList& GetActions() { return actions; };

  const gd::String& GetObjectToPick() const {
    return objectsToPick.GetPlainString();
  };
  void SetObjectToPick(gd::String objectsToPick_) {
    objectsToPick = gd::Expression(objectsToPick_);
  };

  virtual std::vector<const gd::InstructionsList*> GetAllConditionsVectors()
      const;
  virtual std::vector<const gd::InstructionsList*> GetAllActionsVectors() const;
  virtual std::vector<std::pair<const gd::Expression*, const gd::ParameterMetadata> >
      GetAllExpressionsWithMetadata() const;

  virtual std::vector<gd::InstructionsList*> GetAllConditionsVectors();
  virtual std::vector<gd::InstructionsList*> GetAllActionsVectors();
  virtual std::vector<std::pair<gd::Expression*, gd::ParameterMetadata> >
      GetAllExpressionsWithMetadata();

  virtual void SerializeTo(SerializerElement& element) const;
  virtual void UnserializeFrom(gd::Project& project,
                               const SerializerElement& element);

 private:
  gd::Expression objectsToPick;
  gd::InstructionsList conditions;
  gd::InstructionsList actions;
  gd::EventsList events;
};

}  // namespace gd

#endif  // FOREACHEVENT_H
