import { By, until } from 'selenium-webdriver';
import { login } from './helpers';

describe('Blog Features E2E Tests', () => {
    beforeEach(async () => {
        await global.driver.get(global.BASE_URL);
        await global.driver.manage().deleteAllCookies();
    });

    it('can create a new blog post', async () => {
        console.log('Starting blog creation test...');

        // Login first
        await login(global.driver, 'user@example.com', 'user123');
        console.log('Login successful');

        // Navigate to blog creation page
        await global.driver.get(`${global.BASE_URL}/blogs/create`);
        console.log('Navigated to blog creation page');

        // Wait for form to be loaded
        const form = await global.driver.wait(
            until.elementLocated(By.css('form')),
            10000,
            'Blog creation form not found'
        );
        console.log('Form found');

        // Fill in the form
        await global.driver.findElement(By.id('title')).sendKeys('Test Blog Title');
        await global.driver.findElement(By.id('content')).sendKeys('Test Blog Content');
        console.log('Form filled');

        // Submit the form
        const submitButton = await global.driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        console.log('Form submitted');

        // Wait for success (redirect to blogs page)
        await global.driver.wait(
            until.urlContains('/blogs'),
            10000,
            'Failed to redirect after blog creation'
        );
        console.log('Redirected to blogs page');

        // Wait for the blogs grid to load
        await global.driver.wait(
            until.elementLocated(By.css('.grid')),
            10000,
            'Blog grid not found'
        );
        console.log('Blog grid found');

        // Look for the blog title link
        const blogTitleLink = await global.driver.wait(
            until.elementLocated(
                By.css('.text-xl.font-semibold a.text-blue-600')
            ),
            10000,
            'Blog title link not found'
        );

        const titleText = await blogTitleLink.getText();
        expect(titleText).toBe('Test Blog Title');
        console.log('Blog post verified');

        // Optional: Verify other blog elements
        const blogCard = await blogTitleLink.findElement(By.xpath('ancestor::div[contains(@class, "bg-white")]'));
        const contentPreview = await blogCard.findElement(By.css('p.text-gray-600')).getText();
        expect(contentPreview).toContain('Test Blog Content');
        console.log('Blog content verified');
    });
}); 