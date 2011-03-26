/**


This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
Game Develop - A Star Automatism Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)
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

#ifndef PHYSICAUTOMATISM_H
#define PHYSICAUTOMATISM_H

#include "GDL/Automatism.h"
#include "GDL/Object.h"
#include "SceneAStarDatas.h"
#include <boost/weak_ptr.hpp>
#include <iostream>
#include <map>
#include <set>
#include "GDL/RuntimeScene.h"
class TiXmlElement;
class Scene;
class AStarAutomatismEditor;

/**
 * Automatism that position object on a predefined path.
 */
class GD_EXTENSION_API AStarAutomatism : public Automatism, public boost::enable_shared_from_this<AStarAutomatism>
{
    friend class AStarAutomatismEditor;

    public:
        AStarAutomatism(std::string automatismTypeName);
        virtual ~AStarAutomatism();
        virtual boost::shared_ptr<Automatism> Clone() { return boost::shared_ptr<Automatism>(new AStarAutomatism(*this));}

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
        virtual void EditAutomatism( wxWindow* parent, Game & game_, Scene * scene, MainEditorCommand & mainEditorCommand_ );
        #endif

        /**
         * Access to the object owning the automatism
         */
        inline Object * GetObject() {return object;};

        /**
         * Access to the object owning the automatism
         */
        inline const Object * GetObject() const {return object;};

        /**
         * Reset path
         */
        void Reset();

        /**
         * Change segment of the path where the object is
         */
        void EnterSegment(unsigned int segmentNumber);

        /**
         * Get the cost of the object when considered as an obstacle
         */
        unsigned int GetCost() const { return cost; };

        /**
         * Change the cost of the object when considered as an obstacle
         */
        void SetCost(unsigned int cost_) { cost = cost_; };

        static std::map < const Scene* , SceneAStarDatas > scenesPathDatas; ///< Static map associating scene to datas

        bool ActSetDestination( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActSetSpeed( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondSpeed( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActSetCost( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondCost( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondPathFound( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action ) { return !path.empty(); };
        bool CondDestinationReached( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action ) { return currentSegment >= path.size(); };

        double ExpSpeed( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpCost( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpLastNodeX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpLastNodeY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpNextNodeX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpNextNodeY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpDestinationX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpDestinationY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

        bool CondGridWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActSetGridWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondGridHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActSetGridHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        double ExpGridWidth( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGridHeight( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

    private:

        virtual void DoStepPreEvents(RuntimeScene & scene);

        /**
         * Compute the path thanks to A* algorithm
         */
        void ComputePath();

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

        boost::shared_ptr<RuntimeSceneAStarDatas> runtimeScenesAStarDatas;
};

#endif // PHYSICAUTOMATISM_H
