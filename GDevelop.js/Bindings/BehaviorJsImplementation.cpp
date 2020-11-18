#include "BehaviorJsImplementation.h"
#include <GDCore/Project/PropertyDescriptor.h>
#include <GDCore/Project/Behavior.h>
#include <GDCore/Project/Project.h>
#include <GDCore/Serialization/Serializer.h>
#include <GDCore/Serialization/SerializerElement.h>
#include <emscripten.h>
#include <map>

using namespace gd;

BehaviorJsImplementation* BehaviorJsImplementation::Clone() const {
  BehaviorJsImplementation* clone = new BehaviorJsImplementation(*this);

  // Copy the references to the JS implementations of the functions (because we
  // want an object cloned from C++ to retain the functions implemented in JS).
  EM_ASM_INT(
      {
        var clone =
            Module['wrapPointer']($0, Module['BehaviorJsImplementation']);
        var self =
            Module['wrapPointer']($1, Module['BehaviorJsImplementation']);

        clone['getProperties'] = self['getProperties'];
        clone['updateProperty'] = self['updateProperty'];
        clone['initializeContent'] = self['initializeContent'];
      },
      (int)clone,
      (int)this);

  return clone;
}
std::map<gd::String, gd::PropertyDescriptor>
BehaviorJsImplementation::GetProperties(const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor>* jsCreatedProperties = nullptr;
  std::map<gd::String, gd::PropertyDescriptor> copiedProperties;

  jsCreatedProperties = (std::map<gd::String, gd::PropertyDescriptor>*)EM_ASM_INT(
      {
        var self = Module['getCache'](Module['BehaviorJsImplementation'])[$0];
        if (!self.hasOwnProperty('getProperties'))
          throw 'getProperties is not defined on a BehaviorJsImplementation.';

        var newProperties = self['getProperties'](wrapPointer($1, Module['SerializerElement']));
        if (!newProperties)
          throw 'getProperties returned nothing in a gd::BehaviorJsImplementation.';

        return getPointer(newProperties);
      },
      (int)this,
      (int)&behaviorContent);

  copiedProperties = *jsCreatedProperties;
  delete jsCreatedProperties;
  return copiedProperties;
}
bool BehaviorJsImplementation::UpdateProperty(gd::SerializerElement& behaviorContent,
                                              const gd::String& name,
                                              const gd::String& value) {
  EM_ASM_INT(
      {
        var self = Module['getCache'](Module['BehaviorJsImplementation'])[$0];
        if (!self.hasOwnProperty('updateProperty'))
          throw 'updateProperty is not defined on a BehaviorJsImplementation.';

        self['updateProperty'](
            wrapPointer($1, Module['SerializerElement']), UTF8ToString($2), UTF8ToString($3));
      },
      (int)this,
      (int)&behaviorContent,
      name.c_str(),
      value.c_str());

  return true;
}
void BehaviorJsImplementation::InitializeContent(gd::SerializerElement& behaviorContent) {
  EM_ASM_INT(
      {
        var self = Module['getCache'](Module['BehaviorJsImplementation'])[$0];
        if (!self.hasOwnProperty('initializeContent'))
          throw 'initializeContent is not defined on a BehaviorJsImplementation.';

        self['initializeContent'](
            wrapPointer($1, Module['SerializerElement']));
      },
      (int)this,
      (int)&behaviorContent);
}

void BehaviorJsImplementation::__destroy__() {  // Useless?
  EM_ASM_INT(
      {
        var self = Module['getCache'](Module['BehaviorJsImplementation'])[$0];
        if (!self.hasOwnProperty('__destroy__'))
          throw 'a JSImplementation must implement all functions, you forgot BehaviorJsImplementation::__destroy__.';
        self['__destroy__']();
      },
      (int)this);
}
