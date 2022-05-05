/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/ExpressionTypeFinder.h"

#include <memory>
#include <vector>
#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/IDE/Events/ExpressionLeftSideTypeFinder.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Metadata/ParameterMetadata.h"
#include "GDCore/Project/Layout.h"  // For GetTypeOfObject and GetTypeOfBehavior
#include "GDCore/Tools/Localization.h"

namespace gd {
class Expression;
class ObjectsContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
}  // namespace gd

namespace gd {

  // TODO factorize
  const gd::String ExpressionTypeFinder::numberTypeString = "number";
  const gd::String ExpressionTypeFinder::stringTypeString = "string";

  const gd::String &ExpressionTypeFinder::ConvertSubtype(const gd::String &type) {
    if (type == "number" || gd::ParameterMetadata::IsExpression("number", type)) {
      return ExpressionTypeFinder::numberTypeString;
    }
    if (type == "string" || gd::ParameterMetadata::IsExpression("string", type)) {
      return ExpressionTypeFinder::stringTypeString;
    }
    return type;
  }

}  // namespace gd
