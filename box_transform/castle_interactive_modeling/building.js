import * as THREE from '/build/three.module.js';

import { scene, ishigaki_steps, ishigaki_line, ishigaki_geometry, yagura_steps, yagura_line, yagura_geometry, yane_line, taruki_line, irimoya_line, irimoya_geometry, hafu_line } from './main.js';

function render_ishigaki(initA, initB, initC, initD, mode) {
  // var initA = ref_point[0].clone(), initB = ref_point[1].clone(), initC = ref_point[2].clone();
  // var initD = ref_point[3].clone();

  if (mode==0) {
    if (initD.y < 0) initD.y = 0;
    var initC = new THREE.Vector3(initB.x - (initD.x - initA.x), initD.y, initB.z - (initD.z - initA.z));
  }

  var A = initA.clone(), B = initB.clone();
  var C = A.clone(), D = B.clone();

  var h = initC.y - initA.y;
  var b_x = (initA.x - initC.x) * 50/44;
  var b_z = (initA.z - initC.z) * 50/44;
  var d_x = (initA.x - initC.x) * 6/44;
  var d_z = (initA.z - initC.z) * 6/44;

  var delta_x = ishigaki_steps / (ishigaki_steps - 1) * d_x / h;
  var delta_z = ishigaki_steps / (ishigaki_steps - 1) * d_z / h;

  function r(axis, sub) {
    let n = ishigaki_steps;

    if (axis == 0) {
      var r = b_x / h;
      if (sub == n - 1) {
        return r;
      } else {
        for (let i = (n-1); i > sub; i--) {
          if (i != 0) r -= delta_x / i;
        }
        return r;
      }
    }

    if (axis == 2) {
      var r = b_z / h;
      if (sub == n - 1) {
        return r;
      } else {
        for (let i = (n-1); i > sub; i--) {
          if (i != 0) r -= delta_z / i;
        }
        return r;
      }
    }
  }

  function change_level(axis, sub) {
    if (axis == 1) {
      return h / ishigaki_steps;
    } else {
      return r(axis, sub) * h / ishigaki_steps;
    }
  }

  for (let i = 0; i < ishigaki_steps; i++) {

    C.x -= change_level(0, (ishigaki_steps-1)-i);
    C.y += change_level(1, (ishigaki_steps-1)-i);
    C.z -= change_level(2, (ishigaki_steps-1)-i);
    D.x += change_level(0, (ishigaki_steps-1)-i);
    D.y += change_level(1, (ishigaki_steps-1)-i);
    D.z += change_level(2, (ishigaki_steps-1)-i);

    if (mode==0) {
      var ishigaki_line_vertices = [];
      ishigaki_line_vertices[0] = [];
      ishigaki_line_vertices[0].push(new THREE.Vector3(A.x, A.y, A.z));
      ishigaki_line_vertices[0].push(new THREE.Vector3(C.x, C.y, C.z));
      ishigaki_line_vertices[1] = [];
      ishigaki_line_vertices[1].push(new THREE.Vector3(A.x, A.y, B.z));
      ishigaki_line_vertices[1].push(new THREE.Vector3(C.x, C.y, D.z));
      ishigaki_line_vertices[2] = [];
      ishigaki_line_vertices[2].push(new THREE.Vector3(B.x, B.y, B.z));
      ishigaki_line_vertices[2].push(new THREE.Vector3(D.x, D.y, D.z));
      ishigaki_line_vertices[3] = [];
      ishigaki_line_vertices[3].push(new THREE.Vector3(B.x, B.y, A.z));
      ishigaki_line_vertices[3].push(new THREE.Vector3(D.x, D.y, C.z));
      ishigaki_line_vertices[4] = [];
      ishigaki_line_vertices[4].push(new THREE.Vector3(C.x, C.y, C.z));
      ishigaki_line_vertices[4].push(new THREE.Vector3(D.x, C.y, C.z));
      ishigaki_line_vertices[4].push(new THREE.Vector3(D.x, C.y, D.z));
      ishigaki_line_vertices[4].push(new THREE.Vector3(C.x, C.y, D.z));
      ishigaki_line_vertices[4].push(new THREE.Vector3(C.x, C.y, C.z));
      // ishigaki_line_vertices[4].push(new THREE.Vector3(D.x, C.y, D.z));

      // console.log(A);

      for (let j=0; j<5; j++) {
        let num = i * 5 + j;
        ishigaki_line[num].geometry.vertices = ishigaki_line_vertices[j];
        ishigaki_line[num].geometry.verticesNeedUpdate = true;
        ishigaki_line[num].geometry.elementNeedUpdate = true;
        ishigaki_line[num].geometry.computeFaceNormals();
      }
    } else if (mode==1) {
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
       console.log(geometry.vertices)

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

      var material = new THREE.MeshNormalMaterial();
      //var material = new THREE.MeshPhongMaterial({color: 0x88FFFF});
      var material = new THREE.MeshBasicMaterial({color: 0xB69F84});
      ishigaki_geometry[i] = new THREE.Mesh(geometry, material);
      scene.add(ishigaki_geometry[i]);
    }

    A = C.clone();
    B = D.clone();
  }
}

