/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_ARBITRARYEVENTSWORKER_H
#define GDCORE_ARBITRARYEVENTSWORKER_H
#include <map>
#include <memory>
#include <vector>
#include "GDCore/Events/InstructionsList.h"
#include "GDCore/Events/EventVisitor.h"
#include "GDCore/Project/ObjectsContainersList.h"
#include "GDCore/String.h"
namespace gd {
class Instruction;
class BaseEvent;
class LinkEvent;
class EventsList;
class ObjectsContainer;
}  // namespace gd

namespace gd {

/**
 * \brief ArbitraryEventsWorker is an abstract class used to browse events (and
 * instructions) and do some work on them. Can be used to implement refactoring
 * for example.
 *
 * \see gd::ArbitraryEventsWorkerWithContext
 *
 * \ingroup IDE
 */
class GD_CORE_API ArbitraryEventsWorker : private EventVisitor {
 public:
  ArbitraryEventsWorker(){};
  virtual ~ArbitraryEventsWorker();

  /**
   * \brief Launch the worker on the specified events list.
   */
  void Launch(gd::EventsList& events) { VisitEventList(events); };

 private:
  void VisitEventList(gd::EventsList& events);
  bool VisitEvent(gd::BaseEvent& event) override;
  bool VisitLinkEvent(gd::LinkEvent& linkEvent) override;
  void VisitInstructionList(gd::InstructionsList& instructions,
                            bool areConditions);
  bool VisitInstruction(gd::Instruction& instruction, bool isCondition);

  /**
   * Called to do some work on an event list.
   */
  virtual void DoVisitEventList(gd::EventsList& events){};

  /**
   * Called to do some work on an event
   * \return true if the event must be deleted from the events list, false
   * otherwise (default).
   */
  virtual bool DoVisitEvent(gd::BaseEvent& event) { return false; };

  /**
   * Called to do some work on a link event.
   *
   * Note that DoVisitEvent is also called with this event.
   *
   * \return true if the event must be deleted from the events list, false
   * otherwise (default).
   */
  virtual bool DoVisitLinkEvent(gd::LinkEvent& event) { return false; };

  /**
   * Called to do some work on an instruction list
   */
  virtual void DoVisitInstructionList(gd::InstructionsList& instructions,
                                      bool areConditions){};

  /**
   * Called to do some work on an instruction.
   * \return true if the instruction must be deleted from the list, false
   * otherwise (default).
   */
  virtual bool DoVisitInstruction(gd::Instruction& instruction,
                                  bool isCondition) {
    return false;
  };
};

/**
 * \brief An events worker that will know about the context (the objects
 * container). Useful for workers working on expressions notably.
 *
 * \see gd::ArbitraryEventsWorker
 *
 * \ingroup IDE
 */
class GD_CORE_API ArbitraryEventsWorkerWithContext
    : public ArbitraryEventsWorker {
 public:
  ArbitraryEventsWorkerWithContext()
      : currentGlobalObjectsContainer(nullptr),
        currentObjectsContainer(nullptr){};
  virtual ~ArbitraryEventsWorkerWithContext();

  /**
   * \brief Launch the worker on the specified events list,
   * giving the objects container on which the events are applying to.
   */
  void Launch(gd::EventsList& events,
              const gd::ObjectsContainer& globalObjectsContainer_,
              const gd::ObjectsContainer& objectsContainer_) {
    currentGlobalObjectsContainer = &globalObjectsContainer_;
    currentObjectsContainer = &objectsContainer_;
    ArbitraryEventsWorker::Launch(events);
  };

  void Launch(gd::EventsList& events) = delete;

 protected:
  const gd::ObjectsContainer& GetGlobalObjectsContainer() {
    // Pointers are guaranteed to be not nullptr after
    // Launch was called.
    return *currentGlobalObjectsContainer;
  };
  const gd::ObjectsContainer& GetObjectsContainer() {
    // Pointers are guaranteed to be not nullptr after
    // Launch was called.
    return *currentObjectsContainer;
  };

  gd::ObjectsContainersList GetObjectsContainersList() {
    return gd::ObjectsContainersList::MakeNewObjectsContainersListForContainers(
      *currentGlobalObjectsContainer,
      *currentObjectsContainer
    );
  }

 private:
  const gd::ObjectsContainer* currentGlobalObjectsContainer;
  const gd::ObjectsContainer* currentObjectsContainer;
};

/**
 * \brief ReadOnlyArbitraryEventsWorker is an abstract class used to browse events (and
 * instructions). It can be used to implement autocompletion for example.
 *
 * \see gd::ReadOnlyArbitraryEventsWorkerWithContext
 *
 * \ingroup IDE
 */
class GD_CORE_API ReadOnlyArbitraryEventsWorker : private ReadOnlyEventVisitor {
 public:
  ReadOnlyArbitraryEventsWorker() : shouldStopIteration(false) {};
  virtual ~ReadOnlyArbitraryEventsWorker();

