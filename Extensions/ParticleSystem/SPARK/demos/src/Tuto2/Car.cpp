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

#include <stdio.h>
#include <math.h>
#include "Car.h"

using namespace std;
using namespace sf;

const Vector2f Car::TURN_RADIUS_RANGE(32.0f,512.0f);
const Vector2f Car::TURN_TIME_RANGE(0.5f,2.0f);

const float Car::RADIUS(24.0f);
const float Car::MAX_SPEED(200.0f);
const float Car::ACCELERATION(100.0f);

const float Car::MAX_SHAKE(3.0f);

const float Car::PI = 3.14159265358979323846f;

SPK::SPK_ID Car::baseParticleSystemID = SPK::NO_ID;

FloatRect Car::collisionBox;
Image Car::texture;

Car::Car() :
	textureType(0),
	pos(),
	dir(),
	speed(0.0f),
	sprite(),
	turnRadius(0.0f),
	turnTime(0.0f),
	reverse(false),
	shake(),
	dirShake(1.0f),
	particleSystem(NULL)
{}

void Car::init(size_t textureType,const Vector2f& pos)
{
	this->textureType = textureType;
	this->pos = pos;

	dir.x = Randomizer::Random(-1000.0f,1000.0f);
	dir.y = Randomizer::Random(-1000.0f,1000.0f);

	float normDir = sqrt(dir.x * dir.x + dir.y * dir.y);
	dir.x /= normDir;
	dir.y /= normDir;

	sprite.SetImage(texture);
	sprite.SetCenter(32.0f,32.0f);

	IntRect textCoord(
		0,
		textureType << 8,
		64,
		(textureType << 8) + 64);
	sprite.SetSubRect(textCoord);

	setTextureCoord();
	createParticleSystem();
}

void Car::update(float deltaTime)
{
	turnTime -= deltaTime;
	
	bool nearBorder = false;
	Vector2f realDir(dir);
	if (reverse)
	{
		realDir.x = -realDir.x;
		realDir.y = -realDir.y;
	}
	
	if ((pos.x < collisionBox.Left + 128.0f)&&(realDir.x < 0.0f))
	{
		turnRadius = pos.x - collisionBox.Left - RADIUS;
		if (turnRadius < TURN_RADIUS_RANGE.x)
			turnRadius = TURN_RADIUS_RANGE.x;
		if (realDir.y > 0.0f)
			turnRadius = -turnRadius;
		nearBorder = true;
	}

	if ((pos.y < collisionBox.Top + 128.0f)&&(realDir.y < 0.0f))
	{
		turnRadius = pos.y - collisionBox.Top - RADIUS;
		if (turnRadius < TURN_RADIUS_RANGE.x)
			turnRadius = TURN_RADIUS_RANGE.x;
		if (realDir.x < 0.0f)
			turnRadius = -turnRadius;
		nearBorder = true;
	}

	if ((pos.x > collisionBox.Right - 128.0f)&&(realDir.x > 0.0f))
	{
		turnRadius = collisionBox.Right - pos.x - RADIUS;
		if (turnRadius < TURN_RADIUS_RANGE.x)
			turnRadius = TURN_RADIUS_RANGE.x;
		if (realDir.y < 0.0f)
			turnRadius = -turnRadius;
		nearBorder = true;
	}

	if ((pos.y > collisionBox.Bottom - 128.0f)&&(realDir.y > 0.0f))
	{
		turnRadius = collisionBox.Bottom - pos.y - RADIUS;
		if (turnRadius < TURN_RADIUS_RANGE.x)
			turnRadius = TURN_RADIUS_RANGE.x;
		if (realDir.x > 0.0f)
			turnRadius = -turnRadius;
		nearBorder = true;
	}

	if (!nearBorder)
	{
		if (turnTime <= 0.0f)
		{
			turnTime = Randomizer::Random(TURN_TIME_RANGE.x,TURN_TIME_RANGE.y);
			turnRadius = Randomizer::Random(TURN_RADIUS_RANGE.x,TURN_RADIUS_RANGE.y);
			if (Randomizer::Random(0,1))
				turnRadius = -turnRadius;
		}
	}

	if (reverse)
	{
		speed -= ACCELERATION * deltaTime;
		if (speed <= -MAX_SPEED / 2.0f)
		{
			turnTime = 0.0f;
			reverse = false;
			speed = -MAX_SPEED / 2.0f;
		}
	}
	else
	{
		speed += ACCELERATION * deltaTime;
		if (speed > MAX_SPEED)
			speed = MAX_SPEED;
	}

	float move = speed * deltaTime;
	Vector2f turnPoint(pos.x - dir.y * turnRadius,pos.y + dir.x * turnRadius);

	float angle = move / turnRadius;

	Vector2f posPrime = pos - turnPoint;
	Vector2f newPos(
		posPrime.x * cos(angle) - posPrime.y * sin(angle),
		posPrime.y * cos(angle) + posPrime.x * sin(angle));
	
	Vector2f delta = turnPoint + newPos - pos;
	pos.x += delta.x;
	pos.y += 0.75f * delta.y;

	posPrime = pos - turnPoint;
	dir.x = -posPrime.y;
	dir.y = posPrime.x;
	if (turnRadius <= 0.0f)
		dir = -dir;

	float normDir = sqrt(dir.x * dir.x + dir.y * dir.y);
	dir.x /= normDir;
	dir.y /= normDir;

	setTextureCoord();

	shake.y += abs(move) * dirShake * 0.4f;
	if (shake.y <= 0.0f)
	{
		shake.y = 0.0f;
		dirShake = 1.0f;
	}
	else if (shake.y > MAX_SHAKE * abs(speed) / MAX_SPEED)
	{
		shake.y = MAX_SHAKE * abs(speed) / MAX_SPEED;
		dirShake = -1.0f;
	}
	sprite.SetPosition(pos - shake);

	angle = atan2(dir.x,dir.y);
	updateParticleSystem(deltaTime,angle,abs(speed));
}

