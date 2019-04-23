/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_WHILEEVENT_H
#define GDCORE_WHILEEVENT_H
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
namespace gd {
class Instruction;
class Project;
}

namespace gd {

/**
 * \brief While event is a standard event that is repeated while some conditions
 * are true
 *
 * \note The platforms are required to warn the user about a possible infinite
 * loop if the iteration count reach 100 000 and if HasInfiniteLoopWarning()
 * returns true.
 */
class GD_CORE_API WhileEvent : public gd::BaseEvent {
 public:
  WhileEvent() : infiniteLoopWarning(true), justCreatedByTheUser(true){};
  virtual ~WhileEvent(){};
  virtual gd::WhileEvent* Clone() const { return new WhileEvent(*this); }

  virtual bool IsExecutable() const { return true; }

  virtual bool CanHaveSubEvents() const { return true; }
  virtual const gd::EventsList& GetSubEvents() const { return events; };
  virtual gd::EventsList& GetSubEvents() { return events; };

  const gd::InstructionsList& GetConditions() const { return conditions; };
  gd::InstructionsList& GetConditions() { return conditions; };

  const gd::InstructionsList& GetActions() const { return actions; };
  gd::InstructionsList& GetActions() { return actions; };

  const gd::InstructionsList& GetWhileConditions() const {
    return whileConditions;
  };
  gd::InstructionsList& GetWhileConditions() { return whileConditions; };
  void SetWhileConditions(gd::InstructionsList& whileConditions_) {
    whileConditions = whileConditions_;
  };

  bool HasInfiniteLoopWarning() const { return infiniteLoopWarning; }

  virtual std::vector<gd::InstructionsList*> GetAllConditionsVectors();
  virtual std::vector<gd::InstructionsList*> GetAllActionsVectors();
  virtual std::vector<const gd::InstructionsList*> GetAllConditionsVectors()
      const;
  virtual std::vector<const gd::InstructionsList*> GetAllActionsVectors() const;

  virtual void SerializeTo(SerializerElement& element) const;
  virtual void UnserializeFrom(gd::Project& project,
                               const SerializerElement& element);

 private:
  gd::InstructionsList whileConditions;
  gd::InstructionsList conditions;
  gd::InstructionsList actions;
  EventsList events;
  bool infiniteLoopWarning;   ///< If true, code will be generated to warn the
                              ///< developer against an infinite loop.
  bool justCreatedByTheUser;  ///< Used so as not to show message box to
                              ///< de/activate infinite loop warning when the
                              ///< user create the event

  mutable unsigned int whileConditionsHeight;

  int GetConditionsHeight() const;
  int GetActionsHeight() const;
  int GetWhileConditionsHeight() const;
};

}  // namespace gd

#endif  // GDCORE_WHILEEVENT_H
