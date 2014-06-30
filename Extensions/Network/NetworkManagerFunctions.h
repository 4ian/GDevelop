/**

Game Develop - Network Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#ifndef NetworkACTIONS_H_INCLUDED
#define NetworkACTIONS_H_INCLUDED
#include <string>

namespace GDpriv
{
namespace NetworkExtension
{

void GD_EXTENSION_API ResetReceivedData();
void GD_EXTENSION_API ActStopListening();
void GD_EXTENSION_API AddRecipient( const std::string & adressStr, short unsigned int port  );
void GD_EXTENSION_API RemoveAllRecipients();
void GD_EXTENSION_API ListenToPort( short unsigned int port );
void GD_EXTENSION_API SendValue( const std::string & title, double data );
void GD_EXTENSION_API SendString( const std::string & title, const std::string & data );
void GD_EXTENSION_API ReceivePackets(  );
std::string GD_EXTENSION_API GetReceivedDataString( const std::string & title);
double GD_EXTENSION_API GetReceivedDataValue( const std::string & title );
std::string GD_EXTENSION_API GetLastError();
std::string GD_EXTENSION_API GetPublicAddress(float timeoutInSeconds);
std::string GD_EXTENSION_API GetLocalAddress();

}
}

#endif // NetworkACTIONS_H_INCLUDED

