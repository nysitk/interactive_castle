import * as THREE from '/build/three.module.js';

import { scene, LINE, GEOMETRY, ishigaki_steps, ishigaki_line, ishigaki_geometry, yagura_steps, yagura_line, yagura_geometry, yane_line, yane_mesh, yane_size_ratio, yane_upper_position, yane_lower_position, sei_ratio, kayaoi_mesh, taruki_line, irimoya_line, irimoya_geometry, hafu_line } from './main.js';

function create_line_box(A, B, C, D) {
	var geometry = new THREE.Geometry();

	geometry.vertices.push(new THREE.Vector3(A.x, A.y, A.z));
	geometry.vertices.push(new THREE.Vector3(C.x, C.y, C.z));
	geometry.vertices.push(new THREE.Vector3(A.x, A.y, B.z));
	geometry.vertices.push(new THREE.Vector3(C.x, C.y, D.z));
	geometry.vertices.push(new THREE.Vector3(B.x, B.y, B.z));
	geometry.vertices.push(new THREE.Vector3(D.x, D.y, D.z));
	geometry.vertices.push(new THREE.Vector3(B.x, B.y, A.z));
	geometry.vertices.push(new THREE.Vector3(D.x, D.y, C.z));
	geometry.vertices.push(new THREE.Vector3(C.x, C.y, C.z));
	geometry.vertices.push(new THREE.Vector3(D.x, C.y, C.z));
	geometry.vertices.push(new THREE.Vector3(D.x, C.y, D.z));
	geometry.vertices.push(new THREE.Vector3(C.x, C.y, D.z));
	geometry.vertices.push(new THREE.Vector3(C.x, C.y, C.z));

	// for (let i=0; i<5; i++) {
	// 	geometry.vertices = line_vertices[i];
	// 	geometry.verticesNeedUpdate = true;
	// 	geometry.elementNeedUpdate = true;
	// 	geometry.computeFaceNormals();
	// }
	return geometry;
}

function create_box(A, B, C, D) {
	var geometry = new THREE.Geometry();
	// 下側の四角
	geometry.vertices.push(new THREE.Vector3(A.x, A.y, A.z)); //V0
	geometry.vertices.push(new THREE.Vector3(B.x, A.y, A.z)); //V1
	geometry.vertices.push(new THREE.Vector3(B.x, A.y, B.z)); //V2
	geometry.vertices.push(new THREE.Vector3(A.x, A.y, B.z)); //V3
	// 上側の四角
	geometry.vertices.push(new THREE.Vector3(C.x, C.y, C.z)); //V4
	geometry.vertices.push(new THREE.Vector3(D.x, C.y, C.z)); //V5
	geometry.vertices.push(new THREE.Vector3(D.x, C.y, D.z)); //V6
	geometry.vertices.push(new THREE.Vector3(C.x, C.y, D.z)); //V7

	//    V7-------V6
	//   / \       |\
	//  /  V4-------V5
	// V3--/-------V2 \
	//  \ /          \ \
	//   V0-----------V1

	geometry.faces.push(new THREE.Face3( 0, 3, 1));
	geometry.faces.push(new THREE.Face3( 1, 3, 2));
	geometry.faces.push(new THREE.Face3( 0, 1, 4));
	geometry.faces.push(new THREE.Face3( 1, 5, 4));
	geometry.faces.push(new THREE.Face3( 1, 2, 5));
	geometry.faces.push(new THREE.Face3( 2, 6, 5));
	geometry.faces.push(new THREE.Face3( 2, 3, 6));
	geometry.faces.push(new THREE.Face3( 3, 7, 6));
	geometry.faces.push(new THREE.Face3( 3, 0, 7));
	geometry.faces.push(new THREE.Face3( 0, 4, 7));
	geometry.faces.push(new THREE.Face3( 4, 5, 6));
	geometry.faces.push(new THREE.Face3( 4, 6, 7));

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	return geometry;
}

