#include "BehaviorSharedDataJsImplementation.h"
#include <GDCore/IDE/Dialogs/PropertyDescriptor.h>
#include <GDCore/Project/Behavior.h>
#include <GDCore/Project/Project.h>
#include <GDCore/Serialization/Serializer.h>
#include <GDCore/Serialization/SerializerElement.h>
#include <emscripten.h>
#include <map>

using namespace gd;

std::shared_ptr<gd::BehaviorsSharedData>
BehaviorSharedDataJsImplementation::Clone() const {
  BehaviorSharedDataJsImplementation* clone =
      new BehaviorSharedDataJsImplementation(*this);

  // Copy the references to the JS implementations of the functions (because we
  // want an object cloned from C++ to retain the functions implemented in JS).
  EM_ASM_INT(
      {
        var clone = Module['wrapPointer'](
            $0, Module['BehaviorSharedDataJsImplementation']);
        var self = Module['wrapPointer'](
            $1, Module['BehaviorSharedDataJsImplementation']);

        clone['getProperties'] = self['getProperties'];
        clone['updateProperty'] = self['updateProperty'];
      },
      (int)clone,
      (int)this);

  return std::shared_ptr<gd::BehaviorsSharedData>(clone);
}
std::map<gd::String, gd::PropertyDescriptor>
BehaviorSharedDataJsImplementation::GetProperties(gd::Project&) const {
  std::map<gd::String, gd::PropertyDescriptor>* jsCreatedProperties = nullptr;
  std::map<gd::String, gd::PropertyDescriptor> copiedProperties;

  jsCreatedProperties = (std::map<gd::String, gd::PropertyDescriptor>*)EM_ASM_INT(
      {
        var self = Module['getCache'](
            Module['BehaviorSharedDataJsImplementation'])[$0];
        if (!self.hasOwnProperty('getProperties'))
          throw 'getProperties is not defined on a BehaviorSharedDataJsImplementation.';

        var objectContent = JSON.parse(Pointer_stringify($1));
        var newProperties = self['getProperties'](objectContent);
        if (!newProperties)
          throw 'getProperties returned nothing in a gd::BehaviorSharedDataJsImplementation.';

        return getPointer(newProperties);
      },
      (int)this,
      jsonContent.c_str());

  copiedProperties = *jsCreatedProperties;
  delete jsCreatedProperties;
  return copiedProperties;
}
bool BehaviorSharedDataJsImplementation::UpdateProperty(const gd::String& arg0,
                                                        const gd::String& arg1,
                                                        Project&) {
  jsonContent = (const char*)EM_ASM_INT(
      {
        var self = Module['getCache'](
            Module['BehaviorSharedDataJsImplementation'])[$0];
        if (!self.hasOwnProperty('updateProperty'))
          throw 'updateProperty is not defined on a BehaviorSharedDataJsImplementation.';
        var objectContent = JSON.parse(Pointer_stringify($1));
        self['updateProperty'](
            objectContent, Pointer_stringify($2), Pointer_stringify($3));
        return ensureString(JSON.stringify(objectContent));
      },
      (int)this,
      jsonContent.c_str(),
      arg0.c_str(),
      arg1.c_str());

  return true;
}

void BehaviorSharedDataJsImplementation::SerializeTo(
    SerializerElement& arg0) const {
  arg0.AddChild("content") = gd::Serializer::FromJSON(jsonContent);
}
void BehaviorSharedDataJsImplementation::UnserializeFrom(
    const SerializerElement& arg1) {
  jsonContent = gd::Serializer::ToJSON(arg1.GetChild("content"));
}

void BehaviorSharedDataJsImplementation::__destroy__() {  // Useless?
  EM_ASM_INT(
      {
        var self = Module['getCache'](
            Module['BehaviorSharedDataJsImplementation'])[$0];
        if (!self.hasOwnProperty('__destroy__'))
          throw 'a JSImplementation must implement all functions, you forgot BehaviorSharedDataJsImplementation::__destroy__.';
        self['__destroy__']();
      },
      (int)this);
}
