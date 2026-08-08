#pragma once
#include <set>

#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/String.h"
#include "ObjectsContainersList.h"
#include "PropertiesContainersList.h"
#include "VariablesContainersList.h"
#include "ResourcesContainersList.h"
#include "VariablesContainer.h"
#include "SceneLifecycleEventsFunctions.h"

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
      const gd::PropertiesContainersList &propertiesContainersList_,
      const gd::ResourcesContainersList &resourcesContainersList_)
      : objectsContainersList(objectsContainersList_),
        variablesContainersList(variablesContainersList_),
        legacyGlobalVariables(legacyGlobalVariables_),
        legacySceneVariables(legacySceneVariables_),
        propertiesContainersList(propertiesContainersList_),
        resourcesContainersList(resourcesContainersList_),
        project(nullptr){};
  virtual ~ProjectScopedContainers(){};

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForProjectAndLayout(const gd::Project &project,
                                                    const gd::Layout &layout);

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForProject(const gd::Project &project);

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
      gd::VariablesContainer &parameterVariablesContainer,
      gd::ResourcesContainer &parameterResourcesContainer);

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForBehaviorEventsFunction(
      const gd::Project &project,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsBasedBehavior &eventsBasedBehavior,
      const gd::EventsFunction &eventsFunction,
      gd::ObjectsContainer &parameterObjectsContainer,
      gd::VariablesContainer &parameterVariablesContainer,
      gd::VariablesContainer &propertyVariablesContainer,
      gd::ResourcesContainer &parameterResourcesContainer,
      gd::ResourcesContainer &propertyResourcesContainer);

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForObjectEventsFunction(
      const gd::Project &project,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsBasedObject &eventsBasedObject,
      const gd::EventsFunction &eventsFunction,
      gd::ObjectsContainer &parameterObjectsContainer,
      gd::VariablesContainer &parameterVariablesContainer,
      gd::VariablesContainer &propertyVariablesContainer,
      gd::ResourcesContainer &parameterResourcesContainer,
      gd::ResourcesContainer &propertyResourcesContainer);

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
          variablesContainersList.GetVariablesContainerFromVariableOrPropertyOrParameterName(name);
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

  const gd::ResourcesContainersList &GetResourcesContainersList() const {
    return resourcesContainersList;
  };

  /**
   * \brief Return true if this scope was created from a project.
   */
  bool HasProject() const { return project != nullptr; }

  /**
   * \brief Get the project this scope was created from.
   * \warning This is only valid if HasProject() is true.
   */
  const gd::Project &GetProject() const { return *project; }

  /**
   * \brief Return the name of the scene (layout) in scope, or an empty string
   * if the scope is not a scene.
   */
  const gd::String &GetScopeSceneName() const {
    return scopeSceneName;
  };

  /**
   * \brief Return the name of the external events in scope, or an empty string
   * if the scope is not external events.
   */
  const gd::String &GetScopeExternalEventsName() const {
    return scopeExternalEventsName;
  };

  /**
   * \brief Set the external events name for the scope. Used by
   * ProjectBrowserHelper when scanning external events.
   */
  ProjectScopedContainers &SetScopeExternalEventsName(
      const gd::String &externalEventsName) {
    scopeExternalEventsName = externalEventsName;
    return *this;
  };

  /**
   * \brief Return true when this scope is visiting a scene lifecycle function.
   *
   * Lifecycle-neutral event functions deliberately have no role. Callers that
   * need the legacy Link behavior may use GetScopeSceneLifecycleFunctionRole,
   * which returns SceneUpdate when no explicit role is set.
   */
  bool HasScopeSceneLifecycleFunctionRole() const {
    return hasScopeSceneLifecycleFunctionRole;
  }

  /**
   * \brief Return the lifecycle role in scope.
   *
   * SceneUpdate is returned for lifecycle-neutral scopes for backward
   * compatibility with ordinary Events Functions and legacy callers.
   */
  gd::SceneLifecycleFunctionRole GetScopeSceneLifecycleFunctionRole() const {
    return scopeSceneLifecycleFunctionRole;
  }

  /**
   * \brief Return the canonical lifecycle role name, or an empty string when
   * the current scope is lifecycle-neutral.
   *
   * This string accessor is intentionally exposed to editor diagnostics and
   * navigation. Native code that branches on the role should keep using the
   * enum accessor above.
   */
  gd::String GetScopeSceneLifecycleFunctionName() const {
    if (!hasScopeSceneLifecycleFunctionRole) return "";

    switch (scopeSceneLifecycleFunctionRole) {
      case gd::SceneLifecycleFunctionRole::SceneLoad:
        return "sceneLoad";
      case gd::SceneLifecycleFunctionRole::SceneSignal:
        return "sceneSignal";
      case gd::SceneLifecycleFunctionRole::SceneUpdate:
        return "sceneUpdate";
      case gd::SceneLifecycleFunctionRole::SceneUnload:
        return "sceneUnload";
    }
    return "";
  }

  /**
   * \brief Set the lifecycle role for the events currently being visited.
   */
  ProjectScopedContainers &SetScopeSceneLifecycleFunctionRole(
      gd::SceneLifecycleFunctionRole role) {
    scopeSceneLifecycleFunctionRole = role;
    hasScopeSceneLifecycleFunctionRole = true;
    return *this;
  }

  /**
   * \brief Set the lifecycle role from its canonical serialized name.
   *
   * This binding-friendly overload is intended for editor tools that validate
   * an isolated lifecycle events list outside a whole-project traversal.
   */
  ProjectScopedContainers &SetScopeSceneLifecycleFunctionName(
      const gd::String &name) {
    if (name == "sceneLoad")
      return SetScopeSceneLifecycleFunctionRole(
          gd::SceneLifecycleFunctionRole::SceneLoad);
    if (name == "sceneSignal")
      return SetScopeSceneLifecycleFunctionRole(
          gd::SceneLifecycleFunctionRole::SceneSignal);
    if (name == "sceneUpdate")
      return SetScopeSceneLifecycleFunctionRole(
          gd::SceneLifecycleFunctionRole::SceneUpdate);
    if (name == "sceneUnload")
      return SetScopeSceneLifecycleFunctionRole(
          gd::SceneLifecycleFunctionRole::SceneUnload);
    return *this;
  }

  /**
   * \brief Return the name of the extension in scope, or an empty string if
   * the scope is not an extension function.
   */
  const gd::String &GetScopeExtensionName() const {
    return scopeExtensionName;
  };

  /**
   * \brief Return the name of the function in scope, or an empty string if
   * the scope is not an extension function.
   */
  const gd::String &GetScopeFunctionName() const {
    return scopeFunctionName;
  };

  /**
   * \brief Return the name of the custom behavior in scope, or an empty string if
   * the scope is not a behavior function.
   */
  const gd::String &GetScopeBehaviorName() const {
    return scopeBehaviorName;
  };

  /**
   * \brief Return the name of the custom object in scope, or an empty string if
   * the scope is not an object function.
   */
  const gd::String &GetScopeObjectName() const {
    return scopeObjectName;
  };

  /** Do not use - should be private but accessible to let Emscripten create a
   * temporary. */
  ProjectScopedContainers()
      : legacyGlobalVariables(nullptr), legacySceneVariables(nullptr),
        project(nullptr){};

private:
  gd::ObjectsContainersList objectsContainersList;
  gd::VariablesContainersList variablesContainersList;
  const gd::VariablesContainer *legacyGlobalVariables;
  const gd::VariablesContainer *legacySceneVariables;
  gd::PropertiesContainersList propertiesContainersList;
  std::vector<const ParameterMetadataContainer *> parametersVectorsList;
  gd::ResourcesContainersList resourcesContainersList;
  const gd::Project *project;

  gd::String scopeSceneName;
  gd::String scopeExternalEventsName;
  gd::String scopeExtensionName;
  gd::String scopeFunctionName;
  gd::String scopeBehaviorName;
  gd::String scopeObjectName;
  gd::SceneLifecycleFunctionRole scopeSceneLifecycleFunctionRole =
      gd::SceneLifecycleFunctionRole::SceneUpdate;
  bool hasScopeSceneLifecycleFunctionRole = false;
};

}  // namespace gd
