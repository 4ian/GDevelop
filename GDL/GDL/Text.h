#ifndef TEXT_H
#define TEXT_H
#include <SFML/Graphics.hpp>
#include <string>

using namespace std;

/**
 * Old class for drawing objects.
 * Do not use this anymore.
 */
class GD_API Text
{
    public:
        /** Default constructor */
        Text();
        /** Default destructor */
        virtual ~Text();

        sf::Text text;
        string fontName;
        string layer;

        void Draw(sf::RenderWindow& main_window);

    protected:
    private:
};

#endif // TEXT_H
