/**
 * ==========================================================================
 * GRT ARCADE OS - ARCHITECTURAL CORE ENGINE & ROUTER MANAGEMENT SYSTEM
 * ==========================================================================
 */

"use strict";

class GRTArcadeOS {
    constructor() {
        this.state = {
            isSystemBooted: false,
            isAudioMuted: false,
            activeViewport: "dashboard-home",
            activeGameInstance: null
        };
        
        // Internal Hardware Level Hook Registers
        this.dom = {};
        this.backgroundEngine = null;
        this.audioEngine = null;
        
        window.addEventListener("DOMContentLoaded", () => this.bootUpSequencePipeline());
    }

    /**
     * Executes orchestration of individual setup vectors sequentially.
     */
    async bootUpSequencePipeline() {
        this.cacheDOMReferences();
        this.initializeAmbientMatrixBackground();
        this.initializeAudioEngineMock();
        
        await this.runTerminalTextAnimation();
        this.transitionToCoreDashboardHub();
        this.registerSystemEventInterceptors();
    }

    cacheDOMReferences() {
        this.dom.body = document.body;
        this.dom.bootScreen = document.getElementById("boot-sequence-container");
        this.dom.bootFill = document.querySelector(".boot-progress-bar-fill");
        this.dom.terminalLines = document.querySelectorAll(".terminal-line");
        this.dom.dashboardWrapper = document.getElementById("core-dashboard-wrapper");
        this.dom.hudTabs = document.querySelectorAll(".hud-tab-btn");
        this.dom.viewportSections = document.querySelectorAll(".viewport-section");
        this.dom.globalMuteBtn = document.getElementById("global-mute-toggle");
        this.dom.exitRuntimeBtn = document.getElementById("runtime-exit-to-hub-btn");
        this.dom.runtimeViewport = document.getElementById("game-runtime-viewport");
        this.dom.runtimeTitle = document.getElementById("runtime-active-game-title");
    }

    /**
     * Spawns an asynchronous timer-based UI terminal sequencer mimicking kernel boot routines.
     */
    runTerminalTextAnimation() {
        return new Promise((resolve) => {
            let completedLines = 0;
            const totalLines = this.dom.terminalLines.length;

            this.dom.terminalLines.forEach((line) => {
                const delay = parseInt(line.getAttribute("data-delay") || "0", 10);
                setTimeout(() => {
                    line.classList.add("visible");
                    completedLines++;
                    
                    // Update linear visual progression meter
                    const progressPercentage = (completedLines / totalLines) * 100;
                    if (this.dom.bootFill) {
                        this.dom.bootFill.style.width = `${progressPercentage}%`;
                    }

                    if (completedLines === totalLines) {
                        setTimeout(resolve, 600); // Terminal visual confirmation dwell
                    }
                }, delay);
            });
        });
    }

    /**
     * Smoothly tears down the boot screen via standard GSAP abstractions if available, else structural classes.
     */
    transitionToCoreDashboardHub() {
        this.state.isSystemBooted = true;
        this.dom.body.classList.remove("os-loading");

        if (typeof gsap !== "undefined") {
            gsap.to(this.dom.bootScreen, {
                opacity: 0,
                duration: 0.8,
                ease: "power4.out",
                onComplete: () => {
                    this.dom.bootScreen.style.display = "none";
                    this.dom.dashboardWrapper.classList.remove("hidden");
                    gsap.from(this.dom.dashboardWrapper, { opacity: 0, y: 20, duration: 0.6 });
                }
            });
        } else {
            this.dom.bootScreen.style.display = "none";
            this.dom.dashboardWrapper.classList.remove("hidden");
        }
    }

    /**
     * Spawns a dedicated HTML5 2D canvas procedural array to draw moving network paths.
     */
    initializeAmbientMatrixBackground() {
        const canvas = document.getElementById("ambient-matrix-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let points = [];
        const maxPoints = 45;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        // Populate geometric structural arrays
        for (let i = 0; i < maxPoints; i++) {
            points.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 1.5 + 1
            });
        }

        const renderLoop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(11, 15, 25, 1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Subtle Grid Render Step
            ctx.strokeStyle = "rgba(0, 243, 255, 0.02)";
            ctx.lineWidth = 1;
            const gridSize = 60;
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }

