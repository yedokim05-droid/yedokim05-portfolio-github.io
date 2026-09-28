import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { CSS3DRenderer, CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
import {
  hero,
  educationAwards,
  certifications,
  skills,
  experienceByYear,
  featuredProjects,
  aiPersonalProjects,
  projectProgramContributions,
  contact,
} from "./content.js?v=13";

// ---------------------------------------------------------------------------
// Layout: a compact cluster of staggered pedestal blocks (product-shot
// style, per reference) — one taller hub block plus five smaller category
// blocks at varying heights, all sitting close together.
// ---------------------------------------------------------------------------
const mapClickable = [];

// VIDEO shares one area off to the side (top-down "page"), stacked along
// +Z from x=PAGE_AREA_X. DESIGN, AI and MOTION each get their own dedicated
// area instead, positioned straight out in the same direction as their map
// icon (DESIGN 12시, AI 5시, MOTION 9시), so the camera flight from icon to
// page is a single straight continuation instead of crossing over to an
// unrelated shared corridor. Every area is a fixed point plus one scroll
// axis ("x" or "z", whichever matches that icon's dominant direction) and
// a sign (`dir`) for which way along that axis scrolling goes.
const PAGE_AREA_X = 95;
const PANEL_SPACING = 7.5;
const PANEL_WIDTH = 6.2;
const PANEL_HEIGHT = 3.6;
const PROJECT_MEDIA_Y = 1.01;
const PROJECT_ROW_GAP = 0.8;
const DEFAULT_VIDEO_ASPECT_RATIO = 1920 / 1080;
const PORTRAIT_PREVIEW_SCALE = 1.3;
const WIDE_PREVIEW_SCALE = 1.3;
// Every page's card list scrolls along Z (top-to-bottom, same as VIDEO) —
// only the fixed X differs, placed out in that icon's own clock direction
// so the entry flight is a straight continuation from the icon.
const CATEGORY_AREA = {
  DESIGN: { x: 0, z: -95, axis: "z", dir: 1 }, // 12시: X matches the icon (0)
  AI: { x: 3.5, z: 95, axis: "z", dir: 1 }, // 5시: X matches the icon (3.5)
  MOTION: { x: -95, z: -1.4, axis: "z", dir: 1 }, // 9시: X pushed out west
};
function areaFor(category) {
  return CATEGORY_AREA[category] || { x: PAGE_AREA_X, z: 0, axis: "z", dir: 1 };
}

// Per-category icon artwork (png/*.png), textured flat onto the grid.
// `accent` still drives the category page's UI color (badges, panel edges).
const CATEGORY_META = {
  VIDEO: { accent: "#3a6df0", icon: "./png/video.png" },
  MOTION: { accent: "#a06bf7", icon: "./png/motion.png" },
  DESIGN: { accent: "#b155f7", icon: "./png/design.png" },
  AI: { accent: "#5b8dff", icon: "./png/ai.png" },
};

// Every island is the icon image itself, textured flat onto the grid — no
// background tile, no 3D box. Just the artwork, lying on the floor.
// Positioned around the hub like hours on a clock face (12=away from camera,
// 3=right, 6=toward camera, 9=left): DESIGN 12시, VIDEO 2시, AI 5시, MOTION 9시15분.
const ISLANDS = [
  { category: "DESIGN", x: 0, z: -7.5, size: 4.9 },
  { category: "VIDEO", x: 6.1, z: -4.0, size: 4.6 },
  { category: "AI", x: 3.5, z: 5.6, size: 4.3 },
  { category: "MOTION", x: -6.9, z: -1.4, size: 5.2 },
];

// ---------------------------------------------------------------------------
// Renderer / scene / camera
// ---------------------------------------------------------------------------
const container = document.getElementById("scene-container");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeef1f5);
scene.fog = new THREE.Fog(0xeef1f5, 45, 95);

const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);
camera.position.set(-4, 20, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0";
labelRenderer.domElement.style.left = "0";
document.getElementById("label-layer").appendChild(labelRenderer.domElement);

// True 3D DOM layer (for in-scene video previews) — unlike CSS2DRenderer,
// this respects perspective, so a video hosted here matches the panel
// mesh's exact world-space size and grows bigger in place as the camera
// approaches, instead of staying a fixed pixel size regardless of zoom.
const css3dRenderer = new CSS3DRenderer();
css3dRenderer.setSize(window.innerWidth, window.innerHeight);
css3dRenderer.domElement.style.position = "absolute";
css3dRenderer.domElement.style.top = "0";
css3dRenderer.domElement.style.left = "0";
document.getElementById("css3d-layer").appendChild(css3dRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.4, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minPolarAngle = Math.PI * 0.22;
controls.minDistance = 8;
controls.maxDistance = 36;
// Apply map zoom through the animation loop so wheel input changes the
// camera distance continuously instead of jumping by OrbitControls' default
// fixed dolly step.
controls.enableZoom = false;
controls.update();

let targetMapDistance = camera.position.distanceTo(controls.target);

// ---------------------------------------------------------------------------
// Lighting
// ---------------------------------------------------------------------------
scene.add(new THREE.AmbientLight(0xffffff, 0.75));
scene.add(new THREE.HemisphereLight(0xffffff, 0xc7d0e0, 0.5));

const sun = new THREE.DirectionalLight(0xffffff, 1.1);
sun.position.set(16, 26, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -30;
sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30;
sun.shadow.camera.bottom = -30;
sun.shadow.camera.far = 80;
sun.shadow.bias = -0.0015;
scene.add(sun);

// ---------------------------------------------------------------------------
// Ground
// ---------------------------------------------------------------------------
const GROUND_SIZE = 340;
// Source grid.png is 16000x8000 (2:1). Repeat.y must be 2x repeat.x so each
// tile stays square in world space and the dots don't stretch into ellipses.
// The repeat count must also be a whole EVEN number, or the ground's exact
// center won't land on a tile boundary and the pattern reads as off-center.
const GRID_REPEAT_X = 8;
const textureLoader = new THREE.TextureLoader();
const gridTexture = textureLoader.load("./png/bg.png");
gridTexture.wrapS = THREE.RepeatWrapping;
gridTexture.wrapT = THREE.RepeatWrapping;
gridTexture.repeat.set(GRID_REPEAT_X, GRID_REPEAT_X * 2);
gridTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
gridTexture.colorSpace = THREE.SRGBColorSpace;

// Unlit so the grid renders at the texture's native brightness instead of
// being darkened by scene lighting (that's what was reading as "dull").
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
  new THREE.MeshBasicMaterial({ map: gridTexture })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// A separate shadow-only plane (transparent except where shadows fall) keeps
// the soft ground shadows without darkening the whole grid.
const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
  new THREE.ShadowMaterial({ opacity: 0.16 })
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = 0.010;
shadowPlane.position.y = 0.015;
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// A soft, centered contact-shadow blob (radial gradient) instead of a real
// directional shadow — always symmetric under the object, no light-angle
// offset, just a gentle "this is floating" cue.
function createSoftShadowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(20,24,33,0.45)");
  gradient.addColorStop(0.55, "rgba(20,24,33,0.22)");
  gradient.addColorStop(1, "rgba(20,24,33,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}
const softShadowTexture = createSoftShadowTexture();



function addEdges(mesh, color = 0x1c1e22, opacity = 0.15) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
  mesh.add(edges);
}

// The icon image itself, textured flat onto a plane lying on the grid — no
// background tile, no billboard. It reads like it's painted on the floor.
function createIconTile({ x, z, size, icon, kind, category }) {
  const texture = textureLoader.load(icon);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const geo = new THREE.PlaneGeometry(size, size);
  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.02 });
  const tile = new THREE.Mesh(geo, mat);
  tile.rotation.x = -Math.PI / 2;
  tile.position.set(x, 0.024, z);
  tile.renderOrder = 2;
  tile.position.set(x, 0.02, z);
  tile.userData = { kind, category };
  scene.add(tile);
  mapClickable.push(tile);

  return tile;
}

// A looping video, textured flat onto a plane lying on the grid — same
// technique as createIconTile, just with a <video> as the texture source.
// `src` points to a video where the top half is color and the bottom half
// is the alpha channel baked in as grayscale (ffmpeg vstack of the original
// alpha-channel ProRes source) — the standard trick for transparent video
// in WebGL, since <video> itself always plays opaque.
function createVideoTile({ x, z, size, src }) {
  const video = document.createElement("video");
  video.src = src;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.play().catch(() => {});
  video.addEventListener("canplay", () => video.play().catch(() => {}));

  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;

  const geo = new THREE.PlaneGeometry(size, size);
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: texture } },
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D map;
      void main() {
        vec3 color = texture2D(map, vec2(vUv.x, vUv.y * 0.5 + 0.5)).rgb;
        float alpha = texture2D(map, vec2(vUv.x, vUv.y * 0.5)).r;
        if (alpha < 0.04) discard;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
  const tile = new THREE.Mesh(geo, mat);
  tile.rotation.x = -Math.PI / 2;
  tile.position.set(x, 0.02, z);
  scene.add(tile);

  video.addEventListener("loadedmetadata", () => {
    if (!video.videoWidth || !video.videoHeight) return; // codec not decodable — keep square fallback
    const aspect = video.videoWidth / (video.videoHeight / 2); // stacked: real height is halved
    if (aspect >= 1) tile.scale.set(1, 1 / aspect, 1);
    else tile.scale.set(aspect, 1, 1);
  });

  return tile;
}

