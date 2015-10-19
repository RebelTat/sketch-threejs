var Util = require('./Util');
var debounce = require('./debounce');
var Camera = require('./camera');
var HemiLight = require('./hemiLight');
var Mover = require('./mover');

var body_width = document.body.clientWidth;
var body_height = document.body.clientHeight;
var fps = 60;
var last_time_render = Date.now();
var raycaster = new THREE.Raycaster();
var vector_mouse_down = new THREE.Vector2();
var vector_mouse_move = new THREE.Vector2();
var intersects;

var canvas = null;
var renderer = null;
var scene = null;
var camera = null;
var light = null;

var movers = [];
var points_geometry = null;
var points_material = null;
var points = null;
var points_range_rad = 0;

var initThree = function() {
  canvas = document.getElementById('canvas');
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  if (!renderer) {
    alert('Three.jsの初期化に失敗しました。');
  }
  renderer.setSize(body_width, body_height);
  canvas.appendChild(renderer.domElement);
  renderer.setClearColor(0x111111, 1.0);
  
  scene = new THREE.Scene();
  //scene.fog = new THREE.FogExp2(0x000000, 2000);
  
  camera = new Camera();
  camera.init(body_width, body_height);
  
  light = new HemiLight();
  light.init(scene, Util.getRadian(30), Util.getRadian(60), 1000, 0xeeeeff, 0x777700, 1);
  
  // var dummy_geometry = new THREE.BoxGeometry(100, 100, 100);
  // var dummy_material = new THREE.MeshLambertMaterial({
  //   color: 0xffffff
  // });
  // var dummy_obj = new THREE.Mesh(dummy_geometry, dummy_material);
  // scene.add(dummy_obj);
};

var init = function() {
  initThree();
  buildPoints();
  renderloop();
  setEvent();
  debounce(window, 'resize', function(event){
    resizeRenderer();
  });
};

var buildPoints = function() {
  points_geometry = new THREE.Geometry();
  points_material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 10
  });
  for (var i = 0; i < 1000; i++) {
    var mover = new Mover();
    mover.init(new THREE.Vector3(0, 0, 0));
    movers.push(mover);
    points_geometry.vertices.push(mover.position);
  }
  points = new THREE.Points(points_geometry, points_material);
  scene.add(points);
};

var updatePoints = function() {
  for (var i = 0; i < movers.length; i++) {
    points.geometry.vertices[i] = movers[i].position;
  }
  points.geometry.verticesNeedUpdate = true;
};

var raycast = function(vector) {
  vector.x = (vector.x / window.innerWidth) * 2 - 1;
  vector.y = - (vector.y / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(vector, camera.obj);
  intersects = raycaster.intersectObjects(scene.children);
};

var setEvent = function () {
  var touchStart = function(x, y) {
    vector_mouse_down.set(x, y);
    raycast(vector_mouse_down);
  };
  
  var touchMove = function(x, y) {
    vector_mouse_move.set(x, y);
    raycast(vector_mouse_move);
  };
  
  var touchEnd = function(x, y) {
  };

  canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('selectstart', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('mousedown', function (event) {
    event.preventDefault();
    touchStart(event.clientX, event.clientY);
  });

  canvas.addEventListener('mousemove', function (event) {
    event.preventDefault();
    touchMove(event.clientX, event.clientY);
  });

  canvas.addEventListener('mouseup', function (event) {
    event.preventDefault();
    touchEnd();
  });

  canvas.addEventListener('touchstart', function (event) {
    event.preventDefault();
    touchStart(event.touches[0].clientX, event.touches[0].clientY);
  });

  canvas.addEventListener('touchmove', function (event) {
    event.preventDefault();
    touchMove(event.touches[0].clientX, event.touches[0].clientY);
  });

  canvas.addEventListener('touchend', function (event) {
    event.preventDefault();
    touchEnd();
  });
};

var render = function() {
  renderer.clear();
  updatePoints();
  renderer.render(scene, camera.obj);
};

var renderloop = function() {
  var now = Date.now();
  requestAnimationFrame(renderloop);

  if (now - last_time_render > 1000 / fps) {
    render();
    last_time_render = Date.now();
  }
};

var resizeRenderer = function() {
  body_width  = document.body.clientWidth;
  body_height = document.body.clientHeight;
  renderer.setSize(body_width, body_height);
  camera.resize(body_width, body_height);
};

init();