#ifndef LIGHTH
#define LIGHTH

#include <vector>
#include <SFML/System/Vector2.hpp>
#include <SFML/Graphics/Color.hpp>
#include <SFML/Graphics/VertexArray.hpp>
namespace sf
{
    class ConvexShape;
    class RenderTarget;
}

class Wall
{
public:
    Wall (sf::Vector2f p1,sf::Vector2f p2) : pt1(p1), pt2(p2) {}
    bool operator==(const Wall& other) { return ( pt1 == other.pt1 && pt2 == other.pt2 ); }

    sf::Vector2f pt1;
    sf::Vector2f pt2;
};

class GD_EXTENSION_API Light
{
    public :

    // Constructeur et destructeur
    Light();
    Light(sf::Vector2f position, float intensity, float radius, int quality, sf::Color color);
    ~Light();

    // Afficher la lumière
    void Draw(sf::RenderTarget *App);

    // Calculer la lumière
    virtual void Generate(std::vector <Wall*> &m_wall);

    // Ajouter un triangle à la lumière, en effet, les lumières sont composée de triangles
    void AddTriangle(sf::Vector2f pt1,sf::Vector2f pt2, int minimum_wall,std::vector <Wall*> &m_wall);

    // Changer différents attributs de la lumière
    void SetIntensity(float intensity) { m_intensity=intensity; };
    void SetRadius(float radius) { m_radius=radius; };
    void SetQuality(int quality) { m_quality=quality; }
    void SetColor(sf::Color color) { m_color=color; }
    void SetPosition(sf::Vector2f position) {m_position=position;}

    // Retourner différents attributs de la lumière
    float GetIntensity() const { return m_intensity; };
    float GetRadius() const { return m_radius; };
    int GetQuality() const { return m_quality; };
    sf::Color GetColor() const { return m_color; };
    sf::Vector2f GetPosition() const { return m_position; };

    // Une petite bool pour savoir si la lumière est allumée ou éteinte
    bool m_actif;

    protected :
    //Position à l'écran
    sf::Vector2f m_position;
    //Intensité, gère la transparence ( entre 0 et 255 )
    float m_intensity;
    //Rayon de la lumière
    float m_radius;
    //Couleur de la lumière
    sf::Color m_color;


    //Tableau dynamique de Shape, ce sont ces shapes de type triangle qui compose la lumière
    sf::VertexArray shapes; ///< The vertices composing the light
    //std::vector <sf::Vertex> m_shape;

    private :

    //Qualité de la lumière, c'est à dire le nombre de triangles par défaut qui la compose.
    int m_quality;
};

#endif


