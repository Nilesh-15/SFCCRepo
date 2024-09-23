(() => {
    function obtainTemplate(borderModificator, type) {
        const template = document.createElement('template');
        template.innerHTML = `<div class="heading_pd m-${type} m-border_${borderModificator}"></div>`;

        return template;
    }

    function setOptions(options, fieldSet, staticUrl) {
        const iconUrl = options.icon ? staticUrl + '/heading-' + options.icon.toLowerCase().replace(/\s*\s/g, '-') + '.svg' : '';
        fieldSet.insertAdjacentHTML('beforeend', options.title ? `<div class="heading_pd-title">${options.title}</div>` :  '');
        fieldSet.insertAdjacentHTML('beforeend', options.subtitle ? `<div class="heading_pd-subtitle">${options.subtitle}</div>` :  '');
        fieldSet.insertAdjacentHTML('beforeend', options.icon ? `<div class="heading_pd-icon"><img src=${iconUrl} alt="" /></div>` :  '');
        fieldSet.insertAdjacentHTML('beforeend', options.content ? `<div class="heading_pd-content">${options.content}</div>` :  '');
        if (options.notification) {
            const div = document.createElement('div');
            div.classList.add('heading_pd-notification');
            div.insertAdjacentHTML('beforeend', options.notification.title ? `<div class="heading_pd-notification_title">${options.notification.title}</div>` :  '');
            div.insertAdjacentHTML('beforeend', options.notification.text ? `<div class="heading_pd-notification_text">${options.notification.text}</div>` :  '');
            fieldSet.appendChild(div);
        }
    }

    subscribe('sfcc:ready', async ({ value, config }) => {
        const { options = {}, localization = {}, staticUrl = '' } = config;

        // Append basic DOM
        const template = obtainTemplate(options.border || 'show', options.type || 'default');
        const clone = document.importNode(template.content, true);
        document.body.appendChild(clone);

        // Set props
        const fieldSet = document.querySelector('.heading_pd');

        setOptions(options || [], fieldSet, staticUrl);
    });
})();
