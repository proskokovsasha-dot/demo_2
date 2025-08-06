class DatingApp {
    constructor() {
        this.config = {
            colors: ['#10367D', '#2D4D9E', '#4A64BF', '#677BDF', '#FF6B6B', '#FF8E8E', '#4ECDC4', '#7EDFD8', '#A05195', '#C27BB3', '#FDCB6E', '#FFEAA7'],
            maxInterests: 5,
            minAge: 18,
            maxAge: 100,
            maxPhotos: 6,
            interests: [
                { id: 'music', name: 'Музыка', emoji: '🎵' },
                { id: 'sports', name: 'Спорт', emoji: '⚽' },
                { id: 'books', name: 'Книги', emoji: '📚' },
                { id: 'travel', name: 'Путешествия', emoji: '✈️' },
                { id: 'art', name: 'Искусство', emoji: '🎨' },
                { id: 'games', name: 'Игры', emoji: '🎮' },
                { id: 'cooking', name: 'Кулинария', emoji: '🍳' },
                { id: 'photography', name: 'Фотография', emoji: '📷' },
                { id: 'movies', name: 'Кино', emoji: '🎬' },
                { id: 'nature', name: 'Природа', emoji: '🌳' },
                { id: 'technology', name: 'Технологии', emoji: '💻' },
                { id: 'fashion', name: 'Мода', emoji: '👗' }
            ],
            zodiacSigns: [
                { id: 'aries', name: 'Овен ♈', dates: '21.03 - 19.04' },
                { id: 'taurus', name: 'Телец ♉', dates: '20.04 - 20.05' },
                { id: 'gemini', name: 'Близнецы ♊', dates: '21.05 - 20.06' },
                { id: 'cancer', name: 'Рак ♋', dates: '21.06 - 22.07' },
                { id: 'leo', name: 'Лев ♌', dates: '23.07 - 22.08' },
                { id: 'virgo', name: 'Дева ♍', dates: '23.08 - 22.09' },
                { id: 'libra', name: 'Весы ♎', dates: '23.09 - 22.10' },
                { id: 'scorpio', name: 'Скорпион ♏', dates: '23.10 - 21.11' },
                { id: 'sagittarius', name: 'Стрелец ♐', dates: '22.11 - 21.12' },
                { id: 'capricorn', name: 'Козерог ♑', dates: '22.12 - 19.01' },
                { id: 'aquarius', name: 'Водолей ♒', dates: '20.01 - 18.02' },
                { id: 'pisces', name: 'Рыбы ♓', dates: '19.02 - 20.03' }
            ],
            lookingForOptions: [
                { id: 'friendship', name: 'Дружба', emoji: '🤝' },
                { id: 'dating', name: 'Романтические отношения', emoji: '💑' },
                { id: 'serious', name: 'Серьёзные отношения', emoji: '💍' },
                { id: 'networking', name: 'Нетворкинг', emoji: '👔' },
                { id: 'travel', name: 'Спутник для путешествий', emoji: '✈️' }
            ],
            // Новые опции для предпочтений по полу
            preferenceOptions: [
                { id: 'male', name: 'Мужчин', emoji: '👨' },
                { id: 'female', name: 'Женщин', emoji: '👩' },
                { id: 'both', name: 'Всех', emoji: '🚻' }
            ]
        };

        this.state = {
            currentStep: 1,
            totalSteps: 9, // Увеличено на 1 для нового шага предпочтений
            userData: {
                name: '',
                gender: '',
                age: '',
                zodiacSign: '',
                city: '',
                description: '',
                interests: [],
                lookingFor: [],
                preference: 'both', // Добавлено предпочтение по полу по умолчанию
                profileColor: '#D7303B',
                avatar: null,
                photos: [],
                location: { lat: null, lng: null }
            },
            suggestedProfiles: [],
            likedProfiles: [],
            passedProfiles: []
        };

        this.initElements();
        this.formHandler = new FormHandler(this);
        this.profileHandler = new ProfileHandler(this);
        this.uiHandler = new UIHandler(this);
        this.discoveryHandler = new DiscoveryHandler(this);

        this.bindEvents();
        this.checkSavedProfile();
        this.showLoadingScreen();
    }

    showLoadingScreen() {
        this.uiHandler.initLogoAnimation(); 

        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            const appContainer = document.getElementById('appContainer');

            loadingScreen.style.opacity = '0'; 

            loadingScreen.addEventListener('transitionend', function handler() {
                loadingScreen.style.display = 'none';
                appContainer.style.display = 'block';
                loadingScreen.removeEventListener('transitionend', handler); 
            }, { once: true });
        }, 1500);
    }

    initElements() {
        this.elements = {
            mainScreen: document.getElementById('mainScreen'),
            registrationForm: document.getElementById('registrationForm'),
            profileView: document.getElementById('profileView'),
            discoveryScreen: document.getElementById('discoveryScreen'),
            startBtn: document.getElementById('startBtn'),
            startDiscoveryBtn: document.getElementById('startDiscoveryBtn'),
            backToProfileFromDiscoveryBtn: document.getElementById('backToProfileFromDiscoveryBtn')
        };
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startRegistration());
        if (this.elements.startDiscoveryBtn) {
            this.elements.startDiscoveryBtn.addEventListener('click', () => this.startDiscovery());
        }
        if (this.elements.backToProfileFromDiscoveryBtn) {
            this.elements.backToProfileFromDiscoveryBtn.addEventListener('click', () => this.showProfile());
        }
    }

    checkSavedProfile() {
        const savedProfile = localStorage.getItem('datingProfile');
        if (savedProfile) {
            try {
                this.state.userData = JSON.parse(savedProfile);
                // Убедимся, что все новые поля инициализированы
                if (!Array.isArray(this.state.userData.interests)) {
                    this.state.userData.interests = [];
                }
                if (!Array.isArray(this.state.userData.lookingFor)) {
                    this.state.userData.lookingFor = [];
                }
                if (!this.state.userData.preference) { // Инициализация нового поля
                    this.state.userData.preference = 'both';
                }
                this.showProfile();
            } catch (e) {
                console.error('Ошибка при загрузке профиля:', e);
                localStorage.removeItem('datingProfile');
            }
        }
    }

    startRegistration() {
        this.switchScreen('registration');
        this.formHandler.renderForm();
    }

    showProfile() {
        this.profileHandler.showProfile();
        this.switchScreen('profile');
    }

    startDiscovery() {
        this.discoveryHandler.startDiscovery();
        this.switchScreen('discovery');
    }

    switchScreen(screenName) {
        this.elements.mainScreen.classList.remove('active');
        this.elements.registrationForm.classList.remove('active');
        this.elements.profileView.classList.remove('active');
        this.elements.discoveryScreen.classList.remove('active');

        if (screenName === 'main') {
            this.elements.mainScreen.classList.add('active');
        } else if (screenName === 'registration') {
            this.elements.registrationForm.classList.add('active');
        } else if (screenName === 'profile') {
            this.elements.profileView.classList.add('active');
        } else if (screenName === 'discovery') {
            this.elements.discoveryScreen.classList.add('active');
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        
        const R = 6371;
        const dLat = this.deg2rad(lat2-lat1);
        const dLon = this.deg2rad(lon2-lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c);
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DatingApp();
});
