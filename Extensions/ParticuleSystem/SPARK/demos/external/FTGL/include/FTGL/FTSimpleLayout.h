/*
 * FTGL - OpenGL font library
 *
 * Copyright (c) 2001-2004 Henry Maddocks <ftgl@opengl.geek.nz>
 * Copyright (c) 2008 Sam Hocevar <sam@zoy.org>
 * Copyright (c) 2008 Sean Morrison <learner@brlcad.org>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

#ifndef __ftgl__
#   warning This header is deprecated. Please use <FTGL/ftgl.h> from now.
#   include <FTGL/ftgl.h>
#endif

#ifndef __FTSimpleLayout__
#define __FTSimpleLayout__

#ifdef __cplusplus


class FTFont;

/**
 * FTSimpleLayout is a specialisation of FTLayout for simple text boxes.
 *
 * This class has basic support for text wrapping, left, right and centered
 * alignment, and text justification.
 *
 * @see     FTLayout
 */
class FTGL_EXPORT FTSimpleLayout : public FTLayout
{
    public:
        /**
         * Initializes line spacing to 1.0, alignment to
         * ALIGN_LEFT and wrap to 100.0
         */
        FTSimpleLayout();

        /**
         * Destructor
         */
        ~FTSimpleLayout();

        /**
         * Get the bounding box for a formatted string.
         *
         * @param string  A char string.
         * @param len  The length of the string. If < 0 then all characters
         *             will be checked until a null character is encountered
         *             (optional).
         * @param position  The pen position of the first character (optional).
         * @return  The corresponding bounding box.
         */
        virtual FTBBox BBox(const char* string, const int len = -1,
                            FTPoint position = FTPoint());

        /**
         * Get the bounding box for a formatted string.
         *
         * @param string  A wchar_t string.
         * @param len  The length of the string. If < 0 then all characters
         *             will be checked until a null character is encountered
         *             (optional).
         * @param position  The pen position of the first character (optional).
         * @return  The corresponding bounding box.
         */
        virtual FTBBox BBox(const wchar_t* string, const int len = -1,
                            FTPoint position = FTPoint());

        /**
         * Render a string of characters.
         *
         * @param string    'C' style string to be output.
         * @param len  The length of the string. If < 0 then all characters
         *             will be displayed until a null character is encountered
         *             (optional).
         * @param position  The pen position of the first character (optional).
         * @param renderMode  Render mode to display (optional)
         */
        virtual void Render(const char *string, const int len = -1,
                            FTPoint position = FTPoint(),
                            int renderMode = FTGL::RENDER_ALL);

        /**
         * Render a string of characters.
         *
         * @param string    wchar_t string to be output.
         * @param len  The length of the string. If < 0 then all characters
         *             will be displayed until a null character is encountered
         *             (optional).
         * @param position  The pen position of the first character (optional).
         * @param renderMode  Render mode to display (optional)
         */
        virtual void Render(const wchar_t *string, const int len = -1,
                            FTPoint position = FTPoint(),
                            int renderMode = FTGL::RENDER_ALL);

        /**
         * Set the font to use for rendering the text.
         *
         * @param fontInit A pointer to the new font.  The font is
         *                 referenced by this but will not be
         *                 disposed of when this is deleted.
         */
        void SetFont(FTFont *fontInit);

        /**
         * @return The current font.
         */
        FTFont *GetFont();

        /**
         * The maximum line length for formatting text.
         *
         * @param LineLength The new line length.
         */
        void SetLineLength(const float LineLength);

        /**
         * @return The current line length.
         */
        float GetLineLength() const;

        /**
         * The text alignment mode used to distribute
         * space within a line or rendered text.
         *
         * @param Alignment The new alignment mode.
         */
        void SetAlignment(const FTGL::TextAlignment Alignment);

        /**
         * @return The text alignment mode.
         */
        FTGL::TextAlignment GetAlignment() const;

        /**
         * Sets the line height.
         *
         * @param LineSpacing The height of each line of text expressed as
         *                    a percentage of the current fonts line height.
         */
        void SetLineSpacing(const float LineSpacing);

        /**
         * @return The line spacing.
         */
        float GetLineSpacing() const;
};

#endif //__cplusplus

FTGL_BEGIN_C_DECLS

FTGL_EXPORT FTGLlayout *ftglCreateSimpleLayout(void);

FTGL_EXPORT void ftglSetLayoutFont(FTGLlayout *, FTGLfont*);
FTGL_EXPORT FTGLfont *ftglGetLayoutFont(FTGLlayout *);

FTGL_EXPORT void ftglSetLayoutLineLength(FTGLlayout *, const float);
FTGL_EXPORT float ftglGetLayoutLineLength(FTGLlayout *);

FTGL_EXPORT void ftglSetLayoutAlignment(FTGLlayout *, const int);
FTGL_EXPORT int ftglGetLayoutAlignement(FTGLlayout *);

FTGL_EXPORT void ftglSetLayoutLineSpacing(FTGLlayout *, const float);
FTGL_EXPORT float ftglGetLayoutLineSpacing(FTGLlayout *);

FTGL_END_C_DECLS

#endif  /* __FTSimpleLayout__ */

