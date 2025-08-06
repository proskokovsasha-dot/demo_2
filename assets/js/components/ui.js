class UIHandler {
    constructor(app) {
        this.app = app;
    }

    initLogoAnimation() {
        const logoPaths = document.querySelectorAll('.logo-path');
        logoPaths.forEach(path => {
            path.style.strokeDasharray = '150';
            path.style.strokeDashoffset = '150';
            if (!path.dataset.animated) {
                setTimeout(() => {
                    path.style.animation = 'drawLogo 1.5s ease-out forwards';
                    path.dataset.animated = 'true';
                }, 300);
            }
        });
    }
}