#ifndef TEST2_H_INCLUDED
#define TEST2_H_INCLUDED


////////////////////////////////////////////////////////////
/// Custom SFML canvas
////////////////////////////////////////////////////////////
class MyCanvas : public wxSFMLCanvas
{
public :

    ////////////////////////////////////////////////////////////
    /// Construct the canvas
    ///
    ////////////////////////////////////////////////////////////
    MyCanvas(wxWindow* Parent, wxWindowID Id, const wxPoint& Position, const wxSize& Size, long Style = 0) :
    wxSFMLCanvas(Parent, Id, Position, Size, Style)
    {
        // Change background color
        SetBackgroundColor(sf::Color(0, 128, 128));

        // Load an image and assign it to our sprite
        myImage.LoadFromFile("sprite.png");
        mySprite.SetImage(myImage);
    }

private :

    ////////////////////////////////////////////////////////////
    /// /see wxSFMLCanvas::OnUpdate
    ///
    ////////////////////////////////////////////////////////////
    virtual void OnUpdate()
    {
        Draw(mySprite);
    }

    ////////////////////////////////////////////////////////////
    /// Member data
    ////////////////////////////////////////////////////////////
    sf::Image  myImage;  ///< Some image to load...
    sf::Sprite mySprite; ///< Something to draw...
};

#endif // TEST2_H_INCLUDED
