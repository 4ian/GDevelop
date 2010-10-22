#include "CppUnitLite/TestHarness.h"
#include "GDL/Object.h"
#include "GDL/aMove.h"
#include "GDL/cMove.h"

#include "GDL/ObjectsConcerned.h"
#include <boost/shared_ptr.hpp>
#include <string>
#include <vector>
#include "GDL/SpriteObject.h"
#include "GDL/Object.h"
#include "GDL/RuntimeGame.h"
#include "GDL/GDExpression.h"

#ifdef ___WXMSW___
#include "windows.h"
#include <wx/msw/winundef.h>
#endif

using namespace std;
/*
float SquareRootFloat(float number) {
    long *i;
    float x, y;
    const float f = 1.5F;

    x = number * 0.5F;
    y  = number;
    i  = reinterpret_cast<long*>( &y);
   * i  = 0x5f3759df - ( *i >> 1 );
    float * l_tempY  = reinterpret_cast<float *>(i) ;
    y = *l_tempY;
    y  = y * ( f - ( x * y * y ) );
    y  = y * ( f - ( x * y * y ) );
    return number * y;
}

TEST( Runtime, ObjectsConcerned )
{
    ObjInstancesHolder objectsList;
    objectsList.AddObject(boost::shared_ptr<Object>(new Object("blueBall")));
    objectsList.AddObject(boost::shared_ptr<Object>(new Object("blueBall")));
    objectsList.AddObject(boost::shared_ptr<Object>(new Object("redBall")));
    objectsList.AddObject(boost::shared_ptr<Object>(new Object("blueSquare")));
    objectsList.AddObject(boost::shared_ptr<Object>(new Object("redSquare")));
    objectsList.AddObject(boost::shared_ptr<Object>(new Object("redSquare")));
    objectsList.AddObject(boost::shared_ptr<Object>(new Object("blueAutre")));

    vector < ObjectGroup > groupsList;
    groupsList.push_back(ObjectGroup());
    groupsList.push_back(ObjectGroup());
    groupsList.push_back(ObjectGroup());
    groupsList.push_back(ObjectGroup());
    groupsList.push_back(ObjectGroup());

    groupsList[0].SetName("Balls");
    groupsList[0].AddObject("blueBall");
    groupsList[0].AddObject("redBall");

    groupsList[1].SetName("Squares");
    groupsList[1].AddObject("blueSquare");
    groupsList[1].AddObject("redSquare");

    groupsList[2].SetName("Blues");
    groupsList[2].AddObject("blueSquare");
    groupsList[2].AddObject("blueBall");
    groupsList[2].AddObject("blueAutre");

    groupsList[3].SetName("Reds");
    groupsList[3].AddObject("redSquare");
    groupsList[3].AddObject("redBall");

    groupsList[4].SetName("Other");
    groupsList[4].AddObject("blueAutre");

    cout << "Starting bench..." << endl;

    LARGE_INTEGER start;
    QueryPerformanceCounter(&start);

    for (unsigned int c = 0;c<10000;++c)
    {
        ObjectsConcerned objectsConcerned(&objectsList, &groupsList);

        ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();

        vector < boost::shared_ptr<Object> > picked;

        picked = objectsConcerned.Pick(objectIdentifiersManager->GetOIDfromName("Reds"));
        picked = objectsConcerned.PickAndRemove(objectIdentifiersManager->GetOIDfromName("Reds"));
        picked = objectsConcerned.Pick(objectIdentifiersManager->GetOIDfromName("Squares"));
        picked = objectsConcerned.Pick(objectIdentifiersManager->GetOIDfromName("Other"));
        picked = objectsConcerned.PickAndRemove(objectIdentifiersManager->GetOIDfromName("Squares"));
        picked = objectsConcerned.PickAndRemove(objectIdentifiersManager->GetOIDfromName("Squares"));

    }
    LARGE_INTEGER end;
    QueryPerformanceCounter(&end);

    cout << "Result : " << end.QuadPart-start.QuadPart << endl;

}

TEST(Runtime, SQRT)
{
    {

        LARGE_INTEGER start;
        QueryPerformanceCounter(&start);

        for (unsigned int c = 0;c<10000000;++c)
        {
            Force force;
            force.SetX(c);
            force.SetY(c);
            force.GetLength();
        }
        LARGE_INTEGER end;
        QueryPerformanceCounter(&end);

        cout << "Result forces : " << end.QuadPart-start.QuadPart << endl;
    }
}
*/
TEST( Runtime, Forces )
{
    Force force;
    force.SetX(500);
    force.SetY(0);

    //CHECK_EQUAL(0, force.GetAngle());
    //CHECK_EQUAL(long(int(499.997833)), long(int(force.GetLength())));

    force.SetAngle(90);
    force.SetLength(5);

    CHECK_EQUAL(0.0, long(int(force.GetX())));
    //CHECK_EQUAL(5, force.GetY());
}


