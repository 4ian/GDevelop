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


#ifndef H_SPK_INTERPOLATOR
#define H_SPK_INTERPOLATOR

#include "Core/SPK_DEF.h"

namespace SPK
{
	class Particle;

	/**
	* @enum InterpolationType
	* @brief Constants defining which type of value is used for interpolation
	* @since 1.05.00
	*/
	enum InterpolationType
	{
		INTERPOLATOR_LIFETIME,	/**< Constant defining the life time as the value used to interpolate */
		INTERPOLATOR_AGE,		/**< Constant defining the age as the value used to interpolate */
		INTERPOLATOR_PARAM,		/**< Constant defining a parameter as the value used to interpolate */
		INTERPOLATOR_VELOCITY,	/**< Constant defining the square norm of the velocity as the value used to interpolate */
	};

	/**
    * @brief An entry in the interpolator graph
	*
	* See the Interpolator description for more information
	*
	* @since 1.05.00
	*/
	struct InterpolatorEntry
	{
		float x;	/**< x value of this entry */
		float y0;	/**< y first value of this entry */
		float y1;	/**< y second value of this entry */

		/** @brief Default constructor of interpolator entry. All values are set to 0 */
		InterpolatorEntry() : x(0.0f),y0(0.0f),y1(0.0f) {}

		/**
		* @brief Constructs an interpolator entry with y0 and y1 having the same value
		* @param x : the x value
		* @param y : the y value (value of y0 and y1)
		*/
		InterpolatorEntry(float x,float y) : x(x),y0(y),y1(y) {}

		/**
		* @brief Constructs and interpolator entry
		* @param x : the x value
		* @param y0 : the y0 value
		* @param y1 : the y1 value
		*/
		InterpolatorEntry(float x,float y0,float y1) : x(x),y0(y0),y1(y1) {}

		// used internally
		InterpolatorEntry(float x) : x(x) {}
	};

    // forward declaration to allow the set of entries in interpolator to be constructed
    bool operator<(const InterpolatorEntry& entry0,const InterpolatorEntry& entry1);

	/**
	* @class Interpolator
	* @brief An interpolator that offers flexible control over particle parameters
	*
	* An interpolator is created for each parameter of a model which is set as interpolated.<br>
	* The user can get the interpolator of a parameter for a given model by calling Model::getInterpolator(ModelParam).<br>
	* <br>
	* An interpolator can use several types of value to interpolate a given parameter :
	* <ul>
	* <li>the lifetime of a particle : it is defined in a range between 0 and 1, 0 being the birth of the particle and 1 being its death</li>
	* <li>the age of a particle</li>
	* <li>the value of another parameter of a particle (which can be any of the parameters)</li>
	* <li>the square norm of the velocity of a particle</li>
	* </ul>
	* Here is a description of how an interpolator works :<br>
	* <br>
	* Internally an interpolator holds a list of entries which defines a 2D graph. The entries are sorted internally along the x axis.<br>
	* Each entry have a unique x value and 2 y values (although both y can have the same value).<br>
	* <br>
	* The x defines the value that will be used to interpolate the parameter value. This value depends on the type set of the interpolator.<br>
	* For instance, if the type is INTERPOLATOR_AGE, the current x value will be the age of the particle.<br>
	* <br>
	* Knowing the current x value, the interpolator interpolates the y value in function of the entries y values.<br>
	* An interpolator holds 2 curves : the y0 one and the y1 one.<br>
	* Each particle is given a random value between 0 and 1 which defines where between the y0 and the y1 curve the interpolated y value will be.<br>
	* The final interpolated y value will be the value of the interpolated particle parameter for this frame.<br>
	* <br>
	* Moreover the graph can loop or not :
	* <ul>
	* <li>If the graph does not loop, the current x value is clamped between the minimum x and the maximum x of the graph.</li>
	* <li>If the graph loops, the current x is recomputed to fit in the range between the minimum x and the maximum x of the graph.</li>
	* </ul>
	* Finally, it is possible to set a variation in the offset and the scale of the current x computed :<br>
	* Each particle is given an offset and a scale to compute its current x depending on the variations set. The formula to compute the final current x is the following :<br>
	* <i>final current x = (current x + offset) * scale</i><br>
	* offset being randomly generated per particle in <i>[-offsetXVariation,+offsetXVariation]</i><br>
	* scale being randomly generated per particle in <i>1.0 + [-scaleXVariation,+scaleXVariation]</i><br>
	* <br>
	* The default values of the interpolator are the following :
	* <ul>
	* <li>type : INTERPOLATOR_LIFETIME</li>
	* <li>offset x variation : 0.0</li>
	* <li>scale x variation : 0.0</li>
	* </ul>
	*
	* @since 1.05.00
	*/
	class SPK_PREFIX Interpolator
	{
	friend class Particle;
	friend class Model;

