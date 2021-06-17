var themeMap = new Map([
    [NaN, 'photon-dark'],
    ['dark', 'photon-dark'], 
    ['light', 'github-light'],
]);

var theme = getTheme();
setTheme(theme);
if (document.getElementById('comments')) {
    // refer to https://github.com/utterance/utterances/issues/170
    // wait for utterances to load and send it's first message.
    addEventListener('message', event => {
        if (event.origin !== 'https://utteranc.es') {
            return;
        }
        doPostUtterances(theme);
    });
}

var theme_btn = document.getElementById('theme-btn');
if (theme_btn) {
    theme_btn.addEventListener('click', () => {
        var theme = rev(getTheme());
        setTheme(theme);
        theme_btn.classList.toggle('dark');
        theme_btn.classList.toggle('light');
        if (document.getElementById('comments')) {
            doPostUtterances(theme);
        }
    });
}

function doPostUtterances(theme) {
    const message = {
        type: 'set-theme',
        theme: themeMap.get(theme)
    };
    const utterances = document.querySelector('iframe').contentWindow;
    utterances.postMessage(message, 'https://utteranc.es'); // try event.source instead
}

function getTheme() {
    let curTheme = document.body.getAttribute('data-theme');
    if (!curTheme) {
        curTheme = window.localStorage.getItem("data-theme");
    }
    return code(curTheme);
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    window.localStorage.setItem("data-theme", theme);
}

function rev(theme) {
    return theme === 'light' ? 'dark' : 'light';
}

function code(theme) {
    return theme === 'light' ? 'light' : 'dark';
}