            // Draw Nodes & Constellation Rays
            points.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0, 243, 255, 0.25)";
                ctx.fill();

                for (let j = index + 1; j < points.length; j++) {
                    const p2 = points[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 180) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(138, 43, 226, ${0.07 * (1 - dist / 180)})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            });

            this.backgroundEngine = requestAnimationFrame(renderLoop);
        };
        renderLoop();
    }

    /**
     * Provides unified framework hooks for real-time sound triggering.
     */
    initializeAudioEngineMock() {
        this.audioEngine = {
            playUiClick: () => {
                if (this.state.isAudioMuted) return;
                // Hook ready for concrete initialization: new Howl({ src: ['assets/audio/click.mp3'] }).play();
            },
            playEngineBoot: () => { /* Emits structural sound arrays */ }
        };
    }

    registerSystemEventInterceptors() {
        // Navigation Interceptor
        this.dom.hudTabs.forEach((tab) => {
            tab.addEventListener("click", (e) => {
                this.audioEngine.playUiClick();
                const targetView = e.currentTarget.getAttribute("data-target");
                this.switchActiveSystemViewport(targetView);
            });
        });

        // Global Mute Interface Component Hardware Link
        if (this.dom.globalMuteBtn) {
            this.dom.globalMuteBtn.addEventListener("click", () => {
                this.state.isAudioMuted = !this.state.isAudioMuted;
                this.dom.globalMuteBtn.style.opacity = this.state.isAudioMuted ? "0.3" : "1";
            });
        }

        // Catch Game Execution Directives from Cards and Banners
        document.querySelectorAll("[data-game]").forEach((trigger) => {
            trigger.addEventListener("click", (e) => {
                e.stopPropagation();
                this.audioEngine.playUiClick();
                const gameKey = e.currentTarget.getAttribute("data-game");
                this.bootModularGameSandbox(gameKey);
            });
        });

        // Runtime Shutdown / Exit to Main Hub Routine
        if (this.dom.exitRuntimeBtn) {
            this.dom.exitRuntimeBtn.addEventListener("click", () => {
                this.audioEngine.playUiClick();
                this.shutdownActiveGameSandbox();
            });
        }
    }

    switchActiveSystemViewport(targetViewId) {
        this.dom.viewportSections.forEach((section) => {
            if (section.id === targetViewId) {
                section.classList.remove("hidden");
            } else {
                section.classList.add("hidden");
            }
        });

        this.dom.hudTabs.forEach((tab) => {
            if (tab.getAttribute("data-target") === targetViewId) {
                tab.classList.add("active");
            } else {
                tab.classList.remove("active");
            }
        });
        
        this.state.activeViewport = targetViewId;
    }

    /**
     * Initializes a modular engine within the isolated canvas sandbox.
     */
    bootModularGameSandbox(gameKey) {
        this.switchActiveSystemViewport("game-runtime-viewport");
        this.dom.runtimeTitle.innerText = `RUNNING: ${gameKey.toUpperCase()} ENGINE`;
        
        // Canvas execution contexts clear down cleanly
        const canvas = document.getElementById("modular-game-runtime-canvas");
        const ctx = canvas.getContext("2d");
        
        // Mount temporary loop array to prove execution capability
        this.state.activeGameInstance = {
            type: gameKey,
            loopId: null,
            frame: 0
        };

        const gameLoop = () => {
            if (!this.state.activeGameInstance) return;
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = "20px JetBrains Mono";
            ctx.fillStyle = "#00f3ff";
            ctx.textAlign = "center";
            ctx.fillText(`CORE MODULAR ENGINE STANDBY [${this.state.activeGameInstance.type.toUpperCase()}]`, canvas.width / 2, canvas.height / 2);
            
            this.state.activeGameInstance.frame++;
            this.state.activeGameInstance.loopId = requestAnimationFrame(gameLoop);
        };
        
        // Force synchronous internal dimension configuration matching aspect bindings
        canvas.width = 1280;
        canvas.height = 720;
        gameLoop();
    }

    /**
     * De-allocates loops and frame events to prevent process leaks.
     */
    shutdownActiveGameSandbox() {
        if (this.state.activeGameInstance) {
            cancelAnimationFrame(this.state.activeGameInstance.loopId);
            this.state.activeGameInstance = null;
        }
        this.switchActiveSystemViewport("dashboard-home");
    }
}

// Global Core Orchestration Deployment Execution
const SystemInstance = new GRTArcadeOS();
export default SystemInstance;
