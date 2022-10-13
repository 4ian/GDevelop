/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EVENTSIDENTIFIERSFINDER_H
#define EVENTSIDENTIFIERSFINDER_H
#include <set>
#include <vector>
#include "GDCore/Events/Event.h"
#include "GDCore/String.h"
namespace gd {
class Instruction;
class Platform;
class Object;
class Project;
class Layout;
}  // namespace gd

namespace gd {

/**
 * \brief Perform a search over a layout, searching for layout or object custom
 * identifiers.
 *
 * \todo Refactor this class using ArbitraryEventsWorker
 *
 * \ingroup IDE
 */
class EventsIdentifiersFinder {
 public:
  EventsIdentifiersFinder(){};
  virtual ~EventsIdentifiersFinder(){};

  /**
   * Construct a list containing all the expressions for a given identifier used
   * in the layout.
   *
   * \param project The project to use.
   * \param layout The layout to use.
   * \param  identifierType The identifier type to be analyzed.
   * \param  objectName If not empty, parameters will be taken into account
   * only if the last object parameter is filled with
   * this value.
   * \return A std::set containing the names of all identifiers used.
   */
  static std::set<gd::String> FindAllIdentifierExpressions(
      const gd::Platform& platform,
      const gd::Project& project,
      const gd::Layout& layout,
      const gd::String& identifierType,
      const gd::String& objectName = "");

 private:
  /**
   * Construct a list containing all the expressions for a given identifier used
   * in the layout. It searches in events dependencies.
   *
   * \param results A std::set to fill with the expressions used for all parameters of the
   * specified identifier type
   * \param platform The platform of the project
   * \param project The project to use.
   * \param layout The layout to use.
   * \param events The events to be analyzed
   * \param identifierType The identifier type to be analyzed
   * \param objectName If not empty, parameters will be taken into account
   * only if the last object parameter is filled with
   * this value.
   */
  static void FindArgumentsInEventsAndDependencies(
      std::set<gd::String>& results,
      const gd::Platform& platform,
      const gd::Project& project,
      const gd::Layout& layout,
      const gd::String& identifierType,
      const gd::String& objectName = "");
};

}  // namespace gd

#endif  // EVENTSIDENTIFIERSFINDER_H
