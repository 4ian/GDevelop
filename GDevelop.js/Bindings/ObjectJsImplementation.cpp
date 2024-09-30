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

        // Make a clone of the JavaScript object containing the data. If we don't do that, the
        // content of the object would be shared between the original and the clone.
        clone['content'] = Module['_deepCloneForObjectJsImplementationContent'](self['content']);
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

        var newProperties = self['getProperties']();
        if (!newProperties)
          throw 'getProperties returned nothing in a gd::ObjectJsImplementation.';

        return getPointer(newProperties);
      },
      (int)this);

  copiedProperties = *jsCreatedProperties;
  delete jsCreatedProperties;
  return copiedProperties;
}
bool ObjectJsImplementation::UpdateProperty(const gd::String& arg0,
                                            const gd::String& arg1) {
  EM_ASM_INT(
      {
        var self = Module['getCache'](Module['ObjectJsImplementation'])[$0];
        if (!self.hasOwnProperty('updateProperty'))
          throw 'updateProperty is not defined on a ObjectJsImplementation.';

        self['updateProperty'](UTF8ToString($1), UTF8ToString($2));
      },
      (int)this,
      arg0.c_str(),
      arg1.c_str());

  return true;
}

std::map<gd::String, gd::PropertyDescriptor>
ObjectJsImplementation::GetInitialInstanceProperties(
    const gd::InitialInstance& instance) {
  std::map<gd::String, gd::PropertyDescriptor>* jsCreatedProperties = nullptr;
  std::map<gd::String, gd::PropertyDescriptor> copiedProperties;

  jsCreatedProperties = (std::map<gd::String, gd::PropertyDescriptor>*)EM_ASM_INT(
      {
        var self = Module['getCache'](Module['ObjectJsImplementation'])[$0];
        if (!self.hasOwnProperty('getInitialInstanceProperties'))
          throw 'getInitialInstanceProperties is not defined on a ObjectJsImplementation.';

        var newProperties = self['getInitialInstanceProperties'](
            wrapPointer($1, Module['InitialInstance']));
        if (!newProperties)
          throw 'getInitialInstanceProperties returned nothing in a gd::ObjectJsImplementation.';

        return getPointer(newProperties);
      },
      (int)this,
      (int)&instance);

  copiedProperties = *jsCreatedProperties;
  delete jsCreatedProperties;
  return copiedProperties;
}

bool ObjectJsImplementation::UpdateInitialInstanceProperty(
    gd::InitialInstance& instance,
    const gd::String& name,
    const gd::String& value) {
  return EM_ASM_INT(
      {
        var self = Module['getCache'](Module['ObjectJsImplementation'])[$0];
        if (!self.hasOwnProperty('updateInitialInstanceProperty'))
          throw 'updateInitialInstanceProperty is not defined on a ObjectJsImplementation.';

        return self['updateInitialInstanceProperty'](
            wrapPointer($1, Module['InitialInstance']),
            UTF8ToString($2),
            UTF8ToString($3));
      },
      (int)this,
      (int)&instance,
      name.c_str(),
      value.c_str());
}

void ObjectJsImplementation::DoSerializeTo(SerializerElement& element) const {
  SerializerElement* jsCreatedElement = (SerializerElement*)EM_ASM_INT(
      {
        var self = Module['getCache'](Module['ObjectJsImplementation'])[$0];
        if (!self.content)
          throw '`content` is not defined on a ObjectJsImplementation.';

        var serializerElement = Module['Serializer'].fromJSObject(self.content);
        return getPointer(serializerElement);
      },
      (int)this);

  // We could avoid a copy by using making a function on gd.Serializer that manipulates
  // directly the SerializerElement passed to it.
  element.AddChild("content") = *jsCreatedElement;
  delete jsCreatedElement;
}
void ObjectJsImplementation::DoUnserializeFrom(Project& project,
                                               const SerializerElement& element) {
  EM_ASM_INT(
      {
        var self = Module['getCache'](Module['ObjectJsImplementation'])[$0];
        if (!self.content)
          throw '`content` is not defined on a ObjectJsImplementation.';

        var serializerElement = wrapPointer($1, Module['SerializerElement']);
        if (!serializerElement.isValueUndefined() || serializerElement.consideredAsArray()) {
          throw new Error('The element passed to ObjectJsImplementation::DoUnserializeFrom is not an object.');
        }

        // JSON.parse + toJSON is 30% faster than gd.Serializer.toJSObject.
        self.content = JSON.parse(Module['Serializer'].toJSON(serializerElement));
      },
      (int)this,
      (int)&element.GetChild("content"));
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
