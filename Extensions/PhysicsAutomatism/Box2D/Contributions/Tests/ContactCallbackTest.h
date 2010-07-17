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

// Contributed by caspin.

#ifndef CONTACT_CB_H
#define CONTACT_CB_H

#include <set>
#include <deque>
#include <sstream>
#include <string>
#include <iostream>

bool key_comp( const ContactPoint& lhs, const ContactPoint& rhs )
{
	if( lhs.fixtureA < rhs.fixtureA ) return true;
	if( lhs.fixtureA == rhs.fixtureA && lhs.fixtureB < rhs.fixtureB ) return true;
	if( lhs.fixtureA == rhs.fixtureA && lhs.fixtureB == rhs.fixtureB && lhs.id.key < rhs.id.key ) return true;
	return false;
}

class ContactCB : public Test
{
public:

	ContactCB()
		: m_set(&key_comp)
	{
		b2PolygonDef sd;
		sd.friction = 0;
		sd.vertexCount = 3;

		sd.vertices[0].Set(10,10);
		sd.vertices[1].Set(9,7);
		sd.vertices[2].Set(10,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[0].Set(9,7);
		sd.vertices[1].Set(8,0);
		sd.vertices[2].Set(10,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[0].Set(9,7);
		sd.vertices[1].Set(8,5);
		sd.vertices[2].Set(8,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[0].Set(8,5);
		sd.vertices[1].Set(7,4);
		sd.vertices[2].Set(8,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[0].Set(7,4);
		sd.vertices[1].Set(5,0);
		sd.vertices[2].Set(8,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[0].Set(7,4);
		sd.vertices[1].Set(5,3);
		sd.vertices[2].Set(5,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[0].Set(5,3);
		sd.vertices[1].Set(2,2);
		sd.vertices[2].Set(5,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[0].Set(2,2);
		sd.vertices[1].Set(0,0);
		sd.vertices[2].Set(5,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[0].Set(2,2);
		sd.vertices[1].Set(-2,2);
		sd.vertices[2].Set(0,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[2].Set(-2,2);
		sd.vertices[1].Set(0,0);
		sd.vertices[0].Set(-5,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[2].Set(-5,3);
		sd.vertices[1].Set(-2,2);
		sd.vertices[0].Set(-5,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[2].Set(-7,4);
		sd.vertices[1].Set(-5,3);
		sd.vertices[0].Set(-5,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[2].Set(-7,4);
		sd.vertices[1].Set(-5,0);
		sd.vertices[0].Set(-8,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[2].Set(-8,5);
		sd.vertices[1].Set(-7,4);
		sd.vertices[0].Set(-8,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[2].Set(-9,7);
		sd.vertices[1].Set(-8,5);
		sd.vertices[0].Set(-8,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[2].Set(-9,7);
		sd.vertices[1].Set(-8,0);
		sd.vertices[0].Set(-10,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.vertices[2].Set(-10,10);
		sd.vertices[1].Set(-9,7);
		sd.vertices[0].Set(-10,0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.SetAsBox(.5,6,b2Vec2(10.5,6),0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		sd.SetAsBox(.5,6,b2Vec2(-10.5,6),0);
		m_world->GetGroundBody()->CreateFixture(&sd);

		b2BodyDef bd;
		bd.position.Set(9.5,60);
		b2Body* m_ball = m_world->CreateBody( &bd );

#if 1
		b2PolygonDef cd;
		cd.vertexCount = 8;
		float32 w = 0.95f;
		float32 b = w / (2.0f + sqrtf(2.0f));
		float32 s = sqrtf(2.0f) * b;
		cd.vertices[0].Set(0.5f * s, 0.0f);
		cd.vertices[1].Set(0.5f * w, b);
		cd.vertices[2].Set(0.5f * w, b + s);
		cd.vertices[3].Set(0.5f * s, w);
		cd.vertices[4].Set(-0.5f * s, w);
		cd.vertices[5].Set(-0.5f * w, b + s);
		cd.vertices[6].Set(-0.5f * w, b);
		cd.vertices[7].Set(-0.5f * s, 0.0f);
		cd.density = 1.0f;
#else
		b2CircleDef cd;
		cd.radius = 0.33f;
		cd.friction = 0;
		cd.density = 1;
#endif

		m_ball_shape = m_ball->CreateFixture(&cd);
		m_ball->SetMassFromShapes();
	}

	void Step(Settings* settings)
	{
		Test::Step(settings);
		std::ostringstream oss;
		oss << std::hex;

		for (int32 i=0; i< m_pointCount; ++i)
		{
#if 0
			if (m_points[i].shape1 > m_points[i].shape2)
			{
				b2Swap(m_points[i].shape1, m_points[i].shape2);
				m_points[i].normal *= -1.0f;
				m_points[i].velocity *= -1.0f;
			}
#endif
			oss.str("");
			switch( m_points[i].state )
			{
			case e_contactAdded:
				{
					if( ! m_set.insert( m_points[i] ).second )
					{
						oss << "ERROR ";
					}
					else
					{
						oss << "      ";
					}
					oss << "added:   " << m_points[i].fixtureA << " -> " << m_points[i].fixtureB;
					oss << " : " << m_points[i].id.key;
					m_strings.push_back( oss.str() );
					std::cout << oss.str() << std::endl;
					break;
				}
			case e_contactRemoved:
				{
					if( m_set.find( m_points[i] ) == m_set.end() )
					{
						oss << "ERROR ";
					}
					else
					{
						oss << "      ";
					}
					oss << "removed: " << m_points[i].fixtureA << " -> " << m_points[i].fixtureB;
					oss << " : " << m_points[i].id.key;
					m_strings.push_back( oss.str() );
					std::cout << oss.str() << std::endl;
					m_set.erase( m_points[i] );
					break;
				}
			case e_contactPersisted:
				{
					if( m_set.find( m_points[i] ) == m_set.end() )
					{
						oss << "ERROR persist: " << m_points[i].fixtureA << " -> ";
						oss << m_points[i].fixtureB << " : " << m_points[i].id.key;
						m_strings.push_back( oss.str() );
						std::cout << oss.str() << std::endl;
					}
					break;
				}
			}
		}
		while( m_strings.size() > 15 )
		{
			m_strings.pop_front();
		}

		for( unsigned i=0; i<m_strings.size(); ++i )
		{
			m_debugDraw.DrawString(5, m_textLine, m_strings[i].c_str() );
			m_textLine += 15;
		}
	}

	static Test* Create()
	{
		return new ContactCB;
	}

	b2Body* m_ball;
	b2Body* m_bullet;
	b2Fixture* m_ball_shape;
	std::set<ContactPoint,bool(*)(const ContactPoint&,const ContactPoint&)> m_set;
	std::deque<std::string> m_strings;

};

#endif // CONTACT_CB_H