class Ishigaki extends THREE.Group {
	constructor(P1, P2, P3) {
		super();

		this.A = P1.clone();
		this.B = P2.clone();
		this.D = P3.clone();
		this.C = new THREE.Vector3(
			this.B.x - (this.D.x - this.A.x),
			this.D.y,
			this.B.z - (this.D.z - this.A.z)
		);

		this.h = this.C.y - this.A.y;
		this.b_x = (this.A.x - this.C.x) * 50/44;
		this.b_z = (this.A.z - this.C.z) * 50/44;
		this.d_x = (this.A.x - this.C.x) * 6/44;
		this.d_z = (this.A.z - this.C.z) * 6/44;

		this.delta_x = ishigaki_steps / (ishigaki_steps - 1) * this.d_x / this.h;
		this.delta_z = ishigaki_steps / (ishigaki_steps - 1) * this.d_z / this.h;
	}

	generate(MODE) {
		var tmpA = this.A.clone(), tmpB = this.B.clone(), tmpC = this.A.clone(), tmpD = this.B.clone();

		for (let i = 0; i < ishigaki_steps; i++) {
			tmpA = tmpC.clone();
			tmpB = tmpD.clone();
			// change_level(axis, sub) は軸方向axis、i段目を指すsubを引数として、各段ごとの差分を算出する。
			tmpC.x -= this.change_level('x', (ishigaki_steps-1)-i);
			tmpC.y += this.change_level('y', (ishigaki_steps-1)-i);
			tmpC.z -= this.change_level('z', (ishigaki_steps-1)-i);
			tmpD.x += this.change_level('x', (ishigaki_steps-1)-i);
			tmpD.y += this.change_level('y', (ishigaki_steps-1)-i);
			tmpD.z += this.change_level('z', (ishigaki_steps-1)-i);

			if (MODE==LINE) {
				const material = new THREE.LineBasicMaterial({color: 0xFFFFFF})
				const geometry = create_line_box(tmpA, tmpB, tmpC, tmpD);

				const mesh = new THREE.Line(geometry, material);

				this.add(mesh);
			} else if (MODE==GEOMETRY) {
				const material = new THREE.MeshLambertMaterial({color: 0xB69F84});
				const geometry = create_box(tmpA, tmpB, tmpC, tmpD);

				const mesh = new THREE.Mesh(geometry, material);

				this.add(mesh);
			}
		}

	}


	r(axis, sub) {
		let n = ishigaki_steps;

		let r = (axis == 'x') ? this.b_x / this.h : this.b_z / this.h;
		let delta = (axis == 'x') ? this.delta_x : this.delta_z;

		if (sub != n - 1) {
			for (let i = (n-1); i > sub; i--) {
				if (i != 0) r -= delta / i;
			}
		}
		return r;
	}

	change_level(axis, sub) {
		// y軸方向であればそのまま等分した量だけ増加
		// x、z軸方向であればrを計算し、適用して返す
		if (axis == 'y') {
			return this.h / ishigaki_steps;
		} else {
			return this.r(axis, sub) * this.h / ishigaki_steps;
		}
	}
}

class Yagura extends THREE.Group {
	constructor(R3, R4, R6) {
		super();

		this.A = R3.clone();
		this.B = R4.clone();
		this.D = R6.clone();

		this.change_level = new THREE.Vector3(
			(this.D.x - this.B.x) / (yagura_steps - 1),
			(this.D.y - this.B.y) / yagura_steps,
			(this.D.z - this.B.z) / (yagura_steps - 1)
		)
	}

