import { By, until } from 'selenium-webdriver';

describe('Home Page E2E Tests', () => {
    beforeEach(async () => {
        await global.driver.get(global.BASE_URL);
    });

    test('home page loads and contains welcome message', async () => {
        const heading = await global.driver.findElement(By.css('h1'));
        expect(await heading.getText()).toContain('Welcome to BlogWhale');
    });

    test('navigation to blogs page works', async () => {
        const blogsLink = await global.driver.findElement(By.linkText('View Blogs'));
        await blogsLink.click();

        await global.driver.wait(until.urlContains('/blogs'), 5000);
        const currentUrl = await global.driver.getCurrentUrl();
        expect(currentUrl).toContain('/blogs');
    });
}); 