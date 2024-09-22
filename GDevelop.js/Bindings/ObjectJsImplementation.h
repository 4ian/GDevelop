#include <GDCore/Project/Object.h>
#include <GDCore/Project/ObjectConfiguration.h>
#include <GDCore/Project/Project.h>
#include <GDCore/Project/PropertyDescriptor.h>
#include <GDCore/Serialization/Serializer.h>
#include <GDCore/Serialization/SerializerElement.h>
#include <emscripten.h>

using namespace gd;

/**
 * \brief A gd::ObjectConfiguration that wraps a Javascript object:
 * the content of the object is stored in JavaScript in a "content" property,
 * allowing both fast access in JavaScript and still ability to access properties
 * via the usual methods.
 *
 * It also implements "ExposeResources" to expose the properties of type
 * "resource".
 */
class ObjectJsImplementation : public gd::ObjectConfiguration {
 public:
  ObjectJsImplementation() {}
  std::unique_ptr<gd::ObjectConfiguration> Clone() const override;

  std::map<gd::String, gd::PropertyDescriptor> GetProperties() const override;
  bool UpdateProperty(const gd::String& name, const gd::String& value) override;

  std::map<gd::String, gd::PropertyDescriptor> GetInitialInstanceProperties(
      const gd::InitialInstance& instance) override;
  bool UpdateInitialInstanceProperty(gd::InitialInstance& instance,
                                     const gd::String& name,
                                     const gd::String& value) override;

  void __destroy__();

  void ExposeResources(gd::ArbitraryResourceWorker& worker) override;

 protected:
  void DoSerializeTo(SerializerElement& arg0) const override;
  void DoUnserializeFrom(Project& arg0, const SerializerElement& arg1) override;
};
