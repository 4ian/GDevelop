/**

GDevelop - TextEntry Object Extension
Copyright (c) 2011-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <SFML/Graphics.hpp>
#include <string>
#include "GDCore/Tools/Localization.h"
#include "GDCore/Utf8/utf8.h"
#include "GDCpp/Runtime/ImageManager.h"
#include "GDCpp/Runtime/Project/InitialInstance.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "TextEntryObject.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCpp/Runtime/CommonTools.h"
#endif

using namespace std;

TextEntryObject::TextEntryObject(gd::String name_) : Object(name_) {}

RuntimeTextEntryObject::RuntimeTextEntryObject(
    RuntimeScene& scene_, const TextEntryObject& textEntryObject)
    : RuntimeObject(scene_, textEntryObject), text(), activated(true) {}

/**
 * \brief Used to update input
 */
void RuntimeTextEntryObject::Update(const RuntimeScene& scene) {
  if (!activated) return;

  // Retrieve text entered
  const auto& characters = scene.GetInputManager().GetCharactersEntered();
  for (std::size_t i = 0; i < characters.size(); ++i) {
    // Skip some non displayable characters
    if (characters[i] > 30 && (characters[i] < 127 || characters[i] > 159)) {
      text += static_cast<char32_t>(characters[i]);
    } else if (characters[i] == 8) {
      // Backspace : find the previous codepoint and remove it
      if (text.empty()) continue;

      text.pop_back();
    }
  }
}

#if defined(GD_IDE_ONLY)
void RuntimeTextEntryObject::GetPropertyForDebugger(std::size_t propertyNb,
                                                    gd::String& name,
                                                    gd::String& value) const {
  if (propertyNb == 0) {
    name = _("Text in memory");
    value = GetString();
  } else if (propertyNb == 1) {
    name = _("Activated \?");
    value = activated ? _("Yes") : _("No");
  }
}

bool RuntimeTextEntryObject::ChangeProperty(std::size_t propertyNb,
                                            gd::String newValue) {
  if (propertyNb == 0) {
    SetString(newValue);
    return true;
  } else if (propertyNb == 1) {
    activated = (newValue != _("No"));
    return true;
  }

  return true;
}

std::size_t RuntimeTextEntryObject::GetNumberOfProperties() const { return 2; }
#endif
