/**

Game Develop - Network Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"
#include "NetworkManager.h"
#include "ErrorManager.h"
#include "ReceivedDataManager.h"
#include <SFML/Network.hpp>
#include <iostream>
#include <fstream>
#include <string>
#include <list>

bool ActResetReceivedData( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    ReceivedDataManager::getInstance()->values.clear();
    ReceivedDataManager::getInstance()->strings.clear();

    return true;
}

bool ActStopListening( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    NetworkManager::getInstance()->StopListening();

    return true;
}

bool ActAddRecipient( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    sf::IpAddress address = action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned);
    short unsigned int port = action.GetParameter(1).GetAsMathExpressionResult(scene, objectsConcerned);

    if ( port == 0 ) port = 50001; //Default value

    NetworkManager::getInstance()->AddRecipient(address, port);

    return true;
}

bool ActRemoveAllRecipients( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    NetworkManager::getInstance()->RemoveAllRecipients();

    return true;
}

bool ActListenToPort( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    short unsigned int port = action.GetParameter(0).GetAsMathExpressionResult(scene, objectsConcerned);
    if ( port == 0 ) port = 50001;

    NetworkManager::getInstance()->ListenToPort(port);
    return true;
}

bool ActSendValue( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    sf::Packet packet;
    packet  << sf::Int32(0)
            << action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned)
            << static_cast<double>(action.GetParameter(1).GetAsMathExpressionResult(scene, objectsConcerned));

    NetworkManager::getInstance()->Send(packet);

    return true;
}

bool ActSendString( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    sf::Packet packet;
    packet  << sf::Int32(1)
            << action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned)
            << action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned);

    NetworkManager::getInstance()->Send(packet);

    return true;
}

bool ActReceivePackets( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    NetworkManager::getInstance()->ReceivePackets();

    return true;
}
