#pragma once
#include <set>

#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "ObjectsContainersList.h"
#include "PropertiesContainersList.h"
#include "VariablesContainersList.h"
#include "VariablesContainer.h"

namespace gd {
class Project;
class ObjectsContainer;
class NamedPropertyDescriptor;
class ParameterMetadataContainer;
class BaseEvent;
class EventsFunctionsExtension;
class EventsFunction;
class EventsBasedBehavior;
class EventsBasedObject;
} // namespace gd

namespace gd {

/**
 * \brief Holds references to variables, objects, properties and other
 * containers.
 *
 * This is useful to access elements of a project from a specific location,
 * honoring the scope of each element.
 *
 * For example, in an expression, when an identifier is written, this class is
 * used to know what this identifier refers too.
 */
class ProjectScopedContainers {
 public:
  ProjectScopedContainers(
      const gd::ObjectsContainersList &objectsContainersList_,
      const gd::VariablesContainersList &variablesContainersList_,
      const gd::VariablesContainer *legacyGlobalVariables_,
      const gd::VariablesContainer *legacySceneVariables_,
      const gd::PropertiesContainersList &propertiesContainersList_)
      : objectsContainersList(objectsContainersList_),
        variablesContainersList(variablesContainersList_),
        legacyGlobalVariables(legacyGlobalVariables_),
        legacySceneVariables(legacySceneVariables_),
        propertiesContainersList(propertiesContainersList_){};
  virtual ~ProjectScopedContainers(){};

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForProjectAndLayout(const gd::Project &project,
                                                    const gd::Layout &layout);

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForProject(const gd::Project &project);

  /**
   * @deprecated Use another method for an explicit context instead.
   */
  static ProjectScopedContainers MakeNewProjectScopedContainersFor(
      const gd::ObjectsContainer &globalObjectsContainers,
      const gd::ObjectsContainer &objectsContainers);

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForEventsFunctionsExtension(
      const gd::Project &project,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension);

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForFreeEventsFunction(
      const gd::Project &project,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsFunction &eventsFunction,
      gd::ObjectsContainer &parameterObjectsContainer,
      gd::VariablesContainer &parameterVariablesContainer);

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForBehaviorEventsFunction(
      const gd::Project &project,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsBasedBehavior &eventsBasedBehavior,
      const gd::EventsFunction &eventsFunction,
      gd::ObjectsContainer &parameterObjectsContainer,
      gd::VariablesContainer &parameterVariablesContainer,
      gd::VariablesContainer &propertyVariablesContainer);

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForObjectEventsFunction(
      const gd::Project &project,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsBasedObject &eventsBasedObject,
      const gd::EventsFunction &eventsFunction,
      gd::ObjectsContainer &parameterObjectsContainer,
      gd::VariablesContainer &parameterVariablesContainer,
    gd::VariablesContainer &propertyVariablesContainer);

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForEventsBasedObject(
      const gd::Project &project,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsBasedObject &eventsBasedObject,
      gd::ObjectsContainer &outputObjectsContainer);

  static ProjectScopedContainers
  MakeNewProjectScopedContainersWithLocalVariables(
      const ProjectScopedContainers &projectScopedContainers,
      const gd::BaseEvent &event);

  ProjectScopedContainers &AddPropertiesContainer(
      const gd::PropertiesContainer &container) {
    propertiesContainersList.Add(container);

    return *this;
  }

  ProjectScopedContainers &AddParameters(
      const ParameterMetadataContainer &parameters) {
    parametersVectorsList.push_back(&parameters);

    return *this;
  }

  template <class ReturnType>
  ReturnType MatchIdentifierWithName(
      const gd::String &name,
      std::function<ReturnType()> objectCallback,
      std::function<ReturnType()> variableCallback,
      std::function<ReturnType()> propertyCallback,
      std::function<ReturnType()> parameterCallback,
      std::function<ReturnType()> notFoundCallback) const {
    if (objectsContainersList.HasObjectOrGroupNamed(name))
      return objectCallback();
    else if (variablesContainersList.Has(name)) {
      const auto &variablesContainer =
          variablesContainersList.GetVariablesContainerFromVariableName(name);
      const auto sourceType = variablesContainer.GetSourceType();
      if (sourceType == gd::VariablesContainer::SourceType::Properties) {
        return propertyCallback();
      } else if (sourceType == gd::VariablesContainer::SourceType::Parameters) {
        return parameterCallback();
      }
      return variableCallback();
    } else if (ParameterMetadataTools::Has(parametersVectorsList, name))
      return parameterCallback();
    else if (propertiesContainersList.Has(name))
      return propertyCallback();

    return notFoundCallback();
  };

