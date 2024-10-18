/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <map>
#include <memory>

#include "GDCore/Project/QuickCustomization.h"
#include "GDCore/Project/QuickCustomizationVisibilitiesContainer.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/String.h"

namespace gd {
class PropertyDescriptor;
class SerializerElement;
class Project;
class Layout;
class ArbitraryResourceWorker;
}  // namespace gd

namespace gd {

/**
 * \brief Base class for containers of behavior configuration.
 * They can be attached to objects (Behavior) or layouts (BehaviorsSharedData).
 * It stores the content (i.e: the properties) of a behavior of an object.
 *
 * \see gd::Behavior
 * \see gd::BehaviorsSharedData
 * \ingroup PlatformDefinition
 */
class GD_CORE_API BehaviorConfigurationContainer {
 public:
  BehaviorConfigurationContainer()
      : folded(false),
        quickCustomizationVisibility(QuickCustomization::Visibility::Default),
        propertiesQuickCustomizationVisibilities() {};
  BehaviorConfigurationContainer(const gd::String& name_,
                                 const gd::String& type_)
      : name(name_),
        type(type_),
        folded(false),
        quickCustomizationVisibility(QuickCustomization::Visibility::Default),
        propertiesQuickCustomizationVisibilities() {};
  virtual ~BehaviorConfigurationContainer();
  virtual BehaviorConfigurationContainer* Clone() const {
    return new BehaviorConfigurationContainer(*this);
  }

  /**
   * \brief Return the name identifying the behavior
   */
  const gd::String& GetName() const { return name; }

  /**
   * \brief Change the name identifying the behavior
   */
  void SetName(const gd::String& name_) { name = name_; }

  /**
   * \brief Return the type of the behavior
   */
  const gd::String& GetTypeName() const { return type; }

  /**
   * \brief Set the type of the behavior.
   */
  void SetTypeName(const gd::String& type_) { type = type_; };

  /**
   * \brief Called when the IDE wants to know about the custom properties of the
   * behavior.
   *
   * \return a std::map with properties names as key.
   * \see gd::PropertyDescriptor
   */
  std::map<gd::String, gd::PropertyDescriptor> GetProperties() const;

  /**
   * \brief Called when the IDE wants to update a custom property of the
   * behavior
   *
   * \return false if the new value cannot be set
   * \see gd::InitialInstance
   */
  bool UpdateProperty(const gd::String& name, const gd::String& value) {
    return UpdateProperty(content, name, value);
  };

  /**
   * \brief Called to initialize the content with the default properties
   * for the behavior.
   */
  virtual void InitializeContent() { InitializeContent(content); };

  /**
   * \brief Serialize the behavior content.
   */
  virtual void SerializeTo(gd::SerializerElement& element) const {
    element = content;
  };

  /**
   * \brief Unserialize the behavior content.
   */
  virtual void UnserializeFrom(const gd::SerializerElement& element) {
    content = element;
  };

  const gd::SerializerElement& GetContent() const { return content; };
  gd::SerializerElement& GetContent() { return content; };

  /**
   * \brief Set if the behavior configuration panel should be folded in the UI.
   */
  void SetFolded(bool fold = true) { folded = fold; }

  /**
   * \brief True if the behavior configuration panel should be folded in the UI.
   */
  bool IsFolded() const { return folded; }

  /**
   * @brief Set if the whole behavior should be visible or not in the Quick
   * Customization.
   */
  void SetQuickCustomizationVisibility(
      QuickCustomization::Visibility visibility) {
    quickCustomizationVisibility = visibility;
  }

  /**
   * @brief Get if the whole behavior should be visible or not in the Quick
   * Customization.
   */
  QuickCustomization::Visibility GetQuickCustomizationVisibility() const {
    return quickCustomizationVisibility;
  }

  /**
   * @brief Get the map of properties and their visibility in the Quick
   * Customization.
   */
  QuickCustomizationVisibilitiesContainer&
  GetPropertiesQuickCustomizationVisibilities() {
    return propertiesQuickCustomizationVisibilities;
  }

  /**
   * @brief Get the map of properties and their visibility in the Quick
   * Customization.
   */
  const QuickCustomizationVisibilitiesContainer&
  GetPropertiesQuickCustomizationVisibilities() const {
    return propertiesQuickCustomizationVisibilities;
  }

  /**
   * \brief Called ( e.g. during compilation ) so as to inventory internal
   * resources and sometimes update their filename. Implementation example:
   * \code
   * worker.ExposeImage(myImage);
   * worker.ExposeFile(myResourceFile);
   * \endcode
   *
   * \see ArbitraryResourceWorker
   */
  void ExposeResources(gd::ArbitraryResourceWorker& worker);

 protected:
  /**
   * \brief Called when the IDE wants to know about the custom properties of the
   * behavior.
   *
   * Implementation example:
   \code
      std::map<gd::String, gd::PropertyDescriptor> properties;
      properties[_("Initial speed")].SetValue(gd::String::From(initialSpeed));

      return properties;
   \endcode
   *
   * \return a std::map with properties names as key.
   * \see gd::PropertyDescriptor
   */
  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent) const;

  /**
   * \brief Called when the IDE wants to update a custom property of the
   * behavior
   *
   * \return false if the new value cannot be set
   * \see gd::InitialInstance
   */
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value) {
    return false;
  };

  /**
   * \brief Called to initialize the content with the default properties
   * for the behavior.
   */
  virtual void InitializeContent(gd::SerializerElement& behaviorContent) {};

 private:
  gd::String name;  ///< Name of the behavior
  gd::String type;  ///< The type of the behavior that is represented. Usually
                    ///< in the form "ExtensionName::BehaviorTypeName"

  gd::SerializerElement content;  // Storage for the behavior properties
  bool folded;
  QuickCustomization::Visibility quickCustomizationVisibility;
  QuickCustomizationVisibilitiesContainer
      propertiesQuickCustomizationVisibilities;
};

}  // namespace gd
