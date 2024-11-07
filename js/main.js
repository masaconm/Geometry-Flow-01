// 20241106 
/**
 * このコードでは、Three.js https://threejs.org/ とdat.GUI https://github.com/dataarts/dat.gui.git
 * を使用して、トンネル状の3Dアニメーションとそのコントロールパネル(GUI)を実装しています。
 * トンネルのパスに沿ってカメラが移動し、リアルタイムでトンネルの色、背景色、形状、カメラの速度を
 * 調整できるコントロールパネルを追加しています。
 * 
 * 主な機能:
 *  - トンネルの形状（半径、セグメント数）の調整
 *  - カメラの速度、位置の変更
 *  - トンネルの色や背景色の変更
 */


// シーン、カメラ、レンダラーの作成
const scene = new THREE.Scene(); // シーンを作成
scene.background = new THREE.Color("#171717"); // シーンの背景色を白に設定

// パースペクティブカメラを作成し、視野角、アスペクト比、近距離・遠距離を設定
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);

// レンダラーを作成し、画面全体のサイズに設定
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // レンダラーのDOM要素をページに追加

// トンネルのパスを作成（ループさせる）
// トンネル内を通るカメラの移動パスをベクトルで定義
const pathPoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(10, 0, 20),
    new THREE.Vector3(0, 0, 40),
    new THREE.Vector3(40, 20, 60),
    new THREE.Vector3(0, 40, 80),
    new THREE.Vector3(40, 80, 100),
    new THREE.Vector3(10, 100, 120)
];
// `CatmullRomCurve3`でスムーズな曲線を作成し、ループさせる
const path = new THREE.CatmullRomCurve3(pathPoints, true);

// GUI用オブジェクトを作成
const guiControls = {
    speed: 0.00015,                 // デフォルトのカメラの移動速度
    color: 0xFFCC00,               // トンネルの色
    cameraY: camera.position.y,    // カメラのY位置
    segments: 200,                 // トンネルのセグメント数
    radius: 2,                     // トンネルの半径
    radialSegments: 8,             // トンネルの円周方向の分割数
    backgroundColor: "#171717"     // 背景色の初期値
};

// トンネルジオメトリとマテリアルを作成
let tubeGeometry = new THREE.TubeGeometry(path, guiControls.segments, guiControls.radius, guiControls.radialSegments, true);
const tubeMaterial = new THREE.MeshBasicMaterial({ color: guiControls.color, wireframe: true });
let tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
scene.add(tube); // トンネルをシーンに追加

let t = 0; // カメラのパス上の位置を管理する変数

// アニメーション関数
function animate() {
    requestAnimationFrame(animate); // フレームごとにanimateを呼び出し、アニメーションループを実現

    // `speed`を使って`t`の値を更新し、トンネルをループ
    t = (t + guiControls.speed) % 1;

    // パス上の`t`位置の座標を取得し、カメラ位置にコピー
    const position = path.getPointAt(t);
    const tangent = path.getTangentAt(t);

    camera.position.copy(position);
    const lookAtPosition = position.clone().add(tangent); // 次の位置に向かってカメラの視点を設定
    camera.lookAt(lookAtPosition);

    renderer.render(scene, camera); // シーンとカメラを描画
}
animate();

// ウィンドウリサイズ時にレンダラーとカメラの設定を更新
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// GUI設定
const gui = new dat.GUI();
gui.add(guiControls, 'speed', 0, 0.002).name('カメラ速度'); // カメラ速度を調整
gui.addColor(guiControls, 'color').name('トンネルの色').onChange(value => {
    tubeMaterial.color.set(value); // トンネルの色を変更
});

gui.add(guiControls, 'segments', 50, 500).name('分割数').step(1).onChange(updateTubeGeometry); // トンネルの分割数を変更
gui.add(guiControls, 'radius', 0.5, 10).name('半径').onChange(updateTubeGeometry); // トンネルの半径を変更
gui.add(guiControls, 'radialSegments', 3, 20).name('円周方向の分割数').step(1).onChange(updateTubeGeometry); // 円周方向の分割数を変更

// 背景色のカラーピッカーを追加
gui.addColor(guiControls, 'backgroundColor').name('背景色').onChange(value => {
    scene.background.set(value); // 背景色を変更
});

// トンネルのジオメトリを更新
function updateTubeGeometry() {
    scene.remove(tube); // 現在のトンネルをシーンから削除
    tubeGeometry.dispose(); // 古いジオメトリを解放
    tubeGeometry = new THREE.TubeGeometry(path, guiControls.segments, guiControls.radius, guiControls.radialSegments, true);
    tube = new THREE.Mesh(tubeGeometry, tubeMaterial); // 新しいジオメトリとマテリアルを使用してトンネルを再作成
    scene.add(tube); // 新しいトンネルをシーンに追加
}


