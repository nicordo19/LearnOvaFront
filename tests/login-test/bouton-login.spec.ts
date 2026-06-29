/// <reference types="node" />

import { expect, test } from '@playwright/test';

const professorEmail = process.env['E2E_PROF_EMAIL'];
const professorPassword = process.env['E2E_PROF_PASSWORD'];
const expectedVideoTitle = process.env['E2E_PROF_VIDEO_TITLE'];

async function openLoginForm(page: import('@playwright/test').Page) {
  await page.goto('http://localhost:4200');
  await page.locator('#navbarContent').getByRole('button', { name: 'Connexion' }).click();
}

test('Login button is visible', async ({ page }) => {
  // Vérifie uniquement que le point d'entrée vers la connexion existe sur l'accueil.
  await page.goto('http://localhost:4200');

  const loginButton = page.getByRole('button', { name: 'Connexion' });

  await expect(loginButton).toBeVisible();
});

test('Click on login should display login form', async ({ page }) => {
  // Vérifie que le bouton de la navbar ouvre bien le formulaire de connexion.
  await openLoginForm(page);

  await expect(page.getByPlaceholder('E-mail')).toBeVisible();
  await expect(page.getByPlaceholder('Mot-de-passe')).toBeVisible();
  await expect(page.getByRole('main').getByRole('button', { name: 'Connexion' })).toBeVisible();
});

// Vérifie que le formulaire bloque une connexion si les champs obligatoires sont vides.
test('Login with empty fields should keep required inputs invalid', async ({ page }) => {
  await openLoginForm(page);

  const emailInput = page.getByPlaceholder('E-mail');

  await page.getByRole('main').getByRole('button', { name: 'Connexion' }).click();

  await expect(emailInput).toHaveJSProperty('validity.valueMissing', true);
  await expect(emailInput).not.toHaveJSProperty('validationMessage', '');
});

// Vérifie qu'un mauvais identifiant ne connecte pas l'utilisateur et affiche une erreur.
test('Login with invalid credentials should show an error message', async ({ page }) => {
  await openLoginForm(page);

  const dialogPromise = page.waitForEvent('dialog');

  await page.getByPlaceholder('E-mail').fill('wrong-user@example.com');
  await page.getByPlaceholder('Mot-de-passe').fill('wrong-password');
  await page.getByRole('main').getByRole('button', { name: 'Connexion' }).click();

  const dialog = await dialogPromise;
  expect(dialog.message()).toContain('Erreur lors de la connexion');
  await dialog.accept();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByPlaceholder('E-mail')).toBeVisible();
});

// Vérifie qu'un professeur peut se connecter avec de vrais identifiants et voir son espace profil.
test('Professor can login and see their profile videos', async ({ page }) => {
  test.skip(
    !professorEmail || !professorPassword,
    'Définir E2E_PROF_EMAIL et E2E_PROF_PASSWORD pour lancer ce test E2E réel.',
  );
  const email = professorEmail ?? '';
  const password = professorPassword ?? '';

  await test.step('Connect with professor account', async () => {
    await openLoginForm(page);

    // Remplir le formulaire de connexion avec les identifiants du professeur.
    await page.getByPlaceholder('E-mail').fill(email);
    await page.getByPlaceholder('Mot-de-passe').fill(password);
    await page.getByRole('main').getByRole('button', { name: 'Connexion' }).click();
  });

  await test.step('Verify professor profile after login', async () => {
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByText(email)).toBeVisible();
  });

  // Vérifie que le professeur connecté peut voir le bouton "Mes vidéos" et que la section "Mes vidéos" est visible.
  await test.step('Verify profile videos section is displayed', async () => {
    await expect(page.getByRole('button', { name: 'Mes vidéos' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mes vidéos' })).toBeVisible();
  });

  // Vérifie que le professeur connecté peut voir ses vidéos publiées dans la section "Mes vidéos".
  await test.step('Verify professor videos are loaded in profile', async () => {
    if (expectedVideoTitle) {
      await expect(page.getByRole('heading', { name: expectedVideoTitle })).toBeVisible();
      return;
    }
    // Si aucune vidéo n'est attendue, vérifie que le message "Aucune vidéo enregistrée pour le moment." est affiché.
    await expect(
      page.getByText(/vidéo publiée|vidéos publiées|Aucune vidéo enregistrée pour le moment\./),
    ).toBeVisible();
  });
});

// Vérifie qu'un utilisateur connecté peut se déconnecter et revenir à l'état visiteur.
test('Connected professor can logout', async ({ page }) => {
  test.skip(
    !professorEmail || !professorPassword,
    'Définir E2E_PROF_EMAIL et E2E_PROF_PASSWORD pour lancer ce test E2E réel.',
  );
  const email = professorEmail ?? '';
  const password = professorPassword ?? '';

  await test.step('Login with professor account', async () => {
    await openLoginForm(page);

    await page.getByPlaceholder('E-mail').fill(email);
    await page.getByPlaceholder('Mot-de-passe').fill(password);
    await page.getByRole('main').getByRole('button', { name: 'Connexion' }).click();

    await expect(page).toHaveURL(/\/profile$/);
  });

  await test.step('Logout and verify visitor navigation is restored', async () => {
    await page.getByRole('button', { name: 'Déconnexion' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('#navbarContent').getByRole('button', { name: 'Connexion' })).toBeVisible();
    await expect(page.locator('#navbarContent').getByRole('button', { name: 'Inscription' })).toBeVisible();
  });
});

// Vérifie qu'un visiteur non connecté ne peut pas consulter les données du profil.
test('Anonymous user cannot access profile data', async ({ page }) => {
  await page.goto('http://localhost:4200/profile');

  await expect(page.getByText('Non connecté ou session expirée.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mes vidéos' })).not.toBeVisible();
});
