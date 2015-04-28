/**

GDevelop - Network Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "GDCpp/CommonTools.h"
#include "NetworkAutomatism.h"
#include "NetworkManager.h"

#include <SFML/Network.hpp>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("Network",
                              GD_T("Network features"),
                              GD_T("Built-in extension allowing to exchange data on the network between games."),
                              "Florian Rival",
                              "Open source (MIT License)");

        #if defined(GD_IDE_ONLY)

        AddAction("AddRecipient",
                       GD_T("Add a recipient"),
                       GD_T("Add the computer with the corresponding IP Adress as a recipient of sent data."),
                       GD_T("Add _PARAM0_ to recipients"),
                       GD_T("Network: Sending"),
                       "CppPlatform/Extensions/networkicon24.png",
                       "CppPlatform/Extensions/networkicon.png")

            .AddParameter("string", GD_T("Recipient IP address."))
            .AddParameter("expression", GD_T("Recipient port (Default : 50001)"), "", true)

            .SetFunctionName("GDpriv::NetworkExtension::AddRecipient").SetIncludeFile("Network/NetworkManagerFunctions.h");

        AddAction("RemoveAllRecipients",
                       GD_T("Delete all recipients"),
                       GD_T("Clear the list of the recipients of sent data"),
                       GD_T("Clear the list of recipients"),
                       GD_T("Network: Sending"),
                       "CppPlatform/Extensions/networkicon24.png",
                       "CppPlatform/Extensions/networkicon.png")

            .SetFunctionName("GDpriv::NetworkExtension::RemoveAllRecipients").SetIncludeFile("Network/NetworkManagerFunctions.h");


        AddAction("ListenToPort",
                       GD_T("Initialize data reception"),
                       GD_T("Initialize the network so as to be able te receive data from other computers."),
                       GD_T("Initialize data reception"),
                       GD_T("Network: Reception"),
                       "CppPlatform/Extensions/networkicon24.png",
                       "CppPlatform/Extensions/networkicon.png")

            .AddParameter("expression", GD_T("Listening port (Default : 50001)"), "", true).SetDefaultValue("50001")
            .SetFunctionName("GDpriv::NetworkExtension::ListenToPort").SetIncludeFile("Network/NetworkManagerFunctions.h");

        AddAction("StopListening",
                       GD_T("Stop data reception"),
                       GD_T("Stop data reception."),
                       GD_T("Stop data reception"),
                       GD_T("Network: Reception"),
                       "CppPlatform/Extensions/networkicon24.png",
                       "CppPlatform/Extensions/networkicon.png")

            .SetFunctionName("GDpriv::NetworkExtension::ActStopListening").SetIncludeFile("Network/NetworkManagerFunctions.h");

        AddAction("SendValue",
                       GD_T("Send a value"),
                       GD_T("Send a value to recipients"),
                       GD_T("Send value _PARAM1_ with title _PARAM0_ to recipients"),
                       GD_T("Network: Sending"),
                       "CppPlatform/Extensions/networkicon24.png",
                       "CppPlatform/Extensions/networkicon.png")

            .AddParameter("string", GD_T("Group"))
            .AddParameter("expression", GD_T("Value"))

            .SetFunctionName("GDpriv::NetworkExtension::SendValue").SetIncludeFile("Network/NetworkManagerFunctions.h");

        AddAction("SendString",
                       GD_T("Send a text"),
                       GD_T("Send a text to recipients"),
                       GD_T("Send text _PARAM1_ with title _PARAM0_ to recipients"),
                       GD_T("Network: Sending"),
                       "CppPlatform/Extensions/networkicon24.png",
                       "CppPlatform/Extensions/networkicon.png")

            .AddParameter("string", GD_T("Group"))
            .AddParameter("string", GD_T("Text"))

            .SetFunctionName("GDpriv::NetworkExtension::SendString").SetIncludeFile("Network/NetworkManagerFunctions.h");

        AddAction("ReceivePackets",
                       GD_T("Receive waiting data"),
                       GD_T("Receive data sent by other computers.\nYou can then access to them with the appropriate expressions."),
                       GD_T("Receive data"),
                       GD_T("Network: Reception"),
                       "CppPlatform/Extensions/networkicon24.png",
                       "CppPlatform/Extensions/networkicon.png")

            .SetFunctionName("GDpriv::NetworkExtension::ReceivePackets").SetIncludeFile("Network/NetworkManagerFunctions.h");

        AddAction("ResetReceivedData",
                       GD_T("Delete all received data stored in memory"),
                       GD_T("Delete every received data stored in memory"),
                       GD_T("Delete every received data stored in memory"),
                       GD_T("Network: Reception"),
                       "CppPlatform/Extensions/networkicon24.png",
                       "CppPlatform/Extensions/networkicon.png")

            .SetFunctionName("GDpriv::NetworkExtension::ResetReceivedData").SetIncludeFile("Network/NetworkManagerFunctions.h");

        AddStrExpression("GetReceivedDataString", GD_T("Get the text of a data"), GD_T("Get the text contained in a data"), GD_T("Network: Reception"), "CppPlatform/Extensions/networkicon.png")
            .AddParameter("string", GD_T("Name of the data containing the text to get"))

            .SetFunctionName("GDpriv::NetworkExtension::GetReceivedDataString").SetIncludeFile("Network/NetworkManagerFunctions.h");


        AddExpression("GetReceivedDataValue", GD_T("Get the value of a data"), GD_T("Get the value contained in a data"), GD_T("Network: Reception"), "CppPlatform/Extensions/networkicon.png")
            .AddParameter("string", GD_T("Name of the data containing the text to get"))

            .SetFunctionName("GDpriv::NetworkExtension::GetReceivedDataValue").SetIncludeFile("Network/NetworkManagerFunctions.h");


        AddStrExpression("GetLastError", GD_T("Last error occured"), GD_T("Get the text describing the last error which occured."), GD_T("Network: Errors"), "res/error.png")

            .SetFunctionName("GDpriv::NetworkExtension::GetLastError").SetIncludeFile("Network/NetworkManagerFunctions.h");


        AddStrExpression("GetPublicAddress", GD_T("IP address"), GD_T("Allow to get the public IP Address of the computer."), GD_T("Network"), "CppPlatform/Extensions/networkicon.png")
            .AddParameter("expression", GD_T("Maximum time to wait before getting the address ( in seconds ) ( 0 = no timeout )"), "", true)

            .SetFunctionName("GDpriv::NetworkExtension::GetPublicAddress").SetIncludeFile("Network/NetworkManagerFunctions.h");


        AddStrExpression("GetLocalAddress", GD_T("Local IP address ( local/LAN )"), GD_T("Allow to get the public IP Address of the computer."), GD_T("Network"), "CppPlatform/Extensions/networkicon.png")

            .SetFunctionName("GDpriv::NetworkExtension::GetLocalAddress").SetIncludeFile("Network/NetworkManagerFunctions.h");


        AddAction("GenerateObjectNetworkId",
                       GD_T("Generate objects' identifiers"),
                       GD_T("Generate automatically identifiers for these objects.\nNote that this action must be preferably used at the start of the scene for example, so as to be sure objects\nhave the same unique identifiers on the different computers."),
                       GD_T("Generate unique network identifiers for _PARAM0_"),
                       GD_T("Automatism Automatic Network Updater"),
                       "CppPlatform/Extensions/networkicon24.png",
                       "CppPlatform/Extensions/networkicon.png")

            .AddParameter("objectList", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "NetworkAutomatism", false)
            .SetFunctionName("NetworkAutomatism::GenerateObjectNetworkIdentifier").SetIncludeFile("Network/NetworkAutomatism.h");

        #endif

        {
            gd::AutomatismMetadata & aut = AddAutomatism("NetworkAutomatism",
                  GD_T("Automatic network update"),
                  GD_T("NetworkUpdater"),
                  GD_T("Allows to automatically synchronize the objects of a game on the network."),
                  "",
                  "CppPlatform/Extensions/networkicon32.png",
                  "NetworkAutomatism",
                  std::shared_ptr<gd::Automatism>(new NetworkAutomatism),
                  std::shared_ptr<gd::AutomatismsSharedData>(new SceneNetworkDatas));

            #if defined(GD_IDE_ONLY)
            aut.SetIncludeFile("Network/NetworkAutomatism.h");

            aut.AddAction("SetAsSender",
                           GD_T("Set to send data"),
                           GD_T("The automatism will send the data of the objects.\nBe sure to have generated identifiers for these objects before."),
                           GD_T("Set _PARAM0_ to send data"),
                           GD_T("Automatism Automatic Network Updater"),
                           "CppPlatform/Extensions/networkicon24.png",
                           "CppPlatform/Extensions/networkicon.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "NetworkAutomatism", false)
                .SetFunctionName("SetAsSender").SetIncludeFile("Network/NetworkAutomatism.h");

            aut.AddAction("SetAsReceiver",
                           GD_T("Set to receive data"),
                           GD_T("The automatism will receive the data and will update the objects.\nBe sure to have generated identifiers for these objects before."),
                           GD_T("Set _PARAM0_ to receive data"),
                           GD_T("Automatism Automatic Network Updater"),
                           "CppPlatform/Extensions/networkicon24.png",
                           "CppPlatform/Extensions/networkicon.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "NetworkAutomatism", false)
                .SetFunctionName("SetAsReceiver").SetIncludeFile("Network/NetworkAutomatism.h");

            aut.AddAction("SetIdentifier",
                           GD_T("Change object's identifier"),
                           GD_T("Each object need a unique identifier, the same on all computers, so as to be identified and updated"),
                           GD_T("Set identifier of _PARAM0_ to _PARAM2_"),
                           GD_T("Automatism Automatic Network Updater"),
                           "CppPlatform/Extensions/networkicon24.png",
                           "CppPlatform/Extensions/networkicon.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "NetworkAutomatism", false)
                .AddParameter("expression", GD_T("Identifier"))
                .SetFunctionName("SetIdentifier").SetIncludeFile("Network/NetworkAutomatism.h");

            aut.AddExpression("GetIdentifier", GD_T("Get the identifier of the object"), GD_T("Get the identifier of the object"), GD_T("Automatism Automatic Network Updater"), "res/texteicon.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "NetworkAutomatism", false)
                .SetFunctionName("GetIdentifier").SetIncludeFile("Network/NetworkAutomatism.h");

            #endif
        }

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };

    #if defined(GD_IDE_ONLY)
    bool HasDebuggingProperties() const { return true; };

    void GetPropertyForDebugger(unsigned int propertyNb, std::string & name, std::string & value) const
    {
        if ( propertyNb == 0 )
        {
            name = GD_T("List of recipients");
            const std::vector< std::pair<sf::IpAddress, short unsigned int> > & list = NetworkManager::Get()->GetRecipientsList();
            for (unsigned int i = 0;i<list.size();++i)
                value += list[i].first.toString()+ToString(GD_T(" Port: "))+ToString(list[i].second)+"; ";
        }
    }

    bool ChangeProperty(unsigned int propertyNb, std::string newValue)
    {
        if ( propertyNb == 0 ) return false;
    }

    unsigned int GetNumberOfProperties() const
    {
        return 1;
    }
    #endif
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
