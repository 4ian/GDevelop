#include <GDCore/Project/PropertyDescriptor.h>
#include <GDCore/Project/BehaviorsSharedData.h>
#include <GDCore/Project/Project.h>
#include <GDCore/Serialization/Serializer.h>
#include <GDCore/Serialization/SerializerElement.h>
#include <emscripten.h>

using namespace gd;

/**
 * \brief An adapter to implement a gd::BehaviorsSharedData in JavaScript.
 *
 * This is the class to be used to define shared data for a BEHAVIOR in
 * JsExtension.js
 */
class BehaviorSharedDataJsImplementation : public gd::BehaviorsSharedData {
 public:
  BehaviorSharedDataJsImplementation(){};
  virtual BehaviorSharedDataJsImplementation* Clone() const override;

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorSharedDataContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement& behaviorSharedDataContent,
                              const gd::String& name,
                              const gd::String& value) override;
  virtual void InitializeContent(
      gd::SerializerElement& behaviorSharedDataContent) override;

  void __destroy__();

 private:
};
