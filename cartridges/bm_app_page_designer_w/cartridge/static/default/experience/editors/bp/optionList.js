(() => {
    function obtainTemplate(itemsInRow) {
        const template = document.createElement('template');
        template.innerHTML = `<div class="option_list m-items_${itemsInRow}"></div>`;
        return template;
    }

    function setOptions(options, optgroupEl, selectedValue, staticUrl, hiddenText) {
        options.forEach(option => {
            const iconUrl = staticUrl + '/option-' + option.toLowerCase().replace(/\s*\s/g, '-') + '.svg';
            const isSelected = (option === selectedValue) ? 'checked' : '';
            let label = document.createElement('label');
            label.classList.add('option_list-label');
            label.innerHTML = `
                <input class="option_list-area" type="radio" name="optionList" value="${option}" ${isSelected}/>
                <div class="option_list-item">
                    <img class="option_list-icon" src=${iconUrl} alt="${option.toLowerCase()}" width="30" height="18" />
                    <span class="option_list-text ${hiddenText}">${option}</span>
                </div>
            `
            optgroupEl.appendChild(label);
        });
    }

    subscribe('sfcc:ready', async ({ value, config }) => {
        const { options = {}, staticUrl = '' } = config;
        const defaultValue = options.default ? options.default : null;
        const selectedValue = (value !== null && typeof value.value === 'string') ? value.value : defaultValue;

        // Append basic DOM
        const template = obtainTemplate(options.itemsInRow || 4);
        const clone = document.importNode(template.content, true);
        document.body.appendChild(clone);

        // Set props
        const fieldSet = document.querySelector('.option_list');

        setOptions(options.config || [], fieldSet, selectedValue, staticUrl, options.text || '');

        // Set default value on control setup
        emit({
            type: 'sfcc:value',
            payload: selectedValue ? { value: selectedValue } : null
        });

        // Add change listener
        document.querySelectorAll('input').forEach(item => {
            item.addEventListener('change', event => {
                const val = event.target.value;
                emit({
                    type: 'sfcc:value',
                    payload: val ? { value: val } : null
                });
            });
        })
    });
})();
