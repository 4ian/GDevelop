#ifndef LAYER_H
#define LAYER_H
#include <string>
#include <vector>
#include <SFML/Graphics.hpp>
#include "GDL/Camera.h"

using namespace std;

class GD_API Layer
{
    public:
        /** Default constructor */
        Layer();
        /** Default destructor */
        virtual ~Layer();

        inline void SetName(string name_) { name = name_; }
        inline string GetName() const { return name; }

        inline void SetVisibility(bool isVisible_) { isVisible = isVisible_; }
        inline bool GetVisibility() const { return isVisible; }

        inline void SetCamerasNumber(unsigned int n)
        {
            while ( cameras.size() < n)
                cameras.push_back(Camera());

            while ( cameras.size() > n)
                cameras.erase(cameras.begin()+cameras.size()-1);
        }

        inline unsigned int GetCamerasNumber() const { return cameras.size(); };

        inline const Camera & GetCamera(unsigned int n) const { if ( n >= GetCamerasNumber() ) return badCamera; return cameras[n]; }
        inline Camera & GetCamera(unsigned int n) { if ( n >= GetCamerasNumber() ) return badCamera; return cameras[n]; }
        inline void DeleteCamera(unsigned int n) { if ( n >= GetCamerasNumber() ) return; cameras.erase(cameras.begin()+n); }

    protected:
    private:

        string name;
        bool isVisible;
        vector < Camera > cameras;

        string followLayer;

        static Camera badCamera;
};

#endif // LAYER_H
