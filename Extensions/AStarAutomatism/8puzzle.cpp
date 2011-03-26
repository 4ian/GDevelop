////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STL A* Search implementation
// (C)2001 Justin Heyes-Jones
//
// This uses my A* code to solve the 8-puzzle

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

#include <iostream>
#include <assert.h>
#include <new>

#include <ctype.h>

using namespace std;

// Configuration

#define NUM_TIMES_TO_RUN_SEARCH 1
#define DISPLAY_SOLUTION_FORWARDS 1
#define DISPLAY_SOLUTION_BACKWARDS 0
#define DISPLAY_SOLUTION_INFO 1
#define DEBUG_LISTS 0

// AStar search class
#include "stlastar.h" // See header for copyright and usage information

// Global data

#define BOARD_WIDTH   (3)
#define BOARD_HEIGHT  (3)

#define GM_TILE     (-1)
#define GM_SPACE	 (0)
#define GM_OFF_BOARD (1)

// Definitions

// To use the search class you must define the following calls...

// Data
//		Your own state space information
// Functions
//		(Optional) Constructor.
//		Nodes are created by the user, so whether you use a
//      constructor with parameters as below, or just set the object up after the 
//      constructor, is up to you.
//
//		(Optional) Destructor. 
//		The destructor will be called if you create one. You 
//		can rely on the default constructor unless you dynamically allocate something in
//		your data
//
//		float GoalDistanceEstimate( PuzzleState &nodeGoal );
//		Return the estimated cost to goal from this node (pass reference to goal node)
//
//		bool IsGoal( PuzzleState &nodeGoal );
//		Return true if this node is the goal.
//
//		bool GetSuccessors( AStarSearch<PuzzleState> *astarsearch );
//		For each successor to this state call the AStarSearch's AddSuccessor call to 
//		add each one to the current search - return false if you are out of memory and the search
//		will fail
//
//		float GetCost( PuzzleState *successor );
//		Return the cost moving from this state to the state of successor
//
//		bool IsSameState( PuzzleState &rhs );
//		Return true if the provided state is the same as this state

// Here the example is the 8-puzzle state ...
class PuzzleState
{

public:

	// defs

	typedef enum
	{
		TL_SPACE,
		TL_1,
		TL_2,
		TL_3,
		TL_4,
		TL_5,
		TL_6,
		TL_7,
		TL_8

	} TILE;

	// data

	static TILE g_goal[ BOARD_WIDTH*BOARD_HEIGHT];
	static TILE g_start[ BOARD_WIDTH*BOARD_HEIGHT];

	// the tile data for the 8-puzzle
	TILE tiles[ BOARD_WIDTH*BOARD_HEIGHT ];

	// member functions

	PuzzleState() {  
						memcpy( tiles, g_goal, sizeof( TILE ) * BOARD_WIDTH * BOARD_HEIGHT );			
					}

	PuzzleState( TILE *param_tiles ) 
					{
						memcpy( tiles, param_tiles, sizeof( TILE ) * BOARD_WIDTH * BOARD_HEIGHT );			
					}

	float GoalDistanceEstimate( PuzzleState &nodeGoal );
	bool IsGoal( PuzzleState &nodeGoal );
	bool GetSuccessors( AStarSearch<PuzzleState> *astarsearch, PuzzleState *parent_node );
	float GetCost( PuzzleState &successor );
	bool IsSameState( PuzzleState &rhs );
	
	void PrintNodeInfo(); 

private:
	// User stuff - Just add what you need to help you write the above functions...

	void GetSpacePosition( PuzzleState *pn, int *rx, int *ry );
	bool LegalMove( TILE *StartTiles, TILE *TargetTiles, int spx, int spy, int tx, int ty );
	int GetMap( int x, int y, TILE *tiles );




};

// Goal state
PuzzleState::TILE PuzzleState::g_goal[] = 
{
	TL_1,
	TL_2,
	TL_3,
	TL_8,
	TL_SPACE,
	TL_4,
	TL_7,
	TL_6,
	TL_5,
};

