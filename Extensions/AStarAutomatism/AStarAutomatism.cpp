/**

Game Develop - A Star Automatism Extension
Copyright (c) 2010-2013 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "AStarAutomatism.h"
#include "AStarAutomatismEditor.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/Scene.h"
#include "GDCpp/tinyxml/tinyxml.h"
#include "GDCpp/XmlMacros.h"
#include "MapSearchNode.h"
#include "RuntimeSceneAStarDatas.h"
#include <cmath>

AStarAutomatism::AStarAutomatism() :
    Automatism(),
    leftBorder(0),
    rightBorder(0),
    topBorder(0),
    bottomBorder(0),
    speed(150),
    timeOnSegment(0),
    totalSegmentTime(0),
    currentSegment(0),
    destinationX(0),
    destinationY(0),
    cost(9),
    runtimeScenesAStarDatas(NULL)
{
    Reset();
}

AStarAutomatism::~AStarAutomatism()
{
    if ( runtimeScenesAStarDatas != NULL )
        runtimeScenesAStarDatas->objects.erase(std::remove(runtimeScenesAStarDatas->objects.begin(), runtimeScenesAStarDatas->objects.end(), this), runtimeScenesAStarDatas->objects.end());
}

void AStarAutomatism::Reset()
{
    EnterSegment(0);
}

void AStarAutomatism::EnterSegment(unsigned int segmentNumber)
{
    currentSegment = segmentNumber;
    if ( !path.empty() && currentSegment < path.size()-1)
    {
        sf::Vector2f newPath = (path[currentSegment + 1] - path[currentSegment]);
        totalSegmentTime = sqrtf(newPath.x*newPath.x+newPath.y*newPath.y);
        timeOnSegment = 0;
    }
}

#if defined(GD_IDE_ONLY)
void AStarAutomatism::EditAutomatism( wxWindow* parent, gd::Project & game_, gd::Layout * scene, gd::MainFrameWrapper & mainFrameWrapper_ )
{
    AStarAutomatismEditor editor(parent, game_, scene, *this);
    editor.ShowModal();
}
#endif

/**
 * Called at each frame before events :
 * Position the object on the path
 */
void AStarAutomatism::DoStepPreEvents(RuntimeScene & scene)
{
    if ( runtimeScenesAStarDatas == NULL )
    {
        runtimeScenesAStarDatas = static_cast<RuntimeSceneAStarDatas*>(scene.GetAutomatismSharedDatas(name).get());
        runtimeScenesAStarDatas->objects.push_back(this);
    }

    //  add to the current time along the path
    timeOnSegment += static_cast<double>(scene.GetElapsedTime())/1000000.0 * speed;

    //  if I reached the end of this segment, move to a new segment
    if (timeOnSegment >= totalSegmentTime && currentSegment < path.size())
        EnterSegment(currentSegment + 1);

    //Position object on the segment
    sf::Vector2f newPos;
    if ( !path.empty() )
    {
        if ( currentSegment < path.size()-1 )
            newPos = offset + path[currentSegment] + (path[currentSegment + 1] - path[currentSegment]) * (timeOnSegment / totalSegmentTime );
        else
            newPos = path.back();

        object->SetX(newPos.x);
        object->SetY(newPos.y);
    }

    return;
}