	public :

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the value used to interpolate
		* 
		* See the class description for more information.<br>
		* Note that the argument param is only used when the type is INTERPOLATOR_PARAM.
		*
		* @param type : the type of value used to interpolate
		* @param param : the parameter used to interpolate when the type is INTERPOLATOR_PARAM.
		*/
		void setType(InterpolationType type,ModelParam param = PARAM_SIZE);

		/**
		* @brief Enables or disables the looping of the graph
		*
		* The range of the graph is defined between the entry with the minimum x and the entry with the maximum y.<br>
		* If the looping is disabled, the x are clamped to the range.<br>
		* If the looping is enabled, the value of x is reported in the range. It is better that the xmin and xmax have
		* the same y values so that the graph tiles perfectly.
		*
		* @param loop : true to enabled the looping, false to disable it
		*/
		void enableLooping(bool loop);

		/**
		* @brief Sets the scale variation in x
		*
		* See the class description for more information
		*
		* @param scaleXVariation : the scale variation in x
		*/
		void setScaleXVariation(float scaleXVariation);

		/**
		* @brief Sets the offset variation in x
		*
		* See the class description for more information
		*
		* @param offsetXVariation : the offset variation in x
		*/
		void setOffsetXVariation(float offsetXVariation);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the type of value used to interpolate
		* @return the type of value used to interpolate
		*/
		InterpolationType getType() const;

		/**
		* @brief Gets the parameter used to interpolate
		*
		* Note that the parameter is only used if the type is INTERPOLATOR_PARAM
		*
		* @return the parameter used to interpolate
		*/
		ModelParam getInterpolatorParam() const;

		/**
		* @brief Tells whether the looping is enabled or not
		* @return true if the looping is enabled, false if not
		*/
		bool isLoopingEnabled() const;

		/**
		* @brief Gets the scale variation along x
		* @return the scale variation along x
		*/
		float getScaleXVariation() const;

		/**
		* @brief Gets the offset variation along x
		* @return the offset variation along x
		*/
		float getOffsetXVariation() const;

		/**
		* @brief Gets the graph of the interpolator
		* @return the graph of the interpolator
		*/
		std::set<InterpolatorEntry>& getGraph();

		/**
		* @brief Gets the graph of the interpolator (constant version)
		* @return the graph of the interpolator
		*/
		const std::set<InterpolatorEntry>& getGraph() const;

		///////////////
		// Interface //
		///////////////

		/**
		* @brief Adds an entry to the graph
		* @param entry : the entry to add to the graph
		* @return true if the entry has been added to the graph, false if not (the graph already contains an entry with the same x)
		*/
		bool addEntry(const InterpolatorEntry& entry);

		/**
		* @brief Adds an entry to the graph
		* @param x : the x of the entry to add
		* @param y : the y of the entry to add (y0 and y1 are set to y)
		* @return true if the entry has been added to the graph, false if not (the graph already contains an entry with the same x)
		*/
		bool addEntry(float x,float y);

