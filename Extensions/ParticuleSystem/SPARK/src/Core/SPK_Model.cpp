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


#include "Core/SPK_Model.h"
#include "Core/SPK_Interpolator.h"

namespace SPK
{
	Model defaultModel;

	const float Model::DEFAULT_VALUES[NB_PARAMS] =
	{
		1.0f,	// RED
		1.0f,	// GREEN
		1.0f,	// BLUE
		1.0f,	// ALPHA
		1.0f,	// SIZE
		1.0f,	// MASS
		0.0f,	// ANGLE
		0.0f,	// TEXTURE_INDEX
		0.0f,	// ROTATION_SPEED
		0.0f,	// CUSTOM_0
		0.0f,	// CUSTOM_1
		0.0f,	// CUSTOM_2
	};

	Model::Model(int enableFlag,int mutableFlag,int randomFlag,int interpolatedFlag) :
		Registerable(),
		lifeTimeMin(1.0f),
		lifeTimeMax(1.0f),
		immortal(false),
		paramsSize(0),
		nbEnableParams(0),
		nbMutableParams(0),
		nbRandomParams(0),
		nbInterpolatedParams(0)
	{
		enableFlag |= FLAG_RED | FLAG_GREEN | FLAG_BLUE; // Adds the color parameters to the enable flag
		this->enableFlag = enableFlag & ((1 << (NB_PARAMS + 1)) - 1); // masks the enable flag with the existing parameters
		this->interpolatedFlag = interpolatedFlag & this->enableFlag; // masks the interpolated flag with the enable flag
		this->mutableFlag = mutableFlag & this->enableFlag; // masks the mutable flag with the enable flag
		this->mutableFlag &= ~this->interpolatedFlag; // a param cannot be both interpolated and mutable
		this->randomFlag = randomFlag & this->enableFlag; // masks the random flag with the enable flag
		this->randomFlag &= ~this->interpolatedFlag; // a param cannot be both interpolated and random

		int particleEnableParamsSize = 0;
		int particleMutableParamsSize = 0;
		for (size_t i = 0; i < NB_PARAMS; ++i)
		{
			ModelParam param = static_cast<ModelParam>(i);

			int paramSize = 0;
			if (isEnabled(param))
			{
				++nbEnableParams;
				if (!isInterpolated(param))
				{	
					interpolators[i] = NULL;
					paramSize = 1;
					if (isMutable(param))
					{
						paramSize = 2;
						++nbMutableParams;
					}
					if (isRandom(param))
					{
						paramSize <<= 1;
						++nbRandomParams;
					}
				}
				else
				{
					interpolators[i] = new Interpolator(); // Creates the interpolator
					++nbInterpolatedParams;
				}
			}
			else
				interpolators[i] = NULL;

			particleEnableIndices[i] = particleEnableParamsSize;
			particleMutableIndices[i] = particleMutableParamsSize;
			particleEnableParamsSize += isEnabled(param) >> i;
			particleMutableParamsSize += isMutable(param) >> i;

			indices[i] = paramsSize;
			paramsSize += paramSize;
		}

		// creates the array of params for this model
		if (paramsSize > 0)
		{
			params = new float[paramsSize];
			unsigned int currentParamIndex = 0;
			unsigned int currentIndex = 0;
			while (currentIndex < paramsSize)
			{
				unsigned int nbValues = getNbValues(static_cast<ModelParam>(currentParamIndex));
				for (size_t i = 0; i < nbValues; ++i)
					params[currentIndex + i] = DEFAULT_VALUES[currentParamIndex];
				++currentParamIndex;
				currentIndex += nbValues;
			}
		}
		else
			params = NULL;

		if (nbEnableParams > 0)
		{
			enableParams = new int[nbEnableParams];
			size_t index = 0;
			for (size_t i = 0; i < NB_PARAMS; ++i)
				if (isEnabled(static_cast<ModelParam>(i)))
					enableParams[index++] = i;
		}
		else
			enableParams = NULL;

		if (nbMutableParams > 0)
		{
			mutableParams = new int[nbMutableParams];
			size_t index = 0;
			for (size_t i = 0; i < NB_PARAMS; ++i)
				if (isMutable(static_cast<ModelParam>(i)))
					mutableParams[index++] = i;
		}
		else
			mutableParams = NULL;

		if (nbInterpolatedParams > 0)
		{
			interpolatedParams = new int[nbInterpolatedParams];
			size_t index = 0;
			for (size_t i = 0; i < NB_PARAMS; ++i)
				if (isInterpolated(static_cast<ModelParam>(i)))
					interpolatedParams[index++] = i;
		}
		else
			interpolatedParams = NULL;
	}

