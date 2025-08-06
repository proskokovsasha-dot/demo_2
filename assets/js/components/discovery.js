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
            discoveryCard: document.getElementById('discoveryCard'),
            avatar: document.getElementById('discoveryAvatar'),
            name: document.getElementById('discoveryName'),
            age: document.getElementById('discoveryAge'),
            city: document.getElementById('discoveryCity'),
            bio: document.getElementById('discoveryBio'),
            lookingFor: document.getElementById('discoveryLookingFor'),
            interests: document.getElementById('discoveryInterests'),
            likeBtn: document.getElementById('likeBtn'),
            passBtn: document.getElementById('passBtn'),
            noProfilesMessage: document.getElementById('noProfilesMessage')
        };
    }

    setupEventListeners() {
        if (this.elements.likeBtn) {
            this.elements.likeBtn.addEventListener('click', () => this.handleLike());
        }
        if (this.elements.passBtn) {
            this.elements.passBtn.addEventListener('click', () => this.handlePass());
        }
    }

    // Метод для генерации случайных профилей (для демонстрации)
    generateRandomProfiles(count = 20) {
        const profiles = [];
        const namesMale = ['Иван', 'Дмитрий', 'Алексей', 'Сергей', 'Максим', 'Андрей', 'Николай', 'Артем', 'Егор', 'Павел'];
        const namesFemale = ['Анна', 'Мария', 'Елена', 'Ольга', 'Наталья', 'Екатерина', 'София', 'Виктория', 'Дарья', 'Анастасия'];
        const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Сочи', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород', 'Краснодар', 'Самара', 'Уфа'];
        const descriptions = [
            'Люблю путешествовать и открывать новые места.',
            'Увлекаюсь чтением фантастики и настольными играми.',
            'Ищу единомышленников для активного отдыха.',
            'Ценю искренность и чувство юмора.',
            'Программист по профессии, художник в душе.',
            'Обожаю готовить и экспериментировать на кухне.',
            'Мечтаю о кругосветном путешествии.',
            'Занимаюсь спортом и веду здоровый образ жизни.',
            'Ищу вдохновение в повседневных мелочах.',
            'Люблю долгие прогулки и интересные беседы.',
            'Всегда открыт для новых знакомств и приключений.',
            'Ищу человека, с которым можно разделить радости и печали.',
            'Моя жизнь - это постоянное движение и развитие.',
            'Люблю животных и природу.',
            'Увлекаюсь фотографией и созданием контента.'
        ];

        for (let i = 0; i < count; i++) {
            const randomGender = Math.random() > 0.5 ? 'male' : 'female';
            const randomName = randomGender === 'male' 
                ? namesMale[Math.floor(Math.random() * namesMale.length)]
                : namesFemale[Math.floor(Math.random() * namesFemale.length)];
            
            const randomAge = Math.floor(Math.random() * (40 - 20 + 1)) + 20;
            const randomCity = cities[Math.floor(Math.random() * cities.length)];
            const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
            const randomColor = this.app.config.colors[Math.floor(Math.random() * this.app.config.colors.length)];

            const randomLookingFor = [];
            const numLookingFor = Math.floor(Math.random() * 3) + 1; // 1-3 options
            const shuffledLookingFor = [...this.app.config.lookingForOptions].sort(() => 0.5 - Math.random());
            for (let j = 0; j < numLookingFor; j++) {
                randomLookingFor.push(shuffledLookingFor[j].id);
            }

            const randomInterests = [];
            const numInterests = Math.floor(Math.random() * this.app.config.maxInterests) + 1; // 1-maxInterests
            const shuffledInterests = [...this.app.config.interests].sort(() => 0.5 - Math.random());
            for (let j = 0; j < numInterests; j++) {
                randomInterests.push(shuffledInterests[j].id);
            }

            profiles.push({
                id: `profile_${i}`,
                name: randomName,
                age: randomAge,
                gender: randomGender,
                city: randomCity,
                description: randomDescription,
                profileColor: randomColor,
                avatar: `https://picsum.photos/seed/${randomName}${randomAge}${randomGender}/120/120`, // Random avatar image
                photos: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, k) => `https://picsum.photos/seed/${randomName}${randomAge}${randomGender}${k}/100/100`),
                lookingFor: randomLookingFor,
                interests: randomInterests,
                location: { lat: 55.7558 + (Math.random() - 0.5) * 0.1, lng: 37.6173 + (Math.random() - 0.5) * 0.1 } // Moscow area
            });
        }
        return profiles;
    }

    startDiscovery() {
        const allGeneratedProfiles = this.generateRandomProfiles(30); // Увеличим количество для лучшей демонстрации фильтрации
        const userPreference = this.app.state.userData.preference;
        const userGender = this.app.state.userData.gender;

        this.app.state.suggestedProfiles = allGeneratedProfiles.filter(profile => {
            // Исключаем свой пол, если пользователь ищет противоположный
            if (userPreference === 'male' && profile.gender !== 'male') return false;
            if (userPreference === 'female' && profile.gender !== 'female') return false;
            
            // Если пользователь ищет "всех", то показываем всех, кроме себя
            if (userPreference === 'both' && profile.gender === userGender) {
                // Если пользователь ищет "всех", но его пол совпадает с полом профиля,
                // то мы все равно показываем этот профиль, так как "всех" включает и свой пол.
                // Если бы мы хотели исключить свой пол при "both", логика была бы другой.
                // Текущая логика: "both" = male + female.
                // Если пользователь male и ищет both, ему покажут male и female.
                // Если пользователь female и ищет both, ему покажут male и female.
                return true;
            }
            
            // Если пользователь ищет конкретный пол, и этот пол совпадает с полом профиля
            if ((userPreference === 'male' && profile.gender === 'male') || 
                (userPreference === 'female' && profile.gender === 'female')) {
                return true;
            }

            return false;
        });

        // Дополнительная фильтрация: убедиться, что не показываем профиль текущего пользователя (если бы он был в списке)
        // В данном случае, генерируемые профили не включают текущего пользователя, но это хорошая практика.
        this.app.state.suggestedProfiles = this.app.state.suggestedProfiles.filter(profile => profile.id !== this.app.state.userData.id);


        this.app.state.likedProfiles = [];
        this.app.state.passedProfiles = [];
        this.currentIndex = 0;
        this.showNextProfile();
    }

    showNextProfile() {
        if (this.currentIndex >= this.app.state.suggestedProfiles.length) {
            this.elements.discoveryCard.style.display = 'none';
            this.elements.noProfilesMessage.style.display = 'block';
            return;
        }

        this.elements.discoveryCard.style.display = 'flex';
        this.elements.noProfilesMessage.style.display = 'none';

        const profile = this.app.state.suggestedProfiles[this.currentIndex];
        this.renderProfile(profile);
    }

    renderProfile(profile) {
        // Применяем цвет профиля к карточке подборки
        this.app.profileHandler.applyProfileColor(profile.profileColor); // Используем метод из ProfileHandler

        this.elements.name.textContent = profile.name;
        if (profile.gender) {
            const genderEmoji = profile.gender === 'male' ? '👨' : '👩';
            this.elements.name.textContent += ` ${genderEmoji}`;
        }
        this.elements.age.textContent = profile.age ? `${profile.age} лет` : '';
        this.elements.city.textContent = profile.city ? `, ${profile.city}` : '';
        this.elements.bio.textContent = profile.description || 'Пользователь пока ничего о себе не рассказал';
        
        if (profile.avatar) {
            this.elements.avatar.style.backgroundImage = `url(${profile.avatar})`;
            this.elements.avatar.innerHTML = '';
        } else {
            this.elements.avatar.style.backgroundImage = '';
            this.elements.avatar.innerHTML = '<span class="avatar-placeholder">👤</span>';
        }

        // Обновляем разделы "Ищу" и "Интересы" для карточки подборки
        this.updateLookingFor(profile.lookingFor, this.app.config.lookingForOptions, this.elements.lookingFor);
        this.updateInterests(profile.interests, this.app.config.interests, this.elements.interests);

        // Сброс анимации
        this.elements.discoveryCard.style.transition = 'none';
        this.elements.discoveryCard.style.transform = 'translateX(0) rotate(0)';
        this.elements.discoveryCard.style.opacity = '1';
        // Принудительный рефлоу для сброса transition
        void this.elements.discoveryCard.offsetWidth; 
        this.elements.discoveryCard.style.transition = 'all var(--transition-normal) ease';
    }

    updateLookingFor(lookingFor, options, container) {
        if (!container) return;
        container.innerHTML = '';
        if (lookingFor && lookingFor.length > 0) {
            const lookingForContainer = document.createElement('div');
            lookingForContainer.className = 'looking-for-container';
            lookingFor.forEach(optionId => {
                const option = options.find(o => o.id === optionId);
                if (option) {
                    const el = document.createElement('div');
                    el.className = 'looking-for-item';
                    el.innerHTML = `
                        <div class="looking-for-emoji">${option.emoji}</div>
                        <div class="looking-for-text">${option.name}</div>
                    `;
                    lookingForContainer.appendChild(el);
                }
            });
            container.appendChild(lookingForContainer);
        } else {
            container.innerHTML = '<div class="no-data">Не указано, что ищет</div>';
        }
    }

    updateInterests(userInterests, configInterests, container) {
        if (!container) return;
        container.innerHTML = '';
        if (userInterests && userInterests.length > 0) {
            const interestsContainer = document.createElement('div');
            interestsContainer.className = 'interests-container';
            userInterests.forEach(interestId => {
                const interest = configInterests.find(i => i.id === interestId);
                if (interest) {
                    const el = document.createElement('div');
                    el.className = 'interest-item';
                    el.innerHTML = `
                        <div class="interest-emoji">${interest.emoji}</div>
                        <div class="interest-text">${interest.name}</div>
                    `;
                    interestsContainer.appendChild(el);
                }
            });
            container.appendChild(interestsContainer);
        } else {
            container.innerHTML = '<div class="no-data">Интересы не выбраны</div>';
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
        const card = this.elements.discoveryCard;
        card.style.transition = 'all 0.5s ease-out';
        card.style.transform = action === 'like' 
            ? 'translateX(100%) rotate(15deg)' 
            : 'translateX(-100%) rotate(-15deg)';
        card.style.opacity = '0';
    }
}
