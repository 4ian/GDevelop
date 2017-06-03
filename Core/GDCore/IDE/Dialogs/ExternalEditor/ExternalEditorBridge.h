/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCORE_EXTNERALEDITORBRIDGE_H
#define GDCORE_EXTNERALEDITORBRIDGE_H
#include <queue>
#include <wx/utils.h>
#include <wx/process.h>
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include <SFML/Network.hpp>

namespace gd {

class GD_CORE_API ExternalEditorBridge : public wxEvtHandler {
public:
	ExternalEditorBridge() :
		connected(false),
		acceptConnections(true)
	{
    	Connect(wxID_ANY, wxEVT_THREAD, (wxObjectEventFunction)&ExternalEditorBridge::Receive);
	}

	~ExternalEditorBridge()
	{
		Disconnect();
	}

	unsigned int Start()
	{
		Disconnect();
		std::cout << "Starting bridge server to connect to the external editor..." << std::endl;


		unsigned int port = LaunchListener();
		if (port == 0)
		{
			std::cout << "Unable to launch a listener for the bridge server." << std::endl;
			return 0;
		}

		acceptConnections = true;
		serverThread = std::shared_ptr<sf::Thread>(
			new sf::Thread(&ExternalEditorBridge::RunServer, this));
		serverThread->launch();

		return port;
	}

	bool Send(const gd::String & cmd, const gd::SerializerElement & payloadObject, const gd::String & scope = "")
	{
		sf::Lock lock(outMessagesMutex);

		gd::SerializerElement object;
		object.AddChild("command").SetValue(cmd);
		object.AddChild("scope").SetValue(scope);
		object.AddChild("payload") = payloadObject;

	    std::string message = gd::Serializer::ToJSON(object).ToLocale();
	    outMessages.push(message);

		return true;
	}

	void OnReceive(std::function<void(gd::String cmd, gd::SerializerElement object, gd::String scope)> cb)
	{
		onReceiveCb = cb;
	}

	bool IsConnected() {
		return connected;
	}

private:
	void Receive(wxThreadEvent & event)
	{
		sf::Lock lock(inMessagesMutex);
	    while (!inMessages.empty())
	    {
	    	gd::String message = gd::String::FromLocale(inMessages.front());
	    	inMessages.pop();

			std::cout << "Message passed to the main thread: " << message << std::endl;
		    gd::SerializerElement object = gd::Serializer::FromJSON(message);
			if (onReceiveCb)
			{
				onReceiveCb(
					object.GetChild("command").GetValue().GetString(),
					object.GetChild("payload"),
					object.GetChild("scope").GetValue().GetString());
			}
	    }
	}

	void Disconnect()
	{
		std::cout << "Disconnecting an external editor..." << std::endl;

		connected = false; //Set connected to false to let RunServer finish.
		acceptConnections = false; //Don't allow to listen to new connections.
		serverThread.reset(); //sf::Thread destructor will wait for RunServer to finish.

		std::cout << "External editor disconnected." << std::endl;
	}

	unsigned int LaunchListener()
	{
		serverListener.close();

		//Launch the listener socket on a free port.
		unsigned int serverPort = 50000;
		while (serverPort < 55555)
		{
			if (serverListener.listen(serverPort) == sf::Socket::Done)
				return serverPort;

			serverPort++;
		}

		return 0;
	}

	void ReceiveChunk(std::string & data, char * buffer, std::size_t bufferSize)
	{
		size_t pos = 0;
		while (pos < bufferSize) {
			if (buffer[pos] == '\0')
			{
				sf::Lock lock(inMessagesMutex);
				wxThreadEvent evt;
				this->QueueEvent(evt.Clone());

				std::cout << "Message (size: "
					<< data.size()
					<< ") queued, to be passed to main thread." << std::endl;
				inMessages.push(data);
				data.clear();
			} else {
				data += buffer[pos];
			}

			pos++;
		}
	}

	void RunServer()
	{
		std::cout << "Running server for external editor on "
			<< serverListener.getLocalPort() << "..."<< std::endl;
		serverListener.setBlocking(false);
		while (acceptConnections)
		{
			sf::TcpSocket client;
			client.setBlocking(false);
			if (serverListener.accept(client) == sf::Socket::Done)
			{
				std::cout << "Etablished TCP connection with client " << client.getRemotePort() << std::endl;
				connected = true;

				std::string data;
				while (connected)
				{
					//Receive messages
				    char buffer[1024];
				    std::size_t receivedSize = 0;
				    sf::Socket::Status status = client.receive(buffer, sizeof(buffer), receivedSize);
				    if (status == sf::Socket::Done)
				    {
						std::cout << "Server received " << receivedSize
							<< " bytes from client " << client.getRemotePort() << std::endl;
				    	ReceiveChunk(data, buffer, receivedSize);
			    	}
					else if (status == sf::Socket::Disconnected)
					{
				    	std::cout << "Connection ended with " << client.getRemotePort() << std::endl;
				    	connected = false;
					}
					else
					{
						// Give some rest to the thread to avoid 100% of
						// CPU usage while waiting for messages.
						// Note that this is not done if a message was received, as
						// other chunks could be received just after.
						sf::sleep(sf::milliseconds(75));
					}

					//Send messages
					if (connected)
					{
						sf::Lock lock(outMessagesMutex);

						if (!outMessages.empty())
						{
							client.setBlocking(true);

							std::string message = outMessages.front();
							sf::Socket::Status status = client.send(message.c_str(), message.size() + 1);

							if (status == sf::Socket::Done)
							{
								std::cout << "Message sent to " << client.getRemotePort() << std::endl;
								outMessages.pop();
							}
							else
							{
								std::cout << "Failed to send a message to " << client.getRemotePort() << std::endl;
							}

							client.setBlocking(false);
						}
					}
				}
			}
		}
	}

	std::queue<std::string> inMessages; ///< Messages received from the external editor.
	sf::Mutex inMessagesMutex; ///< The mutex to use anytime inMessages is modified/accessed.

	std::queue<std::string> outMessages; ///< Messages to be sent to the external editor.
	sf::Mutex outMessagesMutex; ///< The mutex to use anytime outMessages is modified/accessed.

	bool acceptConnections;
	bool connected;
	sf::TcpListener serverListener;
	std::shared_ptr<sf::Thread> serverThread;
	std::function<void(gd::String cmd, gd::SerializerElement object, gd::String scope)> onReceiveCb;
};

}
#endif
#endif
