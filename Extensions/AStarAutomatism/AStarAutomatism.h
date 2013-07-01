/**


This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
Game Develop - A Star Automatism Extension
Copyright (c) 2010-2013 Florian Rival (Florian.Rival@gmail.com)
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

#ifndef ASTARAUTOMATISM_H
#define ASTARAUTOMATISM_H

#include "GDCpp/Automatism.h"
#include "GDCpp/RuntimeObject.h"
#include <SFML/System/Vector2.hpp>
#include <map>
#include <set>
class RuntimeScene;
class TiXmlElement;
namespace gd { class Layout; }
class AStarAutomatismEditor;
class RuntimeSceneAStarDatas;

/**
 * Automatism that position object on a predefined path.
 */
class GD_EXTENSION_API AStarAutomatism : public Automatism
{
friend class AStarAutomatismEditor;

public:
    AStarAutomatism();
    virtual ~AStarAutomatism();
    virtual Automatism* Clone() const { return new AStarAutomatism(*this);}

    #if defined(GD_IDE_ONLY)
    /**
     * Save Automatism to XML
     */
    virtual void SaveToXml(TiXmlElement * elem) const;
    #endif

    /**
     * Load Automatism from XML
     */
    virtual void LoadFromXml(const TiXmlElement * elem);

    #if defined(GD_IDE_ONLY)
    /**
     * Called when user wants to edit the automatism.
     */
    virtual void EditAutomatism( wxWindow* parent, gd::Project & game_, gd::Layout * scene, gd::MainFrameWrapper & mainFrameWrapper_ );
    #endif

    /**
     * Access to the object owning the automatism
     */
    inline RuntimeObject * GetObject() {return object;};

    /**
     * Access to the object owning the automatism
     */
    inline const RuntimeObject * GetObject() const {return object;};

    /**
     * Reset path
     */
    void Reset();

    void MoveTo( RuntimeScene & scene, float destinationX_, float destinationY_ );

    /**
     * Change segment of the path where the object is
     */
    void EnterSegment(unsigned int segmentNumber);

    unsigned int GetCurrentSegment() const { return currentSegment; }

    /**
     * Get the cost of the object when considered as an obstacle
     */
    unsigned int GetCost() const { return cost; };

    /**
     * Change the cost of the object when considered as an obstacle
     */
    void SetCost(unsigned int cost_) { cost = cost_; };

    void SetSpeed(float speed_) { speed = speed_; };
    float GetSpeed() const { return speed; };

    float GetDestinationX() const { return destinationX; };
    float GetDestinationY() const { return destinationY; };

    double GetLastNodeX()
    {
        return path.empty() ? object->GetX() : path[currentSegment].x;
    }

    double GetLastNodeY()
    {
        return path.empty() ? object->GetY() : path[currentSegment].y;
    }

    double GetNextNodeX()
    {
        return !path.empty() && currentSegment < path.size()-1 ? path[currentSegment+1].x : destinationX;
    }
    double GetNextNodeY()
    {
        return !path.empty() && currentSegment < path.size()-1 ? path[currentSegment+1].y : destinationY;
    }

    bool PathFound() { return !path.empty(); };
    bool DestinationReached() { return currentSegment >= path.size(); };

    void SetLeftBorder(unsigned int leftBorder_) { leftBorder = leftBorder_; };
    unsigned int GetLeftBorder() const { return leftBorder; };

    void SetRightBorder(unsigned int rightBorder_) { rightBorder = rightBorder_; };
    unsigned int GetRightBorder() const { return rightBorder; };

    void SetTopBorder(unsigned int topBorder_) { topBorder = topBorder_; };
    unsigned int GetTopBorder() const { return topBorder; };

    void SetBottomBorder(unsigned int bottomBorder_) { bottomBorder = bottomBorder_; };
    unsigned int GetBottomBorder() const { return bottomBorder; };

    /** Used only by GD events generated code
     */
    void SetGridWidth( RuntimeScene & scene, float gridWidth );

    /** Used only by GD events generated code
     */
    void SetGridHeight( RuntimeScene & scene, float gridHeight );

    /** Used only by GD events generated code
     */
    float GetGridWidth( RuntimeScene & scene );

    /** Used only by GD events generated code
     */
    float GetGridHeight( RuntimeScene & scene );

    unsigned int leftBorder;
    unsigned int rightBorder;
    unsigned int topBorder;
    unsigned int bottomBorder;
private:

    virtual void DoStepPreEvents(RuntimeScene & scene);

    /**
     * Compute the path thanks to A* algorithm
     */
    void ComputePath(RuntimeScene & scene);

    //Path related members
    //sf::Vector2f has been choosen to represent position, but any simple vector2 class would do the job.
    std::vector<sf::Vector2f> path; ///< Path computed by the algorithm
    sf::Vector2f offset; ///< Position on the path
    float speed;
    float timeOnSegment;
    float totalSegmentTime;
    unsigned int currentSegment;

    //A* Algorithm related members
    float destinationX;
    float destinationY;
    unsigned int cost;

    RuntimeSceneAStarDatas* runtimeScenesAStarDatas;
};

#endif // ASTARAUTOMATISM_H

