/**

GDevelop - Network Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef NetworkACTIONS_H_INCLUDED
#define NetworkACTIONS_H_INCLUDED
#include <string>
#include "GDCpp/Runtime/String.h"

namespace GDpriv
{
namespace NetworkExtension
{

void GD_EXTENSION_API ResetReceivedData();
void GD_EXTENSION_API ActStopListening();
void GD_EXTENSION_API AddRecipient( const gd::String & adressStr, short unsigned int port  );
void GD_EXTENSION_API RemoveAllRecipients();
void GD_EXTENSION_API ListenToPort( short unsigned int port );
void GD_EXTENSION_API SendValue( const gd::String & title, double data );
void GD_EXTENSION_API SendString( const gd::String & title, const gd::String & data );
void GD_EXTENSION_API ReceivePackets(  );
gd::String GD_EXTENSION_API GetReceivedDataString( const gd::String & title);
double GD_EXTENSION_API GetReceivedDataValue( const gd::String & title );
gd::String GD_EXTENSION_API GetLastError();
gd::String GD_EXTENSION_API GetPublicAddress(float timeoutInSeconds);
gd::String GD_EXTENSION_API GetLocalAddress();

}
}

#endif // NetworkACTIONS_H_INCLUDED
