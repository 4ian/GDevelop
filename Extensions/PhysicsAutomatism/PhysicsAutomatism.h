/**

Game Develop - Physic Automatism Extension
Copyright (c) 2010 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef PHYSICAUTOMATISM_H
#define PHYSICAUTOMATISM_H

#include "GDL/Automatism.h"
#include "GDL/Object.h"
#include "Box2D/Box2D.h"
#include "ScenePhysicsDatas.h"
#include <boost/weak_ptr.hpp>
#include <iostream>
#include <map>
#include <set>
#include "GDL/RuntimeScene.h"
class TiXmlElement;
class Scene;
class PhysicsAutomatismEditor;

class PhysicsAutomatism : public Automatism
{
    friend class PhysicsAutomatismEditor;

    public:
        PhysicsAutomatism(std::string automatismTypeName);
        virtual ~PhysicsAutomatism();
        virtual boost::shared_ptr<Automatism> Clone() { return boost::shared_ptr<Automatism>(new PhysicsAutomatism(*this));}

        #if defined(GDE)
        /**
         * Save Automatism to XML
         */
        virtual void SaveToXml(TiXmlElement * elem) const;
        #endif

        /**
         * Load Automatism from XML
         */
        virtual void LoadFromXml(const TiXmlElement * elem);

        #if defined(GDE)
        /**
         * Called when user wants to edit the automatism.
         */
        virtual void EditAutomatism( wxWindow* parent, Game & game_, Scene * scene, MainEditorCommand & mainEditorCommand_ );
        #endif

        b2Body * GetBox2DBody(const RuntimeScene & scene) { if (!body) CreateBody(scene); return body; }
        inline Object * GetObject() {return object;};
        inline const Object * GetObject() const {return object;};

        std::set<PhysicsAutomatism*> currentContacts; ///< List of other bodies that are in contact with this body.

        bool ActSetStatic( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActSetDynamic( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondIsDynamic( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action ) { return dynamic; };
        bool ActSetFixedRotation( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActSetFreeRotation( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondIsFixedRotation( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action ) { return fixedRotation; };
        bool ActSetAsBullet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActDontSetAsBullet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondIsBullet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action ) { return isBullet; };
        bool ActApplyForce( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActApplyTorque( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActAngularDamping( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActLinearDamping( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActAngularVelocity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActLinearVelocity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActAddRevoluteJointBetweenObjects( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActAddRevoluteJoint( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActSetGravity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActApplyForceTowardPosition( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActAddGearJointBetweenObjects( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActApplyForceUsingPolarCoordinates( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );


        bool CondAngularDamping( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondLinearDamping( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondAngularVelocity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondLinearVelocityY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondLinearVelocityX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondCollisionWith( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

        double ExpLinearVelocityX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpLinearVelocityY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpAngularVelocity( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpLinearDamping( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpAngularDamping( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

        static std::map < const Scene* , ScenePhysicsDatas > scenesPhysicsDatas; ///< Static map associating scene to datas
    private:

        virtual void DoStepPreEvents(RuntimeScene & scene);
        virtual void DoStepPostEvents(RuntimeScene & scene);
        void CreateBody(const RuntimeScene & scene);

        enum ShapeType {Box, Circle} shapeType;
        bool dynamic; ///< Is the object static or dynamic
        bool fixedRotation; ///< Is the rotation fixed or not
        bool isBullet; ///< True if the object as to be considered as a bullet ( for better collision handling )
        float massDensity;
        float averageFriction;
        float averageRestitution;
        float linearDamping;
        float angularDamping;

        float objectOldX;
        float objectOldY;
        float objectOldAngle;
        float objectOldWidth;
        float objectOldHeight;

        b2Body * body; ///< Box2D body, representing the object in the Box2D world
        boost::shared_ptr<RuntimeScenePhysicsDatas> runtimeScenesPhysicsDatas;
};

#endif // PHYSICAUTOMATISM_H
