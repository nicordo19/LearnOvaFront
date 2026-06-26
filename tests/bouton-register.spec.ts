import { expect, test } from '@playwright/test';

test('register button is visible', async ({ page }) => {
  await page.goto('http://localhost:4200');

  const registerButton = page.getByRole('button', { name: 'Inscription' });

  await expect(registerButton).toBeVisible();
});
test('Click on register should display register form', async ({ page }) => {
  await page.goto('http://localhost:4200');

  await page.getByRole('button', { name: 'Inscription' }).click();

  await expect(page.getByText('Étudiant')).toBeVisible();
  await expect(page.getByText('Professeur')).toBeVisible();
  await expect(page.getByPlaceholder('Prénom')).toBeVisible();
  await expect(page.getByPlaceholder('Nom', { exact: true })).toBeVisible();
  await expect(page.getByPlaceholder('E-mail')).toBeVisible();
  await expect(page.getByPlaceholder('Profession')).toBeVisible();
  await expect(page.getByPlaceholder('Mot-de-passe')).toBeVisible();
  await expect(page.getByRole('main').getByRole('button', { name: "S'inscrire" })).toBeVisible();
});
