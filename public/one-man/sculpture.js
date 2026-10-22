import * as THREE from './vendor/three.module.js';

const TAU = Math.PI * 2;
const VANE_COUNT = 9;
const clamp = THREE.MathUtils.clamp;
const ease = (a, b, t) => a + (b - a) * t;

// Each vane is a solid, bevelled scimitar, then cambered into a shallow helix.
// The broad faces and radiused edges give the studio environment room to travel.
export function buildVaneGeometry() {
  const profile = new THREE.Shape();
  profile.moveTo(.69, -.19);
  profile.bezierCurveTo(1.03, -.39, 1.75, -.37, 2.22, .12);
  profile.bezierCurveTo(2.51, .42, 2.61, .92, 2.29, 1.30);
  profile.bezierCurveTo(2.08, 1.05, 1.96, 1.00, 1.65, .97);
  profile.bezierCurveTo(1.08, .91, .75, .56, .69, -.19);
  const geometry = new THREE.ExtrudeGeometry(profile, {
    depth: .105, bevelEnabled: true, bevelThickness: .055,
    bevelSize: .055, bevelSegments: 5, curveSegments: 28, steps: 1
  });
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
    const r = Math.hypot(x, y), theta = Math.atan2(y, x);
    // A convex face, rather than an entirely flat stamped sheet.
    position.setZ(i, z + .26 * Math.sin(theta * 1.7) + .095 * (r - 1.6) ** 2);
    // Transport the original extrusion normal through the camber's Jacobian.
    // Recomputing normals on the non-indexed mesh would shade every triangle
    // independently and visibly facet the broad polished faces.
    const angularSlope = .442 * Math.cos(theta * 1.7);
    const radialSlope = .19 * (r - 1.6);
    const dfdx = angularSlope * -y / (r * r) + radialSlope * x / r;
    const dfdy = angularSlope * x / (r * r) + radialSlope * y / r;
    const nz = normal.getZ(i);
    const nx = normal.getX(i) - nz * dfdx;
    const ny = normal.getY(i) - nz * dfdy;
    const length = Math.hypot(nx, ny, nz);
    normal.setXYZ(i, nx / length, ny / length, nz / length);
  }
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function studioEnvironment(renderer) {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color('#252725');
  const room = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: '#151617', side: THREE.BackSide }));
  studio.add(room);
  const cards = [];
  const card = (w, h, x, y, z, color, energy = 1) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(energy), side: THREE.DoubleSide }));
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 0, 0);
    studio.add(mesh);
    cards.push(mesh);
  };
  card(5, 10, -5, 4, 5, '#f8f5ed', 4.0);
  card(2, 12, 6, 1, 3, '#cdd8e7', 3.2);
  card(10, 3, 0, 8, -2, '#fff8e8', 4.5);
  card(1, 8, -4, -1, -4, '#ff623e', 2.8);
  card(7, 1.6, 0, -6, 5, '#a7acb0', 1.7);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(studio, .035, .1, 100);
  pmrem.dispose();
  for (const mesh of [room, ...cards]) { mesh.geometry.dispose(); mesh.material.dispose(); }
  return target;
}

function contactTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 5, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(0,0,0,.65)');
  gradient.addColorStop(.42, 'rgba(0,0,0,.27)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

export function createSculpture(canvas, { reduced = false, onReady = () => {} } = {}) {
  if (!canvas) throw new Error('The sculpture needs a canvas.');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 45);
  camera.position.set(0, .12, 10.6);
  const environment = studioEnvironment(renderer);
  scene.environment = environment.texture;
  const assembly = new THREE.Group();
  assembly.rotation.set(.13, -.34, -.20);
  scene.add(assembly);

  const chrome = new THREE.MeshStandardMaterial({ color: '#bfc2c2', metalness: 1, roughness: .205, envMapIntensity: 1.6 });
  const darkerChrome = new THREE.MeshStandardMaterial({ color: '#565958', metalness: 1, roughness: .29, envMapIntensity: 1.45 });
  const graphite = new THREE.MeshStandardMaterial({ color: '#151818', metalness: .8, roughness: .34, envMapIntensity: .8 });
  const orange = new THREE.MeshPhysicalMaterial({ color: '#ff4e23', metalness: .38, roughness: .23, clearcoat: .8, clearcoatRoughness: .14, envMapIntensity: 1.5 });
  const orangeLight = new THREE.MeshBasicMaterial({ color: '#ff6b3a', toneMapped: false });
  const hardware = new THREE.MeshStandardMaterial({ color: '#e1dfd7', metalness: 1, roughness: .25 });

  const add = (geometry, material, parent = assembly) => {
    const mesh = new THREE.Mesh(geometry, material);
    parent.add(mesh);
    return mesh;
  };
  const core = new THREE.Group();
  assembly.add(core);
  // A lathed, hollow anodised drum, visible through the moving chrome aperture.
  const latheProfile = [
    [.65, -.40], [.82, -.40], [.88, -.34], [.88, .10],
    [.87, .15], [.83, .20], [.69, .20], [.65, .16], [.65, -.40]
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const drum = add(new THREE.LatheGeometry(latheProfile, 96), orange, core);
  drum.rotation.x = Math.PI / 2;
  drum.position.z = -.11;
  const inner = add(new THREE.TorusGeometry(.645, .027, 10, 96), hardware, core);
  inner.position.z = .065;
  const darkWell = add(new THREE.CylinderGeometry(.63, .63, .14, 80), graphite, core);
  darkWell.rotation.x = Math.PI / 2;
  darkWell.position.z = -.28;
  // A restrained central datum: three short bars, rather than another glowing orb.
  const datum = new THREE.Group();
  core.add(datum);
  const datumShape = new THREE.BoxGeometry(.035, .38, .025);
  const datumInstanced = new THREE.InstancedMesh(datumShape, orangeLight, 3);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < 3; i++) {
    matrix.makeRotationZ((i - 1) * .13);
    matrix.setPosition((i - 1) * .13, 0, -.187);
    datumInstanced.setMatrixAt(i, matrix);
  }
  datum.add(datumInstanced);

  const back = add(new THREE.TorusGeometry(1.14, .075, 14, 96), graphite);
  back.position.z = -.37;
  const rearHalo = add(new THREE.TorusGeometry(1.77, .035, 10, 112), orange);
  rearHalo.position.z = -.33;
  const vaneGeometry = buildVaneGeometry();
  const fastenerGeometry = new THREE.CylinderGeometry(.06, .06, .032, 12);
  const vaneGroups = [];
  const seamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(.94, -.18, .08), new THREE.Vector3(1.43, -.13, .10),
    new THREE.Vector3(1.93, .12, .18), new THREE.Vector3(2.17, .50, .26)
  ]);
  const seamGeometry = new THREE.TubeGeometry(seamCurve, 32, .0085, 6, false);
  for (let i = 0; i < VANE_COUNT; i++) {
    const group = new THREE.Group();
    const theta = TAU * i / VANE_COUNT;
    group.rotation.z = theta;
    group.userData.theta = theta;
    assembly.add(group);
    add(vaneGeometry, i % 3 === 2 ? darkerChrome : chrome, group);
    // A machined edge line and a single flush pin make the piece feel assembled.
    add(seamGeometry, graphite, group);
    const pin = add(fastenerGeometry, hardware, group);
    pin.rotation.x = Math.PI / 2;
    pin.position.set(.90, .04, .198);
    vaneGroups.push(group);
  }

  // Fine rear teeth are instanced to keep the silhouette engineered and light.
  const teeth = new THREE.InstancedMesh(new THREE.BoxGeometry(.035, .12, .15), orange, 36);
  for (let i = 0; i < 36; i++) {
    const theta = TAU * i / 36;
    matrix.makeRotationZ(theta - Math.PI / 2);
    matrix.setPosition(Math.cos(theta) * 1.08, Math.sin(theta) * 1.08, -.36);
    teeth.setMatrixAt(i, matrix);
  }
  assembly.add(teeth);

  const key = new THREE.DirectionalLight('#fff5e6', 3.5);
  key.position.set(-4, 6, 5);
  const rim = new THREE.DirectionalLight('#c4d4ed', 2.8);
  rim.position.set(5, 1, -2);
  const warm = new THREE.PointLight('#ff512c', 12, 8, 2);
  warm.position.set(-1.3, -1.1, .9);
  scene.add(key, rim, warm);
  const shadowMap = contactTexture();
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, opacity: .55 });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(7, 2), shadowMaterial);
  shadow.position.set(0, -2.85, -.2);
  shadow.rotation.x = -Math.PI / 2.5;
  scene.add(shadow);

  let mode = 'flow', progress = 0, pointerX = 0, pointerY = 0;
  let currentX = 0, currentY = 0, currentProgress = 0, opening = 0, explosion = 0;
  let orbit = 0, frame = 0, disposed = false, announced = false, lastTime = 0, inView = true;
  let cssWidth = 0, cssHeight = 0, mobile = false, dirty = true, fitDistance = 10.6;
  const restRotation = new THREE.Euler(.13, -.34, -.20);
  const resize = () => {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || canvas.parentElement?.clientWidth || 700));
    const height = Math.max(1, Math.round(rect.height || canvas.parentElement?.clientHeight || 700));
    mobile = window.innerWidth <= 760;
    if (cssWidth === width && cssHeight === height) return;
    cssWidth = width; cssHeight = height;
    const ratio = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5, Math.sqrt(1_400_000 / (width * height)));
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Fit the full silhouette, including the modest exploded layout, on narrow screens.
    fitDistance = Math.max(10.4, 10.0 / Math.max(.45, camera.aspect));
    camera.position.z = fitDistance;
    camera.updateProjectionMatrix();
    dirty = true;
  };
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  observer?.observe(canvas);
  window.addEventListener('resize', resize, { passive: true });
  const render = time => {
    if (disposed || !inView) return;
    frame = 0;
    const delta = Math.min(.06, lastTime ? (time - lastTime) / 1000 : 1 / 60);
    lastTime = time;
    const damping = reduced ? 1 : 1 - Math.exp(-delta * 5);
    currentX = ease(currentX, pointerX, damping);
    currentY = ease(currentY, pointerY, damping);
    currentProgress = ease(currentProgress, progress, damping);
    opening = ease(opening, mode === 'orbit' ? 1 : 0, damping);
    explosion = ease(explosion, mode === 'explode' ? 1 : 0, damping);
    orbit = ease(orbit, mode === 'orbit' ? .55 : 0, damping);
    const t = reduced ? 0 : time * .00018;
    camera.position.z = fitDistance + explosion * (camera.aspect < 1 ? 2.5 : 1.7);
    assembly.rotation.x = restRotation.x + currentY * .12 + Math.sin(t * .83) * .045 - currentProgress * .25;
    assembly.rotation.y = restRotation.y + currentX * .24 + Math.sin(t * .61) * .13 + orbit + currentProgress * .6;
    assembly.rotation.z = restRotation.z + Math.sin(t * .73) * .06 + currentProgress * .35;
    assembly.position.y = (reduced ? 0 : Math.sin(t * 1.5) * .075) + currentProgress * .15;
    assembly.scale.setScalar(1 - currentProgress * .13);
    for (let i = 0; i < vaneGroups.length; i++) {
      const group = vaneGroups[i], theta = group.userData.theta;
      const expansion = opening * .29 + explosion * .68 + currentProgress * .10;
      group.position.set(Math.cos(theta + .35) * expansion, Math.sin(theta + .35) * expansion,
        explosion * (i % 2 ? -.26 : .32) + opening * Math.sin(theta) * .15);
      group.rotation.z = theta + opening * .21 + explosion * .10;
      group.rotation.x = explosion * Math.sin(theta) * .18;
      group.rotation.y = explosion * Math.cos(theta) * .18;
    }
    core.position.z = explosion * .65;
    rearHalo.scale.setScalar(1 + explosion * .12);
    shadow.material.opacity = .49 - explosion * .10;
    if (!document.hidden && (dirty || !reduced)) {
      renderer.render(scene, camera);
      canvas.dataset.drawCalls = String(renderer.info.render.calls);
      canvas.dataset.triangles = String(renderer.info.render.triangles);
      dirty = false;
      if (!announced) {
        announced = true;
        onReady();
      }
    }
    if (!document.hidden && inView && !reduced) frame = requestAnimationFrame(render);
  };
  const kick = () => {
    dirty = true;
    if (!disposed && !document.hidden && inView && !frame) frame = requestAnimationFrame(render);
  };
  const intersection = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    inView = entries.some(entry => entry.isIntersecting);
    if (!inView) { cancelAnimationFrame(frame); frame = 0; }
    else { lastTime = 0; kick(); }
  }, { rootMargin: '120px' }) : null;
  intersection?.observe(canvas);
  const visibility = () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else { lastTime = 0; kick(); }
  };
  const contextLost = event => { event.preventDefault(); cancelAnimationFrame(frame); frame = 0; };
  const contextRestored = () => { dirty = true; kick(); };
  document.addEventListener('visibilitychange', visibility);
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('webglcontextrestored', contextRestored);
  resize();
  kick();

  return {
    setProgress(value) { progress = clamp(Number(value) || 0, 0, 1); kick(); },
    setMode(value) { mode = ['flow', 'orbit', 'explode'].includes(value) ? value : 'flow'; kick(); },
    setPointer(x, y) { if (reduced) return; pointerX = clamp(Number(x) || 0, -1, 1); pointerY = clamp(Number(y) || 0, -1, 1); kick(); },
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      intersection?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
      const geometries = new Set(), materials = new Set();
      scene.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      shadowMap.dispose();
      environment.dispose();
      renderer.dispose();
    }
  };
}



