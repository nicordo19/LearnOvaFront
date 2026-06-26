/// <reference types="node" />

import { expect, test } from '@playwright/test';

const professorEmail = process.env['E2E_PROF_EMAIL'];
const professorPassword = process.env['E2E_PROF_PASSWORD'];
const expectedVideoTitle = process.env['E2E_PROF_VIDEO_TITLE'];

test('Login button is visible', async ({ page }) => {
  // Vérifie uniquement que le point d'entrée vers la connexion existe sur l'accueil.
  await page.goto('http://localhost:4200');

  const loginButton = page.getByRole('button', { name: 'Connexion' });

  await expect(loginButton).toBeVisible();
});

test('Click on login should display login form', async ({ page }) => {
  // Vérifie que le bouton de la navbar ouvre bien le formulaire de connexion.
  await page.goto('http://localhost:4200');

  await page.getByRole('button', { name: 'Connexion' }).click();

  await expect(page.getByPlaceholder('E-mail')).toBeVisible();
  await expect(page.getByPlaceholder('Mot-de-passe')).toBeVisible();
  await expect(page.getByRole('main').getByRole('button', { name: 'Connexion' })).toBeVisible();
});

//verfi que les champs du formulaire de connexion sont bien remplis avec bon identifiant
test('virify professor have correct credentials', async ({ page }) => {
  test.skip(
    !professorEmail || !professorPassword,
    'Définir E2E_PROF_EMAIL et E2E_PROF_PASSWORD pour lancer ce test E2E réel.',
  );
  const email = professorEmail ?? '';
  const password = professorPassword ?? '';

  await test.step('connexted with professor account', async () => {
    await page.goto('http://localhost:4200');
    await page.locator('#navbarContent').getByRole('button', { name: 'Connexion' }).click();

    // Remplir le formulaire de connexion avec les identifiants du professeur.
    await page.getByPlaceholder('E-mail').fill(email);
    await page.getByPlaceholder('Mot-de-passe').fill(password);
    await page.getByRole('main').getByRole('button', { name: 'Connexion' }).click();
  });

  await test.step('virify profile professeur as connected', async () => {
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByText(email)).toBeVisible();
  });
  // Vérifie que le professeur connecté peut voir le bouton "Mes vidéos" et que la section "Mes vidéos" est visible.
  await test.step('virify displayed videos after login', async () => {
    await expect(page.getByRole('button', { name: 'Mes vidéos' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mes vidéos' })).toBeVisible();
  });
  // Vérifie que le professeur connecté peut voir ses vidéos publiées dans la section "Mes vidéos".
  await test.step('virify video updates in profile', async () => {
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
