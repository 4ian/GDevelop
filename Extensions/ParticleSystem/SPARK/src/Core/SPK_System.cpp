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


#include "Core/SPK_System.h"
#include "Core/SPK_Group.h"
#include "Core/SPK_Vector3D.h"
#include "Core/SPK_Emitter.h"
#include "Core/SPK_Modifier.h"

namespace SPK
{
	Vector3D System::cameraPosition;

	StepMode System::stepMode(STEP_REAL);
	float System::constantStep(0.0f);
	float System::minStep(0.0f);
	float System::maxStep(0.0f);

	bool System::clampStepEnabled(false);
	float System::clampStep(1.0f);

	System::System() :
		Registerable(),
		Transformable(),
		groups(),
		nbParticles(0),
		boundingBoxEnabled(false),
		AABBMin(),
		AABBMax(),
		deltaStep(0.0f)
	{}

	void System::registerChildren(bool registerAll)
	{
		Registerable::registerChildren(registerAll);

		for (std::vector<Group*>::const_iterator it = groups.begin(); it != groups.end(); ++it)
			registerChild(*it,registerAll);
	}

	void System::copyChildren(const Registerable& object,bool createBase)
	{
		const System& system = dynamic_cast<const System&>(object);
		Registerable::copyChildren(system,createBase);

		// we clear the copies of pointers pushed in the vectors by the copy constructor
		groups.clear();

		for (std::vector<Group*>::const_iterator it = system.groups.begin(); it != system.groups.end(); ++it)
			groups.push_back(dynamic_cast<Group*>(copyChild(*it,createBase)));
	}

	void System::destroyChildren(bool keepChildren)
	{
		for (std::vector<Group*>::const_iterator it = groups.begin(); it != groups.end(); ++it)
			destroyChild(*it,keepChildren);

		Registerable::destroyChildren(keepChildren);
	}

	void System::addGroup(Group* group)
	{
		incrementChildReference(group);
		groups.push_back(group);
		nbParticles += group->getNbParticles();
	}

	void System::removeGroup(Group* group)
	{
		std::vector<Group*>::iterator it = std::find(groups.begin(),groups.end(),group);
		if (it != groups.end())
		{
			decrementChildReference(group);
			groups.erase(it);
		}
	}

	size_t System::computeNbParticles()
	{
		nbParticles = 0;
		for (std::vector<Group*>::const_iterator it = groups.begin(); it != groups.end(); ++it)
			nbParticles += (*it)->getNbParticles();
		return nbParticles;
	}

	bool System::innerUpdate(float deltaTime)
	{
		nbParticles = 0;
		bool isAlive = false;

		bool hasGroupsWithAABB = false;
		if (boundingBoxEnabled)
		{
			const float maxFloat = std::numeric_limits<float>::max();
			AABBMin.set(maxFloat,maxFloat,maxFloat);
			AABBMax.set(-maxFloat,-maxFloat,-maxFloat);
		}

		for (std::vector<Group*>::iterator it = groups.begin(); it != groups.end(); ++it)
		{
			isAlive |= (*it)->update(deltaTime);
			nbParticles += (*it)->getNbParticles();

			if ((boundingBoxEnabled)&&((*it)->isAABBComputingEnabled()))
			{
				Vector3D groupMin = (*it)->getAABBMin();
				Vector3D groupMax = (*it)->getAABBMax();
				if (AABBMin.x > groupMin.x)
					AABBMin.x = groupMin.x;
				if (AABBMin.y > groupMin.y)
					AABBMin.y = groupMin.y;
				if (AABBMin.z > groupMin.z)
					AABBMin.z = groupMin.z;
				if (AABBMax.x < groupMax.x)
					AABBMax.x = groupMax.x;
				if (AABBMax.y < groupMax.y)
					AABBMax.y = groupMax.y;
				if (AABBMax.z < groupMax.z)
					AABBMax.z = groupMax.z;
				hasGroupsWithAABB = true;
			}
		}

		if ((!boundingBoxEnabled)||(!hasGroupsWithAABB))
		{
			AABBMin.set(0.0f,0.0f,0.0f);
			AABBMax.set(0.0f,0.0f,0.0f);
		}

		return isAlive;
	}

