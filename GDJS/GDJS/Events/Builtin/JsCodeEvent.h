/** \file
 *  GDevelop
 *  2008-2016 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef JSCODEEVENT_H
#define JSCODEEVENT_H
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Expression.h"
namespace gd {
class Instruction;
class Project;
class SerializerElement;
class Layout;
}  // namespace gd

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

  const gd::String& GetParameterObjects() const { return parameterObjects.GetPlainString(); };
  void SetParameterObjects(const gd::String& objectName) {
    parameterObjects = gd::Expression(objectName);
  };

  virtual std::vector<std::pair<gd::Expression*, gd::ParameterMetadata> >
      GetAllExpressionsWithMetadata();
  virtual std::vector<std::pair<const gd::Expression*, const gd::ParameterMetadata> >
      GetAllExpressionsWithMetadata() const;

  virtual void SerializeTo(gd::SerializerElement& element) const;
  virtual void UnserializeFrom(gd::Project& project,
                               const gd::SerializerElement& element);
  virtual bool IsUseStrict() const { return useStrict; }

  bool IsEventsSheetExpanded() const { return eventsSheetExpanded; }
  void SetEventsSheetExpanded(bool enable) { eventsSheetExpanded = enable; };

 private:
  void Init(const JsCodeEvent& event);

  gd::String inlineCode;            ///< Contains the Javascript code of the event.
  gd::Expression parameterObjects;  ///< Name of the (group of) objects to pass as
                                    ///< parameter.
  bool useStrict;  ///< Should the generated JS function have "use strict". true
                   ///< by default. Should be removed once all the game engine
                   ///< is using "use strict".
  bool eventsSheetExpanded; ///< Is the code block expanded in the events sheet?
};

}  // namespace gdjs

#endif  // JSCODEEVENT_H
