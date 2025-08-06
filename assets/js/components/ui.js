class UIHandler {
    constructor(app) {
        this.app = app;
    }

    initLogoAnimation() {
        const logoPaths = document.querySelectorAll('.logo-path');
        logoPaths.forEach(path => {
            path.style.strokeDasharray = '150';
            path.style.strokeDashoffset = '150';
            setTimeout(() => {
                path.style.animation = 'drawLogo 1.5s ease-out forwards';
            }, 300);
        });
    }
}