import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

beforeAll(async () => {
    // Set up Chrome options
    const options = new chrome.Options();
    options.addArguments('--headless'); // Run in headless mode
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    // Create the WebDriver instance
    global.driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    // Set base URL
    global.BASE_URL = process.env.REACT_APP_URL || 'http://localhost:3000';
});

afterAll(async () => {
    if (global.driver) {
        await global.driver.quit();
    }
});
