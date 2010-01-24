/**
 * Game Develop
 *    Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Les structures utilisées pour ranger les objets par plan
 */

#ifndef SORTBYPLAN_H_INCLUDED
#define SORTBYPLAN_H_INCLUDED


struct PlanObjet
{
    int idObjet;
    int plan;
};

////////////////////////////////////////////////////////////
/// Tri par plan
///
/// Définition du foncteur pour trier les objets suivant leurs plans.
////////////////////////////////////////////////////////////
struct SortByPlan
{
   bool operator ()(const PlanObjet& a1, const PlanObjet& a2) const
   {
      return a1.plan < a2.plan;
   }
};

#endif // SORTBYPLAN_H_INCLUDED
