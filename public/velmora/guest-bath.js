import * as THREE from './vendor/three.module.js';

export function buildGuestBath({boat,add,box,soft,cylinder,line,marble,wood,cream,bronze,chrome,warm,glass}){
  const porcelain=new THREE.MeshPhysicalMaterial({color:0xf2f0e9,roughness:.18,clearcoat:.8}),wall=new THREE.MeshStandardMaterial({color:0xe3ddce,roughness:.7});
  box(2.80,.10,4.6,marble,-8.25,-1.06,0);box(2.80,.08,4.6,wall,-8.25,1.37,0);box(.10,2.38,4.6,marble,-9.65,.15,0);
  for(const z of [-2.30,2.30]){box(2.8,2.38,.1,wall,-8.25,.15,z);line([[-9.55,1.26,z*.96],[-6.85,1.26,z*.96]],warm,.012);}
  // A wall-hung vanity and porcelain vessel, rather than the previous exposed washstand.
  soft(.58,.54,2.05,wood,-9.27,-.61,-.55,.045);soft(.70,.075,2.16,marble,-9.22,-.30,-.55,.05);
  const basin=add(new THREE.LatheGeometry([new THREE.Vector2(.10,0),new THREE.Vector2(.23,.04),new THREE.Vector2(.27,.13),new THREE.Vector2(.26,.17),new THREE.Vector2(.225,.16),new THREE.Vector2(.19,.055),new THREE.Vector2(.09,.035)],48),porcelain,-9.17,-.255,-.55);
  line([[-9.40,-.25,-.55],[-9.40,.10,-.55],[-9.16,.10,-.55]],bronze,.018);
  const mirror=new THREE.MeshPhysicalMaterial({color:0xb0c9ca,metalness:1,roughness:.04});soft(.05,1.08,1.80,bronze,-9.55,.53,-.55,.13);soft(.055,.99,1.70,mirror,-9.51,.53,-.55,.12);line([[-9.48,1.12,-1.35],[-9.48,1.12,.25]],warm,.015);
  // Enclosed rain shower with a clear door, tray, mixer and a recessed toiletries niche.
  soft(1.25,.09,1.43,porcelain,-8.68,-.95,1.48,.10);box(1.28,2.17,.022,glass,-8.68,.17,.75);box(.022,2.17,1.43,glass,-8.02,.17,1.48);line([[-8.02,1.28,.77],[-9.32,1.28,.77]],bronze,.014);line([[-8.0,.05,1.1],[-8.0,.38,1.1]],bronze,.012);
  line([[-9.50,-.25,1.45],[-9.50,1.06,1.45],[-8.85,1.06,1.45]],bronze,.019);cylinder(.19,.035,bronze,-8.85,1.04,1.45);cylinder(.055,.04,chrome,-9.44,.15,1.45);
  soft(.035,.32,.65,wood,-9.56,.37,1.50,.035);for(const z of [1.32,1.58])cylinder(.035,.14,cream,-9.51,.28,z);
  // Proper marine toilet: bowl, closed seat, pedestal and wall-mounted flush plate.
  soft(.53,.28,.43,porcelain,-7.55,-.70,-1.72,.14);soft(.62,.065,.49,porcelain,-7.52,-.52,-1.72,.18);soft(.25,.43,.30,porcelain,-7.67,-.82,-1.72,.06);box(.19,.16,.035,bronze,-7.54,-.12,-2.23);line([[-7.13,-.20,-2.10],[-6.98,-.20,-2.10]],chrome,.015);
  for(const y of [.15,.48])line([[-7.65,y,2.18],[-7.10,y,2.18]],bronze,.018);soft(.42,.62,.055,cream,-7.37,.04,2.14,.025);
  const lamp=new THREE.PointLight(0xffe2bd,4,4,2);lamp.position.set(-8.1,.95,0);boat.add(lamp);
}
