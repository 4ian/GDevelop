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

        inline void SetView(sf::View & view_) { view = view_; }
        inline const sf::View & GetView() const { return view; }
        inline sf::View & ModView() { return view; }

    protected:
    private:

        string name;
        bool isVisible;
        sf::View view;

        string followLayer;
};

#endif // LAYER_H
