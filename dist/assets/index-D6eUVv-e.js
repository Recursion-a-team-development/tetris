const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/game-9ekE-2nI.js","assets/game-COAjtopH.css","assets/instruction-6UBRjcxH.js","assets/instruction-DRAGf0WJ.css"])))=>i.map(i=>d[i]);
(function(){const c=document.createElement("link").relList;if(c&&c.supports&&c.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const t of n.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&s(t)}).observe(document,{childList:!0,subtree:!0});function u(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(e){if(e.ep)return;e.ep=!0;const n=u(e);fetch(e.href,n)}})();const y="modulepreload",E=function(l){return"/"+l},a={},f=function(c,u,s){let e=Promise.resolve();if(u&&u.length>0){document.getElementsByTagName("link");const t=document.querySelector("meta[property=csp-nonce]"),r=(t==null?void 0:t.nonce)||(t==null?void 0:t.getAttribute("nonce"));e=Promise.allSettled(u.map(o=>{if(o=E(o),o in a)return;a[o]=!0;const d=o.endsWith(".css"),p=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${o}"]${p}`))return;const i=document.createElement("link");if(i.rel=d?"stylesheet":y,d||(i.as="script"),i.crossOrigin="",i.href=o,r&&i.setAttribute("nonce",r),document.head.appendChild(i),d)return new Promise((g,h)=>{i.addEventListener("load",g),i.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${o}`)))})}))}function n(t){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=t,window.dispatchEvent(r),!r.defaultPrevented)throw t}return e.then(t=>{for(const r of t||[])r.status==="rejected"&&n(r.reason);return c().catch(n)})};function m(){const l=document.getElementById("app");l.innerHTML=`
  <div class="container mt-5">
      <h1 class="text-primary">TOP画面</h1>
      <button id="goToGameButton">ゲーム画面へ</button>
      <button id="goToInstructionButton">説明画面へ</button>
  </div>
  `,document.getElementById("goToGameButton").addEventListener("click",()=>{f(()=>import("./game-9ekE-2nI.js"),__vite__mapDeps([0,1])).then(s=>s.renderGamePage())}),document.getElementById("goToInstructionButton").addEventListener("click",()=>{f(()=>import("./instruction-6UBRjcxH.js"),__vite__mapDeps([2,3])).then(s=>s.renderInstructionsPage())})}const P=Object.freeze(Object.defineProperty({__proto__:null,renderTopPage:m},Symbol.toStringTag,{value:"Module"}));document.addEventListener("DOMContentLoaded",()=>{m()});export{f as _,m as r,P as t};
