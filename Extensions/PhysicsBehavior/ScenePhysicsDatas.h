/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef SCENEPHYSICSDATAS_H
#define SCENEPHYSICSDATAS_H

#include "GDCore/Project/BehaviorsSharedData.h"

/**
 * \brief Handle the data shared by Physics Behavior
 */
class ScenePhysicsDatas : public gd::BehaviorsSharedData {
 public:
  ScenePhysicsDatas(){};
  virtual ~ScenePhysicsDatas(){};
  virtual ScenePhysicsDatas* Clone() const override {
    return new ScenePhysicsDatas(*this);
  }

#if defined(GD_IDE_ONLY)
  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorSharedDataContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement& behaviorSharedDataContent,
                              const gd::String& name,
                              const gd::String& value) override;
#endif
  virtual void InitializeContent(
      gd::SerializerElement& behaviorSharedDataContent) override;
};

#endif  // SCENEPHYSICSDATAS_H
