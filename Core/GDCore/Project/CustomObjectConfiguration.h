/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/Project/ObjectConfiguration.h"

#include <map>
#include <memory>
#include <unordered_set>
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
  CustomObjectConfiguration(const Project &project_, const String &type_)
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
  bool RenameProperty(const gd::String& oldName, const gd::String& newName) override;

  std::map<gd::String, gd::PropertyDescriptor> GetInitialInstanceProperties(
      const gd::InitialInstance& instance) override;
  bool UpdateInitialInstanceProperty(gd::InitialInstance& instance,
                                     const gd::String& name,
                                     const gd::String& value) override;

  void ExposeResources(gd::ArbitraryResourceWorker& worker) override;


  /**
   * \brief Get the name of the events-based object variant used by this custom object.
   */
  const gd::String &GetVariantName() const { return variantName; };

  /**
   * \brief Set the name of the events-based object variant used by this custom object.
   */
  void SetVariantName(const gd::String &variantName_) {
    variantName = variantName_;
  }

  /**
   * Legacy events-based objects don't have any instance in their default
   * variant since there wasn't a graphical editor at the time. In this case,
   * the editor doesn't allow to choose a variant, but a variant may have stayed
   * after a user rolled back the extension. This variant must be ignored.
   *
   * @return true when its events-based object doesn't have any initial
   * instance.
   */
  bool IsForcedToOverrideEventsBasedObjectChildrenConfiguration() const;

  bool IsMarkedAsOverridingEventsBasedObjectChildrenConfiguration() const {
    return isMarkedAsOverridingEventsBasedObjectChildrenConfiguration;
  }

  void SetMarkedAsOverridingEventsBasedObjectChildrenConfiguration(
      bool isOverridingEventsBasedObjectChildrenConfiguration_) {
    isMarkedAsOverridingEventsBasedObjectChildrenConfiguration =
        isOverridingEventsBasedObjectChildrenConfiguration_;
  }

  void ClearChildrenConfiguration();

  gd::ObjectConfiguration &
  GetChildObjectConfiguration(const gd::String &objectName);

  std::size_t GetAnimationsCount() const override;

  const gd::String &GetAnimationName(size_t index) const override;

  bool HasAnimationNamed(const gd::String &animationName) const override;

  /**
   * \brief Return the animation configuration for Animatable custom objects.
   */
  const SpriteAnimationList& GetAnimations() const;

  /**
   * @brief Return the animation configuration for Animatable custom objects.
   */
  SpriteAnimationList& GetAnimations();

  enum EdgeAnchor {
    NoAnchor = 0,
    MinEdge = 1,
    MaxEdge = 2,
    Proportional = 3,
    Center = 4,
  };

  static const gd::CustomObjectConfiguration::EdgeAnchor
  GetEdgeAnchorFromString(const gd::String &value);

  /**
   * Check if a child object properties must be displayed as folded in the editor.
   * This is only useful when the object can override its children configuration (which
   * is something being deprecated).
   */
  bool IsChildObjectFolded(const gd::String& childName) const {
    return unfoldedChildren.find(childName) == unfoldedChildren.end();
  }

  /**
   * Set if a child object properties must be displayed as folded in the editor.
   * This is only useful when the object can override its children configuration (which
   * is something being deprecated).
   */
  void SetChildObjectFolded(const gd::String& childName, bool folded) {
    if (!folded)
      unfoldedChildren.insert(childName);
    else
      unfoldedChildren.erase(childName);
  }

protected:
  void DoSerializeTo(SerializerElement& element) const override;
  void DoUnserializeFrom(Project& project, const SerializerElement& element) override;

 private:
  const gd::EventsBasedObject* GetEventsBasedObject() const;

  bool IsOverridingEventsBasedObjectChildrenConfiguration() const;

  const Project* project = nullptr; ///< The project is used to get the
                                    ///< EventBasedObject from the fullType.
  gd::SerializerElement objectContent;
  std::unordered_set<gd::String> unfoldedChildren;

  gd::String variantName = "";
  bool isMarkedAsOverridingEventsBasedObjectChildrenConfiguration = false;
  mutable std::map<gd::String, std::unique_ptr<gd::ObjectConfiguration>> childObjectConfigurations;

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
