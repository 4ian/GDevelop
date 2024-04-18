/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include "GDCore/Extensions/PlatformExtension.h"

namespace gd {
class Variable;
class VariablesContainer;
}  
namespace gdjs {

/**
 * \brief Built-in extension providing SpriteObject objects.
 *
 * \ingroup BuiltinExtensions
 */
class CommonInstructionsExtension : public gd::PlatformExtension {
 public:
  CommonInstructionsExtension();
  virtual ~CommonInstructionsExtension(){};
private:
  static void GenerateLocalVariablesInitializationCode(
      gd::VariablesContainer &variablesContainer,
      gd::EventsCodeGenerator &codeGenerator, gd::String &code);
  static void GenerateLocalVariableInitializationCode(gd::Variable &variable,
                                                      gd::String &code,
                                                      std::size_t depth = 0);
};

}  // namespace gdjs
