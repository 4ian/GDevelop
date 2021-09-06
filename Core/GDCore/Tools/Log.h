/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_LOG_H
#define GDCORE_LOG_H
#include <string>
#include "GDCore/String.h"

namespace gd {

/**
 * \brief Standard function that should be used when emitting a warning to be
 * displayed to the user.
 */
void GD_CORE_API LogWarning(const gd::String& msg);

/**
 * \brief Standard function that should be used when emitting an error to be
 * displayed to the user.
 */
void GD_CORE_API LogError(const gd::String& msg);

/**
 * \brief Standard function that should be used when emitting an error to be
 * displayed to the user before a crash/undefined behavior.
 */
void GD_CORE_API LogFatalError(const gd::String& msg);

/**
 * \brief Standard function that should be used when emitting a message to be
 * displayed to the user.
 */
void GD_CORE_API LogMessage(const gd::String& msg);

/**
 * \brief Standard function that should be used when emitting a status message
 * to be displayed to the user.
 */
void GD_CORE_API LogStatus(const gd::String& msg);

}  // namespace gd

#endif  // GDCORE_LOG_H
