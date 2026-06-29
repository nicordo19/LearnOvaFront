import { expect, test } from '@playwright/test';

function uniqueProfessorEmail(): string {
  return `professor-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

async function openRegisterForm(page: import('@playwright/test').Page) {
  await page.goto('http://localhost:4200');
  await page.locator('#navbarContent').getByRole('button', { name: 'Inscription' }).click();
}

async function registerProfessor(page: import('@playwright/test').Page, email: string, password: string) {
  await openRegisterForm(page);

  await page.getByText('Professeur').click();
  await page.getByPlaceholder('Prénom').fill('Professeur');
  await page.getByPlaceholder('Nom', { exact: true }).fill('Playwright');
  await page.getByPlaceholder('E-mail').fill(email);
  await page.getByPlaceholder('Profession').fill('Formateur');
  await page.getByPlaceholder('Mot-de-passe').fill(password);
  await page.getByRole('main').getByRole('button', { name: "S'inscrire" }).click();
}

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.getByPlaceholder('E-mail').fill(email);
  await page.getByPlaceholder('Mot-de-passe').fill(password);
  await page.getByRole('main').getByRole('button', { name: 'Connexion' }).click();
}

// Vérifie qu'un nouveau professeur peut créer un compte avec des informations valides.
test('Professor can register with valid information', async ({ page }) => {
  const email = uniqueProfessorEmail();
  const password = 'password123';

  await registerProfessor(page, email, password);

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByPlaceholder('E-mail')).toBeVisible();
  await expect(page.getByPlaceholder('Mot-de-passe')).toBeVisible();
});

// Vérifie qu'un professeur nouvellement inscrit peut se connecter et accéder aux actions professeur.
test('New professor can login after registration', async ({ page }) => {
  const email = uniqueProfessorEmail();
  const password = 'password123';

  await test.step('Register a new professor account', async () => {
    await registerProfessor(page, email, password);

    await expect(page).toHaveURL(/\/login$/);
  });

  await test.step('Login with the new professor account', async () => {
    await login(page, email, password);

    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText('Professeur', { exact: true })).toBeVisible();
  });

  await test.step('Verify professor profile shows professor actions', async () => {
    await expect(page.getByRole('link', { name: 'Ajouter une vidéo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mes vidéos' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mes vidéos' })).toBeVisible();
  });
});
