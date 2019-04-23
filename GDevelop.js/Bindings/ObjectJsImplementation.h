#include <GDCore/IDE/Dialogs/PropertyDescriptor.h>
#include <GDCore/Project/Object.h>
#include <GDCore/Project/Project.h>
#include <GDCore/Serialization/Serializer.h>
#include <GDCore/Serialization/SerializerElement.h>
#include <emscripten.h>

using namespace gd;

/**
 * \brief A gd::Object that stores its content in JSON and forward the
 * properties related functions to Javascript with Emscripten.
 */
class ObjectJsImplementation : public gd::Object {
 public:
  ObjectJsImplementation(gd::String name_) : Object(name_), jsonContent("{}") {}
  virtual std::unique_ptr<gd::Object> Clone() const override;

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      gd::Project& project) const override;
  virtual bool UpdateProperty(const gd::String& name,
                              const gd::String& value,
                              gd::Project& project) override;

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

 protected:
  virtual void DoSerializeTo(SerializerElement& arg0) const override;
  virtual void DoUnserializeFrom(Project& arg0,
                                 const SerializerElement& arg1) override;
  gd::String jsonContent;
};
