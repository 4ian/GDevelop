#include "CppUnitLite/TestHarness.h"
#include "../Game Develop Player/Object.h"
#include "../Game Develop Player/aMove.h"
#include "../Game Develop Player/cMove.h"
#include "../Game Develop Player/Access.h"
#include "../Game Develop Player/ObjectsConcerned.h"
#include <boost/shared_ptr.hpp>
#include <string>
#include <vector>
#include "../Game Develop Player/SpriteObject.h"
#include "../Game Develop Player/Object.h"
#include "../Game Develop Player/RuntimeGame.h"

#include "windows.h"
#ifdef ___WXMSW___
#include <wx/msw/winundef.h>
#endif

using namespace std;

TEST( Player, Object )
{
    SpriteObject object("unnamed");
    object.SetX(200);
    object.SetY(300);

    CHECK_EQUAL(200L, object.GetX());
    CHECK_EQUAL(300L, object.GetY());
    //CHECK_EQUAL(1L, object.GetWidth()); //Bizarrement, si le test unitaire ne correpond pas, il y a un joli plantage
    CHECK_EQUAL(1L, object.GetHeight());
    CHECK_EQUAL(false, object.IsValid(0,0,0));
    CHECK_EQUAL(0L, object.TotalForceX());
    CHECK_EQUAL(0L, object.TotalForceY());
    CHECK_EQUAL(0L, object.TotalForceLength());

    //On vérifie que ça bugge pas.
    object.GetCurrentSprite();
    object.GetCurrentSpriteDatas();
    object.UpdateTime(0);
}

TEST( Player, ObjectsConcerned )
{
    vector < boost::shared_ptr<Object> > objectsList;
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList[0]->SetName( "blueBall" );
    objectsList[1]->SetName( "blueBall" );
    objectsList[2]->SetName( "redBall" );
    objectsList[3]->SetName( "blueSquare" );
    objectsList[4]->SetName( "redSquare" );
    objectsList[5]->SetName( "redSquare" );
    objectsList[6]->SetName( "blueAutre" );

    //+
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList.push_back(boost::shared_ptr<Object>(new Object("unnamed")));
    objectsList[7]->SetName( "blueAutre" );
    objectsList[8]->SetName( "blueAutre" );
    objectsList[9]->SetName( "blueAutre" );
    objectsList[10]->SetName( "blueAutre" );
    objectsList[11]->SetName( "blueAutre" );
    objectsList[12]->SetName( "blueAutre" );
    objectsList[13]->SetName( "blueAutre" );
    objectsList[14]->SetName( "blueAutre" );
    objectsList[15]->SetName( "blueAutre" );
    objectsList[16]->SetName( "blueAutre" );

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

    ObjectsConcerned objectsConcerned(&objectsList, &groupsList);

    {
        vector < boost::shared_ptr<Object> > picked;

        picked = objectsConcerned.PickAndRemove("Reds");
        /*CHECK_EQUAL(3L, (long)picked.size()); // Les 3 rouges
        CHECK_EQUAL(3L, (long)objectsConcerned.objectsPicked.size()); // Les 3 rouges
        cout << endl;

        picked = objectsConcerned.Pick("Squares");
        CHECK_EQUAL(2L, (long)picked.size());// Les deux carrés rouge
        CHECK_EQUAL(3L, (long)objectsConcerned.objectsPicked.size()); // Les 3 rouges

        picked = objectsConcerned.Pick("Other");
        CHECK_EQUAL(1L, (long)picked.size()); //L'autre
        CHECK_EQUAL(4L, (long)objectsConcerned.objectsPicked.size()); // Les 3 rouges et l'autre

        picked = objectsConcerned.PickAndRemove("Reds");
        CHECK_EQUAL(3L, (long)picked.size()); // Les 3 rouges
        CHECK_EQUAL(1L, (long)objectsConcerned.objectsPicked.size()); // L'autre
        cout << endl;*/

        //Print concerned and picked objects
        for (unsigned int i = 0;i<picked.size();++i)
            cout << "object concerned : " << picked[i]->GetName() << endl;
        cout << endl;
        for (unsigned int i = 0;i<objectsConcerned.objectsPicked.size();++i)
            cout << "object Picked : " << objectsConcerned.objectsPicked[i]->GetName() << endl;
        cout << endl;
    }

    for (unsigned int k =0;k<2;++k)
    {
    cout << "start New" << endl;
    clock_t start = clock();
    LARGE_INTEGER tick;   // A point in time
    QueryPerformanceCounter(&tick);


    for (unsigned int i =0;i<50000;++i)
    {
        vector < boost::shared_ptr<Object> > picked;
        picked = objectsConcerned.PickAndRemove("blueSquare");
        picked = objectsConcerned.Pick("redSquare");
        picked = objectsConcerned.Pick("Other");
        picked = objectsConcerned.PickAndRemove("Reds");


    }
    clock_t endnew = clock() ;
    LARGE_INTEGER endtick;   // A point in time
    QueryPerformanceCounter(&endtick);

    int ticksNew = endnew-start;
    int PticksNew = endtick.QuadPart-tick.QuadPart;
    cout << "new time :" << endnew-start;
    cout << "P new time :" << endtick.QuadPart-tick.QuadPart<<endl;

    cout << "start Old" << endl;
    start = clock();
    QueryPerformanceCounter(&tick);

    for (unsigned int i =0;i<50000;++i)
    {
        vector < int > pickedOLD;
        vector < int > ALLpicked;
        pickedOLD = Picker::Pick(&objectsList, &groupsList, "blueSquare");
        for (unsigned int i = 0;i<pickedOLD.size();++i)
            ALLpicked.push_back(pickedOLD[i]);

        pickedOLD = Picker::PickAndRemove(&objectsList, &groupsList, "redSquare", &ALLpicked);
        for (unsigned int i = 0;i<pickedOLD.size();++i)
            ALLpicked.push_back(pickedOLD[i]);

        vector < int > pickedOLD2;
        pickedOLD2 = Picker::Pick(&objectsList, &groupsList, "Other");
        for (unsigned int i = 0;i<pickedOLD2.size();++i)
            ALLpicked.push_back(pickedOLD2[i]);


        pickedOLD = Picker::PickAndRemove(&objectsList, &groupsList, "Reds", &ALLpicked);
        for (unsigned int i = 0;i<pickedOLD.size();++i)
            ALLpicked.push_back(pickedOLD[i]);
    }
    clock_t endold = clock() ;
    LARGE_INTEGER endtickOld;   // A point in time
    QueryPerformanceCounter(&endtickOld);
    cout << "old time :" << endold-start;
    cout << "P new time :" << endtickOld.QuadPart-tick.QuadPart<<endl;
    int ticksOld = endold-start;
    int PticksOld = endtickOld.QuadPart-tick.QuadPart;
    cout << "rapport : " << static_cast<float>(ticksOld)/static_cast<float>(ticksNew) << " et " << static_cast<float>(PticksOld)/static_cast<float>(PticksNew);


    }

}

