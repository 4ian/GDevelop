/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef ACCESS_H_INCLUDED
#define ACCESS_H_INCLUDED

#include "GDL/RuntimeScene.h"
#include "GDL/Game.h"
class ObjectsConcerned;

typedef vector < boost::shared_ptr<Object> > ObjList;
typedef boost::shared_ptr<Object> ObjSPtr;

/**
 * This class evaluate expressions.
 */
class GD_API Evaluateur
{
    public :

    Evaluateur(const Game & pGame, const RuntimeScene & pScene);
    ~Evaluateur();

    double EvalExp(GDExpression & expression, ObjSPtr obj1 = boost::shared_ptr<Object>( ), ObjSPtr obj2 = boost::shared_ptr<Object>( )) const;
    string EvalTxt(GDExpression & expression, ObjSPtr obj1 = boost::shared_ptr<Object>( ), ObjSPtr obj2 = boost::shared_ptr<Object>( )) const;
    string EvalExpTxt(GDExpression & expression, ObjSPtr obj1 = boost::shared_ptr<Object>( ), ObjSPtr obj2 = boost::shared_ptr<Object>( )) const;


    /**
     * Set the object concerned used when evaluating
     */
    inline void SetObjectsConcerned(ObjectsConcerned * objectsConcerned_) const
    {
        objectsConcerned = objectsConcerned_;
    }

    /**
     * Preprocess a expression, decomposing it into functions calls.
     */
    static void PreprocessExpression(GDExpression & expr, const RuntimeScene & scene);

    private :

    /**
     * Add to an expression, a call to the constant function.
     */
    static void AddConstantFunctionCall(GDExpression & expr, string & plainExpression, size_t endPos);

    /**
     * Add to an expression, a call to an object function
     */
    static void AddObjectFunctionCall(GDExpression & expr, string & plainExpression, const RuntimeScene & scene);

    /**
     * Add to an expression, a call to an simple expression function
     */
    static void AddFunctionCall(GDExpression & expr, string & plainExpression, const RuntimeScene & scene);

    /**
     * Add to an expression, a call to an global expression function
     */
    static void AddGlobalFunctionCall(GDExpression & expr, string & plainExpression, const RuntimeScene & scene);

    const Game & game;
    const RuntimeScene & scene;
    mutable ObjectsConcerned * objectsConcerned;
};


#endif // ACCESS_H_INCLUDED