// Some nice Start states
PuzzleState::TILE PuzzleState::g_start[] = 
{

	// Three example start states from Bratko's Prolog Programming for Artificial Intelligence

#if 1
	// ex a - 4 steps
	 TL_1 ,
	 TL_3 ,
	 TL_4 ,
	 TL_8 ,
	 TL_SPACE ,
	 TL_2 ,
	 TL_7 ,
	 TL_6 ,
	 TL_5 ,

#elif 0
  
	// ex b - 5 steps
	 TL_2 ,
	 TL_8 ,
	 TL_3 ,
	 TL_1 ,
	 TL_6 ,
	 TL_4 ,
	 TL_7 ,
	 TL_SPACE ,
	 TL_5 ,

#elif 0
	
	// ex c - 18 steps
	 TL_2 ,
	 TL_1 ,
	 TL_6 ,
	 TL_4 ,
	 TL_SPACE ,
	 TL_8 ,
	 TL_7 ,
	 TL_5 ,
	 TL_3 ,

#elif 0
	
	// nasty one - doesn't solve
	 TL_6 ,
	 TL_3 ,	  
	 TL_SPACE ,
	 TL_4 ,
	 TL_8 ,
	 TL_5 ,
	 TL_7 ,
	 TL_2 ,
	 TL_1 ,

#elif 0

	// sent by email - does work though

	 TL_1 ,	 TL_2 ,  TL_3 ,
	 TL_4 ,	 TL_5 ,  TL_6 ,
	 TL_8 ,	 TL_7 ,  TL_SPACE ,

	
// from http://www.cs.utexas.edu/users/novak/asg-8p.html

//Goal:        Easy:        Medium:        Hard:        Worst:

//1 2 3        1 3 4        2 8 1          2 8 1        5 6 7
//8   4        8 6 2          4 3          4 6 3        4   8
//7 6 5        7   5        7 6 5            7 5        3 2 1


#elif 0

	// easy 5 
	 TL_1 ,
	 TL_3 ,	  
	 TL_4 ,

	 TL_8 ,
	 TL_6 ,
	 TL_2 ,
	
	 TL_7 ,
	 TL_SPACE ,
	 TL_5 ,


#elif 0

	// medium 9
	 TL_2 ,
	 TL_8 ,	  
	 TL_1 ,

	 TL_SPACE ,
	 TL_4 ,
	 TL_3 ,
	
	 TL_7 ,
	 TL_6 ,
	 TL_5 ,

#elif 0

	// hard 12
	 TL_2 ,
	 TL_8 ,	  
	 TL_1 ,

	 TL_4 ,
	 TL_6 ,
	 TL_3 ,
	
	 TL_SPACE ,
	 TL_7 ,
	 TL_5 ,

#elif 0

	// worst 30
	 TL_5 ,
	 TL_6 ,	  
	 TL_7 ,

	 TL_4 ,
	 TL_SPACE ,
	 TL_8 ,
	
	 TL_3 ,
	 TL_2 ,
	 TL_1 ,

#elif 0

	//	123
	//	784
	//   65

	// two move simple board
	 TL_1 ,
	 TL_2 ,	  
	 TL_3 ,

	 TL_7 ,
	 TL_8 ,
	 TL_4 ,
	
	 TL_SPACE ,
	 TL_6 ,
	 TL_5 ,

#elif 0
	//  a1 b2 c3 d4 e5 f6 g7 h8 
	//C3,Blank,H8,A1,G8,F6,E5,D4,B2

	 TL_3 ,
	 TL_SPACE ,	  
	 TL_8 ,

	 TL_1 ,
	 TL_8 ,
	 TL_6 ,
	
	 TL_5 ,
	 TL_4 ,
	 TL_2 ,


#endif  

};

bool PuzzleState::IsSameState( PuzzleState &rhs )
{

	for( int i=0; i<(BOARD_HEIGHT*BOARD_WIDTH); i++ )
	{
		if( tiles[i] != rhs.tiles[i] )
		{
			return false;
		}
	}

	return true;

}

