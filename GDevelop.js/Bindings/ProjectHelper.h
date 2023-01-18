#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/PlatformManager.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDJS/Extensions/JsPlatform.h"

using namespace gdjs;
using namespace gd;

/**
 * \brief Helper functions related to projects and initialization.
 */
class ProjectHelper {
 public:
  static gd::Project& CreateNewGDJSProject() {
    Project* project = new Project;
    project->AddPlatform(JsPlatform::Get());

    return *project;
  }

  /**
   * \brief Initialize the JS platform.
   */
  static void InitializePlatforms() {
    static bool initialized = false;
    if (!initialized) {
      std::cout << "libGD.js based on GDevelop " << VersionWrapper::FullString()
                << std::endl;
    } else {
      std::cout << "ERROR: You're calling initializePlatforms again, but "
                   "initialization was already done!"
                << std::endl;
      return;
    }

    initialized = true;
    std::cout << "Initializing GDJS platform..." << std::endl;
    std::shared_ptr<gd::Platform> platform(&JsPlatform::Get());
    gd::PlatformManager::Get()->AddPlatform(platform);
    std::cout << "Platform initialization ended." << std::endl;
  }

  /**
   * \brief This check that the given gd::Behavior can have the given property updated.
   */
  static gd::String SanityCheckBehaviorProperty(gd::Behavior* behavior,
                                                const gd::String& propertyName,
                                                const gd::String& newValue) {
    if (!behavior) return "FAIL: behavior passed is null";
    gd::Project project;
    project.AddPlatform(JsPlatform::Get());

    behavior->InitializeContent();

    // Call GetProperties as a sanity check
    behavior->GetProperties()[propertyName].GetValue();

    behavior->UpdateProperty(propertyName, newValue);
    gd::String updatedValue =
        behavior->GetProperties()[propertyName].GetValue();
    if (updatedValue != newValue) {
      return "FAIL: expected the newValue to be set for the property, but "
             "received:" +
             updatedValue;
    }

    return "";
  }

  /**
   * \brief This check that the given gd::BehaviorsSharedData can have the given property updated.
   */
  static gd::String SanityCheckBehaviorsSharedDataProperty(gd::BehaviorsSharedData* sharedData,
                                                const gd::String& propertyName,
                                                const gd::String& newValue) {

    if (!sharedData) return "FAIL: sharedData passed is null";
    gd::Project project;
    project.AddPlatform(JsPlatform::Get());

    sharedData->InitializeContent();

    // Call GetProperties as a sanity check
    sharedData->GetProperties()[propertyName].GetValue();

    sharedData->UpdateProperty(propertyName, newValue);
    gd::String updatedValue =
        sharedData->GetProperties()[propertyName].GetValue();
    if (updatedValue != newValue) {
      return "FAIL: expected the newValue to be set for the property, but "
             "received:" +
             updatedValue;
    }

    return "";
  }

  /**
   * \brief This check that the given gd::Object can be properly cloned
   * and have the given property updated.
   */
  static gd::String SanityCheckObjectProperty(
      gd::ObjectConfiguration* objectConfiguration,
      const gd::String& propertyName,
      const gd::String& newValue) {
    if (!objectConfiguration) return "FAIL: object passed is null";
    gd::Project project;
    project.AddPlatform(JsPlatform::Get());

    gd::Object object("MyObject", "", objectConfiguration->Clone());

    gd::String originalValue =
        object.GetConfiguration().GetProperties()[propertyName].GetValue();

    std::unique_ptr<gd::Object> copiedObject = object.Clone();
    if (copiedObject->GetConfiguration().GetProperties()[propertyName].GetValue() !=
        originalValue) {
      return "FAIL: Cloning the object does not copy properly the property";
    }

    object.GetConfiguration().UpdateProperty(propertyName, newValue);
    gd::String updatedValue =
        object.GetConfiguration().GetProperties()[propertyName].GetValue();
    if (updatedValue != newValue) {
      return "FAIL: expected the newValue to be set for the property, but "
             "received:" +
             updatedValue;
    }

    gd::String copiedObjectValue =
        copiedObject->GetConfiguration().GetProperties()[propertyName].GetValue();
    if (copiedObjectValue != originalValue) {
      return "FAIL: Updating the property of the object will change the "
             "property of the cloned object. Clone object property is "
             "now: " +
             copiedObjectValue + ". Should have been:" + originalValue;
    }

    return "";
  }

  /**
   * \brief This check that the given gd::Object can be properly cloned
   * and return/set the properties of a gd::InitialInstance.
   */
  static gd::String SanityCheckObjectInitialInstanceProperty(
      gd::ObjectConfiguration* objectConfiguration,
      const gd::String& propertyName,
      const gd::String& newValue) {
    if (!objectConfiguration) return "FAIL: object passed is null";

    gd::Project project;
    project.AddPlatform(JsPlatform::Get());
    gd::Layout layout;
    gd::InitialInstance instance;

    gd::Object object("MyObject", "", objectConfiguration->Clone());

    gd::String originalValue = object
                                   .GetConfiguration()
                                   .GetInitialInstanceProperties(
                                       instance, project, layout)[propertyName]
                                   .GetValue();

    std::unique_ptr<gd::Object> copiedObject = object.Clone();
    if (copiedObject
            ->GetConfiguration()
            .GetInitialInstanceProperties(
                instance, project, layout)[propertyName]
            .GetValue() != originalValue) {
      return "FAIL: Cloned object does not return the same initial value for "
             "the instance property";
    }

    copiedObject->GetConfiguration().UpdateInitialInstanceProperty(
        instance, propertyName, newValue, project, layout);
    gd::String updatedValue = copiedObject
                                  ->GetConfiguration()
                                  .GetInitialInstanceProperties(
                                      instance, project, layout)[propertyName]
                                  .GetValue();
    if (updatedValue != newValue) {
      return "FAIL: expected the newValue to be set for the instance property "
             "using the copied object, but "
             "received:" +
             updatedValue;
    }

    return "";
  }
};