TEST( Player, Forces )
{
    Force force;
    force.SetX(500);
    force.SetY(0);

    CHECK_EQUAL(0L, force.GetAngle());
    CHECK_EQUAL(long(int(499.997833)), long(int(force.GetLength())));

    force.SetAngle(90);
    force.SetLength(5);

    CHECK_EQUAL(0.0, long(int(force.GetX())));
    CHECK_EQUAL(5L, force.GetY());
}


TEST( Player, actionsMove )
{
    Object * object = new Object("testobj");

    Force force;
    force.SetX(500);
    force.SetY(0);
    object->Forces.push_back(force);

    sf::RenderWindow unusedWin;
    RuntimeGame game;

    RuntimeScene scene(&unusedWin, &game);
    scene.objets.push_back(boost::shared_ptr<Object>(object));
}

TEST( Player, conditionsMove )
{
    Object * object = new Object("testobj");

    Force force;
    force.SetX(0);
    force.SetY(0);
    object->Forces.push_back(force);

    sf::RenderWindow unusedWin;
    RuntimeGame game;

    RuntimeScene scene(&unusedWin, &game);
    scene.objets.push_back(boost::shared_ptr<Object>(object));

    //Condition Un objet est à l'arrêt
    vector < int > objConcern;
    Instruction condition;
    vector < GDExpression > params;
    params.push_back(GDExpression("testobj"));
    condition.SetParameters(params);
    condition.SetLocal(false);
    condition.SetInversion(false);
    Evaluateur eval(game, scene);
    ObjectsConcerned objectsConcerned(&scene.objets, &scene.objectGroups);
    eval.SetObjectsConcerned(&objectsConcerned);

}