function makeLabel(html, className, position, style) {
  const el = document.createElement("div");
  el.className = className;
  el.innerHTML = html;
  if (style) {
    Object.entries(style).forEach(([key, value]) => el.style.setProperty(key, value));
  }
  const obj = new CSS2DObject(el);
  obj.position.copy(position);
  scene.add(obj);
  return obj;
}

// ---------------------------------------------------------------------------
// Build: hub (profile) — the biggest flat tile in the cluster
// ---------------------------------------------------------------------------
const HUB_X = 0;
const HUB_Z = -0.5;
const HUB_SIZE = 5.6;

createIconTile({
  x: HUB_X,
  z: HUB_Z,
  size: HUB_SIZE,
  icon: "./png/portfolio.png",
  kind: "hub",
});

const hubLabel = makeLabel(
  `<span class="tag">I'M YEDO!</span><span class="sub">Click the icon</span>`,
  "building-label hub",
  new THREE.Vector3(HUB_X, 0.05, HUB_Z + HUB_SIZE / 2 + 0.35)
);
hubLabel.element.addEventListener("click", openDashboard);

// ---------------------------------------------------------------------------
// Build: category islands — flat icon tiles clustered beside the hub
// ---------------------------------------------------------------------------
ISLANDS.forEach(({ category, x, z, size }) => {
  const meta = CATEGORY_META[category];
  createIconTile({ x, z, size, icon: meta.icon, kind: "category", category });

  const islandLabel = makeLabel(
    `<span class="tag">${category}</span>`,
    "building-label",
    new THREE.Vector3(x, 0.65, z)
  );
  islandLabel.element.addEventListener("click", () => enterCategoryPage(category));
});

// 8시 방향: hello 영상을 아이콘과 같은 방식(그리드에 눕힌 평면)으로 삽입 (그림자 없음)
// 8시 방향: hello 영상을 아이콘과 같은 방식(그리드에 눕힌 평면)으로 삽입
createVideoTile({ x: -2.5, z: 3.8, size: 6.5, src: "./video/hello_alpha.mp4" });

// ---------------------------------------------------------------------------
// View state: "map" (hub + islands, orbit controls) or "category"
// (top-down scrollable gallery of that category's project panels).
// ---------------------------------------------------------------------------
let viewMode = "map";
let activeCategory = null;
let panelGroup = new THREE.Group();
scene.add(panelGroup);
let panelClickable = [];
let panelLabels = [];
let scrollZ = 0;
let targetScrollZ = 0;
let pagePanX = 0;
let targetPagePanX = 0;
let rightDragStartX = null;
let rightDragStartY = null;
let isRightDragging = false;
let maxScrollZ = 0;
let zoomedIn = false;
let returnCameraPos = null; // map camera pose right before entering a category, restored on exit
let returnCameraTarget = null;
let zoomedPanel = null;

const MAP_CAMERA_POS = camera.position.clone();
const MAP_TARGET = controls.target.clone();

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

let isTweening = false;
let cameraTweenId = 0;

function tweenCamera(toPos, toTarget, duration, onDone, viaPoints, onProgress) {
  const tweenId = ++cameraTweenId;
  const fromPos = camera.position.clone();
  const fromQuat = camera.quaternion.clone();

  // Rotation is slerped as its own quaternion (not re-derived from a lerped
  // look-at target each frame) so it turns smoothly and in lockstep with
  // the position move, instead of swinging through unrelated angles. This
  // is ALWAYS a single direct slerp from start to end, even when the
  // position path bends through waypoints (below) — splitting rotation
  // across separate legs is what caused the fast whip/spin.
  const endCam = camera.clone();
  endCam.position.copy(toPos);
  endCam.up.copy(camera.up);
  endCam.lookAt(toTarget);
  const toQuat = endCam.quaternion.clone();

  // Straight segments through fromPos -> ...viaPoints -> toPos.
  const waypoints = viaPoints && viaPoints.length ? [fromPos, ...viaPoints, toPos] : [fromPos, toPos];
  const segments = waypoints.length - 1;

  const start = performance.now();
  controls.enabled = false;
  isTweening = true;

  function step(now) {
    if (tweenId !== cameraTweenId) return;
    // Clamp to >= 0 too: the first rAF callback's timestamp can land a
    // hair before `start` (performance.now() taken synchronously just
    // before requestAnimationFrame), which without this produced a
    // negative t/e and an out-of-range waypoint index below.
    const t = Math.min(1, Math.max(0, (now - start) / duration));
    const e = easeInOutCubic(t);
    const segLen = 1 / segments;
    const segIndex = Math.max(0, Math.min(segments - 1, Math.floor(e / segLen)));
    const segT = (e - segIndex * segLen) / segLen;
    camera.position.lerpVectors(waypoints[segIndex], waypoints[segIndex + 1], segT);
    camera.quaternion.slerpQuaternions(fromQuat, toQuat, e);
    if (onProgress) onProgress(t);
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      controls.target.copy(toTarget);
      isTweening = false;
      if (onDone) onDone();
    }
  }
  requestAnimationFrame(step);
}

// Every category scrolls along its own area's axis (see CATEGORY_AREA
// above). The camera always looks straight down (no oblique offset), so
// panels render as true flat rectangles with no skew.
function pageCameraPose(category, scroll, panX = 0) {
  const area = areaFor(category);
  const x = (area.axis === "x" ? area.x + area.dir * scroll : area.x) + panX;
  const z = area.axis === "z" ? area.z + area.dir * scroll : area.z;
  return {
    pos: new THREE.Vector3(x, 21, z),
    target: new THREE.Vector3(x, 0, z),
  };
}

