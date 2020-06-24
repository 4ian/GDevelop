/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_BEHAVIOR_H
#define GDCORE_BEHAVIOR_H
#include <map>
#include "GDCore/String.h"
#if defined(GD_IDE_ONLY)
namespace gd {
class PropertyDescriptor;
}
#endif
namespace gd {
class SerializerElement;
class Project;
class Layout;
}  // namespace gd

namespace gd {

/**
 * \brief Base class used to represents a behavior that can be applied to an
 * object
 *
 * \see gd::BehaviorContent
 * \see gd::BehaviorsSharedData
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Behavior {
 public:
  Behavior(){};
  virtual ~Behavior();
  virtual Behavior* Clone() const { return new Behavior(*this); }

  /**
   * \brief Return the type of the behavior
   */
  const gd::String& GetTypeName() const { return type; }

  /**
   * \brief Set the type of the behavior.
   */
  void SetTypeName(const gd::String& type_) { type = type_; };

#if defined(GD_IDE_ONLY)
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
#endif

  /**
   * \brief Called to initialize the content with the default properties
   * for the behavior.
   */
  virtual void InitializeContent(gd::SerializerElement& behaviorContent){};

 private:
  gd::String type;
};

}  // namespace gd

#endif  // GDCORE_BEHAVIOR_H
