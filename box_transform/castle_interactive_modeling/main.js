import * as THREE from '/build/three.module.js';

import { OrbitControls } from '../controls/OrbitControls.js';
import { TransformControls } from '../controls/TransformControls.js';

import * as BUILDING from './building.js';

let cameraPersp, cameraOrtho, currentCamera;
let scene, renderer, control, orbit;

const LINE = 0, GEOMETRY = 1;

//石垣
var ishigaki_steps = 6;
var ishigaki_line = [];
var ishigaki_geometry = [];
// 櫓の補助線
var yagura_steps = 5;
var yagura_line = [];
var yagura_geometry = [];
// 屋根の補助線
var yane_line = [];
// 垂木の補助線
var taruki_line = [];
// 入母屋破風の補助線
var irimoya_line = [];
var irimoya_geometry = [];
// 千鳥破風の補助線
var hafu_line = [];

init();
render();

function init() {

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  const aspect = window.innerWidth / window.innerHeight;

  cameraPersp = new THREE.PerspectiveCamera( 90, aspect, 0.01, 30000 );
  cameraOrtho = new THREE.OrthographicCamera( - 600 * aspect, 600 * aspect, 600, - 600, 0.01, 30000 );
  currentCamera = cameraPersp;

  currentCamera.position.set( 100, 400, 100 );

  const mouse = new THREE.Vector2();

  scene = new THREE.Scene();
  scene.add( new THREE.GridHelper( 1000, 10, 0x888888, 0x444444 ) );
  const axes = new THREE.AxesHelper(300);
  scene.add(axes);

  const light = new THREE.DirectionalLight( 0xffffff, 2 );
  light.position.set( 1, 1, 1 );
  scene.add( light );

  const texture = new THREE.TextureLoader().load( 'textures/crate.gif', render );
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // const geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
  // const material = new THREE.MeshLambertMaterial( { map: texture, transparent: true } );

  // 直方体を作成
  const material = new THREE.MeshNormalMaterial();
  const geometry = new THREE.SphereGeometry(3, 3, 3);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  orbit = new OrbitControls( currentCamera, renderer.domElement );
  orbit.target.set(0, 0, 0)
  orbit.update();
  orbit.addEventListener( 'change', render );

  control = new TransformControls( currentCamera, renderer.domElement );
  control.addEventListener( 'change', render );

  control.addEventListener( 'dragging-changed', function ( event ) {

    orbit.enabled = ! event.value;

  } );

  // クリックしたときにあらわれる補助線
  var line_geometry = new THREE.Geometry();
  var rec_y0plane = new THREE.Line( line_geometry, new THREE.LineBasicMaterial({color: 0xFFFFFF}));
  // var ishigaki_line = new Array(5 * ishigaki_steps);
  for (let i=0; i<5*ishigaki_steps; i++) ishigaki_line[i] = (new THREE.Line( new THREE.Geometry, new THREE.LineBasicMaterial({color: 0xFFFFFF})));




  var build_mode = false;
  var edit_mode = false;
  var click_count = 0; // クリック回数のカウント
  var ref_point = new Array(5); // クリックした座標の保持
  const mouse_on_y0plane = new THREE.Vector3(); // カメラからカーソルのレイとy=0の平面の交点
  const mouse_on_2pplane = new THREE.Vector3(); // カメラからカーソルのレイと指定した2点を通るxz平面に垂直な平面の交点

  const raycaster = new THREE.Raycaster();
  var currentObj = undefined;
  var currentSquare = undefined;

  window.onmousemove = function(e) {
    // 上向きベクトル算出
    var t = new THREE.Vector3(0, 1, 0).applyMatrix4(currentCamera.matrixWorld);

    // カメラの位置から注視点位置を引き、正規化
    var w = new THREE.Vector3().subVectors(currentCamera.position, orbit.target).normalize();
    // wとカメラの上向きベクトルの外積を計算し、正規化
    var u = new THREE.Vector3().crossVectors(w, t).normalize();
    // uとwの外積を計算し、正規化
    var v = new THREE.Vector3().crossVectors(u, w).normalize();

    // 視点座標系の軸ベクトル
    var axis_vec = new THREE.Vector3(u, v, w);

    // canvas要素上のXY座標
    const mouseX = e.clientX// - window.innerWidth / 2;
    const mouseY = e.clientY// - window.innerHeight / 2;
    // console.log(mouseX, mouseY, window.innerWidth, window.innerHeight);

    var xs_dy = ((mouseX + 0) - window.innerWidth / 2.0) / window.innerHeight * 2 * Math.tan(currentCamera.fov / 2 * Math.PI / 180);
    var xs_dy_u = new THREE.Vector3().copy(u).multiplyScalar(xs_dy);
    var ys_dy = ((mouseY + 0) - window.innerHeight / 2.0) / window.innerHeight * 2 * Math.tan(currentCamera.fov / 2 * Math.PI / 180);
    var ys_dy_v = new THREE.Vector3().copy(v).multiplyScalar(ys_dy);
    // カメラ位置からカーソル位置までの方向ベクトル
    var q = new THREE.Vector3().copy(xs_dy_u).add(ys_dy_v).add(w);
    // console.log(q);

    // qとy=0の平面との交点
    var x_3d = -1 * currentCamera.position.y / q.y * q.x + currentCamera.position.x;
    var z_3d = -1 * currentCamera.position.y / q.y * q.z + currentCamera.position.z;
    mouse_on_y0plane.set(x_3d, 0, z_3d);

    if (click_count == 1) {
      console.log("once");
      var A = ref_point[0].clone(), B = mouse_on_y0plane.clone();
      var rec_vertices = [];
      console.log(B);
      rec_vertices.push(new THREE.Vector3(A.x, 0, A.z));
      rec_vertices.push(new THREE.Vector3(B.x, 0, A.z));
      rec_vertices.push(new THREE.Vector3(B.x, 0, B.z));
      rec_vertices.push(new THREE.Vector3(A.x, 0, B.z));
      rec_vertices.push(new THREE.Vector3(A.x, 0, A.z));
      rec_vertices.push(new THREE.Vector3(B.x, 0, B.z));
      rec_y0plane.geometry.vertices = rec_vertices;
      rec_y0plane.geometry.verticesNeedUpdate = true;
      rec_y0plane.geometry.elementNeedUpdate = true;
      rec_y0plane.geometry.computeFaceNormals();
    } else if (click_count == 2) {
      // 平面の指定した2点を通り、y軸に平行な平面
      var vec_2points = new THREE.Vector3(ref_point[1].x - ref_point[0].x, 0, ref_point[1].z - ref_point[0].z); // 2点間方向ベクトル
      var normal_2points = new THREE.Vector3(-1 * vec_2points.z, 0, vec_2points.x); // 2点間の方向ベクトルの法線ベクトル
      // n = normal_2points、A = ref_point[0]とすると、直線の方程式は
      // nx(x-Ax)+nz(z-Az)=0 (ny=0よりyについては省略)

      // qと、平面の指定した2点を通りy軸に平行な平面との交点
      // 媒介変数t
      var t = (normal_2points.x * (ref_point[0].x - currentCamera.position.x) + normal_2points.z * (ref_point[0].z - currentCamera.position.z)) / (normal_2points.x * q.x + normal_2points.z * q.z);
      mouse_on_2pplane.set(
        q.x * t + currentCamera.position.x,
        q.y * t + currentCamera.position.y,
        q.z * t + currentCamera.position.z
        );
      // console.log(t);

      BUILDING.render_ishigaki(
        ref_point[0].clone(),
        ref_point[1].clone(),
        0,
        mouse_on_2pplane.clone(),
        LINE
      );
    } else if (click_count == 3) {
      // 平面の指定した2点を通り、y軸に平行な平面
      var vec_2points = new THREE.Vector3(ref_point[1].x - ref_point[0].x, 0, ref_point[1].z - ref_point[0].z); // 2点間方向ベクトル
      var normal_2points = new THREE.Vector3(-1 * vec_2points.z, 0, vec_2points.x); // 2点間の方向ベクトルの法線ベクトル
      // n = normal_2points、A = ref_point[0]とすると、直線の方程式は
      // nx(x-Ax)+nz(z-Az)=0 (ny=0よりyについては省略)

      // qと、平面の指定した2点を通りy軸に平行な平面との交点
      // 媒介変数t
      var t = (normal_2points.x * (ref_point[0].x - currentCamera.position.x) + normal_2points.z * (ref_point[0].z - currentCamera.position.z)) / (normal_2points.x * q.x + normal_2points.z * q.z);
      mouse_on_2pplane.set(
        q.x * t + currentCamera.position.x,
        q.y * t + currentCamera.position.y,
        q.z * t + currentCamera.position.z
        );
      mesh.position.set(mouse_on_2pplane.x, mouse_on_2pplane.y, mouse_on_2pplane.z);
      // console.log(t);

      BUILDING.render_yagura(
        ref_point[2].clone(),
        ref_point[3].clone(),
        0,
        mouse_on_2pplane.clone(),
        LINE
      );
      BUILDING.render_yane(
        ref_point[2].clone(),
        ref_point[3].clone(),
        0,
        mouse_on_2pplane.clone(),
        LINE
      );
    } else {
      mesh.position.set(mouse_on_y0plane.x, mouse_on_y0plane.y, mouse_on_y0plane.z);
      // console.log(ref_point[0]);
    }

    if (edit_mode) {
      const element = e.target;
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      mouse.x = (mouseX / width) * 2 - 1;
      mouse.y = -(mouseY / height) * 2 + 1;

      raycaster.setFromCamera(mouse, currentCamera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        var obj = intersects[0].object;
        var square = intersects[0].faceIndex;

        if (currentObj != obj || currentSquare != square) {
          if (square !== undefined) {
            if (currentObj && currentSquare) {
              currentObj.geometry.colorsNeedUpdate = true;
              currentObj.geometry.faces[currentSquare].color.set(0xCBC9D4);
              if (currentSquare == 10) currentObj.geometry.faces[11].color.set(0xCBC9D4);
              if (currentSquare == 11) currentObj.geometry.faces[10].color.set(0xCBC9D4);
            }

            if (square == 10 || square == 11) {
              obj.geometry.colorsNeedUpdate = true;
              obj.geometry.faces[square].color.set(0x00ff00);
              if (square == 10) obj.geometry.faces[11].color.set(0x00ff00);
              if (square == 11) obj.geometry.faces[10].color.set(0x00ff00);
            }

            currentObj = obj;
            currentSquare = square;
            console.log(square)
          }
        }
      } else {
        if (currentObj) {
          currentObj.geometry.colorsNeedUpdate = true;
          currentObj.geometry.faces[currentSquare].color.set(0xCBC9D4);
          if (currentSquare == 10) currentObj.geometry.faces[11].color.set(0xCBC9D4);
          if (currentSquare == 11) currentObj.geometry.faces[10].color.set(0xCBC9D4);
        }
      }
    }

    render();
  }

  window.addEventListener('click', function(e) {
    if (build_mode) {
      if (click_count == 0) {
        ref_point[0] = mouse_on_y0plane.clone();
        var m = new THREE.Mesh(geometry, material);
        scene.add(m);
        m.position.set(ref_point[0].x, ref_point[0].y, ref_point[0].z);
        // ref_point[0] ... 最初に決めた点(地面上)
        click_count++;
        scene.add(rec_y0plane); // 補助線追加
        // console.log(ref_point[0]);
      } else if (click_count == 1) {
        ref_point[1] = mouse_on_y0plane.clone();
        var m = new THREE.Mesh(geometry, material);
        scene.add(m);
        m.position.set(ref_point[1].x, ref_point[1].y, ref_point[1].z);
        // ref_point[1] ... 最初に決めた点と対角線上にある地面上の点
        for (let i=0; i<5*ishigaki_steps; i++) scene.add(ishigaki_line[i]);
        click_count++;
      } else if (click_count == 2) {
        ref_point[3] = mouse_on_2pplane.clone();
        if (ref_point[3].y < 0) ref_point[3].y = 0;
        ref_point[2] = new THREE.Vector3(
          ref_point[1].x - (ref_point[3].x - ref_point[0].x),
          ref_point[3].y,
          ref_point[1].z - (ref_point[3].z - ref_point[0].z)
        );
        var m = new THREE.Mesh(geometry, material);
        scene.add(m);
        m.position.set(ref_point[3].x, ref_point[3].y, ref_point[3].z);
        // ref_point[3] ... 0と1の点を通る、地面に垂直な平面上の点。石垣の上面の1と同じ側にある点
        // ref_point[2] ... 3と対角線上にある点。石垣の上面の0と同じ側にある点
        for (let i=0; i<5*ishigaki_steps; i++) scene.remove(ishigaki_line[i]);
        BUILDING.render_ishigaki(
          ref_point[0].clone(),
          ref_point[1].clone(),
          ref_point[2].clone(),
          ref_point[3].clone(),
          GEOMETRY
        );
        BUILDING.add_yagura_line();
        BUILDING.add_yane_line();
        click_count++;
      } else if (click_count == 3) {
        ref_point[5] = mouse_on_2pplane.clone();
        if (ref_point[5].x > ref_point[3].x) ref_point[5].x = ref_point[3].x;
        if (ref_point[5].x < (ref_point[3].x + ref_point[2].x) / 2) ref_point[5].x = (ref_point[3].x + ref_point[2].x) / 2;
        if (ref_point[5].y < 0) ref_point[5].y = 0;
        if (ref_point[5].z < ref_point[3].z) ref_point[5].z = ref_point[3].z;
        if (ref_point[5].z > (ref_point[3].z + ref_point[2].z) / 2) ref_point[5].z = (ref_point[3].z + ref_point[2].z) / 2;
        ref_point[4] = new THREE.Vector3(
          ref_point[3].x - (ref_point[5].x - ref_point[2].x),
          ref_point[5].y,
          ref_point[3].z - (ref_point[5].z - ref_point[2].z)
        );
        BUILDING.render_yagura(
          ref_point[2].clone(),
          ref_point[3].clone(),
          ref_point[4].clone(),
          ref_point[5].clone(),
          GEOMETRY
        );
        BUILDING.render_yane(
          ref_point[2].clone(),
          ref_point[3].clone(),
          ref_point[4].clone(),
          ref_point[5].clone(),
          GEOMETRY
        );
        BUILDING.remove_yagura_line();
        BUILDING.remove_all_yane_line();
        click_count++;
      }
    }
  }, false);

  function render_taruki_line() {
    var initA = ref_point[2].clone(), initB = ref_point[3].clone(), initC = ref_point[4].clone();
    var initD = ref_point[5].clone();

    var change_level = new THREE.Vector3(
      (initD.x - initB.x) / (yagura_steps - 1),
      (initD.y - initB.y) / yagura_steps,
      (initD.z - initB.z) / (yagura_steps - 1)
    )

    var A = new THREE.Vector3(
      initA.x + change_level.x,
      initA.y + 1 * change_level.y / 1,
      initA.z + change_level.z,
    )
    var B = new THREE.Vector3(
      initB.x - change_level.x,
      initB.y + 1 * change_level.y / 1,
      initB.z - change_level.z,
    )
    var C = new THREE.Vector3(
      initA.x - change_level.x,
      initA.y + 3 * change_level.y / 2,
      initA.z - change_level.z,
    )
    var D = new THREE.Vector3(
      initB.x + change_level.x,
      initB.y + 3 * change_level.y / 2,
      initB.z + change_level.z,
    )

    var taruki_interval_x = -1 * change_level.x / 8;
    if (taruki_interval_x == 0.0) taruki_interval_x = 0.1;
    var taruki_interval_z = -1 * change_level.z / 8;
    if (taruki_interval_z == 0.0) taruki_interval_z = 0.1;
    var init_taruki_num_x = Math.round((initB.x - initA.x) / taruki_interval_x);
    var init_taruki_num_z = Math.round((initB.z - initA.z) / taruki_interval_z);
    var sei = change_level.y / 2 / init_taruki_num_x * 10;

    for (let i=0; i<yagura_steps; i++) {
      var taruki_line_vertices = [];

      var taruki_num_x = Math.round((B.x - A.x) / taruki_interval_x);
      var taruki_num_z = Math.round((B.z - A.z) / taruki_interval_z);

      var yane_x = A.x;
      var yane_y = A.y;
      var yane_z = A.z;

      for (let direction=0; direction<4; direction++) {
        var taruki_num;
        if (direction % 2 == 0) {
          taruki_num = taruki_num_x;
        } else {
          taruki_num = taruki_num_z;
        }

        if (taruki_num > 100) taruki_num = 100;

        var count = 0;

        for (let j=0; j<taruki_num; j++) {
          if (j < 8) {
            yane_y = A.y + sei * (8-j-1) * (8-j) / 8 / 7;
          } else if (j > taruki_num - 8) {
            yane_y = A.y + sei * count * (count+1) / 8 / 7;
            // console.log(yane_y);
            count++;
          } else {
            yane_y = A.y;
          }
          yane_line_vertices[0].push(new THREE.Vector3(yane_x, yane_y, yane_z));

          if (direction==0) {
            yane_x += (B.x - A.x) / taruki_num;
          } else if (direction==1) {
            yane_z += (B.z - A.z) / taruki_num;
          } else if (direction==2) {
            yane_x -= (B.x - A.x) / taruki_num;
          } else if (direction==3) {
            yane_z -= (B.z - A.z) / taruki_num;
          }
        }
      }
    }
  }

  window.addEventListener( 'resize', onWindowResize, false );

  window.addEventListener( 'keydown', function ( event ) {

    switch ( event.keyCode ) {
      case 66: // B
        build_mode = !build_mode;

        console.log(build_mode);
        break;

      case 69: // E
        edit_mode = !edit_mode;

        console.log(edit_mode);
        break;

      case 81: // Q
        control.setSpace( control.space === "local" ? "world" : "local" );
        break;

      case 16: // Shift
        control.setTranslationSnap( 100 );
        control.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
        control.setScaleSnap( 0.25 );
        break;

      case 87: // W
        control.setMode( "translate" );
        break;

      case 69: // E
        control.setMode( "rotate" );
        break;

      case 82: // R
        control.setMode( "scale" );
        break;

      case 67: // C
        const position = currentCamera.position.clone();

        currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
        currentCamera.position.copy( position );

        orbit.object = currentCamera;
        control.camera = currentCamera;

        currentCamera.lookAt( orbit.target.x, orbit.target.y, orbit.target.z );
        onWindowResize();
        break;

      case 86: // V
        const randomFoV = Math.random() + 0.1;
        const randomZoom = Math.random() + 0.1;

        cameraPersp.fov = randomFoV * 160;
        cameraOrtho.bottom = - randomFoV * 500;
        cameraOrtho.top = randomFoV * 500;

        cameraPersp.zoom = randomZoom * 5;
        cameraOrtho.zoom = randomZoom * 5;
        onWindowResize();
        break;

      case 187:
      case 107: // +, =, num+
        control.setSize( control.size + 0.1 );
        break;

      case 189:
      case 109: // -, _, num-
        control.setSize( Math.max( control.size - 0.1, 0.1 ) );
        break;

      case 88: // X
        control.showX = ! control.showX;
        break;

      case 89: // Y
        control.showY = ! control.showY;
        break;

      case 90: // Z
        control.showZ = ! control.showZ;
        break;

      case 32: // Spacebar
        control.enabled = ! control.enabled;
        break;

    }

    if (48 < event.keyCode && event.keyCode < 58) {
      yagura_steps = event.keyCode - 48;
      console.log(yagura_steps)
      add_yagura_line();
    }

  } );

  window.addEventListener( 'keyup', function ( event ) {

    switch ( event.keyCode ) {

      case 16: // Shift
        control.setTranslationSnap( null );
        control.setRotationSnap( null );
        control.setScaleSnap( null );
        break;

    }

  } );

}

function onWindowResize() {

  const aspect = window.innerWidth / window.innerHeight;

  cameraPersp.aspect = aspect;
  cameraPersp.updateProjectionMatrix();

  cameraOrtho.left = cameraOrtho.bottom * aspect;
  cameraOrtho.right = cameraOrtho.top * aspect;
  cameraOrtho.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  render();

}

function render() {

  renderer.render( scene, currentCamera );

}

export { scene, ishigaki_steps, ishigaki_line, ishigaki_geometry, yagura_steps, yagura_line, yagura_geometry, yane_line, taruki_line, irimoya_line, irimoya_geometry, hafu_line };
