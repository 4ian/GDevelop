#pragma once
#include <set>

#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "ObjectsContainersList.h"
#include "PropertiesContainersList.h"
#include "VariablesContainersList.h"

namespace gd {
class Project;
class ObjectsContainer;
class ObjectsContainersList;
class VariablesContainersList;
class PropertiesContainersList;
class NamedPropertyDescriptor;
}  // namespace gd

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
      const gd::PropertiesContainersList &propertiesContainersList_)
      : objectsContainersList(objectsContainersList_),
        variablesContainersList(variablesContainersList_),
        propertiesContainersList(propertiesContainersList_){};
  virtual ~ProjectScopedContainers(){};

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForProjectAndLayout(const gd::Project &project,
                                                    const gd::Layout &layout) {
    ProjectScopedContainers projectScopedContainers(
        ObjectsContainersList::MakeNewObjectsContainersListForProjectAndLayout(
            project, layout),
        VariablesContainersList::
            MakeNewVariablesContainersListForProjectAndLayout(project, layout),
        PropertiesContainersList::MakeNewEmptyPropertiesContainersList());

    return projectScopedContainers;
  }

  static ProjectScopedContainers MakeNewProjectScopedContainersFor(
      const gd::ObjectsContainer &globalObjectsContainers,
      const gd::ObjectsContainer &objectsContainers) {
    ProjectScopedContainers projectScopedContainers(
        ObjectsContainersList::MakeNewObjectsContainersListForContainers(
            globalObjectsContainers, objectsContainers),
        VariablesContainersList::MakeNewEmptyVariablesContainersList(),
        PropertiesContainersList::MakeNewEmptyPropertiesContainersList());

    return projectScopedContainers;
  }

  ProjectScopedContainers &AddPropertiesContainer(
      const gd::PropertiesContainer &container) {
    propertiesContainersList.Add(container);

    return *this;
  }

  ProjectScopedContainers &AddParameters(
      const std::vector<gd::ParameterMetadata> &parameters) {
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
    else if (variablesContainersList.Has(name))
      return variableCallback();
    else if (ParameterMetadataTools::Has(parametersVectorsList, name))
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

  const gd::PropertiesContainersList &GetPropertiesContainersList() const {
    return propertiesContainersList;
  };

  const std::vector<const std::vector<gd::ParameterMetadata> *> &GetParametersVectorsList() const {
    return parametersVectorsList;
  };

  /** Do not use - should be private but accessible to let Emscripten create a
   * temporary. */
  ProjectScopedContainers(){};

 private:
  gd::ObjectsContainersList objectsContainersList;
  gd::VariablesContainersList variablesContainersList;
  gd::PropertiesContainersList propertiesContainersList;
  std::vector<const std::vector<gd::ParameterMetadata> *> parametersVectorsList;
};

}  // namespace gd