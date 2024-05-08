/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <map>
#include <memory>
#include <vector>
#include "GDCore/Events/InstructionsList.h"
#include "GDCore/Events/EventVisitor.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/String.h"

namespace gd {
class Instruction;
class BaseEvent;
class LinkEvent;
class EventsList;
class ObjectsContainer;
class Expression;
class ParameterMetadata;
}  // namespace gd

namespace gd {

/**
 * \brief AbstractArbitraryEventsWorker is a base abstract class used to browse events (and
 * instructions) and do some work on them. It must not be inherited directly.
 *
 * \see gd::ArbitraryEventsWorker
 * \see gd::ArbitraryEventsWorkerWithContext
 *
 * \ingroup IDE
 */
class GD_CORE_API AbstractArbitraryEventsWorker : private EventVisitor {
 public:
  AbstractArbitraryEventsWorker(){};
  virtual ~AbstractArbitraryEventsWorker();

protected:
  virtual bool VisitEvent(gd::BaseEvent& event) override;
  void VisitEventList(gd::EventsList& events);

 private:
  bool VisitLinkEvent(gd::LinkEvent& linkEvent) override;
  void VisitInstructionList(gd::InstructionsList& instructions,
                            bool areConditions);
  bool VisitInstruction(gd::Instruction& instruction, bool isCondition);
  bool VisitEventExpression(gd::Expression& expression, const gd::ParameterMetadata& metadata);

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

  /**
   * Called to do some work on an expression of an event.
   * \return true if the event must be deleted from the list, false
   * otherwise (default).
   */
  virtual bool DoVisitEventExpression(gd::Expression& expression,
                                      const gd::ParameterMetadata& metadata) {
    return false;
  }
};

/**
 * \brief ArbitraryEventsWorker is an abstract class used to browse events (and
 * instructions) and do some work on them. Can be used to implement refactoring
 * for example.
 *
 * \see gd::ArbitraryEventsWorkerWithContext
 *
 * \ingroup IDE
 */
class GD_CORE_API ArbitraryEventsWorker : public AbstractArbitraryEventsWorker {
public:
  ArbitraryEventsWorker(){};
  virtual ~ArbitraryEventsWorker();

  /**
   * \brief Launch the worker on the specified events list.
   */
  void Launch(gd::EventsList &events) {
    AbstractArbitraryEventsWorker::VisitEventList(events);
  };

private:
  bool VisitEvent(gd::BaseEvent &event) override;
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
    : public AbstractArbitraryEventsWorker {
 public:
  ArbitraryEventsWorkerWithContext()
      : currentProjectScopedContainers(nullptr){};
  virtual ~ArbitraryEventsWorkerWithContext();

  /**
   * \brief Launch the worker on the specified events list,
   * giving the objects container on which the events are applying to.
   */
  void Launch(gd::EventsList& events,
              const gd::ProjectScopedContainers& projectScopedContainers) {
    currentProjectScopedContainers = &projectScopedContainers;
    AbstractArbitraryEventsWorker::VisitEventList(events);
  };

protected:
  const gd::ProjectScopedContainers& GetProjectScopedContainers() {
    // Pointers are guaranteed to be not nullptr after
    // Launch was called.
    return *currentProjectScopedContainers;
  };
  const gd::ObjectsContainersList& GetObjectsContainersList() {
    // Pointers are guaranteed to be not nullptr after
    // Launch was called.
    return currentProjectScopedContainers->GetObjectsContainersList();
  };

 private:
  bool VisitEvent(gd::BaseEvent& event) override;

  const gd::ProjectScopedContainers* currentProjectScopedContainers;
};

/**
 * \brief ReadOnlyArbitraryEventsWorker is an abstract class used to browse events (and
 * instructions). It must not be inherited directly.
 *
 * \see gd::ReadOnlyArbitraryEventsWorker
 * \see gd::ReadOnlyArbitraryEventsWorkerWithContext
 *
 * \ingroup IDE
 */
class GD_CORE_API AbstractReadOnlyArbitraryEventsWorker : private ReadOnlyEventVisitor {
 public:
  AbstractReadOnlyArbitraryEventsWorker() : shouldStopIteration(false) {};
  virtual ~AbstractReadOnlyArbitraryEventsWorker();

protected:
  void StopAnyEventIteration() override;
  virtual void VisitEvent(const gd::BaseEvent& event) override;

  void VisitEventList(const gd::EventsList& events);

 private:
  void VisitLinkEvent(const gd::LinkEvent& linkEvent) override;
  void VisitInstructionList(const gd::InstructionsList& instructions,
                            bool areConditions);
  void VisitInstruction(const gd::Instruction& instruction, bool isCondition);
  void VisitEventExpression(const gd::Expression& expression, const gd::ParameterMetadata& metadata);

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

  /**
   * Called to do some work on an expression of an event.
   */
  virtual void DoVisitEventExpression(const gd::Expression& expression,
                                      const gd::ParameterMetadata& metadata) {
  }

  bool shouldStopIteration;
};

/**
 * \brief ReadOnlyArbitraryEventsWorker is an abstract class used to browse events (and
 * instructions). It can be used to implement autocompletion for example.
 *
 * \see gd::ReadOnlyArbitraryEventsWorkerWithContext
 *
 * \ingroup IDE
 */
class GD_CORE_API ReadOnlyArbitraryEventsWorker
    : public AbstractReadOnlyArbitraryEventsWorker {
public:
  ReadOnlyArbitraryEventsWorker(){};
  virtual ~ReadOnlyArbitraryEventsWorker();

  /**
   * \brief Launch the worker on the specified events list.
   */
  void Launch(const gd::EventsList &events) {
    AbstractReadOnlyArbitraryEventsWorker::VisitEventList(events);
  };

private:
  void VisitEvent(const gd::BaseEvent &event) override;
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
    : public AbstractReadOnlyArbitraryEventsWorker {
 public:
  ReadOnlyArbitraryEventsWorkerWithContext()
      : currentProjectScopedContainers(nullptr){};
  virtual ~ReadOnlyArbitraryEventsWorkerWithContext();

  /**
   * \brief Launch the worker on the specified events list,
   * giving the objects container on which the events are applying to.
   */
  void Launch(const gd::EventsList& events,
              const gd::ProjectScopedContainers& projectScopedContainers) {
    currentProjectScopedContainers = &projectScopedContainers;
    AbstractReadOnlyArbitraryEventsWorker::VisitEventList(events);
  };

protected:
  const gd::ProjectScopedContainers& GetProjectScopedContainers() {
    // Pointers are guaranteed to be not nullptr after
    // Launch was called.
    return *currentProjectScopedContainers;
  };

 private:
  void VisitEvent(const gd::BaseEvent& event) override;

  const gd::ProjectScopedContainers* currentProjectScopedContainers;
};

}  // namespace gd