	generate(MODE) {
		var tmpA = this.A.clone();
		var tmpB = this.B.clone();
		var tmpC = new THREE.Vector3(
			this.A.x,
			this.A.y + this.change_level.y,
			this.A.z,
		)
		var tmpD = new THREE.Vector3(
			this.B.x,
			this.B.y + this.change_level.y,
			this.B.z,
		)

		for (let i = 0; i < yagura_steps; i++) {

			if (MODE==LINE) {
				const material = new THREE.LineBasicMaterial({color: 0xFFFFFF})
				const geometry = create_line_box(tmpA, tmpB, tmpC, tmpD);

				const mesh = new THREE.Line(geometry, material);

				this.add(mesh);
			} else if (MODE==GEOMETRY) {
				const material = new THREE.MeshLambertMaterial({color: 0xCBC9D4});
				const geometry = create_box(tmpA, tmpB, tmpC, tmpD);

				const mesh = new THREE.Mesh(geometry, material);

				this.add(mesh);
			}

			tmpA.x -= this.change_level.x;
			tmpA.y += this.change_level.y;
			tmpA.z -= this.change_level.z;
			tmpB.x += this.change_level.x;
			tmpB.y += this.change_level.y;
			tmpB.z += this.change_level.z;
			tmpC.x -= this.change_level.x;
			tmpC.y += this.change_level.y;
			tmpC.z -= this.change_level.z;
			tmpD.x += this.change_level.x;
			tmpD.y += this.change_level.y;
			tmpD.z += this.change_level.z;
		}
	}
}

class Yane extends Yagura {
	constructor(R3, R4, R6) {
		super(R3, R4, R6);
	}

	generate(MODE) {

		var tmpA = new THREE.Vector3(
			this.A.x + this.change_level.x * yane_size_ratio.x,
			this.A.y + this.change_level.y * 5 / 6 * yane_lower_position,
			this.A.z + this.change_level.z * yane_size_ratio.z,
		)
		var tmpB = new THREE.Vector3(
			this.B.x - this.change_level.x * yane_size_ratio.x,
			this.B.y + this.change_level.y * 5 / 6 * yane_lower_position,
			this.B.z - this.change_level.z * yane_size_ratio.z,
		)
		var tmpC = new THREE.Vector3(
			this.A.x - this.change_level.x,
			this.A.y + this.change_level.y * (5/6 * yane_upper_position + 3/6),
			this.A.z - this.change_level.z,
		)
		var tmpD = new THREE.Vector3(
			this.B.x + this.change_level.x,
			this.B.y + this.change_level.y * (5/6 * yane_upper_position + 3/6),
			this.B.z + this.change_level.z,
		)

		for (let i = 0; i < yagura_steps; i++) {
			const surrounding_yane = new SurroundingYane(tmpA, tmpB, tmpC, tmpD);

			surrounding_yane.generate(MODE);

			// 場所に応じて屋根を移動・回転
			surrounding_yane.position.set(tmpA.x, tmpA.y, tmpA.z);
			this.add(surrounding_yane)

			tmpA.x -= this.change_level.x;
			tmpA.y += this.change_level.y;
			tmpA.z -= this.change_level.z;
			tmpB.x += this.change_level.x;
			tmpB.y += this.change_level.y;
			tmpB.z += this.change_level.z;
			tmpC.x -= this.change_level.x;
			tmpC.y += this.change_level.y;
			tmpC.z -= this.change_level.z;
			tmpD.x += this.change_level.x;
			tmpD.y += this.change_level.y;
			tmpD.z += this.change_level.z;

		}
	}
}

class SurroundingYane extends THREE.Group {
	constructor(A, B, C, D, sei) {
		// 入力は4点
		//    -------B
		//   /    D /
		//  / C    /
		// A-------
		super();

		// 点Aを原点として考える
		this.A = new THREE.Vector3(0, 0, 0);
		this.B = new THREE.Vector3().subVectors(B, A);
		this.C = new THREE.Vector3().subVectors(C, A);
		this.D = new THREE.Vector3().subVectors(D, A);

		this.lower = [
			this.A.clone(),
			new THREE.Vector3(this.B.x, this.A.y, this.A.z),
			this.B.clone(),
			new THREE.Vector3(this.A.x, this.A.y, this.B.z)
		]

		this.upper = [
			this.C.clone(),
			new THREE.Vector3(this.D.x, this.C.y, this.C.z),
			this.D.clone(),
			new THREE.Vector3(this.C.x, this.C.y, this.D.z)
		]

		var taruki_interval = (this.B.x - this.D.x) / 6;
		if (taruki_interval == 0.0) taruki_interval = 0.1;
		this.sei = taruki_interval * sei_ratio;

	}

