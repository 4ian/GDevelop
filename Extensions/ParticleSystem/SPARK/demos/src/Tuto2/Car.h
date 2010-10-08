//////////////////////////////////////////////////////////////////////////////////
// SPARK particle engine														//
// Copyright (C) 2008-2009 - Julien Fryer - julienfryer@gmail.com				//
//																				//
// This software is provided 'as-is', without any express or implied			//
// warranty.  In no event will the authors be held liable for any damages		//
// arising from the use of this software.										//
//																				//
// Permission is granted to anyone to use this software for any purpose,		//
// including commercial applications, and to alter it and redistribute it		//
// freely, subject to the following restrictions:								//
//																				//
// 1. The origin of this software must not be misrepresented; you must not		//
//    claim that you wrote the original software. If you use this software		//
//    in a product, an acknowledgment in the product documentation would be		//
//    appreciated but is not required.											//
// 2. Altered source versions must be plainly marked as such, and must not be	//
//    misrepresented as being the original software.							//
// 3. This notice may not be removed or altered from any source distribution.	//
//////////////////////////////////////////////////////////////////////////////////


#ifndef H_SPK_CAR
#define H_SPK_CAR

#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>

#include <SPK.h>
#include <SPK_SFML.h>

class Car
{
public :

	Car();
	
	void init(size_t textureType,const sf::Vector2f& pos);
	void update(float deltaTime);

	bool checkCollisionWithBox(sf::Vector2f& impact);
	bool checkCollisionWithCar(Car& car,sf::Vector2f& impact);

	static void setCollisionBox(const sf::FloatRect& box);
	static bool loadCarTexture();
	static void loadBaseParticleSystem(sf::Image& smoke);

	inline const sf::Sprite& getSprite() const;
	inline const SPK::SFML::SFMLSystem& getParticleSystem() const;

private :

	static const sf::Vector2f TURN_RADIUS_RANGE;
	static const sf::Vector2f TURN_TIME_RANGE;

	static const float RADIUS;
	static const float MAX_SPEED;
	static const float ACCELERATION;

	static const float MAX_SHAKE;

	static const float PI;

	static SPK::SPK_ID baseParticleSystemID;

	static sf::FloatRect collisionBox;
	static sf::Image texture;

	sf::Vector2f pos;
	sf::Vector2f dir;

	sf::Vector2f shake;
	float dirShake;

	float speed;
	
	float turnRadius;
	float turnTime;

	bool reverse;

	sf::Sprite sprite;
	size_t textureType;

	SPK::SFML::SFMLSystem* particleSystem;

	void setTextureCoord();
	void resultFromCollision(const sf::Vector2f& impact,bool forceReverse);

	void createParticleSystem();
	void updateParticleSystem(float deltaTime,float angle,float power);
};

inline const sf::Sprite& Car::getSprite() const
{
	return sprite;
}

inline const SPK::SFML::SFMLSystem& Car::getParticleSystem() const
{
	return *particleSystem;
}


#endif