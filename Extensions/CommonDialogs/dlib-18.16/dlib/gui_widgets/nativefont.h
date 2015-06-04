// Copyright (C) 2006 Keita Mochizuki 
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_IGG_FONT_RENDERER_H_
#define DLIB_IGG_FONT_RENDERER_H_
#include "../platform.h"


#include "../gui_widgets.h"
#include "../unicode.h"
#include "../smart_pointers_thread_safe.h"
#include "../uintn.h"

#include <map>

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <locale.h>

#if defined(WIN32)
#include <windows.h>
#include <mbstring.h>
#elif defined(POSIX)
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <X11/Xlocale.h>
#endif

namespace nativefont
{
// ----------------------------------------------------------------------------------------

    namespace font_renderer
    {
        typedef dlib::uint8 byte;


#ifdef WIN32
        template <typename T> struct input2native_trait{
        };
        template <> struct input2native_trait<char>{
            typedef char type_t;
        };
        template <> struct input2native_trait<wchar_t>{
            typedef wchar_t type_t;
        };
        template <> struct input2native_trait<dlib::unichar>{
            typedef wchar_t type_t;
        };
#endif
        // T : N : sizeof_source_type
        template <int N> struct size2inner_trait{
        };
        template <> struct size2inner_trait<1>{
            typedef char type_t;
        };
        template <> struct size2inner_trait<2>{
            typedef dlib::uint16 type_t;
        };
        template <> struct size2inner_trait<4>{
            typedef dlib::unichar type_t;
        };


// ----------------------------------------------------------------------------------------

        template <int N> struct create_helper{ };
        template <> struct create_helper<1>{
            typedef char type_t;
            type_t *istr;
            int len;
            create_helper(char *str){
                len = (int)strlen(str);
                istr = str;
            }
            ~create_helper(){}
        };
        template <> struct create_helper<2>{
            typedef wchar_t type_t;
            type_t *istr;
            bool allocated;
            int len;
            create_helper(wchar_t *str){
                allocated = false;
                len = (int)wcslen(str);
                istr = str;
            }
            create_helper(dlib::unichar *str){
                allocated = true;
                len = 0;
                int unicount = 0;
                dlib::unichar *p = str;
                while(*p){
                    if (*p > 0xffff){
                        len += 2;
                    }else{
                        len++;
                    }
                    unicount++;
                    p++;
                }
                istr = new wchar_t[len+1];
                for (int i = 0, wi = 0; i < unicount; ++i){
                    dlib::unichar high, low;
                    if (str[i] > 0xffff){
                        dlib::unichar_to_surrogate_pair(str[i], high, low);
                        istr[wi] = (wchar_t)high, istr[wi+1] = (wchar_t)low;
                        wi += 2;
                    }else{
                        istr[wi] = (wchar_t)str[i];
                        wi += 1;
                    }
                }
                istr[len] = L'\0';
            }

            ~create_helper(){
                if (allocated) delete[] istr;
            }
        };
        template <> struct create_helper<4>{
            typedef wchar_t type_t;
            type_t *istr;
            int len;
            create_helper(dlib::unichar *str){
                len = (int)wcslen((wchar_t *)str);
                istr = (type_t *)str;
            }
            ~create_helper(){}
        };

// ----------------------------------------------------------------------------------------

        class font_renderer{
        public:

            struct rgb_type{
                byte r, g, b;
                rgb_type() : r(0), g(0), b(0){};
                rgb_type(byte r_, byte g_, byte b_) : r(r_), g(g_), b(b_){};
            };
        private:

            byte *image;
            int width, height;
            void destroy(){
                width = height = 0;
                delete image;
                image = 0;
            }
            struct vals_internal{
                int width, height;
#ifdef WIN32
                COLORREF rgb2RGB(rgb_type &rgb){
                    return RGB(rgb.r, rgb.g, rgb.b);
                }
                HBITMAP hBmp, hBmpOld;
                HDC hDCBmp;
                BYTE *pixelint;
                HFONT hFont, hFontOld;
                HBRUSH hBrush;
                int pix_width_prev, pix_height_prev;
                bool first;
                int ascender, descender;
                int height_prev;
                char attribute_prev;