	generate(MODE) {
		// 4方向分の屋根を生成
		for (let d=0; d<4; d++) {
			var dd = d == 3 ? 0 : d + 1;
			// if (d != 2) continue;
			const each_yane = new YaneComponent(this.lower[d], this.lower[dd], this.upper[d], this.upper[dd], this.sei, d);
			each_yane.generate_body(MODE);
			each_yane.generate_kawaraboh(MODE);
			each_yane.generate_kayaoi(MODE);

			each_yane.rotation.y = Math.PI / 2 * d;
			each_yane.position.set(this.lower[d].x, this.lower[d].y, this.lower[d].z)
			this.add(each_yane);
		}
	}
}

class YaneComponent extends THREE.Group {
	constructor(A, B, C, D, sei, d) {
		super();
		// 入力は4点と方向
		//   C---D
		//  /     \   
		// A-------B  --> x-axis

		// ^ z      2
		// |--> x  3 1 d:direction
		//          0

		var axis = new THREE.Vector3( 0, 1, 0 );
		var angle = Math.PI / 2 * -d;

		// Aを原点とする
		this.A = new THREE.Vector3(0, 0, 0);
		this.B = new THREE.Vector3().subVectors(B, A).applyAxisAngle( axis, angle );
		this.C = new THREE.Vector3().subVectors(C, A).applyAxisAngle( axis, angle );
		this.D = new THREE.Vector3().subVectors(D, A).applyAxisAngle( axis, angle );

		this.sei = sei;

		this.taruki_interval = (this.B.x - this.D.x) / 6;
		if (this.taruki_interval == 0.0) this.taruki_interval = 0.1;
		this.taruki_num = Math.ceil((this.B.x - this.A.x) / this.taruki_interval)+1;
		if (this.taruki_num > 100) this.taruki_num = 100;


		this.lower_vertices = [];
		this.upper_vertices = [];

		var bottom = new THREE.Vector3(0, 0, 0);
		var count = 0;
		for (let i = 0; i <= this.taruki_num; i++) {
			if (i < 8) {
				count = 7 - i;
			} else if (i > this.taruki_num - 8) {
				count = i - (this.taruki_num - 7);
			} else {
				count = 0;
			}

			bottom.y = this.sei * count * (count+1) / 8 / 7;
			this.lower_vertices.push(bottom.clone());

			var grad = this.C.z / this.C.x;
			var change_level = this.C.z;
			var chanz = (change_level < grad * (bottom.x)) ? grad * (bottom.x) : change_level;
			if (chanz == change_level) {
				grad = this.C.z / -(this.D.x - this.B.x);
				chanz = (change_level < grad * (this.B.x - bottom.x)) ? grad * (this.B.x - bottom.x) : change_level;
			}
			this.upper_vertices.push(new THREE.Vector3(bottom.x, bottom.y + this.C.y * chanz / change_level, bottom.z + chanz));

			bottom.x += (this.B.x - this.A.x) / this.taruki_num;
		}
	}

	generate_body(MODE) {

		if (MODE==LINE) {

			const material = new THREE.LineBasicMaterial({color: 0xFFFFFF});

			const upper_geometry = new THREE.Geometry();
			const lower_geometry = new THREE.Geometry();
			for (let i = 0; i < this.upper_vertices.length; i++) {
				upper_geometry.vertices.push(this.upper_vertices[i]);
				lower_geometry.vertices.push(this.lower_vertices[i]);
			}
			this.upper_line = new THREE.Line(upper_geometry, material);
			this.add(this.upper_line);
			this.lower_line = new THREE.Line(lower_geometry, material);
			this.add(this.lower_line);

		} else if (MODE==GEOMETRY) {

			const geometry = new THREE.Geometry();

			for (let i = 0; i < this.upper_vertices.length; i++) {
				geometry.vertices.push(this.upper_vertices[i]);
				geometry.vertices.push(this.lower_vertices[i]);
			}

			for (let j=0; j < geometry.vertices.length - 1; j=j+2) {
				if (j+2 > geometry.vertices.length - 1) break;
				geometry.faces.push(new THREE.Face3(j, j+2, j+3));
				geometry.faces.push(new THREE.Face3(j, j+3, j+1));
				geometry.faces.push(new THREE.Face3(j, j+3, j+2));
				geometry.faces.push(new THREE.Face3(j, j+1, j+3));
			}

			geometry.computeFaceNormals();
			geometry.computeVertexNormals();

			var material = new THREE.MeshLambertMaterial({color: 0x444444});
			this.body = new THREE.Mesh(geometry, material);
			this.add(this.body);
		}

	}

