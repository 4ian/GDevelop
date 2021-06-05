/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ExpressionCompletionFinder.h"

namespace gd {

const gd::ParameterMetadata
    ExpressionCompletionDescription::badParameterMetadata;

/**
 * \brief Turn an ExpressionCompletionDescription to a string.
 */
std::ostream& operator<<(std::ostream& os,
                         ExpressionCompletionDescription const& value) {
  os << "{ " << value.GetCompletionKind() << ", " << value.GetType() << ", "
     << value.GetPrefix() << ", " << value.GetObjectName() << ", "
     << value.GetBehaviorName() << ", "
     << (value.IsExact() ? "exact" : "non-exact") << ", "
     << (value.IsLastParameter() ? "last parameter" : "not last parameter")
     << ", "
     << (value.HasParameterMetadata()
             ? gd::String::From(&value.GetParameterMetadata())
             : "no parameter metadata")
     << " }";
  return os;
}

}  // namespace gd