  void ForEachIdentifierMatchingSearch(
      const gd::String &search,
      std::function<void(const gd::String &name,
                         const ObjectConfiguration *objectConfiguration)>
          objectCallback,
      std::function<void(const gd::String &name, const gd::Variable &variable)>
          variableCallback,
      std::function<void(const gd::NamedPropertyDescriptor &property)>
          propertyCallback,
      std::function<void(const gd::ParameterMetadata &parameter)>
          parameterCallback) const {
    std::set<gd::String> namesAlreadySeen;

    objectsContainersList.ForEachNameMatchingSearch(
        search,
        [&](const gd::String &name,
            const ObjectConfiguration *objectConfiguration) {
          if (namesAlreadySeen.count(name) == 0) {
            namesAlreadySeen.insert(name);
            objectCallback(name, objectConfiguration);
          }
        });
    variablesContainersList.ForEachVariableMatchingSearch(
        search, [&](const gd::String &name, const gd::Variable &variable) {
          if (namesAlreadySeen.count(name) == 0) {
            namesAlreadySeen.insert(name);
            variableCallback(name, variable);
          }
        });
    gd::ParameterMetadataTools::ForEachParameterMatchingSearch(
        parametersVectorsList,
        search,
        [&](const gd::ParameterMetadata &parameter) {
          if (namesAlreadySeen.count(parameter.GetName()) == 0) {
            namesAlreadySeen.insert(parameter.GetName());
            parameterCallback(parameter);
          }
        });
    propertiesContainersList.ForEachPropertyMatchingSearch(
        search, [&](const gd::NamedPropertyDescriptor &property) {
          if (namesAlreadySeen.count(property.GetName()) == 0) {
            namesAlreadySeen.insert(property.GetName());
            propertyCallback(property);
          }
        });
  };

  const gd::ObjectsContainersList &GetObjectsContainersList() const {
    return objectsContainersList;
  };

  const gd::VariablesContainersList &GetVariablesContainersList() const {
    return variablesContainersList;
  };

  /**
   * @brief Allow modification of the variables containers list. This is used
   * by code generation which does push and pop of local variable containers.
   */
  gd::VariablesContainersList &GetVariablesContainersList() {
    return variablesContainersList;
  };

  /**
   * @brief Return the global variables of the current scene or the current
   * extension. It allows legacy "globalvar" parameters to accept extension
   * variables.
   */
  const gd::VariablesContainer *GetLegacyGlobalVariables() const {
    return legacyGlobalVariables;
  };

  /**
   * @brief Return the scene variables of the current scene or the current
   * extension. It allows legacy "scenevar" parameters to accept extension
   * variables.
   */
  const gd::VariablesContainer *GetLegacySceneVariables() const {
    return legacySceneVariables;
  };

  const gd::PropertiesContainersList &GetPropertiesContainersList() const {
    return propertiesContainersList;
  };

  const std::vector<const ParameterMetadataContainer *> &GetParametersVectorsList() const {
    return parametersVectorsList;
  };

  /** Do not use - should be private but accessible to let Emscripten create a
   * temporary. */
  ProjectScopedContainers()
      : legacyGlobalVariables(nullptr), legacySceneVariables(nullptr){};

private:
  gd::ObjectsContainersList objectsContainersList;
  gd::VariablesContainersList variablesContainersList;
  const gd::VariablesContainer *legacyGlobalVariables;
  const gd::VariablesContainer *legacySceneVariables;
  gd::PropertiesContainersList propertiesContainersList;
  std::vector<const ParameterMetadataContainer *> parametersVectorsList;
};

}  // namespace gd