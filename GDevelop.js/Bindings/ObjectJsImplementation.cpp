#include "ObjectJsImplementation.h"
#include <GDCore/IDE/Dialogs/PropertyDescriptor.h>
#include <GDCore/Project/Object.h>
#include <GDCore/Project/Project.h>
#include <GDCore/Serialization/Serializer.h>
#include <GDCore/Serialization/SerializerElement.h>
#include <emscripten.h>
#include <map>

using namespace gd;

std::unique_ptr<gd::Object> ObjectJsImplementation::Clone() const {
  ObjectJsImplementation* clone = new ObjectJsImplementation(*this);

  // Copy the references to the JS implementations of the functions (because we
  // want an object cloned from C++ to retain the functions implemented in JS).
  EM_ASM_INT(
      {
        var clone = Module['wrapPointer']($0, Module['ObjectJsImplementation']);
        var self = Module['wrapPointer']($1, Module['ObjectJsImplementation']);
        clone['getProperties'] = self['getProperties'];
        clone['updateProperty'] = self['updateProperty'];
        clone['getInitialInstanceProperties'] =
            self['getInitialInstanceProperties'];
        clone['updateInitialInstanceProperty'] =
            self['updateInitialInstanceProperty'];
      },
      (int)clone,
      (int)this);

  return std::unique_ptr<gd::Object>(clone);
}

std::map<gd::String, gd::PropertyDescriptor>
ObjectJsImplementation::GetProperties(gd::Project&) const {
  std::map<gd::String, gd::PropertyDescriptor>* jsCreatedProperties = nullptr;
  std::map<gd::String, gd::PropertyDescriptor> copiedProperties;

  jsCreatedProperties = (std::map<gd::String, gd::PropertyDescriptor>*)EM_ASM_INT(
      {
        var self = Module['getCache'](Module['ObjectJsImplementation'])[$0];
        if (!self.hasOwnProperty('getProperties'))
          throw 'getProperties is not defined on a ObjectJsImplementation.';

        var objectContent = JSON.parse(Pointer_stringify($1));
        var newProperties = self['getProperties'](objectContent);
        if (!newProperties)
          throw 'getProperties returned nothing in a gd::ObjectJsImplementation.';

        return getPointer(newProperties);
      },
      (int)this,
      jsonContent.c_str());

  copiedProperties = *jsCreatedProperties;
  delete jsCreatedProperties;
  return copiedProperties;
}
bool ObjectJsImplementation::UpdateProperty(const gd::String& arg0,
                                            const gd::String& arg1,
                                            Project&) {
  jsonContent = (const char*)EM_ASM_INT(
      {
        var self = Module['getCache'](Module['ObjectJsImplementation'])[$0];
        if (!self.hasOwnProperty('updateProperty'))
          throw 'updateProperty is not defined on a ObjectJsImplementation.';
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

std::map<gd::String, gd::PropertyDescriptor>
ObjectJsImplementation::GetInitialInstanceProperties(
    const gd::InitialInstance& instance,
    gd::Project& project,
    gd::Layout& scene) {
  std::map<gd::String, gd::PropertyDescriptor>* jsCreatedProperties = nullptr;
  std::map<gd::String, gd::PropertyDescriptor> copiedProperties;

  jsCreatedProperties = (std::map<gd::String, gd::PropertyDescriptor>*)EM_ASM_INT(
      {
        var self = Module['getCache'](Module['ObjectJsImplementation'])[$0];
        if (!self.hasOwnProperty('getInitialInstanceProperties'))
          throw 'getInitialInstanceProperties is not defined on a ObjectJsImplementation.';

        var objectContent = JSON.parse(Pointer_stringify($1));
        var newProperties = self['getInitialInstanceProperties'](
            objectContent,
            wrapPointer($2, Module['InitialInstance']),
            wrapPointer($3, Module['Project']),
            wrapPointer($4, Module['Layout']));
        if (!newProperties)
          throw 'getInitialInstanceProperties returned nothing in a gd::ObjectJsImplementation.';

        return getPointer(newProperties);
      },
      (int)this,
      jsonContent.c_str(),
      (int)&instance,
      (int)&project,
      (int)&scene);

  copiedProperties = *jsCreatedProperties;
  delete jsCreatedProperties;
  return copiedProperties;
}

bool ObjectJsImplementation::UpdateInitialInstanceProperty(
    gd::InitialInstance& instance,
    const gd::String& name,
    const gd::String& value,
    gd::Project& project,
    gd::Layout& scene) {
  return EM_ASM_INT(
      {
        var self = Module['getCache'](Module['ObjectJsImplementation'])[$0];
        if (!self.hasOwnProperty('updateInitialInstanceProperty'))
          throw 'updateInitialInstanceProperty is not defined on a ObjectJsImplementation.';
        var objectContent = JSON.parse(Pointer_stringify($1));
        return self['updateInitialInstanceProperty'](
            objectContent,
            wrapPointer($2, Module['InitialInstance']),
            Pointer_stringify($3),
            Pointer_stringify($4),
            wrapPointer($5, Module['Project']),
            wrapPointer($6, Module['Layout']));
      },
      (int)this,
      jsonContent.c_str(),
      (int)&instance,
      name.c_str(),
      value.c_str(),
      (int)&project,
      (int)&scene);
}

void ObjectJsImplementation::DoSerializeTo(SerializerElement& arg0) const {
  arg0.AddChild("content") = gd::Serializer::FromJSON(jsonContent);
}
void ObjectJsImplementation::DoUnserializeFrom(Project& arg0,
                                               const SerializerElement& arg1) {
  jsonContent = gd::Serializer::ToJSON(arg1.GetChild("content"));
}

void ObjectJsImplementation::__destroy__() {  // Useless?
  EM_ASM_INT(
      {
        var self = Module['getCache'](Module['ObjectJsImplementation'])[$0];
        if (!self.hasOwnProperty('__destroy__'))
          throw 'a JSImplementation must implement all functions, you forgot ObjectJsImplementation::__destroy__.';
        self['__destroy__']();
      },
      (int)this);
}
