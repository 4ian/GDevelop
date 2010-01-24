#ifndef CONSOLEMANAGER_H
#define CONSOLEMANAGER_H

#include "GDL/singleton.h"
class ConsoleFrame;

/**
 * Class managing the GD console, allowing to display it by a simple function call.
 * Best when created at program start and killed when program exits.
 */
class ConsoleManager : public Singleton<ConsoleManager>
{
    public:
        void ShowConsole();

    private:

    ConsoleManager();
    virtual ~ConsoleManager();

    ConsoleFrame * console;

    friend class Singleton<ConsoleManager>;
};

#endif // CONSOLEMANAGER_H
