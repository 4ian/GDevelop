/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EventsPersistentUuidHelper_H
#define EventsPersistentUuidHelper_H
namespace gd {
class Project;
}
namespace gd {
class EventsList;
}

namespace gd {

/**
 * \brief Assigns and resets the persistent UUID that identifies events across
 * serialization, undo/redo and code generation (breakpoints).
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsPersistentUuidHelper {
 public:
  /**
   * \brief Assign a persistent UUID to every event of the project (layouts,
   * external events and events-based extensions) that doesn't have one yet.
   * \return true if at least one UUID was newly assigned.
   */
  static bool EnsureProjectEventsPersistentUuids(gd::Project &project);

  /**
   * \brief Assign a persistent UUID to every event of the list and its
   * sub-events that doesn't have one yet.
   * \return true if at least one UUID was newly assigned.
   */
  static bool EnsurePersistentUuids(gd::EventsList &events);

  /**
   * \brief Assign a new persistent UUID to every event of the list and its
   * sub-events, discarding any UUID they already had. Used on pasted or
   * duplicated events so copies don't share the identity of their source.
   */
  static void ResetPersistentUuids(gd::EventsList &events);

  /**
   * \brief Copy `source`'s persistentUuid onto `destination`, event for event
   * in list order (recursing into sub-events). Any gd::EventsList copy drops
   * persistentUuid (BaseEvent's copy constructor), so code generation that
   * clones events - directly, or through preprocessing moving them into an
   * async wrapper - needs this to keep breakpoints working.
   */
  static void CopyPersistentUuids(const gd::EventsList &source,
                                  gd::EventsList &destination);
};

}  // namespace gd

#endif  // EventsPersistentUuidHelper_H
