/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "AsyncEvent.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace std;

namespace gd {

AsyncEvent::AsyncEvent() : BaseEvent() {}

AsyncEvent::~AsyncEvent(){};

vector<const gd::InstructionsList *> AsyncEvent::GetAllActionsVectors() const {
  vector<const gd::InstructionsList *> allActions;
  allActions.push_back(&actions);

  return allActions;
}

vector<gd::InstructionsList *> AsyncEvent::GetAllActionsVectors() {
  vector<gd::InstructionsList *> allActions;
  allActions.push_back(&actions);

  return allActions;
}

} // namespace gd
