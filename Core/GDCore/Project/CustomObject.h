#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace gd;

/**
 * \brief A gd::Object that stores its content in JSON and forward the
 * properties related functions to Javascript with Emscripten.
 *
 * It also implements "ExposeResources" to expose the properties of type
 * "resource".
 */
class CustomObject : public gd::Object {
 public:
  CustomObject(const EventsBasedObject& eventsBasedObject_, const gd::String &fullType)
      :  // Name is not important as this object is just a "blueprint"
         // that is copied (see calls to AddObject).
        Object("CustomObject"),
        eventsBasedObject(eventsBasedObject_) {
    SetType(fullType);
  }
  std::unique_ptr<gd::Object> Clone() const override;

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

 protected:
  void DoSerializeTo(SerializerElement& element) const override;
  void DoUnserializeFrom(Project& project, const SerializerElement& element) override;

  private:
    const EventsBasedObject& eventsBasedObject;
    gd::SerializerElement objectContent;
};
