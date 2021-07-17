/*
 * GDevelop Core
 * Copyright 2008-2018 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "LoadingScreen.h"

#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

LoadingScreen::LoadingScreen()
    : showGDevelopSplash(true),
      gdevelopLogoStyle("light"),
      backgroundImageResourceName(""),
      backgroundColor(0),
      backgroundFadeInDuration(0.2),
      minDuration(1.5),
      logoAndProgressFadeInDuration(0.2),
      logoAndProgressLogoFadeInDelay(0.2),
      showProgressBar(true),
      progressBarWidth(120),
      progressBarHeight(20),
      progressBarColor(0xFFFFFF){};

void LoadingScreen::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("showGDevelopSplash", showGDevelopSplash);
  element.SetAttribute("gdevelopLogoStyle",
                       gdevelopLogoStyle);
  element.SetAttribute("backgroundImageResourceName",
                       backgroundImageResourceName);
  element.SetAttribute("backgroundColor", backgroundColor);
  element.SetAttribute("backgroundFadeInDuration", backgroundFadeInDuration);
  element.SetAttribute("minDuration", minDuration);
  element.SetAttribute("logoAndProgressFadeInDuration", logoAndProgressFadeInDuration);
  element.SetAttribute("logoAndProgressLogoFadeInDelay", logoAndProgressLogoFadeInDelay);
  element.SetAttribute("showProgressBar", showProgressBar);
  element.SetAttribute("progressBarWidth", progressBarWidth);
  element.SetAttribute("progressBarHeight", progressBarHeight);
  element.SetAttribute("progressBarColor", progressBarColor);
}

void LoadingScreen::UnserializeFrom(const SerializerElement& element) {
  showGDevelopSplash = element.GetBoolAttribute("showGDevelopSplash", true);
  gdevelopLogoStyle =
      element.GetStringAttribute("gdevelopLogoStyle", "light");
  backgroundImageResourceName =
      element.GetStringAttribute("backgroundImageResourceName");
  backgroundColor = element.GetIntAttribute("backgroundColor", 0);
  backgroundFadeInDuration =
      element.GetDoubleAttribute("backgroundFadeInDuration", 0.2);
  minDuration = element.GetDoubleAttribute("minDuration", 1.5);
  logoAndProgressFadeInDuration = element.GetDoubleAttribute("logoAndProgressFadeInDuration", 0.2);
  logoAndProgressLogoFadeInDelay = element.GetDoubleAttribute("logoAndProgressLogoFadeInDelay", 0.2);
  showProgressBar = element.GetBoolAttribute("showProgressBar", true);
  progressBarWidth = element.GetDoubleAttribute("progressBarWidth", 120);
  progressBarHeight = element.GetDoubleAttribute("progressBarHeight", 20);
  progressBarColor = element.GetIntAttribute("progressBarColor", 0xFFFFFF);
}
}  // namespace gd