TEST( Runtime, actionsMove )
{
    Object * object = new Object("testobj");

    Force force;
    force.SetX(500);
    force.SetY(0);
    object->Forces.push_back(force);

    sf::RenderWindow unusedWin;
    RuntimeGame game;

    RuntimeScene scene(&unusedWin, &game);
    scene.objectsInstances.AddObject(boost::shared_ptr<Object>(object));
}

TEST( Runtime, conditionsMove )
{
    Object * object = new Object("testobj");

    Force force;
    force.SetX(0);
    force.SetY(0);
    object->Forces.push_back(force);

    sf::RenderWindow unusedWin;
    RuntimeGame game;

    RuntimeScene scene(&unusedWin, &game);
    scene.objectsInstances.AddObject(boost::shared_ptr<Object>(object));

    //Condition Un objet est à l'arrêt
    vector < int > objConcern;
    Instruction condition;
    vector < GDExpression > params;
    params.push_back(GDExpression("testobj"));
    condition.SetParameters(params);
    condition.SetLocal(false);
    condition.SetInversion(false);
    ObjectsConcerned objectsConcerned(&scene.objectsInstances, &scene.objectGroups);

}

TEST( Runtime, Expressions )
{
    ObjSPtr object(new Object("object"));
    Scene scene;
    scene.initialObjects.push_back(object);
    Game game;

    {
        GDExpression expression("cos(3.5)+Random(5)");
        expression.PrepareForMathEvaluationOnly(game, scene);
        cout << expression.GetFirstErrorDuringPreprocessingText();

        CHECK_EQUAL(true, expression.PrepareForMathEvaluationOnly(game, scene));
    }
    {
        GDExpression expression("5+object.x()+Random(5)");
        CHECK_EQUAL(true, expression.PrepareForMathEvaluationOnly(game, scene));
    }
    {
        GDExpression expression("5+object.x(5)+Random(5)");
        CHECK_EQUAL(false, expression.PrepareForMathEvaluationOnly(game, scene));
    }
    {
        GDExpression expression("5+object.x(5,4)+Random(5)");
        CHECK_EQUAL(false, expression.PrepareForMathEvaluationOnly(game, scene));
    }
    {
        GDExpression expression("(cos(5+abs(3))/(asin(0.1)*acos(0.55)))^3+cos(5+abs(3))/(asin(0.1)*acos(0.55))");
        CHECK_EQUAL(true, expression.PrepareForMathEvaluationOnly(game, scene));
    }
    {
        GDExpression expression("(cos(5+abs(3))/(asin(0.1)*acos(0.55)))^3+cos(5+abs(3)/(asin(0.1)*acos(0.55))");
        CHECK_EQUAL(false, expression.PrepareForMathEvaluationOnly(game, scene));
    }
}


TEST( Runtime, StrExpressions )
{
    ObjSPtr object(new Object("object"));
    Scene scene;
    scene.initialObjects.push_back(object);
    Game game;

    {
        GDExpression expression("\"Salut\"");
        CHECK_EQUAL(true, expression.PrepareForTextEvaluationOnly(game, scene));
    }
    {
        GDExpression expression("\"Salut \"+object.VariableString(maVariable)");
        CHECK_EQUAL(true, expression.PrepareForTextEvaluationOnly(game, scene));
    }
    {
        GDExpression expression("object.X()");
        CHECK_EQUAL(true, expression.PrepareForTextEvaluationOnly(game, scene));
    }
    {
        GDExpression expression("\"X :\" + object.X()");
        CHECK_EQUAL(true, expression.PrepareForTextEvaluationOnly(game, scene));
    }
    {
        GDExpression expression("\"Salut\" + \"Ok\" + cos(5) + \" <- \"");
        CHECK_EQUAL(true, expression.PrepareForTextEvaluationOnly(game, scene));
    }
    {
        GDExpression expression("\"Salut\" + \"Ok\" cos(5) + \" <- \"");
        CHECK_EQUAL(false, expression.PrepareForTextEvaluationOnly(game, scene) );
    }
    {
        GDExpression expression("\"Salut\" + \"Ok\" ++ cos(5) + \" <- \"");
        CHECK_EQUAL(false, expression.PrepareForTextEvaluationOnly(game, scene) );
    }
}
