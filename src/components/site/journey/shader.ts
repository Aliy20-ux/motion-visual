// The journey background: one fragment shader drawn on a single fixed canvas behind the hero and the services section.
// Hero: the cursor is a gravity well that bends the light and dust around it. Scrolling: light speed, then a fall
// through the ring. Arrival: a total eclipse over a dark sea, behind the services. Kept dependency-free (raw WebGL2).
export const VERTEX_SHADER = `#version 300 es
void main(){ vec2 p=vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2)); gl_Position=vec4(p*2.-1.,0.,1.); }`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;
uniform vec2 uWell; uniform float uIntro; uniform float uTravel; uniform float uShock; uniform vec2 uShockPos;
uniform float uJourney; uniform float uDrift;

float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; mat2 r=mat2(.8,-.6,.6,.8); for(int i=0;i<4;i++){ v+=a*noise(p); p=r*p*2.03+11.7; a*=.5; } return v; }

// ---- D · Event horizon ---------------------------------------------------------------------------------
// dust that travels with an accumulated distance (so speeding up never makes it jump) and stretches into light-speed streaks
vec3 dust2(vec2 p, float scale, float speed, float travel, float t, vec2 dir, float size, float warp){
  p *= scale; p -= dir*travel*speed;
  vec2 id=floor(p), f=fract(p)-.5;
  float h=hash(id), h2=hash(id+7.3), h3=hash(id+3.1);
  vec2 c=(vec2(h,h2)-.5)*.6;
  vec2 d=f-c; d=vec2(dot(d,dir), dot(d,vec2(-dir.y,dir.x)));
  d.x/= (1.+ 5.*speed*.35 + warp*warp*38.*speed);
  float s=smoothstep(size,0.,length(d)); s=s*s*(1.6+h3*1.4);
  float tw=.55+.45*sin(t*(1.5+h3*3.)+h*6.28);
  vec3 col=mix(vec3(.82,.85,.92), vec3(1.,.28,.22), step(.72,h3));
  return col*s*tw*step(.5,h2)*(1.+warp*1.5);
}

vec3 horizonScene(vec2 uv, vec2 src, float t, float warp){
  float asp=uRes.x/uRes.y; vec2 A=vec2(asp,1.);
  vec2 p=(uv-src)*A;
  float intro=max(uIntro,.03);
  float r=length(p)/intro, a=atan(p.y,p.x);               // the burst grows out of a single point as it ignites
  float rays=0.;
  for(int i=0;i<3;i++){ float k=float(i);
    float n=noise(vec2(a*(18.+k*14.)+k*3., r*(1.6+k)-t*(.28+k*.12)-uTravel*.2));
    n=1.-abs(2.*n-1.); rays+=pow(n,5.+k*2.)*(.55-.12*k); }
  vec3 col=vec3(.95,.07,.05)*rays*exp(-r*1.4)*(1.9+warp*1.5);
  col+=vec3(1.,.34,.26)*pow(max(0.,1.-r*3.2),2.2)*.55;
  col+=vec3(1.,.86,.8)*(.0045/(r*intro+.006))*(1.-smoothstep(0.,.9,r));
  col+=vec3(1.,.5,.4)*exp(-abs(p.y)*70./intro)*exp(-r*2.2)*.7;
  col+=vec3(1.,.9,.85)*exp(-pow((uIntro-.08)/.06,2.))*.9/(length(p)*9.+.25);   // the ignition flash
  vec2 dir=normalize(vec2(1.,-.12));
  float side=smoothstep(-.1,.6,p.x/asp+.15);
  vec2 q=uv*A; float w=warp;
  vec3 dst=dust2(q,16.,.35,uTravel,t,dir,.075,w)*.7+dust2(q+2.7,28.,.6,uTravel,t,dir,.07,w)+dust2(q+9.1,46.,1.1,uTravel,t,dir,.06,w)*1.3+dust2(q+4.4,70.,1.6,uTravel,t,dir,.055,w)*1.5;
  col+=dst*(.25+side*1.1)*(.35+1.1*smoothstep(0.,.5,length(p)))*smoothstep(.15,.9,uIntro);
  return col;
}

vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.); }   // film-style tone curve: highlights glow instead of clipping

