#include "ObjectJsImplementation.h"

#include <GDCore/IDE/Project/ArbitraryResourceWorker.h>
#include <GDCore/Project/Object.h>
#include <GDCore/Project/Project.h>
#include <GDCore/Project/PropertyDescriptor.h>
#include <GDCore/Serialization/Serializer.h>
#include <GDCore/Serialization/SerializerElement.h>
#include <emscripten.h>

#include <map>

using namespace gd;

std::unique_ptr<gd::ObjectConfiguration> ObjectJsImplementation::Clone() const {
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

  return std::unique_ptr<gd::ObjectConfiguration>(clone);
}

std::map<gd::String, gd::PropertyDescriptor>
ObjectJsImplementation::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor>* jsCreatedProperties = nullptr;
  std::map<gd::String, gd::PropertyDescriptor> copiedProperties;

  jsCreatedProperties = (std::map<gd::String, gd::PropertyDescriptor>*)EM_ASM_INT(
      {
        var self = Module['getCache'](Module['ObjectJsImplementation'])[$0];
        if (!self.hasOwnProperty('getProperties'))
          throw 'getProperties is not defined on a ObjectJsImplementation.';

        var objectContent = JSON.parse(UTF8ToString($1));
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
                                            const gd::String& arg1) {
  jsonContent = (const char*)EM_ASM_INT(
      {
        var self = Module['getCache'](Module['ObjectJsImplementation'])[$0];
        if (!self.hasOwnProperty('updateProperty'))
          throw 'updateProperty is not defined on a ObjectJsImplementation.';
        var objectContent = JSON.parse(UTF8ToString($1));
        self['updateProperty'](
            objectContent, UTF8ToString($2), UTF8ToString($3));
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

        var objectContent = JSON.parse(UTF8ToString($1));
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
        var objectContent = JSON.parse(UTF8ToString($1));
        return self['updateInitialInstanceProperty'](
            objectContent,
            wrapPointer($2, Module['InitialInstance']),
            UTF8ToString($3),
            UTF8ToString($4),
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

void ObjectJsImplementation::DoSerializeTo(SerializerElement& element) const {
  element.AddChild("content") = gd::Serializer::FromJSON(jsonContent);
}
void ObjectJsImplementation::DoUnserializeFrom(Project& project,
                                               const SerializerElement& element) {
  jsonContent = gd::Serializer::ToJSON(element.GetChild("content"));
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

void ObjectJsImplementation::ExposeResources(gd::ArbitraryResourceWorker& worker) {
  std::map<gd::String, gd::PropertyDescriptor> properties = GetProperties();

  for (auto& property : properties) {
    const String& propertyName = property.first;
    const gd::PropertyDescriptor& propertyDescriptor = property.second;
    if (propertyDescriptor.GetType() == "resource") {
      auto& extraInfo = propertyDescriptor.GetExtraInfo();
      const gd::String& resourceType = extraInfo.empty() ? "" : extraInfo[0];
      const gd::String& oldPropertyValue = propertyDescriptor.GetValue();

      gd::String newPropertyValue = oldPropertyValue;
      if (resourceType == "image") {
        worker.ExposeImage(newPropertyValue);
      } else if (resourceType == "audio") {
        worker.ExposeAudio(newPropertyValue);
      } else if (resourceType == "font") {
        worker.ExposeFont(newPropertyValue);
      } else if (resourceType == "video") {
        worker.ExposeVideo(newPropertyValue);
      } else if (resourceType == "json") {
        worker.ExposeJson(newPropertyValue);
        worker.ExposeEmbeddeds(newPropertyValue);
      } else if (resourceType == "tilemap") {
        worker.ExposeTilemap(newPropertyValue);
        worker.ExposeEmbeddeds(newPropertyValue);
      } else if (resourceType == "tileset") {
        worker.ExposeTileset(newPropertyValue);
      } else if (resourceType == "bitmapFont") {
        worker.ExposeBitmapFont(newPropertyValue);
      } else if (resourceType == "model3D") {
        worker.ExposeModel3D(newPropertyValue);
      } else if (resourceType == "atlas") {
        worker.ExposeAtlas(newPropertyValue);
      } else if (resourceType == "spine") {
        worker.ExposeSpine(newPropertyValue);
      }

      if (newPropertyValue != oldPropertyValue) {
        UpdateProperty(propertyName, newPropertyValue);
      }
    }
  }
}
