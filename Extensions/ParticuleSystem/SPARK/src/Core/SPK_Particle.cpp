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


#include "Core/SPK_Particle.h"
#include "Core/SPK_Group.h"
#include "Core/SPK_Modifier.h"
#include "Core/SPK_System.h"
#include "Core/SPK_Buffer.h"
#include "Core/SPK_Interpolator.h"


namespace SPK
{
	Particle::Particle(Group* group,size_t index) :
		group(group),
		index(index),
		data(group->particleData + index),
		currentParams(group->particleCurrentParams + index * group->model->getSizeOfParticleCurrentArray()),
		extendedParams(group->particleExtendedParams + index * group->model->getSizeOfParticleExtendedArray())
	{
		init();
	}

	void Particle::init()
	{
		const Model* model = group->getModel();
		data->age = 0.0f;
		data->life = random(model->lifeTimeMin,model->lifeTimeMax);

		// creates pseudo-iterators to parse arrays
		float* particleCurrentIt = currentParams;
		float* particleMutableIt = extendedParams;
		float* particleInterpolatedIt = extendedParams + model->nbMutableParams;
		const int* paramIt = model->enableParams;

		// initializes params
		for (size_t i = model->nbEnableParams; i != 0; --i)
		{
			ModelParam param = static_cast<ModelParam>(*paramIt);
			const float* templateIt = &model->params[model->indices[param]];

			if (model->isInterpolated(param))
			{
				*particleCurrentIt++ = Model::DEFAULT_VALUES[param];
				*particleInterpolatedIt++ = random(0.0f,1.0f); // ratioY

				Interpolator* interpolator = model->interpolators[param];
				float offsetVariation = interpolator->getOffsetXVariation();
				float scaleVariation = interpolator->getScaleXVariation();

				*particleInterpolatedIt++ = random(-offsetVariation,offsetVariation); // offsetX
				*particleInterpolatedIt++ = 1.0f + random(-scaleVariation,scaleVariation); // scaleX
			}
			else if (model->isRandom(param))
			{
				*particleCurrentIt++ = random(*templateIt,*(templateIt + 1));
				if (model->isMutable(param))
					*particleMutableIt++ = random(*(templateIt + 2),*(templateIt + 3));
			}
			else 
			{
					*particleCurrentIt++ = *templateIt;
				if (model->isMutable(param))
					*particleMutableIt++ = *(templateIt + 1);
			}

			++paramIt;
		}
	}

	void Particle::interpolateParameters()
	{
		const Model* model = group->getModel();

		float* interpolatedIt = extendedParams + model->nbMutableParams;
		for (size_t i = 0; i < model->nbInterpolatedParams; ++i)
		{
			size_t index = model->interpolatedParams[i];
			size_t enableIndex = model->particleEnableIndices[index];
			currentParams[enableIndex] = model->interpolators[index]->interpolate(*this,static_cast<ModelParam>(index),interpolatedIt[0],interpolatedIt[1],interpolatedIt[2]);
			interpolatedIt += 3;
		}
	}

	bool Particle::update(float deltaTime)
	{
		const Model* model = group->getModel();
		data->age += deltaTime;

		if (!model->immortal)
		{
			// computes the ratio between the life of the particle and its lifetime
			float ratio = std::min(1.0f,deltaTime / data->life);
			data->life -= deltaTime;
			
			// updates mutable parameters
			for (size_t i = 0; i < model->nbMutableParams; ++i)
			{
				size_t index = model->mutableParams[i];
				size_t enableIndex = model->particleEnableIndices[index];
				currentParams[enableIndex] += (extendedParams[i] - currentParams[enableIndex]) * ratio;
			}
		}

		// updates interpolated parameters
		interpolateParameters();

		// updates position
		oldPosition() = position();
		position() += velocity() * deltaTime;

		// updates velocity
		velocity() += group->getGravity() * deltaTime;

		std::vector<Modifier*>::const_iterator end = group->activeModifiers.end();
		for (std::vector<Modifier*>::const_iterator it = group->activeModifiers.begin(); it != end; ++it)
			(*it)->process(*this,deltaTime);

		if (group->getFriction() != 0.0f)
			velocity() *= 1.0f - std::min(1.0f,group->getFriction() * deltaTime / getParamCurrentValue(PARAM_MASS));

		return data->life <= 0.0f;
	}

	bool Particle::setParamCurrentValue(ModelParam type,float value)
	{
		const Model* const model = group->getModel();
		if (model->isEnabled(type))
		{
			currentParams[model->particleEnableIndices[type]] = value;
			return true;
		}

		return false;
	}

	bool Particle::setParamFinalValue(ModelParam type,float value)
	{
		const Model* const model = group->getModel();
		if (model->isMutable(type))
		{
			extendedParams[model->particleMutableIndices[type]] = value;
			return true;
		}

		return false;
	}

	bool Particle::changeParamCurrentValue(ModelParam type,float delta)
	{
		const Model* const model = group->getModel();
		if (model->isEnabled(type))
		{
			currentParams[model->particleEnableIndices[type]] += delta;
			return true;
		}

		return false;
	}

	bool Particle::changeParamFinalValue(ModelParam type,float delta)
	{
		const Model* const model = group->getModel();
		if (model->isMutable(type))
		{
			extendedParams[model->particleMutableIndices[type]] += delta;
			return true;
		}

		return false;
	}

	float Particle::getParamCurrentValue(ModelParam type) const
	{
		const Model* const model = group->getModel();
		if (model->isEnabled(type))
			return currentParams[model->particleEnableIndices[type]];

		return Model::DEFAULT_VALUES[type];
	}

	float Particle::getParamFinalValue(ModelParam type) const
	{
		const Model* const model = group->getModel();
		if (model->isEnabled(type))
		{
			if (model->isMutable(type))
				return extendedParams[model->particleMutableIndices[type] + 1];
			return currentParams[model->particleEnableIndices[type]];
		}

		return Model::DEFAULT_VALUES[type];
	}

	Model* Particle::getModel() const
	{
		return group->getModel();
	}

	void Particle::computeSqrDist()
	{
		data->sqrDist = getSqrDist(position(),System::getCameraPosition());
	}

	extern void swapParticles(Particle& a,Particle& b)
	{
		//std::swap(a.index,b.index);
		std::swap(*a.data,*b.data);
		for (size_t i = 0; i < a.getModel()->getSizeOfParticleCurrentArray(); ++i)
			std::swap(a.currentParams[i],b.currentParams[i]);
		for (size_t i = 0; i < a.getModel()->getSizeOfParticleExtendedArray(); ++i)
			std::swap(a.extendedParams[i],b.extendedParams[i]);
		
		// swap additional data (groups are assumed to be the same)
		for (std::set<Buffer*>::iterator it = a.group->swappableBuffers.begin(); it != a.group->swappableBuffers.end(); ++it)
			(*it)->swap(a.index,b.index);
	}
}
