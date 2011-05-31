/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/TimeExtension.h"
#include "GDL/cTime.h"
#include "GDL/aTime.h"
#include "GDL/eFreeFunctions.h"
#include "GDL/RuntimeScene.h"

TimeExtension::TimeExtension()
{
    DECLARE_THE_EXTENSION("BuiltinTime",
                          _T("Temps"),
                          _T("Extension proposant des actions et conditions sur le temps, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("Timer",
                   _T("Valeur d'un chronomètre"),
                   _T("Teste si le chronomètre atteint ou dépasse le temps indiqué."),
                   _T("Le chronomètre _PARAM1_ est supérieur à _PARAM0_ secondes"),
                   _T("Temps et chronomètres"),
                   "res/conditions/timer24.png",
                   "res/conditions/timer.png",
                   &CondTimer);

        DECLARE_PARAMETER("expression", _T("Temps en secondes"), false, "");
        DECLARE_PARAMETER("text", _T("Nom du chronomètre"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("TimeScale",
                   _T("Echelle du temps"),
                   _T("Teste si l'échelle du temps actuelle correspond."),
                   _T("L'échelle du temps est _PARAM1_ à _PARAM0_"),
                   _T("Temps et chronomètres"),
                   "res/conditions/time24.png",
                   "res/conditions/time.png",
                   &CondTimeScale);

        DECLARE_PARAMETER("expression", _T("Valeur à tester"), false, "");
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("TimerPaused",
                   _T("Pause d'un chronomètre"),
                   _T("Teste si le chronomètre indiqué est en pause."),
                   _T("Le chronomètre _PARAM0_ est en pause"),
                   _T("Temps et chronomètres"),
                   "res/conditions/timerPaused24.png",
                   "res/conditions/timerPaused.png",
                   &CondTimerPaused);

        DECLARE_PARAMETER("text", _T("Nom du chronomètre"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("ResetTimer",
                   _T("Remettre à zéro un chronomètre"),
                   _T("Remet à zéro le chronomètre indiqué."),
                   _T("Remettre à zéro le chronomètre _PARAM0_"),
                   _T("Temps et chronomètres"),
                   "res/actions/timer24.png",
                   "res/actions/timer.png",
                   &ActResetTimer);

        DECLARE_PARAMETER("text", _T("Nom du chronomètre"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("PauseTimer",
                   _T("Mettre en pause un chronomètre"),
                   _T("Met en pause le chronomètre indiqué."),
                   _T("Mettre en pause le chronomètre _PARAM0_"),
                   _T("Temps et chronomètres"),
                   "res/actions/pauseTimer24.png",
                   "res/actions/pauseTimer.png",
                   &ActPauseTimer);

        DECLARE_PARAMETER("text", _T("Nom du chronomètre"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("UnPauseTimer",
                   _T("Enlever la pause d'un chronomètre"),
                   _T("Enlève la pause du chronomètre indiqué."),
                   _T("Enlever la pause du chronomètre _PARAM0_"),
                   _T("Temps et chronomètres"),
                   "res/actions/unPauseTimer24.png",
                   "res/actions/unPauseTimer.png",
                   &ActUnPauseTimer);

        DECLARE_PARAMETER("text", _T("Nom du chronomètre"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("RemoveTimer",
                   _T("Supprimer un chronomètre"),
                   _T("Supprime un chronomètre de la mémoire."),
                   _T("Supprimer le chronomètre _PARAM0_ de la mémoire"),
                   _T("Temps et chronomètres"),
                   "res/actions/time24.png",
                   "res/actions/time.png",
                   &ActRemoveTimer);

        DECLARE_PARAMETER("text", _T("Nom du chronomètre"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ChangeTimeScale",
                   _T("Changer l'échelle du temps"),
                   _T("Change la vitesse du déroulement du jeu."),
                   _T("Mettre à _PARAM0_ l'échelle du temps"),
                   _T("Temps et chronomètres"),
                   "res/actions/time24.png",
                   "res/actions/time.png",
                   &ActChangeTimeScale);

        DECLARE_PARAMETER("expression", _T("Echelle ( 1 : Normal, 2 : Double la vitesse, 0.5 : Ralenti de moitié... )"), false, "");

    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("TimeDelta", _T("Temps écoulé depuis la dernière image"), _T("Temps écoulé depuis la dernière image"), _T("Temps"), "res/actions/time.png", &ExpTimeDelta)
    DECLARE_END_EXPRESSION()
    DECLARE_HIDDEN_EXPRESSION("TempsFrame", _T("Temps écoulé depuis la dernière image"), _T("Temps écoulé depuis la dernière image"), _T("Temps"), "res/actions/time.png", &ExpTimeDelta)
    DECLARE_END_EXPRESSION()
    DECLARE_HIDDEN_EXPRESSION("ElapsedTime", _T("Temps écoulé depuis la dernière image"), _T("Temps écoulé depuis la dernière image"), _T("Temps"), "res/actions/time.png", &ExpTimeDelta)
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("TimeFromStart", _T("Temps écoulé depuis le début de la scène"), _T("Temps écoulé depuis le début de la scène"), _T("Temps"), "res/actions/time.png", &ExpTimeFromStart)
    DECLARE_END_EXPRESSION()
    DECLARE_HIDDEN_EXPRESSION("TempsDebut", _T("Temps écoulé depuis le début de la scène"), _T("Temps écoulé depuis le début de la scène"), _T("Temps"), "res/actions/time.png", &ExpTimeFromStart)
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("TimeScale", _T("Echelle du temps"), _T("Echelle du temps"), _T("Temps"), "res/actions/time.png", &ExpTimeScale)
    DECLARE_END_EXPRESSION()
    DECLARE_HIDDEN_EXPRESSION("TimeScale", _T("Echelle du temps"), _T("Echelle du temps"), _T("Temps"), "res/actions/time.png", &ExpTimeScale)
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("Time", _T("Temps actuel"), _T("Temps actuel"), _T("Temps"), "res/actions/time.png", &ExpTime)
        DECLARE_PARAMETER("", _T("Valeur à récupérer :\n\nHeure : hour\nMinutes : min\nSecondes : sec\nJour du mois: mday\nMois depuis janvier : mon\nAnnées depuis 1900 : year\nJours depuis dimanche :wday\nJours depuis le 1er Janvier : yday"), false, "")
    DECLARE_END_EXPRESSION()
}

void TimeExtension::GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const
{
    if ( propertyNb < scene.timers.size() )
    {
        name = scene.timers[propertyNb].GetName();
        value = ToString(scene.timers[propertyNb].GetTime())+"s";

        return;
    }
}

bool TimeExtension::ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue)
{
    if ( propertyNb < scene.timers.size() )
    {
        scene.timers[propertyNb].SetTime(ToFloat(newValue));

        return true;
    }

    return false;
}

unsigned int TimeExtension::GetNumberOfProperties(RuntimeScene & scene) const
{
    return scene.timers.size();
}