                template <typename T> void create(T *str, int height_want, bool italic, bool bold, bool fixed, rgb_type &background, rgb_type &foreground){
                    struct inner{
                        inline static BOOL GetTextExtentPoint32(HDC hDC, LPCSTR str, int len, LPSIZE lpsize){
                            return ::GetTextExtentPoint32A(hDC, str, len, lpsize);
                        }
                        inline static BOOL GetTextExtentPoint32(HDC hDC, LPCWSTR str, int len, LPSIZE lpsize){
                            return ::GetTextExtentPoint32W(hDC, str, len, lpsize);
                        }
                        inline static BOOL TextOut(HDC hDC, int nxstart, int nystart, LPCSTR str, int cbstr){
                            return ::TextOutA(hDC, nxstart, nystart, str, cbstr);
                        }
                        inline static BOOL TextOut(HDC hDC, int nxstart, int nystart, LPCWSTR str, int cbstr){
                            return ::TextOutW(hDC, nxstart, nystart, str, cbstr);
                        }
                    };

                    create_helper<sizeof(typename input2native_trait<T>::type_t)> ch(str);

                    if (hDCBmp == NULL){
                        HWND hWnd = GetDesktopWindow();
                        HDC hDC = GetDC(hWnd);
                        hDCBmp = CreateCompatibleDC(hDC);
                        ReleaseDC(hWnd, hDC);
                    }
                    SetTextColor(hDCBmp, rgb2RGB(foreground));
                    SetBkColor(hDCBmp, rgb2RGB(background));

                    char attribute = (italic ? 1 : 0) | (bold ? 2 : 0) | (fixed ? 4 : 0);
                    if (!hFont || height_prev != height || attribute != attribute_prev){
                        attribute_prev = attribute;
                        height_prev = height_want;
                        if (hFont){
                            SelectObject(hDCBmp, hFontOld);
                            DeleteObject(hFont);
                        }
                        hFont = CreateFont(height_want, 0, 0, 0, bold ? FW_BOLD : FW_DONTCARE, italic ? TRUE : FALSE, 
                                           FALSE, FALSE, DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, DEFAULT_QUALITY,
                                           fixed ? (FIXED_PITCH | FF_DONTCARE) : (VARIABLE_PITCH | FF_DONTCARE), NULL);
                        hFontOld = (HFONT)SelectObject(hDCBmp, hFont);
                    }

                    {
                        SIZE sz;
                        inner::GetTextExtentPoint32(hDCBmp, ch.istr, ch.len, &sz);
                        width = ((sz.cx + 3) / 4) * 4;
                        height = sz.cy;
                    }

                    if (pix_width_prev < width || pix_height_prev < height){
                        if (hBmp){
                            SelectObject(hDCBmp, hBmpOld);
                            DeleteObject(hBmp);
                        }
                        pix_width_prev = width * 2;
                        pix_height_prev = height * 2;
                        BITMAPINFO bi;
                        ZeroMemory(&bi, sizeof(bi));
                        bi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
                        bi.bmiHeader.biBitCount = 24;
                        bi.bmiHeader.biPlanes = 1;
                        bi.bmiHeader.biWidth = pix_width_prev;
                        bi.bmiHeader.biHeight = -pix_height_prev;
                        hBmp = CreateDIBSection(NULL, &bi, DIB_RGB_COLORS, (void **)&pixelint, NULL, 0);
                        hBmpOld = (HBITMAP)SelectObject(hDCBmp, hBmp);
                    }

                    {
                        HBRUSH hBrush = CreateSolidBrush(rgb2RGB(background));
                        RECT rc;
                        rc.left = rc.top = 0;
                        rc.right = pix_width_prev;
                        rc.bottom = pix_height_prev;
                        FillRect(hDCBmp, &rc, hBrush);
                    }

                    inner::TextOut(hDCBmp, 0, 0, ch.istr, ch.len);
                    TEXTMETRICW tm;
                    GetTextMetricsW(hDCBmp,&tm);
                    ascender = tm.tmAscent;
                    descender = tm.tmDescent;
                }

