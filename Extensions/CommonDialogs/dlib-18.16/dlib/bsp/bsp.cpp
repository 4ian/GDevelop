// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BSP_CPph_
#define DLIB_BSP_CPph_

#include "bsp.h"
#include <stack>

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

namespace dlib
{

    namespace impl1
    {

        void connect_all (
            map_id_to_con& cons,
            const std::vector<network_address>& hosts,
            unsigned long node_id
        )
        {
            cons.clear();
            for (unsigned long i = 0; i < hosts.size(); ++i)
            {
                scoped_ptr<bsp_con> con(new bsp_con(hosts[i]));
                dlib::serialize(node_id, con->stream); // tell the other end our node_id
                unsigned long id = i+1;
                cons.add(id, con);
            }
        }

        void connect_all_hostinfo (
            map_id_to_con& cons,
            const std::vector<hostinfo>& hosts,
            unsigned long node_id,
            std::string& error_string 
        )
        {
            cons.clear();
            for (unsigned long i = 0; i < hosts.size(); ++i)
            {
                try
                {
                    scoped_ptr<bsp_con> con(new bsp_con(hosts[i].addr));
                    dlib::serialize(node_id, con->stream); // tell the other end our node_id
                    con->stream.flush();
                    unsigned long id = hosts[i].node_id;
                    cons.add(id, con);
                }
                catch (std::exception&)
                {
                    std::ostringstream sout;
                    sout << "Could not connect to " << hosts[i].addr;
                    error_string = sout.str();
                    break;
                }
            }
        }


        void send_out_connection_orders (
            map_id_to_con& cons,
            const std::vector<network_address>& hosts
        )
        {
            // tell everyone their node ids
            cons.reset();
            while (cons.move_next())
            {
                dlib::serialize(cons.element().key(), cons.element().value()->stream);
            }

            // now tell them who to connect to
            std::vector<hostinfo> targets; 
            for (unsigned long i = 0; i < hosts.size(); ++i)
            {
                hostinfo info(hosts[i], i+1);

                dlib::serialize(targets, cons[info.node_id]->stream);
                targets.push_back(info);

                // let the other host know how many incoming connections to expect
                const unsigned long num = hosts.size()-targets.size();
                dlib::serialize(num, cons[info.node_id]->stream);
                cons[info.node_id]->stream.flush();
            }
        }

