import * as THREE from '/build/three.module.js';

import { GUI } from '../controls/dat.gui.module.js';
import { Sky } from '../controls/Sky.js';
import { OBJExporter } from '../controls/OBJExporter.js';

import { OrbitControls } from '../controls/OrbitControls.js';
import { TransformControls } from '../controls/TransformControls.js';

import * as BUILDING from './building.js';

let cameraPersp, cameraOrtho, currentCamera;
let scene, renderer, control, orbit;

const LINE = 0, GEOMETRY = 1;

//石垣
var ishigaki_steps = 6;
var ishigaki_line = [];
var ishigaki_geometry = new THREE.Mesh();
// 櫓の補助線
var yagura_steps = 5;
var yagura_line = [];
var yagura_geometry = [];
// 屋根の補助線
var yane_line = [];
var yane_mesh = [];

// 屋根の大きさの比率
var yane_size_ratio = new THREE.Vector3(1.0, 1.0, 1.0);
// 屋根の上側/下側の位置
var yane_upper_position = 1.0;
var yane_lower_position = 1.0;

// 成イの大きさ
var sei_ratio = 1.0;

// 茅負
var kayaoi_mesh = [];
// 垂木の補助線
var taruki_line = [];
// 瓦棒
var kawaraboh_geometry = [];
// 入母屋破風の補助線
var irimoya_line = [];
var irimoya_geometry = [];
// 千鳥破風の補助線
var hafu_line = [];

function calc(x) {
	return x * 10;
}
class Sphere extends THREE.Mesh {
	constructor(x, y, z) {
		x = calc(x);
		const geometry = new THREE.SphereGeometry(x, y, z);
		const material = new THREE.MeshNormalMaterial();

		super(geometry, material);
	}
}


var ref_point = new Array(5); // クリックした座標の保持

init();
render();

const yaguraStepsInput = document.getElementById('yagura-steps');
const yaguraStepsCurrentValue = document.getElementById('yagura-steps-current-value');
const setYaguraStepsCurrentValue = (val) => {
	yaguraStepsCurrentValue.innerText = val;
}

const yaguraStepsOnChange = (e) => {
	setYaguraStepsCurrentValue(e.target.value);

	BUILDING.remove_yagura();
	BUILDING.remove_all_yane();

	yagura_steps = e.target.value;

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
}

const seiRatioInput = document.getElementById('sei-ratio');
const seiRatioCurrentValue = document.getElementById('sei-ratio-current-value');
const setSeiRatioCurrentValue = (val) => {
	seiRatioCurrentValue.innerText = val;
}

const seiRatioOnChange = (e) => {
	setSeiRatioCurrentValue(e.target.value);

	BUILDING.remove_all_yane();

	sei_ratio = e.target.value;

	BUILDING.render_yane(
		ref_point[2].clone(),
		ref_point[3].clone(),
		ref_point[4].clone(),
		ref_point[5].clone(),
		GEOMETRY
	);
}

const yaneSizeRatioXInput = document.getElementById('yane-size-ratio-x');
const yaneSizeRatioXCurrentValue = document.getElementById('yane-size-ratio-x-current-value');
const setYaneSizeRatioXCurrentValue = (val) => {
	yaneSizeRatioXCurrentValue.innerText = val;
}

const yaneSizeRatioXOnChange = (e) => {
	setYaneSizeRatioXCurrentValue(e.target.value);

	BUILDING.remove_all_yane();

	yane_size_ratio.x = e.target.value;

	BUILDING.render_yane(
		ref_point[2].clone(),
		ref_point[3].clone(),
		ref_point[4].clone(),
		ref_point[5].clone(),
		GEOMETRY
	);
}

const yaneSizeRatioZInput = document.getElementById('yane-size-ratio-z');
const yaneSizeRatioZCurrentValue = document.getElementById('yane-size-ratio-z-current-value');
const setYaneSizeRatioZCurrentValue = (val) => {
	yaneSizeRatioZCurrentValue.innerText = val;
}

const yaneSizeRatioZOnChange = (e) => {
	setYaneSizeRatioZCurrentValue(e.target.value);

	BUILDING.remove_all_yane();

	yane_size_ratio.z = e.target.value;

	BUILDING.render_yane(
		ref_point[2].clone(),
		ref_point[3].clone(),
		ref_point[4].clone(),
		ref_point[5].clone(),
		GEOMETRY
	);
}

const yaneUpperPositionInput = document.getElementById('yane-upper-position');
const yaneUpperPositionCurrentValue = document.getElementById('yane-upper-position-current-value');
const setYaneUpperPositionCurrentValue = (val) => {
	yaneUpperPositionCurrentValue.innerText = val;
}

