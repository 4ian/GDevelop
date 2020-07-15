#include "BehaviorSharedDataJsImplementation.h"
#include <GDCore/Project/PropertyDescriptor.h>
#include <GDCore/Project/Behavior.h>
#include <GDCore/Project/Project.h>
#include <GDCore/Serialization/Serializer.h>
#include <GDCore/Serialization/SerializerElement.h>
#include <emscripten.h>
#include <map>

using namespace gd;

BehaviorSharedDataJsImplementation* BehaviorSharedDataJsImplementation::Clone()
    const {
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
        clone['initializeContent'] = self['initializeContent'];
      },
      (int)clone,
      (int)this);

  return clone;
}
std::map<gd::String, gd::PropertyDescriptor>
BehaviorSharedDataJsImplementation::GetProperties(
    const gd::SerializerElement& behaviorSharedDataContent) const {
  std::map<gd::String, gd::PropertyDescriptor>* jsCreatedProperties = nullptr;
  std::map<gd::String, gd::PropertyDescriptor> copiedProperties;

  jsCreatedProperties = (std::map<gd::String, gd::PropertyDescriptor>*)EM_ASM_INT(
      {
        var self = Module['getCache'](
            Module['BehaviorSharedDataJsImplementation'])[$0];
        if (!self.hasOwnProperty('getProperties'))
          throw 'getProperties is not defined on a BehaviorSharedDataJsImplementation.';

        var newProperties =
            self['getProperties'](wrapPointer($1, Module['SerializerElement']));
        if (!newProperties)
          throw 'getProperties returned nothing in a gd::BehaviorSharedDataJsImplementation.';

        return getPointer(newProperties);
      },
      (int)this,
      (int)&behaviorSharedDataContent);

  copiedProperties = *jsCreatedProperties;
  delete jsCreatedProperties;
  return copiedProperties;
}
bool BehaviorSharedDataJsImplementation::UpdateProperty(
    gd::SerializerElement& behaviorSharedDataContent,
    const gd::String& arg0,
    const gd::String& arg1) {
  EM_ASM_INT(
      {
        var self = Module['getCache'](
            Module['BehaviorSharedDataJsImplementation'])[$0];
        if (!self.hasOwnProperty('updateProperty'))
          throw 'updateProperty is not defined on a BehaviorSharedDataJsImplementation.';

        self['updateProperty'](wrapPointer($1, Module['SerializerElement']),
                               UTF8ToString($2),
                               UTF8ToString($3));
      },
      (int)this,
      (int)&behaviorSharedDataContent,
      arg0.c_str(),
      arg1.c_str());

  return true;
}
void BehaviorSharedDataJsImplementation::InitializeContent(
    gd::SerializerElement& behaviorSharedDataContent) {
  EM_ASM_INT(
      {
        var self = Module['getCache'](
            Module['BehaviorSharedDataJsImplementation'])[$0];
        if (!self.hasOwnProperty('initializeContent'))
          throw 'initializeContent is not defined on a BehaviorSharedDataJsImplementation.';

        self['initializeContent'](wrapPointer($1, Module['SerializerElement']));
      },
      (int)this,
      (int)&behaviorSharedDataContent);
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
