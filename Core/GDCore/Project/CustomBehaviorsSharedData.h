/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_CUSTOMBEHAVIORSSHAREDDATA_H
#define GDCORE_CUSTOMBEHAVIORSSHAREDDATA_H

#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace gd;

namespace gd {
/**
 * \brief A gd::BehaviorsSharedData that stores its content in JSON.
 */
class CustomBehaviorsSharedData : public gd::BehaviorsSharedData {
public:
  CustomBehaviorsSharedData(const gd::String &name, const Project &project_,
                            const gd::String &fullType)
      : BehaviorsSharedData(name, fullType), project(project_) {}
  CustomBehaviorsSharedData *Clone() const override;

  using BehaviorsSharedData::GetProperties;
  using BehaviorsSharedData::InitializeContent;
  using BehaviorsSharedData::UpdateProperty;

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
} // namespace gd

#endif // GDCORE_CUSTOMBEHAVIORSSHAREDDATA_H