function render_yagura(initA, initB, initC, initD, mode) {
  // var initA = ref_point[2].clone(), initB = ref_point[3].clone(), initC = ref_point[4].clone();
  // var initD = ref_point[5].clone();

  if (mode==0) {
    if (initD.x > initB.x) initD.x = initB.x;
    if (initD.x < (initB.x + initA.x) / 2) initD.x = (initB.x + initA.x) / 2;
    if (initD.y < initB.y) initD.y = initB.y;
    if (initD.z < initB.z) initD.z = initB.z;
    if (initD.z > (initB.z + initA.z) / 2) initD.z = (initB.z + initA.z) / 2;
    initC = new THREE.Vector3(initB.x - (initD.x - initA.x), initD.y, initB.z - (initD.z - initA.z));
  }

  var change_level = new THREE.Vector3(
    (initD.x - initB.x) / (yagura_steps - 1),
    (initD.y - initB.y) / yagura_steps,
    (initD.z - initB.z) / (yagura_steps - 1)
  )

  var A = initA.clone();
  var B = initB.clone();
  var C = new THREE.Vector3(
    initA.x,
    initA.y + change_level.y,
    initA.z,
  )
  var D = new THREE.Vector3(
    initB.x,
    initB.y + change_level.y,
    initB.z,
  )

  for (let i=0; i<yagura_steps; i++) {
    if (mode==0) {
      var yagura_line_vertices = [];
      yagura_line_vertices[0] = [];
      yagura_line_vertices[0].push(new THREE.Vector3(A.x, A.y, A.z));
      yagura_line_vertices[0].push(new THREE.Vector3(B.x, A.y, A.z));
      yagura_line_vertices[0].push(new THREE.Vector3(B.x, A.y, B.z));
      yagura_line_vertices[0].push(new THREE.Vector3(A.x, A.y, B.z));
      yagura_line_vertices[0].push(new THREE.Vector3(A.x, A.y, A.z));
      // yagura_line_vertices[0].push(new THREE.Vector3(B.x, A.y, B.z));
      yagura_line_vertices[1] = [];
      yagura_line_vertices[1].push(new THREE.Vector3(A.x, A.y, A.z));
      yagura_line_vertices[1].push(new THREE.Vector3(C.x, C.y, C.z));
      yagura_line_vertices[2] = [];
      yagura_line_vertices[2].push(new THREE.Vector3(A.x, A.y, B.z));
      yagura_line_vertices[2].push(new THREE.Vector3(C.x, C.y, D.z));
      yagura_line_vertices[3] = [];
      yagura_line_vertices[3].push(new THREE.Vector3(B.x, B.y, B.z));
      yagura_line_vertices[3].push(new THREE.Vector3(D.x, D.y, D.z));
      yagura_line_vertices[4] = [];
      yagura_line_vertices[4].push(new THREE.Vector3(B.x, B.y, A.z));
      yagura_line_vertices[4].push(new THREE.Vector3(D.x, D.y, C.z));
      yagura_line_vertices[5] = [];
      yagura_line_vertices[5].push(new THREE.Vector3(C.x, C.y, C.z));
      yagura_line_vertices[5].push(new THREE.Vector3(D.x, C.y, C.z));
      yagura_line_vertices[5].push(new THREE.Vector3(D.x, C.y, D.z));
      yagura_line_vertices[5].push(new THREE.Vector3(C.x, C.y, D.z));
      yagura_line_vertices[5].push(new THREE.Vector3(C.x, C.y, C.z));
      // yagura_line_vertices[5].push(new THREE.Vector3(D.x, C.y, D.z));

      for (let j=0; j<6; j++) {
        let index = i * 6 + j;
        yagura_line[index].geometry.vertices = yagura_line_vertices[j];
        yagura_line[index].geometry.verticesNeedUpdate = true;
        yagura_line[index].geometry.elementNeedUpdate = true;
        yagura_line[index].geometry.computeFaceNormals();
      }
    } else if (mode==1) {
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

       // V7-------V6
       // |\       |\
       // | V4-------V5
       // V3-|-----V2-|
       //  \ |       \|
       //   V0--------V1

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

      // var material = new THREE.MeshNormalMaterial();
      //var material = new THREE.MeshPhongMaterial({color: 0x88FFFF});
      var material = new THREE.MeshBasicMaterial({color: 0xCBC9D4, vertexColors: THREE.FaceColors});
      yagura_geometry[i] = new THREE.Mesh(geometry, material);
      scene.add(yagura_geometry[i]);
    }

    A.x -= change_level.x;
    A.y += change_level.y;
    A.z -= change_level.z;
    B.x += change_level.x;
    B.y += change_level.y;
    B.z += change_level.z;
    C.x -= change_level.x;
    C.y += change_level.y;
    C.z -= change_level.z;
    D.x += change_level.x;
    D.y += change_level.y;
    D.z += change_level.z;
  }
}

