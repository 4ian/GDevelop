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
   * Construct a list containing the expression of all identifiers used in the
   * layout.
   *
   * \param project The project
   * \param layout The layout to use.
   * \param  identifierType The identifier to search.
   * \param  objectName The object to be scanned if any.
   * \return A std::set containing the names of all object variables used.
   */
  static std::set<gd::String> FindAllIdentifierExpressions(
      const gd::Platform& platform,
      gd::Project& project,
      gd::Layout& layout,
      const gd::String& identifierType,
      const gd::String& objectName = "");

 private:
  /**
   * Construct a list of the value of the arguments for parameters of type
   * "identifier". It searches in events dependencies.
   *
   * \param results A std::set to fill with the values used for all parameters of the
   * specified type
   * \param platform The platform of the project
   * \param project The project used
   * \param layout The layout used
   * \param events The events to be analyzed
   * \param identifierType The parameters type to be analyzed
   * \param objectName If not empty, parameters will be taken into account
   * only if the last object parameter is filled with
   * this value.
   */
  static void FindArgumentsInEventsAndDependencies(
      std::set<gd::String>& results,
      const gd::Platform& platform,
      gd::Project& project,
      gd::Layout& layout,
      const gd::String& identifierType,
      const gd::String& objectName = "");
};

}  // namespace gd

#endif  // EVENTSIDENTIFIERSFINDER_H
