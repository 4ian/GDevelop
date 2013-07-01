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

#ifndef MAPSEARCHNODE_H
#define MAPSEARCHNODE_H

#include "stlastar.h"

/**
 * \brief MapSearchNode used by A Star algorithm.
 * Customized to use RuntimeSceneAStarDatas so as to generate map
 */
class MapSearchNode
{
public:
	int x; ///< Node X position
	int y; ///< Node Y position
    RuntimeSceneAStarDatas & context; ///< Each node must be provided a reference to runtimeSceneAStarDatas so as to be able to retrieve the "map"

	MapSearchNode(RuntimeSceneAStarDatas & context_) : x(0), y(0), context(context_) { x = y = 0; }
	MapSearchNode( RuntimeSceneAStarDatas & context_, int px, int py ) : x(px), y(py), context(context_) {}
	MapSearchNode& operator=(const MapSearchNode & other)
	{
	    if ( &other != this )
        {
            x = other.x;
            y = other.y;
        }
	    return *this;
	}

	float GoalDistanceEstimate( MapSearchNode &nodeGoal );
	bool IsGoal( MapSearchNode &nodeGoal );
	bool GetSuccessors( AStarSearch<MapSearchNode> *astarsearch, MapSearchNode *parent_node );
	float GetCost( MapSearchNode &successor );
	bool IsSameState( MapSearchNode &rhs );

	void PrintNodeInfo();

	/**
	 * Return the ( weight of a ) cell of the map.
	 * The map does not really exists : The "cells" of the map are
	 * computed on the fly using the objects on the scene ( RuntimeSceneAStarDatas::objects precisely )
	 */
	int GetCellOfMapAt( int x, int y );
};

#endif // MAPSEARCHNODE_H

