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


#include "Core/SPK_Interpolator.h"
#include "Core/SPK_Model.h"
#include "Core/SPK_Particle.h"


namespace SPK
{
	Interpolator::computeXFn Interpolator::COMPUTE_X_FN[4] =
	{
		&Interpolator::computeXLifeTime,
		&Interpolator::computeXAge,
		&Interpolator::computeXParam,
		&Interpolator::computeXVelocity,
	};

	Interpolator::Interpolator() :
		graph(),
		type(INTERPOLATOR_LIFETIME),
		param(PARAM_SIZE),
		scaleXVariation(0.0f),
		offsetXVariation(0.0f),
		loopingEnabled(false)
	{}

	float Interpolator::computeXLifeTime(const Particle& particle) const
	{
		return particle.getAge() / (particle.getAge() + particle.getLifeLeft());
	}

	float Interpolator::computeXAge(const Particle& particle) const
	{
		return particle.getAge();
	}

	float Interpolator::computeXParam(const Particle& particle) const
	{
		return particle.getParamCurrentValue(param);
	}

	float Interpolator::computeXVelocity(const Particle& particle) const
	{
		return particle.velocity().getSqrNorm();
	}

	float Interpolator::interpolate(const Particle& particle,ModelParam interpolatedParam,float ratioY,float offsetX,float scaleX)
	{
		// First finds the current X of the particle
		InterpolatorEntry currentKey((this->*Interpolator::COMPUTE_X_FN[type])(particle));
		currentKey.x += offsetX; // Offsets it
		currentKey.x *= scaleX;  // Scales it

		if (loopingEnabled)
		{
			// If the graph has les than 2 entries, we cannot loop
			if (graph.size() < 2)
			{
				if (graph.empty())
					return Model::getDefaultValue(interpolatedParam);
				else
					return interpolateY(*(graph.begin()),ratioY);
			}

			// Else finds the current X in the range
			const float beginX = graph.begin()->x;
			const float rangeX = graph.rbegin()->x - beginX;
			float newX = (currentKey.x - beginX) / rangeX;
			newX -= static_cast<int>(newX);
			if (newX < 0.0f)
				newX = 1.0f + newX;
			currentKey.x = beginX + newX * rangeX;
		}

		// Gets the entry that is immediatly after the current X
		std::set<InterpolatorEntry>::const_iterator nextIt = graph.upper_bound(currentKey);

		// If the current X is higher than the one of the last entry
		if (nextIt == graph.end())
		{
			if (graph.empty())	// If the graph has no entry, sets the default value
				return Model::getDefaultValue(interpolatedParam);
			else	// Else sets the value of the last entry
				return interpolateY(*(--nextIt),ratioY);
		}
		else if (nextIt == graph.begin()) // If the current X is lower than the first entry, sets the value to the first entry
		{
			return interpolateY(*nextIt,ratioY);
		}
		else	// Else interpolated between the entries before and after the current X
		{
			const InterpolatorEntry& nextEntry = *nextIt;
			const InterpolatorEntry& previousEntry = *(--nextIt);
			float y0 = interpolateY(previousEntry,ratioY);
			float y1 = interpolateY(nextEntry,ratioY);

			float ratioX = (currentKey.x - previousEntry.x) / (nextEntry.x - previousEntry.x);
			return y0 + ratioX * (y1 - y0);
		}
	}

	void Interpolator::generateSinCurve(float period,float amplitudeMin,float amplitudeMax,float offsetX,float offsetY,float startX,unsigned int length,unsigned int nbSamples)
	{
		// First clear any previous entry
		clearGraph();

		const float PI = 3.1415926535897932384626433832795f;

		for (size_t i = 0; i < nbSamples; ++i)
		{
			float x = startX + i * period * length / (nbSamples - 1);
			float sin = std::sin((x + offsetX) * 2 * PI / period);
			addEntry(x,amplitudeMin * sin + offsetY,amplitudeMax * sin + offsetY);
		}
	}

	void Interpolator::generatePolyCurve(float constant,float linear,float quadratic,float cubic,float startX,float endX,unsigned int nbSamples)
	{
		// First clear any previous entry
		clearGraph();

		for (size_t i = 0; i < nbSamples; ++i)
		{
			float x = startX + i * (endX - startX) / (nbSamples - 1);
			float x2 = x * x;
			float x3 = x2 * x;
			addEntry(x,constant + x * linear + x2 * quadratic + x3 * cubic);
		}
	}
}
