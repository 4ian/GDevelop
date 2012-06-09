/**

Game Develop - A Star Automatism Extension
Copyright (c) 2010-2012 Florian Rival (Florian.Rival@gmail.com)

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

#include "MapSearchNode.h"
#include <cmath>
#include "RuntimeSceneAStarDatas.h"
#include "AStarAutomatism.h"

int MapSearchNode::GetCellOfMapAt( int x, int y )
{
    unsigned int maxCost = 0;

    for (unsigned int i = 0;i<context.objects.size();++i)
    {
        AStarAutomatism * automatism = context.objects[i];

        if ( x*context.gridWidth  >= static_cast<int>(automatism->GetObject()->GetX()/context.gridWidth)*context.gridWidth - automatism->leftBorder*context.gridWidth &&
             x*context.gridWidth  <  static_cast<int>((automatism->GetObject()->GetX()+automatism->GetObject()->GetWidth())/context.gridWidth)*context.gridWidth+context.gridWidth + automatism->rightBorder*context.gridWidth &&
             y*context.gridHeight >= static_cast<int>(automatism->GetObject()->GetY()/context.gridHeight)*context.gridHeight - automatism->topBorder*context.gridWidth &&
             y*context.gridHeight <  static_cast<int>((automatism->GetObject()->GetY()+automatism->GetObject()->GetHeight())/context.gridHeight)*context.gridHeight+context.gridHeight + automatism->bottomBorder*context.gridWidth )
        {
            if ( automatism->GetCost() == 9 ) return 9;
            if ( automatism->GetCost() > maxCost ) maxCost = automatism->GetCost();
        }
    }

	return maxCost;
}
bool MapSearchNode::IsSameState( MapSearchNode &rhs )
{
	// same state in a maze search is simply when (x,y) are the same
	return ( (x == rhs.x) && (y == rhs.y) );
}

void MapSearchNode::PrintNodeInfo()
{
	cout << "Node position : (" << x << ", " << y << ")" << endl;
}

// Here's the heuristic function that estimates the distance from a Node
// to the Goal.

float MapSearchNode::GoalDistanceEstimate( MapSearchNode &nodeGoal )
{
	float xd = fabs(float(((float)x - (float)nodeGoal.x)));
	float yd = fabs(float(((float)y - (float)nodeGoal.y)));

	return xd + yd;
}

bool MapSearchNode::IsGoal( MapSearchNode &nodeGoal )
{

	if( (x == nodeGoal.x) &&
		(y == nodeGoal.y) )
	{
		return true;
	}

	return false;
}

// This generates the successors to the given Node. It uses a helper function called
// AddSuccessor to give the successors to the AStar class. The A* specific initialisation
// is done for each node internally, so here you just set the state information that
// is specific to the application
bool MapSearchNode::GetSuccessors( AStarSearch<MapSearchNode> *astarsearch, MapSearchNode *parent_node )
{

	int parent_x = -1;
	int parent_y = -1;

	if( parent_node )
	{
		parent_x = parent_node->x;
		parent_y = parent_node->y;
	}


	MapSearchNode NewNode(context);

	// push each possible move except allowing the search to go backwards

	if( (GetCellOfMapAt( x-1, y ) < 9)
		&& !((parent_x == x-1) && (parent_y == y))
	  )
	{
		NewNode = MapSearchNode(context, x-1, y );
		astarsearch->AddSuccessor( NewNode );
	}

	if( (GetCellOfMapAt( x, y-1 ) < 9)
		&& !((parent_x == x) && (parent_y == y-1))
	  )
	{
		NewNode = MapSearchNode(context, x, y-1 );
		astarsearch->AddSuccessor( NewNode );
	}

	if( (GetCellOfMapAt( x+1, y ) < 9)
		&& !((parent_x == x+1) && (parent_y == y))
	  )
	{
		NewNode = MapSearchNode(context, x+1, y );
		astarsearch->AddSuccessor( NewNode );
	}


	if( (GetCellOfMapAt( x, y+1 ) < 9)
		&& !((parent_x == x) && (parent_y == y+1))
		)
	{
		NewNode = MapSearchNode(context, x, y+1 );
		astarsearch->AddSuccessor( NewNode );
	}

    if ( context.diagonalMove )
    {
        if( (GetCellOfMapAt( x+1, y+1 ) < 9)
            && !((parent_x == x+1) && (parent_y == y+1))
            )
        {
            NewNode = MapSearchNode(context, x+1, y+1 );
            astarsearch->AddSuccessor( NewNode );
        }
        if( (GetCellOfMapAt( x-1, y+1 ) < 9)
            && !((parent_x == x-1) && (parent_y == y+1))
            )
        {
            NewNode = MapSearchNode(context, x-1, y+1 );
            astarsearch->AddSuccessor( NewNode );
        }
        if( (GetCellOfMapAt( x-1, y-1 ) < 9)
            && !((parent_x == x-1) && (parent_y == y-1))
            )
        {
            NewNode = MapSearchNode(context, x-1, y-1 );
            astarsearch->AddSuccessor( NewNode );
        }
        if( (GetCellOfMapAt( x+1, y-1 ) < 9)
            && !((parent_x == x+1) && (parent_y == y-1))
            )
        {
            NewNode = MapSearchNode(context, x+1, y-1 );
            astarsearch->AddSuccessor( NewNode );
        }

    }

	return true;
}

// given this node, what does it cost to move to successor. In the case
// of our map the answer is the map terrain value at this node since that is
// conceptually where we're moving

float MapSearchNode::GetCost( MapSearchNode &successor )
{
	return (float) GetCellOfMapAt( x, y );

}
