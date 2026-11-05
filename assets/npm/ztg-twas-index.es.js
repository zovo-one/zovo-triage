var n=function(n,r){return r>=n?Math.round(r/n):0};function twas(r,a){a||(a=Date.now());var e=(a-r)/1e3,t=n(60,e),o=n(60,t),u=n(24,o),d=n(7,u),f=n(30,u),h=n(12,f),i=h,c="year";if(e<=1)return "just now";h>0?(i=h,c="year"):f>0?(i=f,c="month"):d>0?(i=d,c="week"):u>0?(i=u,c="day"):o>0?(i=o,c="hour"):t>0?(i=t,c="minute"):e>0&&(i=e,c="second");var s=Math.round(i);return (1===s?i===o?"an":"a":s)+" "+c+(s>1?"s":"")+" ago"}

export { twas as default };