	bool System::update(float deltaTime)
	{
		if ((clampStepEnabled)&&(deltaTime > clampStep))
			deltaTime = clampStep;

		if (stepMode != STEP_REAL)
		{
			deltaTime += deltaStep;

			float updateStep;
			if (stepMode == STEP_ADAPTIVE)
			{
				if (deltaTime > maxStep)
					updateStep = maxStep;
				else if (deltaTime < minStep)
					updateStep = minStep;
				else
				{
					deltaStep = 0.0f;
					return innerUpdate(deltaTime);
				}
			}
			else
				updateStep = constantStep;

			bool isAlive = true;
			while(deltaTime >= updateStep)
			{
				if ((isAlive)&&(!innerUpdate(updateStep)))
					isAlive = false;
				deltaTime -= updateStep;
			}
			deltaStep = deltaTime;
			return isAlive;

		}	
		else
			return innerUpdate(deltaTime);
	}

	void System::render() const
	{
		for (std::vector<Group*>::const_iterator it = groups.begin(); it != groups.end(); ++it)
			(*it)->render();
	}

	void System::grow(float time,float step)
	{
		if (step <= 0.0f)
			step = time;

		while (time > 0.0f)
		{
			float currentStep = time > step ? step : time;
			update(currentStep);
			time -= currentStep;
		}
	}

	void System::empty()
	{
		for (std::vector<Group*>::iterator it = groups.begin(); it != groups.end(); ++it)
			(*it)->empty();
		nbParticles = 0;
	}

	void System::setCameraPosition(const Vector3D& cameraPosition)
	{
		System::cameraPosition = cameraPosition;
	}

	void System::setClampStep(bool enableClampStep,float clamp)
	{
		clampStepEnabled = enableClampStep;
		clampStep = clamp;
	}

	void System::useConstantStep(float constantStep)
	{
		stepMode = STEP_CONSTANT;
		System::constantStep = constantStep;
	}

	void System::useAdaptiveStep(float minStep,float maxStep)
	{
		stepMode = STEP_ADAPTIVE;
		System::minStep = minStep;
		System::maxStep = maxStep;
	}

	void System::useRealStep()
	{
		stepMode = STEP_REAL;
	}

	const Vector3D& System::getCameraPosition()
	{
		return cameraPosition;
	}

	StepMode System::getStepMode()
	{
		return stepMode;
	}

	void System::sortParticles()
	{
		for (std::vector<Group*>::iterator it = groups.begin(); it != groups.end(); ++it)
			(*it)->sortParticles();
	}

	void System::computeDistances()
	{
		for (std::vector<Group*>::iterator it = groups.begin(); it != groups.end(); ++it)
			(*it)->computeDistances();
	}

	void System::computeAABB()
	{
		if (boundingBoxEnabled)
		{
			const float maxFloat = std::numeric_limits<float>::max();
			AABBMin.set(maxFloat,maxFloat,maxFloat);
			AABBMax.set(-maxFloat,-maxFloat,-maxFloat);
		}

		bool hasGroupsWithAABB = false;
		for (std::vector<Group*>::iterator it = groups.begin(); it != groups.end(); ++it)
		{
			(*it)->computeAABB();

			if ((boundingBoxEnabled)&&((*it)->isAABBComputingEnabled()))
			{
				Vector3D groupMin = (*it)->getAABBMin();
				Vector3D groupMax = (*it)->getAABBMax();
				if (AABBMin.x > groupMin.x)
					AABBMin.x = groupMin.x;
				if (AABBMin.y > groupMin.y)
					AABBMin.y = groupMin.y;
				if (AABBMin.z > groupMin.z)
					AABBMin.z = groupMin.z;
				if (AABBMax.x < groupMax.x)
					AABBMax.x = groupMax.x;
				if (AABBMax.y < groupMax.y)
					AABBMax.y = groupMax.y;
				if (AABBMax.z < groupMax.z)
					AABBMax.z = groupMax.z;
				hasGroupsWithAABB = true;
			}
		}

		if ((!boundingBoxEnabled)||(!hasGroupsWithAABB))
		{
			const Vector3D pos = getWorldTransformPos();
			AABBMin = AABBMax = pos;
		}
	}

	Registerable* System::findByName(const std::string& name)
	{
		Registerable* object = Registerable::findByName(name);
		if (object != NULL)
			return object;

		for (std::vector<Group*>::const_iterator it = groups.begin(); it != groups.end(); ++it)
		{
			object = (*it)->findByName(name);
			if (object != NULL)
				return object;
		}

		return NULL;
	}

	void System::propagateUpdateTransform()
	{
		for (std::vector<Group*>::const_iterator it = groups.begin(); it != groups.end(); ++it)
			(*it)->updateTransform(this);
	}
}
