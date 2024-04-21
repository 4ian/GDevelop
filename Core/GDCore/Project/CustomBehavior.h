/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_CUSTOMBEHAVIOR_H
#define GDCORE_CUSTOMBEHAVIOR_H

#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace gd;

namespace gd {
/**
 * \brief A gd::Behavior that stores its content in JSON.
 */
class CustomBehavior : public gd::Behavior {
public:
  CustomBehavior(const gd::String &name,
                 const Project &project_,
                 const gd::String &fullType)
      : Behavior(name, fullType),
        project(project_) {}
  CustomBehavior *Clone() const override;

  using Behavior::GetProperties;
  using Behavior::InitializeContent;
  using Behavior::UpdateProperty;

protected:
  std::map<gd::String, gd::PropertyDescriptor>
  GetProperties(const gd::SerializerElement &behaviorContent) const override;
  bool UpdateProperty(gd::SerializerElement &behaviorContent,
                      const gd::String &name, const gd::String &value) override;
  void InitializeContent(gd::SerializerElement &behaviorContent) override;

private:
  const Project &project; ///< The project is used to get the
                          ///< EventBasedBehavior from the fullType.
};
}  // namespace gd

#endif  // GDCORE_CUSTOMBEHAVIOR_H