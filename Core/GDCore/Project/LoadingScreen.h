/*
 * GDevelop Core
 * Copyright 2008-2018 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_LOADINGSCREEN_H
#define GDCORE_LOADINGSCREEN_H
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Describe the content and set up of the loading screen
 *
 * \see gd::LoadingScreen
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API LoadingScreen {
 public:
  LoadingScreen();
  virtual ~LoadingScreen(){};

  /**
   * \brief Return true if the GDevelop splash should be shown while loading
   * assets.
   */
  bool IsGDevelopSplashShown() const { return showGDevelopSplash; };

  /**
   * \brief Set if the GDevelop splash should be shown while loading assets.
   */
  LoadingScreen& ShowGDevelopSplash(bool show) {
    showGDevelopSplash = show;
    return *this;
  };

  const gd::String& GetGDevelopLogoStyle() const { return gdevelopLogoStyle; };

  LoadingScreen& SetGDevelopLogoStyle(const gd::String& value) {
    gdevelopLogoStyle = value;
    return *this;
  }

  const gd::String& GetBackgroundImageResourceName() const {
    return backgroundImageResourceName;
  };

  LoadingScreen& SetBackgroundImageResourceName(const gd::String& value) {
    backgroundImageResourceName = value;
    return *this;
  }

  int GetBackgroundColor() const { return backgroundColor; };

  LoadingScreen& SetBackgroundColor(int value) {
    backgroundColor = value;
    return *this;
  }

  double GetBackgroundFadeInDuration() const {
    return backgroundFadeInDuration;
  };

  LoadingScreen& SetBackgroundFadeInDuration(double value) {
    backgroundFadeInDuration = value;
    return *this;
  }

  double GetMinDuration() const { return minDuration; };

  LoadingScreen& SetMinDuration(double value) {
    minDuration = value;
    return *this;
  }

  double GetLogoAndProgressFadeInDuration() const {
    return logoAndProgressFadeInDuration;
  }

  LoadingScreen& SetLogoAndProgressFadeInDuration(double value) {
    logoAndProgressFadeInDuration = value;
    return *this;
  }

  double GetLogoAndProgressLogoFadeInDelay() const {
    return logoAndProgressLogoFadeInDelay;
  }

  LoadingScreen& SetLogoAndProgressLogoFadeInDelay(double value) {
    logoAndProgressLogoFadeInDelay = value;
    return *this;
  }

  bool GetShowProgressBar() const { return showProgressBar; }

  LoadingScreen& SetShowProgressBar(bool value) {
    showProgressBar = value;
    return *this;
  }

  double GetProgressBarWidth() const { return progressBarWidth; }

  LoadingScreen& SetProgressBarWidth(double value) {
    progressBarWidth = value;
    return *this;
  }

  double GetProgressBarHeight() const { return progressBarHeight; }

  LoadingScreen& SetProgressBarHeight(double value) {
    progressBarHeight = value;
    return *this;
  }

  int GetProgressBarColor() const { return progressBarColor; }

  LoadingScreen& SetProgressBarColor(int value) {
    progressBarColor = value;
    return *this;
  }

  /** \name Saving and loading
   */
  ///@{
  /**
   * \brief Serialize objects groups container.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the objects groups container.
   */
  void UnserializeFrom(const SerializerElement& element);
  ///@}

 private:
  bool showGDevelopSplash;
  gd::String gdevelopLogoStyle;
  gd::String backgroundImageResourceName;
  int backgroundColor;
  double backgroundFadeInDuration;
  double minDuration;
  double logoAndProgressFadeInDuration;
  double logoAndProgressLogoFadeInDelay;
  bool showProgressBar;
  double progressBarWidth;
  double progressBarHeight;
  int progressBarColor;
};
}  // namespace gd

#endif  // GDCORE_LOADINGSCREEN_H