	Model::Model(const Model& model) :
		Registerable(model),
		lifeTimeMin(model.lifeTimeMin),
		lifeTimeMax(model.lifeTimeMax),
		immortal(model.immortal),
		paramsSize(model.paramsSize),
		nbEnableParams(model.nbEnableParams),
		nbMutableParams(model.nbMutableParams),
		nbRandomParams(model.nbRandomParams),
		nbInterpolatedParams(model.nbInterpolatedParams),
		enableFlag(model.enableFlag),
		mutableFlag(model.mutableFlag),
		randomFlag(model.randomFlag),
		interpolatedFlag(model.interpolatedFlag),
		params(NULL),
		enableParams(NULL),
		mutableParams(NULL),
		interpolatedParams(NULL)
	{
		if (paramsSize > 0)
		{
			params = new float[paramsSize];
			for (size_t i = 0; i < paramsSize; ++i)
				params[i] = model.params[i];
		}

		if (nbEnableParams > 0)
		{
			enableParams = new int[nbEnableParams];
			for (size_t i = 0; i < nbEnableParams; ++i)
				enableParams[i] = model.enableParams[i];
		}

		if (nbMutableParams > 0)
		{
			mutableParams = new int[nbMutableParams];
			for (size_t i = 0; i < nbMutableParams; ++i)
				mutableParams[i] = model.mutableParams[i];
		}

		if (nbInterpolatedParams > 0)
		{
			interpolatedParams = new int[nbMutableParams];
			for (size_t i = 0; i < nbInterpolatedParams; ++i)
				interpolatedParams[i] = model.interpolatedParams[i];
		}

		for (size_t i = 0; i < NB_PARAMS; ++i)
		{
			indices[i] = model.indices[i];
			particleEnableIndices[i] = model.particleEnableIndices[i];
			particleMutableIndices[i] = model.particleMutableIndices[i];
			if (model.interpolators[i] != NULL)
				interpolators[i] = new Interpolator(*model.interpolators[i]);
			else
				interpolators[i] = NULL;
		}
	}

	Model::~Model()
	{
		delete[] enableParams;
		delete[] mutableParams;
		delete[] interpolatedParams;
		delete[] params;

		for (size_t i = 0; i < NB_PARAMS; ++i)
			delete interpolators[i];
	}

	bool Model::setParam(ModelParam type,float startMin,float startMax,float endMin,float endMax)
	{
		// if the given param doesnt have 4 values, return
		if (getNbValues(type) != 4)
			return false;

		// Sets the values at the right position in params
		float* ptr = params + indices[type];
		*ptr++ = startMin;
		*ptr++ = startMax;
		*ptr++ = endMin;
		*ptr = endMax;

		return true;
	}

	bool Model::setParam(ModelParam type,float value0,float value1)
	{
		// if the given param doesnt have 2 values, return
		if (getNbValues(type) != 2)
			return false;

		// Sets the values at the right position in params
		float* ptr = params + indices[type];
		*ptr++ = value0;
		*ptr = value1;

		return true;
	}

	bool Model::setParam(ModelParam type,float value)
	{
		// if the given param doesnt have 1 value, return
		if (getNbValues(type) != 1)
			return false;

		// Sets the value at the right position in params
		params[indices[type]] = value;

		return true;
	}

	float Model::getParamValue(ModelParam type,size_t index) const
	{
		unsigned int nbValues = getNbValues(type);

		if ((nbValues - 1 > index)&&(nbValues != 0))
			return params[indices[type] + index];

		return DEFAULT_VALUES[type];
	}

	unsigned int Model::getNbValues(ModelParam type) const
	{
		int value = 1 << type;
		if (!(enableFlag & value) || (interpolatedFlag & value))
			return 0;

		if (!(mutableFlag & value) && !(randomFlag & value))
			return 1;

		if ((mutableFlag & value) && (randomFlag & value))
			return 4;

		return 2;
	}

	float Model::getDefaultValue(ModelParam param)
	{
		return DEFAULT_VALUES[param];
	}
}
