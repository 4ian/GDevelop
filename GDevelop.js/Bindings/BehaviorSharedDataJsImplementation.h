#include <GDCore/IDE/Dialogs/PropertyDescriptor.h>
#include <GDCore/Project/BehaviorsSharedData.h>
#include <GDCore/Project/Project.h>
#include <GDCore/Serialization/Serializer.h>
#include <GDCore/Serialization/SerializerElement.h>
#include <emscripten.h>

using namespace gd;

/**
 * \brief A gd::BehaviorsSharedData that stores its content in JSON and forward the properties related
 * functions to Javascript with Emscripten.
 */
class BehaviorSharedDataJsImplementation : public BehaviorsSharedData {
 public:
  BehaviorSharedDataJsImplementation() : BehaviorsSharedData(), jsonContent("{}") {}
  virtual std::shared_ptr<gd::BehaviorsSharedData> Clone() const override;

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      gd::Project& project) const override;
  virtual bool UpdateProperty(const gd::String& name,
                              const gd::String& value,
                              gd::Project& project) override;

  void __destroy__();

  virtual void SerializeTo(SerializerElement& arg0) const override;
  virtual void UnserializeFrom(const SerializerElement& arg1) override;

  const gd::String& GetRawJSONContent() const { return jsonContent; };
  BehaviorSharedDataJsImplementation& SetRawJSONContent(const gd::String& newContent) {
    jsonContent = newContent;
    return *this;
  };

 private:
  gd::String jsonContent;
};
