/** \file
 *  GDevelop
 *  2008-2016 Florian Rival (Florian.Rival@gmail.com)
 */

#include "JsCodeEvent.h"
#include <fstream>
#include <iostream>
#if !defined(GD_NO_WX_GUI)
#include <wx/dcmemory.h>
#include <wx/filename.h>
#endif
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorItemsAreas.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorSelection.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/SourceFile.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"

using namespace std;

namespace gdjs {

void JsCodeEvent::SerializeTo(gd::SerializerElement& element) const {
  element.AddChild("inlineCode").SetValue(inlineCode);
  element.AddChild("parameterObjects").SetValue(parameterObjects);
}

void JsCodeEvent::UnserializeFrom(gd::Project& project,
                                  const gd::SerializerElement& element) {
  inlineCode = element.GetChild("inlineCode").GetValue().GetString();
  parameterObjects =
      element.GetChild("parameterObjects").GetValue().GetString();
}

JsCodeEvent::JsCodeEvent()
    : BaseEvent(),
      inlineCode("runtimeScene.setBackgroundColor(100,100,240);\n") {}

}  // namespace gdjs