                template <typename T> vals_internal(T *str, int height_want, bool italic = false,
                    bool bold = false, bool fixed = false, rgb_type background = rgb_type(), rgb_type foreground = rgb_type()){
                    first = true;
                    hFont = NULL;
                    hDCBmp = 0;
                    hBmpOld = 0;
                    hBmp = 0;
                    hDCBmp = 0;
                    pixelint = 0;
                    pix_width_prev = pix_height_prev = 0;
                    height_prev = -1;
                    attribute_prev = 0;
                    create(str, height_want, italic, bold, fixed, background, foreground);
                    first = false;
                }

                inline int get_ascender(){
                    return ascender;
                }

                inline int get_descender(){
                    return descender;
                }

                inline void get_pixel(int x, int y, byte &r, byte &g, byte &b){
                    byte *p = pixelint + (y * pix_width_prev + x) * 3;
                    r = *(p+2), g = *(p+1), b = *p;
                }

                void destroy(){
                    SelectObject(hDCBmp, hBmpOld);
                    DeleteObject(hBmp);
                    SelectObject(hDCBmp, hFontOld);
                    DeleteObject(hFont);
                    DeleteDC(hDCBmp);
                    hFont = NULL;
                    hDCBmp = 0;
                    hBmpOld = 0;
                    hBmp = 0;
                    hDCBmp = 0;
                    pixelint = 0;
                }
                ~vals_internal(){
                    destroy();
                }
#elif defined(POSIX)
                XImage *ximg;
                Display *d;
                GC gc;
                XFontSet fs;
                Pixmap pix;
                Colormap cmap;
                int ascender, descender;
                int pix_width_prev, pix_height_prev;
                char fontset_prev[256];
                unsigned long rgb2color(rgb_type col, Display *d, Colormap &cmap){
                    XColor xcol;
                    xcol.red = col.r * 257;
                    xcol.green = col.g * 257;
                    xcol.blue = col.b * 257;
                    XAllocColor(d, cmap, &xcol);
                    return xcol.pixel;
                }
                template <typename T> void create(T *str, int height_want, bool italic, bool bold, bool fixed, rgb_type background, rgb_type foreground){
                    struct inner{
                        inline static int XTextExtents (XFontSet fs, char *str, int len, XRectangle *ink, XRectangle *logical){
                            return XmbTextExtents(fs, str, len, ink, logical);
                        }
                        inline static int XTextExtents (XFontSet fs, wchar_t *str, int len, XRectangle *ink, XRectangle *logical){
                            return XwcTextExtents(fs, str, len, ink, logical);
                        }
                        inline static void XDrawString(Display *d, Window w, XFontSet fs, GC gc, int x, int y, char *str, int num_bytes){
                            XmbDrawString(d, w, fs, gc, x, y, str, num_bytes);
                        }
                        inline static void XDrawString(Display *d, Window w, XFontSet fs, GC gc, int x, int y, wchar_t *str, int num_bytes){
                            XwcDrawString(d, w, fs, gc, x, y, str, num_bytes);
                        }
                    };
                    create_helper<sizeof(T)> ch((typename size2inner_trait<sizeof(T)>::type_t *)str);
                    setlocale(LC_CTYPE, "");
                    if (d == NULL){
                        d = XOpenDisplay(NULL);
                        if (d == 0)
                        {
                            d = XOpenDisplay(":0.0");
                            if (d == 0)
                            {
                                throw dlib::gui_error("Unable to connect to the X display.");
                            }
                        }

                        cmap = DefaultColormap(d, DefaultScreen(d));
                    }
                    char fontset[256];
                    {
                        char *p = fontset;
                        p += sprintf(fontset, "-*-*-%s-%c-normal--%d-*-*-*-%c",
                                     bold ? "bold" : "medium", italic ? 'i' : 'r', height_want, fixed ? 'c' : 'p');
                        if (fixed){
                            sprintf(p, ",-*-*-%s-%c-normal--%d-*-*-*-m",
                                    bold ? "bold" : "medium", italic ? 'i' : 'r', height_want);
                        }
                    }
                    bool equal_font;
                    if (strcmp(fontset, fontset_prev) == 0){
                        equal_font = true;
                    }else{
                        equal_font = false;
                        strcpy(fontset_prev, fontset);
                    }

                    char **mlist;
                    int mcount;
                    char *def_str;
                    if (!equal_font){
                        if (fs){
                            XFreeFontSet(d, fs);
                        }
                        fs = XCreateFontSet(d, fontset, &mlist, &mcount, &def_str);
                        if (fs == NULL)
                           throw dlib::gui_error("gui_error: XCreateFontSet() failure");

                        XFontSetExtents *extent;
                        extent = XExtentsOfFontSet(fs);
                        ascender = -extent->max_logical_extent.y;
                        descender = extent->max_logical_extent.height - ascender;
                        XFreeStringList(mlist);
                    }
                    XRectangle ink, logical;
                    inner::XTextExtents (fs, ch.istr, ch.len, &ink, &logical);
                    width = logical.width;
                    height = height_want;

                    if (pix == None || pix_width_prev < width || pix_height_prev < height){
                        if (pix != None){
                            XFreeGC(d, gc);
                            XFreePixmap(d, pix);
                        }
                        pix_width_prev = width * 2;
                        pix_height_prev = height * 2;
                        pix = XCreatePixmap(d, DefaultRootWindow(d), pix_width_prev, pix_height_prev, XDefaultDepth(d, DefaultScreen(d)));
                        gc = XCreateGC(d, pix, 0, NULL);
                    }

                    unsigned long backcolor = rgb2color(background, d, cmap);
                    XSetForeground(d, gc, backcolor);
                    XSetBackground(d, gc, backcolor);
                    XFillRectangle(d, pix, gc, 0, 0, width, height);
                    XSetForeground(d, gc, rgb2color(foreground, d, cmap));
                    inner::XDrawString(d, pix, fs, gc, 0, ascender, ch.istr, ch.len);

                    if (ximg) XDestroyImage(ximg);
                    ximg = XGetImage(d, pix, 0, 0, width, height, AllPlanes, ZPixmap );
                }

