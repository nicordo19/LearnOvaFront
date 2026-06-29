import { expect, test } from '@playwright/test';

async function openRegisterForm(page: import('@playwright/test').Page) {
  await page.goto('http://localhost:4200');
  await page.locator('#navbarContent').getByRole('button', { name: 'Inscription' }).click();
}

async function registerStudent(page: import('@playwright/test').Page, email: string, password: string) {
  await openRegisterForm(page);

  await page.getByText('Étudiant').click();
  await page.getByPlaceholder('Prénom').fill('Etudiant');
  await page.getByPlaceholder('Nom', { exact: true }).fill('Playwright');
  await page.getByPlaceholder('E-mail').fill(email);
  await page.getByPlaceholder('Profession').fill('Apprenant');
  await page.getByPlaceholder('Mot-de-passe').fill(password);
  await page.getByRole('main').getByRole('button', { name: "S'inscrire" }).click();
}

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.getByPlaceholder('E-mail').fill(email);
  await page.getByPlaceholder('Mot-de-passe').fill(password);
  await page.getByRole('main').getByRole('button', { name: 'Connexion' }).click();
}

// Vérifie qu'un nouvel étudiant peut créer un compte avec des informations valides.
test('Student can register with valid information', async ({ page }) => {
  const email = `student-${Date.now()}@example.com`;
  const password = 'password123';

  await registerStudent(page, email, password);

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByPlaceholder('E-mail')).toBeVisible();
  await expect(page.getByPlaceholder('Mot-de-passe')).toBeVisible();
});

// Vérifie qu'un étudiant nouvellement inscrit peut ensuite se connecter et voir son profil.
test('New student can login after registration', async ({ page }) => {
  const email = `student-${Date.now()}@example.com`;
  const password = 'password123';

  await test.step('Register a new student account', async () => {
    await registerStudent(page, email, password);

    await expect(page).toHaveURL(/\/login$/);
  });

  await test.step('Login with the new student account', async () => {
    await login(page, email, password);

    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText('Étudiant')).toBeVisible();
  });

  await test.step('Verify student profile does not show professor actions', async () => {
    await expect(page.getByRole('button', { name: 'Mes vidéos' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Ajouter une vidéo' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Vidéos likées' })).toBeVisible();
    await expect(page.getByText(/vidéo aimée|vidéos aimées|Aucune vidéo likée pour le moment\./)).toBeVisible();
  });
});
