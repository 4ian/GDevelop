#ifndef NETWORKMANAGER_H
#define NETWORKMANAGER_H
#include <SFML/Network.hpp>

/**
 * Manage network stuff.
 */
class GD_EXTENSION_API NetworkManager
{
public:
    /**
     * Listen to a port, allowing to receive packets.
     */
    void ListenToPort(unsigned int port)
    {
        StopListening();
        socket.bind(port);
    }

    /**
     * Stop listening to a port
     */
    void StopListening()
    {
        socket.unbind();
    }

    /**
     * Receive waiting packets.
     */
    void ReceivePackets();

    /**
     * Ignore packets from a peer
     */
    void BlockPacketsFromSender(const sf::IpAddress & address)
    {
        blockedList.push_back(address);
    }

    /**
     * Reset the list of blocked senders
     */
    void ResetBlockedSenders()
    {
        blockedList.clear();
    }

    /**
     * Send a packet to all registered recipients
     */
    void Send(sf::Packet & packet)
    {
        for (unsigned int i = 0;i<recipientsList.size();++i)
            socket.send(packet, recipientsList[i].first, recipientsList[i].second);
    }

    /**
     * Add a peer to send packets to.
     */
    void AddRecipient(const sf::IpAddress & ipAdress, const short unsigned int port)
    {
        recipientsList.push_back(std::pair<sf::IpAddress, short unsigned int>(ipAdress, port));
    }

    /**
     * Reset the list of the peer to send packets to.
     */
    void RemoveAllRecipients()
    {
        recipientsList.clear();
    }

    /**
     * Return the list of recipients
     */
    const std::vector< std::pair<sf::IpAddress, short unsigned int> > & GetRecipientsList() const { return recipientsList; };

    static NetworkManager *Get()
    {
        if ( !_singleton )
        {
            _singleton = new NetworkManager;
        }

        return ( static_cast<NetworkManager*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( _singleton )
        {
            delete _singleton;
            _singleton = 0;
        }
    }
private:
    NetworkManager() {socket.setBlocking(false);};
    virtual ~NetworkManager() {};

    sf::UdpSocket socket;

    std::vector< std::pair<sf::IpAddress, short unsigned int> > recipientsList; ///< List of peers to send packets to.
    std::vector<sf::IpAddress> blockedList; ///< Blocked peers : Ignore packets from them.

    static NetworkManager *_singleton;
};

#endif // NETWORKMANAGER_H