void PuzzleState::PrintNodeInfo()
{
	cout << 
		(char) (tiles[0] + '0') << 
		(char) (tiles[1] + '0') <<
		(char) (tiles[2] + '0') << endl <<
		(char) (tiles[3] + '0') <<
		(char) (tiles[4] + '0') << 
		(char) (tiles[5] + '0') << endl << 
		(char) (tiles[6] + '0') << 
		(char) (tiles[7] + '0') << 
		(char) (tiles[8] + '0') << endl; 
}

// Here's the heuristic function that estimates the distance from a PuzzleState
// to the Goal. 

float PuzzleState::GoalDistanceEstimate( PuzzleState &nodeGoal )
{

	// Nilsson's sequence score

	int i, cx, cy, ax, ay, h = 0, s, t;

	// given a tile this returns the tile that should be clockwise
	TILE correct_follower_to[ BOARD_WIDTH * BOARD_HEIGHT ] =
	{
		TL_SPACE, // always wrong
		TL_2,
		TL_3,
		TL_4,
		TL_5,
		TL_6,
		TL_7,
		TL_8,
		TL_1,
	};

	// given a table index returns the index of the tile that is clockwise to it 3*3 only
	int clockwise_tile_of[ BOARD_WIDTH * BOARD_HEIGHT ] =
	{
		1, 
		2,  	  // 012	  
		5,  	  // 345	  
		0,  	  // 678	  
		-1,  // never called with center square
		8, 
		3, 
		6, 
		7 
	};

	int tile_x[ BOARD_WIDTH * BOARD_HEIGHT ] =
	{
		/* TL_SPACE */ 1,
		/* TL_1 */ 0,    
		/* TL_2 */ 1,    
		/* TL_3 */ 2,    
		/* TL_4 */ 2,    
		/* TL_5 */ 2,    
		/* TL_6 */ 1,    
		/* TL_7 */ 0,    
		/* TL_8 */ 0,    
	};

	int tile_y[ BOARD_WIDTH * BOARD_HEIGHT ] =
	{
		/* TL_SPACE */ 1,	
		/* TL_1 */ 0,
		/* TL_2 */ 0,
		/* TL_3 */ 0,
		/* TL_4 */ 1,
		/* TL_5 */ 2,
		/* TL_6 */ 2,
		/* TL_7 */ 2,
		/* TL_8 */ 1,
	};

	s=0;
	
	// score 1 point if centre is not correct 
	if( tiles[(BOARD_HEIGHT*BOARD_WIDTH)/2] != nodeGoal.tiles[(BOARD_HEIGHT*BOARD_WIDTH)/2] )
	{
 		s = 1;
	}

	for( i=0; i<(BOARD_HEIGHT*BOARD_WIDTH); i++ )
	{
		// this loop adds up the totaldist element in h and
		// the sequence score in s

		// the space does not count
		if( tiles[i] == TL_SPACE )
		{
			continue;
		}

		// get correct x and y of this tile
		cx = tile_x[tiles[i]];
		cy = tile_y[tiles[i]];

		// get actual
		ax = i % BOARD_WIDTH;
		ay = i / BOARD_WIDTH;

		// add manhatten distance to h
		h += abs( cx-ax );
		h += abs( cy-ay );

		// no s score for center tile
		if( (ax == (BOARD_WIDTH/2)) && (ay == (BOARD_HEIGHT/2)) )
		{
			continue;
		}

		// score 2 points if not followed by successor
		if( correct_follower_to[ tiles[i] ] != tiles[ clockwise_tile_of[ i ] ] )
		{
			s += 2;
		}


	}

	// mult by 3 and add to h
	t = h + (3*s);

	return (float) t;

}

bool PuzzleState::IsGoal( PuzzleState &nodeGoal )
{
	return IsSameState( nodeGoal );
}

// Helper
// Return the x and y position of the space tile
void PuzzleState::GetSpacePosition( PuzzleState *pn, int *rx, int *ry )
{
	int x,y;

	for( y=0; y<BOARD_HEIGHT; y++ )
	{
		for( x=0; x<BOARD_WIDTH; x++ )
		{
			if( pn->tiles[(y*BOARD_WIDTH)+x] == TL_SPACE )
			{
				*rx = x;
				*ry = y;

				return;
			}
		}
	}

	assert( false && "Something went wrong. There's no space on the board" );

}

