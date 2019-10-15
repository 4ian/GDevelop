!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.MultiStyleText=e()}(this,function(){var t=function(e,n){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])})(e,n)};var e=["pointerover","pointerenter","pointerdown","pointermove","pointerup","pointercancel","pointerout","pointerleave","gotpointercapture","lostpointercapture","mouseover","mouseenter","mousedown","mousemove","mouseup","mousecancel","mouseout","mouseleave","touchover","touchenter","touchdown","touchmove","touchup","touchcancel","touchout","touchleave"];return function(n){function o(t,o){var i=n.call(this,t)||this;return i.styles=o,e.forEach(function(t){i.on(t,function(t){return i.handleInteraction(t)})}),i}return function(e,n){function o(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(o.prototype=n.prototype,new o)}(o,n),o.prototype.handleInteraction=function(t){var e=t,n=t.data.getLocalPosition(this),o=this.hitboxes.reduce(function(t,e){return void 0!==t?t:e.hitbox.contains(n.x,n.y)?e:void 0},void 0);e.targetTag=void 0===o?void 0:o.tag},Object.defineProperty(o.prototype,"styles",{set:function(t){for(var e in this.textStyles={},this.textStyles.default=this.assign({},o.DEFAULT_TAG_STYLE),t)"default"===e?this.assign(this.textStyles.default,t[e]):this.textStyles[e]=this.assign({},t[e]);"["===this.textStyles.default.tagStyle[0]&&(this.textStyles.b=this.assign({},{fontStyle:"bold"}),this.textStyles.i=this.assign({},{fontStyle:"italic"}),this.textStyles.color=this.assign({},{fill:""}),this.textStyles.outline=this.assign({},{stroke:"",strokeThickness:6}),this.textStyles.font=this.assign({},{fontFamily:""}),this.textStyles.shadow=this.assign({},{dropShadowColor:"",dropShadow:!0,dropShadowBlur:3,dropShadowDistance:3,dropShadowAngle:2}),this.textStyles.size=this.assign({},{fontSize:"px"}),this.textStyles.spacing=this.assign({},{letterSpacing:""}),this.textStyles.align=this.assign({},{align:""})),this._style=new PIXI.TextStyle(this.textStyles.default),this.dirty=!0},enumerable:!0,configurable:!0}),o.prototype.setTagStyle=function(t,e){t in this.textStyles?this.assign(this.textStyles[t],e):this.textStyles[t]=this.assign({},e),this._style=new PIXI.TextStyle(this.textStyles.default),this.dirty=!0},o.prototype.deleteTagStyle=function(t){"default"===t?this.textStyles.default=this.assign({},o.DEFAULT_TAG_STYLE):delete this.textStyles[t],this._style=new PIXI.TextStyle(this.textStyles.default),this.dirty=!0},o.prototype.getTagRegex=function(t,e){var n=Object.keys(this.textStyles).join("|"),o=this.textStyles.default.tagStyle;"["===o[0]&&(n="[A-z]+"),n=t?"("+n+")":"(?:"+n+")";var i="["===o[0]?"\\"+o[0]+n+"(?:\\=(?:[A-Za-z0-9_\\-\\#]+|'(?:[^']+|\\\\')*'))*\\s*\\"+o[1]+"|\\"+o[0]+"\\/"+n+"\\s*\\"+o[1]:"\\"+o[0]+n+"(?:\\s+[A-Za-z0-9_\\-]+=(?:\"(?:[^\"]+|\\\\\")*\"|'(?:[^']+|\\\\')*'))*\\s*\\"+o[1]+"|\\"+o[0]+"\\/"+n+"\\s*\\"+o[1];return e&&(i="("+i+")"),new RegExp(i,"g")},o.prototype.getPropertyRegex=function(){return new RegExp("([A-Za-z0-9_\\-]+)=(?:\"((?:[^\"]+|\\\\\")*)\"|'((?:[^']+|\\\\')*)')","g")},o.prototype.getBBcodePropertyRegex=function(){return new RegExp("[A-Za-z0-9_\\-]+=([A-Za-z0-9_\\-\\#]+)","g")},o.prototype._getTextDataPerLine=function(t){for(var e=[],n=this.getTagRegex(!0,!1),o=[this.assign({},this.textStyles.default)],i=[{name:"default",properties:{}}],s=0;s<t.length;s++){for(var r=[],a=[],h=void 0;h=n.exec(t[s]);)a.push(h);if(0===a.length)r.push(this.createTextData(t[s],o[o.length-1],i[i.length-1]));else{for(var l=0,c=function(e){if(a[e].index>l&&r.push(x.createTextData(t[s].substring(l,a[e].index),o[o.length-1],i[i.length-1])),"/"===a[e][0][1])o.length>1&&(o.pop(),i.pop());else{for(var n={},h=x.getPropertyRegex(),c=void 0;c=h.exec(a[e][0]);)n[c[1]]=c[2]||c[3];if(i.push({name:a[e][1],properties:n}),"["===x.textStyles.default.tagStyle[0]&&a[e][0].includes("=")){var d=x.getBBcodePropertyRegex().exec(a[e][0]),g={};Object.entries(x.textStyles[a[e][1]]).forEach(function(t){g[t[0]]="string"!=typeof t[1]?t[1]:d[1]+t[1]}),o.push(x.assign({},o[o.length-1],g))}else o.push(x.assign({},o[o.length-1],x.textStyles[a[e][1]]))}l=a[e].index+a[e][0].length},x=this,d=0;d<a.length;d++)c(d);if(l<t[s].length){var g=this.createTextData(l?t[s].substring(l):t[s],o[o.length-1],i[i.length-1]);r.push(g)}}e.push(r)}return"["===this.textStyles.default.tagStyle[0]&&e.map(function(t){return t.map(function(t){t.text.includes("[")&&(t.text=t.text.match(/^(.*)\[/)[1])})}),e},o.prototype.getFontString=function(t){return new PIXI.TextStyle(t).toFontString()},o.prototype.createTextData=function(t,e,n){return{text:t,style:e,width:0,height:0,fontProperties:void 0,tag:n}},o.prototype.getDropShadowPadding=function(){var t=this,e=0,n=0;return Object.keys(this.textStyles).forEach(function(o){var i=t.textStyles[o],s=i.dropShadowBlur;e=Math.max(e,i.dropShadowDistance||0),n=Math.max(n,s||0)}),e+n},o.prototype.updateText=function(){var t=this;if(this.dirty){this.hitboxes=[],this.texture.baseTexture.resolution=this.resolution;var e=this.textStyles,n=this.text;this._style.wordWrap&&(n=this.wordWrap(this.text));for(var i=n.split(/(?:\r\n|\r|\n)/),s=this._getTextDataPerLine(i),r=[],a=[],h=[],l=0,c=0;c<i.length;c++){for(var x=0,d=0,g=0,u=0;u<s[c].length;u++){var p=s[c][u].style;this.context.font=this.getFontString(p),s[c][u].width=this.context.measureText(s[c][u].text).width,0!==s[c][u].text.length&&(s[c][u].width+=(s[c][u].text.length-1)*p.letterSpacing,u>0&&(x+=p.letterSpacing/2),u<s[c].length-1&&(x+=p.letterSpacing/2)),x+=s[c][u].width,s[c][u].fontProperties=PIXI.TextMetrics.measureFont(this.context.font),s[c][u].height=s[c][u].fontProperties.fontSize,"number"==typeof p.valign?(d=Math.min(d,p.valign-s[c][u].fontProperties.descent),g=Math.max(g,p.valign+s[c][u].fontProperties.ascent)):(d=Math.min(d,-s[c][u].fontProperties.descent),g=Math.max(g,s[c][u].fontProperties.ascent))}r[c]=x,a[c]=d,h[c]=g,l=Math.max(l,x)}var f=Object.keys(e).map(function(t){return e[t]}).reduce(function(t,e){return Math.max(t,e.strokeThickness||0)},0),y=this.getDropShadowPadding(),S=l+2*f+2*y,b=h.reduce(function(t,e){return t+e},0)-a.reduce(function(t,e){return t+e},0)+2*f+2*y;this.canvas.width=S*this.resolution,this.canvas.height=b*this.resolution,this.context.scale(this.resolution,this.resolution),this.context.textBaseline="alphabetic",this.context.lineJoin="round";var v=y+f,w=[];for(c=0;c<s.length;c++){var T=s[c],m=void 0;switch(this._style.align){case"left":m=y+f;break;case"center":m=y+f+(l-r[c])/2;break;case"right":m=y+f+l-r[c]}for(u=0;u<T.length;u++){var k=T[u],P=k.style,_=k.text,I=k.fontProperties,O=k.width,A=k.tag,F=v+I.ascent;switch(P.valign){case"top":break;case"baseline":F+=h[c]-I.ascent;break;case"middle":F+=(h[c]-a[c]-I.ascent-I.descent)/2;break;case"bottom":F+=h[c]-a[c]-I.ascent-I.descent;break;default:F+=h[c]-I.ascent-P.valign}if(0===P.letterSpacing)w.push({text:_,style:P,x:m,y:F,width:O,ascent:I.ascent,descent:I.descent,tag:A}),m+=T[u].width;else{this.context.font=this.getFontString(T[u].style);for(var E=0;E<_.length;E++){(E>0||u>0)&&(m+=P.letterSpacing/2);var D=this.context.measureText(_.charAt(E)).width;w.push({text:_.charAt(E),style:P,x:m,y:F,width:D,ascent:I.ascent,descent:I.descent,tag:A}),m+=D,(E<_.length-1||u<T.length-1)&&(m+=P.letterSpacing/2)}}}v+=h[c]-a[c]}this.context.save(),w.forEach(function(e){var n=e.style,o=e.text,i=e.x,s=e.y;if(n.dropShadow){t.context.font=t.getFontString(n);var r=n.dropShadowColor;"number"==typeof r&&(r=PIXI.utils.hex2string(r)),t.context.shadowColor=r,t.context.shadowBlur=n.dropShadowBlur,t.context.shadowOffsetX=Math.cos(n.dropShadowAngle)*n.dropShadowDistance*t.resolution,t.context.shadowOffsetY=Math.sin(n.dropShadowAngle)*n.dropShadowDistance*t.resolution,t.context.fillText(o,i,s)}}),this.context.restore(),w.forEach(function(e){var n=e.style,o=e.text,i=e.x,s=e.y;if(void 0!==n.stroke&&n.strokeThickness){t.context.font=t.getFontString(n);var r=n.stroke;"number"==typeof r&&(r=PIXI.utils.hex2string(r)),t.context.strokeStyle=r,t.context.lineWidth=n.strokeThickness,t.context.strokeText(o,i,s)}}),w.forEach(function(e){var n=e.style,o=e.text,i=e.x,s=e.y;if(void 0!==n.fill){t.context.font=t.getFontString(n);var r=n.fill;if("number"==typeof r)r=PIXI.utils.hex2string(r);else if(Array.isArray(r))for(var a=0;a<r.length;a++){var h=r[a];"number"==typeof h&&(r[a]=PIXI.utils.hex2string(h))}t.context.fillStyle=t._generateFillStyle(new PIXI.TextStyle(n),[o]),t.context.fillText(o,i,s)}}),w.forEach(function(e){var n=e.style,i=e.x,s=e.y,r=e.width,a=e.ascent,h=e.descent,l=e.tag,c=-t._style.padding-t.getDropShadowPadding();t.hitboxes.push({tag:l,hitbox:new PIXI.Rectangle(i+c,s-a+c,r,a+h)}),(void 0===n.debug?o.debugOptions.spans.enabled:n.debug)&&(t.context.lineWidth=1,o.debugOptions.spans.bounding&&(t.context.fillStyle=o.debugOptions.spans.bounding,t.context.strokeStyle=o.debugOptions.spans.bounding,t.context.beginPath(),t.context.rect(i,s-a,r,a+h),t.context.fill(),t.context.stroke(),t.context.stroke()),o.debugOptions.spans.baseline&&(t.context.strokeStyle=o.debugOptions.spans.baseline,t.context.beginPath(),t.context.moveTo(i,s),t.context.lineTo(i+r,s),t.context.closePath(),t.context.stroke()),o.debugOptions.spans.top&&(t.context.strokeStyle=o.debugOptions.spans.top,t.context.beginPath(),t.context.moveTo(i,s-a),t.context.lineTo(i+r,s-a),t.context.closePath(),t.context.stroke()),o.debugOptions.spans.bottom&&(t.context.strokeStyle=o.debugOptions.spans.bottom,t.context.beginPath(),t.context.moveTo(i,s+h),t.context.lineTo(i+r,s+h),t.context.closePath(),t.context.stroke()),o.debugOptions.spans.text&&(t.context.fillStyle="#ffffff",t.context.strokeStyle="#000000",t.context.lineWidth=2,t.context.font="8px monospace",t.context.strokeText(l.name,i,s-a+8),t.context.fillText(l.name,i,s-a+8),t.context.strokeText(r.toFixed(2)+"x"+(a+h).toFixed(2),i,s-a+16),t.context.fillText(r.toFixed(2)+"x"+(a+h).toFixed(2),i,s-a+16)))}),o.debugOptions.objects.enabled&&(o.debugOptions.objects.bounding&&(this.context.fillStyle=o.debugOptions.objects.bounding,this.context.beginPath(),this.context.rect(0,0,S,b),this.context.fill()),o.debugOptions.objects.text&&(this.context.fillStyle="#ffffff",this.context.strokeStyle="#000000",this.context.lineWidth=2,this.context.font="8px monospace",this.context.strokeText(S.toFixed(2)+"x"+b.toFixed(2),0,8,S),this.context.fillText(S.toFixed(2)+"x"+b.toFixed(2),0,8,S))),this.updateTexture()}},o.prototype.wordWrap=function(t){var e="",n=this.getTagRegex(!0,!0),o=t.split("\n"),i=this._style.wordWrapWidth,s=[this.assign({},this.textStyles.default)];this.context.font=this.getFontString(this.textStyles.default);for(var r=0;r<o.length;r++){for(var a=i,h=o[r].split(n),l=!0,c=0;c<h.length;c++)if(n.test(h[c]))e+=h[c],"/"===h[c][1]?(c+=2,s.pop()):(s.push(this.assign({},s[s.length-1],this.textStyles[h[++c]])),c++),this.context.font=this.getFontString(s[s.length-1]);else for(var x=h[c].split(" "),d=0;d<x.length;d++){var g=this.context.measureText(x[d]).width;if(this._style.breakWords&&g>a){var u=x[d].split("");d>0&&(e+=" ",a-=this.context.measureText(" ").width);for(var p=0;p<u.length;p++){var f=this.context.measureText(u[p]).width;f>a?(e+="\n"+u[p],a=i-f):(e+=u[p],a-=f)}}else if(this._style.breakWords)e+=x[d],a-=g;else{var y=g+(d>0?this.context.measureText(" ").width:0);y>a?(l||(e+="\n"),e+=x[d],a=i-g):(a-=y,d>0&&(e+=" "),e+=x[d])}l=!1}r<o.length-1&&(e+="\n")}return e},o.prototype.updateTexture=function(){var t=this._texture,e=this.getDropShadowPadding();t.baseTexture.hasLoaded=!0,t.baseTexture.resolution=this.resolution,t.baseTexture.realWidth=this.canvas.width,t.baseTexture.realHeight=this.canvas.height,t.baseTexture.width=this.canvas.width/this.resolution,t.baseTexture.height=this.canvas.height/this.resolution,t.trim.width=t.frame.width=this.canvas.width/this.resolution,t.trim.height=t.frame.height=this.canvas.height/this.resolution,t.trim.x=-this._style.padding-e,t.trim.y=-this._style.padding-e,t.orig.width=t.frame.width-2*(this._style.padding+e),t.orig.height=t.frame.height-2*(this._style.padding+e),this._onTextureUpdate(),t.baseTexture.emit("update",t.baseTexture),this.dirty=!1},o.prototype.assign=function(t){for(var e=[],n=1;n<arguments.length;n++)e[n-1]=arguments[n];for(var o=0,i=e;o<i.length;o++){var s=i[o];for(var r in s)t[r]=s[r]}return t},o.DEFAULT_TAG_STYLE={align:"left",breakWords:!1,dropShadow:!1,dropShadowAngle:Math.PI/6,dropShadowBlur:0,dropShadowColor:"#000000",dropShadowDistance:5,fill:"black",fillGradientType:PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,fontFamily:"Arial",fontSize:26,fontStyle:"normal",fontVariant:"normal",fontWeight:"normal",letterSpacing:0,lineHeight:0,lineJoin:"miter",miterLimit:10,padding:0,stroke:"black",strokeThickness:0,textBaseline:"alphabetic",valign:"baseline",wordWrap:!1,wordWrapWidth:100,tagStyle:["<",">"]},o.debugOptions={spans:{enabled:!1,baseline:"#44BB44",top:"#BB4444",bottom:"#4444BB",bounding:"rgba(255, 255, 255, 0.1)",text:!0},objects:{enabled:!1,bounding:"rgba(255, 255, 255, 0.05)",text:!0}},o}(PIXI.Text)});
//# sourceMappingURL=pixi-multistyle-text.umd.js.map