void AStarAutomatism::ComputePath(RuntimeScene & scene)
{
    if ( runtimeScenesAStarDatas == NULL )
    {
        runtimeScenesAStarDatas = static_cast<RuntimeSceneAStarDatas*>(scene.GetAutomatismSharedDatas(name).get());
        runtimeScenesAStarDatas->objects.push_back(this);
    }

    //Recreate a new path
    path.clear();
    path.push_back(sf::Vector2f(object->GetX(), object->GetY()));

	AStarSearch<MapSearchNode> astarsearch(*runtimeScenesAStarDatas);

	unsigned int SearchCount = 0;

	const unsigned int NumSearches = 1;

	while(SearchCount < NumSearches)
	{
		// Create a start state
		MapSearchNode nodeStart(*runtimeScenesAStarDatas);
		nodeStart.x = object->GetX()/runtimeScenesAStarDatas->gridWidth;
		nodeStart.y = object->GetY()/runtimeScenesAStarDatas->gridHeight;

		// Define the goal state
		MapSearchNode nodeEnd(*runtimeScenesAStarDatas);
		nodeEnd.x = destinationX/runtimeScenesAStarDatas->gridWidth;
		nodeEnd.y = destinationY/runtimeScenesAStarDatas->gridHeight;

		// Set Start and goal states
		astarsearch.SetStartAndGoalStates( nodeStart, nodeEnd );

		unsigned int SearchState;
		unsigned int SearchSteps = 0;

		do
		{
			SearchState = astarsearch.SearchStep();

			SearchSteps++;

	#if DEBUG_LISTS

			cout << "Steps:" << SearchSteps << "\n";

			int len = 0;

			cout << "Open:\n";
			MapSearchNode *p = astarsearch.GetOpenListStart();
			while( p )
			{
				len++;
	#if !DEBUG_LIST_LENGTHS_ONLY
				((MapSearchNode *)p)->PrintNodeInfo();
	#endif
				p = astarsearch.GetOpenListNext();

			}

			cout << "Open list has " << len << " nodes\n";

			len = 0;

			cout << "Closed:\n";
			p = astarsearch.GetClosedListStart();
			while( p )
			{
				len++;
	#if !DEBUG_LIST_LENGTHS_ONLY
				p->PrintNodeInfo();
	#endif
				p = astarsearch.GetClosedListNext();
			}

			cout << "Closed list has " << len << " nodes\n";
	#endif

		}
		while( SearchState == AStarSearch<MapSearchNode>::SEARCH_STATE_SEARCHING );

		if( SearchState == AStarSearch<MapSearchNode>::SEARCH_STATE_SUCCEEDED )
		{
				MapSearchNode *node = astarsearch.GetSolutionStart();

	#if DISPLAY_SOLUTION
				cout << "Displaying solution\n";
	#endif
				for( ;; )
				{
					node = astarsearch.GetSolutionNext();

					if( !node )
						break;

					path.push_back(sf::Vector2f(node->x*runtimeScenesAStarDatas->gridWidth, node->y*runtimeScenesAStarDatas->gridHeight));
				};

				// Once you're done with the solution you can free the nodes up
				astarsearch.FreeSolutionNodes();
		}
		else if( SearchState == AStarSearch<MapSearchNode>::SEARCH_STATE_FAILED )
		{
		}

		SearchCount ++;
		astarsearch.EnsureMemoryFreed();
	}

	EnterSegment(0);

	return;
}

void AStarAutomatism::MoveTo( RuntimeScene & scene, float destinationX_, float destinationY_ )
{
    destinationX = destinationX_;
    destinationY = destinationY_;

    ComputePath(scene);
}

void AStarAutomatism::SetGridWidth( RuntimeScene & scene, float gridWidth )
{
    if ( runtimeScenesAStarDatas != NULL ) runtimeScenesAStarDatas->gridWidth = gridWidth;
}
void AStarAutomatism::SetGridHeight( RuntimeScene & scene, float gridHeight )
{
    if ( runtimeScenesAStarDatas != NULL ) runtimeScenesAStarDatas->gridHeight = gridHeight;
}
float AStarAutomatism::GetGridWidth( RuntimeScene & scene )
{
    return runtimeScenesAStarDatas != NULL ? runtimeScenesAStarDatas->gridWidth : 0;
}
float AStarAutomatism::GetGridHeight( RuntimeScene & scene )
{
    return runtimeScenesAStarDatas != NULL ? runtimeScenesAStarDatas->gridHeight : 0;
}

#if defined(GD_IDE_ONLY)
void AStarAutomatism::SaveToXml(TiXmlElement * elem) const
{
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("cost", cost);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("leftBorder", leftBorder);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("rightBorder", rightBorder);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("topBorder", topBorder);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("bottomBorder", bottomBorder);
}
#endif

void AStarAutomatism::LoadFromXml(const TiXmlElement * elem)
{
    {
        int temp = 9;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("cost", temp);
        cost = temp;
    }
    {
        int temp = 0;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("leftBorder", temp);
        leftBorder = temp;
    }
    {
        int temp = 0;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("rightBorder", temp);
        rightBorder = temp;
    }
    {
        int temp = 0;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("topBorder", temp);
        topBorder = temp;
    }
    {
        int temp = 0;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("bottomBorder", temp);
        bottomBorder = temp;
    }
}

