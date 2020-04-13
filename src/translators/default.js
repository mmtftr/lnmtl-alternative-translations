export default class ProviderSettings {
    constructor() {}
    get stylesheet() {
        return (
            this.themes[this.selectedTheme] +
            `.${this.className} {cursor:pointer; border-left: 3px solid ${this.borderColor}!important;position:relative;}
            .${this.className}.translateLib::before {
                content: '';
                width: 100%;
                height: 100%;
                display: block;
                position: absolute;
                background-color: ${this.borderColor};
                opacity: 0.2;
                z-index: -1;
            }
            .${this.className} sentence {
                margin-left:15px;
            }

            `
        )
    }
}
