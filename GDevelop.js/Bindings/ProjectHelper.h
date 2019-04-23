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
   * \brief This check that the given gd::Behavior can be properly cloned
   * and have the given property updated.
   */
  static gd::String SanityCheckBehaviorProperty(gd::Behavior* behavior,
                                                const gd::String& propertyName,
                                                const gd::String& newValue) {
    if (!behavior) return "FAIL: behavior passed is null";
    gd::Project project;
    project.AddPlatform(JsPlatform::Get());

    gd::String originalValue =
        behavior->GetProperties(project)[propertyName].GetValue();

    gd::Behavior* copiedBehavior = behavior->Clone();
    if (copiedBehavior->GetProperties(project)[propertyName].GetValue() !=
        originalValue) {
      return "FAIL: Cloning the behavior does not copy properly the property";
    }

    behavior->UpdateProperty(propertyName, newValue, project);
    gd::String updatedValue =
        behavior->GetProperties(project)[propertyName].GetValue();
    if (updatedValue != newValue) {
      return "FAIL: expected the newValue to be set for the property, but "
             "received:" +
             updatedValue;
    }

    gd::String copiedBehaviorValue =
        copiedBehavior->GetProperties(project)[propertyName].GetValue();
    if (copiedBehaviorValue != originalValue) {
      return "FAIL: Updating the property of the behavior will change the "
             "property of the cloned behavior. Clone behavior property is "
             "now: " +
             copiedBehaviorValue + ". Should have been:" + originalValue;
    }

    delete copiedBehavior;
    return "";
  }

  /**
   * \brief This check that the given gd::BehaviorsSharedData can be properly cloned
   * and have the given property updated.
   */
  static gd::String SanityCheckBehaviorsSharedDataProperty(gd::BehaviorsSharedData* sharedData,
                                                const gd::String& propertyName,
                                                const gd::String& newValue) {
    if (!sharedData) return "FAIL: sharedData passed is null";
    gd::Project project;
    project.AddPlatform(JsPlatform::Get());

    gd::String originalValue =
        sharedData->GetProperties(project)[propertyName].GetValue();

    std::shared_ptr<gd::BehaviorsSharedData> copiedSharedData = sharedData->Clone();
    if (copiedSharedData->GetProperties(project)[propertyName].GetValue() !=
        originalValue) {
      return "FAIL: Cloning the sharedData does not copy properly the property";
    }

    sharedData->UpdateProperty(propertyName, newValue, project);
    gd::String updatedValue =
        sharedData->GetProperties(project)[propertyName].GetValue();
    if (updatedValue != newValue) {
      return "FAIL: expected the newValue to be set for the property, but "
             "received:" +
             updatedValue;
    }

    gd::String copiedSharedDataValue =
        copiedSharedData->GetProperties(project)[propertyName].GetValue();
    if (copiedSharedDataValue != originalValue) {
      return "FAIL: Updating the property of the sharedData will change the "
             "property of the cloned sharedData. Clone sharedData property is "
             "now: " +
             copiedSharedDataValue + ". Should have been:" + originalValue;
    }

    return "";
  }

  /**
   * \brief This check that the given gd::Object can be properly cloned
   * and have the given property updated.
   */
  static gd::String SanityCheckObjectProperty(gd::Object* object,
                                              const gd::String& propertyName,
                                              const gd::String& newValue) {
    if (!object) return "FAIL: object passed is null";
    gd::Project project;
    project.AddPlatform(JsPlatform::Get());

    gd::String originalValue =
        object->GetProperties(project)[propertyName].GetValue();

    std::unique_ptr<gd::Object> copiedObject = object->Clone();
    if (copiedObject->GetProperties(project)[propertyName].GetValue() !=
        originalValue) {
      return "FAIL: Cloning the object does not copy properly the property";
    }

    object->UpdateProperty(propertyName, newValue, project);
    gd::String updatedValue =
        object->GetProperties(project)[propertyName].GetValue();
    if (updatedValue != newValue) {
      return "FAIL: expected the newValue to be set for the property, but "
             "received:" +
             updatedValue;
    }

    gd::String copiedObjectValue =
        copiedObject->GetProperties(project)[propertyName].GetValue();
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
      gd::Object* object,
      const gd::String& propertyName,
      const gd::String& newValue) {
    if (!object) return "FAIL: object passed is null";

    gd::Project project;
    project.AddPlatform(JsPlatform::Get());
    gd::Layout layout;
    gd::InitialInstance instance;

    gd::String originalValue = object
                                   ->GetInitialInstanceProperties(
                                       instance, project, layout)[propertyName]
                                   .GetValue();

    std::unique_ptr<gd::Object> copiedObject = object->Clone();
    if (copiedObject
            ->GetInitialInstanceProperties(
                instance, project, layout)[propertyName]
            .GetValue() != originalValue) {
      return "FAIL: Cloned object does not return the same initial value for "
             "the instance property";
    }

    copiedObject->UpdateInitialInstanceProperty(
        instance, propertyName, newValue, project, layout);
    gd::String updatedValue = copiedObject
                                  ->GetInitialInstanceProperties(
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
