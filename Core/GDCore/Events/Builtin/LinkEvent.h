/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_LINKEVENT_H
#define GDCORE_LINKEVENT_H
#include "GDCore/Events/Event.h"
#include "GDCore/String.h"

namespace gd {

/**
 * \brief A link pointing to external events (or events of another layout) that
 * should be included and run instead of the link.
 */
class GD_CORE_API LinkEvent : public gd::BaseEvent {
 public:
  enum IncludeConfig {
    INCLUDE_ALL = 0,
    INCLUDE_EVENTS_GROUP = 1,
    INCLUDE_BY_INDEX = 2  // Deprecated
  };

  LinkEvent()
      : BaseEvent(),
        includeConfig(INCLUDE_ALL),
        eventsGroupName(),
        includeStart(gd::String::npos),
        includeEnd(gd::String::npos),
        linkWasInvalid(false){};
  virtual ~LinkEvent();
  virtual gd::LinkEvent* Clone() const override { return new LinkEvent(*this); }

  /**
   * Get the link target (i.e. the scene or external events the link refers to).
   */
  const gd::String& GetTarget() const { return target; };

  /**
   * Change the link target (i.e. the scene or external events the link refers
   * to).
   */
  void SetTarget(const gd::String& target_) { target = target_; };

  /**
   * Return the include config.
   */
  IncludeConfig GetIncludeConfig() const { return includeConfig; }

  /**
   * Return true if the link event must include all the events of the target.
   */
  void SetIncludeAllEvents() { includeConfig = INCLUDE_ALL; }

  void SetIncludeEventsGroup(const gd::String& name) {
    includeConfig = INCLUDE_EVENTS_GROUP;
    eventsGroupName = name;
  }

  /**
   * Set the number of the first and last event to be included ( Meaningful only
   * if includeAll was set to false, see SetIncludeAllEvents )
   */
  void SetIncludeStartAndEnd(std::size_t includeStart_,
                             std::size_t includeEnd_) {
    includeConfig = INCLUDE_BY_INDEX;
    includeStart = includeStart_;
    includeEnd = includeEnd_;
  }

  gd::String GetEventsGroupName() const { return eventsGroupName; }

  /**
   * Get the number of the first event to be included. (Meaningful only if
   * includeAll was set to false, see SetIncludeAllEvents)
   */
  std::size_t GetIncludeStart() const { return includeStart; };

  /**
   * Get the number of the last event to be included. (Meaningful only if
   * includeAll was set to false, see SetIncludeAllEvents)
   */
  std::size_t GetIncludeEnd() const { return includeEnd; };

  /**
   * The link event must always be preprocessed.
   */
  virtual bool MustBePreprocessed() override { return true; }

  /**
   * \brief Get a pointer to the list of events that are targeted by the link.
   *
   * @param project The project containing the link.
   * @return NULL if nothing is found or a pointer to the list of events being
   * linked.
   */
  const EventsList* GetLinkedEvents(const gd::Project& project) const;

  /**
   * \brief Replace the link in the events list by the linked events.
   * When implementing a platform with a link event, you should call this
   * function when preprocessing the events (See
   * gd::EventMetadata::codeGeneration).
   */
  void ReplaceLinkByLinkedEvents(const gd::Project& project,
                                 EventsList& eventList,
                                 std::size_t indexOfTheEventInThisList);

  virtual bool IsExecutable() const override { return true; };

  virtual void SerializeTo(SerializerElement& element) const override;
  virtual void UnserializeFrom(gd::Project& project,
                               const SerializerElement& element) override;

  bool AcceptVisitor(gd::EventVisitor& eventVisitor) override;
  void AcceptVisitor(gd::ReadOnlyEventVisitor& eventVisitor) const override;

 private:
  gd::String
      target;  ///< The name of the external events (or scene) to be included

  IncludeConfig
      includeConfig;  ///< Defines which events are included by this link

  gd::String eventsGroupName;  ///< If includeConfig is set to
                               ///< INCLUDE_EVENTS_GROUP, represents the name of
                               ///< the events group to be included.

  std::size_t includeStart;  ///< If includeConfig is set to INCLUDE_BY_INDEX,
                             ///< represents the number of the first event of
                             ///< the target to included.
  std::size_t
      includeEnd;  ///< If includeConfig is set to INCLUDE_BY_INDEX, represents
                   ///< the number of the last event of the target to included.

  bool linkWasInvalid;  ///< Set to true by Preprocess if the links was invalid
                        ///< the last time is was processed. Used to display a
                        ///< warning in the events editor.
};

}  // namespace gd

#endif  // GDCORE_LINKEVENT_H
