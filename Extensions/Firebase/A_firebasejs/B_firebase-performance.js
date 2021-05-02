!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(require("@firebase/app")):"function"==typeof define&&define.amd?define(["@firebase/app"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).firebase)}(this,function(Ce){"use strict";try{!function(){function t(t){return t&&"object"==typeof t&&"default"in t?t:{default:t}}var e=t(Ce),r=function(t,e){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n])})(t,e)};var a=function(){return(a=Object.assign||function(t){for(var e,n=1,r=arguments.length;n<r;n++)for(var i in e=arguments[n])Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i]);return t}).apply(this,arguments)};function c(t,a,s,u){return new(s=s||Promise)(function(n,e){function r(t){try{o(u.next(t))}catch(t){e(t)}}function i(t){try{o(u.throw(t))}catch(t){e(t)}}function o(t){var e;t.done?n(t.value):((e=t.value)instanceof s?e:new s(function(t){t(e)})).then(r,i)}o((u=u.apply(t,a||[])).next())})}function l(n,r){var i,o,a,s={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]},t={next:e(0),throw:e(1),return:e(2)};return"function"==typeof Symbol&&(t[Symbol.iterator]=function(){return this}),t;function e(e){return function(t){return function(e){if(i)throw new TypeError("Generator is already executing.");for(;s;)try{if(i=1,o&&(a=2&e[0]?o.return:e[0]?o.throw||((a=o.return)&&a.call(o),0):o.next)&&!(a=a.call(o,e[1])).done)return a;switch(o=0,(e=a?[2&e[0],a.value]:e)[0]){case 0:case 1:a=e;break;case 4:return s.label++,{value:e[1],done:!1};case 5:s.label++,o=e[1],e=[0];continue;case 7:e=s.ops.pop(),s.trys.pop();continue;default:if(!(a=0<(a=s.trys).length&&a[a.length-1])&&(6===e[0]||2===e[0])){s=0;continue}if(3===e[0]&&(!a||e[1]>a[0]&&e[1]<a[3])){s.label=e[1];break}if(6===e[0]&&s.label<a[1]){s.label=a[1],a=e;break}if(a&&s.label<a[2]){s.label=a[2],s.ops.push(e);break}a[2]&&s.ops.pop(),s.trys.pop();continue}e=r.call(n,s)}catch(t){e=[6,t],o=0}finally{i=a=0}if(5&e[0])throw e[1];return{value:e[0]?e[1]:void 0,done:!0}}([e,t])}}}function s(t){var e="function"==typeof Symbol&&Symbol.iterator,n=e&&t[e],r=0;if(n)return n.call(t);if(t&&"number"==typeof t.length)return{next:function(){return{value:(t=t&&r>=t.length?void 0:t)&&t[r++],done:!t}}};throw new TypeError(e?"Object is not iterable.":"Symbol.iterator is not defined.")}function u(t,e){for(var n=0,r=e.length,i=t.length;n<r;n++,i++)t[i]=e[n];return t}var i,o="FirebaseError",f=(function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function n(){this.constructor=t}r(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)}(p,i=Error),p);function p(t,e,n){e=i.call(this,e)||this;return e.code=t,e.customData=n,e.name=o,Object.setPrototypeOf(e,p.prototype),Error.captureStackTrace&&Error.captureStackTrace(e,h.prototype.create),e}var h=(n.prototype.create=function(t){for(var e=[],n=1;n<arguments.length;n++)e[n-1]=arguments[n];var r,i=e[0]||{},o=this.service+"/"+t,t=this.errors[t],t=t?(r=i,t.replace(d,function(t,e){var n=r[e];return null!=n?String(n):"<"+e+"?>"})):"Error",t=this.serviceName+": "+t+" ("+o+").";return new f(o,t,i)},n);function n(t,e,n){this.service=t,this.serviceName=e,this.errors=n}var d=/\{\$([^}]+)}/g,g=(m.prototype.setInstantiationMode=function(t){return this.instantiationMode=t,this},m.prototype.setMultipleInstances=function(t){return this.multipleInstances=t,this},m.prototype.setServiceProps=function(t){return this.serviceProps=t,this},m.prototype.setInstanceCreatedCallback=function(t){return this.onInstanceCreated=t,this},m);function m(t,e,n){this.name=t,this.instanceFactory=e,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}function v(n){return new Promise(function(t,e){n.onsuccess=function(){t(n.result)},n.onerror=function(){e(n.error)}})}function y(n,r,i){var o,t=new Promise(function(t,e){v(o=n[r].apply(n,i)).then(t,e)});return t.request=o,t}function b(t,n,e){e.forEach(function(e){Object.defineProperty(t.prototype,e,{get:function(){return this[n][e]},set:function(t){this[n][e]=t}})})}function _(e,n,r,t){t.forEach(function(t){t in r.prototype&&(e.prototype[t]=function(){return y(this[n],t,arguments)})})}function w(e,n,r,t){t.forEach(function(t){t in r.prototype&&(e.prototype[t]=function(){return this[n][t].apply(this[n],arguments)})})}function I(t,r,e,n){n.forEach(function(n){n in e.prototype&&(t.prototype[n]=function(){return t=this[r],(e=y(t,n,arguments)).then(function(t){if(t)return new T(t,e.request)});var t,e})})}function S(t){this._index=t}function T(t,e){this._cursor=t,this._request=e}function E(t){this._store=t}function A(n){this._tx=n,this.complete=new Promise(function(t,e){n.oncomplete=function(){t()},n.onerror=function(){e(n.error)},n.onabort=function(){e(n.error)}})}function N(t,e,n){this._db=t,this.oldVersion=e,this.transaction=new A(n)}function k(t){this._db=t}b(S,"_index",["name","keyPath","multiEntry","unique"]),_(S,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),I(S,"_index",IDBIndex,["openCursor","openKeyCursor"]),b(T,"_cursor",["direction","key","primaryKey","value"]),_(T,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(n){n in IDBCursor.prototype&&(T.prototype[n]=function(){var e=this,t=arguments;return Promise.resolve().then(function(){return e._cursor[n].apply(e._cursor,t),v(e._request).then(function(t){if(t)return new T(t,e._request)})})})}),E.prototype.createIndex=function(){return new S(this._store.createIndex.apply(this._store,arguments))},E.prototype.index=function(){return new S(this._store.index.apply(this._store,arguments))},b(E,"_store",["name","keyPath","indexNames","autoIncrement"]),_(E,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),I(E,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),w(E,"_store",IDBObjectStore,["deleteIndex"]),A.prototype.objectStore=function(){return new E(this._tx.objectStore.apply(this._tx,arguments))},b(A,"_tx",["objectStoreNames","mode"]),w(A,"_tx",IDBTransaction,["abort"]),N.prototype.createObjectStore=function(){return new E(this._db.createObjectStore.apply(this._db,arguments))},b(N,"_db",["name","version","objectStoreNames"]),w(N,"_db",IDBDatabase,["deleteObjectStore","close"]),k.prototype.transaction=function(){return new A(this._db.transaction.apply(this._db,arguments))},b(k,"_db",["name","version","objectStoreNames"]),w(k,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(i){[E,S].forEach(function(t){i in t.prototype&&(t.prototype[i.replace("open","iterate")]=function(){var t=(n=arguments,Array.prototype.slice.call(n)),e=t[t.length-1],n=this._store||this._index,r=n[i].apply(n,t.slice(0,-1));r.onsuccess=function(){e(r.result)}})})}),[S,E].forEach(function(t){t.prototype.getAll||(t.prototype.getAll=function(t,n){var r=this,i=[];return new Promise(function(e){r.iterateCursor(t,function(t){t?(i.push(t.value),void 0===n||i.length!=n?t.continue():e(i)):e(i)})})})});var O="0.4.24",P=1e4,R="w:"+O,C="FIS_v2",M="https://firebaseinstallations.googleapis.com/v1",j=36e5,D=((Dt={})["missing-app-config-values"]='Missing App configuration value: "{$valueName}"',Dt["not-registered"]="Firebase Installation is not registered.",Dt["installation-not-found"]="Firebase Installation not found.",Dt["request-failed"]='{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',Dt["app-offline"]="Could not process request. Application offline.",Dt["delete-pending-registration"]="Can't delete installation while there is a pending registration request.",Dt),B=new h("installations","Installations",D);function L(t){return t instanceof f&&t.code.includes("request-failed")}function x(t){t=t.projectId;return M+"/projects/"+t+"/installations"}function U(t){return{token:t.token,requestStatus:2,expiresIn:(t=t.expiresIn,Number(t.replace("s","000"))),creationTime:Date.now()}}function q(n,r){return c(this,void 0,void 0,function(){var e;return l(this,function(t){switch(t.label){case 0:return[4,r.json()];case 1:return e=t.sent(),e=e.error,[2,B.create("request-failed",{requestName:n,serverCode:e.code,serverMessage:e.message,serverStatus:e.status})]}})})}function F(t){t=t.apiKey;return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function H(t,e){e=e.refreshToken,t=F(t);return t.append("Authorization",C+" "+e),t}function V(n){return c(this,void 0,void 0,function(){var e;return l(this,function(t){switch(t.label){case 0:return[4,n()];case 1:return 500<=(e=t.sent()).status&&e.status<600?[2,n()]:[2,e]}})})}function K(e){return new Promise(function(t){setTimeout(t,e)})}function W(t){return btoa(String.fromCharCode.apply(String,u([],function(t,e){var n="function"==typeof Symbol&&t[Symbol.iterator];if(!n)return t;var r,i,o=n.call(t),a=[];try{for(;(void 0===e||0<e--)&&!(r=o.next()).done;)a.push(r.value)}catch(t){i={error:t}}finally{try{r&&!r.done&&(n=o.return)&&n.call(o)}finally{if(i)throw i.error}}return a}(t)))).replace(/\+/g,"-").replace(/\//g,"_")}var $=/^[cdef][\w-]{21}$/,G="";function J(){try{var t=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(t),t[0]=112+t[0]%16;t=W(t).substr(0,22);return $.test(t)?t:G}catch(t){return G}}function z(t){return t.appName+"!"+t.appId}var Y=new Map;function Z(t,e){t=z(t);Q(t,e),function(t,e){var n=tt();n&&n.postMessage({key:t,fid:e});et()}(t,e)}function Q(t,e){var n,r,i=Y.get(t);if(i)try{for(var o=s(i),a=o.next();!a.done;a=o.next())(0,a.value)(e)}catch(t){n={error:t}}finally{try{a&&!a.done&&(r=o.return)&&r.call(o)}finally{if(n)throw n.error}}}var X=null;function tt(){return!X&&"BroadcastChannel"in self&&((X=new BroadcastChannel("[Firebase] FID Change")).onmessage=function(t){Q(t.data.key,t.data.fid)}),X}function et(){0===Y.size&&X&&(X.close(),X=null)}var nt,rt,it="firebase-installations-database",ot=1,at="firebase-installations-store",st=null;function ut(){var t,e,n;return st||(t=ot,e=function(t){0===t.oldVersion&&t.createObjectStore(at)},(n=(t=y(indexedDB,"open",[it,t])).request)&&(n.onupgradeneeded=function(t){e&&e(new N(n.result,t.oldVersion,n.transaction))}),st=t.then(function(t){return new k(t)})),st}function ct(o,a){return c(this,void 0,void 0,function(){var e,n,r,i;return l(this,function(t){switch(t.label){case 0:return e=z(o),[4,ut()];case 1:return r=t.sent(),n=r.transaction(at,"readwrite"),[4,(r=n.objectStore(at)).get(e)];case 2:return i=t.sent(),[4,r.put(a,e)];case 3:return t.sent(),[4,n.complete];case 4:return t.sent(),i&&i.fid===a.fid||Z(o,a.fid),[2,a]}})})}function lt(r){return c(this,void 0,void 0,function(){var e,n;return l(this,function(t){switch(t.label){case 0:return e=z(r),[4,ut()];case 1:return n=t.sent(),[4,(n=n.transaction(at,"readwrite")).objectStore(at).delete(e)];case 2:return t.sent(),[4,n.complete];case 3:return t.sent(),[2]}})})}function ft(a,s){return c(this,void 0,void 0,function(){var e,n,r,i,o;return l(this,function(t){switch(t.label){case 0:return e=z(a),[4,ut()];case 1:return r=t.sent(),n=r.transaction(at,"readwrite"),[4,(r=n.objectStore(at)).get(e)];case 2:return i=t.sent(),void 0!==(o=s(i))?[3,4]:[4,r.delete(e)];case 3:return t.sent(),[3,6];case 4:return[4,r.put(o,e)];case 5:t.sent(),t.label=6;case 6:return[4,n.complete];case 7:return t.sent(),!o||i&&i.fid===o.fid||Z(a,o.fid),[2,o]}})})}function pt(i){return c(this,void 0,void 0,function(){var e,n,r;return l(this,function(t){switch(t.label){case 0:return[4,ft(i,function(t){t=dt(t||{fid:J(),registrationStatus:0}),t=function(t,e){{if(0!==e.registrationStatus)return 1===e.registrationStatus?{installationEntry:e,registrationPromise:function(i){return c(this,void 0,void 0,function(){var e,n,r;return l(this,function(t){switch(t.label){case 0:return[4,ht(i)];case 1:e=t.sent(),t.label=2;case 2:return 1!==e.registrationStatus?[3,5]:[4,K(100)];case 3:return t.sent(),[4,ht(i)];case 4:return e=t.sent(),[3,2];case 5:return 0!==e.registrationStatus?[3,7]:[4,pt(i)];case 6:return r=t.sent(),n=r.installationEntry,(r=r.registrationPromise)?[2,r]:[2,n];case 7:return[2,e]}})})}(t)}:{installationEntry:e};if(!navigator.onLine){var n=Promise.reject(B.create("app-offline"));return{installationEntry:e,registrationPromise:n}}e={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},t=function(r,i){return c(this,void 0,void 0,function(){var e,n;return l(this,function(t){switch(t.label){case 0:return t.trys.push([0,2,,7]),[4,function(a,t){var s=t.fid;return c(this,void 0,void 0,function(){var e,n,r,i,o;return l(this,function(t){switch(t.label){case 0:return e=x(a),n=F(a),o={fid:s,authVersion:C,appId:a.appId,sdkVersion:R},r={method:"POST",headers:n,body:JSON.stringify(o)},[4,V(function(){return fetch(e,r)})];case 1:return(i=t.sent()).ok?[4,i.json()]:[3,3];case 2:return o=t.sent(),[2,{fid:o.fid||s,registrationStatus:2,refreshToken:o.refreshToken,authToken:U(o.authToken)}];case 3:return[4,q("Create Installation",i)];case 4:throw t.sent()}})})}(r,i)];case 1:return e=t.sent(),[2,ct(r,e)];case 2:return L(n=t.sent())&&409===n.customData.serverCode?[4,lt(r)]:[3,4];case 3:return t.sent(),[3,6];case 4:return[4,ct(r,{fid:i.fid,registrationStatus:0})];case 5:t.sent(),t.label=6;case 6:throw n;case 7:return[2]}})})}(t,e);return{installationEntry:e,registrationPromise:t}}}(i,t);return e=t.registrationPromise,t.installationEntry})];case 1:return(n=t.sent()).fid!==G?[3,3]:(r={},[4,e]);case 2:return[2,(r.installationEntry=t.sent(),r)];case 3:return[2,{installationEntry:n,registrationPromise:e}]}})})}function ht(t){return ft(t,function(t){if(!t)throw B.create("installation-not-found");return dt(t)})}function dt(t){return 1===(e=t).registrationStatus&&e.registrationTime+P<Date.now()?{fid:t.fid,registrationStatus:0}:t;var e}function gt(t,a){var s=t.appConfig,u=t.platformLoggerProvider;return c(this,void 0,void 0,function(){var e,n,r,i,o;return l(this,function(t){switch(t.label){case 0:return e=function(t,e){e=e.fid;return x(t)+"/"+e+"/authTokens:generate"}(s,a),n=H(s,a),(o=u.getImmediate({optional:!0}))&&n.append("x-firebase-client",o.getPlatformInfoString()),o={installation:{sdkVersion:R}},r={method:"POST",headers:n,body:JSON.stringify(o)},[4,V(function(){return fetch(e,r)})];case 1:return(i=t.sent()).ok?[4,i.json()]:[3,3];case 2:return o=t.sent(),[2,U(o)];case 3:return[4,q("Generate Auth Token",i)];case 4:throw t.sent()}})})}function mt(i,o){return void 0===o&&(o=!1),c(this,void 0,void 0,function(){var r,e,n;return l(this,function(t){switch(t.label){case 0:return[4,ft(i.appConfig,function(t){if(!yt(t))throw B.create("not-registered");var e,n=t.authToken;if(o||2!==(e=n).requestStatus||function(t){var e=Date.now();return e<t.creationTime||t.creationTime+t.expiresIn<e+j}(e)){if(1===n.requestStatus)return r=function(n,r){return c(this,void 0,void 0,function(){var e;return l(this,function(t){switch(t.label){case 0:return[4,vt(n.appConfig)];case 1:e=t.sent(),t.label=2;case 2:return 1!==e.authToken.requestStatus?[3,5]:[4,K(100)];case 3:return t.sent(),[4,vt(n.appConfig)];case 4:return e=t.sent(),[3,2];case 5:return 0===(e=e.authToken).requestStatus?[2,mt(n,r)]:[2,e]}})})}(i,o),t;if(!navigator.onLine)throw B.create("app-offline");n=(e=t,n={requestStatus:1,requestTime:Date.now()},a(a({},e),{authToken:n}));return r=function(i,o){return c(this,void 0,void 0,function(){var e,n,r;return l(this,function(t){switch(t.label){case 0:return t.trys.push([0,3,,8]),[4,gt(i,o)];case 1:return e=t.sent(),r=a(a({},o),{authToken:e}),[4,ct(i.appConfig,r)];case 2:return t.sent(),[2,e];case 3:return!L(n=t.sent())||401!==n.customData.serverCode&&404!==n.customData.serverCode?[3,5]:[4,lt(i.appConfig)];case 4:return t.sent(),[3,7];case 5:return r=a(a({},o),{authToken:{requestStatus:0}}),[4,ct(i.appConfig,r)];case 6:t.sent(),t.label=7;case 7:throw n;case 8:return[2]}})})}(i,n),n}return t})];case 1:return e=t.sent(),r?[4,r]:[3,3];case 2:return n=t.sent(),[3,4];case 3:n=e.authToken,t.label=4;case 4:return[2,n]}})})}function vt(t){return ft(t,function(t){if(!yt(t))throw B.create("not-registered");var e=t.authToken;return 1===(e=e).requestStatus&&e.requestTime+P<Date.now()?a(a({},t),{authToken:{requestStatus:0}}):t})}function yt(t){return void 0!==t&&2===t.registrationStatus}function bt(e,n){return void 0===n&&(n=!1),c(this,void 0,void 0,function(){return l(this,function(t){switch(t.label){case 0:return[4,function(n){return c(this,void 0,void 0,function(){var e;return l(this,function(t){switch(t.label){case 0:return[4,pt(n)];case 1:return(e=t.sent().registrationPromise)?[4,e]:[3,3];case 2:t.sent(),t.label=3;case 3:return[2]}})})}(e.appConfig)];case 1:return t.sent(),[4,mt(e,n)];case 2:return[2,t.sent().token]}})})}function _t(i,o){return c(this,void 0,void 0,function(){var e,n,r;return l(this,function(t){switch(t.label){case 0:return e=function(t,e){e=e.fid;return x(t)+"/"+e}(i,o),r=H(i,o),n={method:"DELETE",headers:r},[4,V(function(){return fetch(e,n)})];case 1:return(r=t.sent()).ok?[3,3]:[4,q("Delete Installation",r)];case 2:throw t.sent();case 3:return[2]}})})}function wt(t,r){var i=t.appConfig;return function(t,e){tt();var n=z(t);(t=Y.get(n))||(t=new Set,Y.set(n,t)),t.add(e)}(i,r),function(){var t,e,n;e=r,n=z(t=i),(t=Y.get(n))&&(t.delete(e),0===t.size&&Y.delete(n),et())}}function It(t){return B.create("missing-app-config-values",{valueName:t})}(nt=e.default).INTERNAL.registerComponent(new g("installations",function(t){var e=t.getProvider("app").getImmediate(),n={appConfig:function(t){var e,n;if(!t||!t.options)throw It("App Configuration");if(!t.name)throw It("App Name");try{for(var r=s(["projectId","apiKey","appId"]),i=r.next();!i.done;i=r.next()){var o=i.value;if(!t.options[o])throw It(o)}}catch(t){e={error:t}}finally{try{i&&!i.done&&(n=r.return)&&n.call(r)}finally{if(e)throw e.error}}return{appName:t.name,projectId:t.options.projectId,apiKey:t.options.apiKey,appId:t.options.appId}}(e),platformLoggerProvider:t.getProvider("platform-logger")};return{app:e,getId:function(){return function(r){return c(this,void 0,void 0,function(){var e,n;return l(this,function(t){switch(t.label){case 0:return[4,pt(r.appConfig)];case 1:return e=t.sent(),n=e.installationEntry,(e.registrationPromise||mt(r)).catch(console.error),[2,n.fid]}})})}(n)},getToken:function(t){return bt(n,t)},delete:function(){return function(r){return c(this,void 0,void 0,function(){var e,n;return l(this,function(t){switch(t.label){case 0:return[4,ft(e=r.appConfig,function(t){if(!t||0!==t.registrationStatus)return t})];case 1:if(!(n=t.sent()))return[3,6];if(1!==n.registrationStatus)return[3,2];throw B.create("delete-pending-registration");case 2:if(2!==n.registrationStatus)return[3,6];if(navigator.onLine)return[3,3];throw B.create("app-offline");case 3:return[4,_t(e,n)];case 4:return t.sent(),[4,lt(e)];case 5:t.sent(),t.label=6;case 6:return[2]}})})}(n)},onIdChange:function(t){return wt(n,t)}}},"PUBLIC")),nt.registerVersion("@firebase/installations",O),(jt=rt=rt||{})[jt.DEBUG=0]="DEBUG",jt[jt.VERBOSE=1]="VERBOSE",jt[jt.INFO=2]="INFO",jt[jt.WARN=3]="WARN",jt[jt.ERROR=4]="ERROR",jt[jt.SILENT=5]="SILENT";function St(t,e){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];if(!(e<t.logLevel)){var i=(new Date).toISOString(),o=At[e];if(!o)throw new Error("Attempted to log a message with an invalid logType (value: "+e+")");console[o].apply(console,u(["["+i+"]  "+t.name+":"],n))}}var Tt={debug:rt.DEBUG,verbose:rt.VERBOSE,info:rt.INFO,warn:rt.WARN,error:rt.ERROR,silent:rt.SILENT},Et=rt.INFO,At=((Dt={})[rt.DEBUG]="log",Dt[rt.VERBOSE]="log",Dt[rt.INFO]="info",Dt[rt.WARN]="warn",Dt[rt.ERROR]="error",Dt),D=(Object.defineProperty(Nt.prototype,"logLevel",{get:function(){return this._logLevel},set:function(t){if(!(t in rt))throw new TypeError('Invalid value "'+t+'" assigned to `logLevel`');this._logLevel=t},enumerable:!1,configurable:!0}),Nt.prototype.setLogLevel=function(t){this._logLevel="string"==typeof t?Tt[t]:t},Object.defineProperty(Nt.prototype,"logHandler",{get:function(){return this._logHandler},set:function(t){if("function"!=typeof t)throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t},enumerable:!1,configurable:!0}),Object.defineProperty(Nt.prototype,"userLogHandler",{get:function(){return this._userLogHandler},set:function(t){this._userLogHandler=t},enumerable:!1,configurable:!0}),Nt.prototype.debug=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];this._userLogHandler&&this._userLogHandler.apply(this,u([this,rt.DEBUG],t)),this._logHandler.apply(this,u([this,rt.DEBUG],t))},Nt.prototype.log=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];this._userLogHandler&&this._userLogHandler.apply(this,u([this,rt.VERBOSE],t)),this._logHandler.apply(this,u([this,rt.VERBOSE],t))},Nt.prototype.info=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];this._userLogHandler&&this._userLogHandler.apply(this,u([this,rt.INFO],t)),this._logHandler.apply(this,u([this,rt.INFO],t))},Nt.prototype.warn=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];this._userLogHandler&&this._userLogHandler.apply(this,u([this,rt.WARN],t)),this._logHandler.apply(this,u([this,rt.WARN],t))},Nt.prototype.error=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];this._userLogHandler&&this._userLogHandler.apply(this,u([this,rt.ERROR],t)),this._logHandler.apply(this,u([this,rt.ERROR],t))},Nt);function Nt(t){this.name=t,this._logLevel=Et,this._logHandler=St,this._userLogHandler=null}var kt,Ot,Pt="0.4.10",Rt="FB-PERF-TRACE-MEASURE",Ct="@firebase/performance/config",Mt="@firebase/performance/configexpire",jt="Performance",Dt=((Dt={})["trace started"]="Trace {$traceName} was started before.",Dt["trace stopped"]="Trace {$traceName} is not running.",Dt["nonpositive trace startTime"]="Trace {$traceName} startTime should be positive.",Dt["nonpositive trace duration"]="Trace {$traceName} duration should be positive.",Dt["no window"]="Window is not available.",Dt["no app id"]="App id is not available.",Dt["no project id"]="Project id is not available.",Dt["no api key"]="Api key is not available.",Dt["invalid cc log"]="Attempted to queue invalid cc event",Dt["FB not default"]="Performance can only start when Firebase app instance is the default one.",Dt["RC response not ok"]="RC response is not ok",Dt["invalid attribute name"]="Attribute name {$attributeName} is invalid.",Dt["invalid attribute value"]="Attribute value {$attributeValue} is invalid.",Dt["invalid custom metric name"]="Custom metric name {$customMetricName} is invalid",Dt["invalid String merger input"]="Input for String merger is invalid, contact support team to resolve.",Dt),Bt=new h("performance",jt,Dt),Lt=new D(jt);Lt.logLevel=rt.INFO;var xt,Ut=(qt.prototype.getUrl=function(){return this.windowLocation.href.split("?")[0]},qt.prototype.mark=function(t){this.performance&&this.performance.mark&&this.performance.mark(t)},qt.prototype.measure=function(t,e,n){this.performance&&this.performance.measure&&this.performance.measure(t,e,n)},qt.prototype.getEntriesByType=function(t){return this.performance&&this.performance.getEntriesByType?this.performance.getEntriesByType(t):[]},qt.prototype.getEntriesByName=function(t){return this.performance&&this.performance.getEntriesByName?this.performance.getEntriesByName(t):[]},qt.prototype.getTimeOrigin=function(){return this.performance&&(this.performance.timeOrigin||this.performance.timing.navigationStart)},qt.prototype.requiredApisAvailable=function(){return fetch&&Promise&&this.navigator&&this.navigator.cookieEnabled?"indexedDB"in self&&null!=indexedDB||(Lt.info("IndexedDB is not supported by current browswer"),!1):(Lt.info("Firebase Performance cannot start if browser does not support fetch and Promise or cookie is disabled."),!1)},qt.prototype.setupObserver=function(t,i){this.PerformanceObserver&&new this.PerformanceObserver(function(t){for(var e=0,n=t.getEntries();e<n.length;e++){var r=n[e];i(r)}}).observe({entryTypes:[t]})},qt.getInstance=function(){return kt=void 0===kt?new qt(Ot):kt},qt);function qt(t){if(!(this.window=t))throw Bt.create("no window");this.performance=t.performance,this.PerformanceObserver=t.PerformanceObserver,this.windowLocation=t.location,this.navigator=t.navigator,this.document=t.document,this.navigator&&this.navigator.cookieEnabled&&(this.localStorage=t.localStorage),t.perfMetrics&&t.perfMetrics.onFirstInputDelay&&(this.onFirstInputDelay=t.perfMetrics.onFirstInputDelay)}function Ft(t,e){var n=t.length-e.length;if(n<0||1<n)throw Bt.create("invalid String merger input");for(var r=[],i=0;i<t.length;i++)r.push(t.charAt(i)),e.length>i&&r.push(e.charAt(i));return r.join("")}var Ht,Vt,Kt=(Wt.prototype.getAppId=function(){var t=this.firebaseAppInstance&&this.firebaseAppInstance.options&&this.firebaseAppInstance.options.appId;if(!t)throw Bt.create("no app id");return t},Wt.prototype.getProjectId=function(){var t=this.firebaseAppInstance&&this.firebaseAppInstance.options&&this.firebaseAppInstance.options.projectId;if(!t)throw Bt.create("no project id");return t},Wt.prototype.getApiKey=function(){var t=this.firebaseAppInstance&&this.firebaseAppInstance.options&&this.firebaseAppInstance.options.apiKey;if(!t)throw Bt.create("no api key");return t},Wt.prototype.getFlTransportFullUrl=function(){return this.flTransportEndpointUrl.concat("?key=",this.transportKey)},Wt.getInstance=function(){return xt=void 0===xt?new Wt:xt},Wt);function Wt(){this.instrumentationEnabled=!0,this.dataCollectionEnabled=!0,this.loggingEnabled=!1,this.tracesSamplingRate=1,this.networkRequestsSamplingRate=1,this.logEndPointUrl="https://firebaselogging.googleapis.com/v0cc/log?format=json_proto",this.flTransportEndpointUrl=Ft("hts/frbslgigp.ogepscmv/ieo/eaylg","tp:/ieaeogn-agolai.o/1frlglgc/o"),this.transportKey=Ft("AzSC8r6ReiGqFMyfvgow","Iayx0u-XT3vksVM-pIV"),this.logSource=462,this.logTraceAfterSampling=!1,this.logNetworkAfterSampling=!1,this.configTimeToLive=12}(jt=Vt=Vt||{})[jt.UNKNOWN=0]="UNKNOWN",jt[jt.VISIBLE=1]="VISIBLE",jt[jt.HIDDEN=2]="HIDDEN";var $t=["firebase_","google_","ga_"],Gt=new RegExp("^[a-zA-Z]\\w*$");function Jt(){switch(Ut.getInstance().document.visibilityState){case"visible":return Vt.VISIBLE;case"hidden":return Vt.HIDDEN;default:return Vt.UNKNOWN}}var zt="0.0.1",Yt={loggingEnabled:!0},Zt="FIREBASE_INSTALLATIONS_AUTH";function Qt(t){var n,e=function(){var t=Ut.getInstance().localStorage;if(!t)return;var e=t.getItem(Mt);if(!e||!function(t){return Number(t)>Date.now()}(e))return;var n=t.getItem(Ct);if(!n)return;try{return JSON.parse(n)}catch(t){return}}();return e?(te(e),Promise.resolve()):(n=t,function(){var t=Kt.getInstance().installationsService.getToken();return t.then(function(t){}),t}().then(function(t){var e="https://firebaseremoteconfig.googleapis.com/v1/projects/"+Kt.getInstance().getProjectId()+"/namespaces/fireperf:fetch?key="+Kt.getInstance().getApiKey(),t=new Request(e,{method:"POST",headers:{Authorization:Zt+" "+t},body:JSON.stringify({app_instance_id:n,app_instance_id_token:t,app_id:Kt.getInstance().getAppId(),app_version:Pt,sdk_version:zt})});return fetch(t).then(function(t){if(t.ok)return t.json();throw Bt.create("RC response not ok")})}).catch(function(){Lt.info(Xt)}).then(te).then(function(t){var e=Ut.getInstance().localStorage;if(!t||!e)return;e.setItem(Ct,JSON.stringify(t)),e.setItem(Mt,String(Date.now()+60*Kt.getInstance().configTimeToLive*60*1e3))},function(){}))}var Xt="Could not fetch config, will use default configs";function te(t){if(!t)return t;var e=Kt.getInstance(),n=t.entries||{};return e.loggingEnabled=void 0!==n.fpr_enabled?"true"===String(n.fpr_enabled):Yt.loggingEnabled,n.fpr_log_source&&(e.logSource=Number(n.fpr_log_source)),n.fpr_log_endpoint_url&&(e.logEndPointUrl=n.fpr_log_endpoint_url),n.fpr_log_transport_key&&(e.transportKey=n.fpr_log_transport_key),void 0!==n.fpr_vc_network_request_sampling_rate&&(e.networkRequestsSamplingRate=Number(n.fpr_vc_network_request_sampling_rate)),void 0!==n.fpr_vc_trace_sampling_rate&&(e.tracesSamplingRate=Number(n.fpr_vc_trace_sampling_rate)),e.logTraceAfterSampling=ee(e.tracesSamplingRate),e.logNetworkAfterSampling=ee(e.networkRequestsSamplingRate),t}function ee(t){return Math.random()<=t}var ne,re=1;function ie(){return re=2,ne=ne||function(){var n=Ut.getInstance().document;return new Promise(function(t){var e;n&&"complete"!==n.readyState?(e=function(){"complete"===n.readyState&&(n.removeEventListener("readystatechange",e),t())},n.addEventListener("readystatechange",e)):t()})}().then(function(){return(t=Kt.getInstance().installationsService.getId()).then(function(t){Ht=t}),t;var t}).then(Qt).then(oe,oe)}function oe(){re=3}var ae,se=1e4,ue=5500,ce=3,le=1e3,fe=ce,pe=[],he=!1;function de(t){setTimeout(function(){var t,e;if(0!==fe)return pe.length?(t=pe.splice(0,le),e=t.map(function(t){return{source_extension_json_proto3:t.message,event_time_ms:String(t.eventTime)}}),void function(t,r){return function(t){var e=Kt.getInstance().getFlTransportFullUrl();return fetch(e,{method:"POST",body:JSON.stringify(t)})}(t).then(function(t){return t.ok||Lt.info("Call to Firebase backend failed."),t.json()}).then(function(t){var e=Number(t.nextRequestWaitMillis),n=se;isNaN(e)||(n=Math.max(e,n));t=t.logResponseDetails;Array.isArray(t)&&0<t.length&&"RETRY_REQUEST_LATER"===t[0].responseAction&&(pe=u(u([],r),pe),Lt.info("Retry transport request later.")),fe=ce,de(n)})}({request_time_ms:String(Date.now()),client_info:{client_type:1,js_client_info:{}},log_source:Kt.getInstance().logSource,log_event:e},t).catch(function(){pe=u(u([],t),pe),fe--,Lt.info("Tries left: "+fe+"."),de(se)})):de(se)},t)}function ge(n){return function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];!function(t){if(!t.eventTime||!t.message)throw Bt.create("invalid cc log");pe=u(u([],pe),[t])}({message:n.apply(void 0,t),eventTime:Date.now()})}}function me(t,e){(ae=ae||ge(be))(t,e)}function ve(t){var e=Kt.getInstance();!e.instrumentationEnabled&&t.isAuto||(e.dataCollectionEnabled||t.isAuto)&&Ut.getInstance().requiredApisAvailable()&&(t.isAuto&&Jt()!==Vt.VISIBLE||(3===re?ye(t):ie().then(function(){return ye(t)},function(){return ye(t)})))}function ye(t){var e;!Ht||(e=Kt.getInstance()).loggingEnabled&&e.logTraceAfterSampling&&setTimeout(function(){return me(t,1)},0)}function be(t,e){return(0===e?function(t){t={url:t.url,http_method:t.httpMethod||0,http_response_code:200,response_payload_bytes:t.responsePayloadBytes,client_start_time_us:t.startTimeUs,time_to_response_initiated_us:t.timeToResponseInitiatedUs,time_to_response_completed_us:t.timeToResponseCompletedUs},t={application_info:_e(),network_request_metric:t};return JSON.stringify(t)}:function(t){var e={name:t.name,is_auto:t.isAuto,client_start_time_us:t.startTimeUs,duration_us:t.durationUs};0!==Object.keys(t.counters).length&&(e.counters=t.counters);t=t.getAttributes();0!==Object.keys(t).length&&(e.custom_attributes=t);e={application_info:_e(),trace_metric:e};return JSON.stringify(e)})(t)}function _e(){return{google_app_id:Kt.getInstance().getAppId(),app_instance_id:Ht,web_app_info:{sdk_version:Pt,page_url:Ut.getInstance().getUrl(),service_worker_status:"serviceWorker"in(t=Ut.getInstance().navigator)?t.serviceWorker.controller?2:3:1,visibility_state:Jt(),effective_connection_type:function(){var t=Ut.getInstance().navigator.connection;switch(t&&t.effectiveType){case"slow-2g":return 1;case"2g":return 2;case"3g":return 3;case"4g":return 4;default:return 0}}()},application_process_state:0};var t}var we=["_fp","_fcp","_fid"];var Ie=(Se.prototype.start=function(){if(1!==this.state)throw Bt.create("trace started",{traceName:this.name});this.api.mark(this.traceStartMark),this.state=2},Se.prototype.stop=function(){if(2!==this.state)throw Bt.create("trace stopped",{traceName:this.name});this.state=3,this.api.mark(this.traceStopMark),this.api.measure(this.traceMeasure,this.traceStartMark,this.traceStopMark),this.calculateTraceMetrics(),ve(this)},Se.prototype.record=function(t,e,n){if(t<=0)throw Bt.create("nonpositive trace startTime",{traceName:this.name});if(e<=0)throw Bt.create("nonpositive trace duration",{traceName:this.name});if(this.durationUs=Math.floor(1e3*e),this.startTimeUs=Math.floor(1e3*t),n&&n.attributes&&(this.customAttributes=a({},n.attributes)),n&&n.metrics)for(var r=0,i=Object.keys(n.metrics);r<i.length;r++){var o=i[r];isNaN(Number(n.metrics[o]))||(this.counters[o]=Number(Math.floor(n.metrics[o])))}ve(this)},Se.prototype.incrementMetric=function(t,e){void 0===e&&(e=1),void 0===this.counters[t]?this.putMetric(t,e):this.putMetric(t,this.counters[t]+e)},Se.prototype.putMetric=function(t,e){if(n=t,r=this.name,0===n.length||100<n.length||!(r&&r.startsWith("_wt_")&&-1<we.indexOf(n))&&n.startsWith("_"))throw Bt.create("invalid custom metric name",{customMetricName:t});var n,r;this.counters[t]=(t=e,(e=Math.floor(t))<t&&Lt.info("Metric value should be an Integer, setting the value as : "+e+"."),e)},Se.prototype.getMetric=function(t){return this.counters[t]||0},Se.prototype.putAttribute=function(t,e){var n,r,i=!(0===(n=t).length||40<n.length)&&(!$t.some(function(t){return n.startsWith(t)})&&!!n.match(Gt)),r=0!==(r=e).length&&r.length<=100;if(i&&r)this.customAttributes[t]=e;else{if(!i)throw Bt.create("invalid attribute name",{attributeName:t});if(!r)throw Bt.create("invalid attribute value",{attributeValue:e})}},Se.prototype.getAttribute=function(t){return this.customAttributes[t]},Se.prototype.removeAttribute=function(t){void 0!==this.customAttributes[t]&&delete this.customAttributes[t]},Se.prototype.getAttributes=function(){return a({},this.customAttributes)},Se.prototype.setStartTime=function(t){this.startTimeUs=t},Se.prototype.setDuration=function(t){this.durationUs=t},Se.prototype.calculateTraceMetrics=function(){var t=this.api.getEntriesByName(this.traceMeasure),t=t&&t[0];t&&(this.durationUs=Math.floor(1e3*t.duration),this.startTimeUs=Math.floor(1e3*(t.startTime+this.api.getTimeOrigin())))},Se.createOobTrace=function(t,e,n){var r,i=Ut.getInstance().getUrl();i&&(r=new Se("_wt_"+i,!0),i=Math.floor(1e3*Ut.getInstance().getTimeOrigin()),r.setStartTime(i),t&&t[0]&&(r.setDuration(Math.floor(1e3*t[0].duration)),r.putMetric("domInteractive",Math.floor(1e3*t[0].domInteractive)),r.putMetric("domContentLoadedEventEnd",Math.floor(1e3*t[0].domContentLoadedEventEnd)),r.putMetric("loadEventEnd",Math.floor(1e3*t[0].loadEventEnd))),e&&((t=e.find(function(t){return"first-paint"===t.name}))&&t.startTime&&r.putMetric("_fp",Math.floor(1e3*t.startTime)),(e=e.find(function(t){return"first-contentful-paint"===t.name}))&&e.startTime&&r.putMetric("_fcp",Math.floor(1e3*e.startTime)),n&&r.putMetric("_fid",Math.floor(1e3*n))),ve(r))},Se.createUserTimingTrace=function(t){ve(new Se(t,!1,t))},Se);function Se(t,e,n){void 0===e&&(e=!1),this.name=t,this.isAuto=e,this.state=1,this.customAttributes={},this.counters={},this.api=Ut.getInstance(),this.randomId=Math.floor(1e6*Math.random()),this.isAuto||(this.traceStartMark="FB-PERF-TRACE-START-"+this.randomId+"-"+this.name,this.traceStopMark="FB-PERF-TRACE-STOP-"+this.randomId+"-"+this.name,this.traceMeasure=n||Rt+"-"+this.randomId+"-"+this.name,n&&this.calculateTraceMetrics())}function Te(t){var e,n,r,i=t;i&&void 0!==i.responseStart&&(n=Ut.getInstance().getTimeOrigin(),r=Math.floor(1e3*(i.startTime+n)),t=i.responseStart?Math.floor(1e3*(i.responseStart-i.startTime)):void 0,n=Math.floor(1e3*(i.responseEnd-i.startTime)),i={url:i.name&&i.name.split("?")[0],responsePayloadBytes:i.transferSize,startTimeUs:r,timeToResponseInitiatedUs:t,timeToResponseCompletedUs:n},e=i,(r=Kt.getInstance()).instrumentationEnabled&&(t=e.url,n=r.logEndPointUrl.split("?")[0],i=r.flTransportEndpointUrl.split("?")[0],t!==n&&t!==i&&r.loggingEnabled&&r.logNetworkAfterSampling&&setTimeout(function(){return me(e,0)},0)))}var Ee=5e3;function Ae(){Ht&&(setTimeout(function(){var t=Ut.getInstance(),e=t.getEntriesByType("navigation"),n=t.getEntriesByType("paint");{var r;t.onFirstInputDelay?(r=setTimeout(function(){Ie.createOobTrace(e,n),r=void 0},Ee),t.onFirstInputDelay(function(t){r&&(clearTimeout(r),Ie.createOobTrace(e,n,t))})):Ie.createOobTrace(e,n)}},0),setTimeout(function(){for(var t=Ut.getInstance(),e=t.getEntriesByType("resource"),n=0,r=e;n<r.length;n++)Te(r[n]);t.setupObserver("resource",Te)},0),setTimeout(function(){for(var t=Ut.getInstance(),e=t.getEntriesByType("measure"),n=0,r=e;n<r.length;n++)Ne(r[n]);t.setupObserver("measure",Ne)},0))}function Ne(t){t=t.name;t.substring(0,Rt.length)!==Rt&&Ie.createUserTimingTrace(t)}var ke=(Oe.prototype.trace=function(t){return new Ie(t)},Object.defineProperty(Oe.prototype,"instrumentationEnabled",{get:function(){return Kt.getInstance().instrumentationEnabled},set:function(t){Kt.getInstance().instrumentationEnabled=t},enumerable:!1,configurable:!0}),Object.defineProperty(Oe.prototype,"dataCollectionEnabled",{get:function(){return Kt.getInstance().dataCollectionEnabled},set:function(t){Kt.getInstance().dataCollectionEnabled=t},enumerable:!1,configurable:!0}),Oe);function Oe(t){this.app=t,Ut.getInstance().requiredApisAvailable()&&new Promise(function(t,e){try{var n=!0,r="validate-browser-context-for-indexeddb-analytics-module",i=window.indexedDB.open(r);i.onsuccess=function(){i.result.close(),n||window.indexedDB.deleteDatabase(r),t(!0)},i.onupgradeneeded=function(){n=!1},i.onerror=function(){var t;e((null===(t=i.error)||void 0===t?void 0:t.message)||"")}}catch(t){e(t)}}).then(function(t){t&&(he||(de(ue),he=!0),ie().then(Ae,Ae))}).catch(function(t){Lt.info("Environment doesn't support IndexedDB: "+t)})}var Pe;function Re(t,e){if("[DEFAULT]"!==t.name)throw Bt.create("FB not default");if("undefined"==typeof window)throw Bt.create("no window");return Ot=window,Kt.getInstance().firebaseAppInstance=t,Kt.getInstance().installationsService=e,new ke(t)}(Pe=e.default).INTERNAL.registerComponent(new g("performance",function(t){var e=t.getProvider("app").getImmediate(),t=t.getProvider("installations").getImmediate();return Re(e,t)},"PUBLIC")),Pe.registerVersion("@firebase/performance","0.4.10")}.apply(this,arguments)}catch(t){throw console.error(t),new Error("Cannot instantiate firebase-performance.js - be sure to load firebase-app.js first.")}});
//# sourceMappingURL=B_firebase-performance.js.map
