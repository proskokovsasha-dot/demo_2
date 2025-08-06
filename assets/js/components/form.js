class FormHandler {
    constructor(app) {
        this.app = app;
    }
    
    applyProfileColor(color) {
        this.app.state.userData.profileColor = color;
        localStorage.setItem('datingProfile', JSON.stringify(this.app.state.userData));
        
        document.documentElement.style.setProperty('--primary', color);
        // Для корректного расчета primary-dark, нужно получить RGB компоненты
        const rgb = this.hexToRgb(color);
        if (rgb) {
            document.documentElement.style.setProperty('--primary-rgb', `${rgb.r},${rgb.g},${rgb.b}`);
        }
        document.documentElement.style.setProperty('--primary-dark', this.darkenColor(color, 20));
        document.documentElement.style.setProperty('--primary-light', this.lightenColor(color, 40)); // Добавлено осветление
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }

    hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    renderForm() {
        this.app.elements.registrationForm.innerHTML = `
            <div class="form-container">
                ${this.generateSteps()}
            </div>
        `;
        this.setupFormHandlers();
        this.focusCurrentField();
        this.initColorSelection();
    }

    generateSteps() {
        return Array.from({ length: this.app.state.totalSteps }, (_, i) => i + 1)
            .map(step => this.generateStep(step)).join('');
    }

    generateStep(step) {
        return `
            <div class="form-step ${step === this.app.state.currentStep ? 'active' : ''}" data-step="${step}">
                ${this.getStepContent(step)}
                ${this.getStepButtons(step)}
            </div>
        `;
    }

    getStepContent(step) {
        const stepContents = {
            1: this.getNameStep(),
            2: this.getGenderStep(),
            3: this.getAgeStep(),
            4: this.getZodiacStep(),
            5: this.getCityStep(),
            6: this.getLookingForStep(),
            7: this.getInterestsStep(),
            8: this.getPreferenceStep(),
            9: this.getColorAndPhotosStep()
        };
        return stepContents[step] || '';
    }

    getNameStep() {
        return `
            <h2 class="section-title">Как вас зовут?</h2>
            <p class="section-description">Это поможет другим узнать вас.</p>
            <input type="text" class="input-field" id="userName" 
                   placeholder="Ваше имя" 
                   value="${this.app.state.userData.name || ''}" required>
        `;
    }

    getGenderStep() {
        return `
            <h2 class="section-title">Ваш пол</h2>
            <p class="section-description">Выберите ваш пол.</p>
            <div class="tags-container">
                <div class="tag ${this.app.state.userData.gender === 'male' ? 'selected' : ''}" 
                     data-gender="male">
                    👨 Мужчина
                </div>
                <div class="tag ${this.app.state.userData.gender === 'female' ? 'selected' : ''}" 
                     data-gender="female">
                    👩 Женщина
                </div>
            </div>
        `;
    }

    getAgeStep() {
        return `
            <h2 class="section-title">Сколько вам лет?</h2>
            <p class="section-description">Ваш возраст должен быть от ${this.app.config.minAge} до ${this.app.config.maxAge} лет.</p>
            <input type="number" class="input-field" id="userAge" 
                   min="${this.app.config.minAge}" max="${this.app.config.maxAge}" 
                   placeholder="Ваш возраст" 
                   value="${this.app.state.userData.age || ''}" required>
        `;
    }

    getZodiacStep() {
        return `
            <h2 class="section-title">Ваш знак зодиака</h2>
            <p class="section-description">Выберите ваш знак зодиака.</p>
            <select class="input-field" id="userZodiac">
                <option value="">Выберите знак зодиака</option>
                ${this.app.config.zodiacSigns.map(sign => `
                    <option value="${sign.id}" ${this.app.state.userData.zodiacSign === sign.id ? 'selected' : ''}>
                        ${sign.name} (${sign.dates})
                    </option>
                `).join('')}
            </select>
        `;
    }

    getCityStep() {
        return `
            <h2 class="section-title">Ваш город</h2>
            <p class="section-description">Укажите город, в котором вы живете.</p>
            <input type="text" class="input-field" id="userCity" 
                   placeholder="Где вы живете?" 
                   value="${this.app.state.userData.city || ''}" required>
            <p class="section-description" style="margin-top: 20px;">Разрешить доступ к геолокации для более точного поиска?</p>
            <div class="tags-container">
                <div class="tag" id="allowLocationBtn">
                    🌍 Разрешить доступ
                </div>
                <div class="tag" id="skipLocationBtn">
                    Пропустить
                </div>
            </div>
            <div id="locationStatus" style="margin-top: 15px; color: var(--text-secondary); font-size: 0.9rem;"></div>
        `;
    }

    getLookingForStep() {
        return `
            <h2 class="section-title">Что вы ищете?</h2>
            <p class="section-description">Выберите один или несколько вариантов, которые описывают ваши цели.</p>
            <div class="tags-container">
                ${this.app.config.lookingForOptions.map(option => `
                    <div class="tag ${(this.app.state.userData.lookingFor || []).includes(option.id) ? 'selected' : ''}" 
                         data-looking-for="${option.id}">
                        ${option.emoji} ${option.name}
                    </div>
                `).join('')}
            </div>
        `;
    }

    getInterestsStep() {
        return `
            <h2 class="section-title">Ваши интересы</h2>
            <p class="section-description">Выберите до ${this.app.config.maxInterests} интересов, которые вам близки.</p>
            <div class="tags-container" id="interestsContainer">
                ${this.app.config.interests.map(interest => `
                    <div class="tag ${this.app.state.userData.interests.includes(interest.id) ? 'selected' : ''}" 
                         data-interest="${interest.id}">
                        ${interest.emoji} ${interest.name}
                    </div>
                `).join('')}
            </div>
        `;
    }

    getPreferenceStep() {
        return `
            <h2 class="section-title">Кого вы ищете?</h2>
            <p class="section-description">Выберите, кого вы хотите видеть в подборке анкет.</p>
            <div class="tags-container">
                ${this.app.config.preferenceOptions.map(option => `
                    <div class="tag ${this.app.state.userData.preference === option.id ? 'selected' : ''}" 
                         data-preference="${option.id}">
                        ${option.emoji} ${option.name}
                    </div>
                `).join('')}
            </div>
        `;
    }

    getColorAndPhotosStep() {
        return `
            <h2 class="section-title">Цвет профиля</h2>
            <p class="section-description">Выберите основной цвет для вашего профиля.</p>
            <div class="color-palette">
                ${this.app.config.colors.map(color => `
                    <div class="color-option ${this.app.state.userData.profileColor === color ? 'selected' : ''}" 
                         style="background-color: ${color}" 
                         data-color="${color}"></div>
                `).join('')}
            </div>
            <div class="color-custom">
                <input type="color" id="customColor" value="${this.app.state.userData.profileColor}">
                <label>Или выберите свой цвет</label>
            </div>

            <h2 class="section-title" style="margin-top: 40px;">Ваши фото</h2>
            <p class="section-description">Добавьте до ${this.app.config.maxPhotos} фото, чтобы сделать профиль ярче.</p>
            <div class="avatar-upload">
                <label class="btn btn-secondary">
                    📸 Добавить фото
                    <input type="file" id="photoUpload" accept="image/*" hidden multiple>
                </label>
            </div>
            <div class="photos-grid" id="photosContainer">
                ${this.app.state.userData.photos.map((photo, index) => `
                    <div class="photo-preview ${this.app.state.userData.avatar === photo ? 'main-avatar' : ''}" 
                         style="background-image: url(${photo})">
                        <button class="set-avatar-btn" data-index="${index}">Аватар</button>
                        <button class="delete-photo" data-index="${index}">×</button>
                    </div>
                `).join('')}
            </div>

            <h2 class="section-title" style="margin-top: 40px;">О себе</h2>
            <p class="section-description">Расскажите немного о себе, чтобы другие могли узнать вас лучше.</p>
            <textarea class="input-field" id="userDescription" 
                      placeholder="Я люблю путешествия, книги и..." rows="4">${this.app.state.userData.description || ''}</textarea>
        `;
    }

    getStepButtons(step) {
        return `
            <div class="navigation">
                <button class="btn next-step" ${step === this.app.state.totalSteps ? 'id="saveProfileBtn"' : ''}>
                    ${step === this.app.state.totalSteps ? 'Сохранить профиль' : 'Далее'}
                </button>
                ${step > 1 ? `<button class="btn btn-secondary prev-step">Назад</button>` : ''}
            </div>
        `;
    }

    setupFormHandlers() {
        this.setupNavigationHandlers();
        this.setupGenderHandlers();
        this.setupZodiacHandler();
        this.setupLocationHandlers();
        this.setupLookingForHandlers();
        this.setupInterestsHandlers();
        this.setupPreferenceHandlers();
        this.setupColorHandlers();
        this.setupPhotoHandlers();
        this.setupEnterKeyHandler();
    }

    setupNavigationHandlers() {
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', () => this.handleNextStep());
        });

        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });
    }

    setupGenderHandlers() {
        document.querySelectorAll('[data-gender]').forEach(tag => {
            tag.addEventListener('click', (e) => {
                document.querySelectorAll('[data-gender]').forEach(t => t.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.app.state.userData.gender = e.currentTarget.dataset.gender;
            });
        });
    }

    setupZodiacHandler() {
        const zodiacInput = document.getElementById('userZodiac');
        if (zodiacInput) {
            zodiacInput.addEventListener('change', (e) => {
                this.app.state.userData.zodiacSign = e.target.value;
            });
        }
    }

    setupLocationHandlers() {
        const allowBtn = document.getElementById('allowLocationBtn');
        const skipBtn = document.getElementById('skipLocationBtn');
        const status = document.getElementById('locationStatus');

        if (allowBtn && skipBtn) {
            allowBtn.addEventListener('click', () => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            this.app.state.userData.location = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };
                            status.textContent = '📍 Местоположение определено!';
                            allowBtn.classList.add('selected');
                            skipBtn.classList.remove('selected');
                        },
                        (error) => {
                            status.textContent = 'Не удалось определить местоположение';
                            console.error(error);
                        }
                    );
                } else {
                    status.textContent = 'Геолокация не поддерживается вашим браузером';
                }
            });

            skipBtn.addEventListener('click', () => {
                this.app.state.userData.location = { lat: null, lng: null };
                status.textContent = 'Вы можете указать местоположение позже';
                skipBtn.classList.add('selected');
                allowBtn.classList.remove('selected');
            });
        }
    }

    setupLookingForHandlers() {
        document.querySelectorAll('[data-looking-for]').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const option = e.currentTarget.dataset.lookingFor;
                const isSelected = e.currentTarget.classList.contains('selected');
                
                if (isSelected) {
                    e.currentTarget.classList.remove('selected');
                    this.app.state.userData.lookingFor = this.app.state.userData.lookingFor.filter(i => i !== option);
                } else {
                    e.currentTarget.classList.add('selected');
                    this.app.state.userData.lookingFor.push(option);
                }
            });
        });
    }

    setupInterestsHandlers() {
        document.querySelectorAll('[data-interest]').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const interestId = e.currentTarget.dataset.interest;
                const isSelected = e.currentTarget.classList.contains('selected');
                
                if (isSelected) {
                    e.currentTarget.classList.remove('selected');
                    this.app.state.userData.interests = this.app.state.userData.interests.filter(i => i !== interestId);
                } else {
                    if (this.app.state.userData.interests.length < this.app.config.maxInterests) {
                        e.currentTarget.classList.add('selected');
                        this.app.state.userData.interests.push(interestId);
                    } else {
                        alert(`Вы можете выбрать не более ${this.app.config.maxInterests} интересов.`);
                    }
                }
            });
        });
    }

    setupPreferenceHandlers() {
        document.querySelectorAll('[data-preference]').forEach(tag => {
            tag.addEventListener('click', (e) => {
                document.querySelectorAll('[data-preference]').forEach(t => t.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.app.state.userData.preference = e.currentTarget.dataset.preference;
            });
        });
    }

    setupColorHandlers() {
        document.querySelectorAll('[data-color]').forEach(color => {
            color.addEventListener('click', (e) => {
                const selectedColor = e.currentTarget.dataset.color;
                this.updateColorSelection(selectedColor);
            });
        });

        const customColor = document.getElementById('customColor');
        if (customColor) {
            customColor.addEventListener('input', (e) => {
                const selectedColor = e.target.value;
                this.updateColorSelection(selectedColor);
            });
        }
    }

    setupPhotoHandlers() {
        const upload = document.getElementById('photoUpload');
        if (upload) {
            upload.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                if (files.length + this.app.state.userData.photos.length > this.app.config.maxPhotos) {
                    alert(`Можно загрузить не более ${this.app.config.maxPhotos} фото`);
                    return;
                }

                files.forEach(file => {
                    if (file.type.match('image.*')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            this.app.state.userData.photos.push(e.target.result);
                            if (!this.app.state.userData.avatar) {
                                this.app.state.userData.avatar = e.target.result;
                            }
                            this.renderPhotos();
                        };
                        reader.readAsDataURL(file);
                    }
                });
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-photo')) {
                const index = parseInt(e.target.dataset.index);
                const photoToDelete = this.app.state.userData.photos[index];
                
                if (this.app.state.userData.avatar === photoToDelete) {
                    this.app.state.userData.avatar = this.app.state.userData.photos.length > 1 ? 
                        this.app.state.userData.photos.find((_, i) => i !== index) : null;
                }
                
                this.app.state.userData.photos.splice(index, 1);
                this.renderPhotos();
            }

            if (e.target.classList.contains('set-avatar-btn')) {
                const index = parseInt(e.target.dataset.index);
                this.app.state.userData.avatar = this.app.state.userData.photos[index];
                this.renderPhotos();
            }
        });
    }

    setupEnterKeyHandler() {
        document.querySelectorAll('.input-field').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleNextStep();
                }
            });
        });
    }

    initColorSelection() {
        const savedColor = this.app.state.userData.profileColor || '#FF6B6B';
        this.updateColorSelection(savedColor);
    }

    updateColorSelection(selectedColor) {
        this.app.state.userData.profileColor = selectedColor;
        
        const darkerColor = this.darkenColor(selectedColor, 20);
        const lighterColor = this.lightenColor(selectedColor, 40); // Используем новую функцию
        const rgb = this.hexToRgb(selectedColor);
        
        document.documentElement.style.setProperty('--primary', selectedColor);
        document.documentElement.style.setProperty('--primary-dark', darkerColor);
        document.documentElement.style.setProperty('--primary-light', lighterColor); // Устанавливаем новую переменную
        if (rgb) {
            document.documentElement.style.setProperty('--primary-rgb', `${rgb.r},${rgb.g},${rgb.b}`);
        }
        
        this.updateColorPalette(selectedColor);
        this.updateCustomColorInput(selectedColor);
    }

    updateColorPalette(color) {
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === color) {
                option.classList.add('selected');
            }
        });
    }

    updateCustomColorInput(color) {
        const customColorInput = document.getElementById('customColor');
        if (customColorInput) {
            customColorInput.value = color;
        }
    }

    renderPhotos() {
        const container = document.getElementById('photosContainer');
        if (container) {
            container.innerHTML = this.app.state.userData.photos.map((photo, index) => `
                <div class="photo-preview ${this.app.state.userData.avatar === photo ? 'main-avatar' : ''}" 
                     style="background-image: url(${photo})">
                    <button class="set-avatar-btn" data-index="${index}">Аватар</button>
                    <button class="delete-photo" data-index="${index}">×</button>
                </div>
            `).join('');
        }
    }

    handleNextStep() {
        if (this.app.state.currentStep === this.app.state.totalSteps) {
            this.saveProfile();
        } else {
            this.nextStep();
        }
    }

    nextStep() {
        if (!this.validateStep()) return;
        this.saveStepData();
        this.goToStep(this.app.state.currentStep + 1);
    }

    prevStep() {
        this.goToStep(this.app.state.currentStep - 1);
    }

    goToStep(step) {
        if (step < 1 || step > this.app.state.totalSteps) return;
        
        const currentStepEl = document.querySelector('.form-step.active');
        if (currentStepEl) {
            currentStepEl.classList.remove('active');
        }
        
        this.app.state.currentStep = step;
        const nextStepEl = document.querySelector(`[data-step="${step}"]`);
        
        if (nextStepEl) {
            nextStepEl.classList.add('active');
            // nextStepEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Отключено, так как может мешать анимации
            this.focusCurrentField();
        }
    }

    validateStep() {
        switch(this.app.state.currentStep) {
            case 1:
                if (!document.getElementById('userName').value.trim()) {
                    alert('Пожалуйста, введите ваше имя.');
                    return false;
                }
                return true;
            case 2:
                if (!this.app.state.userData.gender) {
                    alert('Пожалуйста, выберите ваш пол.');
                    return false;
                }
                return true;
            case 3:
                const age = parseInt(document.getElementById('userAge').value);
                if (isNaN(age) || age < this.app.config.minAge || age > this.app.config.maxAge) {
                    alert(`Пожалуйста, введите корректный возраст (от ${this.app.config.minAge} до ${this.app.config.maxAge} лет).`);
                    return false;
                }
                return true;
            case 5:
                if (!document.getElementById('userCity').value.trim()) {
                    alert('Пожалуйста, укажите ваш город.');
                    return false;
                }
                return true;
            case 6:
                if (this.app.state.userData.lookingFor.length === 0) {
                    alert('Пожалуйста, укажите, что вы ищете.');
                    return false;
                }
                return true;
            case 7:
                if (this.app.state.userData.interests.length === 0) {
                    alert('Пожалуйста, выберите хотя бы один интерес.');
                    return false;
                }
                return true;
            case 8:
                if (!this.app.state.userData.preference) {
                    alert('Пожалуйста, выберите, кого вы ищете.');
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    saveStepData() {
        switch(this.app.state.currentStep) {
            case 1:
                this.app.state.userData.name = document.getElementById('userName').value.trim();
                break;
            case 3:
                this.app.state.userData.age = document.getElementById('userAge').value;
                break;
            case 4:
                this.app.state.userData.zodiacSign = document.getElementById('userZodiac').value;
                break;
            case 5:
                this.app.state.userData.city = document.getElementById('userCity').value.trim();
                break;
            case 9:
                this.app.state.userData.description = document.getElementById('userDescription').value.trim();
                break;
        }
    }

    focusCurrentField() {
        const activeStep = document.querySelector('.form-step.active');
        const input = activeStep?.querySelector('input:not([type="hidden"]), textarea, select');
        input?.focus();
    }

    saveProfile() {
        if (!this.validateStep()) return;
        this.saveStepData();
        
        localStorage.setItem('datingProfile', JSON.stringify(this.app.state.userData));
        this.app.showProfile();
    }
}