    // ------------------------------------------------------------------------------------


    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace impl2
    {
        // These control bytes are sent before each message between nodes.  Note that many
        // of these are only sent between the control node (node 0) and the other nodes.
        // This is because the controller node is responsible for handling the
        // synchronization that needs to happen when all nodes block on calls to
        // receive_data()
        // at the same time.

        // denotes a normal content message.
        const static char MESSAGE_HEADER            = 0; 

        // sent to the controller node when someone receives a message via receive_data().
        const static char GOT_MESSAGE               = 1; 

        // sent to the controller node when someone sends a message via send().
        const static char SENT_MESSAGE              = 2; 

        // sent to the controller node when someone enters a call to receive_data()
        const static char IN_WAITING_STATE          = 3; 

        // broadcast when a node terminates itself. 
        const static char NODE_TERMINATE            = 5; 

        // broadcast by the controller node when it determines that all nodes are blocked
        // on calls to receive_data() and there aren't any messages in flight.  This is also
        // what makes us go to the next epoch.
        const static char SEE_ALL_IN_WAITING_STATE  = 6; 

        // This isn't ever transmitted between nodes.  It is used internally to indicate
        // that an error occurred.
        const static char READ_ERROR                = 7;

    // ------------------------------------------------------------------------------------

        void read_thread (
            impl1::bsp_con* con,
            unsigned long node_id,
            unsigned long sender_id,
            impl1::thread_safe_message_queue& msg_buffer
        )
        {
            try
            {
                while(true)
                {
                    impl1::msg_data msg;
                    deserialize(msg.msg_type, con->stream);
                    msg.sender_id = sender_id;

                    if (msg.msg_type == MESSAGE_HEADER)
                    {
                        msg.data.reset(new std::vector<char>);
                        deserialize(msg.epoch, con->stream);
                        deserialize(*msg.data, con->stream);
                    }

                    msg_buffer.push_and_consume(msg);

                    if (msg.msg_type == NODE_TERMINATE)
                        break;
                }
            }
            catch (std::exception& e)
            {
                impl1::msg_data msg;
                msg.data.reset(new std::vector<char>);
                vectorstream sout(*msg.data);
                sout << "An exception was thrown while attempting to receive a message from processing node " << sender_id << ".\n";
                sout << "  Sending processing node address:   " << con->con->get_foreign_ip() << ":" << con->con->get_foreign_port() << std::endl;
                sout << "  Receiving processing node address: " << con->con->get_local_ip() << ":" << con->con->get_local_port() << std::endl;
                sout << "  Receiving processing node id:      " << node_id << std::endl;
                sout << "  Error message in the exception:    " << e.what() << std::endl;

                msg.sender_id = sender_id;
                msg.msg_type = READ_ERROR;

                msg_buffer.push_and_consume(msg);
            }
            catch (...)
            {
                impl1::msg_data msg;
                msg.data.reset(new std::vector<char>);
                vectorstream sout(*msg.data);
                sout << "An exception was thrown while attempting to receive a message from processing node " << sender_id << ".\n";
                sout << "  Sending processing node address:   " << con->con->get_foreign_ip() << ":" << con->con->get_foreign_port() << std::endl;
                sout << "  Receiving processing node address: " << con->con->get_local_ip() << ":" << con->con->get_local_port() << std::endl;
                sout << "  Receiving processing node id:      " << node_id << std::endl;

                msg.sender_id = sender_id;
                msg.msg_type = READ_ERROR;

                msg_buffer.push_and_consume(msg);
            }
        }

    // ------------------------------------------------------------------------------------

    }
    
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                          IMPLEMENTATION OF bsp_context OBJECT MEMBERS
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void bsp_context::
    close_all_connections_gracefully(
    )
    {
        if (node_id() != 0)
        {
            _cons.reset();
            while (_cons.move_next())
            {
                // tell the other end that we are intentionally dropping the connection
                serialize(impl2::NODE_TERMINATE,_cons.element().value()->stream);
                _cons.element().value()->stream.flush();
            }
        }

        impl1::msg_data msg;
        // now wait for all the other nodes to terminate
        while (num_terminated_nodes < _cons.size() )
        {
            if (node_id() == 0 && num_waiting_nodes + num_terminated_nodes == _cons.size() && outstanding_messages == 0)
            {
                num_waiting_nodes = 0;
                broadcast_byte(impl2::SEE_ALL_IN_WAITING_STATE);
                ++current_epoch;
            }

            if (!msg_buffer.pop(msg))
                throw dlib::socket_error("Error reading from msg_buffer in dlib::bsp_context.");

            if (msg.msg_type == impl2::NODE_TERMINATE)
            {
                ++num_terminated_nodes;
                _cons[msg.sender_id]->terminated = true;
            }
            else if (msg.msg_type == impl2::READ_ERROR)
            {
                throw dlib::socket_error(msg.data_to_string());
            }
            else if (msg.msg_type == impl2::MESSAGE_HEADER)
            {
                throw dlib::socket_error("A BSP node received a message after it has terminated.");
            }
            else if (msg.msg_type == impl2::GOT_MESSAGE)
            {
                --num_waiting_nodes;
                --outstanding_messages;
            }
            else if (msg.msg_type == impl2::SENT_MESSAGE)
            {
                ++outstanding_messages;
            }
            else if (msg.msg_type == impl2::IN_WAITING_STATE)
            {
                ++num_waiting_nodes;
            }
        }

        if (node_id() == 0)
        {
            _cons.reset();
            while (_cons.move_next())
            {
                // tell the other end that we are intentionally dropping the connection
                serialize(impl2::NODE_TERMINATE,_cons.element().value()->stream);
                _cons.element().value()->stream.flush();
            }

            if (outstanding_messages != 0)
            {
                std::ostringstream sout;
                sout << "A BSP job was allowed to terminate before all sent messages have been received.\n";
                sout << "There are at least " << outstanding_messages << " messages still in flight.   Make sure all sent messages\n";
                sout << "have a corresponding call to receive().";
                throw dlib::socket_error(sout.str());
            }
        }
    }

// ----------------------------------------------------------------------------------------

    bsp_context::
    ~bsp_context()
    {
        _cons.reset();
        while (_cons.move_next())
        {
            _cons.element().value()->con->shutdown();
        }

        msg_buffer.disable();

        // this will wait for all the threads to terminate
        threads.clear();
    }

// ----------------------------------------------------------------------------------------

    bsp_context::
    bsp_context(
        unsigned long node_id_,
        impl1::map_id_to_con& cons_
    ) :
        outstanding_messages(0),
        num_waiting_nodes(0),
        num_terminated_nodes(0),
        current_epoch(1),
        _cons(cons_),
        _node_id(node_id_)
    {
        // spawn a bunch of read threads, one for each connection
        _cons.reset();
        while (_cons.move_next())
        {
            scoped_ptr<thread_function> ptr(new thread_function(&impl2::read_thread,
                                                                _cons.element().value().get(),
                                                                _node_id,
                                                                _cons.element().key(),
                                                                ref(msg_buffer)));
            threads.push_back(ptr);
        }

    }

// ----------------------------------------------------------------------------------------

