 import * as THREE from "three";
        import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

        // 取得 model-container
        const container = document.getElementById('model-container');

        // 初始化 renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // 場景與相機
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.z = 5;

        // 燈光
        scene.add(new THREE.AmbientLight(0xffffff, 1));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7.5);
        scene.add(dirLight);

        // 載入模型
        const loader = new GLTFLoader();
        let model = null;

        loader.load(
            './mod/興大載入畫面字樣.glb',
            function (gltf) {
                model = gltf.scene;
                scene.add(model);

                // 自動置中與縮放
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3()).length();
                const center = box.getCenter(new THREE.Vector3());
                model.position.set(-center.x, -center.y, -center.z);
                model.position.x += 1.2;
                const scale = 2 / size;
                model.scale.setScalar(scale);

                model.traverse(child => {
                    if (child.isMesh) {
                        if (child.name === 'Cube006' || child.name === 'Cube006_1') {
                            child.scale.set(2, 3, 3);
                        }
                        if (['中', '興', '大', '學'].includes(child.name)) {
                            child.scale.setScalar(1.2);
                        }
                    }
                });

                // 跳躍動畫準備
                const jumpParts = [];
                const jumpNames = ['中', '興', '大', '學'];
                model.traverse(child => {
                    if (child.isMesh && jumpNames.includes(child.name)) {
                        jumpParts.push({
                            mesh: child,
                            baseY: child.position.y,
                            delay: 0
                        });
                    }
                });
                jumpParts.sort((a, b) => a.mesh.position.x - b.mesh.position.x);
                jumpParts.forEach((part, index) => {
                    part.delay = index * 0.2;
                });
                window.jumpParts = jumpParts;
                window.startTime = performance.now() / 1000;
            },
            undefined,
            function (error) {
                document.getElementById('loading-text').textContent = '模型載入失敗';
                console.error('模型載入失敗:', error);
            }
        );

        // 畫面自適應
        function resizeRenderer() {
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        window.addEventListener('resize', resizeRenderer);
        resizeRenderer();

        // 動畫
        function animate() {
            requestAnimationFrame(animate);

            // 跳躍動畫
            if (window.jumpParts && window.startTime) {
                const t = performance.now() / 1000 - window.startTime;
                window.jumpParts.forEach(part => {
                    const jump = Math.max(0, Math.sin((t - part.delay) * Math.PI * 2) * 0.4);
                    part.mesh.position.y = part.baseY + jump;
                });
            }

            renderer.render(scene, camera);
        }
        animate();

        // 「參觀校園」按鈕
        document.getElementById('visit-campus-btn').onclick = () => {
            document.getElementById('loading-screen').style.display = 'none';
            window.location.href = '主場畫面.html';
        };