/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EVENTSREFACTORER_H
#define GDCORE_EVENTSREFACTORER_H
#include <memory>
#include <vector>

#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/String.h"
namespace gd {
class EventsList;
class ObjectsContainer;
class ObjectsContainersList;
class ProjectScopedContainers;
class Platform;
class ExternalEvents;
class BaseEvent;
class Instruction;
typedef std::shared_ptr<gd::BaseEvent> BaseEventSPtr;
}  // namespace gd

namespace gd {

/**
 * \brief Class used to return result when calling
 EventsRefactorer::SearchInEvents
 *
  \see EventsRefactorer::SearchInEvents
 */
class GD_CORE_API EventsSearchResult {
 public:
  EventsSearchResult(std::weak_ptr<gd::BaseEvent> event_,
                     gd::EventsList* eventsList_,
                     std::size_t positionInList_);
  EventsSearchResult();
  ~EventsSearchResult(){};

  std::weak_ptr<gd::BaseEvent> event;
  gd::EventsList* eventsList;
  std::size_t positionInList;

  bool IsEventsListValid() const { return eventsList != nullptr; }

  /**
   * \brief Get the events list containing the event pointed by the
   * EventsSearchResult. \warning Only call this when IsEventsListValid returns
   * true.
   */
  const gd::EventsList& GetEventsList() const { return *eventsList; }

  std::size_t GetPositionInList() const { return positionInList; }

  bool IsEventValid() const { return !event.expired(); }

  /**
   * \brief Get the event pointed by the EventsSearchResult.
   * \warning Only call this when IsEventValid returns true.
   */
  const gd::BaseEvent& GetEvent() const { return *event.lock(); }
};

/**
 * \brief Class containing functions to do refactoring tasks on events.
 *
 * Class containing functions to do refactoring tasks on events
 * like changing an object name, deleting an object...
 *
 * \todo Refactor this class using ArbitraryEventsWorker!
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsRefactorer {
 public:
  /**
   * Replace all occurrences of an object name by another name
   * ( include : objects in parameters and in math/text expressions of all
   * events ).
   */
  static void RenameObjectInEvents(const gd::Platform& platform,
                                   gd::ProjectScopedContainers& projectScopedContainers,
                                   gd::EventsList& events,
                                   gd::String oldName,
                                   gd::String newName);

  /**
   * Remove all actions or conditions using an object
   */
  static void RemoveObjectInEvents(const gd::Platform& platform,
                                   gd::ProjectScopedContainers& projectScopedContainers,
                                   gd::EventsList& events,
                                   gd::String name);

  /**
   * Search for a gd::String in events
   *
   * \return A vector containing EventsSearchResult objects filled with events
   * containing the string
   */
  static std::vector<EventsSearchResult> SearchInEvents(
      const gd::Platform& platform,
      gd::EventsList& events,
      gd::String search,
      bool matchCase,
      bool inConditions,
      bool inActions,
      bool inEventStrings,
      bool inEventSentences);

  /**
   * Replace all occurrences of a gd::String in events
   *
   * \return A vector of all modified events.
   */
  static std::vector<EventsSearchResult> ReplaceStringInEvents(
      gd::ObjectsContainer& project,
      gd::ObjectsContainer& layout,
      gd::EventsList& events,
      gd::String toReplace,
      gd::String newString,
      bool matchCase,
      bool inConditions,
      bool inActions,
      bool inEventString);

  virtual ~EventsRefactorer(){};

 private:
  /**
   * Replace all occurrences of an object name by another name in an action
   * ( include : objects in parameters and in math/text expressions ).
   *
   * \return true if something was modified.
   */
  static bool RenameObjectInActions(const gd::Platform& platform,
                                    gd::ProjectScopedContainers& projectScopedContainers,
                                    gd::InstructionsList& instructions,
                                    gd::String oldName,
                                    gd::String newName);

  /**
   * Replace all occurrences of an object name by another name in a condition
   * ( include : objects in parameters and in math/text expressions ).
   *
   * \return true if something was modified.
   */
  static bool RenameObjectInConditions(const gd::Platform& platform,
                                       gd::ProjectScopedContainers& projectScopedContainers,
                                       gd::InstructionsList& instructions,
                                       gd::String oldName,
                                       gd::String newName);
  /**
   * Replace all occurrences of an object name by another name in an expression
   * with the specified metadata
   * ( include : objects or objects in math/text expressions ).
   *
   * \return true if something was modified.
   */
  static bool RenameObjectInEventParameters(
      const gd::Platform& platform,
      gd::ProjectScopedContainers& projectScopedContainers,
      gd::Expression& expression,
      gd::ParameterMetadata parameterMetadata,
      gd::String oldName,
      gd::String newName);

  /**
   * Remove all conditions of the list using an object
   *
   * \return true if something was modified.
   */
  static bool RemoveObjectInConditions(const gd::Platform& platform,
                                       gd::ProjectScopedContainers& projectScopedContainers,
                                       gd::InstructionsList& conditions,
                                       gd::String name);

  /**
   * Remove all actions of the list using an object
   *
   * \return true if something was modified.
   */
  static bool RemoveObjectInActions(const gd::Platform& platform,
                                    gd::ProjectScopedContainers& projectScopedContainers,
                                    gd::InstructionsList& conditions,
                                    gd::String name);

  /**
   * Replace all occurrences of a gd::String in conditions
   *
   * \return true if something was modified.
   */
  static bool ReplaceStringInConditions(gd::ObjectsContainer& project,
                                        gd::ObjectsContainer& layout,
                                        gd::InstructionsList& conditions,
                                        gd::String toReplace,
                                        gd::String newString,
                                        bool matchCase);

  /**
   * Replace all occurrences of a gd::String in actions
   *
   * \return true if something was modified.
   */
  static bool ReplaceStringInActions(gd::ObjectsContainer& project,
                                     gd::ObjectsContainer& layout,
                                     gd::InstructionsList& conditions,
                                     gd::String toReplace,
                                     gd::String newString,
                                     bool matchCase);

  /**
   * Replace all occurrences of a gd::String in strings of events (for example:
   * comments and name of groups).
   *
   * \return true if something was modified.
   */
  static bool ReplaceStringInEventSearchableStrings(
      gd::ObjectsContainer& project,
      gd::ObjectsContainer& layout,
      gd::BaseEvent& event,
      gd::String toReplace,
      gd::String newString,
      bool matchCase);

  static bool SearchStringInFormattedText(const gd::Platform& platform,
                                          gd::Instruction& instruction,
                                          gd::String search,
                                          bool matchCase,
                                          bool isCondition);
  static bool SearchStringInActions(const gd::Platform& platform,
                                    gd::InstructionsList& actions,
                                    gd::String search,
                                    bool matchCase,
                                    bool inSentences);
  static bool SearchStringInConditions(const gd::Platform& platform,
                                       gd::InstructionsList& conditions,
                                       gd::String search,
                                       bool matchCase,
                                       bool inSentences);
  static bool SearchStringInEvent(gd::BaseEvent& events,
                                  gd::String search,
                                  bool matchCase);

  static const gd::String searchIgnoredCharacters;

  EventsRefactorer(){};
};

}  // namespace gd

#endif  // GDCORE_EVENTSREFACTORER_H