bool Car::checkCollisionWithBox(Vector2f& impact)
{
	Vector2f offsetImpact;
	bool collision = false;

	if (pos.x - RADIUS < collisionBox.Left)
	{
		collision = true;
		pos.x = collisionBox.Left + RADIUS;
		offsetImpact.x -= RADIUS;
	}

	if (pos.x + RADIUS > collisionBox.Right)
	{
		collision = true;
		pos.x = collisionBox.Right - RADIUS;
		offsetImpact.x += RADIUS;
	}

	if (pos.y - RADIUS < collisionBox.Top)
	{
		collision = true;
		pos.y = collisionBox.Top + RADIUS;
		offsetImpact.y -= RADIUS;
	}

	if (pos.y + RADIUS > collisionBox.Bottom)
	{
		collision = true;
		pos.y = collisionBox.Bottom - RADIUS;
		offsetImpact.y += RADIUS;
	}

	if (collision)
	{
		impact = pos;
		impact += offsetImpact;
		resultFromCollision(impact,true);
	}

	return collision;
}


bool Car::checkCollisionWithCar(Car& car,Vector2f& impact)
{
	float dist2 = (pos.x - car.pos.x) * (pos.x - car.pos.x) + (pos.y - car.pos.y) * (pos.y - car.pos.y);
	if (dist2 < 4.0f * RADIUS * RADIUS)
	{
		dist2 = sqrt(dist2);
		Vector2f delta = pos - car.pos;
		impact = (pos + car.pos) / 2.0f;

		float ratio = (RADIUS + 1.0f) / dist2;
		delta.x *= ratio;
		delta.y *= ratio;

		pos = impact + delta;
		car.pos = impact - delta;

		resultFromCollision(impact,false);
		car.resultFromCollision(impact,false);

		return true;
	}

	return false;
}

void Car::setCollisionBox(const FloatRect& box)
{
	collisionBox = box;
}

bool Car::loadCarTexture()
{
	return texture.LoadFromFile("res/cars.png");
}

void Car::setTextureCoord()
{
	float angle = atan2(-dir.x,dir.y);
	if (angle < 0.0f)
		angle += 2.0f * PI;

	int textureIndex = (static_cast<int>((angle + PI / 32.0f) * 16.0f / PI) + 1) & 31;
	IntRect textCoord(
		(textureIndex & 7) << 6,
		(textureType << 8) + ((textureIndex >> 3) << 6),
		((textureIndex & 7) << 6) + 64,
		(textureType << 8) + ((textureIndex >> 3) << 6) + 64);
	sprite.SetSubRect(textCoord);
}

void Car::resultFromCollision(const Vector2f& impact,bool forceReverse)
{
	Vector2f tmp = pos - impact;
	float scalar = tmp.x * dir.x + tmp.y * dir.y;
	if (reverse)
		scalar = - scalar;

	if ((scalar < 0.0f)||(forceReverse))
	{
		speed = 0.0f;	
		reverse = !reverse;
		turnTime = TURN_TIME_RANGE.y;
		turnRadius = TURN_RADIUS_RANGE.x;
		if (Randomizer::Random(0,1))
			turnRadius = -turnRadius;
	}
	else
	{
		speed *= scalar / sqrt(tmp.x * tmp.x + tmp.y * tmp.y);
		turnRadius = -turnRadius;
	}

	setTextureCoord();
	sprite.SetPosition(pos - shake);
}

