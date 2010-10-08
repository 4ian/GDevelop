/*
 * FTGL - OpenGL font library
 *
 * Copyright (c) 2001-2004 Henry Maddocks <ftgl@opengl.geek.nz>
 * Copyright (c) 2008 Sam Hocevar <sam@zoy.org>
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

#ifndef __FTSimpleLayoutImpl__
#define __FTSimpleLayoutImpl__

#include "FTLayoutImpl.h"


class FTFont;

class FTSimpleLayoutImpl : public FTLayoutImpl
{
    friend class FTSimpleLayout;

    protected:
        FTSimpleLayoutImpl();

        virtual ~FTSimpleLayoutImpl() {};

        virtual FTBBox BBox(const char* string, const int len,
                            FTPoint position);

        virtual FTBBox BBox(const wchar_t* string, const int len,
                            FTPoint position);

        virtual void Render(const char *string, const int len,
                            FTPoint position, int renderMode);

        virtual void Render(const wchar_t *string, const int len,
                            FTPoint position, int renderMode);

        /**
         * Render a string of characters and distribute extra space amongst
         * the whitespace regions of the string.
         *
         * @param string   A buffer of wchar_t characters to output.
         * @param len  The length of the string. If < 0 then all characters
         *             will be displayed until a null character is encountered.
         * @param position TODO
         * @param renderMode Render mode to display
         * @param extraSpace The amount of extra space to distribute amongst
         *                   the characters.
         */
        virtual void RenderSpace(const char *string, const int len,
                                 FTPoint position, int renderMode,
                                 const float extraSpace);

        /**
         * Render a string of characters and distribute extra space amongst
         * the whitespace regions of the string.
         *
         * @param string   A buffer of wchar_t characters to output.
         * @param len  The length of the string. If < 0 then all characters
         *             will be displayed until a null character is encountered.
         * @param position TODO
         * @param renderMode Render mode to display
         * @param extraSpace The amount of extra space to distribute amongst
         *                   the characters.
         */
        virtual void RenderSpace(const wchar_t *string, const int len,
                                 FTPoint position, int renderMode,
                                 const float extraSpace);

    private:
        /**
         * Either render a string of characters and wrap lines
         * longer than a threshold or compute the bounds
         * of a string of characters when wrapped.  The functionality
         * of this method is exposed by the BBoxWrapped and
         * RenderWrapped methods.
         *
         * @param buf  A char string to output.
         * @param len  The length of the string. If < 0 then all characters
         *             will be displayed until a null character is encountered.
         * @param position TODO
         * @param renderMode  Render mode to display
         * @param bounds      A pointer to a bounds object.  If non null
         *                    the bounds of the text when laid out
         *                    will be stored in bounds.  If null the
         *                    text will be rendered.
         */
        virtual void WrapText(const char *buf, const int len,
                              FTPoint position, int renderMode,
                              FTBBox *bounds);

        /**
         * Either render a string of characters and wrap lines
         * longer than a threshold or compute the bounds
         * of a string of characters when wrapped.  The functionality
         * of this method is exposed by the BBoxWrapped and
         * RenderWrapped methods.
         *
         * @param buf  A wchar_t style string to output.
         * @param len  The length of the string. If < 0 then all characters
         *             will be displayed until a null character is encountered.
         * @param position TODO
         * @param renderMode  Render mode to display
         * @param bounds      A pointer to a bounds object.  If non null
         *                    the bounds of the text when laid out
         *                    will be stored in bounds.  If null the
         *                    text will be rendered.
         */
        virtual void WrapText(const wchar_t *buf, const int len,
                              FTPoint position, int renderMode,
                              FTBBox *bounds);

        /**
         * A helper method used by WrapText to either output the text or
         * compute it's bounds.
         *
         * @param buf      A pointer to an array of character data.
         * @param len  The length of the string. If < 0 then all characters
         *             will be displayed until a null character is encountered.
         * @param position TODO
         * @param renderMode  Render mode to display
         * @param RemainingWidth The amount of extra space left on the line.
         * @param bounds     A pointer to a bounds object.  If non null the
         *                   bounds will be initialized or expanded by the
         *                   bounds of the line.  If null the text will be
         *                   rendered.  If the bounds are invalid (lower > upper)
         *                   they will be initialized.  Otherwise they
         *                   will be expanded.
         */
        void OutputWrapped(const char *buf, const int len,
                           FTPoint position, int renderMode,
                           const float RemainingWidth, FTBBox *bounds);

        /**
         * A helper method used by WrapText to either output the text or
         * compute it's bounds.
         *
         * @param buf      A pointer to an array of character data.
         * @param len  The length of the string. If < 0 then all characters
         *             will be displayed until a null character is encountered.
         * @param position TODO
         * @param renderMode  Render mode to display
         * @param RemainingWidth The amount of extra space left on the line.
         * @param bounds     A pointer to a bounds object.  If non null the
         *                   bounds will be initialized or expanded by the
         *                   bounds of the line.  If null the text will be
         *                   rendered.  If the bounds are invalid (lower > upper)
         *                   they will be initialized.  Otherwise they
         *                   will be expanded.
         */
        void OutputWrapped(const wchar_t *buf, const int len,
                           FTPoint position, int renderMode,
                           const float RemainingWidth, FTBBox *bounds);

        /**
         * The font to use for rendering the text.  The font is
         * referenced by this but will not be disposed of when this
         * is deleted.
         */
        FTFont *currentFont;

        /**
         * The maximum line length for formatting text.
         */
        float lineLength;

        /**
         * The text alignment mode used to distribute
         * space within a line or rendered text.
         */
        FTGL::TextAlignment alignment;

        /**
         * The height of each line of text expressed as
         * a percentage of the font's line height.
         */
        float lineSpacing;

        /* Internal generic BBox() implementation */
        template <typename T>
        inline FTBBox BBoxI(const T* string, const int len, FTPoint position);

        /* Internal generic Render() implementation */
        template <typename T>
        inline void RenderI(const T* string, const int len,
                            FTPoint position, int renderMode);

        /* Internal generic RenderSpace() implementation */
        template <typename T>
        inline void RenderSpaceI(const T* string, const int len,
                                 FTPoint position, int renderMode,
                                 const float extraSpace);

        /* Internal generic WrapText() implementation */
        template <typename T>
        void WrapTextI(const T* buf, const int len, FTPoint position,
                       int renderMode, FTBBox *bounds);

        /* Internal generic OutputWrapped() implementation */
        template <typename T>
        void OutputWrappedI(const T* buf, const int len, FTPoint position,
                            int renderMode, const float RemainingWidth,
                            FTBBox *bounds);
};

#endif  //  __FTSimpleLayoutImpl__

