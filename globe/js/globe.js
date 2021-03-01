var scene, camera, onGlobeEvent,
markers = new THREE.Object3D(),
pointer = new THREE.Raycaster();

const globeRadius = 100;
const globeWidth = 4098 / 2;
const globeHeight = 1968 / 2;

var Globe ={
  init: function(callback){

  const container = document.getElementById("globe");
  const canvas = container.getElementsByTagName("canvas")[0];

  function convertFlatCoordsToSphereCoords(x, y) {
    let latitude = ((x - globeWidth) / globeWidth) * -180;
    let longitude = ((y - globeHeight) / globeHeight) * -90;
    latitude = (latitude * Math.PI) / 180;
    longitude = (longitude * Math.PI) / 180;
    const radius = Math.cos(longitude) * globeRadius;

    return {
      x: Math.cos(latitude) * radius,
      y: Math.sin(longitude) * globeRadius,
      z: Math.sin(latitude) * radius
    };
  }

  function makeMagic(points) {
    const { width, height } = container.getBoundingClientRect();

    // 1. Setup scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xFFFFFF );
    scene.fog = new THREE.Fog(0xFFFFFF, 250, 410);
    // 2. Setup camera
    camera = new THREE.PerspectiveCamera(45, width / height);
    // 3. Setup renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true
    });
    renderer.setSize(width, height);
    // 4. Add points to canvas
    // - Single geometry to contain all points.
    const mergedGeometry = new THREE.Geometry();
    // - Material that the dots will be made of.
    const pointGeometry = new THREE.SphereGeometry(0.5, 1, 1);
    const pointMaterial = new THREE.MeshBasicMaterial({
      color: "#bbb",
    });

    for (let point of points) {
      const { x, y, z } = convertFlatCoordsToSphereCoords(
        point.x,
        point.y,
        width,
        height
      );

      if (x && y && z) {
        pointGeometry.translate(x, y, z);
        mergedGeometry.merge(pointGeometry);
        pointGeometry.translate(-x, -y, -z);
      }
    }

    const globeShape = new THREE.Mesh(mergedGeometry, pointMaterial);
    scene.add(globeShape);
    scene.add(markers);

    // Setup orbital controls
    camera.orbitControls = new THREE.OrbitControls(camera, canvas);
    camera.orbitControls.enableKeys = false;
    camera.orbitControls.enablePan = false;
    camera.orbitControls.enableZoom = false;
    camera.orbitControls.enableDamping = false;
    camera.orbitControls.enableRotate = true;
    camera.orbitControls.autoRotate = true;
    camera.orbitControls.autoRotateSpeed = 1.0;
    camera.position.z = -265;
    camera.position.y = 175;

    canvas.addEventListener("click", Globe.onGlobeClickHandler, false);

    function animate() {

      if(markers.children.length > 0){
        for(var i=0; i<markers.children.length; ++i){
          markers.children[i].lookAt( camera.position );
        }
      } 

      // orbitControls.autoRotate is enabled so orbitControls.update
      // must be called inside animation loop.
      camera.orbitControls.update();
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    if(callback) callback();
  }

  function hasWebGL() {
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && gl instanceof WebGLRenderingContext) {
      return true;
    } else {
      return false;
    }
  }

  function init() {
    if (hasWebGL()) {
      window
        .fetch("js/points.json")
        .then(response => response.json())
        .then(data => {
          makeMagic(data.points);
        });
    }
  }
  init();
  },
  addMarker: function(obj){
    var _width = 256,
      _height = 64;

  var marker = new THREE.Object3D();

  var canvas = document.createElement("canvas");
  canvas.width = _width;
  canvas.height = _height;
  var context = canvas.getContext("2d");

  context.beginPath();
  context.fillStyle = (obj.open == false ? "#897657" : "#000000");
  context.rect(0,0,_width,_height);
  context.fill();

  context.fillStyle = "rgba(255,255,255,1)";
  context.font = "Normal 32px Helvetica";
  let size = context.measureText(obj.city);
  context.fillText(obj.city, _width*.5-size.width*.5,42);

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  let mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 5, 14, 6),
    new THREE.MeshBasicMaterial({ map:texture, wireframe:false})
  );

  let dot = new THREE.Mesh(
    new THREE.SphereGeometry(1, 4, 4),
    new THREE.MeshBasicMaterial({color:0x000000})
  );

  if(obj.lat < 0){
    mesh.geometry.vertices[7].y += 2;
    dot.position.set(0, 6, 0);
  }else{
    mesh.geometry.vertices[97].y -= 2;
    dot.position.set(0, -6, 0);
  }

  marker.add(mesh);
  marker.add(dot);

  var latRad = obj.lat * (Math.PI / 180);
  var lonRad = -obj.lng * (Math.PI / 180);
  var r = globeRadius + 5;

  marker.position.set(Math.cos(latRad) * Math.cos(lonRad) * r, Math.sin(latRad) * r, Math.cos(latRad) * Math.sin(lonRad) * r);
  //mesh.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);

  marker._obj = obj;

  markers.add(marker);
  },
  onGlobeClickHandler: function(e){
    let mouseCoords = new THREE.Vector2();
  
  mouseCoords.set(
    ( e.clientX / window.innerWidth ) * 2-1,
    - (e.clientY / window.innerHeight ) * 2+1
  );
  pointer.setFromCamera( mouseCoords, camera );

    var intersects = pointer.intersectObjects( markers.children, true );
    if( intersects.length > 0 ){
      let selected = intersects[0].object;

      if( onGlobeEvent && {}.toString.call( onGlobeEvent ) === '[object Function]'){
        onGlobeEvent(selected.parent._obj);
      }
    }
  }
};