void Car::loadBaseParticleSystem(Image& smoke)
{	
	// Creates the model
	SPK::Model* smokeModel = SPK::Model::create(
		SPK::FLAG_SIZE | SPK::FLAG_ALPHA | SPK::FLAG_TEXTURE_INDEX | SPK::FLAG_ANGLE,
		SPK::FLAG_SIZE | SPK::FLAG_ALPHA,
		SPK::FLAG_SIZE | SPK::FLAG_TEXTURE_INDEX | SPK::FLAG_ANGLE);
	smokeModel->setParam(SPK::PARAM_SIZE,5.0f,10.0f,100.0f,200.0f);
	smokeModel->setParam(SPK::PARAM_ALPHA,1.0f,0.0f);
	smokeModel->setParam(SPK::PARAM_TEXTURE_INDEX,0.0f,4.0f);
	smokeModel->setParam(SPK::PARAM_ANGLE,0.0f,PI * 2.0f);
	smokeModel->setLifeTime(2.0f,5.0f);

	// Creates the renderer
	SPK::SFML::SFMLQuadRenderer* smokeRenderer = SPK::SFML::SFMLQuadRenderer::create();
	smokeRenderer->setBlendMode(Blend::Alpha);
	smokeRenderer->setImage(&smoke);
	smokeRenderer->setAtlasDimensions(2,2);
	smokeRenderer->setScale(0.875f,0.875f); // optim
	smokeRenderer->setGroundCulling(true);

	// Creates the zones
	SPK::Point* leftTire = SPK::Point::create(SPK::Vector3D(8.0f,-28.0f));
	SPK::Point* rightTire = SPK::Point::create(SPK::Vector3D(-8.0f,-28.0f));

	// Creates the emitters
	SPK::SphericEmitter* leftSmokeEmitter = SPK::SphericEmitter::create(SPK::Vector3D(0.0f,0.0f,1.0f),0.0f,1.1f * PI);
	leftSmokeEmitter->setZone(leftTire);
	leftSmokeEmitter->setName("left wheel emitter");
	
	SPK::SphericEmitter* rightSmokeEmitter = SPK::SphericEmitter::create(SPK::Vector3D(0.0f,0.0f,1.0f),0.0f,1.1f * PI);
	rightSmokeEmitter->setZone(rightTire);
	rightSmokeEmitter->setName("right wheel emitter");

	// Creates the Group
	SPK::Group* smokeGroup = SPK::Group::create(smokeModel,500);
	smokeGroup->setGravity(SPK::Vector3D(0.0f,0.0f,2.0f));
	smokeGroup->setRenderer(smokeRenderer);
	smokeGroup->addEmitter(leftSmokeEmitter);
	smokeGroup->addEmitter(rightSmokeEmitter);
	smokeGroup->enableSorting(true);

	// Creates the System
	SPK::SFML::SFMLSystem* system = SPK::SFML::SFMLSystem::create(true);
	system->addGroup(smokeGroup);

	// Defines which objects will be shared by all systems
	smokeModel->setShared(true);
	smokeRenderer->setShared(true);
	
	// Creates the base and gets the ID
	baseParticleSystemID = system->getSPKID();
}

void Car::createParticleSystem()
{
	particleSystem = SPK_Copy(SPK::SFML::SFMLSystem,baseParticleSystemID);
}

void Car::updateParticleSystem(float deltaTime,float angle,float power)
{
	float forceMin = power * 0.04f;
	float forceMax = power * 0.08f;
	float flow = power * 0.20f;

	SPK::Emitter* leftWheelEmitter = dynamic_cast<SPK::Emitter*>(particleSystem->findByName("left wheel emitter"));
	SPK::Emitter* rightWheelEmitter = dynamic_cast<SPK::Emitter*>(particleSystem->findByName("right wheel emitter"));
	leftWheelEmitter->setForce(forceMin,forceMax);
	rightWheelEmitter->setForce(forceMin,forceMax);
	leftWheelEmitter->setFlow(flow);
	rightWheelEmitter->setFlow(flow);

	particleSystem->SetPosition(pos);
	particleSystem->SetRotation(angle * 180.0f / PI);
	particleSystem->update(deltaTime);
}

