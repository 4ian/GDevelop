#include <GDCore/Project/Object.h>
#include <GDCore/Project/ObjectConfiguration.h>
#include <GDCore/Project/Project.h>
#include <GDCore/Project/PropertyDescriptor.h>
#include <GDCore/Serialization/Serializer.h>
#include <GDCore/Serialization/SerializerElement.h>
#include <emscripten.h>

using namespace gd;

/**
 * \brief A gd::Object that stores its content in JSON and forward the
 * properties related functions to Javascript with Emscripten.
 *
 * It also implements "ExposeResources" to expose the properties of type
 * "resource".
 */
class ObjectJsImplementation : public gd::ObjectConfiguration {
 public:
  ObjectJsImplementation() : jsonContent("{}") {}
  std::unique_ptr<gd::ObjectConfiguration> Clone() const override;

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

  void __destroy__();

  const gd::String& GetRawJSONContent() const { return jsonContent; };
  ObjectJsImplementation& SetRawJSONContent(const gd::String& newContent) {
    jsonContent = newContent;
    return *this;
  };

  void ExposeResources(gd::ArbitraryResourceWorker& worker) override;

 protected:
  void DoSerializeTo(SerializerElement& arg0) const override;
  void DoUnserializeFrom(Project& arg0, const SerializerElement& arg1) override;
  gd::String jsonContent;
};