	generate_kawaraboh(MODE) {
		if (MODE==LINE) {
			this.kawaraboh_lines = [];
			for (let i = 0; i < this.upper_vertices.length; i++) {
				const geometry = new THREE.Geometry();
				const material = new THREE.LineBasicMaterial({color: 0xFFFFFF});
				geometry.vertices.push(this.upper_vertices[i]);
				geometry.vertices.push(this.lower_vertices[i]);
				const kawaraboh_line = new THREE.Line(geometry, material);
				this.add(kawaraboh_line);
				this.kawaraboh_lines.push(kawaraboh_line);
			}
		} else if (MODE==GEOMETRY) {
			this.kawarabohs = [];
			const kawaraboh_thick = this.taruki_interval / 8.0;

			for (let i = 0; i < this.upper_vertices.length; i++) {
				var u = this.upper_vertices[i];
				var l = this.lower_vertices[i];
				const length = u.distanceTo(l);

				const geometry = create_box(
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(kawaraboh_thick, 0, length),
					new THREE.Vector3(0, kawaraboh_thick, 0),
					new THREE.Vector3(kawaraboh_thick, kawaraboh_thick, length)
				)
				console.log(kawaraboh_thick, length)
				const material = new THREE.MeshLambertMaterial({color: 0x555555, side: THREE.DoubleSide});

				const mesh = new THREE.Mesh(geometry, material);

				mesh.rotation.x = Math.PI - Math.atan((u.y-l.y)/u.z);
				mesh.position.set(l.x, l.y + kawaraboh_thick, l.z)

				this.add(mesh);
			}
		}
	}

	generate_taruki(MODE) {
		if (MODE==LINE) {
			this.taruki_lines = [];
			for (let i = 0; i < this.upper_vertices.length; i++) {
				const geometry = new THREE.Geometry();
				const material = new THREE.LineBasicMaterial({color: 0xFFFFFF});
				geometry.vertices.push(this.upper_vertices[i]);
				geometry.vertices.push(this.lower_vertices[i]);
				// const kawaraboh_line = new THREE.Line(geometry, material);
				// this.add(kawaraboh_line);
				// this.kawaraboh_lines.push(kawaraboh_line);
			}
		} else if (MODE==GEOMETRY) {
		}

	}

