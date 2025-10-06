// Version tracking for the application
export const VERSION_INFO = {
    major: 4,
    minor: 2,
    patch: 2,
    build: Date.now(),
    timestamp: new Date().toISOString()
};
export const CURRENT_APP_VERSION = '4.2.2';
export const getVersionString = () => {
    const { major, minor, patch } = VERSION_INFO;
    const buildDate = new Date(VERSION_INFO.build);
    const buildString = buildDate.toISOString().slice(0, 16).replace('T', '.');
    return `v${major}.${minor}.${patch}.${buildString}`;
};
export const getSimpleVersion = () => {
    const { major, minor, patch } = VERSION_INFO;
    const buildNumber = Math.floor(VERSION_INFO.build / 1000) % 10000;
    return `v${major}.${minor}.${patch}.${buildNumber}`;
};
