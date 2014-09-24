/*
 * GDevelop IDE
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License.
 */

#ifndef CONSOLEMANAGER_H
#define CONSOLEMANAGER_H

class ConsoleFrame;

/**
 * \brief Manage GDevelop IDE console.
 *
 * Class managing the GD console, allowing to display it by a simple function call.
 * Best when created at program start and killed when program exits.
 */
class ConsoleManager
{
public:
    void ShowConsole();

    static ConsoleManager *Get()
    {
        if ( !_singleton )
        {
            _singleton = new ConsoleManager;
        }

        return ( static_cast<ConsoleManager*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( 0 != _singleton )
        {
            delete _singleton;
            _singleton = 0;
        }
    }

private:

    ConsoleManager();
    virtual ~ConsoleManager();

    ConsoleFrame * console;

    static ConsoleManager *_singleton;
};

#endif // CONSOLEMANAGER_H

