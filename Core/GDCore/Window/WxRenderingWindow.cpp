#include "GDCore/Window/WxRenderingWindow.h"

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include <memory>

#include <wx/app.h>
#include <wx/dcbuffer.h>
#include <wx/rawbmp.h>

#include "GDCore/Tools/MakeUnique.h"

namespace
{

    /**
     * Adapted from https://forums.wxwidgets.org/viewtopic.php?t=20074
     */
    typedef wxAlphaPixelData PixelData;
    std::unique_ptr<wxBitmap> RGBAtoBitmap(const unsigned char *rgba, int w, int h)
    {
        auto bitmap = gd::make_unique<wxBitmap>(w, h, 32);
        if(!bitmap->Ok())
        {
            return std::unique_ptr<wxBitmap>();
        }

        PixelData bmdata(*bitmap);
        if(!bmdata)
        {
            return std::unique_ptr<wxBitmap>();
        }

        bmdata.UseAlpha();
        PixelData::Iterator dst(bmdata);

        for(int y = 0; y < h; y++)
        {
            dst.MoveTo(bmdata, 0, y);
            for(int x = 0; x < w; x++)
            {
                // wxBitmap contains rgb values pre-multiplied with alpha
                unsigned char a = rgba[3];
                dst.Red() = rgba[0] * a / 255;
                dst.Green() = rgba[1] * a / 255;
                dst.Blue() = rgba[2] * a / 255;
                dst.Alpha() = a;
                dst++;
                rgba += 4;
            }
        }
        return bitmap;
    }

}

