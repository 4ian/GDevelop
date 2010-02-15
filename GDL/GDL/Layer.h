#ifndef LAYER_H
#define LAYER_H
#include <string>
#include <vector>
#include <SFML/Graphics.hpp>

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

        inline void SetViewsNumber(unsigned int n)
        {
            while ( views.size() < n)
                views.push_back(sf::View());

            while ( views.size() > n)
                views.erase(views.begin()+views.size()-1);
        }

        inline unsigned int GetViewsNumber() const { return views.size(); };

        inline void SetView(unsigned int n, sf::View & view_) { views[n] = view_; }
        inline const sf::View & GetView(unsigned int n) const { return views[n]; }
        inline sf::View & ModView(unsigned int n) { return views[n]; }

    protected:
    private:

        string name;
        bool isVisible;
        vector <sf::View> views;

        string followLayer;
};

#endif // LAYER_H
