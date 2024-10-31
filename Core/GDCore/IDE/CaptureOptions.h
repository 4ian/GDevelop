#pragma once
#include <memory>
#include <vector>

#include "GDCore/String.h"

namespace gd {

class GD_CORE_API Screenshot {
 public:
  Screenshot();
  virtual ~Screenshot() {};

  void SetDelayTimeInSeconds(int delayTimeInMs_) {
    delayTimeInMs = delayTimeInMs_;
  }
  int GetDelayTimeInSeconds() const { return delayTimeInMs; }

  void SetSignedUrl(const gd::String& signedUrl_) { signedUrl = signedUrl_; }
  const gd::String& GetSignedUrl() const { return signedUrl; }

  void SetPublicUrl(const gd::String& publicUrl_) { publicUrl = publicUrl_; }
  const gd::String& GetPublicUrl() const { return publicUrl; }

 private:
  int delayTimeInMs = 0;
  gd::String signedUrl;
  gd::String publicUrl;
};

class GD_CORE_API CaptureOptions {
 public:
  CaptureOptions();
  virtual ~CaptureOptions() {};

  bool IsEmpty() const { return screenshots.empty(); }

  void AddScreenshot(const Screenshot& screenshot) {
    screenshots.push_back(screenshot);
  }

  const std::vector<Screenshot>& GetScreenshots() const { return screenshots; }

  void ClearScreenshots() { screenshots.clear(); }

 private:
  std::vector<Screenshot> screenshots;
};

}  // namespace gd