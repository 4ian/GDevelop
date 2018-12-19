/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include "ProfileEvent.h"
#include <iostream>
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCpp/Extensions/Builtin/ProfileTools.h"
#include "GDCpp/IDE/BaseProfiler.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"

ProfileEvent::ProfileEvent() : BaseEvent(), index(0) {}

ProfileEvent::~ProfileEvent() {}

gd::String ProfileEvent::GenerateEventCode(
    gd::EventsCodeGenerator& codeGenerator,
    gd::EventsCodeGenerationContext& parentContext) {
  if (!codeGenerator.HasProjectAndLayout()) return "/*Profiler not supported when generating code without layout*/";
  const gd::Layout& scene = codeGenerator.GetLayout();
  codeGenerator.AddIncludeFile("GDCpp/Extensions/Builtin/ProfileTools.h");

  ProfileLink profileLink;
  profileLink.originalEvent = originalEvent;
  std::cout << scene.GetProfiler() << std::endl;
  if (scene.GetProfiler())  // Should always be not NULL
  {
    scene.GetProfiler()->profileEventsInformation.push_back(profileLink);
    index = scene.GetProfiler()->profileEventsInformation.size() - 1;
  }
  gd::String code;

  if (previousProfileEvent)
    code += "EndProfileTimer(*runtimeContext->scene, " +
            gd::String::From(previousProfileEvent->index) + ");\n";

  code += "StartProfileTimer(*runtimeContext->scene, " +
          gd::String::From(index) + ");\n";

  return code;
}

/**
 * Initialize from another ProfileEvent.
 * Used by copy ctor and assignement operator
 */
void ProfileEvent::Init(const ProfileEvent& event) {
  previousProfileEvent = event.previousProfileEvent;
}

/**
 * Custom copy operator
 */
ProfileEvent::ProfileEvent(const ProfileEvent& event) : BaseEvent(event) {
  Init(event);
}

/**
 * Custom assignement operator
 */
ProfileEvent& ProfileEvent::operator=(const ProfileEvent& event) {
  if (this != &event) {
    BaseEvent::operator=(event);
    Init(event);
  }

  return *this;
}

#endif
