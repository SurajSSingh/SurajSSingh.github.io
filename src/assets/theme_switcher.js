const THEME = "theme";
const DARK = "dark";
const LIGHT = "light";

const JAM_MOON_SVG = `🌙`;
const JAM_SUN_SVG = `☀️`;

let localTheme = localStorage.getItem(THEME);
if (localTheme === DARK) {
    setTheme(DARK, document.querySelector('#theme-switch'));
}
else if (localTheme === LIGHT) {
    setTheme(LIGHT, document.querySelector('#theme-switch'));
}
else if (
    !localTheme &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
) {
    setTheme(DARK, document.querySelector('#theme-switch'));
}
else {
    setTheme(LIGHT, document.querySelector('#theme-switch'));
}

function setTheme(theme, el) {
    const bodyClass = document.body.classList;
    if (theme === DARK) {
        bodyClass.add("dark");
        el.innerHTML = JAM_MOON_SVG;
        localStorage.setItem(THEME, DARK);
    }
    else if (theme === LIGHT) {
        bodyClass.remove("dark");
        el.innerHTML = JAM_SUN_SVG;
        localStorage.setItem(THEME, LIGHT);
    }
}

function switchMode(el) {
    const bodyClass = document.body.classList;
    if (bodyClass.contains("dark")) {
        setTheme(LIGHT, el);
    }
    else {
        setTheme(DARK, el);
    }
}