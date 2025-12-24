// CullAI - Three.js Background Scene
// Optimized for performance and SEO

class ThreeBackground {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.shapes = [];
        this.animationId = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        // Check if Three.js is available and canvas exists
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded, skipping 3D background');
            return;
        }
        
        const canvas = document.getElementById('three-canvas');
        if (!canvas) {
            console.warn('Canvas element not found');
            return;
        }
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 15;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        
        // Setup lighting
        this.setupLighting();
        
        // Create shapes
        this.createShapes();
        
        // Handle window resize
        this.setupResizeHandler();
        
        // Start animation
        this.startAnimation();
        
        this.isInitialized = true;
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x666666);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
    }
    
    createShapes() {
        const geometries = [
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.CylinderGeometry(0.3, 0.3, 1, 16),
            new THREE.TorusGeometry(0.5, 0.2, 8, 50),
            new THREE.OctahedronGeometry(0.6),
            new THREE.ConeGeometry(0.4, 1, 16)
        ];
        
        const materials = [
            new THREE.MeshPhongMaterial({ 
                color: 0xff6b6b, 
                transparent: true, 
                opacity: 0.3,
                shininess: 30
            }),
            new THREE.MeshPhongMaterial({ 
                color: 0x4ecdc4, 
                transparent: true, 
                opacity: 0.3,
                shininess: 30
            }),
            new THREE.MeshPhongMaterial({ 
                color: 0xffd166, 
                transparent: true, 
                opacity: 0.3,
                shininess: 30
            })
        ];
        
        // Create fewer shapes for better performance
        const shapeCount = 8;
        
        for (let i = 0; i < shapeCount; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = materials[Math.floor(Math.random() * materials.length)];
            const mesh = new THREE.Mesh(geometry, material);
            
            // Random position within bounds
            mesh.position.x = (Math.random() - 0.5) * 30;
            mesh.position.y = (Math.random() - 0.5) * 30;
            mesh.position.z = (Math.random() - 0.5) * 20;
            
            // Random rotation
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            
            // Random scale
            const scale = 0.5 + Math.random() * 1;
            mesh.scale.setScalar(scale);
            
            // Store animation properties
            mesh.userData = {
                speed: 0.1 + Math.random() * 0.1,
                rotationSpeed: new THREE.Vector3(
                    Math.random() * 0.01,
                    Math.random() * 0.01,
                    Math.random() * 0.01
                ),
                floatHeight: 0.5 + Math.random() * 0.5
            };
            
            this.scene.add(mesh);
            this.shapes.push(mesh);
        }
        
        // Create aperture rings
        const ringGeometry = new THREE.TorusGeometry(3, 0.1, 8, 50);
        const ringMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff6b6b, 
            transparent: true, 
            opacity: 0.1,
            shininess: 10
        });
        
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.scale.setScalar(0.8 + i * 0.3);
            this.scene.add(ring);
            this.shapes.push(ring);
        }
    }
    
    setupResizeHandler() {
        let resizeTimeout;
        
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            
            resizeTimeout = setTimeout(() => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }, 100);
        };
        
        window.addEventListener('resize', handleResize);
        
        // Cleanup on instance destruction
        this.cleanupResize = () => {
            window.removeEventListener('resize', handleResize);
        };
    }
    
    startAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const animate = (timestamp) => {
            this.animationId = requestAnimationFrame(animate);
            
            // Calculate delta time for smooth animation
            const delta = timestamp * 0.001;
            
            // Animate shapes
            this.shapes.forEach((shape, index) => {
                if (shape.userData.speed) {
                    // Floating motion
                    shape.position.y += Math.sin(delta * shape.userData.speed) * 0.005;
                    
                    // Rotation
                    shape.rotation.x += shape.userData.rotationSpeed.x;
                    shape.rotation.y += shape.userData.rotationSpeed.y;
                    shape.rotation.z += shape.userData.rotationSpeed.z;
                    
                    // Gentle orbit around center
                    const orbitSpeed = 0.05 + index * 0.01;
                    shape.position.x = Math.sin(delta * orbitSpeed) * 15;
                    shape.position.z = Math.cos(delta * orbitSpeed) * 15;
                }
            });
            
            // Camera subtle movement
            this.camera.position.x = Math.sin(delta * 0.1) * 1;
            this.camera.position.y = Math.cos(delta * 0.05) * 0.5;
            this.camera.lookAt(this.scene.position);
            
            this.renderer.render(this.scene, this.camera);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    destroy() {
        this.stopAnimation();
        
        if (this.cleanupResize) {
            this.cleanupResize();
        }
        
        // Clean up Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.scene) {
            this.shapes.forEach(shape => {
                if (shape.geometry) shape.geometry.dispose();
                if (shape.material) {
                    if (Array.isArray(shape.material)) {
                        shape.material.forEach(material => material.dispose());
                    } else {
                        shape.material.dispose();
                    }
                }
                this.scene.remove(shape);
            });
            this.shapes = [];
        }
    }
}

// Initialize Three.js background when page loads
document.addEventListener('DOMContentLoaded', () => {
    let threeBackground = null;
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        threeBackground = new ThreeBackground();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (threeBackground) {
            threeBackground.destroy();
        }
    });
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (threeBackground) {
                threeBackground.stopAnimation();
            }
        } else {
            if (threeBackground && threeBackground.isInitialized) {
                threeBackground.startAnimation();
            }
        }
    });
});

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThreeBackground;
}