function render_yane(initA, initB, initC, initD, mode) {
  // mode:0ならば補助線、1ならばポリゴン
  // var initA = ref_point[2].clone(), initB = ref_point[3].clone(), initC = ref_point[4].clone();
  // var initD = ref_point[5].clone();

  if (mode==0) {
    if (initD.x > initB.x) initD.x = initB.x;
    if (initD.x < (initB.x + initA.x) / 2) initD.x = (initB.x + initA.x) / 2;
    if (initD.y < initB.y) initD.y = initB.y;
    if (initD.z < initB.z) initD.z = initB.z;
    if (initD.z > (initB.z + initA.z) / 2) initD.z = (initB.z + initA.z) / 2;
    initC = new THREE.Vector3(initB.x - (initD.x - initA.x), initD.y, initB.z - (initD.z - initA.z));
  }

  var change_level = new THREE.Vector3(
    (initD.x - initB.x) / (yagura_steps - 1),
    (initD.y - initB.y) / yagura_steps,
    (initD.z - initB.z) / (yagura_steps - 1)
  )

  var A = new THREE.Vector3(
    initA.x + change_level.x,
    initA.y + 5 * change_level.y / 6,
    initA.z + change_level.z,
  )
  var B = new THREE.Vector3(
    initB.x - change_level.x,
    initB.y + 5 * change_level.y / 6,
    initB.z - change_level.z,
  )
  var C = new THREE.Vector3(
    initA.x - change_level.x,
    initA.y + 8 * change_level.y / 6,
    initA.z - change_level.z,
  )
  var D = new THREE.Vector3(
    initB.x + change_level.x,
    initB.y + 8 * change_level.y / 6,
    initB.z + change_level.z,
  )

  var taruki_interval_x = -1 * change_level.x / 8;
  if (taruki_interval_x == 0.0) taruki_interval_x = 0.1;
  var taruki_interval_z = -1 * change_level.z / 8;
  if (taruki_interval_z == 0.0) taruki_interval_z = 0.1;
  var init_taruki_num_x = Math.round((initB.x - initA.x) / taruki_interval_x);
  var init_taruki_num_z = Math.round((initB.z - initA.z) / taruki_interval_z);
  var sei = change_level.y / 2 / init_taruki_num_x * 10;

  if (mode==0) {
    remove_taruki_line();
    remove_hafu_line();
  }

  var taruki_index = 0;

  for (let i=0; i<yagura_steps; i++) {
    if (mode==0) {
      var yane_line_vertices = [];
      var taruki_line_vertices = [];

      yane_line_vertices[0] = [];
    }

    var taruki_num_x = Math.round((B.x - A.x) / taruki_interval_x);
    var taruki_num_z = Math.round((B.z - A.z) / taruki_interval_z);

    var yane_x = A.x;
    var yane_y = A.y;
    var yane_z = A.z;
    for (let direction=0; direction<4; direction++) {
      if (mode==1) {
        var yane_geometry = new THREE.Geometry();
        var kayaoi = new THREE.Geometry();
      }

      var taruki_num;

      if (direction % 2 == 0) {
        taruki_num = taruki_num_x;
      } else {
        taruki_num = taruki_num_z;
      }

      if (taruki_num > 100) taruki_num = 100;

      var count = 0;

      // yane_geometry.vertices.push(new THREE.Vector3(A.x, A.y + sei, A.z));
      // yane_geometry.vertices.push(new THREE.Vector3(A.x, A.y + sei, A.z));

      for (let j=0; j<taruki_num; j++) {
        if (j < 8) {
          yane_y = A.y + sei * (8-j-1) * (8-j) / 8 / 7;
        } else if (j > taruki_num - 8) {
          yane_y = A.y + sei * count * (count+1) / 8 / 7;
          count++;
        } else {
          yane_y = A.y;
        }

        if (mode==0) {
          yane_line_vertices[0].push(new THREE.Vector3(yane_x, yane_y, yane_z));
        }

        if (mode==0) {
          if (j % 4 == 0) {
            taruki_line.push(new THREE.Line( new THREE.Geometry, new THREE.LineBasicMaterial({color: 0x0000FF})));
            var taruki_line_vertices = [];
            taruki_line_vertices.push(new THREE.Vector3(yane_x, yane_y, yane_z));
            if (direction==0) {
              var grad = (C.z - A.z) / (C.x - A.x);
              var chanz = (change_level.z > grad * (A.x - yane_x)) ? grad * (A.x - yane_x) : change_level.z;
              if (chanz == change_level.z) {
                grad = (C.z - A.z) / (D.x - B.x);
                chanz = (change_level.z > grad * (B.x - yane_x)) ? grad * (B.x - yane_x) : change_level.z;
              }
              taruki_line_vertices.push(new THREE.Vector3(yane_x, yane_y + change_level.y / 6 * chanz / change_level.z, yane_z - chanz));
            } else if (direction==1) {
              var grad = (D.x - B.x) / (C.z - A.z);
              var chanx = (change_level.x < grad * (yane_z - A.z)) ? grad * (yane_z - A.z) : change_level.x;
              if (chanx == change_level.x) {
                grad = (D.x - B.x) / (D.z - B.z);
                chanx = (change_level.x < grad * (yane_z - B.z)) ? grad * (yane_z - B.z) : change_level.x;
              }
              taruki_line_vertices.push(new THREE.Vector3(yane_x + chanx, yane_y + change_level.y / 6 * chanx / change_level.x, yane_z));
            } else if (direction==2) {
              var grad = (D.z - B.z) / (D.x - B.x);
              var chanz = (change_level.z > grad * (yane_x - B.x)) ? grad * (yane_x - B.x) : change_level.z;
              if (chanz == change_level.z) {
                grad = (D.z - B.z) / (C.x - A.x);
                chanz = (change_level.z > grad * (yane_x - A.x)) ? grad * (yane_x - A.x) : change_level.z;
              }
              taruki_line_vertices.push(new THREE.Vector3(yane_x, yane_y + change_level.y / 6 * chanz / change_level.z, yane_z + chanz));
            } else if (direction==3) {
              var grad = (C.x - A.x) / (D.z - B.z);
              var chanx = (change_level.x < grad * (B.z - yane_z)) ? grad * (B.z - yane_z) : change_level.x;
              if (chanx == change_level.x) {
                grad = (C.x - A.x) / (C.z - A.z);
                chanx = (change_level.x < grad * (A.z - yane_z)) ? grad * (A.z - yane_z) : change_level.x;
              }
              taruki_line_vertices.push(new THREE.Vector3(yane_x - chanx, yane_y + change_level.y / 6 * chanx / change_level.x, yane_z));
            }
            taruki_line[taruki_line.length - 1].geometry.vertices = taruki_line_vertices;
            scene.add(taruki_line[taruki_line.length - 1]);
          }
        } else if (mode==1) {
          if (j % 1 == 0) {
            yane_geometry.vertices.push(new THREE.Vector3(yane_x, yane_y, yane_z))
            kayaoi.vertices.push(new THREE.Vector3(yane_x, yane_y, yane_z))

            var taruki = new THREE.Geometry();
            if (direction==0) {
              var grad = (C.z - A.z) / (C.x - A.x);
              var chany = C.y, chanz = change_level.z * 2;
              if (-(yane_x - A.x) > change_level.x*2) {
                chanz = grad * (A.x - yane_x);
                chany = calc_sumimune(A.x, A.y+sei, A.z, C.x, C.y, C.z, yane_x, yane_z - chanz);
              } else if ((yane_x - B.x) > change_level.x*2) {
                chanz = grad * -(B.x - yane_x);
                chany = calc_sumimune(B.x, A.y+sei, A.z, D.x, C.y, C.z, yane_x, yane_z - chanz);
              }
              yane_geometry.vertices.push(new THREE.Vector3(yane_x, chany, yane_z - chanz));

              if (j % 4 == 2) {

                var taruki_y = change_level.y * chanz / change_level.z / 8;
                taruki.vertices.push(new THREE.Vector3(yane_x + taruki_interval_x, yane_y - taruki_interval_x, yane_z));
                taruki.vertices.push(new THREE.Vector3(yane_x, yane_y - taruki_interval_x, yane_z));
                taruki.vertices.push(new THREE.Vector3(yane_x, yane_y + taruki_y - taruki_interval_x*2, yane_z - chanz));
                taruki.vertices.push(new THREE.Vector3(yane_x + taruki_interval_x, yane_y + taruki_y - taruki_interval_x*2, yane_z - chanz));

                for (let k=0; k<4; k++) {
                  var t = taruki.vertices[k];
                  taruki.vertices.push(new THREE.Vector3(t.x, t.y - taruki_interval_x, t.z));
                }

                taruki.faces.push(new THREE.Face3( 0, 3, 1));
                taruki.faces.push(new THREE.Face3( 1, 3, 2));
                taruki.faces.push(new THREE.Face3( 0, 1, 4));
                taruki.faces.push(new THREE.Face3( 1, 5, 4));
                taruki.faces.push(new THREE.Face3( 1, 2, 5));
                taruki.faces.push(new THREE.Face3( 2, 6, 5));
                taruki.faces.push(new THREE.Face3( 2, 3, 6));
                taruki.faces.push(new THREE.Face3( 3, 7, 6));
                taruki.faces.push(new THREE.Face3( 3, 0, 7));
                taruki.faces.push(new THREE.Face3( 0, 4, 7));
                taruki.faces.push(new THREE.Face3( 4, 5, 6));
                taruki.faces.push(new THREE.Face3( 4, 6, 7));

                taruki.computeFaceNormals();
                taruki.computeVertexNormals();

                var material = new THREE.MeshBasicMaterial({color: 0x555555});
                var taruki_mesh = new THREE.Mesh(taruki, material);
                // scene.add(taruki_mesh);

              }

              kayaoi.vertices.push(new THREE.Vector3(yane_x, yane_y, yane_z + taruki_interval_x));
              kayaoi.vertices.push(new THREE.Vector3(yane_x, yane_y - taruki_interval_x, yane_z + taruki_interval_x));
              kayaoi.vertices.push(new THREE.Vector3(yane_x, yane_y - taruki_interval_x, yane_z));
            } else if (direction==1) {
              var grad = (D.x - B.x) / (C.z - A.z);
              var chany = C.y, chanx = change_level.x * 2;
              if (-(yane_z - A.z) < change_level.z*2) {
                chanx = grad * -(A.z - yane_z);
                chany = calc_sumimune(B.x, A.y, A.z, D.x, C.y, C.z, yane_x + chanx, yane_z);
              } else if ((yane_z - B.z) < change_level.z*2) {
                chanx = grad * (B.z - yane_z);
                chany = calc_sumimune(B.x, B.y, B.z, D.x, D.y, D.z, yane_x + chanx, yane_z);
              }
              yane_geometry.vertices.push(new THREE.Vector3(yane_x + chanx, chany, yane_z));
            } else if (direction==2) {
              var grad = (C.z - A.z) / (C.x - A.x);
              var chany = C.y, chanz = change_level.z * 2;
              if ((yane_x - B.x) > change_level.x*2) {
                chanz = grad * -(B.x - yane_x);
                chany = calc_sumimune(B.x, A.y, B.z, D.x, C.y, D.z, yane_x, yane_z + chanz);
              } else if (-(yane_x - A.x) > change_level.x*2) {
                chanz = grad * (A.x - yane_x);
                chany = calc_sumimune(A.x, A.y, B.z, C.x, C.y, D.z, yane_x, yane_z + chanz);
              }
              yane_geometry.vertices.push(new THREE.Vector3(yane_x, chany, yane_z + chanz));
            } else if (direction==3) {
              var grad = (D.x - B.x) / (C.z - A.z);
              var chany = C.y, chanx = change_level.x * 2;
              if ((yane_z - B.z) < change_level.z*2) {
                chanx = grad * (B.z - yane_z);
                chany = calc_sumimune(A.x, A.y, B.z, C.x, C.y, D.z, yane_x - chanx, yane_z);
              } else if (-(yane_z - A.z) < change_level.z*2) {
                chanx = grad * -(A.z - yane_z);
                chany = calc_sumimune(A.x, A.y, A.z, C.x, C.y, C.z, yane_x - chanx, yane_z);
              }
              yane_geometry.vertices.push(new THREE.Vector3(yane_x - chanx, chany, yane_z));
            }
            // taruki_line[taruki_line.length - 1].geometry.vertices = taruki_line_vertices;
            // scene.add(taruki_line[taruki_line.length - 1]);
          }
        }

        if (direction==0) {
          yane_x += (B.x - A.x) / taruki_num;
        } else if (direction==1) {
          yane_z += (B.z - A.z) / taruki_num;
        } else if (direction==2) {
          yane_x -= (B.x - A.x) / taruki_num;
        } else if (direction==3) {
          yane_z -= (B.z - A.z) / taruki_num;
        }

        taruki_index++;
      }

      if (mode==1) {
        yane_geometry.vertices.push(new THREE.Vector3(yane_x, A.y+sei, yane_z));
        yane_geometry.vertices.push(new THREE.Vector3(yane_x, A.y+sei, yane_z));

        for (let j=0; j < yane_geometry.vertices.length - 1; j=j+2) {
          if (j+2 > yane_geometry.vertices.length - 1) break;
          yane_geometry.faces.push(new THREE.Face3(j, j+2, j+3));
          yane_geometry.faces.push(new THREE.Face3(j, j+3, j+1));
          yane_geometry.faces.push(new THREE.Face3(j, j+3, j+2));
          yane_geometry.faces.push(new THREE.Face3(j, j+1, j+3));
          console.log(j, j+3, yane_geometry.vertices.length);
        }

        for (let j=0; j+1 < kayaoi.vertices.length / 4 - 1; j++) {
          // if (j+8 > kayaoi.vertices.length - 1) break;
          for (let k=0; k<4; k++) {
            if (k==3) {
              kayaoi.faces.push(new THREE.Face3(4*j+k, 4*j+k+4, 4*j+k+1));
              kayaoi.faces.push(new THREE.Face3(4*j+k, 4*j+k+1, 4*j+k-3));
            } else {
              kayaoi.faces.push(new THREE.Face3(4*j+k, 4*j+k+4, 4*j+k+5));
              kayaoi.faces.push(new THREE.Face3(4*j+k, 4*j+k+5, 4*j+k+1));
            }
          }
        }

        yane_geometry.computeFaceNormals();
        yane_geometry.computeVertexNormals();

        var material = new THREE.MeshBasicMaterial({color: 0x444444});
        var yane = new THREE.Mesh(yane_geometry, material);
        scene.add(yane);

        kayaoi.computeFaceNormals();
        kayaoi.computeVertexNormals();

        var material = new THREE.MeshBasicMaterial({color: 0x999999});
        var kayaoi_mesh = new THREE.Mesh(kayaoi, material);
        scene.add(kayaoi_mesh);
      }
    }

    if (mode==0) {
      yane_line_vertices[0].push(new THREE.Vector3(A.x, A.y + sei, A.z));
    }
    
    var sumimune_steps = 5;

    function render_sumimune_line(vertices_array, Downx, Downy, Downz, Upx, Upy, Upz) {
      var horizontal_distance = Math.sqrt(Math.pow(Upx - Downx, 2) + Math.pow(Upz - Downz, 2));
      var grad = (Upy - (Downy + sei)) / Math.pow(horizontal_distance, 2);

      var delta_x = (Upx - Downx) / sumimune_steps;
      var delta_z = (Upz - Downz) / sumimune_steps;
      var yane_x = Downx, yane_y = Downy + sei, yane_z = Downz;
      for (let j=0; j<=sumimune_steps; j++) {
        yane_y = Downy + sei + grad * Math.pow(j, 2) * (Math.pow(delta_x, 2) + Math.pow(delta_z, 2));
        vertices_array.push(new THREE.Vector3(yane_x, yane_y, yane_z));
        yane_x += delta_x;
        yane_z += delta_z;
      }
    }

    if (mode==0) {
      yane_line_vertices[1] = [];
      render_sumimune_line(yane_line_vertices[1], A.x, A.y, A.z, C.x, C.y, C.z);
      yane_line_vertices[2] = [];
      render_sumimune_line(yane_line_vertices[2], A.x, A.y, B.z, C.x, C.y, D.z);
      yane_line_vertices[3] = [];
      render_sumimune_line(yane_line_vertices[3], B.x, B.y, B.z, D.x, D.y, D.z);
      yane_line_vertices[4] = [];
      render_sumimune_line(yane_line_vertices[4], B.x, A.y, A.z, D.x, C.y, C.z);
      yane_line_vertices[5] = [];

      for (let j=0; j<6; j++) {
        let index = i * 6 + j;
        yane_line[index].geometry = new THREE.Geometry();
        yane_line[index].geometry.vertices = yane_line_vertices[j];
        yane_line[index].geometry.verticesNeedUpdate = true;
        yane_line[index].geometry.elementNeedUpdate = true;
        yane_line[index].geometry.computeFaceNormals();
      }
    }

    function calc_sumimune(Downx, Downy, Downz, Upx, Upy, Upz, x, z) {
      var horizontal_distance = Math.sqrt(Math.pow(Upx - Downx, 2) + Math.pow(Upz - Downz, 2));
      var grad = (Upy - (Downy + sei)) / Math.pow(horizontal_distance, 2);

      var yane_x = x - Downx, yane_y = Downy + sei, yane_z = z - Downz;

      yane_y = Downy + sei + grad * (Math.pow(yane_x, 2) + Math.pow(yane_z, 2));
      return (yane_y);
    }

    function make_sumizuno(Downx, Downy, Downz, Upx, Upy, Upz) {
      var sumizuno = new THREE.Geometry();
      var inv = taruki_interval_x / Math.sqrt(2.0);
      Downy += sei;

      sumizuno.vertices.push(new THREE.Vector3(Downx + inv, Downy - taruki_interval_x * 2, Downz + inv));
      sumizuno.vertices.push(new THREE.Vector3(Downx - inv, Downy - taruki_interval_x * 2, Downz - inv));
      sumizuno.vertices.push(new THREE.Vector3(Downx - inv, Downy - taruki_interval_x, Downz - inv));
      sumizuno.vertices.push(new THREE.Vector3(Downx + inv, Downy - taruki_interval_x, Downz + inv));
      sumizuno.vertices.push(new THREE.Vector3(Downx - change_level.x + inv, Downy + change_level.y / 6 - taruki_interval_x, Downz - change_level.z + inv));
      sumizuno.vertices.push(new THREE.Vector3(Downx - change_level.x - inv, Downy + change_level.y / 6 - taruki_interval_x, Downz - change_level.z - inv));
      sumizuno.vertices.push(new THREE.Vector3(Downx - change_level.x - inv, Downy + change_level.y / 6, Downz - change_level.z - inv));
      sumizuno.vertices.push(new THREE.Vector3(Downx - change_level.x + inv, Downy + change_level.y / 6, Downz - change_level.z + inv));

      sumizuno.faces.push(new THREE.Face3( 0, 3, 1));
      sumizuno.faces.push(new THREE.Face3( 1, 3, 2));
      sumizuno.faces.push(new THREE.Face3( 0, 1, 4));
      sumizuno.faces.push(new THREE.Face3( 1, 5, 4));
      sumizuno.faces.push(new THREE.Face3( 1, 2, 5));
      sumizuno.faces.push(new THREE.Face3( 2, 6, 5));
      sumizuno.faces.push(new THREE.Face3( 2, 3, 6));
      sumizuno.faces.push(new THREE.Face3( 3, 7, 6));
      sumizuno.faces.push(new THREE.Face3( 3, 0, 7));
      sumizuno.faces.push(new THREE.Face3( 0, 4, 7));
      sumizuno.faces.push(new THREE.Face3( 4, 5, 6));
      sumizuno.faces.push(new THREE.Face3( 4, 6, 7));
      sumizuno.computeFaceNormals();
      sumizuno.computeVertexNormals();

      var material = new THREE.MeshBasicMaterial({color: 0x999999});
      var sumizuno_mesh = new THREE.Mesh(sumizuno, material);
      // scene.add(sumizuno_mesh);
    }

    if (mode==1) {
      make_sumizuno(A.x, A.y, A.z, C.x, C.y, C.z);
      make_sumizuno(A.x, A.y, B.z, C.x, C.y, D.z);
      make_sumizuno(B.x, B.y, B.z, D.x, D.y, D.z);
      make_sumizuno(B.x, A.y, A.z, D.x, C.y, C.z);
    }

    if (i == 0 && i != yagura_steps - 1) {
      if (mode==0) {
        var hafu_ren = (A.z - B.z) / 5;
        var hafu_start = A.z - (A.z - B.z) / 2;
        var hafu_line_vertices = [];
        hafu_line_vertices[0] = [];
        hafu_line_vertices[1] = [];
        var hafu_steps = 6;

        var alpha = 0.45;
        var rho1 = 0.3, rho2 = 0.6, theta = Math.atan(0.28), H = hafu_ren * Math.tan(theta);
        var L = hafu_ren / Math.cos(theta), Dist = 0.08 * L;
        var hafu_z = new THREE.Vector2();
        var hafu_point = new THREE.Vector2();
        for (let j=0; j<=hafu_steps*2; j++) {
          if (j<=hafu_steps) {
            var r1 = rho1 * Dist;
            hafu_z.x = alpha * j * L / hafu_steps;
            hafu_z.y = r1 * Math.sin(Math.PI * j / hafu_steps);

          } else {
            var r2 = rho2 * Dist;
            hafu_z.x = (alpha * hafu_steps + (1 - alpha) * (j - hafu_steps)) * L / hafu_steps;
            hafu_z.y = r2 * Math.sin(Math.PI * j / hafu_steps);
          }
            hafu_point.x = hafu_z.x * Math.cos(theta) + hafu_z.y * Math.sin(theta);
            hafu_point.y = H - hafu_z.x * Math.sin(theta) + hafu_z.y * Math.cos(theta);
            hafu_line_vertices[0].push(new THREE.Vector3(B.x, B.y + hafu_point.y, hafu_start + hafu_point.x));
            hafu_line_vertices[1].push(new THREE.Vector3(B.x, B.y + hafu_point.y, hafu_start - hafu_point.x));
        }

        hafu_line.push(new THREE.Line( new THREE.Geometry, new THREE.LineBasicMaterial({color: 0x0000FF})));
        hafu_line[0].geometry.vertices = hafu_line_vertices[0];
        // scene.add(hafu_line[0]);
        hafu_line.push(new THREE.Line( new THREE.Geometry, new THREE.LineBasicMaterial({color: 0x0000FF})));
        hafu_line[1].geometry.vertices = hafu_line_vertices[1];
        // scene.add(hafu_line[1]);
      }
    }

    if (i == 1 && i != yagura_steps - 1) {
      if (mode==0) {
        var hafu_ren = (B.x - A.x) / 2;
        var hafu_start = A.x + (B.x - A.x) / 2 - hafu_ren / 2;
        var hafu_line_vertices = [];
        hafu_line_vertices[0] = [];
        var hafu_steps = 5;
        var hafu_x = hafu_start, hafu_y, hafu_z = A.z - change_level.z / 3;
        var L = Math.sqrt(Math.pow(hafu_ren / 2, 2) + Math.pow(change_level.y, 2));
        var theta = Math.atan(change_level.y / (hafu_ren / 2));
        var alpha = 0.5;
        for (let j=0; j<=hafu_steps*2; j++) {
          var step = j <= hafu_steps ? j : hafu_steps*2 - j;
          hafu_y = A.y + step * L / hafu_steps * (Math.sin(theta) - alpha * (hafu_steps - step) / hafu_steps * Math.cos(theta));
          hafu_line_vertices[0].push(new THREE.Vector3(hafu_x, hafu_y, hafu_z));
          hafu_x += hafu_ren / 2 / hafu_steps;
        }

        hafu_line.push(new THREE.Line( new THREE.Geometry, new THREE.LineBasicMaterial({color: 0x0000FF})));
        hafu_line[hafu_line.length - 1].geometry.vertices = hafu_line_vertices[0];
        // scene.add(hafu_line[hafu_line.length - 1]);
      }
    }

    if (i == yagura_steps - 1) {
      A.x -= 3 * change_level.x / 4;
      B.x += 3 * change_level.x / 4;
      A.z -= 3 * change_level.z / 4;
      B.z += 3 * change_level.z / 4;
      C.x = A.x;
      D.x = B.x;
      C.y += change_level.y / 3;
      D.y += change_level.y / 3;
      C.z = (C.z + D.z) / 2;
      D.z = C.z;

      if (mode==0) {
        var irimoya_line_vertices = [];
        irimoya_line_vertices[0] = [];
        irimoya_line_vertices[1] = [];
        irimoya_line_vertices[2] = [];
      } else if (mode==1) {
        var irimoya = [];
        irimoya[0] = new THREE.Geometry();
        irimoya[1] = new THREE.Geometry();
        irimoya[2] = new THREE.Geometry();
      }

      var irimoya_steps = 5;
      var irimoya_z = A.z, irimoya_y = A.y;
      var L = Math.sqrt(Math.pow(C.z - A.z, 2) + Math.pow(C.y - A.y, 2));
      var theta = -1 * Math.atan((C.y - A.y) / (C.z - A.z));
      var alpha = 0.5;
      for (let j=0; j<=irimoya_steps*2; j++) {
        var step = j <= irimoya_steps ? j : irimoya_steps*2 - j;
        irimoya_y = A.y + step * L / irimoya_steps * (Math.sin(theta) - alpha * (irimoya_steps - step) / irimoya_steps * Math.cos(theta));
        
        if (mode==0) {
          irimoya_line_vertices[0].push(new THREE.Vector3(A.x, irimoya_y, irimoya_z));
          irimoya_line_vertices[1].push(new THREE.Vector3(B.x, irimoya_y, irimoya_z));
        } else if (mode==1) {
          irimoya[0].vertices.push(new THREE.Vector3(A.x, irimoya_y, irimoya_z));
          irimoya[0].vertices.push(new THREE.Vector3(B.x, irimoya_y, irimoya_z));
          irimoya[1].vertices.push(new THREE.Vector3(A.x, A.y, irimoya_z));
          irimoya[1].vertices.push(new THREE.Vector3(A.x, irimoya_y, irimoya_z));
          irimoya[2].vertices.push(new THREE.Vector3(B.x, irimoya_y, irimoya_z));
          irimoya[2].vertices.push(new THREE.Vector3(B.x, B.y, irimoya_z));
        }
        irimoya_z += (C.z - A.z) / irimoya_steps;
      }

      if (mode==0) {
        irimoya_z = A.z;
        for (let j=0; j<=irimoya_steps*2; j++) {
          var step = j <= irimoya_steps ? j : irimoya_steps*2 - j;
          irimoya_y = A.y + step * L / irimoya_steps * (Math.sin(theta) - alpha * (irimoya_steps - step) / irimoya_steps * Math.cos(theta));
          irimoya_z += (C.z - A.z) / irimoya_steps;
        }

        irimoya_line_vertices[2].push(new THREE.Vector3(C.x, C.y, C.z));
        irimoya_line_vertices[2].push(new THREE.Vector3(D.x, D.y, D.z));

        remove_irimoya_line();

        for (let j=0; j<3; j++) {
          irimoya_line.push(new THREE.Line( new THREE.Geometry, new THREE.LineBasicMaterial({color: 0x0000FF})));
          irimoya_line[j].geometry.vertices = irimoya_line_vertices[j];
          scene.add(irimoya_line[j]);
        }
      } else if (mode==1) {
        for (let j=0; j<irimoya_steps*2; j++) {
          irimoya[0].faces.push(new THREE.Face3(j*2, j*2+1, j*2+2));
          irimoya[0].faces.push(new THREE.Face3(j*2+1, j*2+3, j*2+2));
          irimoya[1].faces.push(new THREE.Face3(j*2, j*2+1, j*2+2));
          irimoya[1].faces.push(new THREE.Face3(j*2+1, j*2+3, j*2+2));
          irimoya[2].faces.push(new THREE.Face3(j*2, j*2+1, j*2+2));
          irimoya[2].faces.push(new THREE.Face3(j*2+1, j*2+3, j*2+2));
        }

        var material = new THREE.MeshBasicMaterial({color: 0x444444});
        for (let j=0; j<3; j++) {
          irimoya[j].computeFaceNormals();
          irimoya[j].computeVertexNormals();
          irimoya_geometry[j] = new THREE.Mesh(irimoya[j], material);
          scene.add(irimoya_geometry[j]);
        }
      }
    }

    A.x -= change_level.x;
    A.y += change_level.y;
    A.z -= change_level.z;
    B.x += change_level.x;
    B.y += change_level.y;
    B.z += change_level.z;
    C.x -= change_level.x;
    C.y += change_level.y;
    C.z -= change_level.z;
    D.x += change_level.x;
    D.y += change_level.y;
    D.z += change_level.z;
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
  yane_line.forEach(function(i) {
    scene.remove(i);
  })
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

export { render_ishigaki, render_yagura, render_yane, add_yagura_line, remove_yagura_line, add_yane_line, remove_yane_line, remove_all_yane_line, add_taruki_line, remove_taruki_line, remove_irimoya_line, remove_hafu_line };