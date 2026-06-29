/// <reference types="node" />

import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';

const professorEmail = process.env['E2E_PROF_EMAIL'];
const professorPassword = process.env['E2E_PROF_PASSWORD'];
const videoFixturePath = path.resolve('tests/fixtures/test-video.mp4');

async function loginWithProfessorAccount(page: Page, email: string, password: string) {
  await page.goto('http://localhost:4200/login');

  await page.getByPlaceholder('E-mail').fill(email);
  await page.getByPlaceholder('Mot-de-passe').fill(password);
  await page.getByRole('main').getByRole('button', { name: 'Connexion' }).click();

  await expect(page).toHaveURL(/\/profile$/);
}

async function openUploadPageAsProfessor(page: Page, email: string, password: string) {
  await loginWithProfessorAccount(page, email, password);
  await page.goto('http://localhost:4200/videos/upload');
}

async function uploadProfessorVideo(page: Page, email: string, password: string, title: string, description: string) {
  await openUploadPageAsProfessor(page, email, password);

  await page.locator('#videoTitle').fill(title);
  await page.locator('#videoDescription').fill(description);
  await page.locator('#videoFile').setInputFiles(videoFixturePath);
  await page.getByRole('button', { name: 'Uploader la vidéo' }).click();

  await expect(page).toHaveURL(/\/profile(\?.*)?$/);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}

// Vérifie qu'une vidéo uploadée par un professeur apparaît dans le feed d'accueil.
test('Uploaded professor video appears in home feed', async ({ page }) => {
  test.setTimeout(90_000);
  test.skip(
    !professorEmail || !professorPassword,
    'Définir E2E_PROF_EMAIL et E2E_PROF_PASSWORD pour lancer ce test E2E réel.',
  );
  const email = professorEmail ?? '';
  const password = professorPassword ?? '';
  const videoTitle = `Feed Video Playwright ${Date.now()}`;
  const videoDescription = `Vidéo feed Playwright ${Date.now()}`;

  await test.step('Upload a new video with professor account', async () => {
    await uploadProfessorVideo(page, email, password, videoTitle, videoDescription);
  });

  await test.step('Verify uploaded video is visible on home feed', async () => {
    await page.goto('http://localhost:4200');

    await expect(page.getByRole('heading', { name: 'Vidéos de cours' })).toBeVisible();
    await expect(page.getByRole('heading', { name: videoTitle })).toBeVisible();
    await expect(page.getByText(videoDescription)).toBeVisible();
  });
});

// Vérifie qu'un utilisateur peut ouvrir la page détail d'une vidéo depuis le feed d'accueil.
test('User can open uploaded video detail page from home feed', async ({ page }) => {
  test.setTimeout(90_000);
  test.skip(
    !professorEmail || !professorPassword,
    'Définir E2E_PROF_EMAIL et E2E_PROF_PASSWORD pour lancer ce test E2E réel.',
  );
  const email = professorEmail ?? '';
  const password = professorPassword ?? '';
  const videoTitle = `Detail Video Playwright ${Date.now()}`;
  const videoDescription = 'Vidéo de test destinée à la page détail.';

  await test.step('Upload a video that will be opened from the feed', async () => {
    await uploadProfessorVideo(page, email, password, videoTitle, videoDescription);
  });

  await test.step('Open the uploaded video from home feed', async () => {
    await page.goto('http://localhost:4200');

    await expect(page.getByRole('heading', { name: 'Vidéos de cours' })).toBeVisible();
    await page.getByRole('link', { name: new RegExp(videoTitle) }).click();
  });

  await test.step('Verify video detail page is displayed', async () => {
    await expect(page).toHaveURL(/\/videos\/[^/]+$/);
    await expect(page.getByRole('heading', { name: videoTitle })).toBeVisible();
    await expect(page.getByText(videoDescription)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Retour aux vidéos' })).toBeVisible();
    await expect(page.locator('.watch-player video')).toBeVisible();
  });
});

