!function(){function n(n){var t=!1;return function(){t||(t=!0,setTimeout(function(){t=!1,n()},0))}}function t(n){return!n.some(function(n){return"undefined"==typeof n||null===n})}function e(o){function f(e,o,f){f=f||this,e=e instanceof Array?e:[e];var r=n(function(){var n=e.map(function(n){return d[n]});t(n)&&o.apply(f,n)});return r(),e.forEach(function(n){i(n,r)}),r}function i(n,t,e){e=e||this,r(n).push(t),u(n,e)}function r(n){return h[n]||(h[n]=[])}function u(n,t){n in l||(l[n]=!0,d[n]=p[n],Object.defineProperty(p,n,{get:function(){return d[n]},set:function(e){var o=d[n];d[n]=e,r(n).forEach(function(n){n.call(t,e,o)})}}))}function c(n){for(var t in h)a(t,n)}function a(n,t){h[n]=h[n].filter(function(n){return n!==t})}function s(n){for(var t in n)p[t]=n[t]}if(!(this instanceof e))return new e(o);var p=this,d={},h={},l={};s(o),p.when=f,p.cancel=c,p.on=i,p.off=a,p.set=s}e.None="__NONE__","function"==typeof define&&define.amd?define([],function(){return e}):"object"==typeof exports?module.exports=e:this.Model=e}();