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

// Vérifie qu'un professeur connecté peut accéder au formulaire d'upload vidéo.
test('Professor can access upload video page', async ({ page }) => {
  test.skip(
    !professorEmail || !professorPassword,
    'Définir E2E_PROF_EMAIL et E2E_PROF_PASSWORD pour lancer ce test E2E réel.',
  );
  const email = professorEmail ?? '';
  const password = professorPassword ?? '';

  await openUploadPageAsProfessor(page, email, password);

  await expect(page.getByRole('heading', { name: 'Upload de vidéo pédagogique' })).toBeVisible();
  await expect(page.locator('#videoTitle')).toBeVisible();
  await expect(page.locator('#videoDescription')).toBeVisible();
  await expect(page.locator('#videoFile')).toBeAttached();
  await expect(page.getByRole('button', { name: 'Uploader la vidéo' })).toBeDisabled();
});

// Vérifie qu'un professeur peut uploader une vidéo valide et la retrouver dans son profil.
test('Professor can upload a valid video', async ({ page }) => {
  test.setTimeout(90_000);
  test.skip(
    !professorEmail || !professorPassword,
    'Définir E2E_PROF_EMAIL et E2E_PROF_PASSWORD pour lancer ce test E2E réel.',
  );
  const email = professorEmail ?? '';
  const password = professorPassword ?? '';
  const videoTitle = `Video Playwright ${Date.now()}`;

  await test.step('Open upload page with professor account', async () => {
    await openUploadPageAsProfessor(page, email, password);

    await expect(page.getByRole('heading', { name: 'Upload de vidéo pédagogique' })).toBeVisible();
  });

  await test.step('Fill upload form with a valid video file', async () => {
    await page.locator('#videoTitle').fill(videoTitle);
    await page.locator('#videoDescription').fill('Vidéo de test uploadée par Playwright.');
    await page.locator('#videoFile').setInputFiles(videoFixturePath);

    await expect(page.getByText('test-video.mp4')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Uploader la vidéo' })).toBeEnabled();
  });

  await test.step('Submit upload and verify video appears in profile', async () => {
    await page.getByRole('button', { name: 'Uploader la vidéo' }).click();

    await expect(page).toHaveURL(/\/profile(\?.*)?$/);
    await expect(page.getByRole('heading', { name: 'Mes vidéos' })).toBeVisible();
    await expect(page.getByRole('heading', { name: videoTitle })).toBeVisible();
  });
});