vec3 horizon(vec2 uv, float t, vec2 well, float reScale, float warp){
  float asp=uRes.x/uRes.y; vec2 A=vec2(asp,1.);
  // the gravity well: everything behind it is bent around it (gravitational lensing)
  vec2 d=(uv-well)*A; float r=length(d);
  float RE=.085*reScale;                                     // Einstein radius: the size of the lens
  vec2 bentA=d*(1.-RE*RE/(r*r+.0006));
  vec2 suv=well+bentA/A;
  // a click sends a shockwave through space
  vec2 d2=(uv-uShockPos)*A; float r2=length(d2); float rad=uShock*1.05;
  float band=exp(-pow((r2-rad)/.05,2.))*(1.-smoothstep(.1,1.3,uShock));
  suv+=normalize(d2+1e-5)/A*band*.075;
  vec2 src=mix(vec2(.3,.47), well, .22);                  // the light leans towards the well, like B, but stays anchored
  vec3 col=horizonScene(suv, src, t, warp);
  // the shadow and the photon ring
  float RS=RE*.6;
  col*=smoothstep(RS*.9, RS*1.12, r);
  float ang=atan(d.y,d.x);
  float shimmer=.55+.45*noise(vec2(ang*5.+t*.8, t*.6));
  float ring=exp(-pow((r-RE)/.0042,2.))*shimmer;
  float halo=exp(-pow((r-RE)/.02,2.))*.35;
  vec3 ringCol=mix(vec3(.95,.97,1.), vec3(1.,.18,.12), smoothstep(-1.,1.,sin(ang+t*.4)));   // silver on one side, crimson on the other
  col+=ringCol*(ring*1.6+halo*.6);
  col+=vec3(.9,.08,.06)*exp(-r/max(RE,.001)*1.6)*.12;  // faint red glow spilling around the well
  col+=mix(vec3(1.,.35,.28),vec3(.9,.92,1.),.4)*band*.55;
  col*=mix(.6,1.,smoothstep(0.,.6,uv.x));                   // keep the left readable for the headline
  col*=1.-warp*.35*smoothstep(.3,1.,length((uv-.5)*A));   // tunnel vignette at light speed
  return aces(col*1.08);
}

// ---- E · The journey: the world on the other side of the ring ---------------------------------------
// ---- the world on the other side of the ring: a total eclipse over a dark sea --------------------------
float star(vec2 p, float scale, float t){
  p*=scale; vec2 id=floor(p), f=fract(p)-.5;
  float h=hash(id); if(h<.92) return 0.;
  vec2 c=(vec2(hash(id+1.7),hash(id+4.3))-.5)*.7;
  float b=(h-.92)*12.5;
  float tw=.55+.45*sin(t*(.8+hash(id+9.)*2.5)+h*40.);
  return smoothstep(.05+.06*b,0.,length(f-c))*b*tw;
}

vec3 worldSky(vec2 p, float t, float s, float appear){
  float up=max(p.y,0.);
  vec3 col=mix(vec3(.045,.007,.011),vec3(.004,.004,.007),smoothstep(0.,.55,up));        // deep red at the horizon to near-black overhead
  col+=vec3(.24,.014,.018)*exp(-abs(p.y)*4.5)*(.35+.65*appear);                         // layered horizon glow
  col+=vec3(.44,.05,.042)*exp(-abs(p.y)*15.)*(.25+.75*appear);
  col+=vec3(.95,.38,.26)*exp(-abs(p.y)*95.)*.3*appear;
  float neb=fbm(vec2(p.x*1.1+t*.006,up*2.2-t*.004)+3.);                                  // a faint crimson nebula for depth
  col+=vec3(.15,.02,.05)*smoothstep(.45,.85,neb)*smoothstep(.02,.35,up)*(1.-smoothstep(.5,1.,up))*.6*appear;
  col+=vec3(.92,.9,1.)*(star(p,95.,t)+star(p+3.1,46.,t)*.8)*smoothstep(.04,.3,up)*appear;  // stars, fading into the haze
  // the eclipse: the ring we fell through, now a total eclipse sitting on the horizon
  vec2 c=vec2(0.,.07), dc=p-c; float rr=length(dc), ang=atan(dc.y,dc.x);
  float R=mix(1.3,.12,smoothstep(.45,.9,s));
  float o=max(rr-R,0.);
  float aa=max(R*.012,fwidth(rr)*1.5);
  col*=mix(.015,1.,smoothstep(R-aa,R,rr));                                              // anti-aliased edge
  float stream=noise(vec2(ang*7.,t*.04))*.7+noise(vec2(ang*19.,-t*.05))*.3;            // coronal streamers
  float corona=exp(-o/(R*(.09+.6*stream*stream)))*step(R,rr);
  float inner=exp(-o/(R*.03))*smoothstep(R-aa,R,rr);
  vec3 cc=mix(vec3(.96,.94,.99),vec3(.72,.07,.06),smoothstep(0.,R*.7,o));
  col+=cc*corona*.55*(.35+.65*appear)+vec3(1.,.97,.95)*inner*.85;
  float ba=2.35+.06*sin(t*.2);                                                            // the "diamond ring": one bead of light on the rim
  vec2 q=p-(c+vec2(cos(ba),sin(ba))*R);
  float bead=exp(-dot(q,q)/(R*R*.0014+1e-6)), glow=exp(-length(q)/(R*.32+.01));
  float anam=exp(-abs(q.y)*260.)*exp(-abs(q.x)*2.2);                                     // a soft cinematic lens streak
  col+=(vec3(1.,.98,.96)*bead*2.4+vec3(1.,.5,.4)*glow*.22+vec3(.9,.35,.3)*anam*.32)*appear;
  float rays=pow(noise(vec2(ang*22.,t*.03)),3.)*exp(-rr*1.3)*step(R,rr)*exp(-up*2.);   // light fanning out through the haze
  col+=vec3(.5,.06,.05)*rays*.24*appear;
  return col;
}