function clearPanels() {
  panelClickable = [];
  panelLabels.forEach((label) => scene.remove(label));
  panelLabels = [];
  panelZoom2DLayer?.querySelectorAll(".panel-expanded-preview").forEach((iframe) => iframe.remove());
  while (panelGroup.children.length) {
    const child = panelGroup.children.pop();
    child.traverse((node) => {
      node.geometry?.dispose();
      node.material?.dispose();
    });
    panelGroup.remove(child);
  }
}

function buildCategoryPanels(category) {
  clearPanels();
  const accent = (CATEGORY_META[category] || {}).accent || "#4f7dff";

  const relatedProjects =
    category === "AI"
      ? []
      : featuredProjects.items.filter((p) => p.categories.includes(category));
  const entries = [];
  let scrollIndex = 0;
  relatedProjects.forEach((project) => {
    project.links.forEach((link, linkIndex) => {
      entries.push({
        index: project.number,
        title: project.title,
        subtitle: link.label,
        description: project.description,
        layout: project.layout,
        layoutIndex: project.layout === "row" ? project.links.indexOf(link) : 0,
        scrollIndex: scrollIndex + (project.layout === "row" ? 0 : linkIndex),
        youtubeVideoId: link.youtubeVideoId,
        programContributions: projectProgramContributions[project.number],
        aspectRatio: (link.youtubeVideoId === "V3kWnBgk19Q" || link.label === "윤슬")
          ? (2560 / 676)
          : (link.youtubeVideoId ? link.aspectRatio || DEFAULT_VIDEO_ASPECT_RATIO : undefined),
      });
    });
    scrollIndex += project.layout === "row" ? 1 : project.links.length;
  });
  if (category === "AI") {
    aiPersonalProjects.items.forEach((item, i) => {
      entries.push({
        index: `AI-${i + 1}`,
        title: item.label,
        subtitle: aiPersonalProjects.title,
        description: aiPersonalProjects.title,
        youtubeVideoId: item.youtubeVideoId,
        programContributions: projectProgramContributions[`AI-${i + 1}`],
        aspectRatio: item.youtubeVideoId
          ? item.aspectRatio || DEFAULT_VIDEO_ASPECT_RATIO
          : undefined,
        scrollIndex: entries.length,
      });
    });
  }

  const area = areaFor(category);

  // 화면 좌측 기준(왼쪽 정렬) 시작점 산출 — 원래의 좌측 여백 기준 레이아웃 복원
  // 모든 프로젝트가 일관된 기준 폭과 스케일(16:9 가로 레이아웃 기준)을 공유하도록 설정합니다.
  // 개별 영상이 세로(쇼츠)이거나 광폭이어도 좌측 정보(라벨) 컬럼 정렬선과 우측 비디오 슬롯의 위치가 흐트러지지 않아
  // 텍스트 깨짐이나 패널 겹침 현상이 완전히 방지됩니다.
  const isCompactProjectRow = window.innerWidth <= 760;
  const rowColumnCount = isCompactProjectRow ? 1 : 2;
  const stdPreviewWidth = 620;
  const stdRowBaseWidth = isCompactProjectRow ? 320 : stdPreviewWidth;
  const stdRowGap = rowColumnCount === 1 ? 0 : 24;
  const rowWidth = stdRowBaseWidth * rowColumnCount + stdRowGap;
  const rowScale = PANEL_WIDTH / stdRowBaseWidth;
  const rowWorldWidth = PANEL_WIDTH * rowColumnCount + stdRowGap * rowScale; // 12.64
  const stdLabelHeight = isCompactProjectRow ? 700 : (stdPreviewWidth / DEFAULT_VIDEO_ASPECT_RATIO);

  const stdVideoSlotWidth = PANEL_WIDTH; // 6.2
  const totalRowWidth = rowWorldWidth + PROJECT_ROW_GAP + stdVideoSlotWidth; // 19.64

  const cameraDist = 21;
  const vFovRad = (camera.fov * Math.PI) / 180;
  const halfVisibleHeight = cameraDist * Math.tan(vFovRad / 2);
  const aspect = window.innerWidth / window.innerHeight;
  const halfVisibleWidth = halfVisibleHeight * aspect;

  // 화면 좌측에서 일정한 여백을 두고 왼쪽 정렬로 시작
  const leftMargin = Math.max(1.8, halfVisibleWidth * 0.12);
  let rowStartX = area.x - halfVisibleWidth + leftMargin;
  const maxRowStartX = area.x + halfVisibleWidth - totalRowWidth - 1.2;
  if (rowStartX > maxRowStartX && maxRowStartX < area.x) {
    rowStartX = maxRowStartX;
  }

  // 모든 프로젝트가 공유하는 왼쪽 정렬 기준 라벨 중심 및 우측 비디오 슬롯 시작점
  const labelX = rowStartX + rowWorldWidth / 2;
  const videoStartX = rowStartX + rowWorldWidth + PROJECT_ROW_GAP;
  const stdVideoHeight = PANEL_WIDTH / DEFAULT_VIDEO_ASPECT_RATIO;
  const videoSlotCenterX = videoStartX + stdVideoSlotWidth / 2;
  const stdVideoSlotCenterX = videoSlotCenterX;

  entries.forEach((entry, i) => {
    const isPortrait = entry.aspectRatio && entry.aspectRatio < 1;
    const isWide = entry.aspectRatio && entry.aspectRatio > 2;

    let panelWidth, panelHeight, previewWidth, previewHeight;
    if (isWide) {
      panelHeight = stdVideoHeight;
      panelWidth = panelHeight * entry.aspectRatio;
      if (entry.youtubeVideoId === "V3kWnBgk19Q" || entry.subtitle === "윤슬") {
        previewWidth = 1280;
        previewHeight = 338;
      } else {
        previewHeight = Math.round(stdPreviewWidth / DEFAULT_VIDEO_ASPECT_RATIO);
        previewWidth = Math.round(previewHeight * entry.aspectRatio);
      }
    } else if (isPortrait) {
      panelWidth = PANEL_WIDTH / 1.5;
      panelHeight = panelWidth / entry.aspectRatio;
      previewWidth = Math.round(stdPreviewWidth / 1.5);
      previewHeight = Math.round(previewWidth / entry.aspectRatio);
    } else {
      panelWidth = PANEL_WIDTH;
      panelHeight = entry.aspectRatio ? (panelWidth / entry.aspectRatio) : PANEL_HEIGHT;
      previewWidth = 620;
      previewHeight = entry.aspectRatio ? (previewWidth / entry.aspectRatio) : 360;
    }

    const isRow = entry.layout === "row";
    const offset = area.dir * entry.scrollIndex * PANEL_SPACING;
    const rowOffset = isRow ? entry.layoutIndex * PANEL_SPACING : 0;
    const baseSlotX = videoStartX + panelWidth / 2;
    const panelX = isRow ? baseSlotX + rowOffset : baseSlotX;
    const panelZ = area.axis === "z" ? area.z + offset : area.z;

    // 영상 뒤/주변으로 삐져나오던 기존 회색 프레임을 완전히 없애고 클릭 감지용 투명 면으로만 유지
    // Floating card: a soft, centered contact-shadow blob underneath (not a
    // real directional shadow, so it never looks pushed to one side).
    const shadowBlob = new THREE.Mesh(
      new THREE.PlaneGeometry(6.9 * panelWidth / PANEL_WIDTH, 6.9 * panelHeight / PANEL_WIDTH),
      new THREE.MeshBasicMaterial({ map: softShadowTexture, transparent: true, depthWrite: false })
    );
    shadowBlob.rotation.x = -Math.PI / 2;
    shadowBlob.position.set(panelX, 0.03, panelZ);
    panelGroup.add(shadowBlob);

    // A single flat plane — no stacked second layer, so there's no
    // perceived thickness/step at any viewing angle.
    const panelGeo = new THREE.PlaneGeometry(panelWidth, panelHeight);
    const panelMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.rotation.x = -Math.PI / 2;
    panel.position.set(panelX, 1.0, panelZ);
    panel.receiveShadow = true;
    panel.userData = { kind: "video-panel", entry };
    panelGroup.add(panel);
    panelClickable.push(panel);

    // Live preview, already playing right on the panel before it's ever
    // clicked — a CSS3DObject, so it's scaled/positioned/rotated to match
    // the panel mesh exactly (true 3D, not a fixed-pixel-size overlay) and
    // grows bigger in place, matching the mesh, as the camera zooms in.
    if (entry.youtubeVideoId) {
      const embedUrl = youtubeEmbedUrl(entry.youtubeVideoId, false);
      const previewEl = document.createElement("iframe");
      previewEl.style.width = `${previewWidth}px`;
      previewEl.style.height = `${previewHeight}px`;
      if (embedUrl) {
        previewEl.src = embedUrl;
        previewEl.allow = "autoplay";
        previewEl.tabIndex = -1;
        previewEl.setAttribute("aria-hidden", "true");
        previewEl.frameBorder = "0";
        previewEl.style.opacity = "0";
        previewEl.style.transition = "opacity 0.35s ease";
        previewEl.addEventListener("load", () => {
          setTimeout(() => {
            if (!zoomedIn || zoomedPanel !== panel) {
              previewEl.style.opacity = "1";
            }
          }, 350);
        });
      }
      previewEl.className = "panel-preview";
      previewEl.style.pointerEvents = "none";
      const previewObj = new CSS3DObject(previewEl);
      previewObj.position.set(panelX, PROJECT_MEDIA_Y, panelZ);
      previewObj.rotation.x = -Math.PI / 2;
      const previewScale = panelWidth / previewWidth;
      previewObj.scale.set(previewScale, previewScale, 1);
      scene.add(previewObj);
      panelLabels.push(previewObj);
      panel.userData.previewObj = previewObj;
      const previewHitEl = document.createElement("div");
      previewHitEl.className = "panel-preview-hit";
      previewHitEl.style.width = `${previewWidth}px`;
      previewHitEl.style.height = `${previewHeight}px`;
      previewHitEl.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!zoomedIn) zoomIntoPanel(panel);
      });
      const previewHitObj = new CSS3DObject(previewHitEl);
      previewHitObj.position.set(panelX, PROJECT_MEDIA_Y + 0.01, panelZ);
      previewHitObj.rotation.x = -Math.PI / 2;
      previewHitObj.scale.set(previewScale, previewScale, 1);
      scene.add(previewHitObj);
      panelLabels.push(previewHitObj);
      panel.userData.previewHitObj = previewHitObj;
      panel.userData.previewSize = {
        width: panelWidth,
        height: previewHeight * previewScale,
      };

      if (embedUrl) {
        const expandedPreviewEl = document.createElement("iframe");
        expandedPreviewEl.allow = "autoplay; fullscreen";
        expandedPreviewEl.allowFullscreen = true;
        expandedPreviewEl.frameBorder = "0";
        expandedPreviewEl.className = "panel-expanded-preview";
        expandedPreviewEl.dataset.embedUrl = youtubeEmbedUrl(entry.youtubeVideoId, true);
        expandedPreviewEl.hidden = true;
        panelZoom2DLayer.appendChild(expandedPreviewEl);
        panel.userData.expandedPreviewEl = expandedPreviewEl;
        previewEl.dataset.previewUrl = embedUrl;
        panel.userData.previewEl = previewEl;
      }
    }

    if (!entry.youtubeVideoId) {
      const badge = makeLabel(
        "작업물 준비중 입니다",
        "panel-badge",
        new THREE.Vector3(panelX, 0.32, panelZ),
        { "--accent": accent }
      );
      panelLabels.push(badge);
    }

    if (isRow && entry.layoutIndex > 0) return;

    const contributions = entry.programContributions || [];
    const contributionTotal = contributions.reduce((total, item) => total + item.percentage, 0);
    const contributionRows = contributions
      .map(
        (item) => `
          <div class="contribution-row">
            <span>${item.program}</span>
            <i><b style="width:${item.percentage}%"></b></i>
            <strong>${item.percentage}%</strong>
          </div>`
      )
      .join("");
    const projectRowEl = document.createElement("div");
    projectRowEl.className = "project-row-label";
    if (category === "DESIGN") {
      projectRowEl.innerHTML = `<div class="project-row-info" style="grid-column: 1 / -1; display:flex; flex-direction:column; justify-content:center; gap: 8px;">
          <div class="project-row-heading"><span class="pl-index">07</span><span class="project-year">COMING SOON</span></div>
          <div class="pl-title" style="font-size: 26px; line-height: 1.4;">디자인 페이지는 추후 업데이트 될 예정입니다.</div>
          <div class="pl-desc">포트폴리오 디자인 작업물은 준비가 완료되는 대로 순차적으로 업로드될 예정입니다.</div>
          <div class="project-meta">GRAPHIC & BRAND DESIGN / COMING SOON</div>
        </div>`;
    } else {
      projectRowEl.innerHTML = `<div class="project-row-info">
          <div class="project-row-heading"><span class="pl-index">${entry.index}</span><span class="project-year">2025 — 2026</span></div>
          <div class="pl-title">${entry.title}</div>
          <div class="pl-desc">${entry.description}</div>
          <div class="project-meta">PRODUCTION / ${entry.subtitle}</div>
        </div>
        <div class="contribution-graph">
          <div class="contribution-title">PROGRAM CONTRIBUTION <strong>${contributionTotal}%</strong></div>
          <div class="contribution-list">${contributionRows}</div>
          <div class="contribution-total">TOTAL <strong>${contributionTotal}%</strong></div>
        </div>`;
    }
    projectRowEl.style.setProperty("--accent", accent);
    projectRowEl.style.width = `${rowWidth}px`;
    projectRowEl.style.height = `${stdLabelHeight}px`;
    projectRowEl.style.minHeight = `${stdLabelHeight}px`;
    projectRowEl.style.gridTemplateColumns = rowColumnCount === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))";
    const projectRowObj = new CSS3DObject(projectRowEl);
    projectRowObj.position.set(labelX, PROJECT_MEDIA_Y, panelZ);
    projectRowObj.rotation.x = -Math.PI / 2;
    projectRowObj.scale.set(rowScale, rowScale, 1);
    scene.add(projectRowObj);
    panelLabels.push(projectRowObj);
  });

  const maxScrollIndex = entries.reduce(
    (max, entry) => Math.max(max, entry.scrollIndex),
    0
  );
  maxScrollZ = Math.max(0, maxScrollIndex * PANEL_SPACING);
  scrollZ = 0;
  targetScrollZ = 0;
  pagePanX = 0;
  targetPagePanX = 0;
}

