/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GDE)

#ifndef BASEDEBUGGER_H
#define BASEDEBUGGER_H
#include <SFML/System.hpp>

/**
 * Base class to implement a debugger.
 * Derive from this class and implement
 * UpdateGUI function which be called
 * automatically by the scene
 */
class GD_API BaseDebugger
{
    public:
        BaseDebugger() {};
        virtual ~BaseDebugger() {};

        void Update();

    protected:
    private:
        virtual void UpdateGUI() = 0;

        sf::Clock timeInterval;
};

#endif // BASEDEBUGGER_H
#endif
