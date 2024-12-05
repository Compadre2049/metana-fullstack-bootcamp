import { By, until } from 'selenium-webdriver';

export async function login(driver, email, password) {
    await driver.get(`${global.BASE_URL}/login`);

    const emailInput = await driver.findElement(By.name('email'));
    const passwordInput = await driver.findElement(By.name('password'));
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));

    await emailInput.sendKeys(email);
    await passwordInput.sendKeys(password);
    await submitButton.click();

    // Wait for redirect after successful login
    await driver.wait(
        until.urlContains('/blogs'),
        10000,
        'Login redirect failed'
    );
} 