function enterCategoryPage(category) {
  returnCameraPos = camera.position.clone();
  returnCameraTarget = controls.target.clone();
  activeCategory = category;
  buildCategoryPanels(category);
  viewMode = "category";
  document.getElementById("back-to-map-btn").classList.remove("hidden");
  document.getElementById("welcome-corner").textContent = `${category} PAGE`;
  const pose = pageCameraPose(category, 0, 0);
  const finish = () => {
    // Snap to the exact steady-state pose so the frame right after the
    // tween ends matches what the scroll loop computes next — no drift/cut.
    camera.position.copy(pose.pos);
    controls.target.copy(pose.target);
    camera.lookAt(pose.target);
  };
  tweenCamera(pose.pos, pose.target, 950, finish);
}

function exitCategoryPage() {
  if (zoomedIn) cleanupZoomedPanel();
  pagePanX = 0;
  targetPagePanX = 0;
  viewMode = "map";
  document.getElementById("back-to-map-btn").classList.add("hidden");
  document.getElementById("zoom-close-btn").classList.add("hidden");
  document.getElementById("welcome-corner").classList.remove("faded");
  document.getElementById("welcome-corner").textContent = "WELCOME TO MY PORTFOLIO!";
  const toPos = returnCameraPos || MAP_CAMERA_POS;
  const toTarget = returnCameraTarget || MAP_TARGET;
  const onExitDone = () => {
    controls.enabled = true;
    clearPanels();
  };
  tweenCamera(toPos, toTarget, 900, onExitDone);
}

