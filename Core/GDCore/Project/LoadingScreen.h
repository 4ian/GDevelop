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
   * \brief Return true if the GDevelop logo should be shown while loading
   * assets.
   */
  bool IsGDevelopLogoShownDuringLoadingScreen() const { return showGDevelopLogoDuringLoadingScreen; };

  /**
   * \brief Set if the GDevelop logo should be shown while loading assets.
   */
  LoadingScreen& ShowGDevelopLogoDuringLoadingScreen(bool show) {
    showGDevelopLogoDuringLoadingScreen = show;
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

  gd::String& GetBackgroundImageResourceName() {
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

  double GetProgressBarMinWidth() const { return progressBarMinWidth; }

  LoadingScreen& SetProgressBarMinWidth(double value) {
    progressBarMinWidth = value;
    return *this;
  }

  double GetProgressBarMaxWidth() const { return progressBarMaxWidth; }

  LoadingScreen& SetProgressBarMaxWidth(double value) {
    progressBarMaxWidth = value;
    return *this;
  }

  double GetProgressBarWidthPercent() const { return progressBarWidthPercent; }

  LoadingScreen& SetProgressBarWidthPercent(double value) {
    progressBarWidthPercent = value;
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
   * \brief Serialize the loading screen setup.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the loading screen setup.
   */
  void UnserializeFrom(const SerializerElement& element);
  ///@}

 private:
  bool showGDevelopLogoDuringLoadingScreen;
  gd::String gdevelopLogoStyle;
  gd::String backgroundImageResourceName;
  int backgroundColor;
  double backgroundFadeInDuration; // In seconds.
  double minDuration; // In seconds.
  double logoAndProgressFadeInDuration; // In seconds.
  double logoAndProgressLogoFadeInDelay; // In seconds.
  bool showProgressBar;
  double progressBarMinWidth; // In pixels.
  double progressBarMaxWidth; // In pixels.
  double progressBarWidthPercent;
  double progressBarHeight; // In pixels.
  int progressBarColor;
};
}  // namespace gd

#endif  // GDCORE_LOADINGSCREEN_H
