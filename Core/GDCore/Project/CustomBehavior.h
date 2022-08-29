#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace gd;

/**
 * \brief A gd::Behavior that stores its content in JSON and forward the
 * properties related functions to Javascript with Emscripten.
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
  virtual std::map<gd::String, gd::PropertyDescriptor>
  GetProperties(const gd::SerializerElement &behaviorContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement &behaviorContent,
                              const gd::String &name,
                              const gd::String &value) override;
  virtual void
  InitializeContent(gd::SerializerElement &behaviorContent) override;

private:
  const Project &project; ///< The project is used to get the
                          ///< EventBasedBehavior from the fullType.
};