document.getElementById("back-to-map-btn").addEventListener("click", exitCategoryPage);

// Clicking a video panel moves the camera close to it — the video itself is
// already playing in place (see buildCategoryPanels' CSS3DObject preview)
// and, being true 3D, grows bigger in place as the camera approaches,
// exactly like the panel mesh would. During the zoom tween, the preview is
// exchanged for a second iframe in a plain 2D layer: Chromium cannot
// hit-test real clicks into an iframe under a CSS3D perspective/matrix3d
// transform, so YouTube's native controls only become interactive there.
//
function youtubeEmbedUrl(videoId, expanded) {
  if (!videoId) return null;
  const params = expanded
    ? "autoplay=1&controls=1&start=0&cc_load_policy=0&iv_load_policy=3&rel=0&modestbranding=1"
    : `autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&iv_load_policy=3&cc_load_policy=0&playsinline=1&disablekb=1&fs=0`;
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}

const panelZoom2DLayer = document.getElementById("panel-zoom-2d-layer");

// Projects the panel's own world-space rectangle (PANEL_WIDTH x
// PANEL_HEIGHT, same as CSS3DObject's scale is built from) to a CSS pixel
// rect under the CURRENT camera — used to size the 2D overlay so it lands
// exactly where the panel is actually rendered, not some fixed/viewport
// fraction.
function panelScreenRect(panelMesh) {
  const previewSize = panelMesh.userData.previewSize || {
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
  };
  const hw = previewSize.width / 2;
  const hh = previewSize.height / 2;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const project = (x, z) => {
    const v = new THREE.Vector3(x, panelMesh.position.y, z).project(camera);
    return { x: (v.x * 0.5 + 0.5) * w, y: (1 - (v.y * 0.5 + 0.5)) * h };
  };
  const a = project(panelMesh.position.x - hw, panelMesh.position.z - hh);
  const b = project(panelMesh.position.x + hw, panelMesh.position.z + hh);
  return {
    left: Math.min(a.x, b.x),
    top: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

function expandedPreviewRect(panelMesh) {
  const rect = panelScreenRect(panelMesh);
  const margin = 24;
  const scale = Math.min(
    1,
    (window.innerWidth - margin * 2) / rect.width,
    (window.innerHeight - margin * 2) / rect.height
  );
  const width = rect.width * scale;
  const height = rect.height * scale;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return {
    left: Math.max(margin, Math.min(window.innerWidth - margin - width, centerX - width / 2)),
    top: Math.max(margin, Math.min(window.innerHeight - margin - height, centerY - height / 2)),
    width,
    height,
  };
}

// previewObj.position/rotation/scale (set once in buildCategoryPanels) are
// never touched by either of these — only the DOM element's own parent and
// inline CSS position/size change, so returning to 3D needs no restore
// math, it's just however the CSS3DObject was already set up.
function updateExpandedPreviewRect(panelMesh) {
  const expandedPreviewEl = panelMesh.userData.expandedPreviewEl;
  if (!expandedPreviewEl || expandedPreviewEl.hidden) return;
  const rect = expandedPreviewRect(panelMesh);
  expandedPreviewEl.style.left = `${rect.left}px`;
  expandedPreviewEl.style.top = `${rect.top}px`;
  expandedPreviewEl.style.width = `${rect.width}px`;
  expandedPreviewEl.style.height = `${rect.height}px`;
}

function switchPreviewTo2D(panelMesh) {
  const previewObj = panelMesh.userData.previewObj;
  const previewHitObj = panelMesh.userData.previewHitObj;
  const expandedPreviewEl = panelMesh.userData.expandedPreviewEl;
  if (!previewObj || !expandedPreviewEl) return;
  const rect = expandedPreviewRect(panelMesh);
  const previewEl = panelMesh.userData.previewEl;
  if (panelMesh.userData.previewTransitionTimer) {
    clearTimeout(panelMesh.userData.previewTransitionTimer);
    panelMesh.userData.previewTransitionTimer = null;
  }
  previewObj.visible = true;
  if (previewHitObj) previewHitObj.visible = false;
  panelMesh.visible = false;
  if (previewEl) {
    previewEl.style.opacity = "1";
    previewEl.style.transition = "opacity 280ms ease-out";
  }
  expandedPreviewEl.removeAttribute("src");
  expandedPreviewEl.style.opacity = "0";
  expandedPreviewEl.style.pointerEvents = "none";
  expandedPreviewEl.hidden = false;
  expandedPreviewEl.style.left = `${rect.left}px`;
  expandedPreviewEl.style.top = `${rect.top}px`;
  expandedPreviewEl.style.width = `${rect.width}px`;
  expandedPreviewEl.style.height = `${rect.height}px`;
  expandedPreviewEl.src = expandedPreviewEl.dataset.embedUrl;
  expandedPreviewEl.onload = () => {
    setTimeout(() => {
      if (!expandedPreviewEl.hidden) {
        if (previewEl) previewEl.style.opacity = "0";
        expandedPreviewEl.style.opacity = "1";
        expandedPreviewEl.style.pointerEvents = "auto";
      }
    }, 350);
  };
}

function switchPreviewTo3D(panelMesh) {
  const previewObj = panelMesh.userData.previewObj;
  const previewHitObj = panelMesh.userData.previewHitObj;
  const expandedPreviewEl = panelMesh.userData.expandedPreviewEl;
  if (!previewObj || !expandedPreviewEl) return;
  const previewEl = panelMesh.userData.previewEl;
  if (expandedPreviewEl.hidden) return;
  if (panelMesh.userData.previewTransitionTimer) {
    clearTimeout(panelMesh.userData.previewTransitionTimer);
  }
  expandedPreviewEl.style.opacity = "0";
  expandedPreviewEl.style.pointerEvents = "none";
  panelMesh.userData.previewTransitionTimer = setTimeout(() => {
    expandedPreviewEl.hidden = true;
    expandedPreviewEl.removeAttribute("src");
    if (previewEl) previewEl.src = previewEl.dataset.previewUrl;
    if (previewEl) previewEl.style.opacity = "1";
    previewObj.visible = true;
    if (previewHitObj) previewHitObj.visible = true;
    panelMesh.visible = true;
    panelMesh.userData.previewTransitionTimer = null;
  }, 280);
}

function zoomIntoPanel(panelMesh) {
  zoomedIn = true;
  zoomedPanel = panelMesh;
  const entry = panelMesh.userData.entry;

  if (!entry.youtubeVideoId) {
    const label = makeLabel(`작업물 준비중 입니다`, "panel-badge", panelMesh.position.clone());
    panelMesh.userData._readyLabel = label;
  }

  document.getElementById("back-to-map-btn").classList.add("hidden");
  document.getElementById("zoom-close-btn").classList.remove("hidden");
  document.getElementById("welcome-corner").classList.add("faded");

  if (entry.youtubeVideoId) {
    switchPreviewTo2D(panelMesh);
  }

  const zoomPos = new THREE.Vector3(panelMesh.position.x, 4.6, panelMesh.position.z);
  tweenCamera(
    zoomPos,
    panelMesh.position.clone(),
    700,
    null,
    undefined,
    (t) => {
      updateExpandedPreviewRect(panelMesh);
    }
  );
}

function cleanupZoomedPanel() {
  const panelMesh = zoomedPanel;
  if (panelMesh) {
    switchPreviewTo3D(panelMesh);
    if (panelMesh.userData._readyLabel) {
      scene.remove(panelMesh.userData._readyLabel);
      delete panelMesh.userData._readyLabel;
    }
  }
  zoomedPanel = null;
  zoomedIn = false;
}

function exitZoom() {
  const panelMesh = zoomedPanel;
  if (!panelMesh) return;
  switchPreviewTo3D(panelMesh);
  const pose = pageCameraPose(activeCategory, scrollZ, pagePanX);
  tweenCamera(
    pose.pos,
    pose.target,
    700,
    () => {
      cleanupZoomedPanel();
      document.getElementById("zoom-close-btn").classList.add("hidden");
      document.getElementById("back-to-map-btn").classList.remove("hidden");
      document.getElementById("welcome-corner").classList.remove("faded");
    },
    undefined,
    undefined
  );
}

document.getElementById("zoom-close-btn").addEventListener("click", exitZoom);

window.addEventListener(
  "wheel",
  (e) => {
    if (!dashboardOverlay.classList.contains("hidden") || !overlay.classList.contains("hidden")) {
      return;
    }
    if (viewMode === "map") {
      e.preventDefault();
      targetMapDistance = THREE.MathUtils.clamp(
        targetMapDistance + e.deltaY * 0.008,
        controls.minDistance,
        controls.maxDistance
      );
      return;
    }
    if (viewMode === "category" && !zoomedIn) {
      e.preventDefault();
      targetScrollZ = Math.min(maxScrollZ, Math.max(0, targetScrollZ + e.deltaY * 0.025));
    }
  },
  { passive: false }
);

// ---------------------------------------------------------------------------
// Interaction: click hub / island -> open dashboard or category page
// ---------------------------------------------------------------------------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDownPos = null;

function onPointerDown(e) {
  if (e.target.closest && e.target.closest("#back-to-map-btn, #zoom-close-btn, #dashboard-overlay, #video-overlay")) {
    return;
  }
  if (e.button === 2) {
    if (viewMode === "category" && !zoomedIn) {
      isRightDragging = true;
      rightDragStartX = e.clientX;
      rightDragStartY = e.clientY;
      document.body.style.cursor = "grabbing";
    }
    return;
  }
  if (e.button === 0) {
    pointerDownPos = { x: e.clientX, y: e.clientY };
  }
  pointerDownPos = { x: e.clientX, y: e.clientY };
}

function onPointerUp(e) {
  if (e.button === 2 || isRightDragging) {
    isRightDragging = false;
    rightDragStartX = null;
    rightDragStartY = null;
    document.body.style.cursor = "";
  }
  if (!pointerDownPos) return;
  const dx = e.clientX - pointerDownPos.x;
  const dy = e.clientY - pointerDownPos.y;
  pointerDownPos = null;
  if (Math.hypot(dx, dy) > 6) return; // drag, not click

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  if (viewMode === "map") {
    const hits = raycaster.intersectObjects(mapClickable, false);
    if (hits.length === 0) return;
    const { kind, category } = hits[0].object.userData;
    if (kind === "hub") openDashboard();
    else enterCategoryPage(category);
  } else {
    if (zoomedIn) {
      exitZoom();
      return;
    }
    const hits = raycaster.intersectObjects(panelClickable, false);
    if (hits.length === 0) return;
    zoomIntoPanel(hits[0].object);
  }
}

renderer.domElement.addEventListener("pointerdown", onPointerDown);
renderer.domElement.addEventListener("pointerup", onPointerUp);
renderer.domElement.addEventListener("pointercancel", onPointerUp);
window.addEventListener("pointermove", (e) => {
  if (!isRightDragging || rightDragStartX === null || viewMode !== "category" || zoomedIn) return;
  const deltaX = e.clientX - rightDragStartX;
  const deltaY = e.clientY - rightDragStartY;
  rightDragStartX = e.clientX;
  rightDragStartY = e.clientY;
  targetPagePanX = THREE.MathUtils.clamp(targetPagePanX - deltaX * 0.02, 0, 18);
  targetScrollZ = Math.min(maxScrollZ, Math.max(0, targetScrollZ - deltaY * 0.025));
});
window.addEventListener("contextmenu", (e) => {
  if (viewMode === "category") e.preventDefault();
});

// ---------------------------------------------------------------------------
// Dashboard overlay
// ---------------------------------------------------------------------------
const dashboardOverlay = document.getElementById("dashboard-overlay");
const dashboardContent = document.getElementById("dashboard-content");
let dashboardCardObserver = null;
let dashboardCloseTimer = null;

function setupIntroVideo() {
  const canvas = dashboardContent.querySelector(".intro-video-canvas");
  const video = dashboardContent.querySelector(".intro-video-source");
  if (!canvas || !video) return;
  const context = canvas.getContext("2d");
  const alphaCanvas = document.createElement("canvas");
  const alphaContext = alphaCanvas.getContext("2d");
  const width = 640;
  const height = 360;
  canvas.width = width;
  canvas.height = height;
  alphaCanvas.width = width;
  alphaCanvas.height = height;

  const drawFrame = () => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth && video.videoHeight >= 2) {
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight / 2, 0, 0, width, height);
      alphaContext.drawImage(video, 0, video.videoHeight / 2, video.videoWidth, video.videoHeight / 2, 0, 0, width, height);
      const frame = context.getImageData(0, 0, width, height);
      const alpha = alphaContext.getImageData(0, 0, width, height);
      for (let index = 0; index < frame.data.length; index += 4) {
        frame.data[index + 3] = alpha.data[index];
      }
      context.putImageData(frame, 0, 0);
    }
    if (!video.paused && !video.ended) requestAnimationFrame(drawFrame);
  };

  video.addEventListener("loadeddata", () => {
    video.play().catch(() => {});
    drawFrame();
  }, { once: true });
  video.play().catch(() => {});
  drawFrame();
}