	generate_kayaoi(MODE) {
		if (MODE==GEOMETRY) {
			const geometry = new THREE.Geometry();
			const kayaoi_thick = this.taruki_interval / 2.0;
			for (let i = 0; i < this.lower_vertices.length; i++) {
				const l = this.lower_vertices[i]
				geometry.vertices.push(l);
				geometry.vertices.push(new THREE.Vector3(l.x, l.y, l.z - kayaoi_thick));
				geometry.vertices.push(new THREE.Vector3(l.x, l.y - kayaoi_thick, l.z - kayaoi_thick));
				geometry.vertices.push(new THREE.Vector3(l.x, l.y - kayaoi_thick, l.z));
			}

			geometry.faces.push(new THREE.Face3(0, 1, 3));
			geometry.faces.push(new THREE.Face3(1, 2, 3));
			for (let j=0; j+1 < geometry.vertices.length / 4; j++) {
				// if (j+8 > kayaoi_geometry.vertices.length - 1) break;
				for (let k=0; k<4; k++) {
					if (k==3) {
						geometry.faces.push(new THREE.Face3(4*j+k, 4*j+k+4, 4*j+k+1));
						geometry.faces.push(new THREE.Face3(4*j+k, 4*j+k+1, 4*j+k-3));
					} else {
						geometry.faces.push(new THREE.Face3(4*j+k, 4*j+k+4, 4*j+k+5));
						geometry.faces.push(new THREE.Face3(4*j+k, 4*j+k+5, 4*j+k+1));
					}
				}
			}
			let l = geometry.vertices.length - 4;
			// console.log(l+4);
			geometry.faces.push(new THREE.Face3(l+0, l+3, l+1));
			geometry.faces.push(new THREE.Face3(l+1, l+3, l+2));

			geometry.computeFaceNormals();
			geometry.computeVertexNormals();

			var material = new THREE.MeshLambertMaterial({color: 0x999999});
			this.kayaoi = new THREE.Mesh(geometry, material);
			this.add(this.kayaoi);
		}
	}
}

class EachYane extends THREE.Line {
}

class EachYaneGeometry extends THREE.Geometry {
	constructor() {
		super();
	}
}

function add_yagura_line() {
	yagura_line.forEach(function(i) {
		scene.remove(i);
	})
	yagura_line.splice(0);
	for (let i=0; i<yagura_steps*6; i++) {
		yagura_line[i] = (new THREE.Line( new THREE.Geometry, new THREE.LineBasicMaterial({color: 0xFFFFFF})));
		scene.add(yagura_line[i]);
	}
}

function remove_yagura_line() {
	yagura_line.forEach(function(i) {
		scene.remove(i);
	})
}

function add_yane_line() {
	yane_line.forEach(function(i) {
		scene.remove(i);
	})
	yane_line.splice(0);
	for (let i=0; i<yagura_steps*6; i++) {
		yane_line[i] = (new THREE.Line( new THREE.Geometry, new THREE.LineBasicMaterial({color: 0x0000FF})));
		scene.add(yane_line[i]);
	}
}

function remove_yane_line() {
	// yane_line.forEach(function(i) {
	// 	scene.remove(i);
	// })
}

function remove_all_yane_line() {
	remove_yane_line();
	remove_taruki_line();
	remove_irimoya_line();
	remove_hafu_line();
}

function add_taruki_line(taruki_num) {
	for (let i=0; i<taruki_num; i++) {
		taruki_line.push(new THREE.Line( new THREE.Geometry, new THREE.LineBasicMaterial({color: 0x0000FF})));
		scene.add(taruki_line[taruki_line.length - 1]);
	}
}

function remove_taruki_line() {
	taruki_line.forEach(function(i) {
		scene.remove(i);
	})
	taruki_line.splice(0);
}

function remove_irimoya_line() {
	irimoya_line.forEach(function(it) {
		scene.remove(it);
	})
	irimoya_line.splice(0);
}

function remove_hafu_line() {
	hafu_line.forEach(function(it) {
		scene.remove(it);
	});
	hafu_line.splice(0);
}

function remove_yagura() {
	yagura_geometry.forEach(function(i) {
		scene.remove(i);
	})
	yagura_geometry.splice(0);
}

function remove_yane() {
	yane_mesh.forEach(function(i) {
		i.forEach(function(j) {
			scene.remove(j);
		})
	})
	yane_mesh.splice(0);
}

function remove_irimoya() {
	irimoya_geometry.forEach(function(i) {
		scene.remove(i);
	})
	irimoya_geometry.splice(0);
}

function remove_all_yane() {
	remove_yane();
	remove_irimoya();
}

export { Ishigaki, Yagura, Yane, add_yagura_line, remove_yagura_line, add_yane_line, remove_yane_line, remove_all_yane_line, add_taruki_line, remove_taruki_line, remove_irimoya_line, remove_hafu_line, remove_yagura, remove_yane, remove_all_yane };