const yaneUpperPositionOnChange = (e) => {
	setYaneUpperPositionCurrentValue(e.target.value);

	BUILDING.remove_all_yane();

	yane_upper_position = e.target.value;

	BUILDING.render_yane(
		ref_point[2].clone(),
		ref_point[3].clone(),
		ref_point[4].clone(),
		ref_point[5].clone(),
		GEOMETRY
	);
}

const yaneLowerPositionInput = document.getElementById('yane-lower-position');
const yaneLowerPositionCurrentValue = document.getElementById('yane-lower-position-current-value');
const setYaneLowerPositionCurrentValue = (val) => {
	yaneLowerPositionCurrentValue.innerText = val;
}

const yaneLowerPositionOnChange = (e) => {
	setYaneLowerPositionCurrentValue(e.target.value);

	BUILDING.remove_all_yane();

	yane_lower_position = e.target.value;

	BUILDING.render_yane(
		ref_point[2].clone(),
		ref_point[3].clone(),
		ref_point[4].clone(),
		ref_point[5].clone(),
		GEOMETRY
	);
}

window.onload = () => {
	yaguraStepsInput.value = yagura_steps;
	yaguraStepsInput.addEventListener('input', yaguraStepsOnChange);
	setYaguraStepsCurrentValue(yaguraStepsInput.value);

	seiRatioInput.value = sei_ratio;
	seiRatioInput.addEventListener('input', seiRatioOnChange);
	setSeiRatioCurrentValue(seiRatioInput.value);

	yaneSizeRatioXInput.value = yane_size_ratio.x;
	yaneSizeRatioXInput.addEventListener('input', yaneSizeRatioXOnChange);
	setYaneSizeRatioXCurrentValue(yaneSizeRatioXInput.value);

	yaneSizeRatioZInput.value = yane_size_ratio.z;
	yaneSizeRatioZInput.addEventListener('input', yaneSizeRatioZOnChange);
	setYaneSizeRatioZCurrentValue(yaneSizeRatioZInput.value);

	yaneUpperPositionInput.value = yane_upper_position;
	yaneUpperPositionInput.addEventListener('input', yaneUpperPositionOnChange);
	setYaneUpperPositionCurrentValue(yaneUpperPositionInput.value);

	yaneLowerPositionInput.value = yane_lower_position;
	yaneLowerPositionInput.addEventListener('input', yaneLowerPositionOnChange);
	setYaneLowerPositionCurrentValue(yaneLowerPositionInput.value);
}

