/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

namespace gd {
class EventsBasedObject;
class Project;
} // namespace gd

namespace gd {

class GD_CORE_API EventsBasedObjectVariantHelper {
public:
  /**
   * @brief Apply the changes done on events-based object children to all its
   * variants.
   */
  static void
  ComplyVariantsToEventsBasedObject(const gd::Project &project,
                                    gd::EventsBasedObject &eventsBasedObject);
};

} // namespace gd