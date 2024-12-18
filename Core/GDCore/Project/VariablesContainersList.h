#pragma once
#include <functional>
#include <vector>

namespace gd {
class String;
class Project;
class Layout;
class VariablesContainer;
class Variable;
class EventsFunctionsExtension;
class EventsBasedBehavior;
class EventsBasedObject;
class EventsFunction;
} // namespace gd

namespace gd {

/**
 * \brief A list of variables containers, useful for accessing variables in a
 * scoped way.
 *
 * \see gd::Variable
 * \see gd::Project
 * \see gd::Layout
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API VariablesContainersList {
public:
  virtual ~VariablesContainersList(){};

  static VariablesContainersList
  MakeNewVariablesContainersListForProjectAndLayout(const gd::Project &project,
                                                    const gd::Layout &layout);

  static VariablesContainersList
  MakeNewVariablesContainersListForProject(const gd::Project &project);

  static VariablesContainersList
  MakeNewVariablesContainersListForEventsFunctionsExtension(
      const gd::EventsFunctionsExtension &extension);

  static VariablesContainersList
  MakeNewVariablesContainersListForFreeEventsFunction(
      const gd::EventsFunctionsExtension &extension,
      const gd::EventsFunction &eventsFunction,
      gd::VariablesContainer &parameterVariablesContainer);

  static VariablesContainersList
  MakeNewVariablesContainersListForBehaviorEventsFunction(
      const gd::EventsFunctionsExtension &extension,
      const gd::EventsBasedBehavior &eventsBasedBehavior,
      const gd::EventsFunction &eventsFunction,
      gd::VariablesContainer &parameterVariablesContainer,
      gd::VariablesContainer &propertyVariablesContainer);

  static VariablesContainersList
  MakeNewVariablesContainersListForObjectEventsFunction(
      const gd::EventsFunctionsExtension &extension,
      const gd::EventsBasedObject &eventsBasedObject,
      const gd::EventsFunction &eventsFunction,
      gd::VariablesContainer &parameterVariablesContainer,
      gd::VariablesContainer &propertyVariablesContainer);

  static VariablesContainersList MakeNewVariablesContainersListPushing(
      const VariablesContainersList &variablesContainersList,
      const gd::VariablesContainer &variablesContainer);

  /**
   * @deprecated Use another method for an explicit context instead.
   */
  static VariablesContainersList MakeNewEmptyVariablesContainersList();

  /**
   * \brief Return true if the specified variable is in one of the containers.
   */
  bool Has(const gd::String &name) const;

  /**
   * \brief Return a reference to the variable called \a name.
   */
  const Variable &Get(const gd::String &name) const;

  /**
   * \brief Return true if the specified variable container is present.
   */
  bool
  HasVariablesContainer(const gd::VariablesContainer &variablesContainer) const;

  // TODO: Rename GetTopMostVariablesContainer and
  // GetBottomMostVariablesContainer to give a clearer access to segments of the
  // container list. For instance, a project tree segment and an event tree
  // segment.

  /**
   * Get the variables container at the top of the scope (so the most "global"
   * one). \brief Avoid using apart when a scope must be forced.
   */
  const VariablesContainer *GetTopMostVariablesContainer() const {
    if (variablesContainers.empty())
      return nullptr;
    return variablesContainers.front();
  };

  /**
   * Get the variables container at the bottom of the scope
   * (so the most "local" one) excluding local variables.
   * \brief Avoid using apart when a scope must be forced.
   */
  const VariablesContainer *GetBottomMostVariablesContainer() const {
    if (variablesContainers.empty())
      return nullptr;
    return variablesContainers.at(firstLocalVariableContainerIndex - 1);
  }

  /**
   * Get the variables container for a given variable.
   */
  const VariablesContainer &
  GetVariablesContainerFromVariableName(const gd::String &variableName) const;

  /**
   * Get the variables container index for a given variable.
   */
  std::size_t GetVariablesContainerPositionFromVariableName(
      const gd::String &variableName) const;

  /**
   * \brief Get the index of the given local variables container.
   */
  std::size_t GetLocalVariablesContainerPosition(
      const gd::VariablesContainer &localVariableContainer) const;

  /**
   * \brief Get the variable container at the specified index in the list.
   *
   * \warning Trying to access to a not existing variable container will result
   * in undefined behavior.
   */
  const gd::VariablesContainer &GetVariablesContainer(std::size_t index) const {
    return *variablesContainers.at(index);
  }

  /**
   * \brief Return the number variable containers.
   */
  std::size_t GetVariablesContainersCount() const {
    return variablesContainers.size();
  }

  /**
   * \brief Call the callback for each variable having a name matching the
   * specified search.
   */
  void ForEachVariableMatchingSearch(
      const gd::String &search,
      std::function<void(const gd::String &name, const gd::Variable &variable)>
          fn) const;

  /**
   * \brief Push a new variables container to the context.
   */
  void Push(const gd::VariablesContainer &variablesContainer) {
    variablesContainers.push_back(&variablesContainer);
  };

  /**
   * \brief Pop a variables container from the context.
   */
  void Pop() { variablesContainers.pop_back(); };

  /** Do not use - should be private but accessible to let Emscripten create a
   * temporary. */
  VariablesContainersList() : firstLocalVariableContainerIndex(0){};

private:
  std::vector<const gd::VariablesContainer *> variablesContainers;
  std::size_t firstLocalVariableContainerIndex;
  static Variable badVariable;
  static VariablesContainer badVariablesContainer;
};

} // namespace gd