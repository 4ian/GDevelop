#include "GDL/TimeExtension.h"
#include "GDL/cTime.h"
#include "GDL/aTime.h"
#include "GDL/eFreeFunctions.h"

TimeExtension::TimeExtension()
{
    DECLARE_THE_EXTENSION("BuiltinTime",
                          _("Fonctionnalités sur le temps"),
                          _("Extension proposant des actions et conditions sur le temps, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("Timer",
                   _("Valeur d'un chronomètre"),
                   _("Teste si le chronomètre atteint ou dépasse le temps indiqué."),
                   _("Le chronomètre _PARAM1_ est supérieur à _PARAM0_ secondes"),
                   _("Temps et chronomètres"),
                   "res/conditions/timer24.png",
                   "res/conditions/timer.png",
                   &CondTimer);

        DECLARE_PARAMETER("expression", _("Temps en secondes"), false, "");
        DECLARE_PARAMETER("text", _("Nom du chronomètre"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("TimeScale",
                   _("Echelle du temps"),
                   _("Teste si l'échelle du temps actuelle correspond."),
                   _("L'échelle du temps est _PARAM1_ à _PARAM0_"),
                   _("Temps et chronomètres"),
                   "res/conditions/time24.png",
                   "res/conditions/time.png",
                   &CondTimeScale);

        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "");
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("TimerPaused",
                   _("Pause d'un chronomètre"),
                   _("Teste si le chronomètre indiqué est en pause."),
                   _("Le chronomètre _PARAM0_ est en pause"),
                   _("Temps et chronomètres"),
                   "res/conditions/timerPaused24.png",
                   "res/conditions/timerPaused.png",
                   &CondTimerPaused);

        DECLARE_PARAMETER("text", _("Nom du chronomètre"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("ResetTimer",
                   _("Remettre à zéro un chronomètre"),
                   _("Remet à zéro le chronomètre indiqué."),
                   _("Remettre à zéro le chronomètre _PARAM0_"),
                   _("Temps et chronomètres"),
                   "res/actions/timer24.png",
                   "res/actions/timer.png",
                   &ActResetTimer);

        DECLARE_PARAMETER("text", _("Nom du chronomètre"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("PauseTimer",
                   _("Mettre en pause un chronomètre"),
                   _("Met en pause le chronomètre indiqué."),
                   _("Mettre en pause le chronomètre _PARAM0_"),
                   _("Temps et chronomètres"),
                   "res/actions/pauseTimer24.png",
                   "res/actions/pauseTimer.png",
                   &ActPauseTimer);

        DECLARE_PARAMETER("text", _("Nom du chronomètre"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("UnPauseTimer",
                   _("Enlever la pause d'un chronomètre"),
                   _("Enlève la pause du chronomètre indiqué."),
                   _("Enlever la pause du chronomètre _PARAM0_"),
                   _("Temps et chronomètres"),
                   "res/actions/unPauseTimer24.png",
                   "res/actions/unPauseTimer.png",
                   &ActUnPauseTimer);

        DECLARE_PARAMETER("text", _("Nom du chronomètre"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ChangeTimeScale",
                   _("Changer l'échelle du temps"),
                   _("Change la vitesse du déroulement du jeu."),
                   _("Mettre à _PARAM0_ l'échelle du temps"),
                   _("Temps et chronomètres"),
                   "res/actions/time24.png",
                   "res/actions/time.png",
                   &ActChangeTimeScale);

        DECLARE_PARAMETER("expression", _("Echelle ( 1 : Normal, 2 : Double la vitesse, 0.5 : Ralenti de moitié... )"), false, "");

    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("TimeDelta", _("Temps écoulé depuis la dernière image"), _("Temps écoulé depuis la dernière image"), _("Temps"), "res/actions/time.png", &ExpTimeDelta)
    DECLARE_END_EXPRESSION()
    DECLARE_HIDDEN_EXPRESSION("TempsFrame", _("Temps écoulé depuis la dernière image"), _("Temps écoulé depuis la dernière image"), _("Temps"), "res/actions/time.png", &ExpTimeDelta)
    DECLARE_END_EXPRESSION()
    DECLARE_HIDDEN_EXPRESSION("ElapsedTime", _("Temps écoulé depuis la dernière image"), _("Temps écoulé depuis la dernière image"), _("Temps"), "res/actions/time.png", &ExpTimeDelta)
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("TimeFromStart", _("Temps écoulé depuis le début de la scène"), _("Temps écoulé depuis le début de la scène"), _("Temps"), "res/actions/time.png", &ExpTimeFromStart)
    DECLARE_END_EXPRESSION()
    DECLARE_HIDDEN_EXPRESSION("TempsDebut", _("Temps écoulé depuis le début de la scène"), _("Temps écoulé depuis le début de la scène"), _("Temps"), "res/actions/time.png", &ExpTimeFromStart)
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("TimeScale", _("Echelle du temps"), _("Echelle du temps"), _("Temps"), "res/actions/time.png", &ExpTimeScale)
    DECLARE_END_EXPRESSION()
    DECLARE_HIDDEN_EXPRESSION("TimeScale", _("Echelle du temps"), _("Echelle du temps"), _("Temps"), "res/actions/time.png", &ExpTimeScale)
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("Time", _("Temps actuel"), _("Temps actuel"), _("Temps"), "res/actions/time.png", &ExpTime)
        DECLARE_PARAMETER("text", _("Valeur à récupérer :\n\nHeure : hour\nMinutes : min\nSecondes : sec\nJour du mois: mday\nAnnées depuis 1900 : year\nJours depuis dimanche :wday\nJours depuis le 1er Janvier : yday"), false, "")
    DECLARE_END_EXPRESSION()
}
