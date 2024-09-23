(() => {
    const defaultPalette = {
        'Black': '#000000',
        'Dark grey': '#404040',
        'Grey': '#BABABA',
        'Light grey': '#F2F2F2',
        'White': '#FFFFFF',
        'Main blue': '#3466E5',
        'Secondary blue': '#1641AC',
        'Light blue': '#F6F8FE',
        'Main green': '#2F7F33',
        'Secondary green': '#174A19',
        'Light green': '#EFF5F0',
        'Main yellow': '#F5A524',
        'Secondary yellow': '#ff8214',
        'Main red': '#D60000',
        'Secondary red': '#ad0000',
        'Main pink': '#BD004F',
        'Secondary pink': '#9E0042',
        'Light pink 30%': '#FFDBEA',
        'Light yellow': '#FEF3E1',
        'Light pink 20%':'#FFE6E6'
    };

    function appendPalette(options, datalist) {
        for (let [name, color] of Object.entries(options)) {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.classList.add('colorpicker-color_area');
            input.type = 'radio';
            input.name = 'colorExt';
            input.value = color;
            const div = document.createElement('div');
            div.classList.add('colorpicker-color_item');
            div.innerHTML = `<span class="colorpicker-tip" style="background-color: ${color};"></span><span class="colorpicker-name">${name}</span>`;
            label.appendChild(input);
            label.appendChild(div);
            datalist.appendChild(label);
        };
    }

    function obtainTemplate() {
        const template = document.createElement('template');
        template.innerHTML = `
        <div class="colorpicker-wrapper" id="colorpicker-wrapper">
            <div id="colorpicker-value" class="colorpicker-value m-no_value">
                <span class="colorpicker-tip" id="colorpicker-tip"></span><span id="colorpicker-name" class="colorpicker-name"></span>
             </div>
             <button type="reset" class="colorpicker-reset" id="colorpicker-reset">Clear</button>
        </div>
        <div class="colorpicker-palette_wrapper">
            <div id="colorpicker-palette_color" class="colorpicker-palette_color"></div>
            <div class="colorpicker-palette_inner">
                <input class="colorpicker-add_color" type="color" id="colorpicker-add_color" />
                <div class="colorpicker-choose_color" id="colorpicker-choose_color">Choose another color</div>
            </div>
        </div>
        `;
        return template;
    }

    function setActiveColor(colorInput, colorName, colorTip, value) {
        let hasLabel= '';
        for (let [name, color] of Object.entries(defaultPalette)) {
            if (value === color) {
                hasLabel = name;
            }
        }
        colorName.textContent = hasLabel ? hasLabel : value;
        colorTip.style.backgroundColor = value;
        colorInput.classList.toggle('m-no_value', value === null);
    }

    function activeColorExt() {
        const activeColorExt = document.querySelector("[name='colorExt']:checked");
        if (activeColorExt !== null) {
            activeColorExt.checked = false;
        }
    }

    function toggleWrapper(wrapper) {
        wrapper.classList.toggle('m-open');
    }

    listen('sfcc:ready', async ({ value, config }) => {
        const { options = {}, localization = {}} = config;
        const defaultValue = options.default ? options.default : null;
        const preSelectedValue = (value !== null && typeof value.value === 'string') ? value.value : defaultValue;

        // Append basic DOM
        const template = obtainTemplate(localization);
        const clone = document.importNode(template.content, true);
        document.body.appendChild(clone);

        const colorPickerWrapper = document.getElementById('colorpicker-wrapper');
        const colorPicker = document.getElementById('colorpicker-add_color');
        const colorPalette = document.getElementById('colorpicker-palette_color');
        const resetButton = document.getElementById('colorpicker-reset');
        const colorName = document.getElementById('colorpicker-name');
        const colorInput = document.getElementById('colorpicker-value');
        const colorTip = document.getElementById('colorpicker-tip');
        const chooseColorBtn = document.getElementById('colorpicker-choose_color');

        appendPalette(options.config || defaultPalette, colorPalette);

        // Set default value on control setup
        setActiveColor(colorInput, colorName, colorTip, preSelectedValue);
        emit({
            type: 'sfcc:value',
            payload: { value: preSelectedValue ? preSelectedValue : null }
        });

        // Add change listener
        colorPicker.addEventListener('change', event => {
            const currentValue = event.target.value;
            setActiveColor(colorInput, colorName, colorTip, currentValue);
            activeColorExt();
            colorPicker.parentElement.classList.add('m-checked');
            chooseColorBtn.textContent = 'Choose a custom color';
            emit({
                type: 'sfcc:value',
                payload: { value: currentValue }
            });
        });

        colorPicker.addEventListener('blur', () => {
            toggleWrapper(colorPickerWrapper);
        });

        colorPalette.addEventListener('change', event => {
            if (event.target.checked) {
                const currentValue = event.target.value;
                setActiveColor(colorInput, colorName, colorTip, currentValue);
                colorPicker.parentElement.classList.remove('m-checked');
                chooseColorBtn.textContent = 'Choose another color';
                toggleWrapper(colorPickerWrapper);
                emit({
                    type: 'sfcc:value',
                    payload: { value: currentValue }
                });
            }
        });

        colorInput.addEventListener('click', () => {
            toggleWrapper(colorPickerWrapper);
        });

        resetButton.addEventListener('click', () => {
            activeColorExt();
            setActiveColor(colorInput, colorName, colorTip, null);
            colorPicker.parentElement.classList.remove('m-checked');
            emit({
                type: 'sfcc:value',
                payload: { value: null }
            });
        })
    });
})();
