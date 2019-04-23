/** \file
 *  GDevelop
 *  2008-2016 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef JSCODEEVENT_H
#define JSCODEEVENT_H
#include "GDCore/Events/Event.h"
namespace gd {
class Instruction;
class Project;
class SerializerElement;
class Layout;
}

namespace gdjs {

/**
 * \brief Event used to insert raw javascript code into events.
 */
class JsCodeEvent : public gd::BaseEvent {
 public:
  JsCodeEvent();
  virtual ~JsCodeEvent(){};

  virtual JsCodeEvent* Clone() const { return new JsCodeEvent(*this); }

  virtual bool IsExecutable() const { return true; }
  virtual bool CanHaveSubEvents() const { return false; }

  const gd::String& GetInlineCode() const { return inlineCode; };
  void SetInlineCode(const gd::String& code) { inlineCode = code; };

  const gd::String& GetParameterObjects() const { return parameterObjects; };
  void SetParameterObjects(const gd::String& objectName) {
    parameterObjects = objectName;
  };

  virtual void SerializeTo(gd::SerializerElement& element) const;
  virtual void UnserializeFrom(gd::Project& project,
                               const gd::SerializerElement& element);

 private:
  void Init(const JsCodeEvent& event);

  gd::String inlineCode;        ///< Contains the Javacript code of the event.
  gd::String parameterObjects;  ///< Name of the (group of) objects to pass as
                                ///< parameter.
};

}  // namespace gdjs

#endif  // JSCODEEVENT_H