namespace gd
{

std::map<int, sf::Keyboard::Key> WxRenderingWindow::keysMap = std::map<int, sf::Keyboard::Key>();
bool WxRenderingWindow::keysMapInitialized = false;

WxRenderingWindow::WxRenderingWindow(wxWindow * parent, sf::Vector2u renderingSize, wxWindowID id, const wxPoint & pos, const wxSize & size, long style, const wxString & name) :
    wxControl(parent, id, pos, size, style|wxWANTS_CHARS|wxBORDER_NONE, wxDefaultValidator, name),
    idleEventEnabled(true),
    hasRendered(true),
    eventsQueue()
{
    bool automaticSize = (renderingSize == sf::Vector2u(-1, -1));

    texture.create(size.GetWidth(), size.GetHeight(), true);

    Bind(wxEVT_PAINT, &WxRenderingWindow::OnPaint, this);
	Bind(wxEVT_ERASE_BACKGROUND, &WxRenderingWindow::OnEraseBackground, this);
    Bind(wxEVT_IDLE, &WxRenderingWindow::OnIdle, this);
    Bind(wxEVT_SIZE, &WxRenderingWindow::OnSizeChanged, this);

    Bind(wxEVT_KEY_DOWN, &WxRenderingWindow::OnKeyDown, this);
    Bind(wxEVT_KEY_UP, &WxRenderingWindow::OnKeyUp, this);
    Bind(wxEVT_CHAR, &WxRenderingWindow::OnCharEntered, this);

    Bind(wxEVT_LEFT_DOWN, &WxRenderingWindow::OnMouseEvents, this);
    Bind(wxEVT_LEFT_UP, &WxRenderingWindow::OnMouseEvents, this);
    Bind(wxEVT_RIGHT_DOWN, &WxRenderingWindow::OnMouseEvents, this);
    Bind(wxEVT_RIGHT_UP, &WxRenderingWindow::OnMouseEvents, this);
    Bind(wxEVT_MIDDLE_DOWN, &WxRenderingWindow::OnMouseEvents, this);
    Bind(wxEVT_MIDDLE_UP, &WxRenderingWindow::OnMouseEvents, this);
    Bind(wxEVT_AUX1_DOWN, &WxRenderingWindow::OnMouseEvents, this);
    Bind(wxEVT_AUX1_UP, &WxRenderingWindow::OnMouseEvents, this);
    Bind(wxEVT_AUX2_DOWN, &WxRenderingWindow::OnMouseEvents, this);
    Bind(wxEVT_AUX2_UP, &WxRenderingWindow::OnMouseEvents, this);
    Bind(wxEVT_MOUSEWHEEL, &WxRenderingWindow::OnMouseEvents, this);
}

const sf::RenderTarget & WxRenderingWindow::GetRenderingTarget() const
{
    return texture;
}

sf::RenderTarget & WxRenderingWindow::GetRenderingTarget()
{
    return texture;
}

void WxRenderingWindow::Display()
{
    texture.display();
}

sf::Texture WxRenderingWindow::CaptureAsTexture() const
{
    return sf::Texture(texture.getTexture());
}

bool WxRenderingWindow::PollEvent(sf::Event & event)
{
    if(eventsQueue.empty())
        return false;

    event = eventsQueue.front();
    eventsQueue.pop();
    return true;
}

sf::Vector2i WxRenderingWindow::GetPosition() const
{
    return sf::Vector2i(
        wxControl::GetScreenPosition().x,
        wxControl::GetScreenPosition().y);
}

void WxRenderingWindow::SetPosition(const sf::Vector2i & pos)
{
    //Do nothing
}

sf::Vector2u WxRenderingWindow::GetSize() const
{
    return texture.getSize();
}

void WxRenderingWindow::SetSize(const sf::Vector2u & size)
{
    texture.create(size.x, size.y, true);
    ForceUpdate();
}

bool WxRenderingWindow::SetActive(bool active)
{
    texture.setActive(active);
}

void WxRenderingWindow::EnableIdleEvents(bool enable)
{
    idleEventEnabled = enable;
    ForceUpdate();
}

void WxRenderingWindow::OnPaint(wxPaintEvent& event)
{
    wxAutoBufferedPaintDC dc(this);

    sf::Image sfImage = texture.getTexture().copyToImage();
    auto bitmap = RGBAtoBitmap(sfImage.getPixelsPtr(), sfImage.getSize().x, sfImage.getSize().y);

    dc.DrawBitmap(*bitmap, 0, 0, false);

    hasRendered = true;

    if(idleEventEnabled)
        wxWakeUpIdle(); // Tell wxWidgets to send an idle event
}

void WxRenderingWindow::OnEraseBackground(wxEraseEvent& event)
{

}

void WxRenderingWindow::OnIdle(wxIdleEvent & event)
{
    if(idleEventEnabled)
    {
        // Send a paint message when the control is idle and has rendered the previous frame
        if(hasRendered)
        {
            OnUpdate();
            hasRendered = false; //Prevent another idle event to update the game before the previous frame has been drawn
            Refresh();
        }

        //Note: A new idle event will be required in OnPaint to avoid to process useless idle events
        //      This greatly reduce the CPU load of this panel
    }
}

void WxRenderingWindow::OnSizeChanged(wxSizeEvent & event)
{
    //Do nothing as it causes some troubles on Windows!
}

void WxRenderingWindow::OnKeyDown(wxKeyEvent & event)
{
    event.Skip();
    if(event.GetKeyCode() == WXK_NONE || GetKeyMap().count(event.GetKeyCode()) == 0)
        return;

    sf::Event keyEvent;
    keyEvent.type = sf::Event::KeyPressed;
    keyEvent.key.code = GetKeyMap()[event.GetKeyCode()];
    keyEvent.key.alt = event.AltDown();
    keyEvent.key.control = event.ControlDown();
    keyEvent.key.shift = event.ShiftDown();
    keyEvent.key.system = event.MetaDown();

    eventsQueue.push(keyEvent);
}

void WxRenderingWindow::OnKeyUp(wxKeyEvent & event)
{
    event.Skip();
    if(event.GetKeyCode() == WXK_NONE || GetKeyMap().count(event.GetKeyCode()) == 0)
        return;

    sf::Event keyEvent;
    keyEvent.type = sf::Event::KeyReleased;
    keyEvent.key.code = GetKeyMap()[event.GetKeyCode()];
    keyEvent.key.alt = event.AltDown();
    keyEvent.key.control = event.ControlDown();
    keyEvent.key.shift = event.ShiftDown();
    keyEvent.key.system = event.MetaDown();

    eventsQueue.push(keyEvent);
}

void WxRenderingWindow::OnCharEntered(wxKeyEvent & event)
{
    if(event.GetUnicodeKey() != WXK_NONE)
    {
        sf::Event textEvent;
        textEvent.type = sf::Event::TextEntered;
        textEvent.text.unicode = static_cast<sf::Uint32>(event.GetUnicodeKey());

        eventsQueue.push(textEvent);
    }

    event.Skip();
}

void WxRenderingWindow::OnMouseEvents(wxMouseEvent & event)
{
    if(event.IsButton() && !event.ButtonDClick())
    {
        sf::Event buttonEvent;

        if(event.ButtonDown())
            buttonEvent.type = sf::Event::MouseButtonPressed;
        else if(event.ButtonUp()) // Button up
            buttonEvent.type = sf::Event::MouseButtonReleased;
        else
            return;

        if(event.Button(wxMOUSE_BTN_LEFT))
            buttonEvent.mouseButton.button = sf::Mouse::Left;
        else if(event.Button(wxMOUSE_BTN_RIGHT))
            buttonEvent.mouseButton.button = sf::Mouse::Right;
        else if(event.Button(wxMOUSE_BTN_MIDDLE))
            buttonEvent.mouseButton.button = sf::Mouse::Middle;
        else if(event.Button(wxMOUSE_BTN_AUX1))
            buttonEvent.mouseButton.button = sf::Mouse::XButton1;
        else if(event.Button(wxMOUSE_BTN_AUX2))
            buttonEvent.mouseButton.button = sf::Mouse::XButton2;
        else
            return;

        buttonEvent.mouseButton.x = GetMousePosition(*this).x;
        buttonEvent.mouseButton.y = GetMousePosition(*this).y;
        eventsQueue.push(buttonEvent);
    }
    else if(event.GetEventType() == wxEVT_MOUSEWHEEL)
    {
        // Push the corresponding SFML mouse wheel event
        sf::Event wheelEvent;
        wheelEvent.type = sf::Event::MouseWheelScrolled;
        wheelEvent.mouseWheelScroll.wheel =
            event.GetWheelAxis() == wxMOUSE_WHEEL_VERTICAL ?
                sf::Mouse::Wheel::VerticalWheel :
                sf::Mouse::Wheel::HorizontalWheel;
        wheelEvent.mouseWheelScroll.delta = static_cast<float>(event.GetWheelRotation()) / static_cast<float>(event.GetWheelDelta());
        wheelEvent.mouseWheelScroll.x = GetMousePosition(*this).x;
        wheelEvent.mouseWheelScroll.y = GetMousePosition(*this).y;
        eventsQueue.push(wheelEvent);

        // Also generate the deprecated one
        sf::Event deprecatedEvent;
        deprecatedEvent.type = sf::Event::MouseWheelMoved;
        deprecatedEvent.mouseWheel.delta = static_cast<float>(event.GetWheelRotation()) / static_cast<float>(event.GetWheelDelta());
        deprecatedEvent.mouseWheel.x = GetMousePosition(*this).x;
        deprecatedEvent.mouseWheel.y = GetMousePosition(*this).y;
        eventsQueue.push(deprecatedEvent);
    }

    event.Skip();
}

void WxRenderingWindow::ForceUpdate()
{
    texture.clear(sf::Color(255, 255, 255, 255));
    hasRendered = true;
    wxWakeUpIdle();
}

std::map<int, sf::Keyboard::Key> & WxRenderingWindow::GetKeyMap()
{
    if(!keysMapInitialized)
    {
        /*keysMap[WXK_F1] = sf::Keyboard::F1;
        keysMap[WXK_F2] = sf::Keyboard::F2;
        keysMap['Z'] = sf::Keyboard::Z;*/

        keysMap[WXK_NONE] = sf::Keyboard::Unknown;

        keysMap['A'] = sf::Keyboard::A;
        keysMap['B'] = sf::Keyboard::B;
        keysMap['C'] = sf::Keyboard::C;
        keysMap['D'] = sf::Keyboard::D;
        keysMap['E'] = sf::Keyboard::E;
        keysMap['F'] = sf::Keyboard::F;
        keysMap['G'] = sf::Keyboard::G;
        keysMap['H'] = sf::Keyboard::H;
        keysMap['I'] = sf::Keyboard::I;
        keysMap['J'] = sf::Keyboard::J;
        keysMap['K'] = sf::Keyboard::K;
        keysMap['L'] = sf::Keyboard::L;
        keysMap['M'] = sf::Keyboard::M;
        keysMap['N'] = sf::Keyboard::N;
        keysMap['O'] = sf::Keyboard::O;
        keysMap['P'] = sf::Keyboard::P;
        keysMap['Q'] = sf::Keyboard::Q;
        keysMap['R'] = sf::Keyboard::R;
        keysMap['S'] = sf::Keyboard::S;
        keysMap['T'] = sf::Keyboard::T;
        keysMap['U'] = sf::Keyboard::U;
        keysMap['V'] = sf::Keyboard::V;
        keysMap['W'] = sf::Keyboard::W;
        keysMap['X'] = sf::Keyboard::X;
        keysMap['Y'] = sf::Keyboard::Y;
        keysMap['Z'] = sf::Keyboard::Z;

        keysMap['1'] = sf::Keyboard::Num1;
        keysMap['2'] = sf::Keyboard::Num2;
        keysMap['3'] = sf::Keyboard::Num3;
        keysMap['4'] = sf::Keyboard::Num4;
        keysMap['5'] = sf::Keyboard::Num5;
        keysMap['6'] = sf::Keyboard::Num6;
        keysMap['7'] = sf::Keyboard::Num7;
        keysMap['8'] = sf::Keyboard::Num8;
        keysMap['9'] = sf::Keyboard::Num9;
        keysMap['0'] = sf::Keyboard::Num0;

        keysMap[WXK_ESCAPE] = sf::Keyboard::Escape;

        keysMap[WXK_RAW_CONTROL /* or WXK_CONTROL, depends on Mac OS X impl of SFML ? */] = sf::Keyboard::LControl;
        keysMap[WXK_SHIFT] = sf::Keyboard::LShift;
        keysMap[WXK_ALT] = sf::Keyboard::LAlt;
        keysMap[WXK_RAW_CONTROL /* or WXK_CONTROL, depends on Mac OS X impl of SFML ? */] = sf::Keyboard::RControl;
        keysMap[WXK_SHIFT] = sf::Keyboard::RShift;
        keysMap[WXK_ALT] = sf::Keyboard::RAlt;
        // Unfortunately, no ways to distinguish between left and right modifiers with wxWidgets' key codes

        #if defined(WIN32)
        keysMap[WXK_WINDOWS_LEFT] = sf::Keyboard::LSystem;
        keysMap[WXK_WINDOWS_RIGHT] = sf::Keyboard::RSystem;
        #elif defined(MACOS)
        keysMap[WXK_CONTROL] = sf::Keyboard::LSystem;
        keysMap[WXK_CONTROL] = sf::Keyboard::RSystem; // No way to know the side of this key too on MACOS
        #endif
        // The Windows/Command key doesn't work on Linux

        keysMap[WXK_MENU] = sf::Keyboard::Menu;

        keysMap['('] = sf::Keyboard::LBracket;
        keysMap[')'] = sf::Keyboard::RBracket;
        keysMap[';'] = sf::Keyboard::SemiColon;
        keysMap[','] = sf::Keyboard::Comma;
        keysMap['.'] = sf::Keyboard::Period;
        keysMap['"'] = sf::Keyboard::Quote;
        keysMap['/'] = sf::Keyboard::Slash;
        keysMap['\\'] = sf::Keyboard::BackSlash;
        keysMap['~'] = sf::Keyboard::Tilde;
        keysMap['='] = sf::Keyboard::Equal;
        keysMap['-'] = sf::Keyboard::Dash;

        keysMap[WXK_SPACE] = sf::Keyboard::Space;
        keysMap[WXK_RETURN] = sf::Keyboard::Return;
        keysMap[WXK_BACK] = sf::Keyboard::BackSpace;
        keysMap[WXK_TAB] = sf::Keyboard::Tab;

        keysMap[WXK_PAGEUP] = sf::Keyboard::PageUp;
        keysMap[WXK_PAGEDOWN] = sf::Keyboard::PageDown;
        keysMap[WXK_END] = sf::Keyboard::End;
        keysMap[WXK_HOME] = sf::Keyboard::Home;
        keysMap[WXK_INSERT] = sf::Keyboard::Insert;
        keysMap[WXK_DELETE] = sf::Keyboard::Delete;

        keysMap[WXK_NUMPAD_ADD] = sf::Keyboard::Add;
        keysMap[WXK_NUMPAD_SUBTRACT] = sf::Keyboard::Subtract;
        keysMap[WXK_NUMPAD_MULTIPLY] = sf::Keyboard::Multiply;
        keysMap[WXK_NUMPAD_DIVIDE] = sf::Keyboard::Divide;

        keysMap[WXK_UP] = sf::Keyboard::Left;
        keysMap[WXK_RIGHT] = sf::Keyboard::Right;
        keysMap[WXK_UP] = sf::Keyboard::Up;
        keysMap[WXK_DOWN] = sf::Keyboard::Down;

        keysMap[WXK_NUMPAD0] = sf::Keyboard::Numpad0;
        keysMap[WXK_NUMPAD1] = sf::Keyboard::Numpad1;
        keysMap[WXK_NUMPAD2] = sf::Keyboard::Numpad2;
        keysMap[WXK_NUMPAD3] = sf::Keyboard::Numpad3;
        keysMap[WXK_NUMPAD4] = sf::Keyboard::Numpad4;
        keysMap[WXK_NUMPAD5] = sf::Keyboard::Numpad5;
        keysMap[WXK_NUMPAD6] = sf::Keyboard::Numpad6;
        keysMap[WXK_NUMPAD7] = sf::Keyboard::Numpad7;
        keysMap[WXK_NUMPAD8] = sf::Keyboard::Numpad8;
        keysMap[WXK_NUMPAD9] = sf::Keyboard::Numpad9;

        keysMap[WXK_F1] = sf::Keyboard::F1;
        keysMap[WXK_F2] = sf::Keyboard::F2;
        keysMap[WXK_F3] = sf::Keyboard::F3;
        keysMap[WXK_F4] = sf::Keyboard::F4;
        keysMap[WXK_F5] = sf::Keyboard::F5;
        keysMap[WXK_F6] = sf::Keyboard::F6;
        keysMap[WXK_F7] = sf::Keyboard::F7;
        keysMap[WXK_F8] = sf::Keyboard::F8;
        keysMap[WXK_F9] = sf::Keyboard::F9;
        keysMap[WXK_F10] = sf::Keyboard::F10;
        keysMap[WXK_F11] = sf::Keyboard::F11;
        keysMap[WXK_F12] = sf::Keyboard::F12;
        keysMap[WXK_F13] = sf::Keyboard::F13;
        keysMap[WXK_F14] = sf::Keyboard::F14;
        keysMap[WXK_F15] = sf::Keyboard::F15;

        keysMap[WXK_PAUSE] = sf::Keyboard::Pause;
    }

    return keysMap;
}

}

#endif
