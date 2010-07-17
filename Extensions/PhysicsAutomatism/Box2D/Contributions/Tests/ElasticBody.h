/*
* Copyright (c) 2006-2009 Erin Catto http://www.gphysics.com
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

#ifndef ELASTIC_BODY_H
#define ELASTIC_BODY_H

class ElasticBody : public Test
{
public:
	b2Body* bodies[64];
    b2Body*  m_ground;
	b2Body*  m_elev;
	b2PrismaticJoint* m_joint_elev;
	/// Main...
	ElasticBody()
	{
		/// Bottom static body
		{ 
			b2PolygonDef sd;
			sd.SetAsBox(50.0f, 2.0f);
			sd.friction = 0.1f;
			sd.restitution = 0.1f;
			b2BodyDef bd;
			bd.position.Set(-1.0f, -7.5f);
			m_ground = m_world->CreateBody(&bd);
			m_ground->CreateFixture(&sd);
		}
		/// Upper static body
		{
            b2PolygonDef sd;
			sd.SetAsBox(20.0f, 0.50f,b2Vec2(0.f,0.f),0.047f*b2_pi);
			sd.friction    = 0.01f;
			sd.restitution = 0.001f;  
			b2BodyDef bd;
			bd.position.Set(-20.f, 93.0f);
			b2Body* g = m_world->CreateBody(&bd);
			g->CreateFixture(&sd);
			sd.SetAsBox(15.f, 0.50f,b2Vec2(-15.0f,12.5f),0.0f);
            g->CreateFixture(&sd);

            sd.SetAsBox(20.f,0.5f,b2Vec2(0.0f,-25.0f),-0.5f);
			g->CreateFixture(&sd);
        }
		/// Left channel left wall
		{
            b2PolygonDef sd;
			sd.SetAsBox(0.7f, 55.0f);
			sd.friction    = 0.1f;
			sd.restitution = 0.1f;  
			b2BodyDef bd;
			bd.position.Set(-49.3f, 50.0f);
			b2Body* g = m_world->CreateBody(&bd);
			g->CreateFixture(&sd);
        }
		/// Right wall
		{
            b2PolygonDef sd;
			sd.SetAsBox(0.7f, 55.0f);
			sd.friction    = 0.1f;
			sd.restitution = 0.1f;  
			b2BodyDef bd;
			bd.position.Set(45.f, 50.0f);
			b2Body* g = m_world->CreateBody(&bd);
			g->CreateFixture(&sd);
        }
		/// Left channel right upper wall  
		{
            b2PolygonDef sd;
			sd.SetAsBox(0.5f, 20.0f);
			sd.friction    = 0.05f;
			sd.restitution = 0.01f;  
			b2BodyDef bd;
			bd.position.Set(-42.0f, 70.0f);
		    bd.angle = -0.03f*b2_pi;
			b2Body* g = m_world->CreateBody(&bd);
			g->CreateFixture(&sd);
		}
		/// Left channel right lower wall
		{
            b2PolygonDef sd;
			sd.SetAsBox(0.50f, 23.0f);
			sd.friction    = 0.05f;
			sd.restitution = 0.01f;  
			b2BodyDef bd;
			bd.position.Set(-44.0f, 27.0f);
			b2Body* g = m_world->CreateBody(&bd);
			g->CreateFixture(&sd);
        /// Bottom motors
		    b2CircleDef cd;
			cd.radius   = 3.0f;
			cd.density  = 15.0f;
			cd.friction = 1.f;
			cd.restitution = 0.2f;
        /// 1. 
			bd.position.Set(-40.0f,2.5f);
			b2Body* body = m_world->CreateBody(&bd);
			body->CreateFixture(&cd);
            body->SetMassFromShapes(); 
            b2RevoluteJointDef jr;
			jr.Initialize (g,body,body->GetWorldCenter()+b2Vec2(0.f,1.f));
            jr.maxMotorTorque = 30000.f;
            jr.enableMotor    = true; 
            jr.motorSpeed     = 20.f;
			m_world->CreateJoint(&jr);
        /// 1. left down
			bd.position.Set(-46.0f,-2.5f);
            cd. radius = 1.5f;  jr.motorSpeed  = -20.f;
			body = m_world->CreateBody(&bd);
			body->CreateFixture(&cd);
            sd.SetAsBox(2.0f, 0.50f);
            body->CreateFixture(&sd);
            body->SetMassFromShapes(); 
			jr.Initialize (g,body,body->GetWorldCenter());
			m_world->CreateJoint(&jr);
        /// 2.
            cd.radius   = 3.0f; jr.motorSpeed  = 20.f;
			bd.position.Set(-32.0f,2.5f);
			body = m_world->CreateBody(&bd);
			body->CreateFixture(&cd);
            body->SetMassFromShapes(); 
			jr.Initialize (g,body,body->GetWorldCenter()+b2Vec2(0.f,1.f));
			m_world->CreateJoint(&jr);
        /// 3.
            jr.motorSpeed     = 20.f;
			bd.position.Set(-24.0f,1.5f);
			body = m_world->CreateBody(&bd);
			body->CreateFixture(&cd);
            body->SetMassFromShapes(); 
			jr.Initialize (g,body,body->GetWorldCenter()+b2Vec2(0.f,1.f));
			m_world->CreateJoint(&jr);
        /// 4.
			bd.position.Set(-16.0f,0.8f);
			body = m_world->CreateBody(&bd);
			body->CreateFixture(&cd);
            body->SetMassFromShapes(); 
			jr.Initialize (g,body,body->GetWorldCenter()+b2Vec2(0.f,1.f));
			m_world->CreateJoint(&jr);
        /// 5.
			bd.position.Set(-8.0f,0.5f);
			body = m_world->CreateBody(&bd);
			body->CreateFixture(&cd);
            body->SetMassFromShapes(); 
			jr.Initialize (g,body,body->GetWorldCenter()+b2Vec2(0.f,1.f));
			m_world->CreateJoint(&jr);
        /// 6.
			bd.position.Set(0.0f,0.1f);
			body = m_world->CreateBody(&bd);
			body->CreateFixture(&cd);
            body->SetMassFromShapes(); 
			jr.Initialize (g,body,body->GetWorldCenter()+b2Vec2(0.f,1.f));
			m_world->CreateJoint(&jr);
        /// 7.
			bd.position.Set(8.0f,-0.5f);
			body = m_world->CreateBody(&bd);
			body->CreateFixture(&cd);
			sd.SetAsBox(3.7f, 0.5f);
			body->CreateFixture(&sd);
            body->SetMassFromShapes(); 
			jr.Initialize (g,body,body->GetWorldCenter()+b2Vec2(0.f,1.f));
			m_world->CreateJoint(&jr);
        /// 8. right rotator
            sd.SetAsBox(5.f, 0.5f);
            sd.density = 2.0f;
			bd.position.Set(18.0f,1.f);
			b2Body* rightmotor = m_world->CreateBody(&bd);
			rightmotor->CreateFixture(&sd);
			sd.SetAsBox(4.5f, 0.5f, b2Vec2(0.f,0.f),b2_pi/3.f);
			rightmotor->CreateFixture(&sd);
			sd.SetAsBox(4.5f, 0.5f, b2Vec2(0.f,0.f),b2_pi*2.f/3.f);
			rightmotor->CreateFixture(&sd);
			cd.radius = 4.2f;
			rightmotor->CreateFixture(&cd);
            rightmotor->SetMassFromShapes(); 
			jr.Initialize (g,rightmotor,rightmotor->GetWorldCenter());
            jr.maxMotorTorque = 70000.f;
            jr.motorSpeed     = -4.f;
            m_world->CreateJoint(&jr);
        /// 9. left rotator
            sd.SetAsBox(8.5f, 0.5f);
            sd.density = 2.0f;
			bd.position.Set(-34.0f,17.f);
			body = m_world->CreateBody(&bd);
			body->CreateFixture(&sd);
			sd.SetAsBox(8.5f, 0.5f, b2Vec2(0.f,0.f),b2_pi*.5f);
			body->CreateFixture(&sd);
			cd.radius = 7.f;
			cd.friction = 0.9f;
			body->CreateFixture(&cd);
            body->SetMassFromShapes(); 
			jr.Initialize (g,body,body->GetWorldCenter());
            jr.maxMotorTorque = 100000.f;
            jr.motorSpeed     = -5.f;            
            m_world->CreateJoint(&jr);
        /// big compressor
            sd.SetAsBox(3.0f,4.f);
            sd.density = 10.0f;
			bd.position.Set(-16.0f,17.f);
			b2Body *hammerleft = m_world->CreateBody(&bd);
			hammerleft->CreateFixture(&sd);
			hammerleft->SetMassFromShapes();
			b2DistanceJointDef jd;
			jd.Initialize(body, hammerleft, body->GetWorldCenter()+b2Vec2(0.f,6.f), hammerleft->GetWorldCenter() );
			m_world->CreateJoint(&jd);

			bd.position.Set(4.0f,17.f);
			b2Body *hammerright = m_world->CreateBody(&bd);
			hammerright->CreateFixture(&sd);
			hammerright->SetMassFromShapes();
			jd.Initialize(body, hammerright, body->GetWorldCenter()-b2Vec2(0.f,6.f), hammerright->GetWorldCenter() );
			m_world->CreateJoint(&jd);
            /// pusher
            sd.SetAsBox(6.f,0.75f);
			bd.position.Set(-21.0f,9.f);
			b2Body* pusher = m_world->CreateBody(&bd);
			pusher->CreateFixture(&sd);
			sd.SetAsBox(2.f,1.5f,b2Vec2(-5.f,0.f),0.f);
			pusher->SetMassFromShapes();
			pusher->CreateFixture(&sd);
			jd.Initialize(rightmotor,pusher,rightmotor->GetWorldCenter()+b2Vec2(-8.0f,0.f),
				          pusher->GetWorldCenter()+b2Vec2(5.0f,0.f) );
			m_world->CreateJoint(&jd);
        }
        /// Static bodies above motors
       {
            b2PolygonDef sd;
			b2CircleDef  cd;
			sd.SetAsBox(9.0f, 0.5f);
			sd.friction    = 0.05f;
			sd.restitution = 0.01f;  
			b2BodyDef bd;
			bd.position.Set(-15.5f, 12.f);
            bd.angle = 0.0;
			b2Body* g = m_world->CreateBody(&bd);
			g->CreateFixture(&sd);
		    
			sd.SetAsBox(8.f, 0.5f, b2Vec2(23.f,0.f),0.f);
			g->CreateFixture(&sd);
            /// compressor statics  
			sd.SetAsBox(7.0f, 0.5f, b2Vec2(-2.f,9.f),0.f);
			g->CreateFixture(&sd);
			sd.SetAsBox(9.0f, 0.5f, b2Vec2(22.f,9.f),0.f);
			g->CreateFixture(&sd);

			sd.SetAsBox(19.0f, 0.5f, b2Vec2(-9.f,15.f),-0.05f);
			g->CreateFixture(&sd);
			sd.SetAsBox(4.7f, 0.5f, b2Vec2(15.f,11.5f),-0.5f);
			g->CreateFixture(&sd);
            /// below compressor
			sd.SetAsBox(26.0f, 0.3f, b2Vec2(17.f,-4.4f),-0.02f);
			g->CreateFixture(&sd);
			cd.radius   = 1.0f;	cd.friction = 1.0;
			cd.localPosition = b2Vec2(29.f,-6.f);
            g->CreateFixture(&cd); 
            cd.radius   = 0.7f;
			cd.localPosition = b2Vec2(-2.f,-4.5f);
            g->CreateFixture(&cd);
        }
        /// Elevator
        {
            b2BodyDef  bd;	
            b2CircleDef cd;
            b2PolygonDef sd;

			bd.position.Set(40.0f,4.0f);
			m_elev = m_world->CreateBody(&bd);

			sd.SetAsBox(0.5f, 2.5f,b2Vec2(3.0f,-3.0f), 0.f);
			sd.density     = 1.f;
			sd.friction    = 0.01f;
			m_elev->CreateFixture(&sd);
			sd.SetAsBox(7.0f, 0.5f, b2Vec2(-3.5f,-5.5f), 0.f);
			m_elev->CreateFixture(&sd);
			sd.SetAsBox(0.5f, 2.5f, b2Vec2(-11.f,-3.5f), 0.f);
			m_elev->CreateFixture(&sd);
            m_elev->SetMassFromShapes();           
		    
			b2PrismaticJointDef jp;
			jp.Initialize(m_ground,m_elev, bd.position, b2Vec2(0.0f, 1.0f));
			jp.lowerTranslation =  0.0f;
			jp.upperTranslation = 100.0f;
			jp.enableLimit = true;		
			jp.enableMotor = true;
			jp.maxMotorForce = 10000.f;
			jp.motorSpeed    = 0.f; 
			m_joint_elev = (b2PrismaticJoint*)m_world->CreateJoint(&jp);			  
            
			/// Korb
            sd.SetAsBox(2.3f, 0.5f,b2Vec2(1.f,0.0f), 0.0f);
            sd.density = 0.5f;
            bd.position.Set(29.0f,6.5f);
			b2Body* body = m_world->CreateBody(&bd);
			body->CreateFixture(&sd);
            sd.SetAsBox(2.5f, 0.5f,b2Vec2(3.0f,-2.f), b2_pi/2.f);
            body->CreateFixture(&sd);
            sd.SetAsBox(4.6f, 0.5f,b2Vec2(7.8f,-4.0f), 0.f);
            body->CreateFixture(&sd);
            sd.SetAsBox(0.5f, 4.5f,b2Vec2(12.f,0.0f), 0.f);
            body->CreateFixture(&sd);
            
			sd.SetAsBox(0.5f, 0.5f,b2Vec2(13.f,4.0f), 0.f);
            body->CreateFixture(&sd);

            cd.radius   = 0.7f; cd.density  = 1.f; cd.friction = 0.01f;
            cd.localPosition = b2Vec2(0.f,0.f);
            body->CreateFixture(&cd);
            body->SetMassFromShapes();  

            b2RevoluteJointDef jr;
            jr.Initialize(m_elev,body, bd.position);
            jr.enableLimit = true;
            jr.lowerAngle  = -0.2f;
            jr.upperAngle  = b2_pi*1.1f;
            jr.collideConnected = true;
            m_world->CreateJoint(&jr);
            /// upper body exit
            sd.SetAsBox(14.0f, 0.5f,b2Vec2(-3.5f,-10.0f), 0.0f);
            bd.position.Set(17.5f,96.0f);
            body = m_world->CreateBody(&bd);
            body->CreateFixture(&sd);
		}
		/// "Elastic body" 64 bodies - something like a lin. elastic compound
		/// connected via dynamic forces (springs) 
		{
			b2PolygonDef sd;
			sd.SetAsBox(0.55f, 0.55f);
			sd.density    = 1.5f;
			sd.friction   = 0.01f;
			sd.filter.groupIndex = -1;
			b2Vec2       startpoint(30.f,20.f);
			b2BodyDef    bd;
			bd.isBullet   = false;
  	 	    bd.allowSleep = false;	
			for (int i = 0; i < 8; ++i) 
            {
				for (int j = 0; j < 8; ++j) 
                {
					bd.position.Set(j*1.02f, 2.51f + 1.02f * i);
					bd.position  += startpoint;
					b2Body* body  = m_world->CreateBody(&bd);
					bodies[8*i+j] = body;
					body->CreateFixture(&sd);
					body->SetMassFromShapes();
				}
			}
		}
	}
	///  Apply dynamic forces (springs) and check elevator state
	void Step(Settings* settings)
	{
		Test::Step(settings);
		for (int i=0; i<8; ++i){
			for (int j=0; j<8; ++j){
				b2Vec2 zero(0.0f,0.0f);
				b2Vec2 down(0.0f, -0.5f);
				b2Vec2 up(0.0f, 0.5f);
				b2Vec2 right(0.5f, 0.0f);
				b2Vec2 left(-0.5f, 0.0f);
				int ind = i*8+j;
				int indr = ind+1;
				int indd = ind+8;
				float32 spring = 500.0f;
				float32 damp = 5.0f;
				if (j<7) {
					AddSpringForce(*(bodies[ind]),zero,*(bodies[indr]),zero,spring, damp, 1.0f);
					AddSpringForce(*(bodies[ind]),right,*(bodies[indr]),left,0.5f*spring, damp, 0.0f);
				}
				if (i<7) {
					AddSpringForce(*(bodies[ind]),zero,*(bodies[indd]),zero,spring, damp, 1.0f);
					AddSpringForce(*(bodies[ind]),up,*(bodies[indd]),down,0.5f*spring,damp,0.0f);
				}
				int inddr = indd + 1;
				int inddl = indd - 1;
				float32 drdist = sqrtf(2.0f);
				if (i < 7 && j < 7){
					AddSpringForce(*(bodies[ind]),zero,*(bodies[inddr]),zero,spring, damp, drdist);
				}
				if (i < 7 && j > 0){
					AddSpringForce(*(bodies[ind]),zero,*(bodies[inddl]),zero,spring, damp, drdist);
				}

				indr = ind+2;
				indd = ind+8*2;
				if (j<6) {
					AddSpringForce(*(bodies[ind]),zero,*(bodies[indr]),zero,spring, damp, 2.0f);
				}
				if (i<6) {
					AddSpringForce(*(bodies[ind]),zero,*(bodies[indd]),zero,spring,damp,2.0f);
				}

				inddr = indd + 2;
				inddl = indd - 2;
				drdist = sqrtf(2.0f)*2.0f;
				if (i < 6 && j < 6){
					AddSpringForce(*(bodies[ind]),zero,*(bodies[inddr]),zero,spring, damp, drdist);
				}
				if (i < 6 && j > 1){
					AddSpringForce(*(bodies[ind]),zero,*(bodies[inddl]),zero,spring, damp, drdist);
				}
			}
		}
		/// Check if bodies are near elevator
		///  Look if the body to lift is near the elevator
		b2Vec2 p1 = bodies[0]->GetWorldCenter(); 
        b2Vec2 p2 = bodies[63]->GetWorldCenter(); 
		///    m_elev:   elevator prism. joint
		b2Vec2 e = m_elev->GetWorldCenter() + b2Vec2(0.f,7.f);  
		// maybe not the best way to do it...
		// Bodies reached the elevator side 
		if ( p1.x>e.x || p2.x>e.x )	{
  		    // go up
			if ( ( p1.y<e.y || p2.y<e.y ) &&
				 ( m_joint_elev->GetJointTranslation()<=m_joint_elev->GetLowerLimit()+1.f ) ) 
			{
				m_joint_elev->SetMotorSpeed(20.f);
                //printf("lift goes up trans: %G\n",m_joint_elev->GetJointTranslation());
			}
		}
		// go down
		if ( (m_joint_elev->GetJointTranslation()>=m_joint_elev->GetUpperLimit()-2.f) ) 
		{
               m_joint_elev->SetMotorSpeed(-15.f);
               //printf("lift goes down: %G\n",m_joint_elev->GetJointTranslation());
		}
	}
   /// Add a spring force
   void AddSpringForce(b2Body& bA, b2Vec2& localA, b2Body& bB, b2Vec2& localB, float32 k, float32 friction, float32 desiredDist)
   {
        b2Vec2 pA = bA.GetWorldPoint(localA);
        b2Vec2 pB = bB.GetWorldPoint(localB);
        b2Vec2 diff = pB - pA;
        //Find velocities of attach points
        b2Vec2 vA = bA.GetLinearVelocity() - b2Cross(bA.GetWorldVector(localA), bA.GetAngularVelocity());
        b2Vec2 vB = bB.GetLinearVelocity() - b2Cross(bB.GetWorldVector(localB), bB.GetAngularVelocity());
        b2Vec2 vdiff = vB-vA;
        float32 dx = diff.Normalize(); //normalizes diff and puts length into dx
        float32 vrel = vdiff.x*diff.x + vdiff.y*diff.y;
        float32 forceMag = -k*(dx-desiredDist) - friction*vrel;
        diff *= forceMag; // diff *= forceMag
        bB.ApplyForce(diff, bA.GetWorldPoint(localA));
        diff *= -1.0f;
        bA.ApplyForce(diff, bB.GetWorldPoint(localB));
    }
    /// Default constructor
	static Test* Create()
	{
		return new ElasticBody;
	}
};

#endif
