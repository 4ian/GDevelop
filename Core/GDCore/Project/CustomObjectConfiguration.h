/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/Project/ObjectConfiguration.h"

#include <map>
#include <memory>
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteAnimationList.h"

using namespace gd;

namespace gd {
/**
 * \brief A gd::ObjectConfiguration that stores its content in JSON and is
 * composed of other configuration according to it's object children.
 *
 * It also implements "ExposeResources" to expose the properties of type
 * "resource".
 */
class CustomObjectConfiguration : public gd::ObjectConfiguration {
 public:
  CustomObjectConfiguration(const Project& project_, const String& type_)
      : project(&project_) {
    SetType(type_);
  }
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

  /**
   * \brief Return the animation configuration for Animatable custom objects.
   */
  const SpriteAnimationList& GetAnimations() const;

  /**
   * @brief Return the animation configuration for Animatable custom objects.
   */
  SpriteAnimationList& GetAnimations();

protected:
  void DoSerializeTo(SerializerElement& element) const override;
  void DoUnserializeFrom(Project& project, const SerializerElement& element) override;

 private:
  const Project* project; ///< The project is used to get the
                          ///< EventBasedObject from the fullType.
  gd::SerializerElement objectContent;
  std::map<gd::String, std::unique_ptr<gd::ObjectConfiguration>> childObjectConfigurations;

  static gd::ObjectConfiguration badObjectConfiguration;

  SpriteAnimationList animations;

  /**
   * Initialize configuration using another configuration. Used by copy-ctor
   * and assign-op.
   *
   * Don't forget to update me if members were changed!
   *
   * It's needed because there is no default copy for childObjectConfigurations
   * and it must be a deep copy.
   */
  void Init(const gd::CustomObjectConfiguration& object);
};

}  // namespace gd