  /**
   * \brief Launch the worker on the specified events list.
   */
  void Launch(const gd::EventsList& events) { VisitEventList(events); };

protected:
  void StopAnyEventIteration() override;

 private:
  void VisitEventList(const gd::EventsList& events);
  void VisitEvent(const gd::BaseEvent& event) override;
  void VisitLinkEvent(const gd::LinkEvent& linkEvent) override;
  void VisitInstructionList(const gd::InstructionsList& instructions,
                            bool areConditions);
  void VisitInstruction(const gd::Instruction& instruction, bool isCondition);

  /**
   * Called to do some work on an event list.
   */
  virtual void DoVisitEventList(const gd::EventsList& events){};

  /**
   * Called to do some work on an event
   */
  virtual void DoVisitEvent(const gd::BaseEvent& event) {};

  /**
   * Called to do some work on a link event.
   *
   * Note that DoVisitEvent is also called with this event.
   */
  virtual void DoVisitLinkEvent(const gd::LinkEvent& linkEvent) {};

  /**
   * Called to do some work on an instruction list
   */
  virtual void DoVisitInstructionList(const gd::InstructionsList& instructions,
                                      bool areConditions){};

  /**
   * Called to do some work on an instruction.
   */
  virtual void DoVisitInstruction(const gd::Instruction& instruction,
                                  bool isCondition) {};

  bool shouldStopIteration;
};

/**
 * \brief An events worker that will know about the context (the objects
 * container). Useful for workers working on expressions notably.
 *
 * \see gd::ReadOnlyArbitraryEventsWorker
 *
 * \ingroup IDE
 */
class GD_CORE_API ReadOnlyArbitraryEventsWorkerWithContext
    : public ReadOnlyArbitraryEventsWorker {
 public:
  ReadOnlyArbitraryEventsWorkerWithContext()
      : currentGlobalObjectsContainer(nullptr),
        currentObjectsContainer(nullptr){};
  virtual ~ReadOnlyArbitraryEventsWorkerWithContext();

  /**
   * \brief Launch the worker on the specified events list,
   * giving the objects container on which the events are applying to.
   */
  void Launch(const gd::EventsList& events,
              const gd::ObjectsContainer& globalObjectsContainer_,
              const gd::ObjectsContainer& objectsContainer_) {
    currentGlobalObjectsContainer = &globalObjectsContainer_;
    currentObjectsContainer = &objectsContainer_;
    ReadOnlyArbitraryEventsWorker::Launch(events);
  };

  void Launch(gd::EventsList& events) = delete;

 protected:
  const gd::ObjectsContainer& GetGlobalObjectsContainer() {
    // Pointers are guaranteed to be not nullptr after
    // Launch was called.
    return *currentGlobalObjectsContainer;
  };
  const gd::ObjectsContainer& GetObjectsContainer() {
    // Pointers are guaranteed to be not nullptr after
    // Launch was called.
    return *currentObjectsContainer;
  };

 private:
  const gd::ObjectsContainer* currentGlobalObjectsContainer;
  const gd::ObjectsContainer* currentObjectsContainer;
};

}  // namespace gd

#endif  // GDCORE_ARBITRARYEVENTSWORKER_H