    bool bsp_context::
    receive_data (
        shared_ptr<std::vector<char> >& item,
        unsigned long& sending_node_id
    ) 
    {
        notify_control_node(impl2::IN_WAITING_STATE);

        while (true)
        {
            // If there aren't any nodes left to give us messages then return right now.
            // We need to check the msg_buffer size to make sure there aren't any
            // unprocessed message there.  Recall that this can happen because status
            // messages always jump to the front of the message buffer.  So we might have
            // learned about the node terminations before processing their messages for us.
            if (num_terminated_nodes == _cons.size() && msg_buffer.size() == 0)
            {
                return false;
            }

            // if all running nodes are currently blocking forever on receive_data()
            if (node_id() == 0 && outstanding_messages == 0 && num_terminated_nodes + num_waiting_nodes == _cons.size())
            {
                num_waiting_nodes = 0;
                broadcast_byte(impl2::SEE_ALL_IN_WAITING_STATE);

                // Note that the reason we have this epoch counter is so we can tell if a
                // sent message is from before or after one of these "all nodes waiting"
                // synchronization events.  If we didn't have the epoch count we would have
                // a race condition where one node gets the SEE_ALL_IN_WAITING_STATE
                // message before others and then sends out a message to another node
                // before that node got the SEE_ALL_IN_WAITING_STATE message.  Then that
                // node would think the normal message came before SEE_ALL_IN_WAITING_STATE
                // which would be bad.
                ++current_epoch;
                return false;
            }

            impl1::msg_data data;
            if (!msg_buffer.pop(data, current_epoch))
                throw dlib::socket_error("Error reading from msg_buffer in dlib::bsp_context.");


            switch(data.msg_type)
            {
                case impl2::MESSAGE_HEADER: {
                    item = data.data;
                    sending_node_id = data.sender_id;
                    notify_control_node(impl2::GOT_MESSAGE);
                    return true;
                } break;

                case impl2::IN_WAITING_STATE: {
                    ++num_waiting_nodes;
                } break;

                case impl2::GOT_MESSAGE: {
                    --outstanding_messages;
                    --num_waiting_nodes;
                } break;

                case impl2::SENT_MESSAGE: {
                    ++outstanding_messages;
                } break;

                case impl2::NODE_TERMINATE: {
                    ++num_terminated_nodes;
                    _cons[data.sender_id]->terminated = true;
                } break;

                case impl2::SEE_ALL_IN_WAITING_STATE: {
                    ++current_epoch;
                    return false;
                } break;

                case impl2::READ_ERROR: {
                    throw dlib::socket_error(data.data_to_string());
                } break;

                default: {
                    throw dlib::socket_error("Unknown message received by dlib::bsp_context");
                } break;
            } // end switch()
        } // end while (true)
    }

// ----------------------------------------------------------------------------------------

    void bsp_context::
    notify_control_node (
        char val
    )
    {
        if (node_id() == 0)
        {
            using namespace impl2;
            switch(val)
            {
                case SENT_MESSAGE: {
                    ++outstanding_messages;
                } break;

                case GOT_MESSAGE: {
                    --outstanding_messages;
                } break;

                case IN_WAITING_STATE: {
                    // nothing to do in this case
                } break;

                default:
                    DLIB_CASSERT(false,"This should never happen");
            }
        }
        else
        {
            serialize(val, _cons[0]->stream);
            _cons[0]->stream.flush();
        }
    }

// ----------------------------------------------------------------------------------------

    void bsp_context::
    broadcast_byte (
        char val
    )
    {
        for (unsigned long i = 0; i < number_of_nodes(); ++i)
        {
            // don't send to yourself or to terminated nodes
            if (i == node_id() || _cons[i]->terminated)
                continue;

            serialize(val, _cons[i]->stream);
            _cons[i]->stream.flush();
        }
    }

// ----------------------------------------------------------------------------------------

    void bsp_context::
    send_data(
        const std::vector<char>& item,
        unsigned long target_node_id
    ) 
    {
        using namespace impl2;
        if (_cons[target_node_id]->terminated)
            throw socket_error("Attempt to send a message to a node that has terminated.");

        serialize(MESSAGE_HEADER, _cons[target_node_id]->stream);
        serialize(current_epoch, _cons[target_node_id]->stream);
        serialize(item, _cons[target_node_id]->stream);
        _cons[target_node_id]->stream.flush();

        notify_control_node(SENT_MESSAGE);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BSP_CPph_

