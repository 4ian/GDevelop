/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/cTime.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include <SFML/Window.hpp>
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"

////////////////////////////////////////////////////////////
/// Test d'un timer. Renvoie true si le timer est supérieur
/// ou égal au temps indiqué
///
/// Type : Timer
/// Paramètre 1 : Secondes
/// Paramètre 2 : Nom du timer
///
////////////////////////////////////////////////////////////
bool CondTimer( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    string timerName = eval.EvalTxt(condition.GetParameter( 1 ));

    //Le timer existe il ? on parcourt la liste.
    for ( unsigned int i = 0;i < scene->timers.size();i++ )
    {
        //On cherche le nom du timer
        if ( scene->timers[i].GetName() == timerName )
        {
            if ( scene->timers[i].GetTime() >= eval.EvalExp( condition.GetParameter( 0 ) ) )
            {
                if ( condition.IsInverted() ) return false;
                return true;
            }
            if ( condition.IsInverted() ) return true;
            return false;
        }

    }

    return true;
}

////////////////////////////////////////////////////////////
/// Teste si le chronomètre est en pause.
///
/// Type : TimerPaused
/// Paramètre 1 : Nom du timer
////////////////////////////////////////////////////////////
bool CondTimerPaused( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    string timerName = eval.EvalTxt(condition.GetParameter( 1 ));

    //Le timer existe il ? on parcourt la liste.
    for ( unsigned int i = 0;i < scene->timers.size();i++ )
    {
        //On cherche le nom du timer
        if ( scene->timers[i].GetName() == timerName )
        {
            if (scene->timers[i].IsPaused())
            {
                if ( condition.IsInverted() ) return false;
                    return true;
            }
            if ( condition.IsInverted() ) return true;
            return false;
        }

    }

    return false;
}

////////////////////////////////////////////////////////////
/// Tester l'échelle du temps actuelle
///
/// Type : TimeScale
/// Paramètre 1 : Valeur à tester
/// Paramètre 2 : Signe de comparaison
///
////////////////////////////////////////////////////////////
bool CondTimeScale( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    bool Ok = false;

    //Enfin, on teste vraiment.
    //optimisation : test du signe en premier
    if (( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Equal && ( scene->GetTimeScale() ) == eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Inferior && ( scene->GetTimeScale() ) < eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Superior && ( scene->GetTimeScale() ) > eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && ( scene->GetTimeScale() ) <= eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && ( scene->GetTimeScale() ) >= eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Different && ( scene->GetTimeScale() ) != eval.EvalExp( condition.GetParameter( 0 ) ) )
       )
    {
        Ok = true; //Cette condition est vrai
    }

    if ( condition.IsInverted() )
        return !Ok;

    return Ok;
}