		/**
		* @brief Adds an entry to the graph
		* @param x : the x of the entry to add
		* @param y0 : the y0 of the entry to add
		* @param y1 : the y1 of the entry to add
		* @return true if the entry has been added to the graph, false if not (the graph already contains an entry with the same x)
		*/
		bool addEntry(float x,float y0,float y1);

		/** @brief Clears the graph (removes all the entries) */
		void clearGraph();

		/**
		* @brief Generates a sinusoidal curve
		*
		* Note that the graph is previously cleared from all its entries
		*/
		void generateSinCurve(float period,float amplitudeMin,float amplitudeMax,float offsetX,float offsetY,float startX,unsigned int length,unsigned int nbSamples);
		
		/**
		* @brief Generates a polynomial curve
		*
		* Note that the graph is previously cleared from all its entries
		*/
		void generatePolyCurve(float constant,float linear,float quadratic,float cubic,float startX,float endX,unsigned int nbSamples);

	private :

		std::set<InterpolatorEntry> graph;

		InterpolationType type;
		ModelParam param;
		bool loopingEnabled;

		float scaleXVariation;
		float offsetXVariation;

		float interpolate(const Particle& particle,ModelParam interpolatedParam,float ratioY,float offsetX,float scaleX);
		float interpolateY(const InterpolatorEntry& entry,float ratio);

		// methods to compute X
		typedef float (Interpolator::*computeXFn)(const Particle&) const;
		static computeXFn COMPUTE_X_FN[4];

		float computeXLifeTime(const Particle& particle) const;
		float computeXAge(const Particle& particle) const;
		float computeXParam(const Particle& particle) const;
		float computeXVelocity(const Particle& particle) const;

		// Only a model can create and destroy an interpolator
		Interpolator();
		~Interpolator() {};
	};


	inline void Interpolator::setType(InterpolationType type,ModelParam param)
	{
		this->type = type;
		this->param = param;
	}

	inline void Interpolator::enableLooping(bool loop)
	{
		loopingEnabled = loop;
	}

	inline void Interpolator::setScaleXVariation(float scaleXVariation)
	{
		this->scaleXVariation = scaleXVariation;
	}

	inline void Interpolator::setOffsetXVariation(float offsetXVariation)
	{
		this->offsetXVariation = offsetXVariation;
	}

	inline InterpolationType Interpolator::getType() const
	{
		return type;
	}

	inline ModelParam Interpolator::getInterpolatorParam() const
	{
		return param;
	}

	inline bool Interpolator::isLoopingEnabled() const
	{
		return loopingEnabled;
	}

	inline float Interpolator::getScaleXVariation() const
	{
		return scaleXVariation;
	}

	inline float Interpolator::getOffsetXVariation() const
	{
		return offsetXVariation;
	}

	inline std::set<InterpolatorEntry>& Interpolator::getGraph()
	{
		return graph;
	}

	inline const std::set<InterpolatorEntry>& Interpolator::getGraph() const
	{
		return graph;
	}

	inline bool Interpolator::addEntry(const InterpolatorEntry& entry)
	{
		return graph.insert(entry).second;
	}

	inline bool Interpolator::addEntry(float x,float y)
	{
		return addEntry(InterpolatorEntry(x,y));
	}

	inline bool Interpolator::addEntry(float x,float y0,float y1)
	{
		return addEntry(InterpolatorEntry(x,y0,y1));
	}

	inline void Interpolator::clearGraph()
	{
		graph.clear();
	}

	inline float Interpolator::interpolateY(const InterpolatorEntry& entry,float ratio)
	{
		return entry.y0 + (entry.y1 - entry.y0) * ratio;
	}

    /////////////////////////////////////////////////////////////
	// Functions to sort the entries on the interpolator graph //
	/////////////////////////////////////////////////////////////

	inline bool operator<(const InterpolatorEntry& entry0,const InterpolatorEntry& entry1)
	{
		return entry0.x < entry1.x;
	}

	inline bool operator==(const InterpolatorEntry& entry0,const InterpolatorEntry& entry1)
	{
		return entry0.x == entry1.x;
	}

}

#endif

