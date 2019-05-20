/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_BEHAVIORCONTENT_H
#define GDCORE_BEHAVIORCONTENT_H
#include <map>
#include "GDCore/Serialization/Serializer.h"
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
 * \brief Store the content (i.e: the properties) of a behavior of an object.
 *
 * \see gd::Behavior
 * \see gd::BehaviorsSharedData
 * \see gd::Object
 * \ingroup PlatformDefinition
 */
class GD_CORE_API BehaviorContent {
 public:
  BehaviorContent(const gd::String& name_, const gd::String& type_)
      : name(name_), type(type_){};
  virtual ~BehaviorContent();
  virtual BehaviorContent* Clone() const { return new BehaviorContent(*this); }

  /**
   * \brief Return the name identifying the behavior
   */
  virtual const gd::String& GetName() const { return name; }

  /**
   * \brief Change the name identifying the behavior
   */
  virtual void SetName(const gd::String& name_) { name = name_; }

  /**
   * \brief Get the type of the behavior.
   */
  virtual const gd::String& GetTypeName() const { return type; }

  /**
   * \brief Change the type of the behavior
   */
  virtual void SetTypeName(const gd::String& type_) { type = type_; }

#if defined(GD_IDE_ONLY)
  /**
   * \brief Serialize the behavior content.
   */
  virtual void SerializeTo(gd::SerializerElement& element) const {
    element = content;
  };
#endif

  /**
   * \brief Unserialize the behavior content.
   */
  virtual void UnserializeFrom(const gd::SerializerElement& element) {
    content = element;
  };

  const gd::SerializerElement& GetContent() const { return content; };
  gd::SerializerElement& GetContent() { return content; };

 protected:
  gd::String name;  ///< Name of the behavior
  gd::String type;  ///< The type of the behavior that is represented. Usually
                    ///< in the form "ExtensionName::BehaviorTypeName"

  gd::SerializerElement content;  // Storage for the behavior properties
};

}  // namespace gd

#endif  // GDCORE_BEHAVIORCONTENT_H
