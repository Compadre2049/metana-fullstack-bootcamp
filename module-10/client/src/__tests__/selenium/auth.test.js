import { By, until } from 'selenium-webdriver';
import { login } from './helpers';

describe('Authentication E2E Tests', () => {
    it('should successfully login with valid credentials', async () => {
        await global.driver.get(`${global.BASE_URL}/login`);

        const emailInput = await global.driver.findElement(By.name('email'));
        const passwordInput = await global.driver.findElement(By.name('password'));
        const submitButton = await global.driver.findElement(By.css('button[type="submit"]'));

        await emailInput.sendKeys('user@example.com');
        await passwordInput.sendKeys('user123');
        await submitButton.click();

        // Wait for navigation element
        await global.driver.wait(
            until.elementLocated(By.css('nav')),
            10000,
            'Navigation not found after login'
        );

        // Wait for URL change
        await global.driver.wait(
            until.urlContains('/blogs'),
            10000,
            'URL did not change to blogs page'
        );

        const currentUrl = await global.driver.getCurrentUrl();
        expect(currentUrl).toBe(`${global.BASE_URL}/blogs`);
    });

    it('should show error message with invalid credentials', async () => {
        await global.driver.get(`${global.BASE_URL}/login`);

        const emailInput = await global.driver.findElement(By.name('email'));
        const passwordInput = await global.driver.findElement(By.name('password'));
        const submitButton = await global.driver.findElement(By.css('button[type="submit"]'));

        await emailInput.sendKeys('wrong@example.com');
        await passwordInput.sendKeys('wrongpassword');
        await submitButton.click();
        // Add a small delay to allow for error state to update
        await global.driver.sleep(1000);

        // Add debug logging
        console.log('Waiting for error message...');

        // Wait for error message with multiple possible selectors
        const errorElement = await global.driver.wait(
            until.elementLocated(By.css('.error, .alert-error, .error-message, [role="alert"], [data-testid="error-message"]')),
            10000,
            'Error message not found'
        );

        // Add debug logging
        const errorText = await errorElement.getText();
        console.log('Found error message:', errorText);

        // More flexible error message check
        expect(errorText.toLowerCase()).toMatch(/(invalid|incorrect|failed|error)/i);
    });
}); 