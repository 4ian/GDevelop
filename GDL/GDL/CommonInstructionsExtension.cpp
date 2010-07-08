/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/CommonInstructionsExtension.h"
#include "GDL/CommonInstructions.h"
#include "GDL/CommentEvent.h"
#include "GDL/StandardEvent.h"
#include "GDL/LinkEvent.h"
#include "GDL/WhileEvent.h"
#include "GDL/RepeatEvent.h"
#include "GDL/ForEachEvent.h"
#include "GDL/Event.h"

#include "GDL/ExtensionBase.h"

CommonInstructionsExtension::CommonInstructionsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinCommonInstructions",
                          _("Évènements standards"),
                          _("Extension apportant des types d'évènements de base, intégrée en standard."),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("Or",
                   _("Ou"),
                   _("Renvoie vraie si une seule des sous conditions est vraie"),
                   _("Si une de ces condition est vraie :"),
                   _("Avancé"),
                   "res/conditions/or24.png",
                   "res/conditions/or.png",
                   &ConditionOr);

        DECLARE_CAN_HAVE_SUB_CONDITION();

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("And",
                   _("Et"),
                   _("Renvoie vraie si toutes les sous conditions sont vraies"),
                   _("Si toutes ces conditions sont vraies :"),
                   _("Avancé"),
                   "res/conditions/and24.png",
                   "res/conditions/and.png",
                   &ConditionAnd);

        DECLARE_CAN_HAVE_SUB_CONDITION();

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("Not",
                   _("Non"),
                   _("Renvoie l'inverse du résultat des sous conditions"),
                   _("Inverser le résultat logique de ces conditions :"),
                   _("Avancé"),
                   "res/conditions/not24.png",
                   "res/conditions/not.png",
                   &ConditionNot);

        DECLARE_CAN_HAVE_SUB_CONDITION();

    DECLARE_END_CONDITION()

    DECLARE_EVENT("Standard",
                  _("Évènement standard"),
                  "Évènement standard : Actions qui sont lancées si des conditions sont vérifiées",
                  "",
                  "res/eventaddicon.png",
                  StandardEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("Link",
                  _("Lien"),
                  "Lien vers des évènements d'une autre scène",
                  "",
                  "res/lienaddicon.png",
                  LinkEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("Comment",
                  _("Commentaire"),
                  "Un évènement permettant d'ajouter un commentaire dans la liste des évènements",
                  "",
                  "res/comment.png",
                  CommentEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("While",
                  _("Tant que"),
                  "Répète des conditions et actions tant que certaines conditions ne sont pas vérifiées",
                  "",
                  "res/while.png",
                  WhileEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("Repeat",
                  _("Répéter"),
                  "Répète un certain nombre de fois des conditions et actions",
                  "",
                  "res/repeat.png",
                  RepeatEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("ForEach",
                  _("Pour chaque objet"),
                  "Répète des conditions et actions en prenant à chaque fois un objet ayant le nom indiqué",
                  "",
                  "res/foreach.png",
                  ForEachEvent)

    DECLARE_END_EVENT()

}
