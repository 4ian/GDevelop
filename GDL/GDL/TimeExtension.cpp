/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/TimeExtension.h"
#include "GDL/RuntimeScene.h"

TimeExtension::TimeExtension()
{
    DECLARE_THE_EXTENSION("BuiltinTime",
                          _("Temps"),
                          _("Extension proposant des actions et conditions sur le temps, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("Timer",
                   _("Valeur d'un chronomètre"),
                   _("Teste si le chronomètre atteint ou dépasse le temps indiqué."),
                   _("Le chronomètre _PARAM1_ est supérieur à _PARAM0_ secondes"),
                   _("Temps et chronomètres"),
                   "res/conditions/timer24.png",
                   "res/conditions/timer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Temps en secondes"), "", false);
        instrInfo.AddParameter("string", _("Nom du chronomètre"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("TimerElapsedTime").SetIncludeFile("GDL/TimeTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("TimeScale",
                   _("Echelle du temps"),
                   _("Teste si l'échelle du temps actuelle correspond."),
                   _("L'échelle du temps est _PARAM1_ à _PARAM0_"),
                   _("Temps et chronomètres"),
                   "res/conditions/time24.png",
                   "res/conditions/time.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetTimeScale").SetManipulatedType("number").SetIncludeFile("GDL/TimeTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("TimerPaused",
                   _("Pause d'un chronomètre"),
                   _("Teste si le chronomètre indiqué est en pause."),
                   _("Le chronomètre _PARAM0_ est en pause"),
                   _("Temps et chronomètres"),
                   "res/conditions/timerPaused24.png",
                   "res/conditions/timerPaused.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Nom du chronomètre"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("TimerPaused").SetIncludeFile("GDL/TimeTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("ResetTimer",
                   _("Remettre à zéro un chronomètre"),
                   _("Remet à zéro le chronomètre indiqué."),
                   _("Remettre à zéro le chronomètre _PARAM0_"),
                   _("Temps et chronomètres"),
                   "res/actions/timer24.png",
                   "res/actions/timer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Nom du chronomètre"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("ResetTimer").SetIncludeFile("GDL/TimeTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("PauseTimer",
                   _("Mettre en pause un chronomètre"),
                   _("Met en pause le chronomètre indiqué."),
                   _("Mettre en pause le chronomètre _PARAM0_"),
                   _("Temps et chronomètres"),
                   "res/actions/pauseTimer24.png",
                   "res/actions/pauseTimer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Nom du chronomètre"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("PauseTimer").SetIncludeFile("GDL/TimeTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("UnPauseTimer",
                   _("Enlever la pause d'un chronomètre"),
                   _("Enlève la pause du chronomètre indiqué."),
                   _("Enlever la pause du chronomètre _PARAM0_"),
                   _("Temps et chronomètres"),
                   "res/actions/unPauseTimer24.png",
                   "res/actions/unPauseTimer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Nom du chronomètre"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("UnPauseTimer").SetIncludeFile("GDL/TimeTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("RemoveTimer",
                   _("Supprimer un chronomètre"),
                   _("Supprime un chronomètre de la mémoire."),
                   _("Supprimer le chronomètre _PARAM0_ de la mémoire"),
                   _("Temps et chronomètres"),
                   "res/actions/time24.png",
                   "res/actions/time.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Nom du chronomètre"), "", false);
        instrInfo.cppCallingInformation.SetFunctionName("RemoveTimer").SetIncludeFile("GDL/TimeTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ChangeTimeScale",
                   _("Changer l'échelle du temps"),
                   _("Change la vitesse du déroulement du jeu."),
                   _("Mettre à _PARAM0_ l'échelle du temps"),
                   _("Temps et chronomètres"),
                   "res/actions/time24.png",
                   "res/actions/time.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Echelle ( 1 : Normal, 2 : Double la vitesse, 0.5 : Ralenti de moitié... )"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("SetTimeScale").SetIncludeFile("GDL/TimeTools.h");

    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("TimeDelta", _("Temps écoulé depuis la dernière image"), _("Temps écoulé depuis la dernière image"), _("Temps"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetElapsedTime").SetIncludeFile("GDL/TimeTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("TempsFrame", _("Temps écoulé depuis la dernière image"), _("Temps écoulé depuis la dernière image"), _("Temps"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetElapsedTime").SetIncludeFile("GDL/TimeTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("ElapsedTime", _("Temps écoulé depuis la dernière image"), _("Temps écoulé depuis la dernière image"), _("Temps"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetElapsedTime").SetIncludeFile("GDL/TimeTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("TimeFromStart", _("Temps écoulé depuis le début de la scène"), _("Temps écoulé depuis le début de la scène"), _("Temps"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetTimeFromStart").SetIncludeFile("GDL/TimeTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("TempsDebut", _("Temps écoulé depuis le début de la scène"), _("Temps écoulé depuis le début de la scène"), _("Temps"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetTimeFromStart").SetIncludeFile("GDL/TimeTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("TimeScale", _("Echelle du temps"), _("Echelle du temps"), _("Temps"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetTimeScale").SetIncludeFile("GDL/TimeTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("TimeScale", _("Echelle du temps"), _("Echelle du temps"), _("Temps"), "res/actions/time.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.cppCallingInformation.SetFunctionName("GetTimeScale").SetIncludeFile("GDL/TimeTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("Time", _("Temps actuel"), _("Temps actuel"), _("Temps"), "res/actions/time.png")
        instrInfo.AddParameter("", _("Valeur à récupérer :\n\nHeure : hour\nMinutes : min\nSecondes : sec\nJour du mois: mday\nMois depuis janvier : mon\nAnnées depuis 1900 : year\nJours depuis dimanche :wday\nJours depuis le 1er Janvier : yday"), "",false);
        instrInfo.cppCallingInformation.SetFunctionName("GetTime").SetIncludeFile("GDL/TimeTools.h");
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
