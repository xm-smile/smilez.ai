// Initialize GSAP plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    console.log("Smilez AI x Game Portfolio Loaded.");

    initHeroAnimations();
    initScrollAnimations();
    initSmoothScroll();
    initThreeJSParticles();
    initNavbarScroll();
    initVideoControls();
});

function initVideoControls() {
    const placeholders = document.querySelectorAll('.video-placeholder');
    placeholders.forEach(placeholder => {
        const video = placeholder.querySelector('video');
        if (!video) return;

        const playIcon = placeholder.querySelector('.icon-play');
        const pauseIcon = placeholder.querySelector('.icon-pause');

        placeholder.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                placeholder.classList.remove('paused');
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'block';
            } else {
                video.pause();
                placeholder.classList.add('paused');
                if (playIcon) playIcon.style.display = 'block';
                if (pauseIcon) pauseIcon.style.display = 'none';
            }
        });

        // Sync initial state (for autoplaying videos)
        video.addEventListener('playing', () => {
            placeholder.classList.remove('paused');
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
        });

        video.addEventListener('pause', () => {
            placeholder.classList.add('paused');
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
        });
    });
}

function initThreeJSParticles() {
    const container = document.getElementById('hero-canvas-container');
    if (!container) return;
    container.innerHTML = '';

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 45);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Color Palette: Cyan, Purple, Gold
    const colors = [0x00f0ff, 0xb052ff, 0xffb000];

    // 2. Generate Glow Texture for Suns
    function createGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
    }
    const glowTexture = createGlowTexture();

    function createTrailTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 16; canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
        return new THREE.CanvasTexture(canvas);
    }
    const trailTexture = createTrailTexture();

    // 3. Create the 3 Suns (Bodies) and their Trails
    const bodies = [];
    const G = 0.5; // Gravitational constant for the 3 bodies

    for (let i = 0; i < 3; i++) {
        // Sun Sprite
        const material = new THREE.SpriteMaterial({
            map: glowTexture,
            color: colors[i],
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(12, 12, 1); // Increased main star size
        scene.add(sprite);

        // Orbital Trail (Elegant Fading Particle Trail)
        const trailLen = 150; // Longer tails
        const trailGeometry = new THREE.BufferGeometry();
        const trailPositions = new Float32Array(trailLen * 3);
        const trailColors = new Float32Array(trailLen * 3);

        for (let j = 0; j < trailLen * 3; j++) {
            trailPositions[j] = 0;
            trailColors[j] = 0;
        }

        trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
        trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

        const trailMaterial = new THREE.PointsMaterial({
            size: 0.6, // Subtle trail particles
            map: trailTexture,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const trail = new THREE.Points(trailGeometry, trailMaterial);
        scene.add(trail);

        bodies.push({
            mesh: sprite,
            trail: trail,
            trailPositions: trailPositions,
            trailColors: trailColors,
            trailLen: trailLen,
            mass: 1.5,
            pos: new THREE.Vector3(),
            vel: new THREE.Vector3()
        });
    }

    // Mathematical Attractor for Stable Orbit (Figure-8)
    function getStablePos(time, index) {
        const t = time + (index * (Math.PI * 2) / 3);
        const A = 14; // Width
        const B = 7;  // Height
        const x = A * Math.sin(t);
        const y = B * Math.sin(t) * Math.cos(t);
        const z = Math.sin(t * 2) * 4;
        return new THREE.Vector3(x, y, z);
    }

    // 4. Create Stable Orbit Track Guideline (Visible Infinity Knot)
    const trackPointCount = 250; // Sparse, elegant dotted line
    const trackGeometry = new THREE.BufferGeometry();
    const trackPositions = new Float32Array(trackPointCount * 3);
    const trackColors = new Float32Array(trackPointCount * 3);

    for (let i = 0; i < trackPointCount; i++) {
        const t = (i / trackPointCount) * Math.PI * 2;
        const A = 14;
        const B = 7;

        const x = A * Math.sin(t);
        const y = B * Math.sin(t) * Math.cos(t);
        const z = Math.sin(t * 2) * 4;

        trackPositions[i * 3] = x;
        trackPositions[i * 3 + 1] = y;
        trackPositions[i * 3 + 2] = z;

        // Very subtle, deep space blue/purple
        trackColors[i * 3] = 0.1; // R
        trackColors[i * 3 + 1] = 0.15; // G
        trackColors[i * 3 + 2] = 0.3; // B
    }

    trackGeometry.setAttribute('position', new THREE.BufferAttribute(trackPositions, 3));
    trackGeometry.setAttribute('color', new THREE.BufferAttribute(trackColors, 3));

    const trackMaterial = new THREE.PointsMaterial({
        size: 0.15, // Tiny dust-like dots
        map: trailTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.25, // Barely there, like a watermark
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const trackMesh = new THREE.Points(trackGeometry, trackMaterial);
    scene.add(trackMesh);

    // 5. Create Cosmic Dust Field
    const dustCount = 8000;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustVel = new Float32Array(dustCount * 3);
    const dustColor = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
        const i3 = i * 3;
        // Spawn in a wide spherical cloud
        const r = 5 + Math.random() * 25;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);

        dustPos[i3] = r * Math.sin(phi) * Math.cos(theta);
        dustPos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        dustPos[i3 + 2] = r * Math.cos(phi);

        dustVel[i3] = 0; dustVel[i3 + 1] = 0; dustVel[i3 + 2] = 0;

        // Base dark space color
        dustColor[i3] = 0.1; dustColor[i3 + 1] = 0.1; dustColor[i3 + 2] = 0.15;
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColor, 3));

    function createDustTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 8; canvas.height = 8;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(4, 4, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        return new THREE.CanvasTexture(canvas);
    }

    const dustMaterial = new THREE.PointsMaterial({
        size: 0.15,
        map: createDustTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const dustMesh = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustMesh);

    // 5. Interaction (Parallax & Syzygy Click)
    let targetRotationX = 0;
    let targetRotationY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        const mouseX = (event.clientX - windowHalfX);
        const mouseY = (event.clientY - windowHalfY);
        targetRotationY = mouseX * 0.0003;
        targetRotationX = mouseY * 0.0003;
    });

    // State Variables for Speed Acceleration
    let systemTime = 0;
    let speedTimer = 0; // 0 = Normal Speed, >0 = Accelerated Speed

    // Acceleration Interaction (Click to speed up)
    container.addEventListener('mousedown', () => {
        speedTimer = 3.0; // Speed up for 3 seconds
    });

    container.style.cursor = 'pointer';

    // Pre-warm stable positions
    for (let i = 0; i < 3; i++) {
        bodies[i].pos.copy(getStablePos(0, i));
        bodies[i].mesh.position.copy(bodies[i].pos);
    }

    // 6. Animation Loop
    const dustG = 0.015; // Gravity pull of suns on dust
    let lastTime = performance.now();

    function animate() {
        requestAnimationFrame(animate);

        const now = performance.now();
        const dt = (now - lastTime) / 1000.0; // Delta time in seconds
        lastTime = now;

        // Handle Speed Timer
        let currentSpeed = 0.003; // Normal base speed

        if (speedTimer > 0) {
            speedTimer -= dt;
            if (speedTimer < 0) speedTimer = 0;

            // Smoothly ramp back to normal speed during the last 0.5 seconds
            if (speedTimer > 0.5) {
                currentSpeed = 0.025; // Accelerated speed
            } else {
                const ratio = speedTimer / 0.5;
                currentSpeed = 0.003 + (0.025 - 0.003) * ratio;
            }
        }

        systemTime += currentSpeed;

        // A. Update 3 Bodies (Suns)
        for (let i = 0; i < 3; i++) {
            const b = bodies[i];
            const targetPos = getStablePos(systemTime, i);

            // Always smoothly follow the Figure-8 track
            b.vel.set(0, 0, 0);
            b.pos.lerp(targetPos, 0.4); // Faster lerp so they don't lag behind during acceleration

            b.mesh.position.copy(b.pos);

            // Update Particle Trails (Shift and Fade)
            const p = b.trailPositions;
            const c = b.trailColors;

            for (let k = b.trailLen - 1; k > 0; k--) {
                p[k * 3] = p[(k - 1) * 3];
                p[k * 3 + 1] = p[(k - 1) * 3 + 1];
                p[k * 3 + 2] = p[(k - 1) * 3 + 2];

                // Fade color to black (invisible in AdditiveBlending)
                // Quick decay for a short, elegant tail
                c[k * 3] = c[(k - 1) * 3] * 0.92;
                c[k * 3 + 1] = c[(k - 1) * 3 + 1] * 0.92;
                c[k * 3 + 2] = c[(k - 1) * 3 + 2] * 0.92;
            }

            // Set new head position and color
            p[0] = b.pos.x;
            p[1] = b.pos.y;
            p[2] = b.pos.z;

            const baseCol = new THREE.Color(colors[i]);
            c[0] = baseCol.r;
            c[1] = baseCol.g;
            c[2] = baseCol.b;

            b.trail.geometry.attributes.position.needsUpdate = true;
            b.trail.geometry.attributes.color.needsUpdate = true;
        }

        // B. Update Cosmic Dust Field
        const positions = dustGeometry.attributes.position.array;
        const colorsAttr = dustGeometry.attributes.color.array;

        for (let i = 0; i < dustCount; i++) {
            const i3 = i * 3;
            let px = positions[i3], py = positions[i3 + 1], pz = positions[i3 + 2];
            let vx = dustVel[i3], vy = dustVel[i3 + 1], vz = dustVel[i3 + 2];

            // Dust gravity calculation
            let totalFx = 0, totalFy = 0, totalFz = 0;
            let closestDistSq = Infinity;
            let dominantBodyIndex = -1;

            for (let j = 0; j < 3; j++) {
                const body = bodies[j];
                const dx = body.pos.x - px, dy = body.pos.y - py, dz = body.pos.z - pz;
                const distSq = dx * dx + dy * dy + dz * dz;

                if (distSq < closestDistSq) {
                    closestDistSq = distSq;
                    dominantBodyIndex = j;
                }

                const dist = Math.sqrt(distSq) + 2.0;
                const force = (dustG * body.mass) / (dist * dist);

                totalFx += (dx / dist) * force;
                totalFy += (dy / dist) * force;
                totalFz += (dz / dist) * force;
            }

            vx += totalFx; vy += totalFy; vz += totalFz;
            vx *= 0.95; vy *= 0.95; vz *= 0.95; // Dust friction

            px += vx; py += vy; pz += vz;

            // Dynamic Dust Illumination (Light up near passing Suns)
            if (dominantBodyIndex !== -1 && closestDistSq < 150) {
                const c = new THREE.Color(colors[dominantBodyIndex]);
                const intensity = Math.max(0, 1.0 - (closestDistSq / 150));

                const baser = 0.1, baseg = 0.1, baseb = 0.15;
                colorsAttr[i3] = baser + (c.r - baser) * intensity;
                colorsAttr[i3 + 1] = baseg + (c.g - baseg) * intensity;
                colorsAttr[i3 + 2] = baseb + (c.b - baseb) * intensity;
            } else {
                // Fade to dark
                colorsAttr[i3] += (0.1 - colorsAttr[i3]) * 0.05;
                colorsAttr[i3 + 1] += (0.1 - colorsAttr[i3 + 1]) * 0.05;
                colorsAttr[i3 + 2] += (0.15 - colorsAttr[i3 + 2]) * 0.05;
            }

            // Respawn boundary
            const fromCenterSq = px * px + py * py + pz * pz;
            if (fromCenterSq > 1500) {
                const r = 25 + Math.random() * 10;
                const theta = 2 * Math.PI * Math.random();
                const phi = Math.acos(2 * Math.random() - 1);
                px = r * Math.sin(phi) * Math.cos(theta);
                py = r * Math.sin(phi) * Math.sin(theta);
                pz = r * Math.cos(phi);
                vx = 0; vy = 0; vz = 0;
            }

            positions[i3] = px; positions[i3 + 1] = py; positions[i3 + 2] = pz;
            dustVel[i3] = vx; dustVel[i3 + 1] = vy; dustVel[i3 + 2] = vz;
        }

        dustGeometry.attributes.position.needsUpdate = true;
        dustGeometry.attributes.color.needsUpdate = true;

        // C. Camera & Scene Rotation Parallax
        scene.rotation.y += 0.001;
        scene.rotation.x += 0.0005;

        scene.rotation.y += (targetRotationY - scene.rotation.y) * 0.05;
        scene.rotation.x += (targetRotationX - scene.rotation.x) * 0.05;

        renderer.render(scene, camera);
    }

    animate();

    // 7. Responsive Resize
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function initHeroAnimations() {
    const tl = gsap.timeline();

    // Initial state: hide elements
    gsap.set(".navbar", { y: -50, opacity: 0 });
    gsap.set(".hero-badge", { y: 20, opacity: 0 });
    gsap.set(".hero-title", { y: 30, opacity: 0 });
    gsap.set(".hero-subtitle", { y: 20, opacity: 0 });
    gsap.set(".hero-actions .btn", { y: 20, opacity: 0 });

    // Animate in
    tl.to(".navbar", { 
        y: 0, 
        opacity: 1, 
        duration: 0.8, 
        ease: "power3.out",
        onComplete: () => {
            // Clear GSAP inline styles so CSS classes like .nav-hidden can work
            gsap.set(".navbar", { clearProps: "y,opacity" });
        }
    })
        .to(".hero-badge", { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.4")
        .to(".hero-title", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.4")
        .to(".hero-subtitle", { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.5")
        .to(".hero-actions .btn", { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: "power2.out" }, "-=0.4");
}

function initScrollAnimations() {
    // Animate Section Headers
    gsap.utils.toArray(".section-header").forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        });
    });

    // Animate Stage Deep Dive
    gsap.from(".stage-deepdive", {
        scrollTrigger: {
            trigger: ".stage-deepdive",
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
    });

    // Animate Timeline Items
    gsap.utils.toArray(".timeline-item").forEach((item) => {
        gsap.to(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleClass: "active",
                once: true
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
        });
    });

    // Animate Manifesto Cards (Staggered)
    gsap.from(".stage-card", {
        scrollTrigger: {
            trigger: ".manifesto-grid",
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
    });

    // Animate Project Cards
    gsap.utils.toArray(".project-card").forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 40,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out"
        });
    });

    // Animate Insight Cards
    gsap.from(".insight-grid > div", {
        scrollTrigger: {
            trigger: ".insight-grid",
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out"
    });

}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Offset for navbar
                const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 100;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Smart Hide Logic: Hide when scrolling down, reveal when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 150) {
            navbar.classList.add('nav-hidden');
        } else {
            navbar.classList.remove('nav-hidden');
        }

        lastScrollY = currentScrollY;
    }, { passive: true });
}