                template <typename T> vals_internal(T *str, int height_want, bool italic = false,
                    bool bold = false, bool fixed = false, rgb_type background = rgb_type(), rgb_type foreground = rgb_type()){
                    fontset_prev[0] = '\0';
                    ximg = NULL;
                    d = NULL;
                    pix = None;
                    fs = NULL;
                    ascender = descender = -1;
                    pix_width_prev = pix_height_prev = -1;
                    create(str, height_want, italic, bold, fixed, background, foreground);
                }

                inline int get_ascender(){
                    return ascender;
                }

                inline int get_descender(){
                    return descender;
                }

                std::map<unsigned long,rgb_type> col2rgb;
                rgb_type color2rgb(unsigned long color, Display *d, Colormap &cmap){
                    if (col2rgb.count(color)){
                        return col2rgb[color];
                    }else{
                        XColor xcol;
                        xcol.pixel = color;
                        XQueryColor(d, cmap, &xcol);
                        rgb_type rgb_((byte)(xcol.red/257), (byte)(xcol.green/257), (byte)(xcol.blue/257));
                        col2rgb[color] = rgb_;
                        return rgb_;
                    }
                }
                inline void get_pixel(int x, int y, byte &r, byte &g, byte &b){
                    rgb_type c = color2rgb(XGetPixel(ximg,x,y), d, cmap);
                    r = c.r, g = c.g, b = c.b;
                }

                ~vals_internal(){
                    XDestroyImage(ximg);

                    XFreeGC(d, gc);
                    XFreeFontSet(d, fs);
                    XFreePixmap(d, pix);
                    XCloseDisplay(d);
                }
#endif
            };

            struct image_size_setter{
                void operator()(int&, int&){
                }
            };

