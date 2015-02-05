/**

GDevelop - Timed Event Extension
Copyright (c) 2011-2013 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef TIMEDEVENTTOOLS_H
#define TIMEDEVENTTOOLS_H
#include <string>
class RuntimeScene;

namespace GDpriv
{
namespace TimedEvents
{

/**
 * Update timed event and return its time, in microseconds.
 * \param scene Scene used
 * \param mangledTimedEventName Mangled timed event name
 * \return Time elapsed, in microseconds, of the timed event
 */
signed long long GD_EXTENSION_API UpdateAndGetTimeOf(RuntimeScene & scene, std::string mangledTimedEventName);

/**
 * Reset a timed event.
 * \param scene Scene used
 * \param timedEventName Unmangled timed event name. The name will be mangled to "GDNamedTimedEvent_"+timedEventName.
 */
void GD_EXTENSION_API Reset(RuntimeScene & scene, std::string timedEventName);

}

}

#endif // TIMEDEVENTTOOLS_H

