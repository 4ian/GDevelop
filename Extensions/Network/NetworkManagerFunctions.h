/**

GDevelop - Network Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
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

