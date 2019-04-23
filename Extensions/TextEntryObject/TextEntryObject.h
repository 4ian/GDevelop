/**

GDevelop - TextEntry Object Extension
Copyright (c) 2011-2013 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef TEXTENTRYOBJECT_H
#define TEXTENTRYOBJECT_H
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/RuntimeObject.h"
class RuntimeScene;

/**
 * \brief Simple object which stores user keyboard input.
 */
class GD_EXTENSION_API TextEntryObject : public gd::Object {
 public:
  TextEntryObject(gd::String name_);
  virtual ~TextEntryObject(){};
  virtual std::unique_ptr<gd::Object> Clone() const {
    return gd::make_unique<TextEntryObject>(*this);
  }

 private:
};

class GD_EXTENSION_API RuntimeTextEntryObject : public RuntimeObject {
 public:
  RuntimeTextEntryObject(RuntimeScene& scene,
                         const TextEntryObject& textEntryObject);
  virtual ~RuntimeTextEntryObject(){};
  virtual std::unique_ptr<RuntimeObject> Clone() const {
    return gd::make_unique<RuntimeTextEntryObject>(*this);
  }

#if defined(GD_IDE_ONLY)
  virtual void GetPropertyForDebugger(std::size_t propertyNb,
                                      gd::String& name,
                                      gd::String& value) const;
  virtual bool ChangeProperty(std::size_t propertyNb, gd::String newValue);
  virtual std::size_t GetNumberOfProperties() const;
#endif

  virtual void Update(const RuntimeScene& scene);

  inline void SetString(gd::String str) { text = str; };
  const gd::String& GetString() const { return text; };

  void Activate(bool activate = true) { activated = activate; };
  bool IsActivated() const { return activated; };

 private:
  gd::String text;
  bool activated;
};

#endif  // TEXTENTRYOBJECT_H
