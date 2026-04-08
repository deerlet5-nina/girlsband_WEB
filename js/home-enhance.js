document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('home-page')) {
        return;
    }

    const revealTargets = document.querySelectorAll(
        '.hero-showcase, .carousel, .featured-bands, .music-player, .game-promo, .search-container, footer'
    );

    revealTargets.forEach((element) => {
        element.classList.add('reveal-on-scroll');
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.18
    });

    revealTargets.forEach((element) => revealObserver.observe(element));

    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const sliderContainer = document.querySelector('.slider-container');

    if (slider && slides.length > 1 && sliderContainer) {
        const dotWrap = document.createElement('div');
        dotWrap.className = 'carousel-dots';

        const dots = Array.from(slides, (_, index) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.type = 'button';
            dot.setAttribute('aria-label', `切换到第 ${index + 1} 张轮播图`);
            dot.addEventListener('click', () => {
                slider.style.transform = `translateX(-${index * 100}%)`;
                updateDots(index);
            });
            dotWrap.appendChild(dot);
            return dot;
        });

        sliderContainer.insertAdjacentElement('afterend', dotWrap);

        const updateDots = (index) => {
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        const getCurrentIndex = () => {
            const transformValue = slider.style.transform || window.getComputedStyle(slider).transform;
            if (!transformValue || transformValue === 'none') {
                return 0;
            }

            const matrix = transformValue.match(/matrix.*\((.+)\)/);
            if (!matrix) {
                const match = transformValue.match(/-([0-9.]+)%/);
                return match ? Math.round(parseFloat(match[1]) / 100) : 0;
            }

            const values = matrix[1].split(',').map((value) => parseFloat(value.trim()));
            const translateX = values[4] || 0;
            const width = sliderContainer.clientWidth || 1;
            return Math.min(slides.length - 1, Math.max(0, Math.round(Math.abs(translateX) / width)));
        };

        const transformObserver = new MutationObserver(() => {
            updateDots(getCurrentIndex());
        });

        transformObserver.observe(slider, {
            attributes: true,
            attributeFilter: ['style']
        });

        updateDots(0);
    }
});
