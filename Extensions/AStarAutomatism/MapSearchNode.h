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
	int x;	 // the (x,y) positions of the node
	int y;
    RuntimeSceneAStarDatas & context;

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
