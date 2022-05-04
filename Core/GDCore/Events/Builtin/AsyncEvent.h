/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_ASYNCEVENT_H
#define GDCORE_ASYNCEVENT_H
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/InstructionsList.h"
namespace gd {
class Instruction;
class Project;
} // namespace gd

namespace gd {

/**
 * \brief Internal event for asynchronous actions.
 * This event gets added internally to the events tree when an
 * asynchronous action is used.
 */
class GD_CORE_API AsyncEvent : public gd::BaseEvent {
public:
  AsyncEvent();
  AsyncEvent(const gd::Instruction &asyncAction_,
             const gd::InstructionsList &actions_,
             const gd::EventsList &subEvents_)
      : asyncAction(asyncAction_), actions(actions_), subEvents(subEvents_) {
    SetType("BuiltinAsync::Async");
  };
  virtual ~AsyncEvent();
  virtual gd::AsyncEvent *Clone() const { return new AsyncEvent(*this); }

  virtual bool IsExecutable() const { return true; }

  virtual bool CanHaveSubEvents() const { return true; }
  virtual const gd::EventsList &GetSubEvents() const { return subEvents; };
  virtual gd::EventsList &GetSubEvents() { return subEvents; };

  const gd::InstructionsList &GetActions() const { return actions; };
  gd::InstructionsList &GetActions() { return actions; };

  const gd::Instruction &GetInstruction() const { return asyncAction; };
  gd::Instruction &GetInstruction() { return asyncAction; };

  virtual std::vector<const gd::InstructionsList *>
  GetAllActionsVectors() const;
  virtual std::vector<gd::InstructionsList *> GetAllActionsVectors();

private:
  gd::Instruction asyncAction;
  gd::InstructionsList actions;
  EventsList subEvents;
};

} // namespace gd

#endif // GDCORE_STANDARDEVENT_H
