/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_CUSTOMOBJECTCONFIGURATION_H
#define GDCORE_CUSTOMOBJECTCONFIGURATION_H

#include "GDCore/Project/ObjectConfiguration.h"

#include <map>
#include <memory>
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"


using namespace gd;

namespace gd {
/**
 * \brief A gd::Object that stores its content in JSON and forward the
 * properties related functions to Javascript with Emscripten.
 *
 * It also implements "ExposeResources" to expose the properties of type
 * "resource".
 */
class CustomObjectConfiguration : public gd::ObjectConfiguration {
 public:
  CustomObjectConfiguration(const Project& project_)
      : project(&project_) {}
  std::unique_ptr<gd::ObjectConfiguration> Clone() const override;

  /**
   * Copy constructor. Calls Init().
   */
  CustomObjectConfiguration(const gd::CustomObjectConfiguration& object)
      : ObjectConfiguration(object) {
    Init(object);
  };

  /**
   * Assignment operator. Calls Init().
   */
  CustomObjectConfiguration& operator=(const gd::CustomObjectConfiguration& object){
    if ((this) != &object) {
        ObjectConfiguration::operator=(object);
        Init(object);
    }
    return *this;
  }

  std::map<gd::String, gd::PropertyDescriptor> GetProperties() const override;
  bool UpdateProperty(const gd::String& name, const gd::String& value) override;

  std::map<gd::String, gd::PropertyDescriptor> GetInitialInstanceProperties(
      const gd::InitialInstance& instance,
      gd::Project& project,
      gd::Layout& scene) override;
  bool UpdateInitialInstanceProperty(gd::InitialInstance& instance,
                                     const gd::String& name,
                                     const gd::String& value,
                                     gd::Project& project,
                                     gd::Layout& scene) override;

  void ExposeResources(gd::ArbitraryResourceWorker& worker) override;

  gd::ObjectConfiguration &GetChildObjectConfiguration(const gd::String& objectName);

 protected:
  void DoSerializeTo(SerializerElement& element) const override;
  void DoUnserializeFrom(Project& project, const SerializerElement& element) override;

 private:
  const Project* project; ///< The project is used to get the
                          ///< EventBasedObject from the fullType.
  gd::SerializerElement objectContent;
  std::map<gd::String, std::unique_ptr<gd::ObjectConfiguration>> childObjectConfigurations;

  static gd::ObjectConfiguration badObjectConfiguration;

  /**
   * Initialize object using another object. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   * 
   * It's needed because there is no default copy for childObjectConfigurations
   * and it must be a deep copy.
   */
  void Init(const gd::CustomObjectConfiguration& object);
};
}  // namespace gd

#endif  // GDCORE_CUSTOMOBJECTCONFIGURATION_H