function renderHubDashboard() {
  dashboardCardObserver?.disconnect();

  const educationHtml = educationAwards
    .map(
      (entry, index) => `
        <article class="archive-row">
          <div class="archive-year">${entry.year || "2026"}</div>
          <div class="archive-record">
            <div class="archive-org">${entry.org}</div>
            <div class="archive-detail">${entry.detail}</div>
            <span class="status-label">${entry.status}</span>
          </div>
        </article>`
    )
    .join("");

  const certificationsHtml = certifications
    .map((certification, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span>${certification}</li>`)
    .join("");

  const experienceHtml = Object.keys(experienceByYear)
    .sort()
    .map(
      (year) => `
        <div class="experience-year">
          <div class="experience-year-label">${year}</div>
          <div class="experience-records">
            ${experienceByYear[year]
              .map(
                (entry) => `
                  <article class="experience-row">
                    <div class="experience-org">${entry.org}</div>
                    <div class="experience-desc">${entry.desc}</div>
                  </article>`
              )
              .join("")}
          </div>
        </div>`
    )
    .join("");

  const skillCategories = [
    {
      code: "01",
      name: "VIDEO",
      sub: "EDITING & ASSEMBLY",
      tools: [
        {
          name: "Premiere Pro",
          icon: "./png/Premiere_2D.png",
          desc: "내러티브 영상 조립 및 타임라인 정밀 컷편집",
        },
        {
          name: "Final Cut Pro",
          icon: "./png/Final-Cut_2D.png",
          desc: "고속 러프컷 및 고해상도 4K 영상 편집",
        },
      ],
    },
    {
      code: "02",
      name: "MOTION",
      sub: "MOTION & COMPOSITING",
      tools: [
        {
          name: "After Effects",
          icon: "./png/Aftereffect_2D.png",
          desc: "모션 그래픽, 키네틱 타이포 & 2D/3D VFX",
        },
      ],
      extra: "Cinema 4D · 2D/3D Motion",
    },
    {
      code: "03",
      name: "DESIGN",
      sub: "LOOK DEV & GRAPHIC",
      tools: [
        {
          name: "Photoshop",
          icon: "./png/Photoshop_2D.png",
          desc: "이미지 합성 & 스토리보드 제작",
        },
        {
          name: "Illustrator",
          icon: "./png/Illustrator_2D.png",
          desc: "벡터 그래픽, 타이틀 에셋 & 포스터 아트워크",
        },
        {
          name: "Lightroom",
          icon: "./png/Lightroom_2D.png",
          desc: "스틸 컷 컬러 보정 & 일관된 톤 밸런싱",
        },
      ],
    },
    {
      code: "04",
      name: "SOUND",
      sub: "AUDIO & POST-PRODUCTION",
      tools: [
        {
          name: "Pro Tools",
          icon: "./png/Pro-Tools_2D.png",
          desc: "DAW 환경 보컬 레코딩 & 멀티트랙 믹싱",
        },
        {
          name: "Audition",
          icon: "./png/Audition_2D.png",
          desc: "사운드 디자인, 노이즈 복원 & 오디오 마스터링",
        },
      ],
    },
    {
      code: "05",
      name: "AI",
      sub: "CREATIVE & PLANNING",
      tools: [
        {
          name: "ChatGPT",
          icon: "./png/ChatGPT_2D.png",
          desc: "영상 기획 구조화 & 프롬프트 엔지니어링",
        },
        {
          name: "Claude",
          icon: "./png/claude_2D.png",
          desc: "내러티브 설계, 시나리오 & 카피라이팅",
        },
        {
          name: "NotebookLM",
          icon: "./png/notebooklm_2D.png",
          desc: "레퍼런스 자료 분석 & 기획 데이터 구조화",
        },
      ],
      extra: "Midjourney · Veo · Runway · Suno · Seedance · Nano Banana Pro · Higgsfield",
    },
  ];

  const skillsEditorialHtml = skillCategories
    .map(
      (cat) => `
        <div class="skills-editorial-row">
          <div class="skills-category-column">
            <div class="skills-category-name">${cat.name}</div>
            <span class="skills-category-sub">${cat.sub}</span>
          </div>
          <div class="skills-tools-column">
            <div class="skills-tools-grid">
              ${cat.tools
                .map(
                  (tool) => `
                <div class="skill-tool-item">
                  <img src="${tool.icon}" alt="${tool.name}" class="skill-tool-icon" />
                  <div class="skill-tool-info">
                    <strong class="skill-tool-name">${tool.name}</strong>
                    <p class="skill-tool-desc">${tool.desc}</p>
                  </div>
                </div>`
                )
                .join("")}
            </div>
            ${
              cat.extra
                ? `<div class="skills-extra-tools"><span class="skills-extra-label">ADDITIONAL</span><strong class="skills-extra-text">${cat.extra}</strong></div>`
                : ""
            }
          </div>
        </div>`
    )
    .join("");
  const projectArchiveHtml = featuredProjects.items
    .map(
      (project) => `
        <article class="project-archive-row">
          <div class="project-archive-number">${project.number}</div>
          <div>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-links">
              ${project.links
                .map((link) =>
                  link.youtubeVideoId
                    ? `<button class="video-link" type="button" data-title="${link.label}" data-desc="${project.description}" data-youtube-video-id="${link.youtubeVideoId}" data-aspect-ratio="${(link.youtubeVideoId === 'V3kWnBgk19Q' || link.label === '윤슬') ? (2560 / 676) : (link.aspectRatio || '')}">${link.label}<span>↗</span></button>`
                    : `<span class="project-link pending">${link.label}<em>PREPARING</em></span>`
                )
                .join("")}
            </div>
          </div>
        </article>`
    )
    .join("");

  dashboardContent.innerHTML = `
    <div class="editorial-shell">
      <div class="profile-sidebar">
        <aside class="profile-column">
          <div class="profile-topline"><span>hello</span><span>I'm ye do</span></div>
          <figure class="profile-portrait">
            <img src="./jpg/yedokim.jpg" alt="김예도 프로필 사진" />
            <figcaption>PORTRAIT / 2026</figcaption>
          </figure>
          <div class="profile-meta">
            <span class="meta-label">DISCIPLINE</span>
            <strong>VIDEO DESIGN &amp; MOTION</strong>
            <span class="meta-label">BASED IN</span>
            <strong>DAEJEON, KR</strong>
          </div>
          <div class="profile-contact">
            <span class="meta-label">CONTACT</span>
            <a href="mailto:${contact.email}">${contact.email}</a>
            <a href="tel:${contact.phone.replaceAll("-", "")}">${contact.phone}</a>
          </div>
          <div class="profile-footnote">${hero.eyebrow}<br />AVAILABLE FOR SELECTED PROJECTS</div>
        </aside>
      </div>

      <main class="editorial-main">
        <header class="editorial-header">
          <div class="header-kicker"><span>PORTFOLIO / INTRODUCTION</span><span>NO. 001</span></div>
          <div class="intro-video-row">
            <span class="name-side-note">${hero.nameEn}<br />2005 — PRESENT</span>
            <div class="intro-video-frame">
              <canvas class="intro-video-canvas" aria-label="홈 영상"></canvas>
              <video class="intro-video-source" src="./video/hello_alpha.mp4" autoplay loop muted playsinline preload="auto"></video>
            </div>
          </div>
          <div class="intro-grid">
            <p class="intro-copy">${hero.description}</p>
          </div>
        </header>

        <section class="editorial-section education-section">
          <div class="section-heading"><span class="section-number">01</span><h2>ACADEMIC</h2><span class="section-rule"></span><span class="section-caption">EDUCATION / STATUS</span></div>
          <div class="archive-list">${educationHtml}</div>
        </section>

        <section class="editorial-section experience-section">
          <div class="section-heading"><span class="section-number">02</span><h2>EXPERIENCE</h2><span class="section-rule"></span><span class="section-caption">FIELD NOTES / PROJECTS</span></div>
          <div class="experience-list">${experienceHtml}</div>
        </section>

        <section class="editorial-section skills-section">
          <div class="section-heading"><span class="section-number">03</span><h2>CORE SKILLS</h2><span class="section-rule"></span><span class="section-caption">PRODUCTION SUITE / WORKFLOW</span></div>
          <div class="skills-editorial-list">${skillsEditorialHtml}</div>
        </section>

        <section class="editorial-section credentials-section">
          <div class="section-heading"><span class="section-number">05</span><h2>CREDENTIALS</h2><span class="section-rule"></span><span class="section-caption">CERTIFICATIONS</span></div>
          <ol class="credential-list">${certificationsHtml}</ol>
        </section>

        <footer class="editorial-footer">
          <div class="footer-content">
            <h3 class="footer-title">LET'S MAKE SOMETHING</h3>
            <p class="footer-desc">${contact.message}</p>
          </div>
          <a class="footer-email" href="mailto:${contact.email}">${contact.email}<span>↗</span></a>
        </footer>
      </main>
    </div>
  `;

  setupIntroVideo();

  const dashboardCards = dashboardContent.querySelectorAll(
    ".profile-column, .editorial-header, .editorial-section, .editorial-footer"
  );
  dashboardCards.forEach((card, index) => {
    card.classList.add("dashboard-card");
    card.style.setProperty("--card-index", index);
    card.style.setProperty("--card-exit-delay", `${(dashboardCards.length - index - 1) * 65}ms`);
  });

  if ("IntersectionObserver" in window) {
    dashboardCardObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { root: dashboardOverlay, threshold: 0.12, rootMargin: "-8% 0px -8%" }
    );
    dashboardCards.forEach((card) => dashboardCardObserver.observe(card));
  } else {
    dashboardCards.forEach((card) => card.classList.add("is-visible"));
  }
}

function openDashboard() {
  if (dashboardCloseTimer) {
    clearTimeout(dashboardCloseTimer);
    dashboardCloseTimer = null;
  }
  renderHubDashboard();
  dashboardOverlay.classList.remove("is-closing");
  dashboardOverlay.classList.remove("hidden");
  dashboardOverlay.scrollTop = 0;
}

function closeDashboard() {
  if (dashboardOverlay.classList.contains("hidden") || dashboardOverlay.classList.contains("is-closing")) return;
  dashboardCardObserver?.disconnect();
  dashboardCardObserver = null;
  dashboardOverlay.classList.add("is-closing");
  dashboardContent.querySelectorAll(".dashboard-card").forEach((card) => {
    card.classList.remove("is-visible");
    card.classList.add("is-closing");
  });
  dashboardCloseTimer = setTimeout(() => {
    dashboardOverlay.classList.remove("is-closing");
    dashboardOverlay.classList.add("hidden");
    dashboardCloseTimer = null;
  }, 1200);
}

document.getElementById("dashboard-close-btn").addEventListener("click", closeDashboard);
document.getElementById("dashboard-backdrop").addEventListener("click", closeDashboard);

dashboardContent.addEventListener("click", (e) => {
  const link = e.target.closest(".video-link");
  if (!link) return;
  openVideo({
    title: link.dataset.title,
    description: link.dataset.desc,
    youtubeVideoId: link.dataset.youtubeVideoId,
    aspectRatio: link.dataset.aspectRatio ? Number(link.dataset.aspectRatio) : undefined,
  });
});

// ---------------------------------------------------------------------------
// Video overlay (nested modal, opened from a dashboard card)
// ---------------------------------------------------------------------------
const overlay = document.getElementById("video-overlay");
const videoEl = document.getElementById("video-player");
const youtubeVideoEl = document.getElementById("video-youtube-player");
const placeholderEl = document.getElementById("video-placeholder");
const titleEl = document.getElementById("video-title");
const descEl = document.getElementById("video-description");

function openVideo(project) {
  titleEl.textContent = project.title;
  descEl.textContent = project.description;
  const videoFrameEl = document.getElementById("video-frame");
  const effectiveRatio = (project.youtubeVideoId === "V3kWnBgk19Q" || project.title === "윤슬")
    ? (2560 / 676)
    : project.aspectRatio;
  if (videoFrameEl) {
    videoFrameEl.style.aspectRatio = effectiveRatio ? `${effectiveRatio}` : "16 / 9";
  }
  if (project.youtubeVideoId) {
    placeholderEl.classList.add("hidden");
    videoEl.classList.add("hidden");
    youtubeVideoEl.classList.remove("hidden");
    youtubeVideoEl.src = youtubeEmbedUrl(project.youtubeVideoId, true);
  } else {
    videoEl.classList.add("hidden");
    youtubeVideoEl.classList.add("hidden");
    youtubeVideoEl.removeAttribute("src");
    placeholderEl.classList.remove("hidden");
  }
  overlay.classList.remove("hidden");
}

function closeVideo() {
  overlay.classList.add("hidden");
  videoEl.pause();
  videoEl.removeAttribute("src");
  videoEl.load();
  youtubeVideoEl.classList.add("hidden");
  youtubeVideoEl.removeAttribute("src");
  const videoFrameEl = document.getElementById("video-frame");
  if (videoFrameEl) videoFrameEl.style.aspectRatio = "16 / 9";
}

document.getElementById("video-close-btn").addEventListener("click", closeVideo);
document.getElementById("video-overlay-backdrop").addEventListener("click", closeVideo);
window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!overlay.classList.contains("hidden")) closeVideo();
  else if (!dashboardOverlay.classList.contains("hidden")) closeDashboard();
  else if (zoomedIn) return;
  else if (viewMode === "category") exitCategoryPage();
});

// ---------------------------------------------------------------------------
// Resize + render loop
// ---------------------------------------------------------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  css3dRenderer.setSize(window.innerWidth, window.innerHeight);
});

// "WELCOME TO MY PORTFOLIO!" drifts gently as the mouse moves — a light
// parallax reaction, smoothed so it never snaps.
const welcomeEl = document.getElementById("welcome-corner");
let mouseNormX = 0;
let mouseNormY = 0;
let welcomeOffsetX = 0;
let welcomeOffsetY = 0;
window.addEventListener("mousemove", (e) => {
  mouseNormX = (e.clientX / window.innerWidth) * 2 - 1; // -1 (left) .. 1 (right)
  mouseNormY = (e.clientY / window.innerHeight) * 2 - 1; // -1 (top) .. 1 (bottom)
});

function animate() {
  requestAnimationFrame(animate);

  if (!isTweening) {
    if (viewMode === "category" && !zoomedIn) {
      scrollZ += (targetScrollZ - scrollZ) * 0.12;
      pagePanX += (targetPagePanX - pagePanX) * 0.12;
      const pose = pageCameraPose(activeCategory, scrollZ, pagePanX);
      camera.position.copy(pose.pos);
      controls.target.copy(pose.target);
      camera.lookAt(pose.target);
    } else if (viewMode === "map") {
      const currentMapDistance = camera.position.distanceTo(controls.target);
      const nextMapDistance = THREE.MathUtils.lerp(
        currentMapDistance,
        targetMapDistance,
        0.12
      );
      camera.position
        .sub(controls.target)
        .setLength(nextMapDistance)
        .add(controls.target);
      controls.update();
    }
  }

  welcomeOffsetX += (mouseNormX * 18 - welcomeOffsetX) * 0.06;
  welcomeOffsetY += (mouseNormY * 12 - welcomeOffsetY) * 0.06;
  welcomeEl.style.transform = `translate(${welcomeOffsetX.toFixed(2)}px, ${welcomeOffsetY.toFixed(2)}px)`;

  renderer.render(scene, camera);
  css3dRenderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();

const loadingScreenEl = document.getElementById("loading-screen");
if (loadingScreenEl) loadingScreenEl.classList.add("hidden");
setTimeout(() => {
  const ls = document.getElementById("loading-screen");
  if (ls) ls.classList.add("hidden");
}, 1200);
