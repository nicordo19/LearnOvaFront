import { expect, test } from '@playwright/test';

async function openRegisterForm(page: import('@playwright/test').Page) {
  await page.goto('http://localhost:4200');
  await page.locator('#navbarContent').getByRole('button', { name: 'Inscription' }).click();
}

test('register button is visible', async ({ page }) => {
  // Vérifie uniquement que le point d'entrée vers l'inscription existe sur l'accueil.
  await page.goto('http://localhost:4200');

  const registerButton = page.locator('#navbarContent').getByRole('button', { name: 'Inscription' });

  await expect(registerButton).toBeVisible();
});

test('Click on register should display register form', async ({ page }) => {
  // Vérifie que le bouton de la navbar ouvre bien le formulaire d'inscription.
  await openRegisterForm(page);

  await expect(page.getByText('Étudiant')).toBeVisible();
  await expect(page.getByText('Professeur')).toBeVisible();
  await expect(page.getByPlaceholder('Prénom')).toBeVisible();
  await expect(page.getByPlaceholder('Nom', { exact: true })).toBeVisible();
  await expect(page.getByPlaceholder('E-mail')).toBeVisible();
  await expect(page.getByPlaceholder('Profession')).toBeVisible();
  await expect(page.getByPlaceholder('Mot-de-passe')).toBeVisible();
  await expect(page.getByRole('main').getByRole('button', { name: "S'inscrire" })).toBeVisible();
});

test('Register page should navigate to login page', async ({ page }) => {
  // Vérifie que le lien "Se connecter" permet de revenir au formulaire de connexion.
  await openRegisterForm(page);

  await page.getByRole('link', { name: 'Se connecter' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByPlaceholder('E-mail')).toBeVisible();
  await expect(page.getByPlaceholder('Mot-de-passe')).toBeVisible();
  await expect(page.getByRole('main').getByRole('button', { name: 'Connexion' })).toBeVisible();
});