vec3 seaWorld(vec2 uv, float t, float s){
  float asp=uRes.x/uRes.y; vec2 A=vec2(asp,1.);
  vec2 p=(uv-vec2(.5,.44))*A;
  p.x+=(uMouse.x-.5)*.04;                                                                // a whisper of parallax with the cursor
  float appear=smoothstep(.48,.95,s);
  vec3 col=worldSky(p,t,s,appear);
  if(p.y<0.){
    // real water: waves in perspective, the sky reflected along their surface, Fresnel-weighted like the real thing
    vec3 rd=normalize(vec3(p.x,p.y,1.));
    float z=.35/(-rd.y);
    vec2 w=(rd*z).xz;
    float dx=0., dz=0.;
    #define WAVE(ax,az,f,a,sp) { vec2 d=normalize(vec2(ax,az)); float att=a*exp(-z*f*.012); float k=cos(dot(d,w)*f+t*sp)*att*f; dx+=d.x*k; dz+=d.y*k; }
    WAVE(.3,1.,6.,.006,1.1) WAVE(-.6,1.,9.,.0045,1.4) WAVE(.9,.4,14.,.005,1.9) WAVE(-.2,1.,23.,.003,2.6) WAVE(.5,-.8,37.,.0018,3.3)
    float natt=exp(-z*.08);
    dx+=(noise(w*vec2(3.,1.)+t*.2)-.5)*.022*natt; dz+=(noise(w*vec2(3.,1.)+5.-t*.2)-.5)*.022*natt;
    vec3 n=normalize(vec3(-dx,1.,-dz));
    vec3 r=reflect(rd,n); r.y=max(r.y,.002);
    vec3 refl=worldSky(r.xy/r.z,t,s,appear);
    float F=.02+.98*pow(1.-max(dot(-rd,n),0.),5.);
    float nearDark=mix(.28,1.,smoothstep(.6,5.,z));                                      // water close to you stays dark and calm
    vec3 sea=refl*F*1.1*nearDark+vec3(.004,.002,.003);
    col=mix(col,sea,smoothstep(0.,.35,appear)*smoothstep(0.,.012,-p.y));   // sky and sea meet without a seam
  }
  col+=vec3(.42,.05,.045)*exp(-abs(p.y)*26.)*(.55+.45*fbm(vec2(p.x*2.5+t*.015,t*.01)))*.22*appear;   // mist drifting along the waterline
  col+=dust2(uv*A+vec2(0.,uDrift*.35),22.,.15,t*.2,t,normalize(vec2(.3,-1.)),.05,0.)*.18*appear;
  col*=1.-.35*smoothstep(.45,1.15,length((uv-.5)*A));
  return aces(col*1.1);
}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float t=uTime;
  // the journey: the hero's gravity well (0), falling through the ring (~0.1 to 0.6), the eclipse over the sea (~0.45 to 1)
  float s=uJourney, g=smoothstep(.42,.62,s);
  vec3 col=vec3(0.);
  if(g<1.){
    vec2 w=mix(uWell,vec2(.5,.5),smoothstep(0.,.42,s));
    float re=mix(1.,16.,pow(smoothstep(.12,.6,s),2.));
    col=horizon(uv,t,w,re,min(1.,s*2.4))*(1.-g);
  }
  if(g>0.) col+=seaWorld(uv,t,s)*g;
  col+=(hash(gl_FragCoord.xy+fract(t))-.5)*.025;                         // film grain, also kills colour banding
  o=vec4(max(col,0.),1.);
}
`;
