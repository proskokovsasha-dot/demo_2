class DiscoveryHandler {
    constructor(app) {
        this.app = app;
        this.currentIndex = 0;
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
    }

    cacheElements() {
        this.elements = {
            avatar: document.getElementById('discoveryAvatar'),
            name: document.getElementById('discoveryName'),
            age: document.getElementById('discoveryAge'),
            city: document.getElementById('discoveryCity'),
            bio: document.getElementById('discoveryBio'),
            likeBtn: document.getElementById('likeBtn'),
            passBtn: document.getElementById('passBtn')
        };
    }

    showNextProfile() {
        if (this.currentIndex >= this.app.state.suggestedProfiles.length) {
            this.currentIndex = 0;
        }

        const profile = this.app.state.suggestedProfiles[this.currentIndex];
        this.renderProfile(profile);
    }

    renderProfile(profile) {
        this.elements.name.textContent = profile.name;
        this.elements.age.textContent = `${profile.age} лет`;
        this.elements.city.textContent = profile.city;
        this.elements.bio.textContent = profile.description;
        
        // Применяем цвет профиля
        document.documentElement.style.setProperty('--primary', profile.profileColor);
        
        if (profile.avatar) {
            this.elements.avatar.style.backgroundImage = `url(${profile.avatar})`;
        } else {
            this.elements.avatar.style.backgroundImage = '';
            this.elements.avatar.innerHTML = '<span class="avatar-placeholder">👤</span>';
        }
    }

    handleLike() {
        const profile = this.app.state.suggestedProfiles[this.currentIndex];
        this.app.state.likedProfiles.push(profile);
        this.animateCard('like');
        this.currentIndex++;
        setTimeout(() => this.showNextProfile(), 500);
    }

    handlePass() {
        const profile = this.app.state.suggestedProfiles[this.currentIndex];
        this.app.state.passedProfiles.push(profile);
        this.animateCard('pass');
        this.currentIndex++;
        setTimeout(() => this.showNextProfile(), 500);
    }

    animateCard(action) {
        const card = document.querySelector('.discovery-card');
        card.style.transform = action === 'like' 
            ? 'translateX(100px) rotate(15deg)' 
            : 'translateX(-100px) rotate(-15deg)';
        card.style.opacity = '0';
        
        setTimeout(() => {
            card.style.transform = '';
            card.style.opacity = '';
        }, 500);
    }
}