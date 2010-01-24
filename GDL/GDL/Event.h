/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *  Event.h
 *
 *  Un évènement peut être :
 *  normal : actions/conditions et sous évènements
 *  commentaire : affichage juste de texte
 *  lien : lien vers les évènements d'une scène
 *  dossier : Contient d'autre évènements
 */

#ifndef EVENT_H
#define EVENT_H

#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include "GDL/Log.h"
#include "GDL/Instruction.h"

class GD_API Event
{
    public:
        Event();
        virtual ~Event();

        /** For all events : Type of the event */
        string type;

        /** For event only : List of conditions of this event */
        vector < Instruction > conditions;
        /** For event only : List of actions of this event */
        vector < Instruction > actions;
        /** For event only : Sub events */
        vector < Event > events;

        /** For comment-event only : Color of the comment */
        int r;
        /** For comment-event only : Color of the comment */
        int v;
        /** For comment-event only : Color of the comment */
        int b;
        /** For comment-event only : The main comment */
        string com1;
        /** For comment-event only : The second comment */
        string com2;

        /** For link-event only : Scene linked to name */
        string sceneLinked;
        /** For link-event only : First event to import */
        int start;
        /** For link-event only : Last event to import */
        int end;

#ifdef GDE
        mutable bool conditionsHeightNeedUpdate;
        mutable unsigned int conditionsHeight;
        mutable bool actionsHeightNeedUpdate;
        mutable unsigned int actionsHeight;
#endif
};



#endif // EVENT_H
