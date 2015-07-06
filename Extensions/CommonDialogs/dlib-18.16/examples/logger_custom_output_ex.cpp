// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt

/*

    This is an example showing how to control where the dlib::logger sends its messages.
    This is done by creating a "hook" class that is called whenever any of the loggers want
    to log a message.  The hook class then outputs the messages using any method you like.


    Prior to reading this example, you should understand the basics of the dlib::logger.
    So you should have already read the logger_ex.cpp and logger_ex_2.cpp example programs.

*/


#include <dlib/logger.h>

using namespace dlib;
using namespace std;

class my_hook
{
public:
    my_hook(
    ) 
    {
        fout.open("my_log_file.txt");
    }

    void log (
        const string& logger_name,
        const log_level& ll,
        const uint64 thread_id,
        const char* message_to_log
    )
    {
        // Log all messages from any logger to our log file.
        fout << ll << " ["<<thread_id<<"] " << logger_name << ": " << message_to_log << endl;

        // But only log messages that are of LINFO priority or higher to the console.
        if (ll >= LINFO)
            cout << ll << " ["<<thread_id<<"] " << logger_name << ": " << message_to_log << endl;
    }

private:
    ofstream fout;
};

int main()
{
    my_hook hook;
    // This tells all dlib loggers to send their logging events to the hook object.  That
    // is, any time a logger generates a message it will call hook.log() with the message
    // contents.  Additionally, hook.log() will also only be called from one thread at a
    // time so it is safe to use this kind of hook in a multi-threaded program with many
    // loggers in many threads.
    set_all_logging_output_hooks(hook);
    // It should also be noted that the hook object must not be destructed while the
    // loggers are still in use.  So it is a good idea to declare the hook object 
    // somewhere where it will live the entire lifetime of the program, as we do here.


    logger dlog("main");
    // Tell the dlog logger to emit a message for all logging events rather than its
    // default behavior of only logging LERROR or above. 
    dlog.set_level(LALL);

    // All these message go to my_log_file.txt, but only the last two go to the console.
    dlog << LDEBUG << "This is a debugging message.";
    dlog << LINFO  << "This is an informational message.";
    dlog << LERROR << "An error message!";
}

