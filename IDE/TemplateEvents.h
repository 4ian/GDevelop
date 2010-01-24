/**
 * Game Develop
 *    Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 * Contient un template
 *
 */

#ifndef TEMPLATEEVENTS_H
#define TEMPLATEEVENTS_H

#include "GDL/Event.h"

#include <string>
#include <vector>

using namespace std;

class TemplateEvents
{
    public:
        TemplateEvents();
        virtual ~TemplateEvents();

        vector < Event > events;
        string nom;
        string desc;

        string param1;
        string param2;
        string param3;
        string param4;
        string param5;
        string param6;
        string param7;
        string param8;

    protected:
    private:
};

#endif // TEMPLATEEVENTS_H
