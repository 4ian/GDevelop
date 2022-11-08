/** \file
 *  GDevelop
 *  2008-2016 Florian Rival (Florian.Rival@gmail.com)
 */

#include "JsCodeEvent.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/SourceFile.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"

using namespace std;

namespace gdjs {

vector<pair<gd::Expression*, gd::ParameterMetadata> >
JsCodeEvent::GetAllExpressionsWithMetadata() {
  vector<pair<gd::Expression*, gd::ParameterMetadata> >
      allExpressionsWithMetadata;
  auto metadata = gd::ParameterMetadata().SetType("object");
  allExpressionsWithMetadata.push_back(
      std::make_pair(&parameterObjects, metadata));

  return allExpressionsWithMetadata;
}

vector<pair<const gd::Expression*, const gd::ParameterMetadata> >
JsCodeEvent::GetAllExpressionsWithMetadata() const {
  vector<pair<const gd::Expression*, const gd::ParameterMetadata> >
      allExpressionsWithMetadata;
  auto metadata = gd::ParameterMetadata().SetType("object");
  allExpressionsWithMetadata.push_back(
      std::make_pair(&parameterObjects, metadata));

  return allExpressionsWithMetadata;
}

void JsCodeEvent::SerializeTo(gd::SerializerElement& element) const {
  element.AddChild("inlineCode").SetMultilineStringValue(inlineCode);
  element.AddChild("parameterObjects")
      .SetValue(parameterObjects.GetPlainString());
  element.AddChild("useStrict").SetValue(useStrict);
  element.AddChild("eventsSheetExpanded").SetValue(eventsSheetExpanded);
}

void JsCodeEvent::UnserializeFrom(gd::Project& project,
                                  const gd::SerializerElement& element) {
  inlineCode = element.GetChild("inlineCode").GetMultilineStringValue();
  parameterObjects = gd::Expression(
      element.GetChild("parameterObjects").GetValue().GetString());

  if (!element.HasChild("useStrict")) {
    // Compatibility with GD <= 5.0.0-beta68
    useStrict = false;
    // end of compatibility code
  } else {
    useStrict = element.GetChild("useStrict").GetBoolValue();
  }

  if (!element.HasChild("eventsSheetExpanded")) {
    // Compatibility with GD <= 5.0.0-beta101
    eventsSheetExpanded = false;
    // end of compatibility code
  } else {
    eventsSheetExpanded = element.GetChild("eventsSheetExpanded").GetBoolValue();
  }
}

JsCodeEvent::JsCodeEvent()
    : BaseEvent(),
      inlineCode("runtimeScene.setBackgroundColor(100,100,240);\n"),
      useStrict(true),
      eventsSheetExpanded(false) {}

}  // namespace gdjs
