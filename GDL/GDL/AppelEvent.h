#ifndef APPELEVENT_H_INCLUDED
#define APPELEVENT_H_INCLUDED

#include <SFML/System.hpp>
#include <iostream>
#include <SFML/Graphics.hpp>
#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Force.h"
#include "GDL/MemTrace.h"
#include "GDL/SortByPlan.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Access.h"
class ObjectsConcerned;

//Utilisé pour le retour des actions/conditions
//Un nombre égal ou supérieur à zéro signifie qu'il faut continuer
//le traitement à partir de ce numéro
enum {  ActAllProcessedAndDoNotSubEvents = -5, CondFalse = -4, CondTrue = -3, ActStopProcess = -2, ActAllProcessed = -1};


class GD_API EventsExecutor
{
    public :
        EventsExecutor( RuntimeScene * scene );
        ~EventsExecutor(){};

        int ExecuteEventsScene();

    private:
        int ExecuteEvents( vector < Event > & events, ObjectsConcerned & objectsConcernedParent);
        int ExecuteConditions( Event & event, ObjectsConcerned & objectsConcerned, int startFrom = 0 );
        int ExecuteActions( Event & event, ObjectsConcerned & objectsConcerned, int j);

        int nouvelleScene;

        RuntimeScene * scene;
        Evaluateur eval;
};
#endif // APPELEVENT_H_INCLUDED
