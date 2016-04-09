/**
 * Common tools that can be used for rendering with Cocos2d-JS.
 * @class CocosTools
 * @namespace gdjs
 */
gdjs.CocosTools = function() {
};

gdjs.CocosTools.hexToCCColor = function(hexColor, opacity) {
    return cc.color(
        (hexColor >> 16) & 255,
        (hexColor >> 8) & 255,
        (hexColor) & 255,
        opacity
    );
}

gdjs.CocosTools.isHTML5 = function() {
    return (typeof document !== "undefined");
}
/**
 * Create a shader that can be applied on a cc.Sprite to make it tiled.
 * You have to apply the shader with `setShaderProgram` and make sure to update
 * the shaders uniforms: uPixelSize (using texture size), uFrame
 * and uTransform (using texture and object size).
 *
 * @method makeTilingShader
 */
gdjs.CocosTools.makeTilingShader = function() {
    var shader = new cc.GLProgram();

    var projectionMatrix = gdjs.CocosTools.isHTML5() ?
        "(CC_PMatrix * CC_MVMatrix)" :
        "CC_PMatrix";
    shader.initWithString(
        "#ifdef GL_ES\n"
        + "precision lowp float;\n"
        + "#endif \n"
        + "attribute vec4 a_position;\n"
        + "attribute vec2 a_texCoord;\n"
        + "attribute vec4 a_color;\n"
        + "\n"
        + "\n#ifdef GL_ES\n\n"
        + "varying lowp vec4 v_fragmentColor;\n"
        + "varying mediump vec2 v_texCoord;\n"
        + "\n#else\n\n"
        + "varying vec4 v_fragmentColor;\n"
        + "varying vec2 v_texCoord;\n"
        + "\n#endif\n\n"
        + "uniform vec4 uTransform; \n"
        + "uniform vec4 uFrame; \n"
        + "uniform vec2 uPixelSize; \n"
        + "\n"
        + 'void main(void){'
        + "    gl_Position = " + projectionMatrix + " * a_position;\n"

        + '   vec2 coord = a_texCoord;'
        + '   coord -= uTransform.xy;'
        + '   coord /= uTransform.zw;'
        + '   v_texCoord = coord;'

        + "    v_fragmentColor = a_color;\n"
        + '}'
        ,
        "#ifdef GL_ES\n"
        + "precision lowp float;\n"
        + "#endif \n"
        + "varying vec4 v_fragmentColor; \n"
        + "varying vec2 v_texCoord; \n"
        + "uniform vec4 uFrame; \n"
        + "uniform vec2 uPixelSize; \n"
        + "void main() \n"
        + "{ \n"
        + '   vec2 coord = mod(v_texCoord, uFrame.zw);'
        + '   coord = clamp(coord, uPixelSize, uFrame.zw - uPixelSize);'
        + '   coord += uFrame.xy;'
        + '   gl_FragColor =  texture2D(CC_Texture0, coord) * v_fragmentColor ;'
        + "}"
        );

    shader.addAttribute("a_position", 0);
    shader.addAttribute("a_color", 1);
    shader.addAttribute("a_texCoord", 2);
    shader.link();
    shader.updateUniforms();

    return shader;
}

gdjs.CocosTools.setUniformLocationWith2f = function(node, shader, uniform, uniformName, p1, p2) {
    if (gdjs.CocosTools.isHTML5()) {
        shader.setUniformLocationWith2f(uniform, p1, p2);
    } else {
        node.getGLProgramState().setUniformVec2(uniformName, cc.p(p1, p2));
    }
}

gdjs.CocosTools.setUniformLocationWith4f = function(node, shader, uniform, uniformName, p1, p2, p3, p4) {
    if (gdjs.CocosTools.isHTML5()) {
        shader.setUniformLocationWith4f(uniform, p1, p2, p3, p4);
    } else {
        node.getGLProgramState().setUniformVec4(uniformName, {x: p1, y: p2, z: p3, w: p4});
    }
}
