/// <reference types="node" />

import { expect, test } from '@playwright/test';

const studentEmail = process.env['E2E_STUDENT_EMAIL'];
const studentPassword = process.env['E2E_STUDENT_PASSWORD'];
const expectedLikedVideoTitle = process.env['E2E_STUDENT_LIKED_VIDEO_TITLE'];

async function openLoginForm(page: import('@playwright/test').Page) {
  await page.goto('http://localhost:4200');
  await page.locator('#navbarContent').getByRole('button', { name: 'Connexion' }).click();
}

// Vérifie qu'un étudiant peut se connecter avec de vrais identifiants et voir son profil.
test('Student can login and see their profile', async ({ page }) => {
  test.skip(
    !studentEmail || !studentPassword,
    'Définir E2E_STUDENT_EMAIL et E2E_STUDENT_PASSWORD pour lancer ce test E2E réel.',
  );
  const email = studentEmail ?? '';
  const password = studentPassword ?? '';

  await test.step('Connect with student account', async () => {
    await openLoginForm(page);

    // Remplir le formulaire avec un compte étudiant existant en base.
    await page.getByPlaceholder('E-mail').fill(email);
    await page.getByPlaceholder('Mot-de-passe').fill(password);
    await page.getByRole('main').getByRole('button', { name: 'Connexion' }).click();
  });

  await test.step('Verify student profile after login', async () => {
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText('Étudiant')).toBeVisible();
  });
});

// Vérifie qu'un étudiant voit les vidéos likées mais pas les sections réservées au professeur.
test('Student can see liked videos section without professor actions', async ({ page }) => {
  test.skip(
    !studentEmail || !studentPassword,
    'Définir E2E_STUDENT_EMAIL et E2E_STUDENT_PASSWORD pour lancer ce test E2E réel.',
  );
  const email = studentEmail ?? '';
  const password = studentPassword ?? '';

  await test.step('Login with student account', async () => {
    await openLoginForm(page);

    await page.getByPlaceholder('E-mail').fill(email);
    await page.getByPlaceholder('Mot-de-passe').fill(password);
    await page.getByRole('main').getByRole('button', { name: 'Connexion' }).click();

    await expect(page).toHaveURL(/\/profile$/);
  });

  await test.step('Verify professor-only actions are hidden', async () => {
    await expect(page.getByRole('button', { name: 'Mes vidéos' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Ajouter une vidéo' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mes vidéos' })).not.toBeVisible();
  });

  await test.step('Verify liked videos section is displayed', async () => {
    await expect(page.getByRole('heading', { name: 'Vidéos likées' })).toBeVisible();
  });

  await test.step('Verify student liked videos are loaded', async () => {
    if (expectedLikedVideoTitle) {
      await expect(page.getByRole('heading', { name: expectedLikedVideoTitle })).toBeVisible();
      return;
    }

    // Si aucun titre précis n'est fourni, on vérifie au minimum l'état de la section.
    await expect(page.getByText(/vidéo aimée|vidéos aimées/)).toBeVisible();
  });
});

// Vérifie qu'un étudiant connecté peut se déconnecter et revenir à l'état visiteur.
test('Connected student can logout', async ({ page }) => {
  test.skip(
    !studentEmail || !studentPassword,
    'Définir E2E_STUDENT_EMAIL et E2E_STUDENT_PASSWORD pour lancer ce test E2E réel.',
  );
  const email = studentEmail ?? '';
  const password = studentPassword ?? '';

  await test.step('Login with student account', async () => {
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
