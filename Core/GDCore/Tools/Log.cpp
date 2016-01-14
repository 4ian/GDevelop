/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/log.h>
#else
#include <iostream>
#endif
#include "GDCore/String.h"

namespace gd {

/**
 * \brief Standard function that should be used when emitting a warning to be displayed to
 * the user. When used in the IDE, this result in a message box with a exclamation icon.
 */
void GD_CORE_API LogWarning(const gd::String & msg)
{
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
	wxLogWarning(msg.ToWxString());
#else
	std::cout << "WARNING: " << msg;
#endif
}

/**
 * \brief Standard function that should be used when emitting an error to be displayed to
 * the user. When used in the IDE, this result in a message box with a error icon.
 */
void GD_CORE_API LogError(const gd::String & msg)
{
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
	wxLogError(msg.ToWxString());
#else
	std::cout << "ERROR: " << msg;
#endif
}

/**
 * \brief Standard function that should be used when emitting a message to be displayed to
 * the user. When used in the IDE, this result in a message box.
 */
void GD_CORE_API LogMessage(const gd::String & msg)
{
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
	wxLogMessage(msg.ToWxString());
#else
	std::cout << "MESSAGE: " << msg;
#endif
}
/**
 * \brief Standard function that should be used when emitting a status message to be displayed to
 * the user. When used in the IDE, this result in a message displayed in the status bar.
 */
void GD_CORE_API LogStatus(const gd::String & msg)
{
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
	wxLogStatus(msg.ToWxString());
#else
	std::cout << "STATUS: " << msg;
#endif
}

}
