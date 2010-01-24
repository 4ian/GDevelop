#if defined(GDE)
/**
 * Game Develop
 *    Editor
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *  Classe de base pour créer un debugger.
 *  Il suffit de dériver de cette classe et
 *  d'implémenter la fonction UpdateGUI() qui
 *  sera appelée à intervalle régulier.
 */

#ifndef BASEDEBUGGER_H
#define BASEDEBUGGER_H
#include <SFML/System.hpp>

class GD_API BaseDebugger
{
    public:
        BaseDebugger();
        virtual ~BaseDebugger();

        void Update();

    protected:
    private:
        virtual void UpdateGUI() = 0;

        sf::Clock timeInterval;
};

#endif // BASEDEBUGGER_H
#endif