            int ascender, descender;
            vals_internal *vi;
        public:
            font_renderer() : image(0), width(0), height(0){
                ascender = descender = 0;
                vi = NULL;
            }

            template<typename T> font_renderer(T *str, int height_want, bool italic = false, bool bold = false, bool fixed = false,         rgb_type background = rgb_type(0,0,0), rgb_type foreground = rgb_type(255,255,255)){
                render(str, height_want, italic, bold, fixed, background, foreground);
            }

            template<typename T> void render(T *str, int height_want,
                                             bool italic = false, bool bold = false, bool fixed = false,
                                             rgb_type background = rgb_type(0,0,0), rgb_type foreground = rgb_type(255,255,255)){
                if (vi == NULL){
                    vi = new vals_internal(str, height_want, italic, bold, fixed, background, foreground);
                }else{
                    vi->create(str, height_want, italic, bold, fixed, background, foreground);
                }
                width = vi->width, height = vi->height;
                image = new byte[width * height * 3];
                ascender = vi->get_ascender();
                descender = vi->get_descender();

                int h = height, w = width;
                for (int j = 0, i3 = 0; j < h; ++j){
                    for (int i = 0; i < w; ++i, i3 += 3){
                        vi->get_pixel(i, j, image[i3], image[i3+1], image[i3+2]);
                    }
                }
            }

            ~font_renderer(){
                if (vi) delete vi;
                destroy();
            }
            int get_width(){
                return width;
            }
            int get_height(){
                return height;
            }
            inline int get_ascender(){
                return ascender;
            }
            inline int get_descender(){
                return descender;
            }

            const byte *get_image(){
                return image;
            }
        };
    }

// ----------------------------------------------------------------------------------------

    class native_font : public dlib::font 
    {
        unsigned long ascender_;
        native_font(){
            setlocale(LC_CTYPE, "");
            ascender_ = 0;
            get_letter((int)('x'));
        }
        typedef std::map<int,dlib::letter *> letters_map_type;
        letters_map_type letters;
        font_renderer::font_renderer fl;
    public:

        virtual ~native_font() 
        {
            // delete all the letter objects we have in our letters map
            letters_map_type::iterator i;
            for (i = letters.begin(); i != letters.end(); ++i)
            {
                delete i->second;
            }
        }

        virtual bool has_character (
            dlib::unichar ch
        )const{
            return (*this)[ch].width() > 0;
        }

        static const dlib::shared_ptr_thread_safe<font>& get_font (
        )
        {
            static dlib::shared_ptr_thread_safe<font> f(new native_font);
            return f;
        }

        virtual const dlib::letter& operator[] (dlib::unichar ch) const{
            return (const_cast<native_font *>(this))->get_letter(ch);
        }

        dlib::letter& get_letter (
            dlib::unichar ch
        ){
            if (letters.count(ch)){
                dlib::letter *l = letters.find(ch)->second;
                return *l;
            }

            dlib::unichar c[2];
            c[0] = ch;
            c[1] = 0;

            fl.render(c, height(),false,false,true);
            if (ascender_ == 0){
                ascender_ = fl.get_ascender();
            }
            std::vector<dlib::letter::point> v;
            const font_renderer::byte *bp = fl.get_image();
            for (int j = 0; j < fl.get_height(); ++j){
                for (int i = 0; i < fl.get_width(); ++i, bp += 3){
                    if (*bp){
                        v.push_back(dlib::letter::point(i,j-ascender()+1));
                    }
                }
            }
            dlib::letter *l = new dlib::letter(fl.get_width(), (unsigned long)v.size());

            letters.insert(std::make_pair(ch,l));
            for (int i = 0; i < (int)v.size(); ++i){
                (*l)[i] = v.at(i);
            }
            return *l;
        }

        virtual unsigned long height (
        ) const { return 12; }

        virtual unsigned long ascender (
        ) const { return ascender_; }

        virtual unsigned long left_overflow (
        ) const { return 1; }

        virtual unsigned long right_overflow (
        ) const { return 2; }
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_IGG_FONT_RENDERER_H_

