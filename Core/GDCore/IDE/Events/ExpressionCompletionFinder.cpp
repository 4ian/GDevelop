/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ExpressionCompletionFinder.h"

namespace gd {

const gd::ParameterMetadata
    ExpressionCompletionDescription::badParameterMetadata;

const gd::ObjectConfiguration
    ExpressionCompletionDescription::badObjectConfiguration;

/**
 * \brief Turn an ExpressionCompletionDescription to a string.
 */
std::ostream& operator<<(std::ostream& os,
                         ExpressionCompletionDescription const& value) {
  os << value.ToString();
  return os;
}

}  // namespace gd
