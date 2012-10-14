/**

Game Develop - Network Extension
Copyright (c) 2010-2012 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "GDL/CommonTools.h"
#include "NetworkAutomatism.h"
#include "NetworkManager.h"
#include <boost/version.hpp>
#include <SFML/Network.hpp>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
    public:

        /**
         * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
         */
        Extension()
        {
            DECLARE_THE_EXTENSION("Network",
                                  _("Network features"),
                                  _("Builtin extension allowing to exchange data on the network between games."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            #if defined(GD_IDE_ONLY)

            DECLARE_ACTION("AddRecipient",
                           _("Add a recipient"),
                           _("Add the computer with the corresponding IP Adress as a recipient of sent data."),
                           _("Add _PARAM0_ to recipients"),
                           _("Network: Sending"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png");

                instrInfo.AddParameter("string", _("Recipient IP address."), "", false);
                instrInfo.AddParameter("expression", _("Recipient port (Default : 50001)"), "", true);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::NetworkExtension::AddRecipient").SetIncludeFile("Network/NetworkManagerFunctions.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("RemoveAllRecipients",
                           _("Delete all recipients"),
                           _("Clear the list of the recipients of sent data"),
                           _("Clear the list of recipients"),
                           _("Network: Sending"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png");

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::NetworkExtension::RemoveAllRecipients").SetIncludeFile("Network/NetworkManagerFunctions.h");


            DECLARE_END_ACTION()

            DECLARE_ACTION("ListenToPort",
                           _("Initialize data reception"),
                           _("Initialize the network so as to be able te receive data from other computers."),
                           _("Initialize data reception"),
                           _("Network: Reception"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png");

                instrInfo.AddParameter("expression", _("Listening port (Default : 50001)"), "", true).SetDefaultValue("50001");

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::NetworkExtension::ListenToPort").SetIncludeFile("Network/NetworkManagerFunctions.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("StopListening",
                           _("Stop data reception"),
                           _("Stop data reception."),
                           _("Stop data reception"),
                           _("Network: Reception"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png");

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::NetworkExtension::StopListening").SetIncludeFile("Network/NetworkManagerFunctions.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("SendValue",
                           _("Send a value"),
                           _("Send a value to recipients"),
                           _("Send value _PARAM1_ with title _PARAM0_ to recipients"),
                           _("Network: Sending"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png");

                instrInfo.AddParameter("string", _("Group"), "", false);
                instrInfo.AddParameter("expression", _("Value"), "", false);


                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::NetworkExtension::SendValue").SetIncludeFile("Network/NetworkManagerFunctions.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("SendString",
                           _("Send a text"),
                           _("Send a text to recipients"),
                           _("Send text _PARAM1_ with title _PARAM0_ to recipients"),
                           _("Network: Sending"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png");

                instrInfo.AddParameter("string", _("Group"), "", false);
                instrInfo.AddParameter("string", _("Text"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::NetworkExtension::SendString").SetIncludeFile("Network/NetworkManagerFunctions.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("ReceivePackets",
                           _("Receive waiting data"),
                           _("Receive data sent by other computers.\nYou can then access to them with the appropriate expressions."),
                           _("Receive data"),
                           _("Network: Reception"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png");

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::NetworkExtension::ReceivePackets").SetIncludeFile("Network/NetworkManagerFunctions.h");

            DECLARE_END_ACTION()

            DECLARE_ACTION("ResetReceivedData",
                           _("Delete all received data stored in memory"),
                           _("Delete every received data stored in memory"),
                           _("Delete every received data stored in memory"),
                           _("Network: Reception"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png");

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::NetworkExtension::ResetReceivedData").SetIncludeFile("Network/NetworkManagerFunctions.h");

            DECLARE_END_ACTION()

            DECLARE_STR_EXPRESSION("GetReceivedDataString", _("Get the text of a data"), _("Get the text contained in a data"), _("Network: Reception"), "Extensions/networkicon.png")
                instrInfo.AddParameter("string", _("Name of the data containing the text to get"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::NetworkExtension::GetReceivedDataString").SetIncludeFile("Network/NetworkManagerFunctions.h");
            DECLARE_END_STR_EXPRESSION()

            DECLARE_EXPRESSION("GetReceivedDataValue", _("Get the value of a data"), _("Get the value contained in a data"), _("Network: Reception"), "Extensions/networkicon.png")
                instrInfo.AddParameter("string", _("Name of the data containing the text to get"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::NetworkExtension::GetReceivedDataValue").SetIncludeFile("Network/NetworkManagerFunctions.h");
            DECLARE_END_EXPRESSION()

            DECLARE_STR_EXPRESSION("GetLastError", _("Last error occured"), _("Get the text describing the last error which occured."), _("Network: Errors"), "res/error.png")

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::NetworkExtension::GetLastError").SetIncludeFile("Network/NetworkManagerFunctions.h");
            DECLARE_END_STR_EXPRESSION()

            DECLARE_STR_EXPRESSION("GetPublicAddress", _("IP address"), _("Allow to get the public IP Address of the computer."), _("Network"), "Extensions/networkicon.png")
                instrInfo.AddParameter("expression", _("Maximum time to wait before getting the address ( in seconds ) ( 0 = no timeout )"), "", true);

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::NetworkExtension::GetPublicAddress").SetIncludeFile("Network/NetworkManagerFunctions.h");
            DECLARE_END_STR_EXPRESSION()

            DECLARE_STR_EXPRESSION("GetLocalAdress", _("Local IP address ( local/LAN )"), _("Allow to get the public IP Address of the computer."), _("Network"), "Extensions/networkicon.png")

                instrInfo.cppCallingInformation.SetFunctionName("GDpriv::NetworkExtension::GetLocalAdress").SetIncludeFile("Network/NetworkManagerFunctions.h");
            DECLARE_END_STR_EXPRESSION()

            DECLARE_AUTOMATISM("NetworkAutomatism",
                      _("Automatic network update"),
                      _("NetworkUpdater"),
                      _("Automatism allowing to automatically synchronise the objects of a game on the network"),
                      "",
                      "Extensions/networkicon32.png",
                      NetworkAutomatism,
                      SceneNetworkDatas)

                automatismInfo.SetIncludeFile("Network/NetworkAutomatism.h");

                DECLARE_AUTOMATISM_ACTION("SetAsSender",
                               _("Set to send data"),
                               _("The automatism will send the data of the objects.\nBe sure to have generated identifiers for these objects before."),
                               _("Set _PARAM0_ to send data"),
                               _("Automatism Automatic Network Updater"),
                               "Extensions/networkicon24.png",
                               "Extensions/networkicon.png");

                    instrInfo.AddParameter("object", _("Object"), "", false);
                    instrInfo.AddParameter("automatism", _("Automatism"), "NetworkAutomatism", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetAsSender").SetIncludeFile("Network/NetworkAutomatism.h");

                DECLARE_END_AUTOMATISM_ACTION()

                DECLARE_AUTOMATISM_ACTION("SetAsReceiver",
                               _("Set to receive data"),
                               _("The automatism will receive the data and will update the objects.\nBe sure to have generated identifiers for these objects before."),
                               _("Set _PARAM0_ to receive data"),
                               _("Automatism Automatic Network Updater"),
                               "Extensions/networkicon24.png",
                               "Extensions/networkicon.png");

                    instrInfo.AddParameter("object", _("Object"), "", false);
                    instrInfo.AddParameter("automatism", _("Automatism"), "NetworkAutomatism", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetAsReceiver").SetIncludeFile("Network/NetworkAutomatism.h");

                DECLARE_END_AUTOMATISM_ACTION()

                DECLARE_AUTOMATISM_ACTION("SetIdentifier",
                               _("Change object's identifier"),
                               _("Each object need a unique identifier, the same on all computers, so as to be identified and updated"),
                               _("Set identifier of _PARAM0_ to _PARAM2_"),
                               _("Automatism Automatic Network Updater"),
                               "Extensions/networkicon24.png",
                               "Extensions/networkicon.png");

                    instrInfo.AddParameter("object", _("Object"), "", false);
                    instrInfo.AddParameter("automatism", _("Automatism"), "NetworkAutomatism", false);
                    instrInfo.AddParameter("expression", _("Identifier"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetIdentifier").SetIncludeFile("Network/NetworkAutomatism.h");

                DECLARE_END_AUTOMATISM_ACTION()

                DECLARE_AUTOMATISM_EXPRESSION("GetIdentifier", _("Get the identifier of the object"), _("Get the identifier of the object"), _("Automatism Automatic Network Updater"), "res/texteicon.png")
                    instrInfo.AddParameter("object", _("Object"), "", false);
                    instrInfo.AddParameter("automatism", _("Automatism"), "NetworkAutomatism", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetIdentifier").SetIncludeFile("Network/NetworkAutomatism.h");
                DECLARE_END_AUTOMATISM_EXPRESSION()

            DECLARE_END_AUTOMATISM()

            DECLARE_ACTION("GenerateObjectNetworkId",
                           _("Generate objects' identifiers"),
                           _("Generate automatically identifiers for these objects.\nNote that this action must be preferably used at the start of the scene for example, so as to be sure objects\nhave the same unique identifiers on the different computers."),
                           _("Generate unique network identifiers for _PARAM0_"),
                           _("Automatism Automatic Network Updater"),
                           "Extensions/networkicon24.png",
                           "Extensions/networkicon.png");

                instrInfo.AddParameter("object", _("Object"), "", false);
                instrInfo.AddParameter("automatism", _("Automatism"), "NetworkAutomatism", false);
                instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0");


                instrInfo.cppCallingInformation.SetFunctionName("NetworkAutomatism::GenerateObjectNetworkIdentifier").SetIncludeFile("Network/NetworkAutomatism.h");

            DECLARE_END_ACTION()

            #endif

            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

        #if defined(GD_IDE_ONLY)
        bool HasDebuggingProperties() const { return true; };

        void GetPropertyForDebugger(unsigned int propertyNb, std::string & name, std::string & value) const
        {
            if ( propertyNb == 0 )
            {
                name = _("List of recipients");
                const std::vector< std::pair<sf::IpAddress, short unsigned int> > & list = NetworkManager::GetInstance()->GetRecipientsList();
                for (unsigned int i = 0;i<list.size();++i)
                    value += list[i].first.ToString()+ToString(_(" Port: "))+ToString(list[i].second)+"; ";
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

    private:

        /**
         * This function is called by Game Develop so
         * as to complete information about how the extension was compiled ( which libs... )
         * -- Do not need to be modified. --
         */
        void CompleteCompilationInformation()
        {
            #if defined(GD_IDE_ONLY)
            compilationInfo.runtimeOnly = false;
            #else
            compilationInfo.runtimeOnly = true;
            #endif

            #if defined(__GNUC__)
            compilationInfo.gccMajorVersion = __GNUC__;
            compilationInfo.gccMinorVersion = __GNUC_MINOR__;
            compilationInfo.gccPatchLevel = __GNUC_PATCHLEVEL__;
            #endif

            compilationInfo.boostVersion = BOOST_VERSION;

            compilationInfo.sfmlMajorVersion = 2;
            compilationInfo.sfmlMinorVersion = 0;

            #if defined(GD_IDE_ONLY)
            compilationInfo.wxWidgetsMajorVersion = wxMAJOR_VERSION;
            compilationInfo.wxWidgetsMinorVersion = wxMINOR_VERSION;
            compilationInfo.wxWidgetsReleaseNumber = wxRELEASE_NUMBER;
            compilationInfo.wxWidgetsSubReleaseNumber = wxSUBRELEASE_NUMBER;
            #endif

            compilationInfo.gdlVersion = RC_FILEVERSION_STRING;
            compilationInfo.sizeOfpInt = sizeof(int*);

            compilationInfo.informationCompleted = true;
        }
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}

