#include <GDCore/Project/PropertyDescriptor.h>
#include <GDCore/Project/Behavior.h>
#include <GDCore/Project/Project.h>
#include <GDCore/Serialization/Serializer.h>
#include <GDCore/Serialization/SerializerElement.h>
#include <emscripten.h>

using namespace gd;

/**
 * \brief An adapter to implement a gd::Behavior in JavaScript.
 *
 * This is the class to be used to define a new behavior in JsExtension.js
 */
class BehaviorJsImplementation : public gd::Behavior {
 public:
  BehaviorJsImplementation(){};
  virtual BehaviorJsImplementation* Clone() const override;

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value) override;
  virtual void InitializeContent(
      gd::SerializerElement& behaviorContent) override;

  void __destroy__();

 private:
};