function init() {

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	const aspect = window.innerWidth / window.innerHeight;

	cameraPersp = new THREE.PerspectiveCamera( 90, aspect, 0.01, 30000 );
	cameraOrtho = new THREE.OrthographicCamera( - 600 * aspect, 600 * aspect, 600, - 600, 0.01, 30000 );
	currentCamera = cameraPersp;

	currentCamera.position.set( 136, 300, 226 );
	// currentCamera.position.set( 153, 228, 322 );

	const mouse = new THREE.Vector2();

	scene = new THREE.Scene();
	scene.add( new THREE.GridHelper( 1000, 10, 0x888888, 0x444444 ) );
	const axes = new THREE.AxesHelper(300);
	scene.add(axes);

	var hemisphereLight = new THREE.HemisphereLight( 0xeeeeff,0x999999,1.0);
	hemisphereLight.position.set( 2000, 2000, 2000);
	scene.add( hemisphereLight );

	var hemisphereLightHelper = new THREE.HemisphereLightHelper( hemisphereLight);
	scene.add( hemisphereLightHelper);


	var sky = new Sky();
	sky.scale.setScalar( 450000 );
	scene.add( sky );

	var sun = new THREE.Vector3();

	const effectController = {
		turbidity: 10,
		rayleigh: 3,
		mieCoefficient: 0.035,
		mieDirectionalG: 0.9,
		inclination: 0.35, // elevation / inclination
		azimuth: 0.38, // Facing front,
		exposure: renderer.toneMappingExposure
	};

	function guiChanged() {

		const uniforms = sky.material.uniforms;
		uniforms[ "turbidity" ].value = effectController.turbidity;
		uniforms[ "rayleigh" ].value = effectController.rayleigh;
		uniforms[ "mieCoefficient" ].value = effectController.mieCoefficient;
		uniforms[ "mieDirectionalG" ].value = effectController.mieDirectionalG;

		const theta = Math.PI * ( effectController.inclination - 0.5 );
		const phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

		sun.x = Math.cos( phi );
		sun.y = Math.sin( phi ) * Math.sin( theta );
		sun.z = Math.sin( phi ) * Math.cos( theta );

		uniforms[ "sunPosition" ].value.copy( sun );

		renderer.toneMappingExposure = effectController.exposure;
		renderer.render( scene, currentCamera );

	}

	const gui = new GUI();

	gui.add( effectController, "turbidity", 0.0, 20.0, 0.1 ).onChange( guiChanged );
	gui.add( effectController, "rayleigh", 0.0, 4, 0.001 ).onChange( guiChanged );
	gui.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
	gui.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
	gui.add( effectController, "inclination", 0, 1, 0.0001 ).onChange( guiChanged );
	gui.add( effectController, "azimuth", 0, 1, 0.0001 ).onChange( guiChanged );
	gui.add( effectController, "exposure", 0, 1, 0.0001 ).onChange( guiChanged );

	guiChanged();

	const texture = new THREE.TextureLoader().load( 'textures/crate.gif', render );
	texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

	// const geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
	// const material = new THREE.MeshLambertMaterial( { map: texture, transparent: true } );

	// // 直方体を作成
	const material = new THREE.MeshNormalMaterial();
	const geometry = new THREE.SphereGeometry(3, 3, 3);
	const mesh = new THREE.Mesh(geometry, material);
	// // scene.add(mesh);

	orbit = new OrbitControls( currentCamera, renderer.domElement );
	orbit.target.set(0, 100, 0)
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

	var build_mode = false;
	var edit_mode = false;
	var click_count = 0; // クリック回数のカウント
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
			var A = ref_point[0].clone(), B = mouse_on_y0plane.clone();
			var rec_vertices = [];
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

			scene.remove(ishigaki_line);
			ishigaki_line = new BUILDING.Ishigaki(
				ref_point[0].clone(),
				ref_point[1].clone(),
				mouse_on_2pplane.clone()
			);
			ishigaki_line.generate(LINE)
			scene.add(ishigaki_line);

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

			// BUILDING.render_yagura(
			// 	ref_point[2].clone(),
			// 	ref_point[3].clone(),
			// 	0,
			// 	mouse_on_2pplane.clone(),
			// 	LINE
			// );
			if (yagura_line) {
				scene.remove(yagura_line);
			}
			yagura_line = new BUILDING.Yagura(
				ref_point[2].clone(),
				ref_point[3].clone(),
				mouse_on_2pplane.clone()
			)
			yagura_line.generate(LINE);
			scene.add(yagura_line);

			if (yane_line) {
				scene.remove(yane_line);
			}
			yane_line = new BUILDING.Yane(
				ref_point[2].clone(),
				ref_point[3].clone(),
				mouse_on_2pplane.clone()
			);
			yane_line.generate(LINE);
			scene.add(yane_line)
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
		// console.log(e.clientX, e.clientY, currentCamera.position);
		if (build_mode) {
			if (click_count == 0) {
				ref_point[0] = mouse_on_y0plane.clone();
				// ref_point[0] ... 最初に決めた点(地面上)
				click_count++;
				scene.add(rec_y0plane); // 補助線追加
				// console.log(ref_point[0]);
			} else if (click_count == 1) {
				ref_point[1] = mouse_on_y0plane.clone();
				// ref_point[1] ... 最初に決めた点と対角線上にある地面上の点

				click_count++;
			} else if (click_count == 2) {
				ref_point[3] = mouse_on_2pplane.clone();
				if (ref_point[3].y < 0) ref_point[3].y = 0;
				ref_point[2] = new THREE.Vector3(
					ref_point[1].x - (ref_point[3].x - ref_point[0].x),
					ref_point[3].y,
					ref_point[1].z - (ref_point[3].z - ref_point[0].z)
				);
				// ref_point[3] ... 0と1の点を通る、地面に垂直な平面上の点。石垣の上面の1と同じ側にある点
				// ref_point[2] ... 3と対角線上にある点。石垣の上面の0と同じ側にある点

	// クラス試作
	scene.remove(ishigaki_line)
	const ishigaki = new BUILDING.Ishigaki(
		ref_point[0].clone(),
		ref_point[1].clone(),
		ref_point[3].clone()
	);
	ishigaki.generate(GEOMETRY);
	scene.add(ishigaki);
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
	const yagura = new BUILDING.Yagura(
		ref_point[2].clone(),
		ref_point[3].clone(),
		ref_point[5].clone()
	);
	yagura.generate(GEOMETRY);
	scene.add(yagura);

	scene.remove(yane_line)
			const yane = new BUILDING.Yane(
				ref_point[2].clone(),
				ref_point[3].clone(),
				mouse_on_2pplane.clone()
			);
			yane.generate(GEOMETRY);
			scene.add(yane)
				scene.remove(yagura_line);
				// BUILDING.remove_yagura_line();
				BUILDING.remove_all_yane_line();
				click_count++;
			} else if (click_count == 4) {
				click_count++;
			} else if (click_count == 5) {
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

	function calc_3points_to_camera(P1, P2) {
		var P11 = currentCamera.getFocalLength(), P22 = P11, P13 = window.innerWidth / 2.0, P23 = window.innerHeight / 2.0;
		var P = new THREE.Matrix4();
		P.set(P11, 0, 0, 0,
			0, P22, 0, 0,
			P13, P13, 1, 0,
			0, 0, 0, 1
		);
		var m = [];
		m[P1[0]] = new THREE.Vector2(778, 325);
		m[P1[1]] = new THREE.Vector2(760, 622);
		m[P1[2]] = new THREE.Vector2(307, 414);
		m[P1[3]] = new THREE.Vector2(533, 282);

		var M = [], r = 400;
		M[P2[0]] = new THREE.Vector3(-1 * r / 2.0, r / 2.0, 0);
		M[P2[1]] = new THREE.Vector3(r / 2.0, r / 2.0, 0);
		M[P2[2]] = new THREE.Vector3(r / 2.0, -1 * r / 2.0, 0);
		M[P2[3]] = new THREE.Vector3(-1 * r / 2.0, -1 * r / 2.0, 0);

		var a = [], b = [], c = [], n = [];
		for (let i = 0; i < 4; i++) {
			var ii = (i == 3) ? 0 : i+1;
			a[i] = m[ii].y - m[i].y;
			b[i] = m[i].x - m[ii].x;
			c[i] = (m[i].y - m[ii].y) * m[i].x + (m[ii].x - m[i].x) * m[i].y;

			n[i] = new THREE.Vector3(a[i] * P11, a[i] * 0 + b[i] * P22, a[i] * P13 + b[i] * P23 + c[i]);
		}

		var u0 = new THREE.Vector3().crossVectors(n[0], n[2]).normalize();
		var u1 = new THREE.Vector3().crossVectors(n[1], n[3]).normalize();
		var u2 = new THREE.Vector3().crossVectors(u1, u0).normalize();
		var R = new THREE.Matrix3();
		R.set(u0.x, u0.y, u0.z,
			u1.x, u1.y, u1.z,
			u2.x, u2.y, u2.z);

		var W = [];
		var A = [], b = [];
		for (let i = 0; i < 4; i++) {
			W[i] = M[i].clone().applyMatrix3(R);

			A.push([P11, 0, P13 - m[i].x]);
			A.push([0, P22, P23 - m[i].y]);
			b.push(W[i].z * m[i].x - P11 * W[i].x - 0 * W[i].y - P13 * W[i].z);
			b.push(W[i].z * m[i].y - P22 * W[i].y - P23 * W[i].z);
		}
		var T = math.multiply(math.multiply(math.inv(math.multiply(math.transpose(A), A)), math.transpose(A)), b);
	}

	function Per() {
		let a = [0,1,2,3];
		let ainit = [];
		let a2, a3, a4;
		for (let i = 0; i < a.length; i++) {
			a2 = a.slice(0);
			a2.splice(i, 1);
			for (let j = 0; j < a2.length; j++) {
				a3 = a2.slice(0);
				a3.splice(j, 1);
				for (let k = 0; k < a3.length; k++) {
					a4 = a3.slice(0);
					a4.splice(k, 1);
					for (let l = 0; l < a4.length; l++) {
						ainit.push([a[i]].concat([a2[j]]).concat([a3[k]]).concat([a4[l]]));
					}
				}
			}
		}
		return ainit;
	}

	function all() {
		var P1 = Per(), P2 = P1;
		for (let i = 0; i < P1.length; i++) {
			for (let j = 0; j < P2.length; j++) {
				calc_3points_to_camera(P1[i], P2[j]);
			}
		}
	}

	window.addEventListener( 'resize', onWindowResize, false );

	window.addEventListener( 'keydown', function ( event ) {

		switch ( event.keyCode ) {
			case 66: // B
				build_mode = !build_mode;

				console.log(build_mode);
				// console.log(currentCamera.position)
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

			case 80: // P
				exportToObj();
				// console.log(ref_point);
				break;

			case 65: // A
				// calc_3points_to_camera();
				all()
				break;
		}

		function exportToObj() {

			const exporter = new OBJExporter();
			scene.remove(mesh);
			scene.remove(sky);
			const result = exporter.parse( scene );
			console.log(result);

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

export { scene, LINE, GEOMETRY, ishigaki_steps, ishigaki_line, ishigaki_geometry, yagura_steps, yagura_line, yagura_geometry, yane_line, yane_mesh, yane_size_ratio, yane_upper_position, yane_lower_position, sei_ratio, kayaoi_mesh, taruki_line, irimoya_line, irimoya_geometry, hafu_line };
