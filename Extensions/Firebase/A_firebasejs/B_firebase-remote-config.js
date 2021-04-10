!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(require("@firebase/app")):"function"==typeof define&&define.amd?define(["@firebase/app"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).firebase)}(this,function(Xt){"use strict";try{!function(){function t(t){return t&&"object"==typeof t&&"default"in t?t:{default:t}}var e=t(Xt),r=function(t,e){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n])})(t,e)};var s=function(){return(s=Object.assign||function(t){for(var e,n=1,r=arguments.length;n<r;n++)for(var i in e=arguments[n])Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i]);return t}).apply(this,arguments)};function f(t,s,a,u){return new(a=a||Promise)(function(n,e){function r(t){try{o(u.next(t))}catch(t){e(t)}}function i(t){try{o(u.throw(t))}catch(t){e(t)}}function o(t){var e;t.done?n(t.value):((e=t.value)instanceof a?e:new a(function(t){t(e)})).then(r,i)}o((u=u.apply(t,s||[])).next())})}function p(n,r){var i,o,s,a={label:0,sent:function(){if(1&s[0])throw s[1];return s[1]},trys:[],ops:[]},t={next:e(0),throw:e(1),return:e(2)};return"function"==typeof Symbol&&(t[Symbol.iterator]=function(){return this}),t;function e(e){return function(t){return function(e){if(i)throw new TypeError("Generator is already executing.");for(;a;)try{if(i=1,o&&(s=2&e[0]?o.return:e[0]?o.throw||((s=o.return)&&s.call(o),0):o.next)&&!(s=s.call(o,e[1])).done)return s;switch(o=0,(e=s?[2&e[0],s.value]:e)[0]){case 0:case 1:s=e;break;case 4:return a.label++,{value:e[1],done:!1};case 5:a.label++,o=e[1],e=[0];continue;case 7:e=a.ops.pop(),a.trys.pop();continue;default:if(!(s=0<(s=a.trys).length&&s[s.length-1])&&(6===e[0]||2===e[0])){a=0;continue}if(3===e[0]&&(!s||e[1]>s[0]&&e[1]<s[3])){a.label=e[1];break}if(6===e[0]&&a.label<s[1]){a.label=s[1],s=e;break}if(s&&a.label<s[2]){a.label=s[2],a.ops.push(e);break}s[2]&&a.ops.pop(),a.trys.pop();continue}e=r.call(n,a)}catch(t){e=[6,t],o=0}finally{i=s=0}if(5&e[0])throw e[1];return{value:e[0]?e[1]:void 0,done:!0}}([e,t])}}}function a(t){var e="function"==typeof Symbol&&Symbol.iterator,n=e&&t[e],r=0;if(n)return n.call(t);if(t&&"number"==typeof t.length)return{next:function(){return{value:(t=t&&r>=t.length?void 0:t)&&t[r++],done:!t}}};throw new TypeError(e?"Object is not iterable.":"Symbol.iterator is not defined.")}function u(t,e){for(var n=0,r=e.length,i=t.length;n<r;n++,i++)t[i]=e[n];return t}var i,o="FirebaseError",h=(function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function n(){this.constructor=t}r(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)}(c,i=Error),c);function c(t,e,n){e=i.call(this,e)||this;return e.code=t,e.customData=n,e.name=o,Object.setPrototypeOf(e,c.prototype),Error.captureStackTrace&&Error.captureStackTrace(e,l.prototype.create),e}var l=(n.prototype.create=function(t){for(var e=[],n=1;n<arguments.length;n++)e[n-1]=arguments[n];var r,i=e[0]||{},o=this.service+"/"+t,t=this.errors[t],t=t?(r=i,t.replace(g,function(t,e){var n=r[e];return null!=n?String(n):"<"+e+"?>"})):"Error",t=this.serviceName+": "+t+" ("+o+").";return new h(o,t,i)},n);function n(t,e,n){this.service=t,this.serviceName=e,this.errors=n}var g=/\{\$([^}]+)}/g;var d=(v.prototype.setInstantiationMode=function(t){return this.instantiationMode=t,this},v.prototype.setMultipleInstances=function(t){return this.multipleInstances=t,this},v.prototype.setServiceProps=function(t){return this.serviceProps=t,this},v.prototype.setInstanceCreatedCallback=function(t){return this.onInstanceCreated=t,this},v);function v(t,e,n){this.name=t,this.instanceFactory=e,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}function m(n){return new Promise(function(t,e){n.onsuccess=function(){t(n.result)},n.onerror=function(){e(n.error)}})}function y(n,r,i){var o,t=new Promise(function(t,e){m(o=n[r].apply(n,i)).then(t,e)});return t.request=o,t}function b(t,n,e){e.forEach(function(e){Object.defineProperty(t.prototype,e,{get:function(){return this[n][e]},set:function(t){this[n][e]=t}})})}function w(e,n,r,t){t.forEach(function(t){t in r.prototype&&(e.prototype[t]=function(){return y(this[n],t,arguments)})})}function _(e,n,r,t){t.forEach(function(t){t in r.prototype&&(e.prototype[t]=function(){return this[n][t].apply(this[n],arguments)})})}function S(t,r,e,n){n.forEach(function(n){n in e.prototype&&(t.prototype[n]=function(){return t=this[r],(e=y(t,n,arguments)).then(function(t){if(t)return new C(t,e.request)});var t,e})})}function E(t){this._index=t}function C(t,e){this._cursor=t,this._request=e}function T(t){this._store=t}function I(n){this._tx=n,this.complete=new Promise(function(t,e){n.oncomplete=function(){t()},n.onerror=function(){e(n.error)},n.onabort=function(){e(n.error)}})}function L(t,e,n){this._db=t,this.oldVersion=e,this.transaction=new I(n)}function P(t){this._db=t}b(E,"_index",["name","keyPath","multiEntry","unique"]),w(E,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),S(E,"_index",IDBIndex,["openCursor","openKeyCursor"]),b(C,"_cursor",["direction","key","primaryKey","value"]),w(C,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(n){n in IDBCursor.prototype&&(C.prototype[n]=function(){var e=this,t=arguments;return Promise.resolve().then(function(){return e._cursor[n].apply(e._cursor,t),m(e._request).then(function(t){if(t)return new C(t,e._request)})})})}),T.prototype.createIndex=function(){return new E(this._store.createIndex.apply(this._store,arguments))},T.prototype.index=function(){return new E(this._store.index.apply(this._store,arguments))},b(T,"_store",["name","keyPath","indexNames","autoIncrement"]),w(T,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),S(T,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),_(T,"_store",IDBObjectStore,["deleteIndex"]),I.prototype.objectStore=function(){return new T(this._tx.objectStore.apply(this._tx,arguments))},b(I,"_tx",["objectStoreNames","mode"]),_(I,"_tx",IDBTransaction,["abort"]),L.prototype.createObjectStore=function(){return new T(this._db.createObjectStore.apply(this._db,arguments))},b(L,"_db",["name","version","objectStoreNames"]),_(L,"_db",IDBDatabase,["deleteObjectStore","close"]),P.prototype.transaction=function(){return new I(this._db.transaction.apply(this._db,arguments))},b(P,"_db",["name","version","objectStoreNames"]),_(P,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(i){[T,E].forEach(function(t){i in t.prototype&&(t.prototype[i.replace("open","iterate")]=function(){var t=(n=arguments,Array.prototype.slice.call(n)),e=t[t.length-1],n=this._store||this._index,r=n[i].apply(n,t.slice(0,-1));r.onsuccess=function(){e(r.result)}})})}),[E,T].forEach(function(t){t.prototype.getAll||(t.prototype.getAll=function(t,n){var r=this,i=[];return new Promise(function(e){r.iterateCursor(t,function(t){t?(i.push(t.value),void 0===n||i.length!=n?t.continue():e(i)):e(i)})})})});var O="0.4.24",k=1e4,M="w:"+O,F="FIS_v2",j="https://firebaseinstallations.googleapis.com/v1",N=36e5,A=((A={})["missing-app-config-values"]='Missing App configuration value: "{$valueName}"',A["not-registered"]="Firebase Installation is not registered.",A["installation-not-found"]="Firebase Installation not found.",A["request-failed"]='{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',A["app-offline"]="Could not process request. Application offline.",A["delete-pending-registration"]="Can't delete installation while there is a pending registration request.",A),D=new l("installations","Installations",A);function R(t){return t instanceof h&&t.code.includes("request-failed")}function x(t){t=t.projectId;return j+"/projects/"+t+"/installations"}function B(t){return{token:t.token,requestStatus:2,expiresIn:(t=t.expiresIn,Number(t.replace("s","000"))),creationTime:Date.now()}}function q(n,r){return f(this,void 0,void 0,function(){var e;return p(this,function(t){switch(t.label){case 0:return[4,r.json()];case 1:return e=t.sent(),e=e.error,[2,D.create("request-failed",{requestName:n,serverCode:e.code,serverMessage:e.message,serverStatus:e.status})]}})})}function H(t){t=t.apiKey;return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function K(t,e){e=e.refreshToken,t=H(t);return t.append("Authorization",F+" "+e),t}function V(n){return f(this,void 0,void 0,function(){var e;return p(this,function(t){switch(t.label){case 0:return[4,n()];case 1:return 500<=(e=t.sent()).status&&e.status<600?[2,n()]:[2,e]}})})}function z(e){return new Promise(function(t){setTimeout(t,e)})}function U(t){return btoa(String.fromCharCode.apply(String,u([],function(t,e){var n="function"==typeof Symbol&&t[Symbol.iterator];if(!n)return t;var r,i,o=n.call(t),s=[];try{for(;(void 0===e||0<e--)&&!(r=o.next()).done;)s.push(r.value)}catch(t){i={error:t}}finally{try{r&&!r.done&&(n=o.return)&&n.call(o)}finally{if(i)throw i.error}}return s}(t)))).replace(/\+/g,"-").replace(/\//g,"_")}var $=/^[cdef][\w-]{21}$/,G="";function W(){try{var t=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(t),t[0]=112+t[0]%16;t=U(t).substr(0,22);return $.test(t)?t:G}catch(t){return G}}function J(t){return t.appName+"!"+t.appId}var Y=new Map;function Z(t,e){t=J(t);Q(t,e),function(t,e){var n=tt();n&&n.postMessage({key:t,fid:e});et()}(t,e)}function Q(t,e){var n,r,i=Y.get(t);if(i)try{for(var o=a(i),s=o.next();!s.done;s=o.next())(0,s.value)(e)}catch(t){n={error:t}}finally{try{s&&!s.done&&(r=o.return)&&r.call(o)}finally{if(n)throw n.error}}}var X=null;function tt(){return!X&&"BroadcastChannel"in self&&((X=new BroadcastChannel("[Firebase] FID Change")).onmessage=function(t){Q(t.data.key,t.data.fid)}),X}function et(){0===Y.size&&X&&(X.close(),X=null)}var nt,rt,it="firebase-installations-database",ot=1,st="firebase-installations-store",at=null;function ut(){var t,e,n;return at||(t=ot,e=function(t){0===t.oldVersion&&t.createObjectStore(st)},(n=(t=y(indexedDB,"open",[it,t])).request)&&(n.onupgradeneeded=function(t){e&&e(new L(n.result,t.oldVersion,n.transaction))}),at=t.then(function(t){return new P(t)})),at}function ct(o,s){return f(this,void 0,void 0,function(){var e,n,r,i;return p(this,function(t){switch(t.label){case 0:return e=J(o),[4,ut()];case 1:return r=t.sent(),n=r.transaction(st,"readwrite"),[4,(r=n.objectStore(st)).get(e)];case 2:return i=t.sent(),[4,r.put(s,e)];case 3:return t.sent(),[4,n.complete];case 4:return t.sent(),i&&i.fid===s.fid||Z(o,s.fid),[2,s]}})})}function lt(r){return f(this,void 0,void 0,function(){var e,n;return p(this,function(t){switch(t.label){case 0:return e=J(r),[4,ut()];case 1:return n=t.sent(),[4,(n=n.transaction(st,"readwrite")).objectStore(st).delete(e)];case 2:return t.sent(),[4,n.complete];case 3:return t.sent(),[2]}})})}function ft(s,a){return f(this,void 0,void 0,function(){var e,n,r,i,o;return p(this,function(t){switch(t.label){case 0:return e=J(s),[4,ut()];case 1:return r=t.sent(),n=r.transaction(st,"readwrite"),[4,(r=n.objectStore(st)).get(e)];case 2:return i=t.sent(),void 0!==(o=a(i))?[3,4]:[4,r.delete(e)];case 3:return t.sent(),[3,6];case 4:return[4,r.put(o,e)];case 5:t.sent(),t.label=6;case 6:return[4,n.complete];case 7:return t.sent(),!o||i&&i.fid===o.fid||Z(s,o.fid),[2,o]}})})}function ht(i){return f(this,void 0,void 0,function(){var e,n,r;return p(this,function(t){switch(t.label){case 0:return[4,ft(i,function(t){t=gt(t||{fid:W(),registrationStatus:0}),t=function(t,e){{if(0!==e.registrationStatus)return 1===e.registrationStatus?{installationEntry:e,registrationPromise:function(i){return f(this,void 0,void 0,function(){var e,n,r;return p(this,function(t){switch(t.label){case 0:return[4,pt(i)];case 1:e=t.sent(),t.label=2;case 2:return 1!==e.registrationStatus?[3,5]:[4,z(100)];case 3:return t.sent(),[4,pt(i)];case 4:return e=t.sent(),[3,2];case 5:return 0!==e.registrationStatus?[3,7]:[4,ht(i)];case 6:return r=t.sent(),n=r.installationEntry,(r=r.registrationPromise)?[2,r]:[2,n];case 7:return[2,e]}})})}(t)}:{installationEntry:e};if(!navigator.onLine){var n=Promise.reject(D.create("app-offline"));return{installationEntry:e,registrationPromise:n}}e={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},t=function(r,i){return f(this,void 0,void 0,function(){var e,n;return p(this,function(t){switch(t.label){case 0:return t.trys.push([0,2,,7]),[4,function(s,t){var a=t.fid;return f(this,void 0,void 0,function(){var e,n,r,i,o;return p(this,function(t){switch(t.label){case 0:return e=x(s),n=H(s),o={fid:a,authVersion:F,appId:s.appId,sdkVersion:M},r={method:"POST",headers:n,body:JSON.stringify(o)},[4,V(function(){return fetch(e,r)})];case 1:return(i=t.sent()).ok?[4,i.json()]:[3,3];case 2:return o=t.sent(),[2,{fid:o.fid||a,registrationStatus:2,refreshToken:o.refreshToken,authToken:B(o.authToken)}];case 3:return[4,q("Create Installation",i)];case 4:throw t.sent()}})})}(r,i)];case 1:return e=t.sent(),[2,ct(r,e)];case 2:return R(n=t.sent())&&409===n.customData.serverCode?[4,lt(r)]:[3,4];case 3:return t.sent(),[3,6];case 4:return[4,ct(r,{fid:i.fid,registrationStatus:0})];case 5:t.sent(),t.label=6;case 6:throw n;case 7:return[2]}})})}(t,e);return{installationEntry:e,registrationPromise:t}}}(i,t);return e=t.registrationPromise,t.installationEntry})];case 1:return(n=t.sent()).fid!==G?[3,3]:(r={},[4,e]);case 2:return[2,(r.installationEntry=t.sent(),r)];case 3:return[2,{installationEntry:n,registrationPromise:e}]}})})}function pt(t){return ft(t,function(t){if(!t)throw D.create("installation-not-found");return gt(t)})}function gt(t){return 1===(e=t).registrationStatus&&e.registrationTime+k<Date.now()?{fid:t.fid,registrationStatus:0}:t;var e}function dt(t,s){var a=t.appConfig,u=t.platformLoggerProvider;return f(this,void 0,void 0,function(){var e,n,r,i,o;return p(this,function(t){switch(t.label){case 0:return e=function(t,e){e=e.fid;return x(t)+"/"+e+"/authTokens:generate"}(a,s),n=K(a,s),(o=u.getImmediate({optional:!0}))&&n.append("x-firebase-client",o.getPlatformInfoString()),o={installation:{sdkVersion:M}},r={method:"POST",headers:n,body:JSON.stringify(o)},[4,V(function(){return fetch(e,r)})];case 1:return(i=t.sent()).ok?[4,i.json()]:[3,3];case 2:return o=t.sent(),[2,B(o)];case 3:return[4,q("Generate Auth Token",i)];case 4:throw t.sent()}})})}function vt(i,o){return void 0===o&&(o=!1),f(this,void 0,void 0,function(){var r,e,n;return p(this,function(t){switch(t.label){case 0:return[4,ft(i.appConfig,function(t){if(!yt(t))throw D.create("not-registered");var e,n=t.authToken;if(o||2!==(e=n).requestStatus||function(t){var e=Date.now();return e<t.creationTime||t.creationTime+t.expiresIn<e+N}(e)){if(1===n.requestStatus)return r=function(n,r){return f(this,void 0,void 0,function(){var e;return p(this,function(t){switch(t.label){case 0:return[4,mt(n.appConfig)];case 1:e=t.sent(),t.label=2;case 2:return 1!==e.authToken.requestStatus?[3,5]:[4,z(100)];case 3:return t.sent(),[4,mt(n.appConfig)];case 4:return e=t.sent(),[3,2];case 5:return 0===(e=e.authToken).requestStatus?[2,vt(n,r)]:[2,e]}})})}(i,o),t;if(!navigator.onLine)throw D.create("app-offline");n=(e=t,n={requestStatus:1,requestTime:Date.now()},s(s({},e),{authToken:n}));return r=function(i,o){return f(this,void 0,void 0,function(){var e,n,r;return p(this,function(t){switch(t.label){case 0:return t.trys.push([0,3,,8]),[4,dt(i,o)];case 1:return e=t.sent(),r=s(s({},o),{authToken:e}),[4,ct(i.appConfig,r)];case 2:return t.sent(),[2,e];case 3:return!R(n=t.sent())||401!==n.customData.serverCode&&404!==n.customData.serverCode?[3,5]:[4,lt(i.appConfig)];case 4:return t.sent(),[3,7];case 5:return r=s(s({},o),{authToken:{requestStatus:0}}),[4,ct(i.appConfig,r)];case 6:t.sent(),t.label=7;case 7:throw n;case 8:return[2]}})})}(i,n),n}return t})];case 1:return e=t.sent(),r?[4,r]:[3,3];case 2:return n=t.sent(),[3,4];case 3:n=e.authToken,t.label=4;case 4:return[2,n]}})})}function mt(t){return ft(t,function(t){if(!yt(t))throw D.create("not-registered");var e=t.authToken;return 1===(e=e).requestStatus&&e.requestTime+k<Date.now()?s(s({},t),{authToken:{requestStatus:0}}):t})}function yt(t){return void 0!==t&&2===t.registrationStatus}function bt(e,n){return void 0===n&&(n=!1),f(this,void 0,void 0,function(){return p(this,function(t){switch(t.label){case 0:return[4,function(n){return f(this,void 0,void 0,function(){var e;return p(this,function(t){switch(t.label){case 0:return[4,ht(n)];case 1:return(e=t.sent().registrationPromise)?[4,e]:[3,3];case 2:t.sent(),t.label=3;case 3:return[2]}})})}(e.appConfig)];case 1:return t.sent(),[4,vt(e,n)];case 2:return[2,t.sent().token]}})})}function wt(i,o){return f(this,void 0,void 0,function(){var e,n,r;return p(this,function(t){switch(t.label){case 0:return e=function(t,e){e=e.fid;return x(t)+"/"+e}(i,o),r=K(i,o),n={method:"DELETE",headers:r},[4,V(function(){return fetch(e,n)})];case 1:return(r=t.sent()).ok?[3,3]:[4,q("Delete Installation",r)];case 2:throw t.sent();case 3:return[2]}})})}function _t(t,r){var i=t.appConfig;return function(t,e){tt();var n=J(t);(t=Y.get(n))||(t=new Set,Y.set(n,t)),t.add(e)}(i,r),function(){var t,e,n;e=r,n=J(t=i),(t=Y.get(n))&&(t.delete(e),0===t.size&&Y.delete(n),et())}}function St(t){return D.create("missing-app-config-values",{valueName:t})}(nt=e.default).INTERNAL.registerComponent(new d("installations",function(t){var e=t.getProvider("app").getImmediate(),n={appConfig:function(t){var e,n;if(!t||!t.options)throw St("App Configuration");if(!t.name)throw St("App Name");try{for(var r=a(["projectId","apiKey","appId"]),i=r.next();!i.done;i=r.next()){var o=i.value;if(!t.options[o])throw St(o)}}catch(t){e={error:t}}finally{try{i&&!i.done&&(n=r.return)&&n.call(r)}finally{if(e)throw e.error}}return{appName:t.name,projectId:t.options.projectId,apiKey:t.options.apiKey,appId:t.options.appId}}(e),platformLoggerProvider:t.getProvider("platform-logger")};return{app:e,getId:function(){return function(r){return f(this,void 0,void 0,function(){var e,n;return p(this,function(t){switch(t.label){case 0:return[4,ht(r.appConfig)];case 1:return e=t.sent(),n=e.installationEntry,(e.registrationPromise||vt(r)).catch(console.error),[2,n.fid]}})})}(n)},getToken:function(t){return bt(n,t)},delete:function(){return function(r){return f(this,void 0,void 0,function(){var e,n;return p(this,function(t){switch(t.label){case 0:return[4,ft(e=r.appConfig,function(t){if(!t||0!==t.registrationStatus)return t})];case 1:if(!(n=t.sent()))return[3,6];if(1!==n.registrationStatus)return[3,2];throw D.create("delete-pending-registration");case 2:if(2!==n.registrationStatus)return[3,6];if(navigator.onLine)return[3,3];throw D.create("app-offline");case 3:return[4,wt(e,n)];case 4:return t.sent(),[4,lt(e)];case 5:t.sent(),t.label=6;case 6:return[2]}})})}(n)},onIdChange:function(t){return _t(n,t)}}},"PUBLIC")),nt.registerVersion("@firebase/installations",O),(A=rt=rt||{})[A.DEBUG=0]="DEBUG",A[A.VERBOSE=1]="VERBOSE",A[A.INFO=2]="INFO",A[A.WARN=3]="WARN",A[A.ERROR=4]="ERROR",A[A.SILENT=5]="SILENT";function Et(t,e){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];if(!(e<t.logLevel)){var i=(new Date).toISOString(),o=It[e];if(!o)throw new Error("Attempted to log a message with an invalid logType (value: "+e+")");console[o].apply(console,u(["["+i+"]  "+t.name+":"],n))}}var Ct={debug:rt.DEBUG,verbose:rt.VERBOSE,info:rt.INFO,warn:rt.WARN,error:rt.ERROR,silent:rt.SILENT},Tt=rt.INFO,It=((A={})[rt.DEBUG]="log",A[rt.VERBOSE]="log",A[rt.INFO]="info",A[rt.WARN]="warn",A[rt.ERROR]="error",A),Lt=(Object.defineProperty(Pt.prototype,"logLevel",{get:function(){return this._logLevel},set:function(t){if(!(t in rt))throw new TypeError('Invalid value "'+t+'" assigned to `logLevel`');this._logLevel=t},enumerable:!1,configurable:!0}),Pt.prototype.setLogLevel=function(t){this._logLevel="string"==typeof t?Ct[t]:t},Object.defineProperty(Pt.prototype,"logHandler",{get:function(){return this._logHandler},set:function(t){if("function"!=typeof t)throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t},enumerable:!1,configurable:!0}),Object.defineProperty(Pt.prototype,"userLogHandler",{get:function(){return this._userLogHandler},set:function(t){this._userLogHandler=t},enumerable:!1,configurable:!0}),Pt.prototype.debug=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];this._userLogHandler&&this._userLogHandler.apply(this,u([this,rt.DEBUG],t)),this._logHandler.apply(this,u([this,rt.DEBUG],t))},Pt.prototype.log=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];this._userLogHandler&&this._userLogHandler.apply(this,u([this,rt.VERBOSE],t)),this._logHandler.apply(this,u([this,rt.VERBOSE],t))},Pt.prototype.info=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];this._userLogHandler&&this._userLogHandler.apply(this,u([this,rt.INFO],t)),this._logHandler.apply(this,u([this,rt.INFO],t))},Pt.prototype.warn=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];this._userLogHandler&&this._userLogHandler.apply(this,u([this,rt.WARN],t)),this._logHandler.apply(this,u([this,rt.WARN],t))},Pt.prototype.error=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];this._userLogHandler&&this._userLogHandler.apply(this,u([this,rt.ERROR],t)),this._logHandler.apply(this,u([this,rt.ERROR],t))},Pt);function Pt(t){this.name=t,this._logLevel=Tt,this._logHandler=Et,this._userLogHandler=null}var Ot=(kt.prototype.isCachedDataFresh=function(t,e){if(!e)return this.logger.debug("Config fetch cache check. Cache unpopulated."),!1;var n=Date.now()-e,e=n<=t;return this.logger.debug("Config fetch cache check. Cache age millis: "+n+". Cache max age millis (minimumFetchIntervalMillis setting): "+t+". Is cache hit: "+e+"."),e},kt.prototype.fetch=function(i){return f(this,void 0,void 0,function(){var e,n,r;return p(this,function(t){switch(t.label){case 0:return[4,Promise.all([this.storage.getLastSuccessfulFetchTimestampMillis(),this.storage.getLastSuccessfulFetchResponse()])];case 1:return(r=t.sent(),e=r[0],(r=r[1])&&this.isCachedDataFresh(i.cacheMaxAgeMillis,e))?[2,r]:(i.eTag=r&&r.eTag,[4,this.client.fetch(i)]);case 2:return n=t.sent(),r=[this.storageCache.setLastSuccessfulFetchTimestampMillis(Date.now())],200===n.status&&r.push(this.storage.setLastSuccessfulFetchResponse(n)),[4,Promise.all(r)];case 3:return t.sent(),[2,n]}})})},kt);function kt(t,e,n,r){this.client=t,this.storage=e,this.storageCache=n,this.logger=r}var A=((A={})["registration-window"]="Undefined window object. This SDK only supports usage in a browser environment.",A["registration-project-id"]="Undefined project identifier. Check Firebase app initialization.",A["registration-api-key"]="Undefined API key. Check Firebase app initialization.",A["registration-app-id"]="Undefined app identifier. Check Firebase app initialization.",A["storage-open"]="Error thrown when opening storage. Original error: {$originalErrorMessage}.",A["storage-get"]="Error thrown when reading from storage. Original error: {$originalErrorMessage}.",A["storage-set"]="Error thrown when writing to storage. Original error: {$originalErrorMessage}.",A["storage-delete"]="Error thrown when deleting from storage. Original error: {$originalErrorMessage}.",A["fetch-client-network"]="Fetch client failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.",A["fetch-timeout"]='The config fetch request timed out.  Configure timeout using "fetchTimeoutMillis" SDK setting.',A["fetch-throttle"]='The config fetch request timed out while in an exponential backoff state. Configure timeout using "fetchTimeoutMillis" SDK setting. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.',A["fetch-client-parse"]="Fetch client could not parse response. Original error: {$originalErrorMessage}.",A["fetch-status"]="Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.",A),Mt=new l("remoteconfig","Remote Config",A);var Ft=(jt.prototype.fetch=function(h){return f(this,void 0,void 0,function(){var n,r,i,o,s,a,u,c,l,f;return p(this,function(t){switch(t.label){case 0:return[4,Promise.all([this.firebaseInstallations.getId(),this.firebaseInstallations.getToken()])];case 1:o=t.sent(),n=o[0],i=o[1],r=window.FIREBASE_REMOTE_CONFIG_URL_BASE||"https://firebaseremoteconfig.googleapis.com",o=r+"/v1/projects/"+this.projectId+"/namespaces/"+this.namespace+":fetch?key="+this.apiKey,r={"Content-Type":"application/json","Content-Encoding":"gzip","If-None-Match":h.eTag||"*"},i={sdk_version:this.sdkVersion,app_instance_id:n,app_instance_id_token:i,app_id:this.appId,language_code:(e=void 0===e?navigator:e).languages&&e.languages[0]||e.language},i={method:"POST",headers:r,body:JSON.stringify(i)},o=fetch(o,i),i=new Promise(function(t,e){h.signal.addEventListener(function(){var t=new Error("The operation was aborted.");t.name="AbortError",e(t)})}),t.label=2;case 2:return t.trys.push([2,5,,6]),[4,Promise.race([o,i])];case 3:return t.sent(),[4,o];case 4:return f=t.sent(),[3,6];case 5:throw i=t.sent(),o="fetch-client-network","AbortError"===i.name&&(o="fetch-timeout"),Mt.create(o,{originalErrorMessage:i.message});case 6:if(s=f.status,a=f.headers.get("ETag")||void 0,200!==f.status)return[3,11];l=void 0,t.label=7;case 7:return t.trys.push([7,9,,10]),[4,f.json()];case 8:return l=t.sent(),[3,10];case 9:throw f=t.sent(),Mt.create("fetch-client-parse",{originalErrorMessage:f.message});case 10:u=l.entries,c=l.state,t.label=11;case 11:if("INSTANCE_STATE_UNSPECIFIED"===c?s=500:"NO_CHANGE"===c?s=304:"NO_TEMPLATE"!==c&&"EMPTY_CONFIG"!==c||(u={}),304!==s&&200!==s)throw Mt.create("fetch-status",{httpStatus:s});return[2,{status:s,eTag:a,config:u}]}var e})})},jt);function jt(t,e,n,r,i,o){this.firebaseInstallations=t,this.sdkVersion=e,this.namespace=n,this.projectId=r,this.apiKey=i,this.appId=o}var Nt=(At.prototype.addEventListener=function(t){this.listeners.push(t)},At.prototype.abort=function(){this.listeners.forEach(function(t){return t()})},At);function At(){this.listeners=[]}var Dt=["1","true","t","yes","y","on"],Rt=(xt.prototype.asString=function(){return this._value},xt.prototype.asBoolean=function(){return"static"!==this._source&&0<=Dt.indexOf(this._value.toLowerCase())},xt.prototype.asNumber=function(){if("static"===this._source)return 0;var t=Number(this._value);return t=isNaN(t)?0:t},xt.prototype.getSource=function(){return this._source},xt);function xt(t,e){void 0===e&&(e=""),this._source=t,this._value=e}var Bt=(qt.prototype.setLogLevel=function(t){switch(t){case"debug":this._logger.logLevel=rt.DEBUG;break;case"silent":this._logger.logLevel=rt.SILENT;break;default:this._logger.logLevel=rt.ERROR}},Object.defineProperty(qt.prototype,"fetchTimeMillis",{get:function(){return this._storageCache.getLastSuccessfulFetchTimestampMillis()||-1},enumerable:!1,configurable:!0}),Object.defineProperty(qt.prototype,"lastFetchStatus",{get:function(){return this._storageCache.getLastFetchStatus()||"no-fetch-yet"},enumerable:!1,configurable:!0}),qt.prototype.activate=function(){return f(this,void 0,void 0,function(){var e,n;return p(this,function(t){switch(t.label){case 0:return[4,Promise.all([this._storage.getLastSuccessfulFetchResponse(),this._storage.getActiveConfigEtag()])];case 1:return n=t.sent(),e=n[0],n=n[1],e&&e.config&&e.eTag&&e.eTag!==n?[4,Promise.all([this._storageCache.setActiveConfig(e.config),this._storage.setActiveConfigEtag(e.eTag)])]:[2,!1];case 2:return t.sent(),[2,!0]}})})},qt.prototype.ensureInitialized=function(){var t=this;return this._initializePromise||(this._initializePromise=this._storageCache.loadFromStorage().then(function(){t._isInitializationComplete=!0})),this._initializePromise},qt.prototype.fetch=function(){return f(this,void 0,void 0,function(){var r,i,o,s=this;return p(this,function(t){switch(t.label){case 0:r=new Nt,setTimeout(function(){return f(s,void 0,void 0,function(){return p(this,function(t){return r.abort(),[2]})})},this.settings.fetchTimeoutMillis),t.label=1;case 1:return t.trys.push([1,4,,6]),[4,this._client.fetch({cacheMaxAgeMillis:this.settings.minimumFetchIntervalMillis,signal:r})];case 2:return t.sent(),[4,this._storageCache.setLastFetchStatus("success")];case 3:return t.sent(),[3,6];case 4:return i=t.sent(),n="fetch-throttle",o=(e=i)instanceof h&&-1!==e.code.indexOf(n)?"throttle":"failure",[4,this._storageCache.setLastFetchStatus(o)];case 5:throw t.sent(),i;case 6:return[2]}var e,n})})},qt.prototype.fetchAndActivate=function(){return f(this,void 0,void 0,function(){return p(this,function(t){switch(t.label){case 0:return[4,this.fetch()];case 1:return t.sent(),[2,this.activate()]}})})},qt.prototype.getAll=function(){var n=this;return function(t,e){void 0===t&&(t={});void 0===e&&(e={});return Object.keys(s(s({},t),e))}(this._storageCache.getActiveConfig(),this.defaultConfig).reduce(function(t,e){return t[e]=n.getValue(e),t},{})},qt.prototype.getBoolean=function(t){return this.getValue(t).asBoolean()},qt.prototype.getNumber=function(t){return this.getValue(t).asNumber()},qt.prototype.getString=function(t){return this.getValue(t).asString()},qt.prototype.getValue=function(t){this._isInitializationComplete||this._logger.debug('A value was requested for key "'+t+'" before SDK initialization completed. Await on ensureInitialized if the intent was to get a previously activated value.');var e=this._storageCache.getActiveConfig();return e&&void 0!==e[t]?new Rt("remote",e[t]):this.defaultConfig&&void 0!==this.defaultConfig[t]?new Rt("default",String(this.defaultConfig[t])):(this._logger.debug('Returning static value for key "'+t+'". Define a default or remote value if this is unintentional.'),new Rt("static"))},qt);function qt(t,e,n,r,i){this.app=t,this._client=e,this._storageCache=n,this._storage=r,this._logger=i,this._isInitializationComplete=!1,this.settings={fetchTimeoutMillis:6e4,minimumFetchIntervalMillis:432e5},this.defaultConfig={}}function Ht(t,e){t=t.target.error||void 0;return Mt.create(e,{originalErrorMessage:t&&t.message})}var Kt="app_namespace_store",Vt="firebase_remote_config",zt=1;var Ut=($t.prototype.getLastFetchStatus=function(){return this.get("last_fetch_status")},$t.prototype.setLastFetchStatus=function(t){return this.set("last_fetch_status",t)},$t.prototype.getLastSuccessfulFetchTimestampMillis=function(){return this.get("last_successful_fetch_timestamp_millis")},$t.prototype.setLastSuccessfulFetchTimestampMillis=function(t){return this.set("last_successful_fetch_timestamp_millis",t)},$t.prototype.getLastSuccessfulFetchResponse=function(){return this.get("last_successful_fetch_response")},$t.prototype.setLastSuccessfulFetchResponse=function(t){return this.set("last_successful_fetch_response",t)},$t.prototype.getActiveConfig=function(){return this.get("active_config")},$t.prototype.setActiveConfig=function(t){return this.set("active_config",t)},$t.prototype.getActiveConfigEtag=function(){return this.get("active_config_etag")},$t.prototype.setActiveConfigEtag=function(t){return this.set("active_config_etag",t)},$t.prototype.getThrottleMetadata=function(){return this.get("throttle_metadata")},$t.prototype.setThrottleMetadata=function(t){return this.set("throttle_metadata",t)},$t.prototype.deleteThrottleMetadata=function(){return this.delete("throttle_metadata")},$t.prototype.get=function(a){return f(this,void 0,void 0,function(){var o,s=this;return p(this,function(t){switch(t.label){case 0:return[4,this.openDbPromise];case 1:return o=t.sent(),[2,new Promise(function(e,n){var t=o.transaction([Kt],"readonly").objectStore(Kt),r=s.createCompositeKey(a);try{var i=t.get(r);i.onerror=function(t){n(Ht(t,"storage-get"))},i.onsuccess=function(t){t=t.target.result;e(t?t.value:void 0)}}catch(t){n(Mt.create("storage-get",{originalErrorMessage:t&&t.message}))}})]}})})},$t.prototype.set=function(a,u){return f(this,void 0,void 0,function(){var o,s=this;return p(this,function(t){switch(t.label){case 0:return[4,this.openDbPromise];case 1:return o=t.sent(),[2,new Promise(function(t,e){var n=o.transaction([Kt],"readwrite").objectStore(Kt),r=s.createCompositeKey(a);try{var i=n.put({compositeKey:r,value:u});i.onerror=function(t){e(Ht(t,"storage-set"))},i.onsuccess=function(){t()}}catch(t){e(Mt.create("storage-set",{originalErrorMessage:t&&t.message}))}})]}})})},$t.prototype.delete=function(a){return f(this,void 0,void 0,function(){var o,s=this;return p(this,function(t){switch(t.label){case 0:return[4,this.openDbPromise];case 1:return o=t.sent(),[2,new Promise(function(t,e){var n=o.transaction([Kt],"readwrite").objectStore(Kt),r=s.createCompositeKey(a);try{var i=n.delete(r);i.onerror=function(t){e(Ht(t,"storage-delete"))},i.onsuccess=function(){t()}}catch(t){e(Mt.create("storage-delete",{originalErrorMessage:t&&t.message}))}})]}})})},$t.prototype.createCompositeKey=function(t){return[this.appId,this.appName,this.namespace,t].join()},$t);function $t(t,e,n,r){void 0===r&&(r=new Promise(function(e,n){var t=indexedDB.open(Vt,zt);t.onerror=function(t){n(Ht(t,"storage-open"))},t.onsuccess=function(t){e(t.target.result)},t.onupgradeneeded=function(t){var e=t.target.result;0===t.oldVersion&&e.createObjectStore(Kt,{keyPath:"compositeKey"})}})),this.appId=t,this.appName=e,this.namespace=n,this.openDbPromise=r}var Gt=(Wt.prototype.getLastFetchStatus=function(){return this.lastFetchStatus},Wt.prototype.getLastSuccessfulFetchTimestampMillis=function(){return this.lastSuccessfulFetchTimestampMillis},Wt.prototype.getActiveConfig=function(){return this.activeConfig},Wt.prototype.loadFromStorage=function(){return f(this,void 0,void 0,function(){var e,n,r;return p(this,function(t){switch(t.label){case 0:return e=this.storage.getLastFetchStatus(),n=this.storage.getLastSuccessfulFetchTimestampMillis(),r=this.storage.getActiveConfig(),[4,e];case 1:return(e=t.sent())&&(this.lastFetchStatus=e),[4,n];case 2:return(n=t.sent())&&(this.lastSuccessfulFetchTimestampMillis=n),[4,r];case 3:return(r=t.sent())&&(this.activeConfig=r),[2]}})})},Wt.prototype.setLastFetchStatus=function(t){return this.lastFetchStatus=t,this.storage.setLastFetchStatus(t)},Wt.prototype.setLastSuccessfulFetchTimestampMillis=function(t){return this.lastSuccessfulFetchTimestampMillis=t,this.storage.setLastSuccessfulFetchTimestampMillis(t)},Wt.prototype.setActiveConfig=function(t){return this.activeConfig=t,this.storage.setActiveConfig(t)},Wt);function Wt(t){this.storage=t}var Jt=(Yt.prototype.fetch=function(n){return f(this,void 0,void 0,function(){var e;return p(this,function(t){switch(t.label){case 0:return[4,this.storage.getThrottleMetadata()];case 1:return e=t.sent()||{backoffCount:0,throttleEndTimeMillis:Date.now()},[2,this.attemptFetch(n,e)]}})})},Yt.prototype.attemptFetch=function(u,t){var c=t.throttleEndTimeMillis,l=t.backoffCount;return f(this,void 0,void 0,function(){var s,a;return p(this,function(t){switch(t.label){case 0:return[4,(i=u.signal,o=c,new Promise(function(t,e){var n=Math.max(o-Date.now(),0),r=setTimeout(t,n);i.addEventListener(function(){clearTimeout(r),e(Mt.create("fetch-throttle",{throttleEndTimeMillis:o}))})}))];case 1:t.sent(),t.label=2;case 2:return t.trys.push([2,5,,7]),[4,this.client.fetch(u)];case 3:return s=t.sent(),[4,this.storage.deleteThrottleMetadata()];case 4:return t.sent(),[2,s];case 5:if(!function(t){if(t instanceof h&&t.customData){t=Number(t.customData.httpStatus);return 429===t||500===t||503===t||504===t}}(a=t.sent()))throw a;return a={throttleEndTimeMillis:Date.now()+(e=l,void 0===r&&(r=2),r=(n=void 0===n?1e3:n)*Math.pow(r,e),e=Math.round(.5*r*(Math.random()-.5)*2),Math.min(144e5,r+e)),backoffCount:l+1},[4,this.storage.setThrottleMetadata(a)];case 6:return t.sent(),[2,this.attemptFetch(u,a)];case 7:return[2]}var e,n,r,i,o})})},Yt);function Yt(t,e){this.client=t,this.storage=e}var Zt,Qt="@firebase/remote-config";(Zt=e.default).INTERNAL.registerComponent(new d("remoteConfig",function(t,e){var n=e.instanceIdentifier,r=t.getProvider("app").getImmediate(),i=t.getProvider("installations").getImmediate();if("undefined"==typeof window)throw Mt.create("registration-window");var o=r.options,s=o.projectId,a=o.apiKey,u=o.appId;if(!s)throw Mt.create("registration-project-id");if(!a)throw Mt.create("registration-api-key");if(!u)throw Mt.create("registration-app-id");n=n||"firebase";e=new Ut(u,r.name,n),t=new Gt(e),o=new Lt(Qt);o.logLevel=rt.ERROR;u=new Ft(i,Zt.SDK_VERSION,n,s,a,u),u=new Jt(u,e),u=new Ot(u,e,t,o),o=new Bt(r,u,t,e,o);return o.ensureInitialized(),o},"PUBLIC").setMultipleInstances(!0)),Zt.registerVersion(Qt,"0.1.35")}.apply(this,arguments)}catch(t){throw console.error(t),new Error("Cannot instantiate firebase-remote-config.js - be sure to load firebase-app.js first.")}});
//# sourceMappingURL=firebase-remote-config.js.map
