 import * as THREE from "three";
        import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
        import { OrbitControls } from 'https://unpkg.com/three@0.177.0/examples/jsm/controls/OrbitControls.js';
        import { MOUSE } from 'https://unpkg.com/three@0.177.0/build/three.module.js';
        const cameraViewMap = {
            '仁齋': { viewDir: new THREE.Vector3(-2, 0.5, 0.2), distance: 5 },
            '義齋': { viewDir: new THREE.Vector3(-2, 0.3, 0.2), distance: 5 },
            '禮齋': { viewDir: new THREE.Vector3(-2, 0.4, 0.2), distance: 5 },
            '智齋': { viewDir: new THREE.Vector3(-2, 0.5, 0.5), distance: 5 },
            '信齋': { viewDir: new THREE.Vector3(-1, 0.5, 0.8), distance: 5 },
            '操場左側座位': { viewDir: new THREE.Vector3(0.2, 0.5, 3), distance: 5 },
            '操場': { viewDir: new THREE.Vector3(0, 0.5, 3), distance: 5 },
            '司令台': { viewDir: new THREE.Vector3(-0.5, 0.5, 2), distance: 5 },
            '籃球場': { viewDir: new THREE.Vector3(0.1, 0.5, 2), distance: 5 },
            '排球場': { viewDir: new THREE.Vector3(0.1, 0.5, 1), distance: 5 },
            '網球場': { viewDir: new THREE.Vector3(-1, 1, 2), distance: 5 },
            '紅土網球場': { viewDir: new THREE.Vector3(-1, 0.5, 4), distance: 5 },
            '高爾夫練習場': { viewDir: new THREE.Vector3(0, 0.9, 2), distance: 5 },
            '體育館': { viewDir: new THREE.Vector3(-1, 1, 5), distance: 5 },
            '室內游泳池': { viewDir: new THREE.Vector3(0, 1, 4), distance: 5 },
            '動物醫學研究中心': { viewDir: new THREE.Vector3(0, 0.5, 1), distance: 5 },
            '動科系館': { viewDir: new THREE.Vector3(0.5, 0.7, 2), distance: 5 },
            '獸醫館': { viewDir: new THREE.Vector3(-1, 0.5, 2), distance: 5 },
            '獸醫學院': { viewDir: new THREE.Vector3(-0.5, 0.5, 1.5), distance: 5 },
            '獸醫教學醫院': { viewDir: new THREE.Vector3(1, 2, 4), distance: 5 },
            '實驗動物舍': { viewDir: new THREE.Vector3(0, 1, 4), distance: 5 },
            '動物檢疫舍': { viewDir: new THREE.Vector3(-0.5, 0.4, 1.2), distance: 5 },
            '農藝系實驗地': { viewDir: new THREE.Vector3(-0.5, 1.5, 4), distance: 5 },
            '作物實習館': { viewDir: new THREE.Vector3(0.5, 0.5, 1), distance: 5 },

            // 依照需要繼續補建築
        };
        const hideMap = {
            '仁齋': ['義齋', '禮齋'],
            '義齋': ['仁齋', '智齋'],
            '操場': ['司令台', '操場左側座位'],
            '作物實習館': ['動物醫學研究中心', '室內游泳池'],
            '動科系館':['獸醫教學醫院','獸醫學院','獸醫館'],
            '獸醫教學醫院':['動科系館','獸醫學院','獸醫館','實驗動物舍','動物檢疫舍'],
            '實驗動物舍':['獸醫教學醫院','動物檢疫舍'],
            '動物檢疫舍':['實驗動物舍'],
            // 繼續加其他建築
        };
        // 場景與相機
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // 設定相機在上方斜角
        // 從前方平視
        camera.position.set(0, 0, 33); // x, y, z
        camera.lookAt(0, 0, 0);

        // 渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('three-canvas') });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x222233, 1);

        // 燈光
        const ambientLight = new THREE.AmbientLight(0xffffff, 5);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 5);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);
        // 控制器
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.mouseButtons = {
            LEFT: MOUSE.PAN,     // 左鍵拖動
            MIDDLE: MOUSE.DOLLY, // 滾輪縮放（預設）
            RIGHT: MOUSE.ROTATE  // 右鍵旋轉
        };
        controls.enableDamping = true;     // 滑鼠慣性
        controls.dampingFactor = 0.05;
        controls.enablePan = true;         // 左鍵拖動
        controls.enableZoom = true;        // 滾輪縮放
        controls.enableRotate = true;      // 右鍵旋轉

        // 載入 GLB 模型
        const loader = new GLTFLoader();
        loader.load(
            './mod/2025_06_16中興大學.glb',
            function (gltf) {
                //console.log(gltf);
                const model = gltf.scene;
                scene.add(model);

                // 自動置中與縮放
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3()).length();
                const center = box.getCenter(new THREE.Vector3());
                model.position.set(-center.x, -center.y, -center.z);
                const scale = 30 / size;
                model.scale.setScalar(scale);
                let hiddenByFocus = [];



                //判斷按鈕名稱與3D物件名稱是否相同
                document.querySelectorAll('.btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const name = btn.innerText.trim(); // 取得按鈕文字，例如「仁齋」
                        const mesh = model.getObjectByName(name); // 嘗試用這名字找 3D 模型內的 mesh
                        const viewConfig = cameraViewMap[name];

                        if (mesh && viewConfig) {
                            console.log(`✔️ 找到相符的物件：${name}`);
                            //console.log(` ${name} 的世界座標是：`, center); // ← 印出座標
                            const center = mesh.getWorldPosition(new THREE.Vector3());
                            const offset = viewConfig.viewDir.clone().normalize().multiplyScalar(viewConfig.distance);
                            const cameraPos = center.clone().add(offset);
                            // ✅ 平滑移動 + 看向該建築
                            flyTo(cameraPos, center);
                            const targetPos = mesh.getWorldPosition(new THREE.Vector3());

                            //生成小卡
                            const card = document.querySelector('.card');
                            card.classList.add('show');
                            card.querySelector('.card-title').innerText = name;
                            card.querySelector('.card-text').innerText =
                                buildingInfo[name] || `${name} 的詳細介紹可以放在這裡。`;
                            //隱藏指定建築
                            hiddenByFocus = [];
                            const toHide = hideMap[name] || [];
                            toHide.forEach(hideName => {
                                const obj = model.getObjectByName(hideName);
                                if (obj && obj.visible) {
                                    obj.visible = false;
                                    hiddenByFocus.push(obj);
                                }
                            });


                        }
                        else {
                            console.warn(`❌ 沒有找到名稱為 "${name}" 的 3D 物件，請檢查模型名稱！`);
                        }
                        

                    });
                });
                //console.log('模型載入成功', model);
                // === 滑鼠移動時恢復建築 ===
                        controls.addEventListener('change', () => {
                            if (hiddenByFocus.length > 0) {
                                hiddenByFocus.forEach(obj => obj.visible = true);
                                hiddenByFocus = [];
                            }
                        });

            },
            undefined,
            function (error) {
                console.error('模型載入失敗:', error);
            }
        );

        // 視窗自適應
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });

        // 動畫
        function animate() {
            requestAnimationFrame(animate);
            controls.update(); // 必須呼叫才能啟用 damping 和滑鼠控制
            renderer.render(scene, camera);
        }
        animate();
        // flyTo 函式：平滑移動攝影機
        function flyTo(position, lookAt) {
            const start = camera.position.clone();
            const from = performance.now();
            const duration = 800;

            const update = (now) => {
                const t = Math.min(1, (now - from) / duration);
                camera.position.lerpVectors(start, position, t);
                camera.lookAt(lookAt);
                if (t < 1) requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        }
        document.querySelector('.card .close').addEventListener('click', () => {
            document.querySelector('.card').classList.remove('show');
        });
        const buildingInfo = {
            '仁齋': '仁齋是中興大學的男生宿舍之一，位於校園東側。',
            '義齋': '義齋是中興大學的男生宿舍之一，位於校園東側。',
            '禮齋': '禮齋是中興大學的男生宿舍之一，位於校園東側。',
            '智齋': '智齋是中興大學的男生宿舍之一，位於校園東側。',
            '信齋': '信齋是中興大學的男生宿舍之一，位於校園東側。',
            '操場': '操場是學生運動與舉辦校慶的主要場地。',
            '體育館': '體育館提供室內運動與比賽設施。',
            '室內游泳池': '提供休憩游泳的地方',
            '獸醫教學醫院': ' 提供學生臨床實習和對外提供動物醫療服務。',
            '獸醫學院': '設有獸醫學系、獸醫微生物學研究所、獸醫病理學研究所、獸醫公共衛生學研究所和獸醫教學醫院。',
            '司令台': '作為指揮者發號施令的站立高台，通常設置在操場或集合場地，方便進行集會、升旗典禮、體育競賽等活動。',
            '動科系館': '前身為畜牧館。 該系館經過重新整修，不僅保有原始建築特色，更增添了現代化的設施，提供學生更舒適的學習和交流空間。',
            '動物醫學研究中心': '提供中小型實驗動物飼養環境空間。執行動物試驗、檢驗服務及飼養試驗動物來協助執行。',
            '實驗動物舍': '主要用於動物試驗、教學和醫療，並提供代養、監測、毒理試驗等服務。',
            '動物檢疫舍': '檢疫舍位於獸醫教學醫院旁，主要為犬貓檢疫。',
            '獸醫館': '大學部以臨床教學為導向，著重學生對伴侶動物和經濟動物的醫療能力訓練，同時也加強人畜共通疾病、分子生物及實驗動物領域的研究。',
            '籃球場': '提供一個標準的比賽場地，讓籃球運動能夠進行。',
            '網球場': '提供一個標準的比賽場地，讓網球運動能夠進行。',
            '排球場': '提供一個標準的比賽場地，讓排球運動能夠進行。',
            '紅土網球場': '提供一個標準的比賽場地，讓網球運動能夠進行。地面是由紅色土壤鋪成。',
            '高爾夫練習場': '提供一個標準的用地，可以練習高爾夫球。',
            '農藝系實驗地': '規劃完善，具有灌溉排水系統和農路設施，方便學生進行試驗和實習。',
            '操場左側座位': '提供休息的地方',
        };