int PuzzleState::GetMap( int x, int y, TILE *tiles )
{

	if( x < 0 ||
	    x >= BOARD_WIDTH ||
		 y < 0 ||
		 y >= BOARD_HEIGHT
	  )
		return GM_OFF_BOARD;	 

	if( tiles[(y*BOARD_WIDTH)+x] == TL_SPACE )
	{
		return GM_SPACE;
	}

	return GM_TILE;
}

// Given a node set of tiles and a set of tiles to move them into, do the move as if it was on a tile board
// note : returns false if the board wasn't changed, and simply returns the tiles as they were in the target
// spx and spy is the space position while tx and ty is the target move from position

bool PuzzleState::LegalMove( TILE *StartTiles, TILE *TargetTiles, int spx, int spy, int tx, int ty )
{

	int t;
	
	if( GetMap( spx, spy, StartTiles ) == GM_SPACE )
	{
		if( GetMap( tx, ty, StartTiles ) == GM_TILE )
		{

			// copy tiles
			for( t=0; t<(BOARD_HEIGHT*BOARD_WIDTH); t++ )
			{
				TargetTiles[t] = StartTiles[t];
			}


			TargetTiles[ (ty*BOARD_WIDTH)+tx ] = StartTiles[ (spy*BOARD_WIDTH)+spx ];
			TargetTiles[ (spy*BOARD_WIDTH)+spx ] = StartTiles[ (ty*BOARD_WIDTH)+tx ];

			return true;
		}
	}


	return false;

}

// This generates the successors to the given PuzzleState. It uses a helper function called
// AddSuccessor to give the successors to the AStar class. The A* specific initialisation
// is done for each node internally, so here you just set the state information that
// is specific to the application
bool PuzzleState::GetSuccessors( AStarSearch<PuzzleState> *astarsearch, PuzzleState *parent_node )
{
	PuzzleState NewNode;

	int sp_x,sp_y;

	GetSpacePosition( this, &sp_x, &sp_y );

	bool ret;

	if( LegalMove( tiles, NewNode.tiles, sp_x, sp_y, sp_x, sp_y-1 ) == true )
	{
		ret = astarsearch->AddSuccessor( NewNode );

		if( !ret ) return false;
	}

	if( LegalMove( tiles, NewNode.tiles, sp_x, sp_y, sp_x, sp_y+1 ) == true )
	{
		ret = astarsearch->AddSuccessor( NewNode );
		
		if( !ret ) return false;
	}

	if( LegalMove( tiles, NewNode.tiles, sp_x, sp_y, sp_x-1, sp_y ) == true )
	{
		ret = astarsearch->AddSuccessor( NewNode );

		if( !ret ) return false;
	}

	if( LegalMove( tiles, NewNode.tiles, sp_x, sp_y, sp_x+1, sp_y ) == true )
	{
		ret = astarsearch->AddSuccessor( NewNode );
	
		if( !ret ) return false;
	}

	return true; 
}

// given this node, what does it cost to move to successor. In the case
// of our map the answer is the map terrain value at this node since that is 
// conceptually where we're moving

float PuzzleState::GetCost( PuzzleState &successor )
{
	return 1.0f; // I love it when life is simple

}


// Main

