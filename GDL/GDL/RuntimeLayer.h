#ifndef RUNTIMELAYER_H
#define RUNTIMELAYER_H

#include <SFML/Graphics.hpp>
#include "GDL/Layer.h"
#include "GDL/RuntimeCamera.h"

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

        inline void SetCamera(unsigned int n, RuntimeCamera & camera_) { cameras[n] = camera_; }
        inline const RuntimeCamera & GetCamera(unsigned int n) const
        {
            if ( n >= GetCamerasNumber() ) return badCamera;

            return cameras[n];
        }
        inline RuntimeCamera & GetCamera(unsigned int n)
        {
            if ( n >= GetCamerasNumber() ) return badCamera;

            return cameras[n];
        }

    protected:
    private:

        Layer associatedLayer;
        vector < RuntimeCamera > cameras; ///< Camera used during Runtime.

        static RuntimeCamera badCamera;
};

#endif // RUNTIMELAYER_H
