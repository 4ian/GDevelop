/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_COMMONINSTRUCTIONSEXTENSION_H
#define GDCORE_COMMONINSTRUCTIONSEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gd {

/**
 * \brief Tool class containing static methods to setup an extension
 * so that it provides standards events, objects or instructions of an
 * extension.
 *
 * \ingroup BuiltinExtensions
 */
class GD_CORE_API BuiltinExtensionsImplementer {
 public:
  static void ImplementsAdvancedExtension(gd::PlatformExtension& extension);
  static void ImplementsAudioExtension(gd::PlatformExtension& extension);
  static void ImplementsBaseObjectExtension(gd::PlatformExtension& extension);
  static void ImplementsCameraExtension(gd::PlatformExtension& extension);
  static void ImplementsCommonConversionsExtension(
      gd::PlatformExtension& extension);
  static void ImplementsCommonInstructionsExtension(
      gd::PlatformExtension& extension);
  static void ImplementsExternalLayoutsExtension(
      gd::PlatformExtension& extension);
  static void ImplementsFileExtension(gd::PlatformExtension& extension);
  static void ImplementsKeyboardExtension(gd::PlatformExtension& extension);
  static void ImplementsMathematicalToolsExtension(
      gd::PlatformExtension& extension);
  static void ImplementsMouseExtension(gd::PlatformExtension& extension);
  static void ImplementsNetworkExtension(gd::PlatformExtension& extension);
  static void ImplementsSceneExtension(gd::PlatformExtension& extension);
  static void ImplementsSpriteExtension(gd::PlatformExtension& extension);
  static void ImplementsStringInstructionsExtension(
      gd::PlatformExtension& extension);
  static void ImplementsTimeExtension(gd::PlatformExtension& extension);
  static void ImplementsVariablesExtension(gd::PlatformExtension& extension);
  static void ImplementsWindowExtension(gd::PlatformExtension& extension);
  static void ImplementsAsyncExtension(gd::PlatformExtension& extension);
  static void ImplementsResizableExtension(gd::PlatformExtension& extension);
  static void ImplementsScalableExtension(gd::PlatformExtension& extension);
  static void ImplementsFlippableExtension(gd::PlatformExtension& extension);
  static void ImplementsAnimatableExtension(gd::PlatformExtension& extension);
  static void ImplementsEffectExtension(gd::PlatformExtension& extension);
  static void ImplementsOpacityExtension(gd::PlatformExtension& extension);
  static void ImplementsTextContainerExtension(gd::PlatformExtension& extension);
};

}  // namespace gd

#endif  // GDCORE_COMMONINSTRUCTIONSEXTENSION_H
