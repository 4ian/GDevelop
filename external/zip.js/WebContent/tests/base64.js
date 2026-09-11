/// Code can be found at: https://gist.github.com/1284012

(function() {

	var a64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', a256 = {
		indexOf : function(c) {
			return c.charCodeAt(0);
		},
		charAt : String.fromCharCode
	};

	function code(s, discard, alpha, beta, w1, w2) {
		s = String(s);
		var b = 0, x = '', i, c, bs = 1, sb = 1, length = s.length, tmp;
		for (i = 0; i < length || (!discard && sb > 1); i += 1) {
			b *= w1;
			bs *= w1;
			if (i < length) {
				c = alpha.indexOf(s.charAt(i));
				if (c <= -1 || c >= w1) {
					throw new RangeError();
				}
				sb *= w1;
				b += c;
			}
			while (bs >= w2) {
				bs /= w2;
				if (sb > 1) {
					tmp = b;
					b %= bs;
					x += beta.charAt((tmp - b) / bs);
					sb /= w2;
				}
			}
		}
		return x;
	}

	if (!("btoa" in window))
		window.btoa = function(s) {
			s = code(s, false, a256, a64, 256, 64);
			return s + '===='.slice((s.length % 4) || 4);
		};

	if (!("atob" in window))
		window.atob = function(s) {
			var i;
			s = String(s).split('=');
			for (i = s.length - 1; i >= 0; i -= 1) {
				if (s[i].length % 4 === 1) {
					throw new RangeError();
				}
				s[i] = code(s[i], true, a64, a256, 64, 256);
			}
			return s.join('');
		};

})();
