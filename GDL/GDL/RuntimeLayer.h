#ifndef RUNTIMELAYER_H
#define RUNTIMELAYER_H

#include <SFML/Graphics.hpp>
#include "GDL/Layer.h"
#include "GDL/RuntimeCamera.h"

/**
 * Layer used at runtime, containg RuntimeCamera.
 */
class GD_API RuntimeLayer
{
    public:
        RuntimeLayer() {};
        RuntimeLayer(const Layer & layer, const sf::View & defaultView);
        virtual ~RuntimeLayer();

        inline std::string GetName() const { return associatedLayer.GetName(); };
        inline void SetName(std::string name_) { associatedLayer.SetName(name_); };

        inline bool GetVisibility() const { return associatedLayer.GetVisibility(); };
        inline void SetVisibility(bool isVisible) { associatedLayer.SetVisibility(isVisible); };

        inline unsigned int GetCamerasNumber() const { return cameras.size(); };

        /**
         * Add a camera during runtime
         */
        inline void AddCamera(const RuntimeCamera & camera) { cameras.push_back(camera); };

        /**
         * Delete a camera during runtime. Check if number is not out of range.
         */
        inline void DeleteCamera(unsigned int cameraNb)
        {
            if ( cameraNb >= GetCamerasNumber() ) return;
            cameras.erase(cameras.begin() + cameraNb);
        }

        /**
         * Get a camera. Check if number is not out of range.
         */
        inline const RuntimeCamera & GetCamera(unsigned int n) const
        {
            if ( n >= GetCamerasNumber() ) return badCamera;

            return cameras[n];
        }

        /**
         * Get a camera. Check if number is not out of range.
         */
        inline RuntimeCamera & GetCamera(unsigned int n)
        {
            if ( n >= GetCamerasNumber() ) return badCamera;

            return cameras[n];
        }

    protected:
    private:

        Layer associatedLayer;
        vector < RuntimeCamera > cameras; ///< Cameras used during Runtime.

        static RuntimeCamera badCamera;
};

#endif // RUNTIMELAYER_H