int main( int argc, char *argv[] )
{

	cout << "STL A* 8-puzzle solver implementation\n(C)2001 Justin Heyes-Jones\n";

	bool bUserBoard = false;

	if( argc > 1 )
	{
		char *userboard = argv[1];

		int i = 0;
		int c;

		while( c = argv[1][i] )
		{
			if( isdigit( c ) )
			{
				int num = (c - '0');

				PuzzleState::g_start[i] = static_cast<PuzzleState::TILE>(num);
				
			}
		
			i++;
		}


	}

	// Create an instance of the search class...

	AStarSearch<PuzzleState> astarsearch;

	int NumTimesToSearch = NUM_TIMES_TO_RUN_SEARCH;

	while( NumTimesToSearch-- )
	{

		// Create a start state
		PuzzleState nodeStart( PuzzleState::g_start );

		// Define the goal state
		PuzzleState nodeEnd( PuzzleState::g_goal );

		// Set Start and goal states
		astarsearch.SetStartAndGoalStates( nodeStart, nodeEnd );

		unsigned int SearchState;

		unsigned int SearchSteps = 0;

		do
		{
			SearchState = astarsearch.SearchStep();

#if DEBUG_LISTS

			float f,g,h;

			cout << "Search step " << SearchSteps << endl;

			cout << "Open:\n";
			PuzzleState *p = astarsearch.GetOpenListStart( f,g,h );
			while( p )
			{
				((PuzzleState *)p)->PrintNodeInfo();
				cout << "f: " << f << " g: " << g << " h: " << h << "\n\n";
				
				p = astarsearch.GetOpenListNext( f,g,h );
				
			}

			cout << "Closed:\n";
			p = astarsearch.GetClosedListStart( f,g,h );
			while( p )
			{
				p->PrintNodeInfo();
				cout << "f: " << f << " g: " << g << " h: " << h << "\n\n";
				
				p = astarsearch.GetClosedListNext( f,g,h );
			}

#endif

// Test cancel search
#if 0
			int StepCount = astarsearch.GetStepCount();
			if( StepCount == 10 )
			{
				astarsearch.CancelSearch();
			}
#endif
			SearchSteps++;
		}
		while( SearchState == AStarSearch<PuzzleState>::SEARCH_STATE_SEARCHING );

		if( SearchState == AStarSearch<PuzzleState>::SEARCH_STATE_SUCCEEDED )
		{
#if DISPLAY_SOLUTION_FORWARDS
			cout << "Search found goal state\n";
#endif
			PuzzleState *node = astarsearch.GetSolutionStart();

#if DISPLAY_SOLUTION_FORWARDS
			cout << "Displaying solution\n";
#endif
			int steps = 0;

#if DISPLAY_SOLUTION_FORWARDS
			node->PrintNodeInfo();
			cout << endl;
#endif
			for( ;; )
			{
				node = astarsearch.GetSolutionNext();

				if( !node )
				{
					break;
				}

#if DISPLAY_SOLUTION_FORWARDS
				node->PrintNodeInfo();
				cout << endl;
#endif
				steps ++;
			
			};

#if DISPLAY_SOLUTION_FORWARDS
			// todo move step count into main algorithm
			cout << "Solution steps " << steps << endl;
#endif

////////////

			node = astarsearch.GetSolutionEnd();

#if DISPLAY_SOLUTION_BACKWARDS
			cout << "Displaying reverse solution\n";
#endif
			steps = 0;

			node->PrintNodeInfo();
			cout << endl;
			for( ;; )
			{
				node = astarsearch.GetSolutionPrev();

				if( !node )
				{
					break;
				}
#if DISPLAY_SOLUTION_BACKWARDS
				node->PrintNodeInfo();
                cout << endl;
#endif
				steps ++;
			
			};

#if DISPLAY_SOLUTION_BACKWARDS
			cout << "Solution steps " << steps << endl;
#endif

//////////////

			// Once you're done with the solution you can free the nodes up
			astarsearch.FreeSolutionNodes();
		
		}
		else if( SearchState == AStarSearch<PuzzleState>::SEARCH_STATE_FAILED ) 
		{
#if DISPLAY_SOLUTION_INFO
			cout << "Search terminated. Did not find goal state\n";
#endif		
		}
		else if( SearchState == AStarSearch<PuzzleState>::SEARCH_STATE_OUT_OF_MEMORY ) 
		{
#if DISPLAY_SOLUTION_INFO
			cout << "Search terminated. Out of memory\n";
#endif		
		}

		

		// Display the number of loops the search went through
#if DISPLAY_SOLUTION_INFO
		cout << "SearchSteps : " << astarsearch.GetStepCount() << endl;
#endif
	}

	return 0;
}


